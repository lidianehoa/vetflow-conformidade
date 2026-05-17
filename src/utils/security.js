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

/**
 * Monta payload ordenado e gera hash para registros de rotina e auditoria.
 * A ordenação por Object.keys().sort() garante que a mesma entrada sempre
 * gera o mesmo hash, independente da ordem em que os campos chegaram.
 *
 * @param {object} dados          - campos do formulário
 * @param {string} uid            - UID do usuário autenticado (Firebase Auth)
 * @param {string} estabelecimentoId - ID do estabelecimento ativo
 * @returns {{ hash: string, payload: object }}
 */
export const gerarHashRegistro = async (dados, uid, estabelecimentoId) => {
  const payload = {
    ...dados,
    uid,
    estabelecimentoId,
    criadoEm: new Date().toISOString(), // timestamp ISO fixado ANTES do hash
  };

  // sort() garante ordem alfabética — mesmo objeto, mesmo hash, sempre
  const payloadOrdenado = JSON.stringify(
    payload,
    Object.keys(payload).sort()
  );

  const hash = await gerarHashSHA256(payloadOrdenado);
  return { hash, payload };
};

/**
 * Verifica se um registro recuperado do Firestore mantém integridade.
 * Remove os campos que NÃO fazem parte do payload original antes de recalcular.
 *
 * Campos excluídos da verificação (adicionados pelo Firestore após o save):
 * - hashSHA256         → o próprio hash não estava no payload original
 * - criadoEmServidor   → timestamp do servidor, separado do payload
 * - imutavel           → flag de controle, não faz parte dos dados
 * - smartId            → gerado separado do hash
 * - id                 → ID do documento do Firestore
 *
 * @param {object} registro - documento completo recuperado do Firestore
 * @returns {{ integro: boolean, hashSalvo: string, hashRecalculado: string }}
 */
export const verificarIntegridade = async (registro) => {
  if (!registro) {
    return {
      integro: false,
      motivo: 'Registro inválido ou nulo',
      hashSalvo: null,
      hashRecalculado: null
    };
  }

  // Extrair o hash salvo e os campos que não fazem parte do payload original
  const {
    hashSHA256,
    criadoEmServidor,
    imutavel,
    smartId,
    id,
    ...payload
  } = registro;

  if (!hashSHA256) {
    return {
      integro: false,
      motivo: 'Registro sem hash — não foi gerado com gerarHashRegistro',
      hashSalvo: null,
      hashRecalculado: null,
    };
  }

  // Recalcular com a mesma ordenação usada na geração
  const payloadOrdenado = JSON.stringify(
    payload,
    Object.keys(payload).sort()
  );
  const hashRecalculado = await gerarHashSHA256(payloadOrdenado);

  return {
    integro: hashRecalculatedEquals(hashRecalculado, hashSHA256),
    hashSalvo: hashSHA256,
    hashRecalculated: hashRecalculado, // para compatibilidade
    hashRecalculado
  };
};

function hashRecalculatedEquals(a, b) {
  return a === b;
}

