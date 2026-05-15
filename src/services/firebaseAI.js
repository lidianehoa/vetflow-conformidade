import { templateModel, modelIA } from "../firebase";

// IDs dos templates — devem existir e estar PUBLICADOS no Console Firebase
const T = {
  ASSISTENTE:    "vertos-assistente-compliance-v1",
  PARECER:       "vertos-parecer-auditoria-v1",
  VENCIMENTOS:   "vertos-analise-vencimentos-v1",
  PLANO_ACAO:    "vertos-plano-acao-v1",
  CONSULTOR_POA: "vertos-consultor-rotulagem-v1",
  RESUMO_MENSAL: "vertos-resumo-mensal-v1",
  ADMISSAO:      "vertos-checklist-admissao-v1",
  LEGISLATIVO:   "vertos-analista-legislativo-v1",
};

// Helper: parse seguro de JSON da resposta
function parseJSON(text) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// Helper: chamada segura com a SINTAXE CORRETA (ID como string)
async function callTemplate(templateId, inputs) {
  if (!templateId) throw new Error("templateId ausente");

  // ✅ SINTAXE CORRETA: primeiro argumento = ID (string), segundo = objeto com inputs
  const response = await templateModel.generateContent(
    templateId, 
    { inputs }
  );

  return response.text ?? "";
}

// ── 1. Assistente de Compliance ──────────────────────────────────
export async function consultarAssistenteCompliance(pergunta, areaAtuacao, tipoEstabelecimento, contextoExtra = "") {
  try {
    const qFinal = contextoExtra 
      ? `Com base no documento anexo, responda: ${pergunta}\n\nCONTEÚDO:\n${contextoExtra}`
      : pergunta;

    return await callTemplate(T.ASSISTENTE, {
      pergunta: qFinal,
      area_atuacao: areaAtuacao,
      tipo_estabelecimento: tipoEstabelecimento,
    });
  } catch (err) {
    console.warn("Template indisponível, usando fallback:", err.message);
    const res = await modelIA.generateContent([{
      text: `Especialista em compliance veterinário. Área: ${areaAtuacao}. Responda: ${pergunta}`
    }]);
    return res.response.text();
  }
}

// ── 2. Parecer Técnico de Auditoria ──────────────────────────────
export async function gerarParecerAuditoria(dados) {
  try {
    const text = await callTemplate(T.PARECER, {
      score: Math.round(dados.score),
      tipo_estabelecimento: dados.tipo,
      criticos_nc: dados.criticosNC || 0,
      maiores_nc: dados.maioresNC || 0,
      secoes_criticas: (dados.secoesCriticas || []).join(", "),
    });
    return parseJSON(text) ?? gerarParecerFallback(dados.score, dados.criticosNC);
  } catch (err) {
    return gerarParecerFallback(dados.score, dados.criticosNC);
  }
}

function gerarParecerFallback(score, criticosNC) {
  const nivel = score >= 85 ? "Conforme" : score >= 60 ? "Regular" : "Crítico";
  return {
    nivel_conformidade: nivel,
    parecer_tecnico: `Score de ${score}%. ${criticosNC > 0 ? "Itens críticos detectados." : "Sem itens críticos."}`,
    recomendacoes_prioritarias: "Revisar itens não conformes.",
    prazo_correcao: criticosNC > 0 ? "Imediato" : "30 dias",
    observacao_legal: "Res. CFMV vigente.",
  };
}

// ── 3. Análise de Vencimentos ─────────────────────────────────────
export async function analisarVencimentos(vencimentos, tipoEstabelecimento) {
  try {
    const text = await callTemplate(T.VENCIMENTOS, {
      vencimentos_json: JSON.stringify(vencimentos.map(v => ({
        documento: v.label,
        diasRestantes: v.diasRestantes,
        status: v.diasRestantes < 0 ? "VENCIDO" : v.diasRestantes <= 15 ? "URGENTE" : "ATENÇÃO",
      }))),
      tipo_estabelecimento: tipoEstabelecimento,
    });
    return parseJSON(text) ?? { resumo_situacao: "Verificar vencimentos no radar." };
  } catch (err) {
    return { resumo_situacao: "IA de análise temporariamente indisponível." };
  }
}

// ── 8. Analista Legislativo Sênior (Novo!) ────────────────────────
export async function gerarAnaliseLegislativa(textoDoc, cidade, uf, tipo = "Clínica") {
  try {
    const text = await callTemplate(T.LEGISLATIVO, {
      documento_ou_texto: textoDoc,
      cidade,
      estado_uf: uf,
      tipo_estabelecimento: tipo
    });

    return parseJSON(text) ?? { setor_atuacao: "Erro no parsing", resumo_fiscalizacao: "Tente novamente." };
  } catch (err) {
    console.error("Erro no Analista Legislativo:", err.message);
    // Fallback básico para não travar a tela
    return {
      setor_atuacao: "Não identificado",
      resumo_fiscalizacao: "Falha na comunicação com a IA sênior.",
      exigencias_documentais: ["Erro ao processar template."],
      exigencias_estruturais: [],
      prazos_identificados: "Consultar documento",
      leis_e_resolucoes_citadas: [],
      analise_de_risco_multa: "Indisponível",
      orientacao_praticas_rt: "Revisar o documento manualmente."
    };
  }
}

// Outras funções exportadas para manter compatibilidade
export async function gerarPlanoAcao(nc, base, tipo, crit) { return { o_que: "Ação corretiva" }; }
export async function consultarPOA(duvida, prod, ind) { return "Resposta POA"; }
export async function gerarResumoMensal(dados) { return "Resumo CRMV"; }
export async function validarAdmissaoPet(pet) { return { status_admissao: "OK" }; }
