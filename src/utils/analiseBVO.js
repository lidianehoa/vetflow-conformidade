import { modelIA } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";
import { getTextoLegislacaoParaPrompt } from "./legislacaoEstadual";
import { getTextoDiretrizesParaPrompt } from "./diretrizesRT";

const PROMPT_ANALISE_VISTORIA = (orgao, dataVistoria) => `
Você é um Auditor Veterinário especialista em compliance sanitário. Analise o texto de um documento emitido durante vistorias e fiscalizações.
Órgão informado: ${orgao || "Vigilância Sanitária"}.
Data da vistoria informada: ${dataVistoria || "data não informada"}.

REGRAS OBRIGATÓRIAS:
1. IDENTIFICAÇÃO DO CARÁTER: Identifique primeiro se o documento é de caráter pedagógico (Orientação/Vistoria) ou punitivo (Auto de Infração/Intimação/Multa).
2. EXTRAÇÃO DE PRAZOS: Em todos os documentos classificados como 'punitivo', é OBRIGATÓRIO extrair a data do documento e o prazo concedido pelo órgão (geralmente de 20 a 30 dias) para protocolar defesa ou regularização.
3. Extraia TODOS os itens de exigência numerados no documento.
4. Classifique cada item em uma das categorias: DOCUMENTAÇÃO, INFRAESTRUTURA, HIGIENE_ROTINA, COLABORADORES, CONTROLE_PRAGAS, LICENCIAMENTO.
5. Defina prioridade: URGENTE (licenças, documentos que bloqueiam funcionamento, infrações punitivas), ALTA (infraestrutura, pragas), MEDIA (higiene, rotina), BAIXA (melhorias gerais).
6. Sugira a rota do VERTOS OS para cada item quando aplicável.

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO:
{
  "resumoExecutivo": "string — análise geral destacando se é pedagógico ou punitivo",
  "caracterDocumento": "PEDAGOGICO | PUNITIVO",
  "orgaoEmissor": "string",
  "dataVistoria": "string",
  "prazoDefesaRegularizacao": "string — ex: 20 dias, 30 dias (OBRIGATÓRIO se punitivo)",
  "totalItens": number,
  "itens": [
    {
      "numero": number,
      "descricao": "string",
      "categoria": "DOCUMENTACAO|INFRAESTRUTURA|HIGIENE_ROTINA|COLABORADORES|CONTROLE_PRAGAS|LICENCIAMENTO",
      "prioridade": "URGENTE|ALTA|MEDIA|BAIXA",
      "custoEstimado": "SEM_CUSTO|BAIXO|MEDIO|ALTO",
      "resolvidoNoSistema": boolean,
      "rotaVertos": "string|null",
      "prazoItem": "string — ex: Imediato, 7 dias, 30 dias",
      "responsavel": "string — ex: RT, Gestor, Empresa terceirizada"
    }
  ],
  "planoAcao": {
    "documentacaoInterna": [
      { "acao": "string", "itensRelacionados": [number], "prazo": "string", "onde": "string" }
    ],
    "acoesExternas": [
      { "acao": "string", "itensRelacionados": [number], "prazo": "string", "responsavel": "string", "custoEstimado": "string" }
    ],
    "acoesNoSistema": [
      { "acao": "string", "rota": "string", "itensRelacionados": [number] }
    ]
  }
}
`;

export const analisarVistoria = async (textoVistoria, orgao, dataVistoria, estado) => {
  try {
    const uf = estado || "MS";
    const blocoLegislacao = getTextoLegislacaoParaPrompt(uf);

    const promptCompleto = `${PROMPT_ANALISE_VISTORIA(orgao, dataVistoria)}

${blocoLegislacao}

${getTextoDiretrizesParaPrompt()}

Texto completo do documento:

${textoVistoria}`;

    const result = await modelIA.generateContent(promptCompleto);
    const raw = result.response.text();

    const clean = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Nenhum JSON encontrado na resposta da IA');

    const data = JSON.parse(jsonMatch[0]);

    const smartId = gerarSmartID("VIST-AI");
    const hash = await gerarHashSHA256(JSON.stringify(data));

    return { ...data, smartId, hash, dataProcessamento: new Date().toISOString() };

  } catch (error) {
    console.error("Erro ao analisar documento de vistoria:", error);
    return {
      resumoExecutivo: "Não foi possível processar o documento. Verifique o texto e tente novamente.",
      caracterDocumento: "DESCONHECIDO",
      orgaoEmissor: orgao || "Não identificado",
      dataVistoria: dataVistoria || "Não informada",
      prazoDefesaRegularizacao: "Verificar no documento original",
      totalItens: 0,
      itens: [],
      planoAcao: {
        documentacaoInterna: [],
        acoesExternas: [],
        acoesNoSistema: []
      },
      smartId: gerarSmartID("VIST-AI"),
      hash: null,
      dataProcessamento: new Date().toISOString(),
      erro: true
    };
  }
};
