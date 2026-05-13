// scripts/migrarFirestore.mjs
// Executa com: node scripts/migrarFirestore.mjs
//
// PRÉ-REQUISITOS:
//   1. npm install firebase-admin --save-dev
//   2. Firebase Console → ⚙ Configurações → Contas de serviço
//      → Gerar nova chave privada → salvar como serviceAccountKey.json na raiz
//   3. echo "serviceAccountKey.json" >> .gitignore

import { initializeApp, cert }       from "firebase-admin/app";
import { getFirestore, FieldValue }  from "firebase-admin/firestore";
import { readFileSync }               from "fs";
import { createInterface }            from "readline";

const sa = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
initializeApp({ credential: cert(sa) });
const db = getFirestore();

function confirmar(pergunta) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(pergunta, (r) => { rl.close(); resolve(r.trim().toLowerCase()); });
  });
}

// ── Documentos antigos a DELETAR ─────────────────────────────
const DELETAR = ["basic", "corporate", "enterprise", "free", "premium"];

// ── Novos documentos da coleção plans ────────────────────────
const PLANOS_NOVOS = {
  trial: {
    id:            "trial",
    nome:          "Trial VetFlow",
    descricao:     "Acesso completo por 3 dias, sem cartão de crédito",
    preco:         0,
    moeda:         "BRL",
    duracao:       "3 dias",
    ativo:         true,
    ordem:         1,
    beneficios: [
      "Acesso completo a todas as funcionalidades",
      "Checklist de auditoria RT (85 itens)",
      "Gerador de TCLE blindado",
      "Fábrica de Documentos (221 modelos)",
      "Relatórios CRMV",
      "Planilhas obrigatórias e sugeridas",
      "Dashboard completo",
      "Sem cartão de crédito necessário",
    ],
    linkPagamento: null,
    criadoEm:      FieldValue.serverTimestamp(),
  },
  pro: {
    id:            "pro",
    nome:          "VetFlow Pro",
    descricao:     "Acesso completo permanente por R$ 67,90/mês",
    preco:         67.90,
    moeda:         "BRL",
    duracao:       "mensal",
    ativo:         true,
    ordem:         2,
    beneficios: [
      "Tudo do Trial incluso",
      "VET.FLOW Cockpit — Dashboard completo",
      "Checklist de auditoria RT (85 itens)",
      "Inspeção 360° — Setores A a E",
      "Gerador de TCLE blindado juridicamente",
      "Plano de ação 5W2H",
      "Manual de Boas Práticas CFMV",
      "Fábrica de Documentos completa (221 modelos)",
      "Relatórios CRMV — 4 modelos oficiais",
      "Planilhas obrigatórias e sugeridas",
      "Radar de Vencimentos com alertas",
      "Suporte técnico especializado",
      "Cancele quando quiser",
    ],
    linkPagamento: "https://pag.ae/SEU_LINK_PRO",
    criadoEm:      FieldValue.serverTimestamp(),
  },
};

// ── Mapeamento users.plan antigo → novo ──────────────────────
// Baseado nos dados reais extraídos do Firestore
const MAPA_USERS = {
  // Planos descontinuados → expirado (pede upgrade)
  free:        "expired",
  basic:       "expired",   // R$29,90 descontinuado
  // Planos pagos antigos → Pro novo
  premium:     "pro",
  corporate:   "pro",
  enterprise:  "pro",
  // Legados do código anterior
  freemium:    "expired",
  rt_solo:     "pro",
  clinica_pro: "pro",
  // Novos valores — mantém
  pro:         "pro",
  pending:     "pending",
  trial:       "trial",
  expired:     "expired",
};

