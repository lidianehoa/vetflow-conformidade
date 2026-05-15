import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAI,
  getGenerativeModel,
  getTemplateGenerativeModel,
  GoogleAIBackend,
} from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ── Gemini Developer API (GoogleAI) ──────────────────────────────
// IMPORTANTE: usar GoogleAIBackend — não VertexAIBackend.
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Modelo direto (sem template) — usado como fallback
export const modelIA = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

// Modelo de templates (Server Prompt Templates do Firebase AI Logic)
export const templateModel = getTemplateGenerativeModel(ai);

export { app };
