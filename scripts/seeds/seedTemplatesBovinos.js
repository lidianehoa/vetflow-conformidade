// scripts/seeds/seedTemplatesBovinos.js
// Execução: node scripts/seeds/seedTemplatesBovinos.js
// Requer: serviceAccountKey.json na raiz do projeto

const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const TEMPLATES = [
  {
    id: "BC_DOC_PSA_01",
    titulo: "Programa Sanitário Anual — Bovinos de Corte",
    categoria: "Programa Sanitário",
    subtipo: "bovinocultura_corte",
    legislacao: "IN MAPA 10/2017 (PNCEBT); IN MAPA 44/2007",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",          label: "Data Atual",             auto: true  },
    ],
    conteudo: `PROGRAMA SANITÁRIO ANUAL — BOVINOS DE CORTE
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Data: {{DATA_ATUAL}}

1. OBJETIVO
Definir o calendário e protocolo completo de vacinação, vermifugação e controle de ectoparasitas (PNCEBT e rotina) para rebanhos de corte da propriedade.

2. VACINAÇÃO OBRIGATÓRIA (PNCEBT)
- Brucelose: Fêmeas de 3 a 8 meses. Vacina B19 ou RB51.
- Febre Aftosa: Conforme calendário oficial estadual.
- Raiva: Anual em áreas endêmicas.

3. MANEJO SANITÁRIO ROTINEIRO
- Controle de Ectoparasitas: Banhos carrapaticidas estratégicos e controle de mosca-dos-chifres.
- Vermifugação: Aplicação estratégica (maio, agosto, novembro) ou conforme OPG.

4. REGISTROS
Todas as aplicações devem ser registradas na Ficha Individual ou Ficha de Lote, respeitando o período de carência antes do abate.

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  },
  {
    id: "BL_DOC_PSA_01",
    titulo: "Programa Sanitário Anual — Bovinos de Leite",
    categoria: "Programa Sanitário",
    subtipo: "bovinocultura_leite",
    legislacao: "IN MAPA 76/2018 (PNQL); IN MAPA 77/2018; IN MAPA 10/2017",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",          label: "Data Atual",             auto: true  },
    ],
    conteudo: `PROGRAMA SANITÁRIO ANUAL — BOVINOS DE LEITE
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Data: {{DATA_ATUAL}}

1. OBJETIVO
Definir o calendário sanitário focado na qualidade do leite, prevenção de mastite e controle da CCS/CPP.

2. PREVENÇÃO DE MASTITE E QUALIDADE DO LEITE
- Ordenha: Pré-dipping e Pós-dipping obrigatórios.
- Vacinação: Vacinas polivalentes reprodutivas e clostridioses anuais. Mastite ambiental conforme desafio.
- Terapia de Vaca Seca: Aplicação de antibiótico intramamário em 100% das vacas na secagem.

3. PNCEBT
- Brucelose e Tuberculose: Controle rigoroso e exames anuais conforme exigência do laticínio/MAPA.

4. CARÊNCIA
O leite de vacas tratadas com antimicrobianos deve ser descartado estritamente durante o período de carência para evitar resíduos.

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  },
  {
    id: "BC_DOC_REL_01",
    titulo: "Relatório Mensal RT — Bovinos (SISBOV/PNCEBT)",
    categoria: "Relatório CRMV",
    subtipo: "bovinocultura_corte",
    legislacao: "Res. CFMV 1000/2012",
    frequenciaRevisao: "Mensal",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "MES_REFERENCIA",      label: "Mês de Referência",      auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",          label: "Data Atual",             auto: true  },
    ],
    conteudo: `RELATÓRIO MENSAL RT — BOVINOCULTURA
Mês de Referência: {{MES_REFERENCIA}}
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Data: {{DATA_ATUAL}}

1. ATIVIDADES DESENVOLVIDAS
Durante o mês de {{MES_REFERENCIA}}, foram realizadas vistorias zootécnicas e sanitárias na propriedade.

2. CONFORMIDADE SISBOV E PNCEBT
- Identificação: Os animais estão devidamente identificados (brincos/botons).
- Sanidade: Animais aptos e calendário do PNCEBT cumprido até o momento.
- Trânsito: Todas as GTAs foram emitidas em conformidade.

3. USO DE ANTIMICROBIANOS
Não houve infração ao período de carência. Receituários emitidos e arquivados.

Nada a relatar de não-conformidade grave.

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  },
  {
    id: "BL_DOC_LAUDO_01",
    titulo: "Laudo de Inspeção — Qualidade do Leite",
    categoria: "Laudo Técnico",
    subtipo: "bovinocultura_leite",
    legislacao: "IN MAPA 76/2018; IN MAPA 77/2018",
    frequenciaRevisao: "Sob Demanda",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_INSPECAO",       label: "Data da Inspeção",       auto: false },
    ],
    conteudo: `LAUDO DE INSPEÇÃO — ORDENHA E QUALIDADE DO LEITE
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Data da Inspeção: {{DATA_INSPECAO}}

