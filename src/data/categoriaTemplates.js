/**
 * Mapeamento de categorias Firestore → categorias reorganizadas VetFlow
 *
 * Categorias originais no Firestore (campo `categoria`):
 *   CIRURGIAS, POPS CIRURGIAS, CENTRO CIRURGICO,
 *   EXAMES, TRATAMENTOS, ATENDIMENTO,
 *   LIMPEZA, LIMPEZA E HIGIENIZAÇÃO, MBP E PGRSS,
 *   RESOLUCAO-NO-1374, KIT COMPLETO, KIT ESSENCIAL
 *
 * Nova estrutura com 5 categorias VetFlow:
 */

export const CATEGORIAS_VERTOS = [
  {
    id: "centro_cirurgico",
    label: "Centro Cirúrgico",
    emoji: "🔬",
    cor: "#6a1b9a",
    bg: "#f3e5f5",
    tags: ["CIRURGIAS", "POPS CIRURGIAS", "CENTRO CIRURGICO"],
  },
  {
    id: "diagnostico_exames",
    label: "Diagnóstico e Exames",
    emoji: "🔭",
    cor: "#0d47a1",
    bg: "#e3f2fd",
    tags: ["EXAMES"],
  },
  {
    id: "clinica_tratamentos",
    label: "Clínica e Tratamentos",
    emoji: "🩺",
    cor: "#1b4332",
    bg: "#e8f5e9",
    tags: ["TRATAMENTOS", "ATENDIMENTO"],
  },
  {
    id: "biosseguranca_residuos",
    label: "Biossegurança e Resíduos",
    emoji: "♻️",
    cor: "#e65100",
    bg: "#fff3e0",
    tags: ["LIMPEZA", "LIMPEZA E HIGIENIZAÇÃO", "MBP E PGRSS"],
  },
  {
    id: "compliance_juridico",
    label: "Compliance e Jurídico",
    emoji: "⚖️",
    cor: "#b71c1c",
    bg: "#ffebee",
    tags: ["RESOLUCAO-NO-1374", "KIT COMPLETO", "KIT ESSENCIAL"],
  },
  {
    id: "industria_poa",
    label: "Indústria POA / Agro",
    emoji: "🏭",
    cor: "#0d47a1",
    bg: "#e3f2fd",
    tags: ["INDUSTRIA POA", "PAC", "PPHO", "HACCP", "APPCC", "INDUSTRIA ALIMENTICIA", "PRODUCAO RURAL", "AREAS ESPECIAIS"],
  },
];

/**
 * Converte a categoria original do Firestore para o ID da nova categoria VetFlow.
 * @param {string} categoriaOriginal - Valor do campo `categoria` no Firestore
 * @returns {string} ID da categoria VetFlow ou "outros"
 */
export function normalizarCategoria(categoriaOriginal) {
  if (!categoriaOriginal) return "outros";
  const upper = categoriaOriginal.trim().toUpperCase();
  const match = CATEGORIAS_VERTOS.find((cat) =>
    cat.tags.some((tag) => upper.includes(tag) || tag.includes(upper))
  );
  return match?.id ?? "outros";
}

/**
 * Retorna o objeto de categoria VetFlow pelo ID.
 */
export function getCategoriaById(id) {
  return CATEGORIAS_VERTOS.find((c) => c.id === id) ?? null;
}
