import { useMemo } from "react";

export const LABEL_PLANO = {
  core:    "VERTOS CORE",
  pro:     "VERTOS PRO",
  expired: "Plano Expirado",
  pending: "Aguardando Plano",
};

const PERMISSOES_FULL = {
  dashboard: true, auditorias: true, novaAuditoria: true,
  checklist: true, termos: true, documentos: true,
  gerarDocumento: true, manualBoasPraticas: true, simplesVet: true,
  relatoriosCrmv: true, planilhas: true, sipeagro2: true,
};

const PERMISSOES = {
  pending: {
    dashboard: false, auditorias: false, novaAuditoria: false,
    checklist: false, termos: false, documentos: true,
    gerarDocumento: false, manualBoasPraticas: false, simplesVet: false,
    relatoriosCrmv: false, planilhas: false, sipeagro2: false,
  },
  expired: {
    dashboard: false, auditorias: false, novaAuditoria: false,
    checklist: false, termos: false, documentos: false,
    gerarDocumento: false, manualBoasPraticas: false, simplesVet: false,
    relatoriosCrmv: false, planilhas: false, sipeagro2: false,
  },
  core: { 
    ...PERMISSOES_FULL,
    simplesVet: false, // Auto-fill engine
    sipeagro2: false,  // Gestão avançada de estoque
    relatoriosCrmv: false, // Official CRMV Hub
  },
  pro: { ...PERMISSOES_FULL },
};

export const PLANO_MINIMO = {
  dashboard: "core", auditorias: "core", novaAuditoria: "core",
  checklist: "core", termos: "core", gerarDocumento: "core",
  manualBoasPraticas: "core", simplesVet: "pro",
  relatoriosCrmv: "pro", planilhas: "core", sipeagro2: "pro",
};

export function usePlano(userData) {
  const role = userData?.role || "user";
  const plan = userData?.plan ?? "pending";
  
  // Admin sempre tem todas as permissões
  const permissoes = useMemo(() => {
    if (role === "admin") return PERMISSOES_FULL;
    return PERMISSOES[plan] ?? PERMISSOES.pending;
  }, [plan, role]);

  const pode = (recurso) => permissoes[recurso] === true;
  const planoMinimo = (recurso) => LABEL_PLANO[PLANO_MINIMO[recurso]] ?? "VERTOS CORE";

  // Limites do plano CORE
  const limites = useMemo(() => {
    if (role === "admin" || plan === "pro") return { unidades: Infinity, auditoriasMes: Infinity };
    return { unidades: 1, auditoriasMes: 5 };
  }, [plan, role]);
  
  return { 
    plan, 
    label: role === "admin" ? "Administrador" : (LABEL_PLANO[plan] || "Sem Plano"), 
    pode, 
    planoMinimo,
    limites,
    isAdmin: role === "admin"
  };
}
