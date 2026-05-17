import { modelIA, parseJSONSafe } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";
import { getTextoLegislacaoParaPrompt, estadoTemLegislacao } from "./legislacaoEstadual";
import { getTextoDiretrizesParaPrompt, getTextoDiretrizesEspecificas } from "./diretrizesRT";

/**
 * 1. ASSISTENTE DE COMPLIANCE (Chat Geral)
 */
export async function consultarAssistenteCompliance(pergunta, areaAtuacao, tipoEstabelecimento, contextoExtra = "") {
  try {
    const prompt = `Você é o Assistente Especialista em Compliance Veterinário da VERTOS OS.
    Seu objetivo é auxiliar o RT com dúvidas técnicas, normativas (MAPA, CRMV, SESAU) e operacionais.

    ${getTextoDiretrizesParaPrompt()}
    ${getTextoDiretrizesEspecificas(areaAtuacao)}

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
    const uf = estado || 'MS';
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);
    const blocoEspecifico = getTextoDiretrizesEspecificas(tipo);

    const prompt = `
Você é um Auditor Fiscal e especialista em conformidade veterinária, legislação CFMV/MAPA e vigilância sanitária.
Analise este documento para um estabelecimento "${tipo}" em ${cidade}/${uf} e gere um diagnóstico 360° em JSON.

${blocoLegislacao}

${getTextoDiretrizesParaPrompt()}

${blocoEspecifico}

INSTRUÇÕES ADICIONAIS:
1. IDENTIFICAÇÃO DO CARÁTER: Identifique se o documento é pedagógico (Orientação/Vistoria) ou punitivo (Auto de Infração/Intimação).
2. EXTRAÇÃO DE PRAZOS: Se punitivo, extraia obrigatoriamente o prazo de defesa/regularização.

Responda SOMENTE com um objeto JSON válido:
{
  "resumoExecutivo": "Resumo geral destacando o caráter pedagógico ou punitivo",
  "caracterDocumento": "PEDAGOGICO | PUNITIVO",
  "prazoDefesa": "string",
  "scoreGeral": 0,
  "estadoAnalisado": "${uf}",
  "legislacaoAplicada": ["liste aqui as normas usadas"],
  "fases": [
    {
      "id": 1,
      "nome": "Infraestrutura (Execução Técnica)",
      "icone": "building",
      "temPendencia": true,
      "solucoes": [
        {
          "problema": "Descrição clara do problema",
          "baseLegal": "Norma específica",
          "5w2h": {
            "o_que": "Ação corretiva",
            "por_que": "Base legal detalhada",
            "quem": "Responsável",
            "quando": "Prazo",
            "onde": "Onde executar",
            "como_vertos": "Passo a passo no Vertos",
            "como_externo": "Ação externa",
            "investimento": {
              "taxas": "R$ 0,00",
              "honorarios": "R$ 0,00",
              "total": "R$ 0,00",
              "obs": "Discriminação dos custos"
            }
          }
        }
      ]
    },
    { "id": 2, "nome": "Gestão de Suprimentos (Logística)", "icone": "package", "temPendencia": false, "solucoes": [] },
    { "id": 3, "nome": "Burocracia e Documentação", "icone": "file-text", "temPendencia": false, "solucoes": [] },
    { "id": 4, "nome": "Equipe e Capacitação", "icone": "users", "temPendencia": false, "solucoes": [] },
    { "id": 5, "nome": "Relacionamento e Comunicação", "icone": "message-circle", "temPendencia": false, "solucoes": [] }
  ]
}
`;

    const result = await modelIA.generateContent(prompt + `\n\nDocumento para análise:\n${texto}`);
    const raw = result.response.text();

    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Nenhum JSON encontrado');

    const data = JSON.parse(jsonMatch[0]);

    const payloadOrdenado = Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {});
    const hash = await gerarHashSHA256(JSON.stringify(payloadOrdenado));
    return { ...data, smartId: gerarSmartID("LEG-AI"), hash, dataProcessamento: new Date().toISOString() };
  } catch (error) {
    console.error("Erro na Análise Legislativa:", error);
    return {
      resumoExecutivo: "Falha ao processar análise legislativa.",
      scoreGeral: 0,
      fases: [],
      erro: true
    };
  }
};

/**
 * 3. INTERPRETADOR DE DOCUMENTOS (Aba Vistorias)
 */
export const interpretarBVO = async (textoBVO, clinicaData, alertas) => {
  try {
    const dadosSeguros = clinicaData || {};
    const alertasSeguros = alertas || [];

    const uf = dadosSeguros.estado || dadosSeguros.uf || 'MS';
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);
    const blocoEspecifico = getTextoDiretrizesEspecificas(dadosSeguros.areaAtuacao);

    const promptCompleto = `
Você é um Auditor Fiscal e Especialista em Compliance Veterinário. 
Analise os dados desta clínica e o documento fornecido para gerar um diagnóstico de conformidade.

DADOS DA CLÍNICA:
${JSON.stringify(dadosSeguros, null, 2)}

DOCUMENTOS E ALERTAS IDENTIFICADOS:
${JSON.stringify(alertasSeguros, null, 2)}

TEXTO DO DOCUMENTO PARA ANÁLISE:
${textoBVO || 'Documento não fornecido'}

${blocoLegislacao}

${getTextoDiretrizesParaPrompt()}

${blocoEspecifico}

INSTRUÇÕES:
1. IDENTIFICAÇÃO DO CARÁTER: Identifique se o documento é pedagógico (Orientação/Vistoria) ou punitivo (Auto de Infração/Intimação).
2. EXTRAÇÃO DE PRAZOS: Se punitivo, extraia obrigatoriamente o prazo de defesa/regularização e a data do documento.
3. Responda SOMENTE com um objeto JSON válido seguindo a estrutura abaixo:

{
  "resumoExecutivo": "Resumo destacando se é pedagógico ou punitivo e as principais exigências",
  "caracterDocumento": "PEDAGOGICO | PUNITIVO",
  "prazoDefesa": "string",
  "scoreGeral": 0,
  "estadoAnalisado": "${uf}",
  "legislacaoAplicada": ["liste aqui as normas usadas na análise"],
  "fases": [
    {
      "id": 1,
      "nome": "Infraestrutura (Execução Técnica)",
      "icone": "building",
      "temPendencia": true,
      "solucoes": [
        {
          "problema": "Descrição clara",
          "baseLegal": "Norma fundamentadora",
          "5w2h": {
            "o_que": "Ação corretiva",
            "por_que": "Obrigatoriedade",
            "quem": "Responsável",
            "quando": "Prazo",
            "onde": "Órgão ou local",
            "como_vertos": "Menu no Vertos",
            "como_externo": "Ação física/documental",
            "investimento": { "taxas": "R$ 0,00", "honorarios": "R$ 0,00", "total": "R$ 0,00", "obs": "" }
          }
        }
      ]
    },
    { "id": 2, "nome": "Gestão de Suprimentos", "icone": "package", "temPendencia": false, "solucoes": [] },
    { "id": 3, "nome": "Burocracia e Documentação", "icone": "file-text", "temPendencia": true, "solucoes": [] },
    { "id": 4, "nome": "Equipe e Capacitação", "icone": "users", "temPendencia": false, "solucoes": [] },
    { "id": 5, "nome": "Relacionamento e Comunicação", "icone": "message-circle", "temPendencia": false, "solucoes": [] }
  ]
}
`;

    const result = await modelIA.generateContent(promptCompleto);
    const raw = result.response.text();

    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON não encontrado');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.fases) throw new Error('Estrutura inválida');

    return parsed;

  } catch (error) {
    console.error("Erro no Interpretador de Documentos:", error);
    return {
      resumoExecutivo: 'Não foi possível processar a análise.',
      scoreGeral: null,
      fases: [
        { id: 1, nome: 'Infraestrutura', icone: 'building', temPendencia: false, solucoes: [] },
        { id: 2, nome: 'Gestão de Suprimentos', icone: 'package', temPendencia: false, solucoes: [] },
        { id: 3, nome: 'Burocracia e Documentação', icone: 'file-text', temPendencia: false, solucoes: [] },
        { id: 4, nome: 'Equipe e Capacitação', icone: 'users', temPendencia: false, solucoes: [] },
        { id: 5, nome: 'Relacionamento e Comunicação', icone: 'message-circle', temPendencia: false, solucoes: [] },
      ],
      erro: true
    };
  }
};

/**
 * 4. PARECER TÉCNICO DE AUDITORIA
 */
export async function gerarParecerAuditoria(dados) {
  try {
    const prompt = `Gere parecer técnico formal para auditoria veterinária.
    Score: ${dados.score}%
    Tipo: ${dados.tipo}
    NC Críticas: ${dados.criticosNC}
    
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
    Tipo: ${tipo}
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
    const prompt = `Analise a situação de vencimentos para ${tipoEstabelecimento}:
    ${JSON.stringify(vencimentos)}
    Responda em JSON com resumo_situacao.`;

    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return { resumo_situacao: "Verificar vencimentos." };
  }
}

