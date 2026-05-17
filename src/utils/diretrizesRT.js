/**
 * VERTOS OS — Diretrizes de Atuação RT (2023/2024)
 * Baseado na 1ª Edição das Diretrizes de Atuação do RT e Manual Nacional de Fiscalização do CFMV.
 */

export const DIRETRIZES_RT = {
  meta: {
    versao: "2.5.0",
    edicao: "Dezembro 2023 / Atualizado Maio 2024",
    compatibilidade: "VERTOS OS - Módulo Compliance / Auditoria Inteligente"
  },

  orgaos_fiscalizadores: {
    CRMV: {
      nome_oficial: "Conselho Regional de Medicina Veterinária",
      documentos_visita_orientacao: [
        "Termo de Fiscalização"
      ],
      documentos_infracao_penalidade: [
        "Auto de Infração (AI)",
        "Auto de Multa",
        "Termo de Constatação"
      ]
    },
    MAPA: {
      nome_oficial: "Ministério da Agricultura e Pecuária",
      documentos_visita_orientacao: [
        "Termo de Fiscalização",
        "Termo de Colheita de Amostra"
      ],
      documentos_infracao_penalidade: [
        "Auto de Infração",
        "Termo de Apreensão",
        "Termo de Interdição"
      ]
    },
    VISA: {
      nome_oficial: "Vigilância Sanitária (VISA/ANVISA)",
      documentos_visita_orientacao: [
        "Boletim de Vistoria e Orientação (BVO)",
        "Vistoria",
        "Inspeção"
      ],
      documentos_infracao_penalidade: [
        "Auto de Infração Sanitária",
        "Termo de Intimação",
        "Termo de Suspensão",
        "Termo de Interdição"
      ]
    }
  },

  alertas_sistema: {
    prazo_defesa: "Atenção IA: Em todos os documentos classificados como 'documentos_infracao_penalidade', é OBRIGATÓRIO extrair a data do documento e o prazo concedido pelo órgão (geralmente de 20 a 30 dias) para protocolar defesa ou regularização."
  },

  diretrizes_rt_cfmv: {
    estabelecimentos_veterinarios: {
      nome: "Estabelecimentos Veterinários (Clínicas, Hospitais, Consultórios)",
      documentos_suportados: [
        "Boletim de Vistoria e Orientação (BVO) - VISA",
        "Termo de Intimação / Auto de Infração Sanitária - VISA",
        "Termo de Fiscalização / Auto de Infração / Termo de Constatação - CRMV",
        "Auto de Infração Ambiental (PGRSS)",
        "Relatório Informativo do RT ao CRMV"
      ],
      foco_auditoria: [
        "Classificação correta do estabelecimento (Consultório, Clínica, Hospital)",
        "Estrutura física exigida pelo Manual Nacional de Fiscalização (fluxograma, isolamento de infecto-contagiosos, geladeira de óbitos)",
        "Gestão de prontuários, termos de consentimento e documentação de óbito",
        "Controle de medicamentos sujeitos a controle especial (SIPEAGRO/SNGPC)",
        "Equipamentos obrigatórios por tipologia (Resolução CFMV 1275/2019)"
      ],
      contexto_prompt: "Atue como Auditor Fiscal e Especialista em Compliance. Identifique primeiro se o documento é de caráter pedagógico (Orientação/Vistoria) ou punitivo (Auto de Infração/Intimação). Utilize as Diretrizes de RT em Estabelecimentos Veterinários do CFMV e o Manual Nacional de Fiscalização. Foco rigoroso na separação de ambientes, protocolos anestésicos, internação, descarte de perfurocortantes (PGRSS) e prazos de defesa."
    },
    produtos_origem_animal: {
      nome: "Produtos de Origem Animal (POA)",
      documentos_suportados: [
        "Termo de Fiscalização / Termo de Colheita de Amostra - MAPA/SIF/SIE/SIM",
        "Auto de Infração / Termo de Apreensão ou Interdição - MAPA",
        "Notificação de Recall / Alerta Sanitário",
        "Laudo de Análise Fiscal (Laboratorial) com Não Conformidade"
      ],
      foco_auditoria: [
        "Programas de Autocontrole (PACs, BPF, PPHO, APPCC)",
        "Rastreabilidade, controle de qualidade e recall de lotes",
        "Bem-estar animal no abate e transporte",
        "Controle rigoroso de temperatura e cadeia de frio"
      ],
      contexto_prompt: "Atue como Auditor Fiscal de Qualidade. Identifique se trata de Fiscalização de Rotina ou Auto de Infração/Interdição. Utilize as Diretrizes de RT em POA do CFMV. Analise não conformidades baseando-se no RIISPOA e legislações do MAPA, focando na inocuidade alimentar, prazos recursais e garantia dos programas de autocontrole."
    },
    laboratorios: {
      nome: "Laboratórios Clínicos de Diagnóstico Veterinário",
      documentos_suportados: [
        "Termo de Constatação / Termo de Fiscalização - CRMV",
        "Boletim de Vistoria e Orientação (BVO) / Termo de Intimação - VISA",
        "Certificado de Proficiência/Controle de Qualidade",
        "Notificação de Descarte de Resíduos Químicos/Biológicos"
      ],
      foco_auditoria: [
        "Controle de Qualidade Interno (CQI) e Externo (CQE)",
        "Calibração, manutenção e registro de equipamentos",
        "Rastreabilidade de amostras e laudos (assinatura e carimbo do RT)",
        "Biossegurança e descarte de resíduos do grupo B (químicos) e A (biológicos)"
      ],
      contexto_prompt: "Atue como Auditor de Qualidade Laboratorial. Utilize as Diretrizes de RT em Laboratórios do CFMV. Identifique se há infração ou apenas vistoria. O foco da análise deve ser a rastreabilidade da amostra, validação metodológica, biossegurança e prazos para regularização de não conformidades."
    },
    comercio_servicos: {
      nome: "Comércio e Serviços para Animais (Pet Shops, Estética, Creches)",
      documentos_suportados: [
        "Termo de Fiscalização / Auto de Infração - CRMV",
        "Boletim de Vistoria e Orientação (BVO) - VISA",
        "Notificação PROCON (Defesa do Consumidor)",
        "Denúncia de Maus-Tratos (Polícia Ambiental / Ministério Público)"
      ],
      foco_auditoria: [
        "Boas práticas de banho e tosa (prevenção de acidentes, fugas e óbitos)",
        "Comércio de medicamentos (venda sob prescrição, controle de temperatura)",
        "Instalações, alojamento, enriquecimento ambiental e bem-estar (creches, hotéis)",
        "Venda de animais vivos (documentação, origem, vacinação, estrutura de exposição)"
      ],
      contexto_prompt: "Atue como Especialista em Compliance de Varejo Pet. Utilize as Diretrizes de RT em Comércio e Serviços do CFMV. Se for Notificação do PROCON ou Auto de Infração, destaque prazos urgentes de defesa. Analise riscos relacionados ao bem-estar animal, zoonoses, e comércio irregular."
    },
    manejo_populacional: {
      nome: "Manejo Populacional (Mutirões, Castramóveis, ONGs)",
      documentos_suportados: [
        "Termo de Fiscalização / Termo de Constatação - CRMV",
        "Notificação do Ministério Público / Termo de Ajustamento de Conduta (TAC)",
        "Laudo de Vistoria de Unidade Móvel (Castramóvel)",
        "Parecer Técnico de Prefeitura / Vigilância Ambiental"
      ],
      foco_auditoria: [
        "Aprovação prévia do projeto de manejo no CRMV regional",
        "Estrutura mínima exigida (área de triagem, preparo, cirurgia, recuperação)",
        "Protocolos anestésicos compatíveis e analgesia pós-operatória",
        "Destinação legal de resíduos biológicos do evento",
        "Microchipagem e cadastro em banco de dados"
      ],
      contexto_prompt: "Atue como Especialista em Medicina Veterinária do Coletivo. Utilize as Diretrizes de RT em Manejo Populacional do CFMV. Se o documento for um Termo de Ajustamento de Conduta (TAC) ou Termo de Constatação, destaque os prazos críticos e sanções. Avalie a estrutura do centro cirúrgico (móvel ou provisório)."
    }
  }
};

