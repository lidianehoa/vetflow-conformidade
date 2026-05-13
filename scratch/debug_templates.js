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

const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/template?key=${API_KEY}`;

async function listTemplates() {
  const res = await fetch(FIRESTORE_URL);
  if (!res.ok) {
    console.error(await res.text());
    return;
  }
  const data = await res.json();
  if (!data.documents) {
      console.log("No documents found.");
      return;
  }
  data.documents.forEach(doc => {
    const fields = doc.fields;
    const id = doc.name.split("/").pop();
    console.log(`ID: ${id}`);
    Object.keys(fields).forEach(key => {
        console.log(`  - ${key}: ${JSON.stringify(fields[key])}`);
    });
    console.log("-------------------");
  });
}

listTemplates();
