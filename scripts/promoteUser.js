import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const EMAIL = "lidianehoa@gmail.com";

async function promote() {
  try {
    console.log(`Buscando usuário: ${EMAIL}...`);
    
    let user;
    try {
      user = await auth.getUserByEmail(EMAIL);
    } catch (e) {
      console.error(`ERRO: Usuário ${EMAIL} não encontrado no Firebase Auth.`);
      console.log("Certifique-se de que o usuário já se cadastrou no app.");
      process.exit(1);
    }

    // Atualizar no Firestore
    await db.collection("users").doc(user.uid).set({
      role: "admin",
      plan: "pro", // Garante plano pro para admins
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log("------------------------------------------");
    console.log(`SUCESSO: ${EMAIL} agora é Administrador`);
    console.log(`UID: ${user.uid}`);
    console.log("------------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("ERRO AO PROMOVER USUÁRIO:", error);
    process.exit(1);
  }
}

promote();
