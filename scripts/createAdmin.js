import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

const envFile = readFileSync(resolve(rootDir, ".env"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((p) => p.trim()))
);

const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
const API_KEY    = env.VITE_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error("❌ API_KEY ou PROJECT_ID ausentes no .env");
  process.exit(1);
}

const EMAIL = "Nyagarah@gmail.com";
const PASSWORD = "12345678";

async function main() {
  try {
    console.log("Criando usuário no Firebase Auth...");
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
    const authRes = await fetch(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
        returnSecureToken: true
      })
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      if (authData.error?.message === "EMAIL_EXISTS") {
        console.log(`O email ${EMAIL} já existe! Tentando apenas atualizar o perfil no Firestore (se der erro de permissão com API_KEY é porque precisamos estar autenticados, mas tentaremos).`);
      } else {
        throw new Error(authData.error?.message || "Erro no signUp");
      }
    }

    const uid = authData.localId;
    if (!uid) {
      console.log("Não foi possível obter o UID. Se a conta já existe, use o console do Firebase para adicionar o document em 'users' e 'usuarios'.");
      return;
    }

    console.log(`Usuário criado com sucesso. UID: ${uid}`);
    console.log("Adicionando role 'admin' no Firestore...");

    // Helper to format Firestore fields
    function toFirestoreFields(obj) {
      const fields = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string")  fields[k] = { stringValue: v };
        if (typeof v === "boolean") fields[k] = { booleanValue: v };
      }
      return fields;
    }

    const docData = {
      email: EMAIL,
      role: "admin",
      plan: "pro",
      onboardingCompleto: true,
      nome: "Admin"
    };

    const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

    const userUrl = `${FIRESTORE_URL}/users/${uid}?key=${API_KEY}`;
    const userRes = await fetch(userUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(docData) })
    });

    const usuariosUrl = `${FIRESTORE_URL}/usuarios/${uid}?key=${API_KEY}`;
    await fetch(usuariosUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: toFirestoreFields(docData) })
    });

    console.log("✅ Administrador criado e configurado com sucesso no Firestore!");

  } catch (e) {
    console.error("❌ ERRO:", e.message);
  }
}

main();
