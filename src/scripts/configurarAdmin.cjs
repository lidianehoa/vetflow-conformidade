const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

async function configurarAdmin() {
  console.log("🚀 Iniciando configuração de administradores...");
  
  const admins = [
    { email: "olazargabriela67@gmail.com", password: "12345678", name: "Gabriela Olazar" },
    { email: "lidianehoa@gmail.com", password: "12345678", name: "Lidiane HOA" },
    { email: "mariliabedog@gmail.com", password: "12345678", name: "Marília" },
    { email: "cqgrupomatel@gmail.com", password: "12345678", name: "CQ Grupo Matel" }
  ];

  // Busca a chave do service account na raiz
  const serviceAccountPath = "serviceAccountKey.json";

  if (!fs.existsSync(path.join(process.cwd(), serviceAccountPath))) {
    console.error(`❌ Arquivo ${serviceAccountPath} não encontrado na raiz do projeto!`);
    return;
  }

  const serviceAccount = JSON.parse(fs.readFileSync(path.join(process.cwd(), serviceAccountPath)));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const auth = admin.auth();
  const db = admin.firestore();

  for (const adm of admins) {
    try {
      console.log(`\n🔍 Processando: ${adm.email}...`);
      let user;
      try {
        user = await auth.getUserByEmail(adm.email);
        console.log(`👤 Usuário ${adm.email} já existe. Atualizando senha...`);
        await auth.updateUser(user.uid, { password: adm.password });
      } catch (e) {
        console.log(`🆕 Criando novo usuário: ${adm.email}...`);
        user = await auth.createUser({
          email: adm.email,
          password: adm.password,
          displayName: adm.name,
          emailVerified: true
        });
      }

      console.log(`📝 Configurando perfil ADMIN no Firestore para ${adm.email}...`);
      await db.collection("users").doc(user.uid).set({
        email: adm.email,
        displayName: adm.name,
        role: "admin",
        plan: "pro",
        onboardingCompleto: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      console.log(`✅ ${adm.email} está configurado como ADMIN!`);
    } catch (error) {
      console.error(`❌ Erro ao configurar ${adm.email}:`, error);
    }
  }
  
  console.log("\n✨ Todas as configurações de admin concluídas!");
}

configurarAdmin();
