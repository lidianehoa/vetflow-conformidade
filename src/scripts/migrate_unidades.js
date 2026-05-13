import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

async function migrateUnidadesToClinicas() {
  console.log("Iniciando migração de unidades para clinicas...");
  const snap = await getDocs(collection(db, "unidades"));
  
  for (const d of snap.docs) {
    const data = d.data();
    console.log(`Migrando: ${data.razaoSocial || d.id}`);
    
    // Converte estrutura se necessário
    const newData = {
      ...data,
      rtId: data.userId || d.id, // Assume o ID do documento se não tiver userId
      tipo: data.tipo || "clinica",
    };
    
    await setDoc(doc(db, "clinicas", d.id), newData);
    // await deleteDoc(doc(db, "unidades", d.id)); // Opcional: deletar antigo
  }
  
  console.log("Migração concluída!");
}

// migrateUnidadesToClinicas();
