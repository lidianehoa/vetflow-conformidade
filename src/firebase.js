import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAI, GoogleAIBackend, getTemplateGenerativeModel, getGenerativeModel } from "firebase/ai";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
});
const storage = getStorage(app);

let ai = null;
let templateModel = null;
let modelIA = null;

try {
  // Inicialização da IA (Google AI Backend para custo zero/billing simplificado)
  ai = getAI(app, { 
    backend: new GoogleAIBackend(),
    apiKey: firebaseConfig.apiKey 
  });

  // Modelos de IA exportados para uso global
  templateModel = getTemplateGenerativeModel(ai);
  modelIA = getGenerativeModel(ai, { model: "gemini-3.5-flash" });
  console.log("🧠 IA do Vertos inicializada com sucesso.");
} catch (e) {
  console.error("⚠️ Falha ao inicializar IA (o restante do sistema funcionará):", e);
}

export { auth, db, storage, app, ai, templateModel, modelIA };

/**
 * Helper para parsear JSON vindo da IA de forma segura
 */
export function parseJSONSafe(text) {
  if (!text) return null;
  try {
    // Remove markdown caso a IA coloque ```json ... ```
    const limpo = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .replace(/```/g, "")
      .trim();

    // Procura o primeiro { e o último } para isolar o JSON caso a IA tenha falado algo antes/depois
    const firstBrace = limpo.indexOf("{");
    const lastBrace = limpo.lastIndexOf("}");
    
    let jsonCandidate = limpo;
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonCandidate = limpo.substring(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(jsonCandidate);

    // Garante estrutura mínima para não quebrar o render (se for um diagnóstico 360)
    if (parsed.fases && !Array.isArray(parsed.fases)) {
      console.warn("JSON da IA sem estrutura de fases válida.");
    }

    return parsed;

  } catch (e) {
    console.error("Erro no parse do JSON da IA. Texto original:", text, e);
    // Retorna nulo para que o chamador use o fallback específico do módulo
    return null;
  }
}