/**
 * 7. RESUMO MENSAL CRMV
 */
export async function gerarResumoMensal(dados) {
  try {
    const prompt = `Gere relatório formal de atividades para CRMV:
    ${JSON.stringify(dados)}`;
    const result = await modelIA.generateContent(prompt);
    return result.response.text();
  } catch {
    return "Falha ao gerar resumo.";
  }
}

/**
 * 8. VALIDAÇÃO DE ADMISSÃO
 */
export async function validarAdmissaoPet(pet) {
  try {
    const prompt = `Valide admissão de pet: ${JSON.stringify(pet)}`;
    const result = await modelIA.generateContent(prompt);
    return parseJSONSafe(result.response.text());
  } catch {
    return { status_admissao: "OK" };
  }
}

/**
 * 9. PLANO DE AÇÃO 5W2H COM IA PARA NÃO CONFORMIDADE (NC)
 */
export const gerarPlanoAcaoNC = async (item, tipoEstabelecimento, estado, gravidade) => {
  try {
    const uf = estado || "MS";
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);
    const itemTexto = typeof item === "string" ? item : (item?.pergunta || item?.texto || "Item sanitário não especificado");
    const itemSecao = item?.secaoLabel || item?.secaoId || "Geral";
    
    const prompt = `Você é um Auditor Fiscal Sanitário e Consultor especialista em compliance veterinário e segurança de alimentos.
Gere um Plano de Ação Corretiva estruturado em formato 5W2H para um item de auditoria marcado como NÃO CONFORME (NC).

INFORMAÇÕES DA NÃO CONFORMIDADE:
- Item de Auditoria: "${itemTexto}"
- Setor/Seção: "${itemSecao}"
- Gravidade da Ocorrência: "${gravidade || 'Moderada'}"
- Tipo de Estabelecimento: "${tipoEstabelecimento || 'Clínica Veterinária'}"
- UF do Estabelecimento: "${uf}"

CONTEXTO DE LEGISLAÇÃO LOCAL APLICÁVEL:
${blocoLegislacao}

Você deve gerar a ação corretiva com base nas resoluções vigentes do CFMV, ANVISA e legislação sanitária local aplicável.

Responda OBRIGATORIAMENTE em formato JSON válido com o seguinte esquema (sem marcações markdown, apenas o JSON bruto):
{
  "what": "O que deve ser feito (descrição clara e direta da ação corretiva para sanar a irregularidade)",
  "why": "Por que deve ser feito (justificativa técnica detalhada citando a base legal exata aplicável do CFMV/ANVISA/MAPA)",
  "who": "Quem deve fazer (quem é o agente ou cargo responsável pela execução, ex: Responsável Técnico, Auxiliar, Administrador)",
  "where": "Onde deve ser feito (local ou setor físico específico)",
  "when": "Quando deve ser concluído (prazo sugerido em dias ou data aproximada, ex: 'Imediato', '3 dias', '15 dias')",
  "how": "Como deve ser feito (método passo a passo detalhado para executar a correção de forma definitiva)",
  "howMuch": "Quanto custará (estimativa financeira ou 'Sem Custo' se envolver apenas procedimentos operacionais)"
}
`;

    const result = await modelIA.generateContent(prompt);
    const text = result.response.text();
    const data = parseJSONSafe(text);
    if (!data || !data.what) throw new Error("JSON inválido retornado pela IA");
    return data;
  } catch (error) {
    console.error("Erro ao gerar plano de ação via IA:", error);
    
    // Fallback estático e estruturado para garantir estabilidade absoluta!
    const prazosPorGravidade = {
      Leve: "15 dias",
      Moderada: "7 dias",
      Grave: "Imediato"
    };
    
    const itemTexto = typeof item === "string" ? item : (item?.pergunta || item?.texto || "Item sanitário");
    const itemSecao = item?.secaoLabel || item?.secaoId || "Setor Operacional";
    
    return {
      what: `Corrigir desvio técnico observado no item: "${itemTexto}"`,
      why: "Garantir conformidade com as normas sanitárias vigentes (RDC ANVISA 222/2018 e Resoluções CFMV/CRMVs) para mitigar riscos de autuações e multas por desvio operacional.",
      who: "Responsável Técnico (RT)",
      where: itemSecao,
      when: prazosPorGravidade[gravidade] || "7 dias",
      how: "1. Realizar inspeção minuciosa no setor apontado;\n2. Elaborar ou revisar o Procedimento Operacional Padrão (POP) aplicável;\n3. Treinar os colaboradores da área;\n4. Registrar a data de regularização e arquivar evidências de correção.",
      howMuch: "Sem Custo Adicional (Procedimento Interno)"
    };
  }
};
