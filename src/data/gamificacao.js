// src/data/gamificacao.js
// Sistema de Escudo de Conformidade — Trilha de Auditoria Diretrizes CFMV/POA 2023
// v2.0 — Gamificação ancorada em proteção legal real e mensurável
//
// FILOSOFIA DO SISTEMA:
// Cada badge, missão e nível é associado a uma consequência jurídica concreta.
// O RT não ganha pontos abstratos — ele elimina riscos reais de autuação,
// interdição e processo ético, com percentuais auditáveis.

// ── NÍVEIS (com proteção legal associada) ────────────────────────
export const NIVEIS = [
  {
    level: 1,
    nome: "RT Iniciante",
    minScore: 0,
    maxScore: 39,
    emoji: "🥚",
    cor: "#9e9e9e",
    descricao: "Primeiros passos na conformidade — risco regulatório elevado.",
    escudo_pct: 15,
    alerta_legal: "Neste nível, a probabilidade de auto de infração em vistoria MAPA supera 70%. O estabelecimento está exposto a multas de R$ 2.000–50.000 e interdição cautelar.",
  },
  {
    level: 2,
    nome: "RT em Formação",
    minScore: 40,
    maxScore: 59,
    emoji: "🌱",
    cor: "#66bb6a",
    descricao: "Base sendo construída — itens críticos ainda em aberto.",
    escudo_pct: 35,
    alerta_legal: "Risco de NC Crítica em inspeção ordinária: ~55%. Uma NC Crítica sozinha pode gerar suspensão imediata de habilitação sanitária (IN MAPA 161/2022 Art. 9).",
  },
  {
    level: 3,
    nome: "RT Conformante",
    minScore: 60,
    maxScore: 74,
    emoji: "⚡",
    cor: "#42a5f5",
    descricao: "Conformidade básica atingida — risco moderado residual.",
    escudo_pct: 55,
    alerta_legal: "Risco de autuação com multa em vistoria surpresa: ~35%. PACs incompletos ainda representam exposição significativa ao RT pessoalmente.",
  },
  {
    level: 4,
    nome: "RT Experiente",
    minScore: 75,
    maxScore: 84,
    emoji: "🏆",
    cor: "#ffa726",
    descricao: "Domínio sólido das exigências — risco baixo em inspeções ordinárias.",
    escudo_pct: 72,
    alerta_legal: "Risco de interdição em vistoria ordinária: ~15%. Risco residual concentrado em rotulagem, recall e APPCC. Completar essas áreas fecha a janela de exposição.",
  },
  {
    level: 5,
    nome: "RT Blindado",
    minScore: 85,
    maxScore: 94,
    emoji: "🛡️",
    cor: "#ab47bc",
    descricao: "Conformidade robusta — escudo regulatório ativo.",
    escudo_pct: 88,
    alerta_legal: "Risco de autuação in loco em vistoria surpresa: < 10%. Documentação rastreável protege o RT em qualquer processo administrativo no CRMV ou MAPA.",
  },
  {
    level: 6,
    nome: "RT de Elite",
    minScore: 95,
    maxScore: 100,
    emoji: "⭐",
    cor: "#ef5350",
    descricao: "Compliance de excelência — referência nacional de conformidade.",
    escudo_pct: 97,
    alerta_legal: "Risco residual < 3% — correspondente apenas a variáveis externas (mudança de legislação, fornecedor irregular). RT documentalmente blindado para qualquer processo.",
  },
];

export const getNivel = (score) =>
  NIVEIS.find((n) => score >= n.minScore && score <= n.maxScore) ?? NIVEIS[0];

// ── CÁLCULO DO ESCUDO DE CONFORMIDADE ────────────────────────────
// O escudo não é o score da auditoria — é a proteção legal real,
// calculada como média ponderada dos riscos residuais por área.
export function calcularEscudo(auditorias, userData) {
  if (!auditorias || auditorias.length === 0) return { escudo_pct: 0, riscos: [] };

  const ultima = auditorias[0];
  const score = ultima?.score ?? 0;
  const nivel = getNivel(score);

  // Riscos residuais por órgão, calculados a partir do score e dos badges
  const riscos = [
    {
      orgao: "MAPA",
      label: "Risco MAPA",
      risco_pct: Math.max(5, Math.round(70 - score * 0.62)),
      cor: score >= 75 ? "#1a7f4b" : score >= 60 ? "#e65100" : "#c62828",
      nivel_texto: score >= 75 ? "Baixo" : score >= 60 ? "Moderado" : "Alto",
      nota: score >= 75
        ? "Probabilidade de autuação com multa em vistoria surpresa"
        : "Completar missões abertas reduz este risco significativamente",
    },
    {
      orgao: "CRMV",
      label: "Risco CRMV",
      risco_pct: userData?.vencCrmv && new Date(userData.vencCrmv) > new Date() ? 4 : 42,
      cor: userData?.vencCrmv && new Date(userData.vencCrmv) > new Date() ? "#1a7f4b" : "#e65100",
      nivel_texto: userData?.vencCrmv && new Date(userData.vencCrmv) > new Date() ? "Baixo" : "Moderado",
      nota: userData?.vencCrmv && new Date(userData.vencCrmv) > new Date()
        ? "ART vigente — risco de processo ético mínimo"
        : "ART vencida ou ausente — risco de processo ético e multa pessoal",
    },
    {
      orgao: "Vigilância",
      label: "Risco Vigilância",
      risco_pct: Math.max(3, Math.round(55 - score * 0.48)),
      cor: score >= 70 ? "#1a7f4b" : "#e65100",
      nivel_texto: score >= 70 ? "Baixo" : "Moderado",
      nota: "Risco de interdição cautelar pela vigilância sanitária municipal/estadual",
    },
  ];

  return { escudo_pct: nivel.escudo_pct, riscos, nivel };
}

// ── XP POR AÇÃO ───────────────────────────────────────────────────
export const XP = {
  auditoria_concluida: 50,
  item_critico_conforme: 10,
  item_maior_conforme: 5,
  item_menor_conforme: 2,
  secao_100_porcento: 30,
  primeiro_sem_critico: 75,
  streak_3_meses: 100,
};

// ── PENALIDADES DE SCORE ──────────────────────────────────────────
export const PENALIDADES = {
  item_critico_nc: -15,
  item_maior_nc: -5,
};

