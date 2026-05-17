// src/utils/plano.js

export function planoAtivo(userData) {
  if (!userData) return false;

  const plano = userData.plano || userData.plan;
  const { planoExpiraEm } = userData;

  // Assinaturas recorrentes: nunca expiram por data
  if (plano === 'core' || plano === 'pro' || plano === 'trial') {
    return true;
  }

  // PASS: verificar se ainda está dentro do período de 30 dias
  if ((plano === 'pass_core' || plano === 'pass_pro') && planoExpiraEm) {
    const expiraData = typeof planoExpiraEm.toDate === 'function' ? planoExpiraEm.toDate() : new Date(planoExpiraEm);
    return expiraData > new Date();
  }

  return false;
}

export function diasRestantesPass(userData) {
  if (!userData?.planoExpiraEm) return 0;
  const expiraData = typeof userData.planoExpiraEm.toDate === 'function' ? userData.planoExpiraEm.toDate() : new Date(userData.planoExpiraEm);
  const diff = expiraData - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isPass(userData) {
  const plano = userData?.plano || userData?.plan;
  return plano === 'pass_core' || plano === 'pass_pro';
}

export function isRecorrente(userData) {
  const plano = userData?.plano || userData?.plan;
  return plano === 'core' || plano === 'pro';
}
