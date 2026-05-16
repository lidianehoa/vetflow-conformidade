const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Mapa: produto Hotmart → plano interno (IDs das ofertas conforme especificação)
const HOTMART_PRODUTOS = {
  "fykjr5au": "core",   // oferta CORE
  "x2rj5zam": "pro",    // oferta PRO
};

// Valida assinatura do webhook Hotmart (HOTTOK) via Secrets
function validarHottok(req) {
  const hottok = process.env.HOTMART_HOTTOK;
  const token = req.headers["x-hotmart-hottok"];
  return token === hottok;
}

/**
 * 1. Webhook principal da Hotmart (V2)
 */
exports.hotmartWebhook = onRequest({ cors: false, secrets: ["HOTMART_HOTTOK"] }, async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  if (!validarHottok(req)) {
    console.error("HOTTOK inválido — requisição rejeitada");
    return res.status(401).send("Unauthorized");
  }

  const evento = req.body;
  const tipo = evento?.event;
  const email = evento?.data?.buyer?.email?.toLowerCase();
  const ofertaId = evento?.data?.offer?.code;

  console.log(`Hotmart event: ${tipo} | email: ${email} | oferta: ${ofertaId}`);

  if (!email) return res.status(400).send("Email ausente");

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    const userRef = db.collection("users").doc(uid);
    const plano = HOTMART_PRODUTOS[ofertaId];

    switch (tipo) {
      case "PURCHASE_APPROVED":
      case "SUBSCRIPTION_REACTIVATED": {
        if (!plano) {
          console.warn(`Oferta desconhecida: ${ofertaId}`);
          return res.status(200).send("Oferta não mapeada — ignorado");
        }
        await userRef.set({
          plan: plano,
          hotmart: {
            email,
            ofertaId,
            subscriptionCode: evento?.data?.subscription?.subscriber?.code || null,
            ativadoEm: admin.firestore.FieldValue.serverTimestamp(),
            status: "active",
          },
          trialActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`✅ Plano ${plano} ativado para ${uid}`);
        break;
      }

      case "SUBSCRIPTION_CANCELLATION":
      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK": {
        await userRef.set({
          plan: "free",
          hotmart: {
            status: "cancelled",
            canceladoEm: admin.firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`❌ Plano cancelado para ${uid}`);
        break;
      }

      case "PURCHASE_COMPLETE": {
        await userRef.set({
          hotmart: {
            ultimaRenovacao: admin.firestore.FieldValue.serverTimestamp(),
            status: "active",
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`🔄 Renovação registrada para ${uid}`);
        break;
      }
    }

    return res.status(200).send("OK");

  } catch (err) {
    if (err.code === "auth/user-not-found") {
      await db.collection("hotmart_pendentes").add({
        email,
        ofertaId,
        plano: HOTMART_PRODUTOS[ofertaId] || "core",
        evento: tipo,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        processado: false,
      });
      console.log(`⏳ Pagamento pendente salvo para ${email} (ainda sem conta)`);
      return res.status(200).send("Pendente salvo");
    }
    console.error("Erro no webhook:", err);
    return res.status(500).send("Erro interno");
  }
});

/**
 * 2. Processar pendentes (Sincronização Pós-Cadastro)
 */
exports.processarPendentes = onSchedule("every 60 minutes", async () => {
  const snap = await db.collection("hotmart_pendentes")
    .where("processado", "==", false).get();

  for (const doc of snap.docs) {
    const { email, plano } = doc.data();
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await db.collection("users").doc(userRecord.uid).set({
        plan: plano,
        trialActive: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await doc.ref.update({ processado: true });
      console.log(`✅ Pendente processado: ${email} → ${plano}`);
    } catch {
      // Tenta novamente no próximo ciclo
    }
  }
});

/**
 * 3. Ativar Trial (Seguro via Backend)
 */
exports.ativarTrial = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error("Não autenticado");

  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  
  if (snap.data()?.trialUsado) {
    throw new Error("Trial já utilizado");
  }

  await userRef.set({
    plan: "core",
    trialActive: true,
    trialUsado: true,
    trialExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true };
});

/**
 * 4. Expiração Automática de Trials
 */
exports.expirarTrials = onSchedule("every 24 hours", async () => {
  const agora = new Date();
  const snap = await db.collection("users")
    .where("trialActive", "==", true)
    .where("trialExpiresAt", "<=", agora)
    .get();

  for (const doc of snap.docs) {
    await doc.ref.update({
      plan: "free",
      trialActive: false,
    });
    console.log(`⏰ Trial expirado: ${doc.id}`);
  }
});

/**
 * 5. Excluir Conta (Anonimização conforme LGPD)
 */
exports.excluirConta = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error("Não autenticado");

  const batch = db.batch();

  // Anonimiza dados pessoais (não apaga — mantém trilha de auditoria para compliance)
  batch.set(db.collection("users").doc(uid), {
    email: `excluido_${uid}@anonimo.local`,
    nome: "Usuário excluído",
    crmv: null,
    plan: "free",
    lgpd: {
      contaExcluidaEm: admin.firestore.FieldValue.serverTimestamp(),
      motivo: "Solicitação do usuário"
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await batch.commit();

  // Desabilita login (sem apagar Auth — mantém uid para rastreabilidade de auditorias passadas)
  await admin.auth().updateUser(uid, { disabled: true });

  return { success: true };
});
