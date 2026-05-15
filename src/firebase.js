import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const db = getFirestore(app);
const storage = getStorage(app);

// Inicialização da IA (Google AI Backend para custo zero/billing simplificado)
const ai = getAI(app, { 
  backend: new GoogleAIBackend(),
  apiKey: firebaseConfig.apiKey 
});

// Modelos de IA exportados para uso global
export const templateModel = getTemplateGenerativeModel(ai);
export const modelIA = getGenerativeModel(ai, { model: "gemini-3.1-flash-lite" });

/**
 * Helper para parsear JSON vindo da IA de forma segura
 */
export function parseJSONSafe(text) {
  if (!text) return null;
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("Erro no parse do JSON da IA:", e);
    return null;
  }
}

export { auth, db, storage, app };
