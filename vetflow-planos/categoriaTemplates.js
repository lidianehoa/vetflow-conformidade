// ============================================================
// categoriaTemplates.js
// Mapeamento de categorias antigas → nova hierarquia
// Use este arquivo em Documentos.jsx para filtros e chips
// ============================================================

// ─── Nova hierarquia de categorias ───────────────────────────
export const CATEGORIAS = [
  {
    id: "centro_cirurgico",
    label: "Centro Cirúrgico",
    cor: "#1b4332",
    corFundo: "#f0fdf4",
    icone: "ContentCut", // MUI icon
    subcategorias: [
      { id: "procedimentos_cirurgicos", label: "Procedimentos Cirúrgicos" },
      { id: "pops_cirurgicos",          label: "POPs Cirúrgicos" },
      { id: "estrutura_cc",             label: "Centro Cirúrgico (Estrutura)" },
    ],
    // Valores originais do Firestore que mapeiam para esta categoria
    firestoreMatch: ["CIRURGIAS", "POPS CIRURGIAS", "CENTRO CIRURGICO"],
  },
  {
    id: "diagnostico_exames",
    label: "Diagnóstico e Exames",
    cor: "#185FA5",
    corFundo: "#e6f1fb",
    icone: "Biotech",
    subcategorias: [
      { id: "exames_laboratoriais", label: "Exames Laboratoriais" },
    ],
    firestoreMatch: ["EXAMES"],
  },
  {
    id: "clinica_tratamentos",
    label: "Clínica e Tratamentos",
    cor: "#854F0B",
    corFundo: "#faeeda",
    icone: "Vaccines",
    subcategorias: [
      { id: "protocolos_tratamento", label: "Protocolos de Tratamento" },
      { id: "atendimento_paciente",  label: "Atendimento ao Paciente" },
    ],
    firestoreMatch: ["TRATAMENTOS", "ATENDIMENTO"],
  },
  {
    id: "biosseguranca",
    label: "Biossegurança e Resíduos",
    cor: "#A32D2D",
    corFundo: "#fcebeb",
    icone: "CleaningServices",
    subcategorias: [
      { id: "limpeza_higienizacao", label: "Limpeza e Higienização" },
      { id: "mbp_pgrss",           label: "MBP — Manual de Boas Práticas" },
    ],
    firestoreMatch: ["LIMPEZA E HIGIENIZAÇÃO", "LIMPEZA", "MBP E PGRSS"],
  },
  {
    id: "compliance_juridico",
    label: "Compliance e Jurídico",
    cor: "#534AB7",
    corFundo: "#eeedfe",
    icone: "Gavel",
    subcategorias: [
      { id: "resolucao_1374",          label: "Resolução 1374 — Veterinária" },
      { id: "kit_blindagem_completo",  label: "Kit Blindagem Jurídica Completo" },
      { id: "kit_blindagem_essencial", label: "Kit Blindagem Jurídica Essencial" },
    ],
    firestoreMatch: [
      "RESOLUCAO-NO-1374-VETERINARIA",
      "KIT COMPLETO BLINDAGEM JURÍDICA",
      "KIT ESSENCIAL DE BLINDAGEM JURÍDICA",
    ],
  },
];

// ─── Função para normalizar categoria antiga → nova ───────────
// Uso: normalizarCategoria("POPS CIRURGIAS") → { categoriaId: "centro_cirurgico", label: "Centro Cirúrgico" }
export function normalizarCategoria(categoriaFirestore) {
  for (const cat of CATEGORIAS) {
    if (cat.firestoreMatch.includes(categoriaFirestore?.toUpperCase()?.trim())) {
      return { categoriaId: cat.id, label: cat.label, cor: cat.cor, corFundo: cat.corFundo };
    }
  }
  return { categoriaId: "outros", label: "Outros", cor: "#888", corFundo: "#f5f5f5" };
}

// ─── Contagens esperadas por categoria ───────────────────────
// Centro Cirúrgico:       83 docs (58 + 23 + 2)
// Diagnóstico e Exames:   26 docs
// Clínica e Tratamentos:  22 docs (20 + 2)
// Biossegurança:          36 docs (24 + 12)
// Compliance e Jurídico:  54 docs (27 + 20 + 7)
// Total:                 221 docs
