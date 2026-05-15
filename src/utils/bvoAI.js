import { templateModel, modelIA, parseJSONSafe } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";

// ── IDs dos Templates (Firebase AI Logic Console) ──
const T = {
  LEGISLATIVO: "vertos-analista-legislativo-v1",
  ASSISTENTE: "vertos-assistente-compliance-v1"
};

/**
 * 1. ASSISTENTE DE COMPLIANCE (Chat Geral)
 * Corrigido para bater com os campos do console
 */
export async function consultarAssistenteCompliance(pergunta, areaAtuacao, tipoEstabelecimento) {
  try {
    const prompt = `Você é o Assistente Especialista em Compliance Veterinário da VERTOS OS.
    Seu objetivo é auxiliar o RT com dúvidas técnicas, normativas (MAPA, CRMV, SESAU) e operacionais.

    ÁREA DE ATUAÇÃO DO RT: ${areaAtuacao}
    TIPO DE ESTABELECIMENTO: ${tipoEstabelecimento}

    PERGUNTA DO RT: ${pergunta}

    Responda de forma profissional, técnica e objetiva, citando normas quando possível.`;

    const result = await modelIA.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro no Assistente de Compliance:", error);
    return "Desculpe, houve um erro ao processar sua dúvida técnica. Tente novamente em instantes.";
  }
}

export const gerarAnaliseLegislativa = async (texto, estado, cidade, tipo) => {
  try {
    const prompt = `Você é um Analista Legislativo Sênior especializado em compliance sanitário veterinário no Mato Grosso do Sul.

Analise o documento abaixo para um estabelecimento do tipo "${tipo}" localizado em ${cidade}/${estado}.
Baseie-se na LC 148/2009, Resoluções SESAU e normas CFMV/CRMV-MS.

Responda APENAS em JSON válido, sem markdown, sem texto fora do JSON:
{
  "setor_atuacao": "string",
  "resumo_fiscalizacao": "string",
  "exigencias_documentais": ["string"],
  "exigencias_estruturais": ["string"],
  "prazos_identificados": "string",
  "leis_e_resolucoes_citadas": ["string"],
  "analise_de_risco_multa": "string",
  "orientacao_pratica_rt": "string"
}

Documento:
${texto}`;

    const result = await modelIA.generateContent(prompt);
    const data = parseJSONSafe(result.response.text());
    if (!data) throw new Error("JSON inválido retornado pela IA.");

    const hash = await gerarHashSHA256(JSON.stringify(data));
    return { ...data, smartId: gerarSmartID("LEG-AI"), hash, dataProcessamento: new Date().toISOString() };

  } catch (error) {
    console.error("Erro na Análise Legislativa:", error);
    return fallbackLegislativo(texto, tipo);
  }
};

const fallbackLegislativo = async (texto, tipo) => {
  try {
    const prompt = `Você é um Especialista em Blindagem de Fé Pública para Clínicas Veterinárias no MS. 
    Analise este documento para um estabelecimento do tipo ${tipo} considerando a Lei Complementar 148/2009 e Resoluções SESAU de Campo Grande/MS:
    ${texto}. 

    Gere um Diagnóstico 360° rigoroso em JSON:
    - scoreBlindagem: Numérico (0-100) refletindo o nível de conformidade atual.
    - fase1_infra: [{ item, descricao, solucao }] (Ações físicas: pintura epóxi, reparos).
    - fase2_logistica: [{ item, descricao, solucao }] (Suprimentos: lixeiras de pedal, filtros).
    - fase3_burocracia: [{ item, descricao, solucao }] (Protocolos: CAC, Dossiê Físico).
    - resumoExecutivo: Texto focado em segurança jurídica para o RT.

    Responda APENAS o JSON.`;
    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch (e) {
    console.error("Erro no Fallback Legislativo:", e);
    return null;
  }
};

export const interpretarBVO = async (textoBVO, especialidade) => {
  try {
    const prompt = `Você é o Agente Vertos Intelligence, especialista em auditoria sanitária no Mato Grosso do Sul.
    Analise este BVO/Notificação para ${especialidade} com base na LC 148/2009 e normas da SESAU/CG.

    Retorne EXATAMENTE este formato JSON:
    {
      "scoreBlindagem": 0-100,
      "fase1_infra": [{ "item": "", "descricao": "", "solucao": "" }],
      "fase2_logistica": [{ "item": "", "descricao": "", "solucao": "" }],
      "fase3_burocracia": [{ "item": "", "descricao": "", "solucao": "" }],
      "resumoExecutivo": ""
    }`;
    const result = await modelIA.generateContent([
      { text: prompt },
      { text: textoBVO }
    ]);
    return parseJSONSafe(result.response.text());
  } catch (error) {
    console.error("Erro no Interpretador BVO:", error);
    return null;
  }
};

/**
 * 4. ANÁLISE DE VISTORIA (Aba Vistorias)
 */
export const analisarVistoria = async (textoVistoria, orgao, dataVistoria) => {
  try {
    const result = await modelIA.generateContent(`Analise a vistoria de ${orgao} em ${dataVistoria}. Texto: ${textoVistoria}. Gere plano de ação JSON.`);
    const data = parseJSONSafe(result.response.text());
    return { ...data, smartId: gerarSmartID("VIST-AI"), dataProcessamento: new Date().toISOString() };
  } catch (error) {
    console.error("Erro na análise de vistoria:", error);
    return null;
  }
};

/**
 * 5. UTILS PARA AUDITORIA (Parecer e 5W2H)
 */
export const gerarParecerAuditoria = async (dados) => {
  try {
    const result = await modelIA.generateContent(`Gere parecer técnico para score ${dados.score}%. Responda JSON.`);
    return parseJSONSafe(result.response.text());
  } catch {
    return null;
  }
};

export const gerarPlanoAcao = async (nc, base, tipo) => {
  try {
    const result = await modelIA.generateContent(`Gere plano 5W2H para NC: ${nc}. Responda JSON.`);
    return parseJSONSafe(result.response.text());
  } catch {
    return null;
  }
};
