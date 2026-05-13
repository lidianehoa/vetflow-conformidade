const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Webhook para integração com Hotmart (V2)
 * Este endpoint recebe notificações de compra e atualiza o plano do usuário no VERTOS OS.
 */
exports.hotmartWebhook = functions.https.onRequest(async (req, res) => {
  // 1. Validação de Segurança (HotToken)
  const hotToken = req.headers["h-hotmart-hottoken"];
  const expectedToken = process.env.HOTMART_TOKEN || "SEU_TOKEN_AQUI";

  if (hotToken !== expectedToken) {
    console.error("Token de segurança inválido!");
    return res.status(401).send("Unauthorized");
  }

  const payload = req.body;
  const event = payload.event; 

  if (!payload.data || !payload.data.purchase || !payload.data.buyer) {
    return res.status(400).send("Bad Request: Missing data");
  }

  const { status } = payload.data.purchase;
  const offerCode = payload.data.purchase.offer ? payload.data.purchase.offer.code : null;
  const { email } = payload.data.buyer;
  const productId = payload.data.product ? payload.data.product.id : "unknown";

  console.log(`Evento: ${event} | Status: ${status} | Email: ${email} | Oferta: ${offerCode}`);

  // 2. Mapeamento de Ofertas Hotmart -> Planos VERTOS
  // IDs baseados nos links fornecidos pelo usuário
  const OFFER_MAP = {
    "fykjr5au": "core", // Oferta do Plano CORE (R$ 47,90)
    "x2rj5zam": "pro"   // Oferta do Plano PRO (R$ 87,90)
  };

  const targetPlan = OFFER_MAP[offerCode];

  if (!targetPlan) {
    console.warn(`Oferta ${offerCode} não mapeada para nenhum plano.`);
    return res.status(200).send("Offer not mapped");
  }

  try {
    // 3. Localizar usuário pelo e-mail
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      console.warn(`Usuário com e-mail ${email} não encontrado no Firestore.`);
      return res.status(200).send("User not found, but webhook received");
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // 4. Atualizar plano com base no status da compra
    let finalPlan = "pending";

    if (status === "APPROVED" || status === "COMPLETE") {
      finalPlan = targetPlan;
    } else if (status === "REFUNDED" || status === "CHARGEBACK" || status === "CANCELED" || status === "EXPIRED") {
      finalPlan = "expired";
    } else {
      return res.status(200).send("Status ignored");
    }

    await usersRef.doc(userId).update({
      plan: finalPlan,
      lastPaymentStatus: status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      hotmartOffer: offerCode,
      hotmartProductId: productId
    });

    console.log(`Plano do usuário ${userId} atualizado para: ${finalPlan} (Oferta: ${offerCode})`);
    return res.status(200).send("OK");

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return res.status(500).send("Internal Server Error");
  }
});