async function migrar() {
  console.log("\n🔥 VETFLOW — MIGRAÇÃO DO FIRESTORE");
  console.log("═".repeat(55));

  // ── Lê estado atual ─────────────────────────────────────────
  const [snapPlans, snapUsers] = await Promise.all([
    db.collection("plans").get(),
    db.collection("users").get(),
  ]);

  // Mostra plans atuais
  console.log("\n📋 PLANOS ATUAIS (plans/):");
  snapPlans.docs.forEach((d) => {
    const data = d.data();
    console.log(`  • ${d.id.padEnd(12)} name: "${data.name || data.nome || "?"}"  price: ${data.price ?? data.preco ?? "?"}`);
  });

  // Mostra o que vai acontecer com os plans
  console.log("\n📋 PLANOS APÓS MIGRAÇÃO (plans/):");
  DELETAR.forEach((id) => console.log(`  • ${id.padEnd(12)} → ❌ DELETAR`));
  Object.entries(PLANOS_NOVOS).forEach(([id, d]) =>
    console.log(`  • ${id.padEnd(12)} → ✅ ${d.nome} (R$ ${d.preco})`)
  );

  // Mostra users e o que vai mudar
  console.log("\n👤 USUÁRIOS (users/) — campo plan:");
  if (snapUsers.empty) {
    console.log("  (nenhum usuário encontrado)");
  } else {
    snapUsers.docs.forEach((d) => {
      const data      = d.data();
      const planAtual = data.plan ?? "sem_plano";
      const planNovo  = MAPA_USERS[planAtual] ?? "pending";
      const mudou     = planAtual !== planNovo;
      console.log(
        `  • ${(data.email || d.id).padEnd(36)} "${planAtual}"${mudou ? ` → "${planNovo}"` : " (sem alteração)"}`
      );
    });
  }

  // ── Resumo e confirmação ─────────────────────────────────────
  const totalUsers = snapUsers.docs.filter((d) => {
    const p = d.data().plan ?? "pending";
    return (MAPA_USERS[p] ?? "pending") !== p;
  }).length;

  console.log("\n" + "═".repeat(55));
  console.log("O script vai executar:");
  console.log(`  🗑  Deletar: ${DELETAR.join(", ")}`);
  console.log(`  ✨  Criar/sobrescrever: plans/trial e plans/pro`);
  console.log(`  👤  Atualizar ${totalUsers} usuário(s) na coleção users`);
  console.log("\n⚠  Esta operação não pode ser desfeita facilmente.");

  const resp = await confirmar('\nDigite "sim" para confirmar: ');
  if (resp !== "sim") {
    console.log("\n❌ Cancelado. Nenhuma alteração realizada.");
    process.exit(0);
  }

  // ── ETAPA 1: Deletar planos antigos ─────────────────────────
  console.log("\n🗑  Deletando planos antigos...");
  const batch1 = db.batch();
  for (const id of DELETAR) {
    const ref  = db.collection("plans").doc(id);
    const snap = await ref.get();
    if (snap.exists) {
      batch1.delete(ref);
      console.log(`  ✓ plans/${id} deletado`);
    } else {
      console.log(`  – plans/${id} não existia`);
    }
  }
  await batch1.commit();

  // ── ETAPA 2: Criar novos planos ──────────────────────────────
  console.log("\n✨ Criando novos planos...");
  const batch2 = db.batch();
  for (const [id, dados] of Object.entries(PLANOS_NOVOS)) {
    batch2.set(db.collection("plans").doc(id), dados);
    console.log(`  ✓ plans/${id} → ${dados.nome} (R$ ${dados.preco})`);
  }
  await batch2.commit();

  // ── ETAPA 3: Migrar users.plan ───────────────────────────────
  console.log("\n👤 Migrando campo plan nos usuários...");
  if (!snapUsers.empty) {
    const batch3    = db.batch();
    let atualizados = 0;

    snapUsers.docs.forEach((d) => {
      const planAtual = d.data().plan ?? "pending";
      const planNovo  = MAPA_USERS[planAtual] ?? "pending";
      if (planAtual !== planNovo) {
        batch3.update(d.ref, { plan: planNovo });
        console.log(`  ✓ ${d.data().email || d.id}: "${planAtual}" → "${planNovo}"`);
        atualizados++;
      } else {
        console.log(`  – ${d.data().email || d.id}: "${planAtual}" (sem alteração)`);
      }
    });

    await batch3.commit();
    console.log(`\n  ${atualizados} usuário(s) atualizado(s).`);
  }

  // ── Conclusão ────────────────────────────────────────────────
  console.log("\n" + "═".repeat(55));
  console.log("🎉 MIGRAÇÃO CONCLUÍDA!\n");
  console.log("Próximos passos:");
  console.log("  1. Confirme no Firebase Console que plans/trial e plans/pro existem");
  console.log("  2. Atualize LINK_PRO em PlanosAssinatura.jsx e TrialExpirado.jsx");
  console.log("  3. Configure webhook PagSeguro → setar plan: 'pro' após pagamento");
  console.log("  4. Delete serviceAccountKey.json: rm serviceAccountKey.json");
  console.log("  5. npm run build && firebase deploy\n");

  process.exit(0);
}

migrar().catch((err) => {
  console.error("\n❌ ERRO:", err.message);
  process.exit(1);
});
