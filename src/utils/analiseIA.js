import { modelIA, parseJSONSafe } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";

/**
 * 1. ASSISTENTE DE COMPLIANCE (Chat Geral)
 */
export async function consultarAssistenteCompliance(pergunta, areaAtuacao, tipoEstabelecimento, contextoExtra = "") {
  try {
    const prompt = `Você é o Assistente Especialista em Compliance Veterinário da VERTOS OS.
    Seu objetivo é auxiliar o RT com dúvidas técnicas, normativas (MAPA, CRMV, SESAU) e operacionais.

    ÁREA DE ATUAÇÃO DO RT: ${areaAtuacao}
    TIPO DE ESTABELECIMENTO: ${tipoEstabelecimento}

    ${contextoExtra ? `CONTEÚDO DO DOCUMENTO PARA ANÁLISE:\n${contextoExtra}\n` : ""}

    PERGUNTA DO RT: ${pergunta}

    Responda de forma profissional, técnica e objetiva, citando normas quando possível.`;

    const result = await modelIA.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro no Assistente de Compliance:", error);
    return "Desculpe, houve um erro ao processar sua dúvida técnica. Tente novamente em instantes.";
  }
}

/**
 * 2. ANÁLISE LEGISLATIVA 360° SÊNIOR
 */
export const gerarAnaliseLegislativa = async (texto, estado, cidade, tipo) => {
  try {
    const prompt = `Você é um Analista Legislativo Sênior especializado em compliance sanitário veterinário no Mato Grosso do Sul.
    Analise o documento abaixo para um estabelecimento do tipo "${tipo}" localizado em ${cidade}/${estado}.
    Baseie-se na LC 148/2009, Resoluções SESAU e normas CFMV/CRMV-MS.

    Responda APENAS em JSON válido:
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
    if (!data) throw new Error("JSON inválido.");

    const hash = await gerarHashSHA256(JSON.stringify(data));
    return { ...data, smartId: gerarSmartID("LEG-AI"), hash, dataProcessamento: new Date().toISOString() };
  } catch (error) {
    console.error("Erro na Análise Legislativa:", error);
    return null;
  }
};

/**
 * 3. INTERPRETADOR BVO (Aba Vistorias)
 */
export const interpretarBVO = async (textoBVO, especialidade) => {
  try {
    const prompt = `Você é o Agente Vertos Intelligence, especialista em Mato Grosso do Sul (LC 148/2009).
    Analise este BVO/Notificação para ${especialidade} e retorne Diagnóstico 360 em JSON:
    { "scoreBlindagem": 0-100, "fase1_infra": [], "fase2_logistica": [], "fase3_burocracia": [], "resumoExecutivo": "" }`;
    
    const result = await modelIA.generateContent([
      { text: prompt },
      { text: textoBVO }
    ]);
    return parseJSONSafe(result.response.text());
  } catch (error) {
    return null;
  }
};

/**
 * 4. PARECER TÉCNICO DE AUDITORIA
 */
export async function gerarParecerAuditoria(dados) {
  try {
    const prompt = `Gere parecer técnico para auditoria veterinária.
    Score: ${dados.score}%
    Tipo: ${dados.tipo}
    NC Críticas: ${dados.criticosNC}
    NC Maiores: ${dados.maioresNC}

    Responda em JSON:
    { "nivel_conformidade": "string", "parecer_tecnico": "string", "recomendacoes_prioritarias": "string", "prazo_correcao": "string" }`;

    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return null;
  }
}

/**
 * 5. PLANO DE AÇÃO (5W2H)
 */
export const gerarPlanoAcao = async (nc, base, tipo) => {
  try {
    const prompt = `Gere plano de ação 5W2H para a Não Conformidade: "${nc}"
    Base Legal: ${base}
    Tipo de Estabelecimento: ${tipo}

    Responda em JSON.`;
    
    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return null;
  }
};

/**
 * 6. ANÁLISE DE VENCIMENTOS
 */
export async function analisarVencimentos(vencimentos, tipoEstabelecimento) {
  try {
    const prompt = `Analise a situação de vencimentos de documentos para ${tipoEstabelecimento}:
    ${JSON.stringify(vencimentos)}

    Responda em JSON com resumo_situacao.`;

    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return { resumo_situacao: "Verificar vencimentos no radar." };
  }
}

/**
 * 7. RESUMO MENSAL CRMV
 */
export async function gerarResumoMensal(dados) {
  try {
    const prompt = `Gere um relatório resumo mensal de atividades para o CRMV com base nos dados:
    ${JSON.stringify(dados)}

    O texto deve ser formal e técnico.`;

    const result = await modelIA.generateContent(prompt);
    return result.response.text();
  } catch {
    return "Falha ao gerar resumo automático.";
  }
}

/**
 * 8. VALIDAÇÃO DE ADMISSÃO (CHECKLIST)
 */
export async function validarAdmissaoPet(pet) {
  try {
    const prompt = `Valide a admissão de um pet em creche/hotel veterinário:
    ${JSON.stringify(pet)}

    Responda em JSON com status_admissao.`;

    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return { status_admissao: "OK" };
  }
}