// ═══════════════════════════════════════════════════════════════════
// BADGES — PRODUÇÃO DE ORIGEM ANIMAL
// Cada badge tem: protecao { orgao, risco_sem, risco_com, dispositivo, consequencia_real }
// ═══════════════════════════════════════════════════════════════════
const BADGES_POA = [
  // ── BASE LEGAL ────────────────────────────────────────────────
  {
    id: "art_vigente",
    nome: "ART em Dia",
    descricao: "ART averbada e vigente no CRMV",
    categoria: "base_legal",
    xp: 100,
    icon: "VerifiedUser",
    cor: "#1565c0",
    protecao: {
      orgao: "CRMV",
      risco_sem: 42,
      risco_com: 4,
      dispositivo: "Art. 7 Código de Ética CFMV; Lei 5.517/68 Art. 17",
      consequencia_sem: "RT responde individualmente em processo ético por exercício irregular, independente do estabelecimento. Pena: advertência, censura, suspensão ou cassação do registro.",
      consequencia_com: "Risco de processo ético por irregularidade de ART: 42% → 4%. Auto de infração MAPA por RT sem ART: eliminado.",
      impacto_financeiro: "Multa administrativa MAPA R$ 2.000–20.000 por RT irregular (RIISPOA Art. 549).",
    },
    criterio: (userData) => userData?.vencCrmv && new Date(userData.vencCrmv) > new Date(),
  },
  {
    id: "livro_atualizado",
    nome: "Guardião dos Registros",
    descricao: "Livro de visitas do RT atualizado por 3 meses consecutivos",
    categoria: "base_legal",
    xp: 150,
    icon: "MenuBook",
    cor: "#1565c0",
    protecao: {
      orgao: "MAPA / CRMV",
      risco_sem: 38,
      risco_com: 6,
      dispositivo: "RIISPOA Art. 74; Res. CFMV — ART",
      consequencia_sem: "Ausência de registros de visita é NC Maior automática em inspeção MAPA. O RT não consegue comprovar exercício efetivo da RT — configurando irregularidade ética.",
      consequencia_com: "Risco de NC Maior por ausência de registros: 38% → 6%. Proteção do RT in loco em sindicância: registros são prova documental de exercício regular.",
      impacto_financeiro: "NC Maior repetida gera suspensão de habilitação sanitária. Reativação custa em média R$ 8.000–35.000 em adequações + honorários.",
    },
    criterio: (_, auditorias) => {
      const com_livro = auditorias.filter((a) =>
        a.itensConformes?.some((i) => i.id?.includes("POA_TI") || i.id?.includes("DOC"))
      );
      return com_livro.length >= 3;
    },
  },
  {
    id: "sem_impedimentos",
    nome: "RT Transparente",
    descricao: "Verificação de impedimentos concluída antes de aceitar a RT",
    categoria: "base_legal",
    xp: 80,
    icon: "GppGood",
    cor: "#1565c0",
    protecao: {
      orgao: "CRMV",
      risco_sem: 25,
      risco_com: 1,
      dispositivo: "Diretrizes CFMV 2023 p.15; Código de Ética CFMV Cap. III",
      consequencia_sem: "Aceitar RT com impedimento (conflito de interesse, suspensão ativa, outra RT incompatível) é infração ética grave — sujeita a processo imediato no CRMV.",
      consequencia_com: "Verificação documentada elimina praticamente todo o risco de impugnação da RT por irregularidade de impedimento.",
      impacto_financeiro: "Processo ético por impedimento: suspensão temporária do registro + honorários de defesa R$ 5.000–20.000.",
    },
    criterio: (userData) => userData?.impedimentosVerificados === true,
  },

  // ── REGISTRO E ROTULAGEM ───────────────────────────────────────
  {
    id: "registro_pga",
    nome: "Produtos Registrados",
    descricao: "Todos os produtos com registro ativo no PGA/SIGSIF",
    categoria: "normas",
    xp: 200,
    icon: "QrCodeScanner",
    cor: "#e65100",
    protecao: {
      orgao: "MAPA",
      risco_sem: 65,
      risco_com: 3,
      dispositivo: "Portaria MAPA 558/2022; RIISPOA Art. 165",
      consequencia_sem: "Produto fabricado sem registro ativo no PGA é passível de apreensão imediata e destruição sem indenização ao estabelecimento. O RT responde solidariamente.",
      consequencia_com: "Risco de apreensão de lote em vistoria MAPA: 65% → 3%. Risco de interdição da linha de produção: 48% → 5%.",
      impacto_financeiro: "Apreensão e destruição de um lote médio: R$ 15.000–180.000 em produto perdido + custo de vistoria extraordinária.",
    },
    criterio: (_, auditorias) =>
      auditorias.some(
        (a) =>
          (a.score ?? 0) >= 80 &&
          a.itensConformes?.some((i) => i.id?.startsWith("POA_REG"))
      ),
  },
  {
    id: "rotulagem_ok",
    nome: "Rótulo Aprovado",
    descricao: "100% dos rótulos aprovados e alinhados aos RTIQs",
    categoria: "normas",
    xp: 150,
    icon: "Label",
    cor: "#e65100",
    protecao: {
      orgao: "MAPA",
      risco_sem: 55,
      risco_com: 4,
      dispositivo: "RIISPOA Art. 427–434; RTIQs MAPA",
      consequencia_sem: "Rótulo não aprovado = produto irregular em todo o território nacional. Qualquer fiscal municipal, estadual ou federal pode autuar e recolher o produto.",
      consequencia_com: "Risco de autuação por rotulagem irregular: 55% → 4%. Produto pode circular e ser comercializado sem risco de recolhimento por não conformidade de rótulo.",
      impacto_financeiro: "Recolhimento de produto por rotulagem: custo médio R$ 25.000–200.000 (logística + destruição + multa).",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "POA_REG_2")),
  },
  {
    id: "dados_sif_trimestre",
    nome: "SIF em Dia",
    descricao: "Dados ao SIF enviados por 3 meses consecutivos",
    categoria: "normas",
    xp: 200,
    icon: "CloudUpload",
    cor: "#e65100",
    protecao: {
      orgao: "MAPA / SIF",
      risco_sem: 45,
      risco_com: 5,
      dispositivo: "RIISPOA Art. 74",
      consequencia_sem: "Não envio de dados estatísticos ao SIF até o 10º dia útil é infração formal — gera notificação e, se reincidente, suspensão de atividades.",
      consequencia_com: "Risco de notificação formal por ausência de dados: 45% → 5%. Histórico de envio é evidência de boa-fé em qualquer processo administrativo.",
      impacto_financeiro: "Notificação com prazo de 5 dias. Não cumprimento: interdição cautelar e multa R$ 1.000–5.000 por mês de atraso.",
    },
    criterio: (_, auditorias) => {
      const sif_ok = auditorias.filter((a) =>
        a.itensConformes?.some((i) => i.id === "POA_SIF_1")
      );
      return sif_ok.length >= 3;
    },
  },
  {
    id: "mdes_validado",
    nome: "Memorial Aprovado",
    descricao: "MDES validado in loco e checklist assinado antes do envio ao SIF",
    categoria: "normas",
    xp: 120,
    icon: "Architecture",
    cor: "#e65100",
    protecao: {
      orgao: "MAPA",
      risco_sem: 40,
      risco_com: 5,
      dispositivo: "RIISPOA Art. 44; Portaria MAPA 393/2021",
      consequencia_sem: "MDES divergente da realidade das instalações invalida o registro do estabelecimento — podendo resultar em cancelamento de habilitação e paralisação total das atividades.",
      consequencia_com: "MDES validado e aprovado = fundação documental sólida do registro. Risco de cancelamento de habilitação por divergência de instalações: 40% → 5%.",
      impacto_financeiro: "Adequação de MDES divergente: projeto + engenharia + nova aprovação = R$ 20.000–80.000 + paralisia de até 90 dias.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "POA_DOC_5")),
  },

  // ── QUALIDADE / 13 PACs ────────────────────────────────────────
  {
    id: "13_pacs_ok",
    nome: "Mestre dos PACs",
    descricao: "Todos os 13 PACs verificados e conformes em uma única auditoria",
    categoria: "qualidade",
    xp: 300,
    icon: "DoneAll",
    cor: "#c62828",
    protecao: {
      orgao: "MAPA",
      risco_sem: 60,
      risco_com: 8,
      dispositivo: "RIISPOA Art. 74; IN MAPA 161/2022",
      consequencia_sem: "PAC ausente ou desatualizado é NC Maior automática. 3 NCs Maiores = suspensão da habilitação sanitária (IN MAPA 161/2022 Art. 9). RT responde solidariamente.",
      consequencia_com: "Probabilidade de aprovação em inspeção ordinária: 41% → 89%. Risco de suspensão de habilitação por PACs: 35% → 2%.",
      impacto_financeiro: "Suspensão de habilitação: paralisação total das atividades por 30–180 dias. Custo estimado: R$ 50.000–500.000 em produção perdida + adequações.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) =>
        a.itensConformes?.some((i) => i.id === "POA_CK04_10")
      ),
  },
  {
    id: "appcc_elaborado",
    nome: "Arquiteto do APPCC",
    descricao: "Plano APPCC completo (11 etapas Codex) elaborado e validado",
    categoria: "qualidade",
    xp: 250,
    icon: "AccountTree",
    cor: "#c62828",
    protecao: {
      orgao: "MAPA",
      risco_sem: 70,
      risco_com: 5,
      dispositivo: "Portaria MAPA 46/1998; Codex Alimentarius CAC/RCP 1-1969",
      consequencia_sem: "Ausência de APPCC é NC Crítica em inspeção — suspensão imediata do registro (Portaria 46/1998 Art. 3). Não há prazo para adequação: paralisia instantânea.",
      consequencia_com: "NC Crítica por ausência de APPCC: eliminada. Risco de suspensão imediata do registro: 70% → 5%.",
      impacto_financeiro: "Suspensão imediata por NC Crítica: paralisia total até regularização. Custo estimado: R$ 80.000–600.000 dependendo do porte.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.documentosGerados?.includes("POA_DOC_APPCC_01")),
  },
  {
    id: "recall_simulado",
    nome: "Plano de Escape",
    descricao: "Simulação de recall executada — 100% do lote rastreado em ≤ 4h",
    categoria: "qualidade",
    xp: 200,
    icon: "CrisisAlert",
    cor: "#c62828",
    protecao: {
      orgao: "ANVISA / MAPA",
      risco_sem: 80,
      risco_com: 12,
      dispositivo: "RDC ANVISA 655/2022; IN MAPA 161/2022 — PAC 13",
      consequencia_sem: "Sem plano de recall documentado, qualquer incidente de segurança alimentar expõe o estabelecimento a recolhimento desorganizado, multas e ação civil. O RT pode ser responsabilizado criminalmente.",
      consequencia_com: "Custo médio de um recall sem plano: R$ 180.000–2.000.000 (logística + multas + danos reputacionais). Com plano documentado e simulação: custo reduzido em ~70% e responsabilidade do RT mitigada.",
      impacto_financeiro: "RDC 655/2022: recall mal gerido = multa de até R$ 1.500.000 + suspensão de registro + ação penal (Lei 8.137/90 Art. 7).",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "POA_RCL_4")),
  },
  {
    id: "agua_conforme",
    nome: "Água Pura",
    descricao: "Laudos de potabilidade em dia por 6 meses",
    categoria: "qualidade",
    xp: 150,
    icon: "WaterDrop",
    cor: "#0288d1",
    protecao: {
      orgao: "MAPA",
      risco_sem: 50,
      risco_com: 5,
      dispositivo: "IN MAPA 161/2022 — PAC 08; Portaria GM/MS 888/2021",
      consequencia_sem: "Laudo de potabilidade vencido é NC Maior automática — e, se o laudo microbiológico estiver ausente, pode ser elevado a NC Crítica dependendo do fiscal.",
      consequencia_com: "Risco de NC Maior por laudos vencidos: 50% → 5%. Laudos em dia por 6 meses é evidência robusta de controle sanitário contínuo.",
      impacto_financeiro: "NC Maior em água: notificação com prazo de 30 dias. Se não sanada: suspensão de atividades. Custo do laudo: R$ 300–800. Custo da omissão: R$ 15.000–50.000 em multa.",
    },
    criterio: (_, auditorias) => {
      const agua_ok = auditorias.filter((a) =>
        a.itensConformes?.some(
          (i) => i.id === "POA_AGUA_3" || i.id === "POA_AGUA_4"
        )
      );
      return agua_ok.length >= 6;
    },
  },
  {
    id: "calibracao_ok",
    nome: "Precisão Máxima",
    descricao: "Todos os instrumentos calibrados com certificado vigente",
    categoria: "qualidade",
    xp: 150,
    icon: "Tune",
    cor: "#c62828",
    protecao: {
      orgao: "MAPA / INMETRO",
      risco_sem: 45,
      risco_com: 5,
      dispositivo: "IN MAPA 161/2022 — PAC 06; Lei 9.933/1999",
      consequencia_sem: "Instrumento sem calibração INMETRO torna inválidos todos os registros de temperatura e peso associados — comprometendo a rastreabilidade de todos os lotes produzidos naquele período.",
      consequencia_com: "Registros de temperatura e peso com validade legal. Risco de invalidação de rastreabilidade por calibração ausente: 45% → 5%.",
      impacto_financeiro: "Invalidação de rastreabilidade: todos os lotes do período podem ser apreendidos preventivamente. Custo: R$ 30.000–250.000.",
    },
    criterio: (_, auditorias) =>
      auditorias.some(
        (a) =>
          a.itensConformes?.some((i) => i.id === "POA_CAL_1") &&
          a.itensConformes?.some((i) => i.id === "POA_CAL_2")
      ),
  },
  {
    id: "formulacao_ok",
    nome: "Escudo Anti-Fraude",
    descricao: "Formulação centesimal verificada e conforme por 3 meses",
    categoria: "qualidade",
    xp: 200,
    icon: "Policy",
    cor: "#c62828",
    protecao: {
      orgao: "MAPA / ANVISA / Procon",
      risco_sem: 55,
      risco_com: 5,
      dispositivo: "RTIQs MAPA; RDC ANVISA 778/2023; CDC Art. 18",
      consequencia_sem: "Formulação divergente do RTIQ é fraude comercial — sujeita a apreensão, destruição do produto, multa MAPA e ação civil do consumidor. O RT é responsável técnico pela fórmula.",
      consequencia_com: "Risco de autuação por fraude de formulação: 55% → 5%. O RT tem documentação que comprova conformidade da fórmula em qualquer análise pericial.",
      impacto_financeiro: "Fraude de formulação: multa MAPA R$ 5.000–50.000 + ação civil + dano reputacional. Caso de nitritos fora do limite: responsabilidade criminal (Lei 8.137/90).",
    },
    criterio: (_, auditorias) => {
      const form_ok = auditorias.filter((a) =>
        a.itensConformes?.some((i) => i.id?.startsWith("POA_FOR"))
      );
      return form_ok.length >= 3;
    },
  },

  // ── AMBIENTAL ─────────────────────────────────────────────────
  {
    id: "guardiao_verde",
    nome: "Guardião Verde",
    descricao: "Licença Ambiental de Operação vigente + PGRS implementado",
    categoria: "ambiental",
    xp: 150,
    icon: "Eco",
    cor: "#2e7d32",
    protecao: {
      orgao: "SEMA / IBAMA / Vigilância",
      risco_sem: 65,
      risco_com: 5,
      dispositivo: "CONAMA 237/1997; Lei 6.938/1981; Lei 12.305/2010",
      consequencia_sem: "Licença Ambiental vencida = operação ilegal de estabelecimento — interdição imediata pela SEMA independentemente de MAPA ou CRMV. Não há prazo de adequação.",
      consequencia_com: "Risco de interdição ambiental imediata: 65% → 5%. LO vigente é requisito para manutenção do SIF/SIE — sua ausência pode gerar cancelamento do registro sanitário.",
      impacto_financeiro: "Interdição ambiental: paralisação total + multa ambiental R$ 500–10.000.000 (Lei 9.605/98 Art. 60). Renovação de LO após caducidade: processo de 90–360 dias.",
    },
    criterio: (userData) =>
      userData?.vencLicAmbiental &&
      new Date(userData.vencLicAmbiental) > new Date(),
  },
  {
    id: "residuos_zero",
    nome: "Resíduos Zero",
    descricao: "PGRS implementado com manifesto de coleta em dia",
    categoria: "ambiental",
    xp: 120,
    icon: "Recycling",
    cor: "#2e7d32",
    protecao: {
      orgao: "Vigilância Sanitária / SEMA",
      risco_sem: 40,
      risco_com: 5,
      dispositivo: "Lei 12.305/2010 — PNRS",
      consequencia_sem: "PGRS ausente ou manifesto de coleta não arquivado é infração à PNRS — autuação direta pela vigilância sanitária e órgão ambiental estadual.",
      consequencia_com: "Risco de autuação por gestão irregular de resíduos: 40% → 5%. Manifestos arquivados protegem o estabelecimento in loco em qualquer fiscalização cruzada.",
      impacto_financeiro: "Descarte irregular de resíduo animal: multa ambiental R$ 5.000–500.000 + embargo. Sem manifesto: ônus da prova sobre o estabelecimento.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) =>
        a.itensConformes?.some((i) => i.id?.startsWith("POA_RES"))
      ),
  },

  // ── BEM-ESTAR ANIMAL ──────────────────────────────────────────
  {
    id: "protetor_animais",
    nome: "Protetor dos Animais",
    descricao: "BEA conforme — monitoramento diário documentado",
    categoria: "bea",
    xp: 200,
    icon: "Pets",
    cor: "#6a1b9a",
    protecao: {
      orgao: "MAPA / CRMV / MPF",
      risco_sem: 50,
      risco_com: 5,
      dispositivo: "Portaria MAPA 365/2021; SDA 631/2022; Lei 9.605/98 Art. 32",
      consequencia_sem: "Falha de BEA documentada é NC Crítica em abatedouros e frigoríficos. O RT pode responder criminalmente por maus-tratos (Lei 9.605/98 — pena de 3 meses a 1 ano, além de multa).",
      consequencia_com: "Risco de NC Crítica por BEA: 50% → 5%. Documentação de monitoramento diário é defesa do RT em qualquer ação criminal por maus-tratos.",
      impacto_financeiro: "Ação criminal por maus-tratos: defesa R$ 20.000–80.000 + inabilitação profissional temporária. Suspensão de abate humanitário: perda de habilitação de exportação.",
    },
    criterio: (_, auditorias) =>
      auditorias.filter((a) =>
        a.itensConformes?.some((i) => i.id?.startsWith("POA_BEA"))
      ).length >= 1,
  },

  // ── PESSOAS ───────────────────────────────────────────────────
  {
    id: "mestre_treinamentos",
    nome: "Mestre dos Treinamentos",
    descricao: "Equipe treinada com ata arquivada e assinaturas",
    categoria: "pessoas",
    xp: 150,
    icon: "School",
    cor: "#4527a0",
    protecao: {
      orgao: "MAPA / MTE",
      risco_sem: 45,
      risco_com: 6,
      dispositivo: "IN MAPA 161/2022 — PAC 02; NR-7",
      consequencia_sem: "Ausência de registros de treinamento é NC Maior no PAC 02. Além disso, em caso de acidente de trabalho, a falta de treinamento comprovado gera responsabilidade civil e trabalhista do estabelecimento.",
      consequencia_com: "Risco de NC Maior por treinamento: 45% → 6%. Atas com assinaturas protegem o estabelecimento em ação trabalhista pós-acidente.",
      impacto_financeiro: "Ação trabalhista por acidente sem treinamento comprovado: R$ 20.000–200.000. NC Maior reincidente in loco em PAC 02: suspensão de habilitação.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) =>
        a.itensConformes?.some((i) => i.id === "POA_MAN_3")
      ),
  },

  // ── ESPECIAIS / COMBOS ────────────────────────────────────────
  {
    id: "semestre_perfeito",
    nome: "Semestre Perfeito",
    descricao: "Score ≥ 85% in 6 auditorias consecutivas",
    categoria: "especial",
    xp: 500,
    icon: "Stars",
    cor: "#f57f17",
    protecao: {
      orgao: "MAPA / CRMV / Judiciário",
      risco_sem: null,
      risco_com: 3,
      dispositivo: "Todos os dispositivos aplicáveis ao segmento",
      consequencia_sem: null,
      consequencia_com: "6 auditorias ≥ 85% consecutivas constituem prova documental robusta de conformidade contínua. Em qualquer processo administrativo (MAPA, CRMV) ou ação civil, o RT tem histórico rastreável de diligência.",
      impacto_financeiro: "Histórico de conformidade é atenuante em processos administrativos — pode reduzir multas em até 50% e evitar penalidades restritivas.",
    },
    criterio: (_, auditorias) => {
      const sorted = [...auditorias]
        .sort((a, b) => (b.criadoEm?.seconds ?? 0) - (a.criadoEm?.seconds ?? 0))
        .slice(0, 6);
      return sorted.length === 6 && sorted.every((a) => (a.score ?? 0) >= 85);
    },
  },
  {
    id: "zero_criticos",
    nome: "Auditoria Perfeita",
    descricao: "Auditoria sem nenhum item crítico não conforme",
    categoria: "especial",
    xp: 400,
    icon: "MilitaryTech",
    cor: "#f57f17",
    protecao: {
      orgao: "MAPA",
      risco_sem: null,
      risco_com: 5,
      dispositivo: "IN MAPA 161/2022; RIISPOA",
      consequencia_sem: null,
      consequencia_com: "Zero NCs Críticas = risco de interdição imediata eliminado para esse ciclo de auditoria. Em vistoria MAPA, o estabelecimento está blindado contra as penalidades mais graves.",
      impacto_financeiro: "NC Crítica em vistoria: suspensão imediata sem prazo de adequação. Eliminação desse risco equivale a proteger R$ 50.000–500.000 em produção por mês.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => (a.criticasNC ?? 99) === 0 && (a.score ?? 0) >= 70),
  },
  {
    id: "rt_elite",
    nome: "RT de Elite",
    descricao: "Nível 6 atingido — score ≥ 95% em auditoria",
    categoria: "especial",
    xp: 1000,
    icon: "WorkspacePremium",
    cor: "#ef5350",
    protecao: {
      orgao: "Todos os órgãos",
      risco_sem: null,
      risco_com: 3,
      dispositivo: "Todos os dispositivos aplicáveis ao segmento",
      consequencia_sem: null,
      consequencia_com: "Score ≥ 95% representa conformidade de excelência. O estabelecimento tem risco residual < 5% em qualquer área regulatória. O RT está documentalmente protegido contra qualquer processo administrativo ou ético.",
      impacto_financeiro: "Conformidade de elite abre acesso a certificações voluntárias (FSSC 22000, BRCGS) que ampliam mercado e reduzem prêmios de seguro em 15–30%.",
    },
    criterio: (_, auditorias) => auditorias.some((a) => (a.score ?? 0) >= 95),
  },
];

// ═══════════════════════════════════════════════════════════════════
// MISSÕES — PRODUÇÃO DE ORIGEM ANIMAL
// Cada missão tem: impacto_vistoria { sem_missao, com_missao, custo_omissao }
// ═══════════════════════════════════════════════════════════════════
const MISSOES_POA = [
  {
    id: "missao_base_solida",
    nome: "Base Sólida",
    descricao: "Complete os 5 itens de base legal profissional",
    emoji: "⚖️",
    cor: "#1565c0",
    sequencia: 1,
    recompensaXP: 250,
    recompensaBadge: "art_vigente",
    escudo_incremento: 20, // pontos percentuais adicionados ao escudo ao completar
    impacto_vistoria: {
      sem_missao:
        "Se o MAPA realizar vistoria agora: auto de infração imediato por RT irregular, NC Crítica por ausência de documentação e risco de interdição cautelar. O RT responde pessoalmente pela infração ética.",
      com_missao:
        "Com missão concluída: risco de auto de infração por irregularidade de RT cai para 0%. Risco de processo ético CRMV: 42% → 4%. O estabelecimento passa na triagem documental de qualquer vistoria surpresa.",
      custo_omissao:
        "Multa MAPA por RT irregular: R$ 2.000–20.000 (RIISPOA Art. 549). Processo ético CRMV: advertência a cassação de registro.",
    },
    passos: [
      { id: "m1_p1", texto: "ART averbada e vigente no CRMV", campo: "vencCrmv" },
      { id: "m1_p2", texto: "Livro de registros do RT atualizado na última visita", itemAuditoria: "POA_TI_3" },
      { id: "m1_p3", texto: "Verificação de impedimentos concluída e documentada", campo: "impedimentosVerificados" },
      { id: "m1_p4", texto: "Contrato de prestação de serviços vigente com carga horária definida", campo: "contratoVigente" },
      { id: "m1_p5", texto: "Registro do estabelecimento SIF/SIE/SIM ativo e sem pendências", campo: "vencSif" },
    ],
  },
  {
    id: "missao_registro_total",
    nome: "Registro Total",
    descricao: "Garanta que todos os produtos e rótulos estão registrados e aprovados",
    emoji: "🏷️",
    cor: "#e65100",
    sequencia: 2,
    recompensaXP: 400,
    recompensaBadge: "registro_pga",
    escudo_incremento: 18,
    desbloqueiaApos: "missao_base_solida",
    impacto_vistoria: {
      sem_missao:
        "Produto sem registro no PGA encontrado em vistoria: apreensão imediata de todo o lote sem indenização. Se o rótulo não estiver aprovado, todos os produtos daquela linha são irregulares em todo o Brasil.",
      com_missao:
        "Com missão concluída: risco de apreensão de lote em vistoria MAPA cai de 65% → 3%. O estabelecimento pode comercializar em qualquer estado sem risco de recolhimento por irregularidade de registro.",
      custo_omissao:
        "Apreensão e destruição de lote médio: R$ 15.000–180.000 em produto + custo de vistoria extraordinária + multa R$ 5.000–50.000.",
    },
    passos: [
      { id: "m2_p1", texto: "Todos os produtos com registro ativo no PGA/SIGSIF verificado", itemAuditoria: "POA_REG_1" },
      { id: "m2_p2", texto: "Rótulos aprovados e RTIQs observados — checklist assinado", itemAuditoria: "POA_REG_2" },
      { id: "m2_p3", texto: "MDES validado in loco e aprovado pelo órgão de inspeção", itemAuditoria: "POA_DOC_5" },
      { id: "m2_p4", texto: "Dados estatísticos enviados ao SIF no mês atual (até dia 10)", itemAuditoria: "POA_SIF_1" },
    ],
  },
  {
    id: "missao_13_pacs",
    nome: "13 PACs no Verde",
    descricao: "Verifique e comprove conformidade de todos os 13 Programas de Autocontrole",
    emoji: "✅",
    cor: "#c62828",
    sequencia: 3,
    recompensaXP: 600,
    recompensaBadge: "13_pacs_ok",
    escudo_incremento: 22,
    desbloqueiaApos: "missao_registro_total",
    impacto_vistoria: {
      sem_missao:
        "PAC ausente ou desatualizado = NC Maior automática. 3 NCs Maiores em uma inspeção = suspensão imediata da habilitação sanitária. O RT responde solidariamente e não pode alegar desconhecimento.",
      com_missao:
        "Com todos os 13 PACs conformes: probabilidade de aprovação em inspeção ordinária sobe de 41% → 89%. Risco de suspensão de habilitação: 35% → 2%. O RT tem defesa documental completa.",
      custo_omissao:
        "Suspensão de habilitação: paralisação de 30–180 dias. Custo estimado: R$ 50.000–500.000 em produção perdida + R$ 20.000–80.000 em adequações emergenciais.",
    },
    passos: [
      { id: "m3_p1",  texto: "PAC 01 — Manutenção de instalações e equipamentos", itemAuditoria: "POA_CAL_5" },
      { id: "m3_p2",  texto: "PAC 02 — Saúde e higiene dos manipuladores (ASOs vigentes)", itemAuditoria: "POA_MAN_1" },
      { id: "m3_p3",  texto: "PAC 03–04 — Iluminação e ventilação adequadas", itemAuditoria: "POA1_1" },
      { id: "m3_p4",  texto: "PAC 05 — Águas residuárias tratadas", itemAuditoria: "POA_RES_2" },
      { id: "m3_p5",  texto: "PAC 06 — Calibração de instrumentos (INMETRO)", itemAuditoria: "POA_CAL_1" },
      { id: "m3_p6",  texto: "PAC 07 — PPHO pré-operacional e operacional registrado", itemAuditoria: "POA_CK_04" },
      { id: "m3_p7",  texto: "PAC 08 — Água de abastecimento com laudo vigente", itemAuditoria: "POA_AGUA_3" },
      { id: "m3_p8",  texto: "PAC 09 — Controle integrado de pragas in loco", itemAuditoria: "POA_CK_03" },
      { id: "m3_p9",  texto: "PAC 10 — Matéria-prima com laudo e fornecedor qualificado", itemAuditoria: "POA_MP_1" },
      { id: "m3_p10", texto: "PAC 11 — Temperaturas de câmaras registradas 2x ao dia", itemAuditoria: "POA_CAL_1" },
      { id: "m3_p11", texto: "PAC 12 — BEA verificado (quando aplicável ao estabelecimento)", itemAuditoria: "POA_BEA_1" },
      { id: "m3_p12", texto: "PAC 13 — Rastreabilidade e recall com simulação executada", itemAuditoria: "POA_RCL_4" },
      { id: "m3_p13", texto: "Sistemas digitais de PAC com acesso restrito e backup ativo", itemAuditoria: "POA_TI_2" },
    ],
  },
  {
    id: "missao_appcc",
    nome: "APPCC Vivo",
    descricao: "Elabore ou revise o plano APPCC completo com as 11 etapas do Codex",
    emoji: "🔬",
    cor: "#6a1b9a",
    sequencia: 4,
    recompensaXP: 500,
    recompensaBadge: "appcc_elaborado",
    escudo_incremento: 20,
    desbloqueiaApos: "missao_13_pacs",
    impacto_vistoria: {
      sem_missao:
        "APPCC ausente = NC Crítica imediata em qualquer inspeção do MAPA. Suspensão do registro sem prazo para adequação — a produção para na hora. Não há negociação possível: é a infração mais grave na inspeção.",
      com_missao:
        "APPCC elaborado e validado elimina a NC Crítica mais grave do sistema. Risco de suspensão imediata do registro: 70% → 5%. O estabelecimento pode operar com segurança jurídica total nessa área.",
      custo_omissao:
        "Suspensão imediata por NC Crítica: paralisia total até regularização. Custo estimado: R$ 80.000–600.000 dependendo do porte do estabelecimento.",
    },
    passos: [
      { id: "m4_p1",  texto: "Equipe APPCC formada e registrada com ata de constituição", itemAuditoria: "POA_FOR_1" },
      { id: "m4_p2",  texto: "Descrição do produto e uso pretendido documentados", itemAuditoria: "POA_REG_3" },
      { id: "m4_p3",  texto: "Fluxograma de processo verificado in loco e assinado", itemAuditoria: "POA_DOC_5" },
      { id: "m4_p4",  texto: "Análise de perigos concluída (biológico, químico, físico)", itemAuditoria: "POA_FOR_1" },
      { id: "m4_p5",  texto: "PCCs identificados com árvore decisória do Codex", itemAuditoria: "POA_FOR_1" },
      { id: "m4_p6",  texto: "Limites críticos definidos e documentados por PCC", itemAuditoria: "POA_CAL_1" },
      { id: "m4_p7",  texto: "Monitoramento dos PCCs implantado com registros auditáveis", itemAuditoria: "POA_CAL_1" },
      { id: "m4_p8",  texto: "Ações corretivas definidas e documentadas para cada PCC", itemAuditoria: "POA_FOR_1" },
      { id: "m4_p9",  texto: "Verificação periódica do sistema APPCC com relatório", itemAuditoria: "POA_CAL_6" },
      { id: "m4_p10", texto: "Documentação arquivada por no mínimo 2 anos (auditável)", itemAuditoria: "POA_TI_3" },
      { id: "m4_p11", texto: "Documento POA_DOC_APPCC_01 gerado na Fábrica de Documentos", templateGerado: "POA_DOC_APPCC_01" },
    ],
  },
  {
    id: "missao_recall",
    nome: "Simulação de Recall",
    descricao: "Execute e documente a simulação anual de recall — 100% em ≤ 4h",
    emoji: "🚨",
    cor: "#c62828",
    sequencia: 5,
    recompensaXP: 400,
    recompensaBadge: "recall_simulado",
    escudo_incremento: 15,
    desbloqueiaApos: "missao_appcc",
    impacto_vistoria: {
      sem_missao:
        "Sem plano de recall: qualquer incidente de segurança alimentar vira um desastre operacional e jurídico. O RT pode ser responsabilizado criminalmente pela ausência de controle (Lei 8.137/90 Art. 7).",
      com_missao:
        "Com plano documentado e simulação executada: custo de um recall real reduzido em ~70%. O RT tem documentação que comprova diligência — eliminando responsabilidade pessoal em caso de incidente.",
      custo_omissao:
        "Recall sem plano: R$ 180.000–2.000.000 em logística + multas + danos reputacionais. RDC 655/2022: multa de até R$ 1.500.000 por recall mal gerido.",
    },
    passos: [
      { id: "m5_p1", texto: "Plano de recolhimento com 9 elementos da RDC ANVISA 655/2022 elaborado", templateGerado: "POA_DOC_RECALL_RDC655_01" },
      { id: "m5_p2", texto: "Lote simulado definido, registrado e rastreável no sistema", itemAuditoria: "POA_RCL_1" },
      { id: "m5_p3", texto: "Exercício executado — 100% do lote rastreado em ≤ 4 horas", itemAuditoria: "POA_RCL_4" },
      { id: "m5_p4", texto: "Relatório de simulação arquivado com resultado, data e assinaturas", itemAuditoria: "POA_RCL_6" },
      { id: "m5_p5", texto: "Próxima simulação anual programada no calendário do RT", itemAuditoria: "POA_RCL_4" },
    ],
  },
  {
    id: "missao_semestre_perfeito",
    nome: "Semestre Perfeito",
    descricao: "Mantenha score ≥ 85% em 6 auditorias consecutivas",
    emoji: "🌟",
    cor: "#f57f17",
    sequencia: 6,
    recompensaXP: 1000,
    recompensaBadge: "semestre_perfeito",
    escudo_incremento: 25,
    desbloqueiaApos: "missao_recall",
    impacto_vistoria: {
      sem_missao: null,
      com_missao:
        "6 auditorias ≥ 85% consecutivas = histórico rastreável de conformidade contínua. Em qualquer processo administrativo (MAPA, CRMV) ou ação civil, o RT tem prova documental de diligência profissional. É o equivalente de um portfólio jurídico de defesa.",
      custo_omissao: null,
    },
    passos: [
      { id: "m6_p1", texto: "Auditoria 1 com score ≥ 85%", streakIndex: 0 },
      { id: "m6_p2", texto: "Auditoria 2 com score ≥ 85%", streakIndex: 1 },
      { id: "m6_p3", texto: "Auditoria 3 com score ≥ 85%", streakIndex: 2 },
      { id: "m6_p4", texto: "Auditoria 4 com score ≥ 85%", streakIndex: 3 },
      { id: "m6_p5", texto: "Auditoria 5 com score ≥ 85%", streakIndex: 4 },
      { id: "m6_p6", texto: "Auditoria 6 com score ≥ 85%", streakIndex: 5 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// SEÇÕES DA TRILHA DE AUDITORIA — POA
// ═══════════════════════════════════════════════════════════════════
const SECOES_TRILHA_POA = [
  {
    id: "A", letra: "A",
    nome: "Base Legal e Ética Profissional",
    descricao: "ART, livro de registros, impedimentos e honorários",
    icon: "Gavel",
    cor: "#1565c0",
    corBg: "#e3f2fd",
    pontos: 15,
    referencia: "Diretrizes CFMV 2023 — Disposições Preliminares + Aspectos Gerais",
    risco_secao: "NC nesta seção = processo ético CRMV + auto de infração MAPA por RT irregular",
    itens: [
      { id:"T_A_01", class:"CRÍTICO", peso:10, desc:"ART averbada e vigente no CRMV? Escopo compatível com a atividade real?", ref:"Sistema CFMV/CRMV" },
      { id:"T_A_02", class:"CRÍTICO", peso:10, desc:"Certificado de Regularidade PJ do estabelecimento junto ao CRMV emitido?", ref:"Res. CFMV" },
      { id:"T_A_03", class:"CRÍTICO", peso:10, desc:"Livro/sistema de registros e ocorrências atualizado com a última visita?", ref:"Res. CFMV — ART; RIISPOA Art. 74" },
      { id:"T_A_04", class:"CRÍTICO", peso:10, desc:"Verificação de impedimentos realizada antes de aceitar a RT (conflito de interesse, suspensão)?", ref:"Diretrizes CFMV 2023 — p.15" },
      { id:"T_A_05", class:"MAIOR",   peso:5,  desc:"Contrato de prestação de serviços com carga horária e atribuições definidas?", ref:"Diretrizes CFMV 2023 — p.14" },
      { id:"T_A_06", class:"MAIOR",   peso:5,  desc:"Carga horária compatível com a complexidade das atividades do estabelecimento?", ref:"Diretrizes CFMV 2023 — p.14" },
      { id:"T_A_07", class:"MAIOR",   peso:5,  desc:"Capacitação técnica específica comprovada (certificados na área de POA)?", ref:"Diretrizes CFMV 2023 — p.13" },
      { id:"T_A_08", class:"MENOR",   peso:2,  desc:"Honorários fixados em conformidade com o Código de Ética CFMV Cap. VIII?", ref:"Cód. Ética CFMV" },
    ],
  },
  {
    id: "B", letra: "B",
    nome: "Registro, Rotulagem e Comunicações ao SIF",
    descricao: "PGA/SIGSIF, RTIQs, comunicação de paralisação, dados mensais",
    icon: "Label",
    cor: "#e65100",
    corBg: "#fff3e0",
    pontos: 20,
    referencia: "Diretrizes CFMV 2023 — Normas e Requisitos (p.22–33)",
    risco_secao: "NC nesta seção = apreensão de produto + interdição de linha de produção sem aviso",
    itens: [
      { id:"T_B_01", class:"CRÍTICO", peso:10, desc:"Estabelecimento registrado no órgão oficial competente (SIF/SIE/SIM/SISBI-POA)?", ref:"Lei 1.283/1950; RIISPOA Art. 74" },
      { id:"T_B_02", class:"CRÍTICO", peso:10, desc:"Todos os produtos com registro ativo no PGA/SIGSIF antes do início da fabricação?", ref:"Portaria MAPA 558/2022" },
      { id:"T_B_03", class:"CRÍTICO", peso:10, desc:"Rótulos de todos os produtos aprovados e em conformidade com os RTIQs específicos?", ref:"RIISPOA Art. 427–434" },
      { id:"T_B_04", class:"CRÍTICO", peso:10, desc:"Dados estatísticos de produção enviados ao SIF até o 10º dia útil do mês?", ref:"RIISPOA Art. 74" },
      { id:"T_B_05", class:"CRÍTICO", peso:10, desc:"Em caso de paralisação: SIF comunicado com mínimo 72h de antecedência?", ref:"RIISPOA Art. 74" },
      { id:"T_B_06", class:"MAIOR",   peso:5,  desc:"MDES (Memorial Descritivo) aprovado e condizente com a realidade das instalações?", ref:"RIISPOA Art. 44; Portaria MAPA 393/2021" },
      { id:"T_B_07", class:"MAIOR",   peso:5,  desc:"Cadastro da empresa e dados cadastrais no SIF atualizados?", ref:"RIISPOA Art. 74" },
      { id:"T_B_08", class:"MAIOR",   peso:5,  desc:"Acesso irrestrito ao SIF garantido para inspeção, fiscalização e coleta de amostras?", ref:"RIISPOA Art. 74" },
      { id:"T_B_09", class:"MAIOR",   peso:5,  desc:"Matérias-primas de estabelecimentos com inspeção equivalente reconhecida pelo MAPA (SISBI-POA)?", ref:"RIISPOA Art. 74; SISBI-POA" },
      { id:"T_B_10", class:"MENOR",   peso:2,  desc:"Cadastro de produtores/fornecedores de matéria-prima atualizado?", ref:"RIISPOA Art. 74" },
    ],
  },
  {
    id: "C", letra: "C",
    nome: "Instalações, Equipamentos e Matéria-Prima",
    descricao: "MDES, layout, calibração, controle de MP e fornecedores",
    icon: "Factory",
    cor: "#2e7d32",
    corBg: "#e8f5e9",
    pontos: 15,
    referencia: "Diretrizes CFMV 2023 — Instalações (p.34–37) + Gestão de MP (p.38–39)",
    risco_secao: "NC nesta seção = rastreabilidade inválida + responsabilidade por lote inteiro comprometido",
    itens: [
      { id:"T_C_01", class:"CRÍTICO", peso:10, desc:"Instalações in loco em conformidade com o RIISPOA e Portaria MAPA 368/1997 (BPF)?", ref:"RIISPOA; Portaria MAPA 368/1997" },
      { id:"T_C_02", class:"CRÍTICO", peso:10, desc:"Segregação física entre área de alto risco (fatiamento, embalagem primária) e baixo risco?", ref:"RIISPOA; Portaria MAPA 368/1997" },
      { id:"T_C_03", class:"CRÍTICO", peso:10, desc:"Termômetros de câmaras e portáteis com calibração vigente (INMETRO)?", ref:"IN MAPA 161/2022 — PAC 06; Lei 9.933/1999" },
      { id:"T_C_04", class:"CRÍTICO", peso:10, desc:"Balanças aferidas pelo INMETRO com certificado vigente?", ref:"Lei 9.933/1999; IN MAPA 161/2022 — PAC 06" },
      { id:"T_C_05", class:"MAIOR",   peso:5,  desc:"Matéria-prima recebida com temperatura, lote e laudo do fornecedor registrados?", ref:"IN MAPA 161/2022 — PAC 10" },
      { id:"T_C_06", class:"MAIOR",   peso:5,  desc:"Fornecedores qualificados com laudo de análise vigente?", ref:"IN MAPA 161/2022 — PAC 10" },
      { id:"T_C_07", class:"MAIOR",   peso:5,  desc:"Plano de manutenção preventiva dos equipamentos críticos em dia?", ref:"IN MAPA 161/2022 — PAC 01" },
      { id:"T_C_08", class:"MENOR",   peso:2,  desc:"Controle integrado de pragas com mapa de iscas e empresa licenciada?", ref:"IN MAPA 161/2022 — PAC 09" },
    ],
  },
  {
    id: "D", letra: "D",
    nome: "Gestão da Qualidade e 13 PACs",
    descricao: "APPCC, PACs, formulação, recall, rastreabilidade, auditabilidade digital",
    icon: "FactCheck",
    cor: "#c62828",
    corBg: "#ffebee",
    pontos: 20,
    referencia: "Diretrizes CFMV 2023 — Gestão da Qualidade (p.40–48)",
    risco_secao: "NC Crítica nesta seção = suspensão imediata do registro sem prazo de adequação",
    itens: [
      { id:"T_D_01", class:"CRÍTICO", peso:10, desc:"Sistema APPCC elaborado, implantado e com PCCs com limites críticos definidos?", ref:"Portaria MAPA 46/1998; Codex Alimentarius" },
      { id:"T_D_02", class:"CRÍTICO", peso:10, desc:"13 PACs desenvolvidos, implantados, monitorados e com registros auditáveis?", ref:"RIISPOA Art. 74; IN MAPA 161/2022" },
      { id:"T_D_03", class:"CRÍTICO", peso:10, desc:"Formulação centesimal dos produtos conforme RTIQs? Análise laboratorial do produto acabado?", ref:"RTIQs MAPA; RIISPOA" },
      { id:"T_D_04", class:"CRÍTICO", peso:10, desc:"Aditivos utilizados exclusivamente os permitidos (RDC ANVISA 778/2023)? Nitratos/nitritos dentro dos limites?", ref:"RDC ANVISA 778/2023; IN ANVISA 211/2023" },
      { id:"T_D_05", class:"CRÍTICO", peso:10, desc:"Plano de Recall elaborado com os 9 elementos da RDC ANVISA 655/2022? Simulação anual realizada?", ref:"RDC ANVISA 655/2022; IN MAPA 161/2022 — PAC 13" },
      { id:"T_D_06", class:"CRÍTICO", peso:10, desc:"Sistemas digitais de PAC: acesso restrito, integridade (sem edição retroativa) e backup?", ref:"RIISPOA Art. 74 §1" },
      { id:"T_D_07", class:"MAIOR",   peso:5,  desc:"Laudos de potabilidade da água vigentes (físico-químico semestral + microbiológico mensal)?", ref:"IN MAPA 161/2022 — PAC 08" },
      { id:"T_D_08", class:"MAIOR",   peso:5,  desc:"Rastreabilidade de lote garantida — planilha de expedição com destino, lote e data arquivada?", ref:"IN MAPA 161/2022 — PAC 13" },
      { id:"T_D_09", class:"MAIOR",   peso:5,  desc:"Temperaturas de câmaras registradas 2x ao dia e dentro dos limites críticos?", ref:"IN MAPA 161/2022 — PAC 11" },
      { id:"T_D_10", class:"MAIOR",   peso:5,  desc:"Maltodextrina usada apenas quando o RTIQ autoriza expressamente (incluindo uso indireto)?", ref:"Ofício DIPOA 131/2020" },
      { id:"T_D_11", class:"MAIOR",   peso:5,  desc:"Respaldo de certificação sanitária para exportação quando aplicável (acordos bilaterais)?", ref:"RIISPOA Art. 74; Acordos bilaterais MAPA" },
      { id:"T_D_12", class:"MAIOR",   peso:5,  desc:"Análises laboratoriais periódicas de produto acabado e de água arquivadas?", ref:"IN MAPA 161/2022 — PAC" },
      { id:"T_D_13", class:"MENOR",   peso:2,  desc:"PPHO pré-operacional e operacional registrado diariamente?", ref:"IN MAPA 161/2022 — PAC 07" },
    ],
  },
  {
    id: "E", letra: "E",
    nome: "Gestão de Pessoas e Segurança Ocupacional",
    descricao: "Equipe qualificada, treinamentos, PCMSO, NR-31",
    icon: "Groups",
    cor: "#4527a0",
    corBg: "#ede7f6",
    pontos: 10,
    referencia: "Diretrizes CFMV 2023 — Gestão de Pessoas (p.49–52)",
    risco_secao: "NC nesta seção = responsabilidade trabalhista + NC Maior PAC 02 em inspeção MAPA",
    itens: [
      { id:"T_E_01", class:"CRÍTICO", peso:10, desc:"ASOs (Atestados de Saúde Ocupacional) vigentes para 100% dos manipuladores?", ref:"NR-7; IN MAPA 161/2022 — PAC 02" },
      { id:"T_E_02", class:"CRÍTICO", peso:10, desc:"PCMSO elaborado por médico do trabalho, vigente e com cronograma de exames?", ref:"NR-7" },
      { id:"T_E_03", class:"CRÍTICO", peso:10, desc:"Registros de treinamento em higiene e manipulação com assinaturas arquivados?", ref:"IN MAPA 161/2022 — PAC 02; Diretrizes CFMV 2023 — p.51" },
      { id:"T_E_04", class:"MAIOR",   peso:5,  desc:"Escala de trabalho garante presença de MV nos períodos obrigatórios conforme o tipo de estabelecimento?", ref:"Diretrizes CFMV 2023 — p.50" },
      { id:"T_E_05", class:"MAIOR",   peso:5,  desc:"EPIs corretos em uso por área — uniforme, bota, touca, avental, luva?", ref:"NR-32; IN MAPA 161/2022 — PAC 02" },
      { id:"T_E_06", class:"MENOR",   peso:2,  desc:"Imunização dos colaboradores contra doenças relacionadas à atividade comprovada?", ref:"Diretrizes CFMV 2023 — p.52" },
    ],
  },
  {
    id: "F", letra: "F",
    nome: "Gestão Ambiental e Resíduos",
    descricao: "Licença ambiental, PGRS, efluentes, bem-estar animal",
    icon: "Eco",
    cor: "#1b5e20",
    corBg: "#f1f8e9",
    pontos: 10,
    referencia: "Diretrizes CFMV 2023 — Gestão Ambiental (p.53–55)",
    risco_secao: "NC nesta seção = interdição ambiental imediata, independente do MAPA",
    itens: [
      { id:"T_F_01", class:"CRÍTICO", peso:10, desc:"Licença Ambiental de Operação (LO) vigente e renovada?", ref:"CONAMA 237/1997; Lei 6.938/1981" },
      { id:"T_F_02", class:"CRÍTICO", peso:10, desc:"PGRS elaborado, aprovado e com manifesto de coleta de resíduos em dia?", ref:"Lei 12.305/2010 (PNRS)" },
      { id:"T_F_03", class:"MAIOR",   peso:5,  desc:"ETE em operação dentro dos parâmetros da Licença Ambiental? Análises periódicas do efluente arquivadas?", ref:"CONAMA 430/2011" },
      { id:"T_F_04", class:"MAIOR",   peso:5,  desc:"Efluentes linha vermelha e linha verde segregados corretamente (abatedouros/frigoríficos)?", ref:"CONAMA 430/2011; RIISPOA" },
      { id:"T_F_05", class:"MENOR",   peso:2,  desc:"Constatação de crueldade ou maus-tratos registrada conforme Res. CFMV 1.236/2018?", ref:"Res. CFMV 1.236/2018; Lei 9.605/1998 Art. 32" },
    ],
  },
  {
    id: "G", letra: "G",
    nome: "Volume 2 — Abatedouro, BEA e Beneficiamento",
    descricao: "Abate humanitário, inspeção por risco, registros de carnes",
    icon: "LocalShipping",
    cor: "#6a1b9a",
    corBg: "#f3e5f5",
    pontos: 10,
    referencia: "Diretrizes CFMV 2023 — Volume 2 (p.56–70)",
    risco_secao: "NC Crítica nesta seção = suspensão de habilitação de exportação + responsabilidade criminal por maus-tratos",
    subtipo_only: ["frigorifico"],
    itens: [
      { id:"T_G_01", class:"CRÍTICO", peso:10, desc:"BEA — Abate humanitário conforme Portaria MAPA 365/2021 and SDA 631/2022? Planilha preenchida?", ref:"Portaria MAPA 365/2021; SDA 631/2022" },
      { id:"T_G_02", class:"CRÍTICO", peso:10, desc:"REBEM — Boas práticas de BEA no transporte verificadas (IN MAPA 56/2008)?", ref:"IN MAPA 56/2008" },
      { id:"T_G_03", class:"CRÍTICO", peso:10, desc:"GTA dos animais destinados ao abate verificada e arquivada?", ref:"IN MAPA 44/2007" },
      { id:"T_G_04", class:"CRÍTICO", peso:10, desc:"Produtos cárneos registrados no PGA/SIGSIF conforme Portaria MAPA 558/2022 e RTIQs?", ref:"Portaria MAPA 558/2022; RIISPOA" },
      { id:"T_G_05", class:"MAIOR",   peso:5,  desc:"Cadastro de produtores rurais/fornecedores de animais para abate atualizado?", ref:"RIISPOA Art. 74" },
      { id:"T_G_06", class:"MAIOR",   peso:5,  desc:"Procedimentos de inspeção com base em risco implantados (suínos: IN 79/2018; aves: Portaria SDA 736/2022)?", ref:"IN MAPA 79/2018; Portaria SDA 736/2022" },
      { id:"T_G_07", class:"MAIOR",   peso:5,  desc:"Segregação físico-operacional entre área de alto e baixo risco? Sem contrafluxo de produto ou pessoal?", ref:"RIISPOA; Portaria MAPA 368/1997" },
      { id:"T_G_08", class:"MENOR",   peso:2,  desc:"Constatação de crueldade registrada formalmente? Eutanásia conforme Res. CFMV 1.000/2012?", ref:"Res. CFMV 1.236/2018; Res. CFMV 1.000/2012" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// BADGES — PEQUENOS ANIMAIS (mesma estrutura de protecao{})
// ═══════════════════════════════════════════════════════════════════
const BADGES_PET = [
  {
    id: "art_vigente",
    nome: "ART em Dia",
    descricao: "ART averbada e vigente no CRMV",
    categoria: "base_legal",
    xp: 100,
    icon: "VerifiedUser",
    cor: "#1565c0",
    protecao: {
      orgao: "CRMV",
      risco_sem: 42,
      risco_com: 4,
      dispositivo: "Art. 7 Código de Ética CFMV; Lei 5.517/68 Art. 17",
      consequencia_sem: "RT responde individualmente em processo ético por exercício irregular. Qualquer cliente pode acionar o CRMV se não houver ART vigente.",
      consequencia_com: "Risco de processo ético por irregularidade de ART: 42% → 4%.",
      impacto_financeiro: "Processo ético: advertência + multa + suspensão temporária do registro.",
    },
    criterio: (userData) => userData?.vencCrmv && new Date(userData.vencCrmv) > new Date(),
  },
  {
    id: "alvara_sanitario",
    nome: "Licença Dourada",
    descricao: "Alvará Sanitário e Licenças municipais em dia",
    categoria: "base_legal",
    xp: 100,
    icon: "DomainVerification",
    cor: "#1565c0",
    protecao: {
      orgao: "Vigilância Sanitária Municipal",
      risco_sem: 70,
      risco_com: 3,
      dispositivo: "Lei 6.437/1977; Código Sanitário Estadual",
      consequencia_sem: "Alvará vencido = operação irregular. A Vigilância pode autuar e interditar a clínica a qualquer momento — e qualquer denúncia de cliente aciona fiscalização automática.",
      consequencia_com: "Risco de interdição por alvará vencido: 70% → 3%. A clínica pode operar com segurança jurídica total perante a vigilância municipal.",
      impacto_financeiro: "Interdição por alvará vencido: paralisia de 15–90 dias + multa R$ 2.000–50.000 + custo de regularização.",
    },
    criterio: (userData) => userData?.vencAlvara && new Date(userData.vencAlvara) > new Date(),
  },
  {
    id: "bisturi_de_ouro",
    nome: "Bisturi de Ouro",
    descricao: "Centro cirúrgico e fluxos de esterilização sem não conformidades",
    categoria: "qualidade",
    xp: 200,
    icon: "MedicalServices",
    cor: "#c62828",
    protecao: {
      orgao: "CRMV / Vigilância Sanitária",
      risco_sem: 55,
      risco_com: 5,
      dispositivo: "Res. CFMV 1275/2019; RDC 15/2012",
      consequencia_sem: "Infecção hospitalar pós-operatória com evidência de falha de esterilização: responsabilidade civil do RT + processo ético. O cliente pode acionar judicialmente mesmo anos depois.",
      consequencia_com: "Centro cirúrgico conforme elimina a principal fonte de responsabilidade civil do RT em clínicas veterinárias. Risco de ação judicial por infecção: 55% → 5%.",
      impacto_financeiro: "Ação de danos por morte de animal em cirurgia: R$ 5.000–50.000 em reparação + honorários de defesa R$ 10.000–30.000.",
    },
    criterio: (_, auditorias) =>
      auditorias.some(
        (a) =>
          a.itensConformes?.some((i) => i.id === "T_PET_C_01") &&
          a.itensConformes?.some((i) => i.id === "T_PET_C_02")
      ),
  },
  {
    id: "prontuario_impecavel",
    nome: "Prontuário Impecável",
    descricao: "100% dos prontuários com assinatura, TCLE e guarda digital",
    categoria: "qualidade",
    xp: 150,
    icon: "HistoryEdu",
    cor: "#c62828",
    protecao: {
      orgao: "CRMV / Judiciário",
      risco_sem: 60,
      risco_com: 5,
      dispositivo: "Res. CFMV 1374/2020; Código de Ética CFMV",
      consequencia_sem: "Prontuário ausente ou incompleto em caso de questionamento judicial: o ônus da prova se inverte — o RT precisa provar que fez o correto, sem documento algum.",
      consequencia_com: "Prontuário completo + TCLE assinado = defesa documental em qualquer ação. Risco de condenação em ação de responsabilidade civil sem documentação: 60% → 5%.",
      impacto_financeiro: "Ação de responsabilidade civil veterinária: R$ 5.000–80.000 em reparação. Sem prontuário: alta probabilidade de condenação.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "T_PET_C_04")),
  },
  {
    id: "guardiao_receita",
    nome: "Guardião da Receita",
    descricao: "SIPEAGRO, livros de psicotrópicos e armários controlados auditados",
    categoria: "normas",
    xp: 250,
    icon: "Lock",
    cor: "#e65100",
    protecao: {
      orgao: "MAPA / Vigilância Sanitária / Polícia Federal",
      risco_sem: 75,
      risco_com: 3,
      dispositivo: "IN 35 MAPA; Portaria MS 344/98",
      consequencia_sem: "Divergência no SIPEAGRO ou psicotrópico sem controle: autuação imediata + possível inquérito policial por desvio de substância controlada. O RT responde penalmente.",
      consequencia_com: "Controle de psicotrópicos conforme elimina o risco penal mais grave para o RT veterinário. Risco de inquérito por desvio: 75% → 3%.",
      impacto_financeiro: "Inquérito por desvio de psicotrópico: processo criminal + suspensão do registro + honorários de defesa R$ 20.000–80.000.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "T_PET_D_01")),
  },
  {
    id: "clinica_sustentavel",
    nome: "Clínica Sustentável",
    descricao: "PGRSS implementado e descarte correto de perfurocortantes / infectantes",
    categoria: "ambiental",
    xp: 150,
    icon: "Nature",
    cor: "#2e7d32",
    protecao: {
      orgao: "Vigilância Sanitária / SEMA",
      risco_sem: 55,
      risco_com: 4,
      dispositivo: "RDC ANVISA 222/2018",
      consequencia_sem: "Descarte irregular de resíduo infectante: autuação da vigilância sanitária + possível embargo. Se um funcionário se machucar com perfurocortante descartado irregularmente: ação trabalhista.",
      consequencia_com: "PGRSS conforme elimina o risco de autuação mais comum em clínicas veterinárias. Risco de interdição por resíduo irregular: 55% → 4%.",
      impacto_financeiro: "Autuação por resíduo irregular: multa R$ 2.000–50.000 + custo de adequação emergencial. Ação trabalhista por acidente: R$ 15.000–100.000.",
    },
    criterio: (_, auditorias) =>
      auditorias.some((a) => a.itensConformes?.some((i) => i.id === "T_PET_E_01")),
  },
];

// ═══════════════════════════════════════════════════════════════════
// MISSÕES — PEQUENOS ANIMAIS (com impacto_vistoria{})
// ═══════════════════════════════════════════════════════════════════
const MISSOES_PET = [
  {
    id: "m_pet_fundacao",
    nome: "Fundação Segura",
    descricao: "Mantenha a base legal (ART, CRMV, Alvará) rigorosamente em dia",
    emoji: "⚖️",
    cor: "#1565c0",
    sequencia: 1,
    recompensaXP: 250,
    recompensaBadge: "art_vigente",
    escudo_incremento: 25,
    impacto_vistoria: {
      sem_missao:
        "Alvará vencido ou ART ausente: qualquer denúncia de cliente aciona fiscalização automática. A vigilância pode interditar no mesmo dia sem aviso prévio. O RT responde individualmente sem proteção documental.",
      com_missao:
        "Base legal completa: clínica passa em qualquer fiscalização surpresa de vigilância municipal. Risco de interdição imediata: 70% → 3%. Risco de processo ético CRMV: 42% → 4%.",
      custo_omissao:
        "Interdição por alvará vencido: paralisia de 15–90 dias. Processo ético por ART irregular: advertência a cassação.",
    },
    passos: [
      { id: "m_p1", texto: "ART averbada e vigente", campo: "vencCrmv" },
      { id: "m_p2", texto: "Alvará Sanitário vigente", campo: "vencAlvara" },
      { id: "m_p3", texto: "Registro no CRMV ativo e sem pendências", campo: "vencCrmv" },
    ],
  },
  {
    id: "m_pet_farmacia",
    nome: "Farmácia Blindada",
    descricao: "Assegure o controle absoluto sobre psicotrópicos e validades",
    emoji: "💊",
    cor: "#e65100",
    sequencia: 2,
    recompensaXP: 300,
    recompensaBadge: "guardiao_receita",
    escudo_incremento: 22,
    desbloqueiaApos: "m_pet_fundacao",
    impacto_vistoria: {
      sem_missao:
        "Divergência no SIPEAGRO encontrada em fiscalização: autuação imediata + possível abertura de inquérito policial por suspeita de desvio de substância controlada. O RT responde criminalmente.",
      com_missao:
        "Controle de psicotrópicos conforme elimina o risco penal mais grave para o RT veterinário. Risco de inquérito por desvio: 75% → 3%. Em qualquer fiscalização: livros batem com SIPEAGRO.",
      custo_omissao:
        "Processo criminal por desvio de psicotrópico: suspensão do registro + honorários de defesa R$ 20.000–80.000 + restrições de atuação profissional.",
    },
    passos: [
      { id: "f_p1", texto: "Estoque no SIPEAGRO e Livro físico conferidos e idênticos", itemAuditoria: "T_PET_D_01" },
      { id: "f_p2", texto: "Armário de controlados com chave exclusiva sob posse do RT", itemAuditoria: "T_PET_D_02" },
      { id: "f_p3", texto: "Ausência de produtos vencidos no estoque e área de atendimento", itemAuditoria: "T_PET_D_04" },
    ],
  },
  {
    id: "m_pet_biosseguranca",
    nome: "Mestre da Biossegurança",
    descricao: "Implemente fluxos e barreiras contra infecções hospitalares",
    emoji: "🛡️",
    cor: "#c62828",
    sequencia: 3,
    recompensaXP: 350,
    recompensaBadge: "bisturi_de_ouro",
    escudo_incremento: 20,
    desbloqueiaApos: "m_pet_farmacia",
    impacto_vistoria: {
      sem_missao:
        "Falha de esterilização documentada em inspeção: NC imediata do CRMV. Se houver infecção pós-operatória, a cadeia de custódia sem registro coloca o RT em posição indefensável judicialmente.",
      com_missao:
        "Centro cirúrgico conforme + autoclave com monitoramento biológico = defesa completa contra qualquer ação de responsabilidade civil por infecção. Risco de ação judicial: 55% → 5%.",
      custo_omissao:
        "Ação de danos por infecção pós-operatória: R$ 5.000–50.000 em reparação. Sem documentação de biossegurança: alta probabilidade de condenação.",
    },
    passos: [
      { id: "b_p1", texto: "Barreiras físicas implementadas (sala de espera separada)", itemAuditoria: "T_PET_B_01" },
      { id: "b_p2", texto: "Centro cirúrgico independente com paramentação obrigatória", itemAuditoria: "T_PET_C_01" },
      { id: "b_p3", texto: "Autoclave com registros de monitoramento biológico arquivados", itemAuditoria: "T_PET_B_03" },
    ],
  },
  {
    id: "m_pet_sustentavel",
    nome: "Clínica Sustentável",
    descricao: "Faça a gestão correta de resíduos (PGRSS) e proteja a clínica",
    emoji: "🌱",
    cor: "#2e7d32",
    sequencia: 4,
    recompensaXP: 200,
    recompensaBadge: "clinica_sustentavel",
    escudo_incremento: 15,
    desbloqueiaApos: "m_pet_biosseguranca",
    impacto_vistoria: {
      sem_missao:
        "PGRSS ausente é a infração mais comum encontrada em fiscalizações de clínicas veterinárias. A vigilância sanitária pode autuar sem aviso prévio — e o custo de regularização emergencial é sempre maior.",
      com_missao:
        "PGRSS implementado elimina o risco de autuação mais frequente em clínicas. Risco de interdição por resíduo irregular: 55% → 4%. A clínica está protegida in loco em qualquer fiscalização cruzada.",
      custo_omissao:
        "Autuação por resíduo irregular: multa R$ 2.000–50.000 + obrigação de adequação em 30 dias + nova vistoria.",
    },
    passos: [
      { id: "s_p1", texto: "PGRSS documentado e atualizado anualmente", itemAuditoria: "T_PET_E_01" },
      { id: "s_p2", texto: "Lixeiras exclusivas (com pedal) para resíduo infectante (sacos brancos leitosos)", itemAuditoria: "T_PET_E_02" },
      { id: "s_p3", texto: "Caixas Descarpack montadas corretamente e abaixo do limite", itemAuditoria: "T_PET_E_03" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// SEÇÕES DA TRILHA — PEQUENOS ANIMAIS
// ═══════════════════════════════════════════════════════════════════
const SECOES_TRILHA_PET = [
  {
    id: "A", letra: "A",
    nome: "Base Legal e Documental",
    descricao: "ART, CRMV, Alvarás, PCMSO",
    icon: "Gavel",
    cor: "#1565c0",
    corBg: "#e3f2fd",
    pontos: 15,
    referencia: "Resolução CFMV 1275/2019",
    risco_secao: "NC nesta seção = processo ético CRMV + interdição pela vigilância sanitária municipal",
    itens: [
      { id:"T_PET_A_01", class:"CRÍTICO", peso:10, desc:"ART averbada e vigente no CRMV?", ref:"Res. CFMV 1275" },
      { id:"T_PET_A_02", class:"CRÍTICO", peso:10, desc:"Certificado de Regularidade PJ do CRMV e Alvará Sanitário expostos ao público?", ref:"Res. CFMV 1275" },
      { id:"T_PET_A_03", class:"CRÍTICO", peso:10, desc:"Contrato vigente com empresa de coleta de lixo infectante e perfurocortante?", ref:"RDC ANVISA 222/2018" },
      { id:"T_PET_A_04", class:"MAIOR",   peso:5,  desc:"PCMSO em dia e todos os funcionários registrados?", ref:"NR-7" },
    ],
  },
  {
    id: "B", letra: "B",
    nome: "Infraestrutura e Biossegurança",
    descricao: "Barreiras físicas, áreas limpas e higienização",
    icon: "Factory",
    cor: "#2e7d32",
    corBg: "#e8f5e9",
    pontos: 20,
    referencia: "Resolução CFMV 1275/2019",
    risco_secao: "NC nesta seção = responsabilidade civil por infecção hospitalar + NC em inspeção CRMV",
    itens: [
      { id:"T_PET_B_01", class:"CRÍTICO", peso:10, desc:"Barreiras físicas adequadas (sala de espera separada de internação/consultórios)?", ref:"Res. CFMV 1275" },
      { id:"T_PET_B_02", class:"MAIOR",   peso:5,  desc:"Pisos, paredes e tetos de material lavável, impermeável e sem rachaduras?", ref:"Res. CFMV 1275" },
      { id:"T_PET_B_03", class:"MAIOR",   peso:5,  desc:"Sala de esterilização equipada (autoclave) com registros de monitoramento biológico?", ref:"RDC 15/2012" },
      { id:"T_PET_B_04", class:"MENOR",   peso:2,  desc:"Ventilação e iluminação adequadas, com telas milimétricas onde necessário?", ref:"Res. CFMV 1275" },
    ],
  },
  {
    id: "C", letra: "C",
    nome: "Procedimentos Clínicos e Cirúrgicos",
    descricao: "Centro cirúrgico, anestesia, TCLE e Prontuários",
    icon: "FactCheck",
    cor: "#c62828",
    corBg: "#ffebee",
    pontos: 20,
    referencia: "Resolução CFMV 1374/2020",
    risco_secao: "NC nesta seção = responsabilidade civil em qualquer procedimento + processo ético por ausência de TCLE",
    itens: [
      { id:"T_PET_C_01", class:"CRÍTICO", peso:10, desc:"Centro cirúrgico independente, sem trânsito livre, com paramentação obrigatória?", ref:"Res. CFMV 1275" },
      { id:"T_PET_C_02", class:"CRÍTICO", peso:10, desc:"Anestesia monitorada e acompanhada ininterruptamente pelo profissional?", ref:"Res. CFMV 1374" },
      { id:"T_PET_C_03", class:"CRÍTICO", peso:10, desc:"Termos de Consentimento (TCLE) assinados pelo Responsável pelo Animal em todos os procedimentos?", ref:"Código de Ética / Res. 1374" },
      { id:"T_PET_C_04", class:"CRÍTICO", peso:10, desc:"Prontuários com identificação, evolução e arquivados por no mínimo 5 anos?", ref:"Res. CFMV 1374" },
    ],
  },
  {
    id: "D", letra: "D",
    nome: "Fármacos e Psicotrópicos",
    descricao: "SIPEAGRO, Portaria 344/98 e Validades",
    icon: "LocalPharmacy",
    cor: "#e65100",
    corBg: "#fff3e0",
    pontos: 20,
    referencia: "Portaria 344/98 MS e IN 35 MAPA",
    risco_secao: "NC nesta seção = risco penal por desvio de substância controlada — o mais grave para o RT veterinário",
    itens: [
      { id:"T_PET_D_01", class:"CRÍTICO", peso:10, desc:"Relatórios do SIPEAGRO enviados mensalmente sem atrasos?", ref:"IN 35 MAPA" },
      { id:"T_PET_D_02", class:"CRÍTICO", peso:10, desc:"Fármacos controlados em armário exclusivo, trancado e chave sob posse do RT?", ref:"Portaria 344/98" },
      { id:"T_PET_D_03", class:"MAIOR",   peso:5,  desc:"Geladeira exclusiva para vacinas com termômetro de máxima e mínima?", ref:"Res. CFMV 1275" },
      { id:"T_PET_D_04", class:"MAIOR",   peso:5,  desc:"Ausência de produtos ou medicamentos vencidos na área de atendimento ou estoque?", ref:"Fiscalização Sanitária" },
    ],
  },
  {
    id: "E", letra: "E",
    nome: "Gerenciamento de Resíduos (PGRSS)",
    descricao: "Lixo infectante, perfurocortantes e abrigo",
    icon: "Nature",
    cor: "#1b5e20",
    corBg: "#f1f8e9",
    pontos: 15,
    referencia: "RDC ANVISA 222/2018",
    risco_secao: "NC nesta seção = autuação mais frequente em clínicas veterinárias — alta probabilidade de flagrante em qualquer vistoria",
    itens: [
      { id:"T_PET_E_01", class:"CRÍTICO", peso:10, desc:"PGRSS documentado e atualizado anualmente?", ref:"RDC ANVISA 222" },
      { id:"T_PET_E_02", class:"CRÍTICO", peso:10, desc:"Lixeiras exclusivas (com pedal) para resíduo infectante e sacos brancos leitosos?", ref:"RDC ANVISA 222" },
      { id:"T_PET_E_03", class:"CRÍTICO", peso:10, desc:"Caixas Descarpack (perfurocortantes) montadas corretamente e nunca acima do limite?", ref:"RDC ANVISA 222" },
      { id:"T_PET_E_04", class:"MAIOR",   peso:5,  desc:"Abrigo de resíduos externo, protegido de sol/chuva e lavável?", ref:"RDC ANVISA 222" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// FUNÇÕES DE ACESSO E CÁLCULO
// ═══════════════════════════════════════════════════════════════════

export function getGamificacaoPorArea(areaAtuacao) {
  if (areaAtuacao === "pequenos_animais") {
    return {
      SECOES_TRILHA: SECOES_TRILHA_PET,
      BADGES: BADGES_PET,
      MISSOES: MISSOES_PET,
    };
  }
  return {
    SECOES_TRILHA: SECOES_TRILHA_POA,
    BADGES: BADGES_POA,
    MISSOES: MISSOES_POA,
  };
}

export function calcularScoreTrilha(respostas, secoes_trilha) {
  // respostas: { [itemId]: "conforme" | "nao_conforme" | "na" }
  let pontuacaoObtida = 0;
  let pontuacaoMaxima = 0;
  let criticos_nc = 0;
  let maiores_nc = 0;

  secoes_trilha.forEach((secao) => {
    secao.itens.forEach((item) => {
      const resp = respostas[item.id];
      if (resp === "na") return;

      if (item.class === "CRÍTICO") {
        pontuacaoMaxima += item.peso;
        if (resp === "conforme") {
          pontuacaoObtida += item.peso;
        } else {
          pontuacaoObtida += PENALIDADES.item_critico_nc;
          criticos_nc++;
        }
      } else if (item.class === "MAIOR") {
        pontuacaoMaxima += item.peso;
        if (resp === "conforme") {
          pontuacaoObtida += item.peso;
        } else {
          pontuacaoObtida += PENALIDADES.item_maior_nc;
          maiores_nc++;
        }
      } else {
        pontuacaoMaxima += item.peso;
        if (resp === "conforme") pontuacaoObtida += item.peso;
      }
    });
  });

  const score =
    pontuacaoMaxima > 0
      ? Math.max(0, Math.round((pontuacaoObtida / pontuacaoMaxima) * 100))
      : 0;

  return { score, criticos_nc, maiores_nc, pontuacaoObtida, pontuacaoMaxima };
}

export function calcularXPAuditoria(resultado, auditorias_anteriores) {
  let xp = XP.auditoria_concluida;
  const { score, criticos_nc, pontuacaoObtida } = resultado;

  xp += pontuacaoObtida > 0 ? Math.floor(pontuacaoObtida / 5) : 0;

  if (score >= 95) xp += 100;
  else if (score >= 85) xp += 50;
  else if (score >= 75) xp += 25;

  const nunca_sem_critico = !auditorias_anteriores.some(
    (a) => (a.criticasNC ?? 99) === 0
  );
  if (criticos_nc === 0 && nunca_sem_critico) xp += XP.primeiro_sem_critico;

  const ultimas_3 = auditorias_anteriores.slice(0, 3);
  if (ultimas_3.length === 3 && ultimas_3.every((a) => (a.score ?? 0) >= 75)) {
    xp += XP.streak_3_meses;
  }

  return xp;
}

// Retorna quais badges foram conquistados e quais estão próximos
export function avaliarBadges(badges, userData, auditorias) {
  return badges.map((badge) => ({
    ...badge,
    conquistado: badge.criterio ? badge.criterio(userData, auditorias) : false,
  }));
}

// Retorna o próximo passo mais impactante para aumentar o escudo
export function proximoPassoMaisImpactante(missoes, missoesConcluidas) {
  const abertas = missoes
    .filter((m) => !missoesConcluidas.includes(m.id))
    .filter((m) => !m.desbloqueiaApos || missoesConcluidas.includes(m.desbloqueiaApos))
    .sort((a, b) => (b.escudo_incremento ?? 0) - (a.escudo_incremento ?? 0));

  return abertas[0] ?? null;
}