1. ESTRUTURA DE ORDENHA E SALA DE LEITE
Instalações avaliadas quanto à higiene, iluminação e ventilação. Equipamentos de ordenha inspecionados (borrachas, teteiras, nível de vácuo).

2. INDICADORES DO PNQL (CCS e CPP)
A Contagem de Células Somáticas (CCS) e a Contagem Padrão em Placa (CPP) encontram-se dentro dos limites legais estipulados pela IN 76/2018 nas últimas análises avaliadas.

3. MANEJO DE ORDENHA
Protocolo CIP realizado corretamente. Pré e Pós-dipping sendo executados com produtos devidamente registrados.

Parecer Técnico: Propriedade em conformidade com as Boas Práticas Agropecuárias para a Produção de Leite.

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  },
  {
    id: "BC_DOC_POP_01",
    titulo: "Protocolo de Uso Responsável de Antimicrobianos",
    categoria: "POP / Manual",
    subtipo: "bovinocultura_corte",
    legislacao: "IN MAPA 44/2020",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",          label: "Data Atual",             auto: true  },
    ],
    conteudo: `PROTOCOLO DE USO DE ANTIMICROBIANOS
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Data: {{DATA_ATUAL}}

1. OBJETIVO
Padronizar a aquisição, armazenamento, uso e descarte de antimicrobianos na propriedade, garantindo a segurança alimentar.

2. RECEITUÁRIO
Apenas produtos com prescrição do Responsável Técnico (Receituário Veterinário) serão utilizados.

3. ADMINISTRAÇÃO E CARÊNCIA
Todo animal tratado deve ser identificado (marcação temporária) e apartado do lote de abate ou ordenha até o término completo do período de carência estipulado na bula e na receita.

4. REGISTRO E DESCARTE
Anotar as aplicações na Ficha de Lote. Embalagens vazias devem ser acondicionadas em local seguro para devolução (logística reversa).

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  },
  {
    id: "BC_DOC_DIAG_01",
    titulo: "Diagnóstico Inicial de Propriedade Rural",
    categoria: "Relatório CRMV",
    subtipo: "producao_rural",
    legislacao: "Res. CFMV 1000/2012",
    frequenciaRevisao: "Única (Ao assumir a RT)",
    variaveis: [
      { nome: "NOME_PROPRIEDADE",    label: "Nome da Propriedade",    auto: false },
      { nome: "RT_NOME",             label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",             auto: true  },
      { nome: "DATA_INICIO",         label: "Data do Início da RT",   auto: false },
    ],
    conteudo: `DIAGNÓSTICO INICIAL DE PROPRIEDADE RURAL
Propriedade: {{NOME_PROPRIEDADE}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Início da RT: {{DATA_INICIO}}

1. AVALIAÇÃO DOCUMENTAL E AMBIENTAL
Verificação do Cadastro Ambiental Rural (CAR), GTA, cadastros nas agências de defesa sanitária animal e relatórios anteriores.

2. INSTALAÇÕES E BEM-ESTAR
As condições das cercas, bebedouros, cochos, curral de manejo e pastagens foram vistoriadas.

3. SAÚDE ANIMAL
Revisão do rebanho quanto aos índices zootécnicos, escore de condição corporal médio, e cumprimento das vacinações obrigatórias.

4. PARECER INICIAL
As condições gerais da propriedade são [ ] SATISFATÓRIAS / [ ] NECESSITAM ADEQUAÇÕES. Plano de Ação será elaborado.

___________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico`
  }
];

// ── Seed para o Firestore ──────────────────────────────────────────────────
async function seed() {
  console.log(`\nIniciando seed de ${TEMPLATES.length} templates de Bovinos...\n`);
  const batch = db.batch();

  for (const template of TEMPLATES) {
    const ref = db.collection("template").doc(template.id);
    batch.set(ref, {
      ...template,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativo: true,
    });
    console.log(`  ✅ ${template.id}: ${template.titulo}`);
  }

  await batch.commit();
  console.log("\\nSeed concluído com sucesso!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
