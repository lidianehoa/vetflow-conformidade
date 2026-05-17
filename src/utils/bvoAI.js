import { templateModel, modelIA, parseJSONSafe } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";
import { getTextoLegislacaoParaPrompt } from "./legislacaoEstadual";
import { getTextoDiretrizesParaPrompt, getTextoDiretrizesEspecificas } from "./diretrizesRT";

// ── IDs dos Templates (Firebase AI Logic Console) ──
const T = {
  LEGISLATIVO: "vertos-analista-legislativo-v1",
  ASSISTENTE: "vertos-assistente-compliance-v1"
};

/**
 * 1. ASSISTENTE DE COMPLIANCE (Chat Geral)
 */
export async function consultarAssistenteCompliance(pergunta, areaAtuacao, tipoEstabelecimento) {
  try {
    const prompt = `Você é o Assistente Especialista em Compliance Veterinário da VERTOS OS.
    Seu objetivo é auxiliar o RT com dúvidas técnicas, normativas (MAPA, CRMV, SESAU) e operacionais.

    ${getTextoDiretrizesParaPrompt()}
    ${getTextoDiretrizesEspecificas(areaAtuacao)}

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
    const uf = estado || "MS";
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);

    const prompt = `Você é um Analista Legislativo Sênior especializado em compliance sanitário veterinário.
    
    ${blocoLegislacao}

    ${getTextoDiretrizesParaPrompt()}
    ${getTextoDiretrizesEspecificas(tipo)}

    Analise o documento para um estabelecimento do tipo "${tipo}" em ${cidade}/${uf}.
    
    INSTRUÇÕES:
    1. IDENTIFICAÇÃO DO CARÁTER: Identifique se o documento é pedagógico (Orientação) ou punitivo (Infração).
    2. EXTRAÇÃO DE PRAZOS: Se punitivo, extraia o prazo de defesa/regularização.

    Responda APENAS em JSON válido:
    {
      "setor_atuacao": "string",
      "caracterDocumento": "PEDAGOGICO | PUNITIVO",
      "resumo_fiscalizacao": "string",
      "exigencias_documentais": ["string"],
      "exigencias_estruturais": ["string"],
      "prazos_identificados": "string",
      "leis_e_resolucoes_citadas": ["string"],
      "analise_de_risco_multa": "string",
      "orientacao_pratica_rt": "string"
    }`;

    const result = await modelIA.generateContent(prompt + `\n\nDocumento:\n${texto}`);
    const data = parseJSONSafe(result.response.text());
    if (!data) throw new Error("JSON inválido");

    const hash = await gerarHashSHA256(JSON.stringify(data));
    return { ...data, smartId: gerarSmartID("LEG-AI"), hash, dataProcessamento: new Date().toISOString() };

  } catch (error) {
    console.error("Erro na Análise Legislativa:", error);
    return null;
  }
};

export const interpretarBVO = async (textoBVO, especialidade, estado) => {
  try {
    const uf = estado || "MS";
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);

    const prompt = `Você é o Agente Vertos Intelligence, especialista em auditoria e compliance veterinário.
    
    ${blocoLegislacao}

    ${getTextoDiretrizesParaPrompt()}
    ${getTextoDiretrizesEspecificas(especialidade)}

    Analise o documento para ${especialidade} em ${uf}.

    INSTRUÇÕES:
    1. IDENTIFICAÇÃO DO CARÁTER: Pedagógico (Orientação) ou Punitivo (Infração).
    2. EXTRAÇÃO DE PRAZOS: Se punitivo, extraia prazos de defesa.

    Retorne APENAS JSON:
    {
      "scoreBlindagem": 0-100,
      "caracterDocumento": "PEDAGOGICO | PUNITIVO",
      "prazoDefesa": "string",
      "fase1_infra": [{ "item": "", "descricao": "", "solucao": "" }],
      "fase2_logistica": [{ "item": "", "descricao": "", "solucao": "" }],
      "fase3_burocracia": [{ "item": "", "descricao": "", "solucao": "" }],
      "resumoExecutivo": "string"
    }`;
    
    const result = await modelIA.generateContent(prompt + `\n\nTexto:\n${textoBVO}`);
    return parseJSONSafe(result.response.text());
  } catch (error) {
    console.error("Erro ao interpretar documento:", error);
    return null;
  }
};

/**
 * 4. ANÁLISE DE VISTORIA
 */
export const analisarVistoria = async (textoVistoria, orgao, dataVistoria) => {
  try {
    const result = await modelIA.generateContent(`Analise a vistoria de ${orgao} em ${dataVistoria}. Texto: ${textoVistoria}. Gere plano JSON.`);
    const data = parseJSONSafe(result.response.text());
    return { ...data, smartId: gerarSmartID("VIST-AI"), dataProcessamento: new Date().toISOString() };
  } catch (error) {
    console.error("Erro na análise de vistoria:", error);
    return null;
  }
};

/**
 * 5. UTILS PARA AUDITORIA
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
