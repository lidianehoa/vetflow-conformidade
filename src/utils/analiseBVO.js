// src/utils/analiseBVO.js
import { modelIA } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";

const PROMPT_ANALISE_VISTORIA = (orgao, dataVistoria) => `
Você é um Auditor Veterinário especialista em compliance sanitário. Analise o texto de um Boletim de Vistoria
Oficial emitido em ${dataVistoria || "data não informada"} pelo órgão: ${orgao || "Vigilância Sanitária"}.

REGRAS OBRIGATÓRIAS:
1. Extraia TODOS os itens de exigência numerados no documento
2. Classifique cada item em uma das categorias: DOCUMENTAÇÃO, INFRAESTRUTURA, HIGIENE_ROTINA, COLABORADORES, CONTROLE_PRAGAS, LICENCIAMENTO
3. Defina prioridade: URGENTE (licenças, documentos que bloqueiam funcionamento), ALTA (infraestrutura, pragas), MEDIA (higiene, rotina), BAIXA (melhorias gerais)
4. Sugira a rota do VERTOS OS para cada item quando aplicável:
   - Licenças/Alvarás → /documentacao
   - Controle de Pragas → /auditorias
   - Higiene/Rotina → /rotina
   - Documentos → /documentacao
5. Estime o custo aproximado: SEM_CUSTO, BAIXO (< R$500), MEDIO (R$500-2000), ALTO (> R$2000)
6. Determine se o item pode ser resolvido DENTRO ou FORA do sistema VERTOS OS

RESPONDA EXCLUSIVAMENTE EM JSON VÁLIDO (sem markdown, sem backticks):
{
  "resumoExecutivo": "string — análise geral em 2 frases",
  "orgaoEmissor": "string",
  "dataVistoria": "string",
  "prazo": "string — ex: 30 dias",
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

export const analisarVistoria = async (textoVistoria, orgao, dataVistoria) => {
  const result = await modelIA.generateContent([
    { text: PROMPT_ANALISE_VISTORIA(orgao, dataVistoria) },
    { text: `Texto completo do Boletim de Vistoria:\n\n${textoVistoria}` }
  ]);

  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  const data = JSON.parse(clean);

  const smartId = gerarSmartID("VIST-AI");
  const hash = await gerarHashSHA256(JSON.stringify(data));

  return { ...data, smartId, hash, dataProcessamento: new Date().toISOString() };
};
