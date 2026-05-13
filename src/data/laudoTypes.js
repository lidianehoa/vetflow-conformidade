/**
 * Catálogo de Tipos de Laudo – VERTOS OS
 * Ref.: Resoluções CFMV, IN MAPA 161/2022 e Normas ICP-Brasil
 */

export const LAUDO_SISTEMA = {
  versao: "1.0.0",
  retencao_minima_anos: 5,
  status_possiveis: ["rascunho", "em_revisao", "assinado", "emitido", "cancelado"],
  resultado_possiveis: ["aprovado", "aprovado_com_ressalva", "reprovado", "inconclusivo", "nao_aplicavel"]
};

export const TIPOS_LAUDO = [
  {
    id: "LAU_CLI",
    prefixo: "CLI",
    nome: "Laudo Clínico",
    descricao: "Documento técnico emitido após atendimento veterinário com diagnóstico, evolução e conduta terapêutica.",
    area_atuacao: ["pequenos_animais"],
    legislacao: "Resolução CFMV nº 1138/2016",
    campos_conteudo: [
      { campo: "numero_prontuario", label: "Nº do Prontuário", tipo: "text", obrigatorio: true },
      { campo: "nome_animal", label: "Nome do Animal", tipo: "text", obrigatorio: true },
      { campo: "especie", label: "Espécie", tipo: "select", opcoes: ["Cão", "Gato", "Ave", "Réptil", "Roedor", "Outro"], obrigatorio: true },
      { campo: "raca", label: "Raça", tipo: "text", obrigatorio: false },
      { campo: "peso_kg", label: "Peso (kg)", tipo: "number", obrigatorio: true },
      { campo: "tutor_nome", label: "Nome do Responsável pelo Animal", tipo: "text", obrigatorio: true },
      { campo: "queixa_principal", label: "Queixa Principal", tipo: "textarea", obrigatorio: true },
      { campo: "exame_fisico", label: "Exame Físico", tipo: "textarea", obrigatorio: true },
      { campo: "hipotese_diagnostica", label: "Hipótese Diagnóstica", tipo: "textarea", obrigatorio: true },
      { campo: "tratamento_instituido", label: "Tratamento Instituído", tipo: "textarea", obrigatorio: true },
      { campo: "prognostico", label: "Prognóstico", tipo: "select", opcoes: ["Favorável", "Reservado", "Desfavorável", "Grave"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_POS_CIR",
    prefixo: "CIR",
    nome: "Laudo Pós-Cirúrgico",
    descricao: "Documento técnico descrevendo o procedimento cirúrgico realizado, achados intraoperatórios e cuidados pós-operatórios.",
    area_atuacao: ["pequenos_animais"],
    legislacao: "Resolução CFMV nº 1138/2016",
    campos_conteudo: [
      { campo: "numero_prontuario", label: "Nº do Prontuário", tipo: "text", obrigatorio: true },
      { campo: "nome_animal", label: "Nome do Animal", tipo: "text", obrigatorio: true },
      { campo: "data_procedimento", label: "Data do Procedimento", tipo: "date", obrigatorio: true },
      { campo: "procedimento_realizado", label: "Procedimento Realizado", tipo: "textarea", obrigatorio: true },
      { campo: "achados_intraoperatorios", label: "Achados Intraoperatórios", tipo: "textarea", obrigatorio: true },
      { campo: "condicao_pos_op", label: "Condição Pós-Operatória", tipo: "select", opcoes: ["Estável", "Instável", "Crítico", "Óbito"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_NECROPSIA",
    prefixo: "NEC",
    nome: "Laudo de Necropsia",
    descricao: "Relatório técnico dos achados macroscópicos e histopatológicos do exame post-mortem.",
    area_atuacao: ["pequenos_animais", "producao_rural", "areas_especiais"],
    legislacao: "Resolução CFMV nº 1138/2016",
    campos_conteudo: [
      { campo: "identificacao_animal", label: "Identificação do Animal", tipo: "text", obrigatorio: true },
      { campo: "data_obito", label: "Data do Óbito", tipo: "date", obrigatorio: true },
      { campo: "data_necropsia", label: "Data da Necropsia", tipo: "date", obrigatorio: true },
      { campo: "achados_macroscopicos", label: "Achados Macroscópicos", tipo: "textarea", obrigatorio: true },
      { campo: "causa_mortis", label: "Causa Mortis", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_INSPECAO_PAC",
    prefixo: "INS",
    nome: "Laudo de Verificação de PACs",
    descricao: "Relatório mensal do RT consolidando os resultados de verificação dos 13 Programas de Autocontrole.",
    area_atuacao: ["producao_origem_animal"],
    legislacao: "IN MAPA nº 161/2022",
    campos_conteudo: [
      { campo: "periodo_referencia", label: "Mês/Ano Ref.", tipo: "text", obrigatorio: true },
      { campo: "registro_sif_sie", label: "Registro SIF/SIE", tipo: "text", obrigatorio: true },
      { campo: "pac_status_geral", label: "Status Geral PACs", tipo: "select", opcoes: ["Conforme", "Não Conforme"], obrigatorio: true },
      { campo: "acoes_corretivas", label: "Ações Corretivas Tomadas", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_rt", label: "Parecer Final do RT", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_RECALL",
    prefixo: "RCL",
    nome: "Laudo de Recolhimento (Recall)",
    descricao: "Documento formal que registra o acionamento do plano de recall, lotes afetados e resultado.",
    area_atuacao: ["producao_origem_animal", "industria_alimentos"],
    legislacao: "RDC ANVISA nº 24/2015",
    campos_conteudo: [
      { campo: "data_acionamento", label: "Data Acionamento", tipo: "date", obrigatorio: true },
      { campo: "produto_afetado", label: "Produto", tipo: "text", obrigatorio: true },
      { campo: "lotes_afetados", label: "Lotes", tipo: "textarea", obrigatorio: true },
      { campo: "quantidade_total", label: "Qtd. Total (kg/un)", tipo: "number", obrigatorio: true },
      { campo: "resultado_recall", label: "Resultado", tipo: "select", opcoes: ["Sucesso", "Parcial", "Em andamento"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_CONSOLIDADO_BVO",
    prefixo: "BVO",
    nome: "Relatório Consolidado de Conformidade",
    descricao: "Relatório técnico gerado após a interpretação de BVO/Notificações da Vigilância Sanitária, consolidando o diagnóstico e cronograma de adequação.",
    area_atuacao: ["pequenos_animais", "banho_e_tosa", "comercio_produtos"],
    legislacao: "Diretrizes de Atuação do RT (CFMV 2023) e Código de Defesa do Consumidor",
    campos_conteudo: [
      { campo: "numero_notificacao", label: "Nº da Notificação/BVO", tipo: "text", obrigatorio: true },
      { campo: "data_vistoria", label: "Data da Vistoria Sanitária", tipo: "date", obrigatorio: true },
      { campo: "resumo_executivo", label: "Resumo Executivo da IA", tipo: "textarea", obrigatorio: true },
      { campo: "fase1_infra", label: "Fase 1 (Infraestrutura)", tipo: "textarea", obrigatorio: true },
      { campo: "fase2_logistica", label: "Fase 2 (Logística)", tipo: "textarea", obrigatorio: true },
      { campo: "fase3_burocracia", label: "Fase 3 (Burocracia)", tipo: "textarea", obrigatorio: true },
      { campo: "prazo_adequacao", label: "Prazo para Adequação (dias)", tipo: "number", obrigatorio: true },
    ]
  }
];

export function getLaudoById(id) {
  return TIPOS_LAUDO.find(t => t.id === id);
}

export function gerarNumeroLaudo(prefixo, sequencial) {
  const ano = new Date().getFullYear();
  const seqStr = String(sequencial).padStart(5, '0');
  return `LAU-${prefixo}-${ano}-${seqStr}`;
}
