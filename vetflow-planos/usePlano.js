// ============================================================
// usePlano.js
// Hook central de permissões do VetFlow.
// Lê userData (já disponível no guard `ri`) e expõe o que
// cada plano pode acessar.
//
// Valores do campo "plan" no Firestore (coleção "users"):
//   "freemium"    → só POPs / Fábrica de Documentos básica
//   "rt_solo"     → Checklist + TCLE + 5W2H + Manual + Docs
//   "clinica_pro" → Tudo + Dashboard + SimplesVet
//   "pending"     → sem plano, redireciona para /pagamento
// ============================================================

import { useMemo } from "react";

export const PLANOS = {
  FREEMIUM:    "freemium",
  RT_SOLO:     "rt_solo",
  CLINICA_PRO: "clinica_pro",
};

export const LABEL_PLANO = {
  freemium:    "Freemium",
  rt_solo:     "RT Solo",
  clinica_pro: "Clínica Pro",
  pending:     "Sem plano",
};

// Mapa completo de permissões por plano
const PERMISSOES = {
  freemium: {
    dashboard:          false, // VET.FLOW COCKPIT — gráficos e radar
    auditorias:         false, // /auditorias — Portal de Compliance
    novaAuditoria:      false, // /auditorias/nova — Inspeção 360°
    checklist:          false, // /checklist — Checklist Mensal
    termos:             false, // /termos — Gerador de TCLE
    documentos:         true,  // /documentos — Fábrica de Docs (POPs)
    gerarDocumento:     false, // /documentos/gerar/:id — bloqueado exceto POPs
    manualBoasPraticas: false,
    simplesVet:         false,
  },
  rt_solo: {
    dashboard:          false, // dashboard com gráficos = Clínica Pro
    auditorias:         true,
    novaAuditoria:      true,
    checklist:          true,
    termos:             true,
    documentos:         true,
    gerarDocumento:     true,
    manualBoasPraticas: true,
    simplesVet:         false,
  },
  clinica_pro: {
    dashboard:          true,
    auditorias:         true,
    novaAuditoria:      true,
    checklist:          true,
    termos:             true,
    documentos:         true,
    gerarDocumento:     true,
    manualBoasPraticas: true,
    simplesVet:         true,
  },
};

// Plano mínimo para cada recurso (usado na mensagem de upgrade)
export const PLANO_MINIMO = {
  dashboard:          "clinica_pro",
  auditorias:         "rt_solo",
  novaAuditoria:      "rt_solo",
  checklist:          "rt_solo",
  termos:             "rt_solo",
  gerarDocumento:     "rt_solo",
  manualBoasPraticas: "rt_solo",
  simplesVet:         "clinica_pro",
};

export function usePlano(userData) {
  const plan = userData?.plan ?? "freemium";

  const permissoes = useMemo(
    () => PERMISSOES[plan] ?? PERMISSOES.freemium,
    [plan]
  );

  // pode("checklist") → true | false
  const pode = (recurso) => permissoes[recurso] === true;

  // planoMinimo("checklist") → "RT Solo"
  const planoMinimo = (recurso) =>
    LABEL_PLANO[PLANO_MINIMO[recurso]] ?? "RT Solo";

  return { plan, label: LABEL_PLANO[plan], permissoes, pode, planoMinimo };
}
