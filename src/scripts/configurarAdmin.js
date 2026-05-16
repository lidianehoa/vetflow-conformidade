const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

async function configurarAdmin() {
  console.log("🚀 Iniciando configuração de administrador...");
  
  const email = "olazargabriela67@gmail.com";
  const password = "12345678";

  // Busca a chave do service account na raiz
  const files = fs.readdirSync(process.cwd());
  const serviceAccountPath = files.find(f => f.endsWith(".json") && f.includes("firebase-adminsdk"));

  if (!serviceAccountPath) {
    console.error("❌ Chave do Service Account não encontrada na raiz do projeto!");
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

  try {
    let user;
    try {
      // Tenta buscar o usuário se já existir
      user = await auth.getUserByEmail(email);
      console.log("👤 Usuário já existe no Auth. Atualizando senha...");
      await auth.updateUser(user.uid, { password });
    } catch (e) {
      // Cria novo usuário se não existir
      console.log("🆕 Criando novo usuário no Auth...");
      user = await auth.createUser({
        email,
        password,
        displayName: "Gabriela Olazar",
        emailVerified: true
      });
    }

    // Configura o perfil no Firestore como ADMIN
    console.log("📝 Configurando perfil ADMIN no Firestore...");
    await db.collection("users").doc(user.uid).set({
      email,
      displayName: "Gabriela Olazar",
      role: "admin",
      plan: "pro", // Admins ganham Pro por padrão
      onboardingCompleto: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`\n✅ SUCESSO!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Senha: ${password}`);
    console.log(`⭐ Role: ADMIN`);
    
  } catch (error) {
    console.error("❌ Erro ao configurar admin:", error);
  }
}

configurarAdmin();
