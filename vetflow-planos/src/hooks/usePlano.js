// src/hooks/usePlano.js
// ================================================================
// Hook de controle de acesso por plano — use em qualquer página.
//
// EXEMPLOS:
//   const { temAcesso, atingiuLimite, isFreemium } = usePlano();
//
//   // Bloquear funcionalidade:
//   if (!temAcesso("tcle")) return <BloqueadoCard funcionalidade="tcle" />;
//
//   // Checar limite:
//   if (atingiuLimite("auditorias", totalAuditorias)) return <LimiteAtingido />;
//
//   // Limitar itens do checklist:
//   const itensVisiveis = isFreemium ? itens.slice(0, limite("checklistItens")) : itens;
// ================================================================
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getPlano } from "../config/planos";

export function usePlano() {
  const { userData } = useContext(AuthContext);
  const planId = userData?.plan || "pending";
  const plano  = getPlano(planId);

  return {
    plano,
    planId,

    // true/false para cada funcionalidade
    temAcesso: (funcionalidade) => plano.acesso[funcionalidade] === true,

    // true se o usuário já atingiu o limite da métrica
    atingiuLimite: (metrica, valorAtual) => {
      const lim = plano.limites[metrica];
      if (lim === undefined || lim === Infinity) return false;
      return valorAtual >= lim;
    },

    // valor numérico do limite (ex: 20 para checklistItens no freemium)
    limite: (metrica) => plano.limites[metrica] ?? Infinity,

    // Atalhos
    isFreemium:  planId === "freemium",
    isRtSolo:    planId === "rtSolo",
    isClinicaPro:planId === "clinicaPro",
    isPending:   planId === "pending",
    isAssinante: ["rtSolo", "clinicaPro"].includes(planId),
  };
}
