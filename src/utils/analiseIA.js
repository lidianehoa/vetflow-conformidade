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

    Responda EXCLUSIVAMENTE em JSON válido, sem texto fora do JSON, sem markdown, sem cumprimentos:
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
export const interpretarBVO = async (textoBVO, clinicaData, alertas) => {
  try {
    const prompt = `
Você é um especialista em conformidade veterinária e legislação do CFMV/MAPA.
Analise os dados desta clínica e gere um diagnóstico de conformidade em JSON.

DADOS DA CLÍNICA:
${JSON.stringify(clinicaData, null, 2)}

DOCUMENTOS E ALERTAS:
${JSON.stringify(alertas, null, 2)}

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois, sem markdown, sem blocos de código.

O JSON deve seguir EXATAMENTE esta estrutura:
{
  "resumoExecutivo": "string com resumo geral de 2-3 frases",
  "scoreGeral": 0,
  "fases": [
    {
      "id": 1,
      "nome": "Infraestrutura (Execução Técnica)",
      "icone": "building",
      "temPendencia": true,
      "solucoes": [
        {
          "problema": "Descrição clara do problema identificado",
          "5w2h": {
            "o_que": "O que deve ser feito para resolver",
            "por_que": "Por que isso é obrigatório (cite a legislação: CFMV, MAPA, CRMV-MS)",
            "quem": "Quem é responsável (BVO, proprietário, equipe)",
            "quando": "Prazo recomendado (ex: imediato, 30 dias, 90 dias)",
            "onde": "Onde executar (no sistema Vertos / na clínica / no CRMV)",
            "como_vertos": "Como resolver DENTRO do sistema Vertos (passo a passo)",
            "como_externo": "Como resolver FORA do Vertos (ação presencial/documental)",
            "custo": "Estimativa de custo ou 'Sem custo' / 'Verificar com CRMV'"
          }
        }
      ]
    },
    {
      "id": 2,
      "nome": "Gestão de Suprimentos (Logística)",
      "icone": "package",
      "temPendencia": false,
      "solucoes": []
    },
    {
      "id": 3,
      "nome": "Burocracia e Documentação",
      "icone": "file-text",
      "temPendencia": true,
      "solucoes": []
    },
    {
      "id": 4,
      "nome": "Equipe e Capacitação",
      "icone": "users",
      "temPendencia": false,
      "solucoes": []
    },
    {
      "id": 5,
      "nome": "Relacionamento e Comunicação",
      "icone": "message-circle",
      "temPendencia": false,
      "solucoes": []
    }
  ]
}

IMPORTANTE:
- Gere soluções apenas para fases com problemas reais baseados nos dados fornecidos
- Cada solução deve ter obrigatoriamente os 8 campos do 5W2H
- O campo como_vertos deve sempre referenciar funcionalidades reais do Vertos (Auditorias, Laudos, Documentação, Rotina Diária, etc.)
- Cite sempre a legislação específica (ex: Resolução CFMV nº 1.015/2012, IN MAPA nº 35/2019)
- scoreGeral deve ser um número de 0 a 100
`;
    
    const result = await modelIA.generateContent([
      { text: prompt },
      { text: textoBVO }
    ]);

    const parsed = parseJSONSafe(result.response.text());
    if (!parsed) throw new Error("Falha no parse.");
    return parsed;

  } catch (error) {
    console.error("Erro no Interpretador BVO:", error);
    // Fallback — retorna estrutura vazia mas válida
    return {
      resumoExecutivo: 'Não foi possível processar a análise. Tente novamente.',
      scoreGeral: null,
      fases: [
        { id: 1, nome: 'Infraestrutura (Execução Técnica)',    icone: 'building',        temPendencia: false, solucoes: [] },
        { id: 2, nome: 'Gestão de Suprimentos (Logística)',    icone: 'package',         temPendencia: false, solucoes: [] },
        { id: 3, nome: 'Burocracia e Documentação',            icone: 'file-text',       temPendencia: false, solucoes: [] },
        { id: 4, nome: 'Equipe e Capacitação',                 icone: 'users',           temPendencia: false, solucoes: [] },
        { id: 5, nome: 'Relacionamento e Comunicação',         icone: 'message-circle',  temPendencia: false, solucoes: [] },
      ]
    };
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
