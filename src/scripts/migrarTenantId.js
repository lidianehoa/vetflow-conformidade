/**
 * src/scripts/migrarTenantId.js
 * Script de migração robusto usando Firebase Admin SDK
 * 
 * USO: 
 * 1. Baixe a chave JSON do Firebase (Configurações -> Contas de Serviço)
 * 2. Renomeie para 'service-account.json' e coloque na RAIZ do projeto
 * 3. node src/scripts/migrarTenantId.js
 */
import admin from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "../..");
const serviceAccountPath = resolve(rootDir, "service-account.json");
const altServiceAccountPath = resolve(rootDir, "serviceAccountKey.json");

// 1. Carregar .env para pegar o Project ID
const envFile = readFileSync(resolve(rootDir, ".env"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((p) => p.trim()))
);

const projectId = env.VITE_FIREBASE_PROJECT_ID;

console.log(`\n🔍 Projeto Alvo: ${projectId}`);

/**
 * Inicialização Inteligente
 */
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log("📌 Usando credenciais da variável de ambiente.");
  admin.initializeApp();
} else if (existsSync(serviceAccountPath) || existsSync(altServiceAccountPath)) {
  const finalPath = existsSync(serviceAccountPath) ? serviceAccountPath : altServiceAccountPath;
  console.log(`📌 Usando arquivo '${finalPath.split("\\").pop()}' encontrado na raiz.`);
  const serviceAccount = JSON.parse(readFileSync(finalPath, "utf-8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else {
  console.error("\n❌ ERRO: Nenhuma credencial encontrada!");
  console.log("   Como resolver:");
  console.log("   1. Baixe o JSON de Admin SDK no Console do Firebase.");
  console.log("   2. Salve como 'service-account.json' na pasta raiz do projeto.");
  console.log(`   Local esperado: ${serviceAccountPath}\n`);
  process.exit(1);
}

const db = admin.firestore();
const COLECOES = ["auditorias", "vistorias", "controlados", "rotinas", "notificacoes"];

async function migrar() {
  console.log("🚀 Iniciando migração de tenantId (MODO ADMIN)...");
  
  try {
    const clinicasRef = db.collection("clinicas");
    const snapshot = await clinicasRef.get();
    
    if (snapshot.empty) {
      console.log("📭 Nenhuma clínica encontrada para migrar.");
      process.exit(0);
    }

    console.log(`📍 Encontradas ${snapshot.size} clínicas.`);
    
    for (const clinicaDoc of snapshot.docs) {
      const data = clinicaDoc.data();
      // O tenantId deve ser o userId (dono da clínica)
      const userId = data.userId || data.tenantId; 
      
      if (!userId) {
        console.warn(`⚠️ Clínica ${clinicaDoc.id} sem identificador de proprietário. Pulando...`);
        continue;
      }

      console.log(`\n🏢 Processando Unidade: ${data.nomeFantasia || clinicaDoc.id}`);

      const batch = db.batch();

      // 1. Atualiza a clínica (garante que ela tenha o tenantId)
      batch.update(clinicaDoc.ref, { tenantId: userId });

      // 2. Propaga para todas as coleções que possuem vinculo com esta clínica
      for (const colName of COLECOES) {
        // Busca documentos que pertencem a esta clínica mas podem estar sem tenantId ou com o antigo
        const subDocs = await db.collection(colName).where("clinicaId", "==", clinicaDoc.id).get();
        
        let count = 0;
        subDocs.forEach(d => {
          if (d.data().tenantId !== userId) {
            batch.update(d.ref, { tenantId: userId });
            count++;
          }
        });

        if (count > 0) {
          console.log(`   - [${colName}]: ${count} documentos atualizados.`);
        }
      }

      await batch.commit();
      console.log(`✅ Sucesso: ${data.nomeFantasia || clinicaDoc.id} (Tenant: ${userId})`);
    }
    
    console.log("\n✨ MIGRAÇÃO CONCLUÍDA! O Vertos OS agora é 100% Multi-Tenant.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erro crítico durante a migração:", error);
    process.exit(1);
  }
}

migrar();
