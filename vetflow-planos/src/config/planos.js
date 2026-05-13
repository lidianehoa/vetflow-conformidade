// src/config/planos.js
// ================================================================
// FONTE ÚNICA DE VERDADE — planos, preços e permissões VetFlow
// Edite aqui para mudar qualquer coisa de qualquer plano.
// ================================================================

export const PLANOS = {

  // ── FREEMIUM ─────────────────────────────────────────────────
  freemium: {
    id: "freemium",
    nome: "Freemium",
    preco: 67.90,
    precoLabel: "R$ 67,90",
    periodo: "mês",
    tag: "Entrada gratuita",
    // 🔧 Cole aqui o link do produto no PagSeguro para R$ 67,90/mês
    pagseguroLink: "https://pag.ae/SEU_LINK_FREEMIUM",
    descricao: "POPs básicos gratuitos. Upgrade natural quando o risco de fiscalização aparecer.",
    limites: {
      auditorias: 3,         // máximo de auditorias salvas
      checklistItens: 20,    // itens visíveis no checklist
    },
    acesso: {
      pops:               true,  // POPs básicos — sempre visíveis
      checklist:          true,  // checklist limitado a 20 itens
      auditorias:         true,  // salvar até 3 auditorias
      tcle:               false, // 🔒 Gerador de TCLE
      documentos:         false, // 🔒 Fábrica de Documentos
      manualBoasPraticas: false, // 🔒 Manual de Boas Práticas CFMV
      plano5W2H:          false, // 🔒 Plano de Voo 5W2H
      dashboardRisco:     false, // 🔒 Dashboard de Risco em Tempo Real
      relatorioPDF:       false, // 🔒 Exportação PDF para CRMV
      multiUsuarios:      false, // 🔒 Múltiplos usuários
    },
  },

  // ── RT SOLO ──────────────────────────────────────────────────
  rtSolo: {
    id: "rtSolo",
    nome: "RT Solo",
    preco: 97,
    precoLabel: "R$ 97",
    periodo: "mês",
    tag: "Plano básico",
    // 🔧 Cole aqui o link do produto no PagSeguro para R$ 97/mês
    pagseguroLink: "https://pag.ae/81Dobz8Qt",
    descricao: "Checklist completo, TCLE, Documentos e Plano de Voo. 1 unidade.",
    limites: {
      auditorias:     Infinity,
      checklistItens: Infinity,
    },
    acesso: {
      pops:               true,
      checklist:          true,
      auditorias:         true,
      tcle:               true,
      documentos:         true,
      manualBoasPraticas: true,
      plano5W2H:          true,
      dashboardRisco:     true,
      relatorioPDF:       false, // 🔒 só no Clínica Pro
      multiUsuarios:      false, // 🔒 só no Clínica Pro
    },
  },

  // ── CLÍNICA PRO ──────────────────────────────────────────────
  clinicaPro: {
    id: "clinicaPro",
    nome: "Clínica Pro",
    preco: 197,
    precoLabel: "R$ 197",
    periodo: "mês",
    tag: "Plano clínica",
    // 🔧 Cole aqui o link do produto no PagSeguro para R$ 197/mês
    pagseguroLink: "https://pag.ae/SEU_LINK_CLINICA_PRO",
    descricao: "Tudo do RT Solo + SimplesVet, múltiplos usuários e PDF para CRMV.",
    limites: {
      auditorias:     Infinity,
      checklistItens: Infinity,
    },
    acesso: {
      pops:               true,
      checklist:          true,
      auditorias:         true,
      tcle:               true,
      documentos:         true,
      manualBoasPraticas: true,
      plano5W2H:          true,
      dashboardRisco:     true,
      relatorioPDF:       true,
      multiUsuarios:      true,
    },
  },

  // ── PENDING ──────────────────────────────────────────────────
  // Usuário recém cadastrado — sempre redireciona para /pagamento
  pending: {
    id: "pending",
    nome: "Sem plano",
    preco: 0,
    limites: { auditorias: 0, checklistItens: 0 },
    acesso: {
      pops: false, checklist: false, auditorias: false, tcle: false,
      documentos: false, manualBoasPraticas: false, plano5W2H: false,
      dashboardRisco: false, relatorioPDF: false, multiUsuarios: false,
    },
  },
};

// ── Helpers ───────────────────────────────────────────────────
export function getPlano(planId) {
  return PLANOS[planId] || PLANOS.pending;
}

export function temAcesso(planId, funcionalidade) {
  return getPlano(planId).acesso[funcionalidade] === true;
}

export function atingiuLimite(planId, metrica, valorAtual) {
  const limite = getPlano(planId).limites[metrica];
  if (limite === undefined || limite === Infinity) return false;
  return valorAtual >= limite;
}
