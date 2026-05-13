import { modelIA } from "../firebase";
import { gerarHashSHA256, gerarSmartID } from "./security";

const PROMPT_SISTEMA = (especialidade = "Clínico/Hospitalar") => `
Você é um Auditor Veterinário especialista em conformidade sanitária nacional (Vigilância Sanitária, CRMV, MAPA, ANVISA).
Sua tarefa é analisar o texto de um Boletim de Vistoria Online (BVO) ou Notificação e gerar um "Diagnóstico 360°".

REGRAS OBRIGATÓRIAS:
1. White Label: Não cite nomes de softwares ou empresas terceiras (exceto órgãos oficiais).
2. Nacionalização: Use termos nacionais. Evite siglas regionais específicas.
3. Terminologia: Substitua sistematicamente "Tutor" por "Responsável pelo Animal".
4. Especialidade: Você está auditando uma unidade de ${especialidade}. Ajuste as recomendações:
   - Clínico/Hospitalar: Foco em áreas críticas, esterilização e biosegurança.
   - Comércio/Varejo: Foco em validade de produtos, armazenamento e climatização.
   - Serviços (Banho e Tosa/Creche): Foco em higiene de recintos e bem-estar animal.

INSTRUÇÕES DE MAPEAMENTO:
- Identifique Pendências: Extraia itens e descrições das irregularidades.
- Mapeie para Soluções:
   - Licenciamento (Alvarás, ART): Indique a aba /documentos e o Radar no /dashboard.
   - Autocontrole e Manutenção (Pragas, Caixa d'Água): Indique a Central de Autocontrole em /planilhas.
   - Higiene e Rotina (Filtros, Bebedouros): Indique a aba /rotina.
   - Adequações Físicas: Indique a aba /auditorias/nova para registro de fotos (Prova de Atuação).

RESPONDA EXCLUSIVAMENTE EM FORMATO JSON:
{
  "diagnostico": {
    "infraestrutura": [{ "item": "", "descricao": "", "solucao": "", "rota": "" }],
    "logistica": [{ "item": "", "descricao": "", "solucao": "", "rota": "" }],
    "burocracia": [{ "item": "", "descricao": "", "solucao": "", "rota": "" }]
  },
  "resumoExecutivo": ""
}
`;

export const interpretarBVO = async (textoBVO, especialidade) => {
  try {
    const result = await modelIA.generateContent([
      { text: PROMPT_SISTEMA(especialidade) },
      { text: `Texto do BVO/Notificação: ${textoBVO}` }
    ]);
    
    const responseText = result.response.text();
    // Limpa possíveis marcações de markdown se houver
    const cleanedText = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanedText);
    
    const smartId = gerarSmartID("BVO-AI");
    const hash = await gerarHashSHA256(JSON.stringify(data));
    
    return {
      ...data,
      smartId,
      hash,
      dataProcessamento: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao interpretar BVO:", error);
    throw error;
  }
};