/**
 * Retorna o bloco de diretrizes formatado para o prompt da IA.
 */
export function getTextoDiretrizesParaPrompt() {
  return `
DIRETRIZES DE ATUAÇÃO RT (Sistema CFMV/CRMVs - 2024):
${JSON.stringify(DIRETRIZES_RT.alertas_sistema)}

CLASSIFICAÇÃO DE DOCUMENTOS POR ÓRGÃO:
${JSON.stringify(DIRETRIZES_RT.orgaos_fiscalizadores, null, 2)}
`;
}

/**
 * Retorna o contexto específico de acordo com a área de atuação da clínica.
 */
export function getTextoDiretrizesEspecificas(areaId) {
  // Mapeamento de IDs do sistema para chaves do JSON de diretrizes
  const map = {
    // Mapeamento de tipos do sistema para chaves das diretrizes
    'clinica': 'estabelecimentos_veterinarios',
    'hospital': 'estabelecimentos_veterinarios',
    'consultorio': 'estabelecimentos_veterinarios',
    'CLINICA': 'estabelecimentos_veterinarios',
    
    'acougue': 'produtos_origem_animal',
    'laticinio': 'produtos_origem_animal',
    'industria_poa': 'produtos_origem_animal',
    'entreposto_poa': 'produtos_origem_animal',
    'POA': 'produtos_origem_animal',
    
    'laboratorio': 'laboratorios',
    'posto_coleta': 'laboratorios',
    'LAB': 'laboratorios',
    
    'petshop': 'comercio_servicos',
    'estetica': 'comercio_servicos',
    'creche_hotel': 'comercio_servicos',
    'creche': 'comercio_servicos',
    'hotel': 'comercio_servicos',
    'PET': 'comercio_servicos',
    
    'manejo': 'manejo_populacional',
    'mutirao': 'manejo_populacional',
    'MANEJO': 'manejo_populacional'
  };

  const key = map[areaId] || areaId;
  const diretriz = DIRETRIZES_RT.diretrizes_rt_cfmv[key];
  if (!diretriz) return "";

  return `
CONTEXTO ESPECÍFICO (${diretriz.nome}):
- Foco da Auditoria: ${diretriz.foco_auditoria.join(", ")}
- Documentos Suportados: ${diretriz.documentos_suportados.join(", ")}
- Instrução Adicional: ${diretriz.contexto_prompt}
`;
}
