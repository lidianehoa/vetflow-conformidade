/**
 * utilitários de Segurança e Rastreabilidade Jurídica
 * VERTOS OS - Blindagem 360°
 */

/**
 * Gera um Hash SHA-256 de uma string para garantir a imutabilidade do registro.
 * @param {string} text 
 * @returns {Promise<string>}
 */
export async function gerarHashSHA256(text) {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
}

/**
 * Gera um Smart ID único e curto para rastreabilidade (ex: VT-9A2F-2026)
 * @returns {string}
 */
export function gerarSmartID(prefix = "VT") {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const year = new Date().getFullYear();
  return `${prefix}-${random}-${year}`;
}
