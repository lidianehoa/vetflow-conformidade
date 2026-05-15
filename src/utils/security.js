// src/utils/security.js

/**
 * Gera um ID amigável e rastreável para documentos processados por IA
 */
export const gerarSmartID = (prefixo = "GEN") => {
  const data = new Date().toISOString().replace(/[-:T]/g, "").slice(2, 10);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefixo}-${data}-${random}`;
};

/**
 * Gera um hash SHA-256 para garantir a integridade dos dados da análise
 */
export const gerarHashSHA256 = async (mensagem) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(mensagem);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};
