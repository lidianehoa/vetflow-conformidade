const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// Mapeamento por offer code Hotmart → planos VERTOS
// Produto base único: W105785102R — os offer codes diferenciam os planos
const OFFER_PLANO = {
  'b7c3rs61': { plano: 'pass_core', duracaoDias: 30 },   // Pré-pago Core  R$65,90
  '5uvmu45v': { plano: 'pass_pro',  duracaoDias: 30 },   // Pré-pago Pro   R$127,90
  'fykjr5au': { plano: 'core',      duracaoDias: null },  // Core recorrente R$49,90/mês
  'x2rj5zam': { plano: 'pro',       duracaoDias: null },  // Pro recorrente  R$87,90/mês
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

  // Apenas processar eventos de compra confirmada ou cancelamentos/reembolsos
  if (
    tipo !== "PURCHASE_APPROVED" && 
    tipo !== "PURCHASE_COMPLETE" && 
    tipo !== "SUBSCRIPTION_REACTIVATED" &&
    tipo !== "SUBSCRIPTION_CANCELLATION" &&
    tipo !== "PURCHASE_REFUNDED" &&
    tipo !== "PURCHASE_CHARGEBACK"
  ) {
    return res.status(200).send("Evento ignorado");
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;

    switch (tipo) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE":
      case "SUBSCRIPTION_REACTIVATED": {
        const config = OFFER_PLANO[ofertaId];
        if (!config) {
          console.warn(`Oferta desconhecida: ${ofertaId}`);
          return res.status(200).send("Oferta não mapeada — ignorado");
        }

        const agora = new Date();
        const updatePayload = {
          plano: config.plano,
          plan: config.plano, // Keep 'plan' in sync for backward compatibility
          planoAtivadoEm: admin.firestore.Timestamp.fromDate(agora),
          hotmartPedidoId: evento?.data?.purchase?.transaction || evento?.data?.purchase?.order_date?.toString() || null,
          passConvertido: config.duracaoDias ? false : true,
          hotmart: {
            email,
            ofertaId,
            subscriptionCode: evento?.data?.subscription?.subscriber?.code || null,
            ativadoEm: admin.firestore.Timestamp.fromDate(agora),
            status: "active",
          },
          trialActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // PASS: definir data de expiração
        if (config.duracaoDias) {
          const expira = new Date(agora);
          expira.setDate(expira.getDate() + config.duracaoDias);
          updatePayload.planoExpiraEm = admin.firestore.Timestamp.fromDate(expira);
        } else {
          // Recorrente: remover expiração
          updatePayload.planoExpiraEm = null;
        }

        const batch = db.batch();
        batch.set(db.collection("users").doc(uid), updatePayload, { merge: true });
        batch.set(db.collection("usuarios").doc(uid), updatePayload, { merge: true });
        await batch.commit();

        console.log(`✅ Plano ${config.plano} ativado para ${uid}`);
        break;
      }

      case "SUBSCRIPTION_CANCELLATION":
      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK": {
        const updatePayload = {
          plano: "free",
          plan: "free",
          hotmart: {
            status: "cancelled",
            canceladoEm: admin.firestore.FieldValue.serverTimestamp(),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const batch = db.batch();
        batch.set(db.collection("users").doc(uid), updatePayload, { merge: true });
        batch.set(db.collection("usuarios").doc(uid), updatePayload, { merge: true });
        await batch.commit();

        console.log(`❌ Plano cancelado para ${uid}`);
        break;
      }
    }

    return res.status(200).send("OK");

  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const config = OFFER_PLANO[ofertaId];
      if (!config) {
        console.warn(`Oferta desconhecida para pendente: ${ofertaId}`);
        return res.status(200).send("Oferta desconhecida");
      }

      const pedidoId = evento?.data?.purchase?.transaction || evento?.data?.purchase?.order_date?.toString() || "";

      // Salva na coleção antiga para compatibilidade com o cron job processarPendentes
      await db.collection("hotmart_pendentes").add({
        email,
        ofertaId,
        plano: config.plano,
        evento: tipo,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        processado: false,
      });

      // Salva na nova coleção 'pagamentosPendentes' para ativação imediata no login
      await db.collection("pagamentosPendentes").add({
        email,
        plano: config.plano,
        duracaoDias: config.duracaoDias,
        pedidoId,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`⏳ Pagamento pendente salvo para ${email} (ainda sem conta) nas coleções hotmart_pendentes e pagamentosPendentes`);
      return res.status(200).send("Pendente registrado");
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
