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
  },
  {
    id: "LAU_ANDROLOGICO",
    prefixo: "AND",
    nome: "Laudo de Exame Andrológico",
    descricao: "Atesta a aptidão reprodutiva de machos (touros, garanhões, ovinos/caprinos) após avaliação física, sanitária e espermograma.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"],
    legislacao: "Resolução CFMV",
    campos_conteudo: [
      { campo: "identificacao_animal", label: "Identificação do Animal (Brinco/Nome)", tipo: "text", obrigatorio: true },
      { campo: "raca_idade", label: "Raça e Idade", tipo: "text", obrigatorio: true },
      { campo: "exame_fisico_geral", label: "Exame Físico Geral", tipo: "textarea", obrigatorio: true },
      { campo: "avaliacao_comportamental", label: "Avaliação Comportamental (Libido)", tipo: "select", opcoes: ["Excelente", "Bom", "Regular", "Ruim/Inexistente"], obrigatorio: true },
      { campo: "espermograma_motilidade", label: "Motilidade Espermática (%)", tipo: "number", obrigatorio: true },
      { campo: "espermograma_vigor", label: "Vigor Espermático (1-5)", tipo: "number", obrigatorio: true },
      { campo: "espermograma_morfologia", label: "Morfologia Espermática (Defeitos)", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_aptidao", label: "Conclusão de Aptidão", tipo: "select", opcoes: ["Apto", "Inapto", "Temporariamente Inapto"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_GESTAO_US",
    prefixo: "GUS",
    nome: "Laudo de Diagnóstico de Gestação e Ultrassonografia",
    descricao: "Relatório técnico com o percentual de matrizes prenhes, idade gestacional e patologias.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"],
    legislacao: "Resolução CFMV",
    campos_conteudo: [
      { campo: "lote_identificacao", label: "Identificação do Lote", tipo: "text", obrigatorio: true },
      { campo: "qtd_matrizes", label: "Quantidade de Matrizes Avaliadas", tipo: "number", obrigatorio: true },
      { campo: "qtd_prenhes", label: "Quantidade de Prenhes", tipo: "number", obrigatorio: true },
      { campo: "idade_gestacional_media", label: "Idade Gestacional Média (dias)", tipo: "text", obrigatorio: true },
      { campo: "patologias_identificadas", label: "Patologias Identificadas (Ovarianas/Uterinas)", tipo: "textarea", obrigatorio: false },
      { campo: "observacoes_gerais", label: "Observações Gerais (Sexagem, etc.)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_GINECOLOGICA_ETR",
    prefixo: "ETR",
    nome: "Laudo de Avaliação Ginecológica / ETR",
    descricao: "Classifica o grau de maturidade sexual e ciclicidade de novilhas antes de protocolos de IATF.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"],
    legislacao: "Resolução CFMV",
    campos_conteudo: [
      { campo: "lote_identificacao", label: "Identificação do Lote", tipo: "text", obrigatorio: true },
      { campo: "qtd_novilhas", label: "Quantidade de Novilhas Avaliadas", tipo: "number", obrigatorio: true },
      { campo: "distribuicao_etr", label: "Distribuição ETR (Escore 1 a 5)", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_iatf", label: "Parecer para Entrada em IATF", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_ATESTADO_OFICIAL",
    prefixo: "ATF",
    nome: "Atestados Oficiais de Exames Diagnósticos",
    descricao: "Laudos para doenças de controle oficial, como Brucelose, Tuberculose, AIE e Mormo.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite", "areas_especiais"],
    legislacao: "PNCEBT / PNSE",
    campos_conteudo: [
      { campo: "tipo_exame", label: "Tipo de Exame Oficial", tipo: "select", opcoes: ["Brucelose", "Tuberculose", "Anemia Infecciosa Equina (AIE)", "Mormo", "Outro"], obrigatorio: true },
      { campo: "laboratorio_credenciado", label: "Laboratório Credenciado", tipo: "text", obrigatorio: true },
      { campo: "identificacao_animais", label: "Identificação dos Animais", tipo: "textarea", obrigatorio: true },
      { campo: "resultado", label: "Resultado Oficial", tipo: "select", opcoes: ["Negativo", "Positivo", "Inconclusivo"], obrigatorio: true },
      { campo: "acoes_tomadas", label: "Ações Tomadas (Se positivo)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_EPIDEMIOLOGICO",
    prefixo: "EPI",
    nome: "Laudo Epidemiológico / Investigação de Surtos",
    descricao: "Proposição de medidas de quarentena, isolamento e contenção da disseminação em episódios de alta morbidade.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"],
    legislacao: "Defesa Sanitária Animal",
    campos_conteudo: [
      { campo: "suspeita_clinica", label: "Suspeita Clínica do Surto", tipo: "text", obrigatorio: true },
      { campo: "taxa_morbidade_mortalidade", label: "Morbidade / Mortalidade (%)", tipo: "text", obrigatorio: true },
      { campo: "sinais_clinicos", label: "Sinais Clínicos Observados", tipo: "textarea", obrigatorio: true },
      { campo: "medidas_contencao", label: "Medidas de Quarentena / Isolamento Instituídas", tipo: "textarea", obrigatorio: true },
      { campo: "notificacao_svo", label: "Houve Notificação ao SVO?", tipo: "select", opcoes: ["Sim", "Não", "Não Aplicável"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_BROMATOLOGICO",
    prefixo: "BRO",
    nome: "Laudo Bromatológico de Nutrição / Volumosos",
    descricao: "Avaliação da composição de silagens, feno e rações (Matéria Seca, Proteína Bruta, NDT).",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite", "comercio_agronegocio"],
    legislacao: "Nutrição Animal",
    campos_conteudo: [
      { campo: "amostra_identificacao", label: "Identificação da Amostra", tipo: "text", obrigatorio: true },
      { campo: "tipo_volumoso", label: "Tipo de Alimento", tipo: "text", obrigatorio: true },
      { campo: "resultados_analise", label: "Resultados (MS, PB, FDN, FDA, NDT)", tipo: "textarea", obrigatorio: true },
      { campo: "parecer_nutricional", label: "Parecer Nutricional", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_MICOTOXINAS",
    prefixo: "MIC",
    nome: "Laudo de Pesquisa de Micotoxinas",
    descricao: "Análise para detectar contaminação por aflatoxinas, zearalenona e fumonisinas na dieta.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite", "comercio_agronegocio"],
    legislacao: "Controle de Qualidade MAPA",
    campos_conteudo: [
      { campo: "amostra_identificacao", label: "Identificação da Amostra / Lote", tipo: "text", obrigatorio: true },
      { campo: "niveis_detectados", label: "Níveis Detectados (ppb/ppm)", tipo: "textarea", obrigatorio: true },
      { campo: "risco_zootecnico", label: "Avaliação de Risco Zootécnico", tipo: "select", opcoes: ["Baixo", "Médio", "Alto"], obrigatorio: true },
      { campo: "recomendacao_adsorvente", label: "Recomendação (Uso de Adsorventes/Descarte)", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_AGUA",
    prefixo: "AGU",
    nome: "Laudo de Análise Físico-Química e Microbiológica da Água",
    descricao: "Comprova a potabilidade e ausência de contaminação bacteriana (E. coli, coliformes totais).",
    area_atuacao: ["producao_rural", "laticinios", "industria_poa", "bovinocultura_leite"],
    legislacao: "Portaria MS 888/2021",
    campos_conteudo: [
      { campo: "ponto_coleta", label: "Ponto de Coleta", tipo: "text", obrigatorio: true },
      { campo: "conclusao_potabilidade", label: "Conclusão de Potabilidade", tipo: "select", opcoes: ["Potável", "Não Potável"], obrigatorio: true },
      { campo: "documento_gerado", label: "Conteúdo Integral do Laudo (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Laudo de Potabilidade da Água
Controle de qualidade da água de abastecimento e uso industrial
Base normativa: Portaria GM/MS nº 888, de 04/05/2021

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Origem da Água
Fonte de abastecimento (rede pública / poço artesiano / outro): _____
Existência de outorga/licença de captação (se poço): _____
Sistema de tratamento interno (filtração, cloração, outro): _____

3. Pontos de Coleta
Código do ponto | Localização | Descrição
P01 | | Entrada geral / reservatório
P02 | | Área de produção
P03 | | Ponto mais distante da rede

4. Resultados Analíticos
Parâmetro | Resultado | Valor Máximo Permitido (VMP) | Conforme (S/N)
Cloro residual livre (mg/L) | | 0,2 a 5,0 mg/L | 
pH | | 6,0 a 9,5 | 
Turbidez (uT) | | ≤ 5,0 uT | 
Coliformes totais | | Ausência em 100 mL | 
Escherichia coli | | Ausência em 100 mL | 

5. Periodicidade de Coleta e Análise
Parâmetro | Frequência | Responsável pela coleta | Laboratório
Cloro residual livre e pH | Diária | | Análise interna
Coliformes/E. coli | Semestral (mín.) | | 
Análise físico-química completa | Anual | | 

6. Higienização do Reservatório
Data da última higienização da caixa d'água: _____
Empresa/responsável pela execução: _____
Periodicidade mínima recomendada: semestral, com emissão de certificado de execução.

7. Conclusão do Laudo
Com base nos resultados analíticos apresentados, a água utilizada no estabelecimento é considerada:
- ( ) Própria para consumo humano e uso industrial, conforme parâmetros da Portaria GM/MS 888/21.
- ( ) Imprópria - necessita de ação corretiva imediata (descrever abaixo).
Ação corretiva, se aplicável: _____

8. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_RECEPCAO_LEITE",
    prefixo: "LEI",
    nome: "Ficha de Testes de Recepção do Leite (Plataforma)",
    descricao: "Controle de qualidade do leite cru no recebimento (alizarol, crioscopia, acidez, adulterantes).",
    area_atuacao: ["laticinios", "bovinocultura_leite"],
    legislacao: "IN 76/2018 MAPA",
    campos_conteudo: [
      { campo: "documento_gerado", label: "Conteúdo Integral da Ficha (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Ficha de Testes de Recepção do Leite
Controle de qualidade do leite cru no recebimento (plataforma)
Base normativa: RIISPOA (Decreto nº 9.013/2017) - Instrução Normativa nº 76/2018

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Identificação do Lote/Fornecedor
Data e horário de recebimento: _____
Fornecedor / propriedade de origem: _____
Placa do caminhão-tanque / identificação do transporte: _____
Volume recebido (litros): _____

3. Testes de Plataforma
Teste | Resultado | Parâmetro de referência | Conforme (S/N)
Temperatura de chegada (ºC) | | ≤ 7ºC | 
Alizarol (%) | | 72% ou 74% (conforme protocolo) | 
Acidez Dornic (ºD) | | 14 a 18 ºD | 
Densidade relativa (15ºC) | | 1,028 a 1,034 g/mL | 
Crioscopia (ºH) | | -0,530 a -0,555 ºH | 
Teor de gordura (%) | | Mínimo 3,0% | 
Pesquisa de antibióticos | | Ausência | 
Pesquisa de adulterantes (água, amido, etc.) | | Ausência | 

4. Análise Sensorial
- Aspecto visual: ( ) Normal ( ) Alterado
- Odor: ( ) Normal ( ) Alterado
- Presença de sujidades ou corpos estranhos: ( ) Não ( ) Sim

5. Decisão de Recebimento
- ( ) Lote APROVADO para recepção
- ( ) Lote REJEITADO - descrever motivo abaixo
Motivo da rejeição, se aplicável: _____
Destino do lote rejeitado: _____

6. Responsável pela Coleta e Análise
Nome do responsável pelo teste de plataforma: _____

7. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_BEM_ESTAR",
    prefixo: "BEA",
    nome: "Laudo de Avaliação de Bem-Estar Animal e Ambiência",
    descricao: "Avalia estresse térmico (ITU), instalações e indicadores de bem-estar animal.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite", "creche_hotel"],
    legislacao: "Diretrizes de Bem-Estar CFMV",
    campos_conteudo: [
      { campo: "instalacao_avaliada", label: "Instalação Avaliada (Ex: Compost Barn, Curral)", tipo: "text", obrigatorio: true },
      { campo: "indice_itu", label: "Índice de Temperatura e Umidade (ITU)", tipo: "text", obrigatorio: true },
      { campo: "condicao_instalacoes", label: "Condição Física das Instalações e Pisos", tipo: "textarea", obrigatorio: true },
      { campo: "indicadores_bea", label: "Indicadores Comportamentais (Lotação, Conforto)", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_bea", label: "Grau de Bem-Estar", tipo: "select", opcoes: ["Excelente", "Adequado", "Inadequado", "Crítico"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_PASTAGEM",
    prefixo: "PAS",
    nome: "Laudo de Capacidade de Suporte e Manejo de Pastagens",
    descricao: "Determina a taxa de lotação ideal (UA/ha) prevenindo a degradação e subpastoreio.",
    area_atuacao: ["producao_rural", "bovinocultura_corte"],
    legislacao: "Sustentabilidade Rural",
    campos_conteudo: [
      { campo: "area_piquete", label: "Área Avaliada / Piquete (ha)", tipo: "number", obrigatorio: true },
      { campo: "tipo_forrageira", label: "Tipo de Forrageira", tipo: "text", obrigatorio: true },
      { campo: "massa_forragem", label: "Massa de Forragem Disponível (kg MS/ha)", tipo: "number", obrigatorio: true },
      { campo: "taxa_lotacao", label: "Taxa de Lotação Recomendada (UA/ha)", tipo: "number", obrigatorio: true },
      { campo: "recomendacao_manejo", label: "Recomendações de Manejo (Descanso, Adubação)", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_BIOSSEGURIDADE",
    prefixo: "BIO",
    nome: "Laudo de Auditoria de Biosseguridade",
    descricao: "Mapeia falhas no isolamento, fluxo de veículos, destino de carcaças e controle de vetores.",
    area_atuacao: ["producao_rural", "areas_especiais", "industria_poa"],
    legislacao: "Defesa Sanitária Animal",
    campos_conteudo: [
      { campo: "risco_isolamento", label: "Avaliação do Isolamento Físico e Cercas", tipo: "textarea", obrigatorio: true },
      { campo: "fluxo_transito", label: "Controle de Trânsito (Veículos/Pessoas)", tipo: "textarea", obrigatorio: true },
      { campo: "destino_carcacas", label: "Manejo e Destino de Carcaças", tipo: "textarea", obrigatorio: true },
      { campo: "nivel_risco_biosseguridade", label: "Nível de Risco Sistêmico", tipo: "select", opcoes: ["Baixo", "Médio", "Alto", "Crítico"], obrigatorio: true },
      { campo: "acoes_mitigacao", label: "Ações de Mitigação Exigidas", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_VISTORIA_REBANHO",
    prefixo: "VRE",
    nome: "Laudo de Vistoria e Avaliação de Rebanho (Valoração Econômica)",
    descricao: "Mensura o valor de mercado e características zootécnicas para financiamentos bancários e garantias.",
    area_atuacao: ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"],
    legislacao: "Perícia e Avaliação Rural",
    campos_conteudo: [
      { campo: "finalidade_avaliacao", label: "Finalidade (Penhor, Partilha, Garantia)", tipo: "text", obrigatorio: true },
      { campo: "composicao_rebanho", label: "Composição e Quantidade do Rebanho (Cabeças)", tipo: "textarea", obrigatorio: true },
      { campo: "padrao_racial_sanitario", label: "Padrão Racial e Estado Sanitário Geral", tipo: "textarea", obrigatorio: true },
      { campo: "valoracao_economica", label: "Valoração Econômica Estimada (R$)", tipo: "text", obrigatorio: true },
      { campo: "conclusao_pericial", label: "Conclusão Pericial", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_SEGURO_ANIMAL",
    prefixo: "SEG",
    nome: "Laudo para Seguros de Animais",
    descricao: "Vistoria inicial exigida para atestar a higidez física e sanitária antes da apólice de seguro.",
    area_atuacao: ["producao_rural", "pequenos_animais"],
    legislacao: "Regulamentação Securitária",
    campos_conteudo: [
      { campo: "identificacao_animal_segurado", label: "Identificação do Animal (Resenha Completa)", tipo: "textarea", obrigatorio: true },
      { campo: "microchip_registro", label: "Nº Microchip / Registro Genealógico", tipo: "text", obrigatorio: true },
      { campo: "exame_clinico_detalhado", label: "Exame Clínico Detalhado", tipo: "textarea", obrigatorio: true },
      { campo: "historico_sanitario", label: "Histórico Sanitário e Vacinal", tipo: "textarea", obrigatorio: true },
      { campo: "parecer_segurabilidade", label: "Parecer para Segurabilidade", tipo: "select", opcoes: ["Apto para Seguro", "Inapto para Seguro", "Apto com Restrições"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_PERICIAL",
    prefixo: "PER",
    nome: "Laudo Pericial Veterinário / Parecer Técnico",
    descricao: "Elaborado em disputas judiciais, contestações ou suspeita de descumprimento contratual.",
    area_atuacao: ["pequenos_animais", "producao_rural", "laticinios", "industria_poa"],
    legislacao: "Perícia Veterinária CFMV",
    campos_conteudo: [
      { campo: "numero_processo", label: "Nº do Processo / Escopo da Perícia", tipo: "text", obrigatorio: true },
      { campo: "objeto_pericia", label: "Objeto da Perícia", tipo: "textarea", obrigatorio: true },
      { campo: "metodologia_aplicada", label: "Metodologia Aplicada", tipo: "textarea", obrigatorio: true },
      { campo: "discussao_achados", label: "Discussão dos Achados", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_pericial", label: "Conclusão Final (Quesitos Respondidos)", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_RBQL",
    prefixo: "LRB",
    nome: "Laudo de Análise do Leite (RBQL)",
    descricao: "Emitido mensalmente por laboratórios oficiais credenciados para monitoramento do rebanho fornecedor (CCS, CBT, Físico-Química).",
    area_atuacao: ["laticinios", "industria_poa"],
    legislacao: "IN 76 e IN 77 MAPA",
    campos_conteudo: [
      { campo: "fornecedor_id", label: "Fornecedor / Rota", tipo: "text", obrigatorio: true },
      { campo: "data_coleta", label: "Data da Coleta", tipo: "date", obrigatorio: true },
      { campo: "resultado_ccs", label: "CCS (cél/mL)", tipo: "number", obrigatorio: true },
      { campo: "resultado_cbt", label: "CBT (UFC/mL)", tipo: "number", obrigatorio: true },
      { campo: "gordura", label: "Gordura (%)", tipo: "number", obrigatorio: true },
      { campo: "proteina", label: "Proteína (%)", tipo: "number", obrigatorio: true },
      { campo: "esd", label: "Extrato Seco Desengordurado (ESD %)", tipo: "number", obrigatorio: true },
      { campo: "parecer_rbql", label: "Parecer da Qualidade", tipo: "select", opcoes: ["Conforme IN 76/77", "Não Conforme (Exige Ação)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_ANTIMICROBIANOS",
    prefixo: "LAM",
    nome: "Laudo de Pesquisa de Resíduos de Antimicrobianos",
    descricao: "Triagem rápida no caminhão-tanque antes do descarregamento na fábrica para inibidores.",
    area_atuacao: ["laticinios"],
    legislacao: "RIISPOA / IN 77",
    campos_conteudo: [
      { campo: "placa_veiculo", label: "Placa do Caminhão / Rota", tipo: "text", obrigatorio: true },
      { campo: "volume_leite", label: "Volume de Leite (L)", tipo: "number", obrigatorio: true },
      { campo: "kit_utilizado", label: "Kit Comercial Utilizado (Lote/Validade)", tipo: "text", obrigatorio: true },
      { campo: "resultado_teste", label: "Resultado do Teste", tipo: "select", opcoes: ["Negativo (Liberado)", "Positivo (Rejeitado)"], obrigatorio: true },
      { campo: "acao_corretiva", label: "Destinação do Leite (Se positivo)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_LAT_ADULTERANTES",
    prefixo: "LAD",
    nome: "Laudo de Triagem de Adulterantes e Neutralizantes",
    descricao: "Rotinas que atestam a ausência de amido, sal, bicarbonato, peróxido ou formaldeído.",
    area_atuacao: ["laticinios"],
    legislacao: "RIISPOA",
    campos_conteudo: [
      { campo: "lote_tanque", label: "Lote / Silo de Armazenagem", tipo: "text", obrigatorio: true },
      { campo: "teste_amido", label: "Pesquisa de Amido (Iodo)", tipo: "select", opcoes: ["Negativo", "Positivo"], obrigatorio: true },
      { campo: "teste_cloretos", label: "Pesquisa de Cloretos (Sal)", tipo: "select", opcoes: ["Negativo", "Positivo"], obrigatorio: true },
      { campo: "teste_neutralizantes", label: "Pesquisa de Neutralizantes (Bicarbonato)", tipo: "select", opcoes: ["Negativo", "Positivo"], obrigatorio: true },
      { campo: "teste_conservantes", label: "Pesquisa de Conservantes (Peróxido/Formol)", tipo: "select", opcoes: ["Negativo", "Positivo"], obrigatorio: true },
      { campo: "parecer_final", label: "Parecer Final do Teste", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_ESTABILIDADE",
    prefixo: "LES",
    nome: "Laudo de Estabilidade Térmica e Acidez",
    descricao: "Testes de Alizarol e Acidez Titulável (Graus Dornic) definindo aptidão térmica.",
    area_atuacao: ["laticinios"],
    legislacao: "RIISPOA",
    campos_conteudo: [
      { campo: "lote_tanque", label: "Lote / Fornecedor", tipo: "text", obrigatorio: true },
      { campo: "alizarol", label: "Teste do Alizarol (Concentração %)", tipo: "text", obrigatorio: true },
      { campo: "resultado_alizarol", label: "Resultado Alizarol", tipo: "select", opcoes: ["Estável", "Instável (Grumos)"], obrigatorio: true },
      { campo: "acidez_dornic", label: "Acidez Titulável (ºD)", tipo: "number", obrigatorio: true },
      { campo: "densidade", label: "Densidade a 15ºC", tipo: "number", obrigatorio: true },
      { campo: "parecer_termico", label: "Aptidão para Processamento Térmico", tipo: "select", opcoes: ["Apto (Pode Pasteurizar)", "Inapto (Descarte ou Uso Industrial Alternativo)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_REGISTROS_TERMICOS_CIP",
    prefixo: "CIP",
    nome: "Registros Térmicos de Pasteurização e Lavagem CIP",
    descricao: "Controle de binômio tempo/temperatura da pasteurização e das etapas de limpeza CIP (Clean-in-Place).",
    area_atuacao: ["laticinios", "industria_poa"],
    legislacao: "RIISPOA - IN 76/2018",
    campos_conteudo: [
      { campo: "documento_gerado", label: "Conteúdo Integral do Registro (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Registros Térmicos de Pasteurização e Lavagem CIP
Controle de binômio tempo/temperatura da pasteurização e das etapas de limpeza CIP (Clean-in-Place)
Base normativa: RIISPOA (Decreto nº 9.013/2017) - Instrução Normativa nº 76/2018

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Parâmetros de Referência de Pasteurização
Tipo de pasteurização | Temperatura | Tempo de retenção
LTLT (lenta) | 62ºC a 65ºC | 30 minutos
HTST (rápida) | 72ºC a 75ºC | 15 a 20 segundos

3. Registro Térmico da Pasteurização
Data | Lote | Temp. atingida (ºC) | Tempo de retenção | Teste de fosfatase | Conforme (S/N) | Responsável
 | | | | | | 
 | | | | | | 
 | | | | | | 

4. Parâmetros de Referência da Lavagem CIP
Etapa | Solução/Produto | Temperatura | Tempo de circulação
Pré-enxágue | Água | Ambiente | 5 a 10 min
Lavagem alcalina | Soda cáustica (concentração definida) | 70ºC a 80ºC | 20 a 30 min
Enxágue intermediário | Água | Ambiente | 5 a 10 min
Lavagem ácida | Ácido nítrico (concentração definida) | 60ºC a 70ºC | 15 a 20 min
Enxágue final | Água potável | Ambiente | 5 a 10 min

5. Registro de Execução da Lavagem CIP
Data | Horário | Concentração da solução | Temp. atingida (ºC) | Conforme (S/N) | Responsável
 | | | | | 
 | | | | | 
 | | | | | 

6. Ações Corretivas em Caso de Desvio
Data | Desvio identificado | Ação corretiva aplicada | Responsável
 | | | 
 | | | 

7. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_LAT_MICRO_ACABADO",
    prefixo: "LMA",
    nome: "Laudo Microbiológico de Produto Acabado",
    descricao: "Avalia a ausência ou limites tolerados de Listeria, Salmonella, Coliformes e Staphylococcus.",
    area_atuacao: ["laticinios", "industria_poa", "industria_alimenticia"],
    legislacao: "RDC ANVISA / RTIQ",
    campos_conteudo: [
      { campo: "produto_lote", label: "Produto e Lote", tipo: "text", obrigatorio: true },
      { campo: "data_fabricacao", label: "Data de Fabricação", tipo: "date", obrigatorio: true },
      { campo: "coliformes", label: "Coliformes a 45ºC (Termotolerantes)", tipo: "text", obrigatorio: true },
      { campo: "salmonella", label: "Salmonella spp. (ausência em 25g)", tipo: "select", opcoes: ["Ausente", "Presente"], obrigatorio: true },
      { campo: "listeria", label: "Listeria monocytogenes (ausência em 25g)", tipo: "select", opcoes: ["Ausente", "Presente", "Não Analisado"], obrigatorio: true },
      { campo: "staphylococcus", label: "Staphylococcus Coagulase Positiva", tipo: "text", obrigatorio: true },
      { campo: "parecer_liberacao", label: "Parecer para Liberação Comercial", tipo: "select", opcoes: ["Liberado para Venda", "Retido / Condenado"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_FQ_ACABADO",
    prefixo: "LFQ",
    nome: "Laudo Físico-Químico de Produto Acabado",
    descricao: "Atesta os teores de umidade, gordura no extrato seco, proteínas e pH exigidos no RTIQ.",
    area_atuacao: ["laticinios", "industria_poa", "industria_alimenticia"],
    legislacao: "RTIQ (MAPA)",
    campos_conteudo: [
      { campo: "produto_lote", label: "Produto e Lote", tipo: "text", obrigatorio: true },
      { campo: "umidade", label: "Umidade (%)", tipo: "number", obrigatorio: true },
      { campo: "gordura_extrato_seco", label: "Gordura no Extrato Seco (GES %)", tipo: "number", obrigatorio: true },
      { campo: "proteina", label: "Proteína (%)", tipo: "number", obrigatorio: true },
      { campo: "ph", label: "pH", tipo: "number", obrigatorio: true },
      { campo: "sal", label: "Cloretos / Sal (%)", tipo: "number", obrigatorio: false },
      { campo: "parecer_conformidade", label: "Parecer (Conforme RTIQ?)", tipo: "select", opcoes: ["Conforme", "Não Conforme"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_CIP",
    prefixo: "CIP",
    nome: "Laudo de Validação da Higienização CIP",
    descricao: "Valida a eficiência dos ciclos de lavagem automatizada de tubulações e tanques (Clean-In-Place).",
    area_atuacao: ["laticinios", "industria_poa", "industria_alimenticia"],
    legislacao: "PAC (RIISPOA)",
    campos_conteudo: [
      { campo: "circuito_equipamento", label: "Circuito / Equipamento Lavado", tipo: "text", obrigatorio: true },
      { campo: "concentracao_alcalina", label: "Conc. Soda Cáustica (%) e Temp. (ºC)", tipo: "text", obrigatorio: true },
      { campo: "concentracao_acida", label: "Conc. Ácido (%) e Temp. (ºC)", tipo: "text", obrigatorio: true },
      { campo: "enxague_final", label: "Enxágue Final (Teste de Resíduo Químico)", tipo: "select", opcoes: ["Ausência (Conforme)", "Presença (Re-enxaguar)"], obrigatorio: true },
      { campo: "swab_microbiologico", label: "Swab Microbiológico (se aplicável)", tipo: "textarea", obrigatorio: false },
      { campo: "conclusao_cip", label: "Conclusão da Validação", tipo: "select", opcoes: ["Higienização Validada", "Reprocessamento Necessário"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_PRAGAS",
    prefixo: "PRA",
    nome: "Laudo de Desinsetização e Desratização (CIP)",
    descricao: "Controle Integrado de Pragas detalhando princípios ativos, iscagem e análise de infestações.",
    area_atuacao: ["laticinios", "industria_poa", "industria_alimenticia", "comercio_agronegocio", "areas_especiais"],
    legislacao: "RDC ANVISA 275/2002",
    campos_conteudo: [
      { campo: "empresa_terceirizada", label: "Empresa Terceirizada (Licença Ambiental)", tipo: "text", obrigatorio: true },
      { campo: "areas_aplicadas", label: "Áreas Internas e Externas Aplicadas", tipo: "textarea", obrigatorio: true },
      { campo: "principios_ativos", label: "Princípios Ativos Utilizados (FISPQ)", tipo: "textarea", obrigatorio: true },
      { campo: "consumo_iscas", label: "Consumo de Iscas / Monitoramento", tipo: "textarea", obrigatorio: true },
      { campo: "parecer_infestacao", label: "Parecer Nível de Infestação", tipo: "select", opcoes: ["Ausente / Controlado", "Baixo Risco", "Alto Risco (Reaplicação)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_EFLUENTES",
    prefixo: "ETE",
    nome: "Laudo de Efluentes Industriais / Licenciamento Ambiental",
    descricao: "Análise do efluente (ETE) antes do descarte (DBO, DQO, óleos e graxas).",
    area_atuacao: ["laticinios", "industria_poa", "producao_rural"],
    legislacao: "CONAMA / Órgão Ambiental Estadual",
    campos_conteudo: [
      { campo: "laboratorio_analise", label: "Laboratório de Análise Ambiental", tipo: "text", obrigatorio: true },
      { campo: "resultado_dbo", label: "Demanda Bioquímica de Oxigênio (DBO mg/L)", tipo: "text", obrigatorio: true },
      { campo: "resultado_dqo", label: "Demanda Química de Oxigênio (DQO mg/L)", tipo: "text", obrigatorio: true },
      { campo: "oleos_graxas", label: "Óleos e Graxas (mg/L)", tipo: "text", obrigatorio: true },
      { campo: "ph_efluente", label: "pH do Efluente", tipo: "number", obrigatorio: true },
      { campo: "parecer_descarte", label: "Conclusão (Apto para Descarte?)", tipo: "select", opcoes: ["Dentro dos Padrões (Liberado)", "Fora dos Padrões (Risco Ambiental)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_CALIBRACAO",
    prefixo: "CAL",
    nome: "Certificado de Aferição e Calibração de Equipamentos",
    descricao: "Comprova a aferição de termômetros, registradores gráficos, manômetros e balanças pela RBC.",
    area_atuacao: ["laticinios", "industria_poa", "areas_especiais"],
    legislacao: "INMETRO / RBC / PACs",
    campos_conteudo: [
      { campo: "equipamento_tag", label: "Identificação do Equipamento / TAG", tipo: "text", obrigatorio: true },
      { campo: "empresa_calibracao", label: "Empresa de Calibração (Certificado RBC)", tipo: "text", obrigatorio: true },
      { campo: "faixa_erro", label: "Erro Encontrado (Graus/Gramas)", tipo: "text", obrigatorio: true },
      { campo: "correcao_aplicada", label: "Ajuste / Fator de Correção Aplicado", tipo: "textarea", obrigatorio: true },
      { campo: "proxima_calibracao", label: "Data da Próxima Calibração", tipo: "date", obrigatorio: true },
    ]
  },
  {
    id: "LAU_LAT_MEMORIAL",
    prefixo: "MEM",
    nome: "Memorial Técnico Sanitário do Estabelecimento",
    descricao: "Projeto descritivo das instalações, fluxos e capacidade para registro SIF/SIE/SIM.",
    area_atuacao: ["laticinios", "industria_poa", "industria_alimenticia"],
    legislacao: "RIISPOA",
    campos_conteudo: [
      { campo: "classificacao_estabelecimento", label: "Classificação Oficial (Ex: Usina de Beneficiamento)", tipo: "text", obrigatorio: true },
      { campo: "capacidade_producao", label: "Capacidade de Produção e Instalação de Frio", tipo: "textarea", obrigatorio: true },
      { campo: "fluxo_producao", label: "Descrição do Fluxo (Matéria-prima ao Expediente)", tipo: "textarea", obrigatorio: true },
      { campo: "agua_residuos", label: "Abastecimento de Água e Gestão de Resíduos", tipo: "textarea", obrigatorio: true },
      { campo: "conclusao_rt", label: "Parecer Técnico Sanitário e Estrutural", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_MEMORIAL_PRODUTO",
    prefixo: "MDP",
    nome: "Memorial Descritivo de Produto",
    descricao: "Descrição técnica do processo de fabricação para fins de registro/regularização no MAPA.",
    area_atuacao: ["laticinios", "industria_poa", "frigorificos"],
    legislacao: "Ministério da Agricultura, Pecuária e Abastecimento (MAPA)",
    campos_conteudo: [
      { campo: "documento_gerado", label: "Conteúdo Integral do Memorial (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Memorial Descritivo de Produto
Descrição técnica do processo de fabricação para fins de registro/regularização
Base normativa: Ministério da Agricultura, Pecuária e Abastecimento (MAPA)

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Identificação do Produto
Nome do produto / Denominação de venda: _____
Classificação (RTIQ aplicável): _____
Número de registro do produto (se já existente): _____

3. Composição / Formulação
Ingrediente | Percentual (%) | Função tecnológica
 | | 
 | | 
 | | 
 | | 

4. Descrição do Processo de Fabricação
Descrever, passo a passo, todas as etapas do processo produtivo, desde o recebimento da matéria-prima até a expedição do produto acabado, incluindo parâmetros de tempo, temperatura e demais controles críticos.
1. Recebimento e seleção da matéria-prima
2. Etapa de processamento / transformação
3. Etapa de cocção/pasteurização/maturação (quando aplicável)
4. Embalagem primária e secundária
5. Armazenamento e expedição

5. Características do Produto Final
Características sensoriais (cor, odor, sabor, textura): _____
Parâmetros físico-químicos relevantes: _____
Peso/volume líquido: _____
Vida de prateleira e condições de conservação recomendadas: _____

6. Rotulagem
Anexar modelo de rótulo, contendo denominação de venda, lista de ingredientes, informação nutricional, identificação do lote, prazo de validade, número de registro do estabelecimento e demais exigências do RTIQ aplicável.

7. Responsabilidade Técnica
Declaro que as informações descritas neste memorial correspondem fielmente ao processo produtivo efetivamente empregado no estabelecimento.

8. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_FRI_ANTEMORTEM",
    prefixo: "LAM",
    nome: "Laudo do Exame Ante-Mortem",
    descricao: "Avaliação dos animais nos currais de matança, detecção de enfermidades e definição de segregação.",
    area_atuacao: ["frigorificos", "industria_poa"],
    legislacao: "RIISPOA (MAPA)",
    campos_conteudo: [
      { campo: "gta_lote", label: "Número da GTA / Identificação do Lote", tipo: "text", obrigatorio: true },
      { campo: "quantidade_animais", label: "Quantidade de Animais Avaliados", tipo: "number", obrigatorio: true },
      { campo: "sintomas_clinicos", label: "Sintomatologia Clínica Observada (se houver)", tipo: "textarea", obrigatorio: false },
      { campo: "diagnostico_presuntivo", label: "Diagnóstico Presuntivo", tipo: "text", obrigatorio: false },
      { campo: "destino_animais", label: "Destinação do Lote", tipo: "select", opcoes: ["Abate Normal (Matança)", "Curral de Observação", "Abate de Emergência (Imediato)", "Abate de Emergência (Diferido)"], obrigatorio: true },
      { campo: "parecer_fiscal", label: "Parecer Oficial / RT", tipo: "textarea", obrigatorio: true },
    ]
  },
  {
    id: "LAU_FRI_EMERGENCIA",
    prefixo: "AEM",
    nome: "Laudo de Abate de Emergência / Necropsia",
    descricao: "Relatório de sacrifício sanitário, achados anatomopatológicos e coleta para programas oficiais.",
    area_atuacao: ["frigorificos", "industria_poa"],
    legislacao: "RIISPOA (MAPA)",
    campos_conteudo: [
      { campo: "identificacao_animal", label: "Identificação Individual (Brinco/SISBOV)", tipo: "text", obrigatorio: true },
      { campo: "motivo_emergencia", label: "Motivo do Abate de Emergência", tipo: "text", obrigatorio: true },
      { campo: "achados_necropsia", label: "Achados Anatomopatológicos (Necropsia)", tipo: "textarea", obrigatorio: true },
      { campo: "coleta_amostras", label: "Coleta de Material para Oficial (ex: EEB)?", tipo: "select", opcoes: ["Não Coletado", "Coletado Tronco Encefálico (Raiva/EEB)", "Outros Órgãos"], obrigatorio: true },
      { campo: "destino_carcaca", label: "Destinação da Carcaça/Órgãos", tipo: "select", opcoes: ["Condenação Total (Graxaria)", "Aproveitamento Condicional"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_FRI_POSTMORTEM",
    prefixo: "LPM",
    nome: "Laudo de Inspeção Post-Mortem (DIF)",
    descricao: "Registro das condenações parciais ou totais de carcaças e vísceras nas linhas de inspeção.",
    area_atuacao: ["frigorificos", "industria_poa"],
    legislacao: "RIISPOA (MAPA)",
    campos_conteudo: [
      { campo: "numero_abate", label: "Número Sequencial de Abate / Lote", tipo: "text", obrigatorio: true },
      { campo: "achados_inspecao", label: "Lesões Identificadas (Cisticercose, Fasciolose, etc)", tipo: "textarea", obrigatorio: true },
      { campo: "condenacao_orgaos", label: "Órgãos/Vísceras Condenadas", tipo: "textarea", obrigatorio: true },
      { campo: "destino_dif", label: "Julgamento no DIF (Departamento de Inspeção Final)", tipo: "select", opcoes: ["Liberado", "Tratamento pelo Frio (Cisticercose)", "Tratamento pelo Calor (Conservas)", "Condenação Total (Graxaria/Farinha)"], obrigatorio: true },
      { campo: "peso_condenado", label: "Peso Estimado Condenado (Kg)", tipo: "number", obrigatorio: false },
    ]
  },
  {
    id: "LAU_FRI_MICRO",
    prefixo: "LMC",
    nome: "Laudo Microbiológico de Produto Cárneo",
    descricao: "Atesta a conformidade microbiológica de carnes e miúdos (Salmonella, E. coli STEC, Listeria).",
    area_atuacao: ["frigorificos", "industria_poa", "industria_alimenticia"],
    legislacao: "RDC ANVISA / RTIQ Cárneos",
    campos_conteudo: [
      { campo: "produto_lote", label: "Produto Cárneo / Corte e Lote", tipo: "text", obrigatorio: true },
      { campo: "salmonella", label: "Pesquisa de Salmonella spp. (25g)", tipo: "select", opcoes: ["Ausente", "Presente (Reter/Rechacar)"], obrigatorio: true },
      { campo: "ecoli_stec", label: "Escherichia coli STEC (O157:H7)", tipo: "select", opcoes: ["Ausente", "Presente", "Não Analisado"], obrigatorio: true },
      { campo: "listeria", label: "Listeria monocytogenes (Embutidos/Cozidos)", tipo: "select", opcoes: ["Ausente", "Presente", "Não Analisado"], obrigatorio: true },
      { campo: "coliformes", label: "Coliformes Termotolerantes / E. coli Genérica", tipo: "text", obrigatorio: true },
      { campo: "parecer_liberacao", label: "Conclusão e Destinação do Lote", tipo: "select", opcoes: ["Conforme (Liberado)", "Não Conforme (Condenado/Reprocessamento)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_FRI_FQ",
    prefixo: "LFC",
    nome: "Laudo Físico-Químico e Atendimento a RTIQ (Carnes)",
    descricao: "Conformidade de pH, gordura, umidade e proteínas para carne moída, maturada e embutidos.",
    area_atuacao: ["frigorificos", "industria_poa", "industria_alimenticia"],
    legislacao: "RTIQ MAPA",
    campos_conteudo: [
      { campo: "produto_lote", label: "Produto / Lote Analisado", tipo: "text", obrigatorio: true },
      { campo: "ph_final", label: "pH Final (Maturação/Carcaça)", tipo: "number", obrigatorio: true },
      { campo: "percentual_gordura", label: "Gordura Total (%)", tipo: "number", obrigatorio: true },
      { campo: "percentual_proteina", label: "Proteína (%)", tipo: "number", obrigatorio: true },
      { campo: "umidade_proteina", label: "Relação Umidade / Proteína (se aplicável)", tipo: "text", obrigatorio: false },
      { campo: "parecer_rtiq", label: "Atendimento ao RTIQ", tipo: "select", opcoes: ["Dentro dos Padrões", "Fora dos Padrões Regulamentares"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_FRI_PNCRC",
    prefixo: "PNC",
    nome: "Laudo do Plano Nacional de Controle de Resíduos (PNCRC)",
    descricao: "Investigação da presença de antibióticos, antiparasitários, agrotóxicos e metais pesados.",
    area_atuacao: ["frigorificos", "producao_rural", "industria_poa"],
    legislacao: "PNCRC MAPA",
    campos_conteudo: [
      { campo: "matriz_coletada", label: "Matriz (Músculo, Fígado, Rim, Gordura)", tipo: "text", obrigatorio: true },
      { campo: "propriedade_origem", label: "Propriedade Rural de Origem / GTA", tipo: "text", obrigatorio: true },
      { campo: "grupo_analisado", label: "Grupo Analisado (ex: Antimicrobianos, Beta-agonistas)", tipo: "text", obrigatorio: true },
      { campo: "limite_mrl", label: "Limite Máximo de Resíduos (LMR)", tipo: "text", obrigatorio: true },
      { campo: "resultado_laboratorial", label: "Resultado Analítico Oficial", tipo: "select", opcoes: ["Não Detectado / Abaixo do LMR", "Violativo (Acima do LMR)"], obrigatorio: true },
      { campo: "acao_regulatoria", label: "Ação Regulatória (Se Violativo)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_FRI_PPHO",
    prefixo: "PPH",
    nome: "Laudo de Validação do PPHO",
    descricao: "Avaliação microbiológica (Swab) de superfícies de contato, serras e mãos de manipuladores.",
    area_atuacao: ["frigorificos", "industria_poa", "industria_alimenticia"],
    legislacao: "PAC / RIISPOA",
    campos_conteudo: [
      { campo: "area_amostrada", label: "Área/Superfície Amostrada (ex: Serra Fita, Mesa de Desossa)", tipo: "text", obrigatorio: true },
      { campo: "momento_coleta", label: "Momento da Coleta", tipo: "select", opcoes: ["Pré-Operacional", "Operacional"], obrigatorio: true },
      { campo: "cbt_superficie", label: "Mesófilos / Aeróbios Totais (UFC/cm²)", tipo: "text", obrigatorio: true },
      { campo: "enterobacterias", label: "Enterobactérias / Coliformes (UFC/cm²)", tipo: "text", obrigatorio: true },
      { campo: "conclusao_higienizacao", label: "Conclusão da Higienização", tipo: "select", opcoes: ["Higienização Aprovada", "Reprovação (Exige Re-higienização)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_FRI_BEM_ESTAR",
    prefixo: "BEA",
    nome: "Laudo de Eficiência do Bem-Estar Animal e Insensibilização",
    descricao: "Auditorias de sangria e eficácia do atordoamento elétrico/percussivo/atmosfera controlada.",
    area_atuacao: ["frigorificos", "industria_poa"],
    legislacao: "Portaria MAPA 365/2021 (Manejo Pré-Abate e Abate)",
    campos_conteudo: [
      { campo: "metodo_insensibilizacao", label: "Método de Insensibilização", tipo: "select", opcoes: ["Percussivo (Pistola)", "Elétrico (Eletronarcose)", "Atmosfera Controlada (CO2)"], obrigatorio: true },
      { campo: "amostragem_animais", label: "Tamanho da Amostra (Nº Animais)", tipo: "number", obrigatorio: true },
      { campo: "sinais_consciencia", label: "Falhas / Sinais de Retorno à Consciência (%)", tipo: "text", obrigatorio: true },
      { campo: "tempo_sangria", label: "Tempo de Sangria Adequado?", tipo: "select", opcoes: ["Sim (Atende Norma)", "Não (Falha Operacional)"], obrigatorio: true },
      { campo: "parecer_bea", label: "Classificação do Grau de Bem-Estar", tipo: "select", opcoes: ["Excelente", "Aceitável", "Inaceitável (Exige Ação Imediata)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_ACO_CAIXA_AGUA",
    prefixo: "LCA",
    nome: "Comprovante de Higienização de Reservatório (Caixa d'Água)",
    descricao: "Certificado semestral de limpeza de reservatório exigido pela Vigilância Sanitária.",
    area_atuacao: ["comercio_agronegocio", "industria_alimenticia"],
    legislacao: "RDC ANVISA 216/2004",
    campos_conteudo: [
      { campo: "empresa_executante", label: "Empresa Terceirizada (CNPJ/Licença)", tipo: "text", obrigatorio: true },
      { campo: "capacidade_reservatorio", label: "Capacidade do Reservatório (Litros)", tipo: "number", obrigatorio: true },
      { campo: "data_execucao", label: "Data da Higienização", tipo: "date", obrigatorio: true },
      { campo: "data_validade", label: "Validade do Comprovante (Próx. Limpeza)", tipo: "date", obrigatorio: true },
      { campo: "produtos_utilizados", label: "Produtos Utilizados (Hipoclorito, etc)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_ACO_ASO",
    prefixo: "ASO",
    nome: "Laudo Médico / ASO (Manipuladores de Alimentos)",
    descricao: "Atestado de Saúde Ocupacional comprovando aptidão para manipulação (Coprocultura, etc).",
    area_atuacao: ["comercio_agronegocio", "industria_alimenticia"],
    legislacao: "PCMSO / Vigilância Sanitária",
    campos_conteudo: [
      { campo: "nome_funcionario", label: "Nome do Funcionário", tipo: "text", obrigatorio: true },
      { campo: "funcao", label: "Função (Ex: Açougueiro, Desossador)", tipo: "text", obrigatorio: true },
      { campo: "exames_realizados", label: "Exames Realizados (Coprocultura, Micológico, etc)", tipo: "textarea", obrigatorio: true },
      { campo: "data_exame", label: "Data da Avaliação Médica", tipo: "date", obrigatorio: true },
      { campo: "parecer_medico", label: "Parecer Médico", tipo: "select", opcoes: ["Apto para Manipulação de Alimentos", "Inapto (Afastamento Necessário)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_ACO_TREINAMENTO",
    prefixo: "CBP",
    nome: "Certificado de Boas Práticas de Manipulação",
    descricao: "Comprovação de treinamento periódico da equipe de atendentes e manipuladores.",
    area_atuacao: ["comercio_agronegocio", "industria_alimenticia", "areas_especiais"],
    legislacao: "RDC ANVISA 216/2004",
    campos_conteudo: [
      { campo: "carga_horaria", label: "Carga Horária do Treinamento", tipo: "text", obrigatorio: true },
      { campo: "temas_abordados", label: "Temas Abordados (Higiene, Temp, Cruzada)", tipo: "textarea", obrigatorio: true },
      { campo: "instrutor", label: "Nome do Instrutor / RT", tipo: "text", obrigatorio: true },
      { campo: "lista_presenca", label: "Lista de Funcionários Treinados (Nomes)", tipo: "textarea", obrigatorio: true },
      { campo: "data_treinamento", label: "Data de Realização", tipo: "date", obrigatorio: true },
    ]
  },
  {
    id: "LAU_ACO_RECEBIMENTO",
    prefixo: "RMP",
    nome: "Registro de Recebimento de Matéria-Prima (Carnes)",
    descricao: "Verificação de origem legal (SIF) e aferição de temperatura no momento da entrega.",
    area_atuacao: ["comercio_agronegocio", "industria_alimenticia"],
    legislacao: "Código Sanitário Municipal",
    campos_conteudo: [
      { campo: "data_recebimento", label: "Data e Hora do Recebimento", tipo: "text", obrigatorio: true },
      { campo: "fornecedor", label: "Frigorífico Fornecedor (Nome/SIF/SIE)", tipo: "text", obrigatorio: true },
      { campo: "nota_fiscal", label: "Número da Nota Fiscal", tipo: "text", obrigatorio: true },
      { campo: "temperatura_aferida", label: "Temperatura Aferida no Caminhão (ºC)", tipo: "number", obrigatorio: true },
      { campo: "condicao_organoleptica", label: "Condições Organolépticas (Cor, Odor, Embalagem)", tipo: "select", opcoes: ["Conforme (Aceito)", "Não Conforme (Devolução)"], obrigatorio: true },
      { campo: "observacoes", label: "Justificativa de Devolução (Se houver)", tipo: "textarea", obrigatorio: false },
    ]
  },
  {
    id: "LAU_ACO_TEMPERATURA",
    prefixo: "FMT",
    nome: "Ficha de Monitoramento de Temperatura (Frios)",
    descricao: "Registro de verificação de balcões expositores e câmaras frias.",
    area_atuacao: ["comercio_agronegocio", "industria_alimenticia"],
    legislacao: "RDC ANVISA 216/2004",
    campos_conteudo: [
      { campo: "identificacao_equipamento", label: "Equipamento (Ex: Balcão 1, Câmara Congelados)", tipo: "text", obrigatorio: true },
      { campo: "temperatura_encontrada", label: "Temperatura Marcada no Painel/Termômetro (ºC)", tipo: "number", obrigatorio: true },
      { campo: "limite_permitido", label: "Faixa Permitida (Ex: 0 a 7ºC)", tipo: "text", obrigatorio: true },
      { campo: "acao_corretiva", label: "Ação Corretiva (Caso fora do padrão)", tipo: "textarea", obrigatorio: false },
      { campo: "responsavel_afericao", label: "Nome do Funcionário Responsável", tipo: "text", obrigatorio: true },
    ]
  },
  {
    id: "LAU_ACO_CLIMATIZACAO",
    prefixo: "CLI",
    nome: "Laudo de Climatização (Sala de Desossa/Manipulação)",
    descricao: "Atesta o funcionamento do ar-condicionado na sala exclusiva de preparo de carnes.",
    area_atuacao: ["comercio_agronegocio", "industria_poa"],
    legislacao: "Vigilância Sanitária / RIISPOA",
    campos_conteudo: [
      { campo: "ambiente", label: "Ambiente (Ex: Sala de Desossa)", tipo: "text", obrigatorio: true },
      { campo: "temperatura_ambiente", label: "Temperatura do Ambiente Aferida (Máx 10ºC)", tipo: "number", obrigatorio: true },
      { campo: "higienizacao_filtros", label: "Estado dos Filtros do Equipamento", tipo: "select", opcoes: ["Limpos (Conforme)", "Sujos (Exige Troca/Limpeza)"], obrigatorio: true },
      { campo: "parecer_climatizacao", label: "Conclusão de Adequação", tipo: "select", opcoes: ["Apto para Manipulação Cárnea", "Inapto (Risco de Quebra da Cadeia de Frio)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_ACO_ARTESANAL",
    prefixo: "LAA",
    nome: "Laudo Microbiológico de Embutidos Frescais Artesanais",
    descricao: "Exigido para açougues Categoria II que preparam linguiças, espetinhos e temperados.",
    area_atuacao: ["comercio_agronegocio", "industria_poa"],
    legislacao: "RDC ANVISA / Códigos Estaduais",
    campos_conteudo: [
      { campo: "produto_analisado", label: "Produto Produzido no Local (Ex: Linguiça Toscana)", tipo: "text", obrigatorio: true },
      { campo: "data_fabricacao", label: "Data de Fabricação do Lote Analisado", tipo: "date", obrigatorio: true },
      { campo: "salmonella", label: "Pesquisa de Salmonella spp. (25g)", tipo: "select", opcoes: ["Ausente (Conforme)", "Presente (Risco Sanitário)"], obrigatorio: true },
      { campo: "coliformes", label: "Coliformes Termotolerantes / E. coli", tipo: "text", obrigatorio: true },
      { campo: "aditivos_utilizados", label: "Aditivos Declarados (Sal de Cura, etc)", tipo: "textarea", obrigatorio: false },
      { campo: "parecer_comercializacao", label: "Parecer para Comercialização", tipo: "select", opcoes: ["Aprovado para Venda", "Condenado (Destruição do Lote)"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_MANUAL_PAC",
    prefixo: "PAC",
    nome: "Manual de Programas de Autocontrole (PAC / BPF)",
    descricao: "Documento base de Boas Práticas de Fabricação contemplando manutenção, água, pragas, rastreabilidade e higiene.",
    area_atuacao: ["industria_poa", "laticinios", "frigorificos"],
    legislacao: "RIISPOA / Portaria 368/97 MAPA",
    campos_conteudo: [
      { campo: "versao_manual", label: "Versão do Manual / Ano", tipo: "text", obrigatorio: true },
      { campo: "escopo_aplicacao", label: "Escopo de Aplicação (Setores)", tipo: "textarea", obrigatorio: true },
      { campo: "frequencia_revisao", label: "Frequência de Revisão", tipo: "select", opcoes: ["Anual", "Semestral", "Sempre que houver mudança"], obrigatorio: true },
      { campo: "elementos_avaliados", label: "Programas Contemplados (Ex: PAC 1, PAC 2)", tipo: "textarea", obrigatorio: true },
      { campo: "documento_gerado", label: "Conteúdo Integral do Manual (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `PAC - Programas de Autocontrole
Documento-índice consolidador dos programas de autocontrole do estabelecimento
Base normativa: RIISPOA (Decreto nº 9.013/2017 e Instruções Normativas complementares)

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Finalidade do PAC
O Programa de Autocontrole (PAC) reúne o conjunto de planos, manuais, procedimentos e registros que o estabelecimento sob inspeção federal, estadual ou municipal mantém para garantir a inocuidade, qualidade e conformidade higiênico-sanitária dos produtos de origem animal, conforme exigido pelo RIISPOA e demais normas complementares.
Este documento serve como índice mestre, relacionando todos os subprogramas vigentes, sua situação de implantação e a responsabilidade técnica por cada um.

3. Relação de Subprogramas do PAC
- BPF - Boas Práticas de Fabricação (Portaria MAPA 368/97)
- PPHO - Procedimento Padrão de Higiene Operacional (RIISPOA)
- APPCC / HACCP (Codex Alimentarius)
- Controle de Potabilidade da Água (Portaria GM/MS 888/21)
- Memorial Descritivo de Produtos (MAPA)
- Controle da Cadeia de Frio (Logística interna)
- Testes de Recepção do Leite (RIISPOA)
- Registros Térmicos de Pasteurização/CIP (RIISPOA)
- PGRS/PGRSS - Gerenciamento de Resíduos (RDC ANVISA 222/2018)
- Controle Integrado de Vetores e Pragas (RDC ANVISA 275/2002)

4. Fluxo de Verificação e Revisão
1. Cada subprograma listado deve possuir documento próprio, com controle de versão e data de vigência.
2. O RT deve verificar a atualização de cada subprograma na periodicidade definida em seu respectivo plano.
3. Qualquer não conformidade identificada em subprograma deve ser registrada no Livro de Registros e Ocorrências e, se necessário, formalizada via TCR.
4. Este índice deve ser revisado sempre que houver inclusão, exclusão ou alteração relevante em qualquer subprograma.`
  },
  {
    id: "LAU_MANUAL_BPF",
    prefixo: "BPF",
    nome: "Manual de Boas Práticas de Fabricação (BPF)",
    descricao: "Documento base de Boas Práticas de Fabricação contemplando instalações, higiene, controle de matérias-primas e processo produtivo.",
    area_atuacao: ["industria_poa", "laticinios", "frigorificos"],
    legislacao: "Portaria MAPA nº 368, de 04/09/1997",
    campos_conteudo: [
      { campo: "documento_gerado", label: "Conteúdo Integral do Manual (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Manual de Boas Práticas de Fabricação (BPF)
Boas Práticas de Fabricação / Manipulação
Base normativa: Portaria MAPA nº 368, de 04/09/1997

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Objetivo
Estabelecer os requisitos de boas práticas de fabricação que devem ser observados no estabelecimento, garantindo condições higiênico-sanitárias adequadas em todas as etapas de produção, manipulação, armazenamento e expedição de produtos de origem animal.

3. Instalações e Estrutura Física
- Descrição do layout e fluxo de produção (unidirecional, sem cruzamento entre áreas limpas e sujas).
- Especificação de pisos, paredes, tetos, portas e janelas (materiais laváveis, atóxicos, resistentes).
- Sistema de ventilação, iluminação e climatização das áreas de manipulação.
- Instalações sanitárias, vestiários e barreiras sanitárias para funcionários.
Observações sobre a estrutura física: _____

4. Higiene Pessoal dos Manipuladores
- Uso obrigatório de uniforme completo, limpo e de cor clara (touca, botas, avental).
- Procedimento de higienização de mãos antes do início das atividades e após intervalos.
- Restrições de uso de adornos, esmalte, barba sem proteção e maquiagem em área de manipulação.
- Controle de afastamento de manipuladores com lesões, doenças infectocontagiosas ou sintomas gripais.
Frequência de exames médicos/atestados de saúde ocupacional: _____

5. Controle de Matérias-Primas e Insumos
- Critérios de aceitação e rejeição no recebimento (temperatura, integridade, procedência, rotulagem).
- Condições de armazenamento por tipo de insumo (temperatura, umidade, empilhamento).
- Sistema de rastreabilidade de lotes (PEPS/FIFO).

6. Controle de Processo Produtivo
- Descrição resumida das etapas críticas do processo produtivo.
- Parâmetros de tempo e temperatura por etapa.
- Prevenção de contaminação cruzada entre produtos crus e processados.

7. Higienização de Instalações, Equipamentos e Utensílios
Detalhado no PPHO específico (Procedimento Padrão de Higiene Operacional), referenciado como documento complementar a este manual.

8. Controle Integrado de Pragas
Detalhado no Plano de Controle Integrado de Vetores e Pragas Urbanas, referenciado como documento complementar.

9. Manejo de Resíduos
Detalhado no PGRS/PGRSS, referenciado como documento complementar.

10. Capacitação de Colaboradores
- Programa de treinamento inicial (integração) e periódico em BPF.
- Registro de participação em Lista de Presença e Registro de Treinamentos.

11. Verificação e Auditoria Interna
Higiene pessoal dos manipuladores (Diária)
Condições de estrutura física (Mensal)
Controle de matéria-prima (A cada recebimento)
Capacitação de colaboradores (Semestral)

12. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_MANUAL_PPHO",
    prefixo: "PHO",
    nome: "Manual PPHO (Procedimento Padrão de Higiene Operacional)",
    descricao: "Descritivo técnico das etapas de higienização pré-operacional e operacional.",
    area_atuacao: ["industria_poa", "laticinios", "frigorificos"],
    legislacao: "RIISPOA",
    campos_conteudo: [
      { campo: "setor_aplicacao", label: "Setor de Aplicação", tipo: "text", obrigatorio: true },
      { campo: "produtos_quimicos", label: "Detergentes e Sanitizantes (Concentração/Diluição)", tipo: "textarea", obrigatorio: true },
      { campo: "frequencia_higienizacao", label: "Frequência (Pré-Op, Op, Pós-Op)", tipo: "text", obrigatorio: true },
      { campo: "documento_gerado", label: "Conteúdo Integral do Manual (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `PPHO - Procedimento Padrão de Higiene Operacional
Procedimentos de higienização pré-operacional e operacional
Base normativa: RIISPOA (Decreto nº 9.013/2017)

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Objetivo
Padronizar os procedimentos de higienização de instalações, equipamentos, utensílios e demais superfícies de contato com o alimento, antes (pré-operacional) e durante (operacional) as atividades produtivas.

3. Escopo
Aplica-se a todas as áreas de manipulação, câmaras frias, equipamentos, utensílios, reservatórios de água e veículos de transporte utilizados no estabelecimento.

4. Procedimento Pré-Operacional
Item / Área | Método de higienização | Produto utilizado | Frequência | Responsável
Pisos e ralos | | | Diária |
Mesas e bancadas | | | Diária |
Serras e moedores | | | Diária |
Ganchos e trilhos aéreos | | | Diária |
Câmaras frias | | | Semanal |
Caixas e utensílios plásticos | | | Diária |

5. Procedimento Operacional (durante a produção)
- Higienização intermediária de utensílios de corte entre lotes/produtos distintos.
- Troca de água de imersão/resfriamento conforme parâmetro definido.
- Higienização das mãos dos manipuladores em intervalos regulares e sempre que houver troca de atividade.
- Controle de contaminação cruzada entre áreas de produto cru e produto processado.

6. Potabilidade e Higienização do Reservatório de Água
Detalhado no Laudo de Potabilidade da Água, referenciado como documento complementar. A higienização da caixa d'água deve ocorrer, no mínimo, semestralmente, com registro de execução.
Data da última higienização do reservatório: _____

7. Manutenção Preventiva e Calibração
Equipamento | Tipo de manutenção/calibração | Periodicidade | Última execução | Responsável
Termômetros | Calibração | Semestral | |
Câmaras frias | Manutenção preventiva | Trimestral | |
Equipamentos de corte | Manutenção preventiva | Mensal | |

8. Monitoramento e Verificação
A eficácia da higienização deve ser monitorada por inspeção visual diária e, quando aplicável, por análises microbiológicas de superfícies (swab test) em periodicidade definida pelo RT.
Periodicidade das análises de superfície: _____

9. Ações Corretivas
Toda não conformidade identificada na higienização deve ser corrigida imediatamente, com registro da causa raiz e da ação corretiva aplicada, sem prejuízo de emissão de TCR quando aplicável.

10. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_PLANO_APPCC",
    prefixo: "HAC",
    nome: "Plano APPCC (Análise de Perigos e Pontos Críticos de Controle)",
    descricao: "Mapeamento de perigos biológicos, químicos e físicos, com definição de limites críticos.",
    area_atuacao: ["industria_poa", "laticinios", "frigorificos"],
    legislacao: "Codex Alimentarius / MAPA",
    campos_conteudo: [
      { campo: "linha_producao", label: "Linha de Produção / Produto", tipo: "text", obrigatorio: true },
      { campo: "perigos_identificados", label: "Perigos Identificados Básicos", tipo: "textarea", obrigatorio: true },
      { campo: "pontos_criticos", label: "Pontos Críticos de Controle (PCC) Definidos", tipo: "textarea", obrigatorio: true },
      { campo: "documento_gerado", label: "Conteúdo Integral do Plano (Editável)", tipo: "documento_ia", obrigatorio: true },
    ],
    templateBase: `Plano APPCC - Análise de Perigos e Pontos Críticos de Controle
Hazard Analysis and Critical Control Points (HACCP)
Base normativa: Codex Alimentarius (CAC/RCP 1-1969, Rev. 2020) e RIISPOA

1. Identificação do Estabelecimento
Razão Social: 
CNPJ: 
Endereço completo: 
Nº de registro (SIF/SIE/SIM): 
Responsável Técnico (RT): 
CRMV nº: 
Data de emissão: 
Nº da revisão: 

2. Equipe APPCC
Nome | Função | Formação/Qualificação
 | Coordenador (RT) | 
 | Membro | 
 | Membro | 

3. Descrição do Produto e Uso Pretendido
Nome do produto: _____
Composição / características relevantes: _____
Forma de consumo / uso pretendido: _____
Vida de prateleira e condições de conservação: _____
Público-alvo (inclusive grupos sensíveis, se aplicável): _____

4. Fluxograma de Processo
Anexar fluxograma detalhado de todas as etapas do processo, do recebimento da matéria-prima até a expedição do produto acabado. O fluxograma deve ser verificado in loco pela equipe APPCC.

5. Análise de Perigos (Princípio 1)
Etapa do processo | Perigo identificado (B/Q/F) | Justificativa | Medida de controle
Recebimento de matéria-prima | | | 
Armazenamento refrigerado | | | 
Processamento/cocção | | | 
Resfriamento | | | 
Embalagem | | | 
Expedição | | | 

6. Determinação dos Pontos Críticos de Controle - PCC (Princípio 2)
Aplicar a árvore decisória do Codex Alimentarius para cada perigo significativo identificado, definindo se a etapa constitui um PCC.

7. Limites Críticos, Monitoramento e Ações Corretivas (Princípios 3, 4 e 5)
PCC | Limite crítico | Monitoramento (o quê/como/frequência/quem) | Ação corretiva
 | | | 
 | | | 

8. Procedimentos de Verificação (Princípio 6)
- Auditoria interna periódica do plano APPCC.
- Calibração de instrumentos de monitoramento (termômetros, balanças).
- Análises laboratoriais confirmatórias (microbiológicas/físico-químicas).
- Revisão do plano sempre que houver alteração de processo, produto ou insumo.

9. Registros e Documentação (Princípio 7)
Todos os registros de monitoramento dos PCCs, desvios e ações corretivas devem ser mantidos organizados e disponíveis para verificação oficial pelo período mínimo exigido pela legislação vigente.
Prazo de retenção dos registros: _____

10. Histórico de Revisões
Revisão | Data | Descrição da alteração | Responsável
00 | | Emissão inicial |`
  },
  {
    id: "LAU_CADEIA_FRIO",
    prefixo: "LOG",
    nome: "Planilha de Logística e Cadeia de Frio",
    descricao: "Monitoramento de temperatura durante o transporte e expedição de produtos de origem animal.",
    area_atuacao: ["industria_poa", "laticinios", "frigorificos", "comercio_agronegocio"],
    legislacao: "Boas Práticas de Transporte (ANVISA/MAPA)",
    campos_conteudo: [
      { campo: "placa_veiculo", label: "Placa do Veículo Frigorífico", tipo: "text", obrigatorio: true },
      { campo: "lote_expedicao", label: "Lote / Número da NFe", tipo: "text", obrigatorio: true },
      { campo: "temperatura_saida", label: "Temperatura no Embarque (ºC)", tipo: "number", obrigatorio: true },
      { campo: "temperatura_chegada", label: "Temperatura no Desembarque (ºC)", tipo: "number", obrigatorio: true },
      { campo: "condicao_bau", label: "Condição de Higiene do Baú", tipo: "select", opcoes: ["Conforme", "Não Conforme"], obrigatorio: true },
    ]
  },
  {
    id: "LAU_PGRS",
    prefixo: "PGR",
    nome: "Plano de Gerenciamento de Resíduos (PGRS/PGRSS)",
    descricao: "Controle de descarte de resíduos sólidos e de saúde, destinação de efluentes e logística reversa.",
    area_atuacao: ["industria_poa", "pequenos_animais", "laticinios", "frigorificos"],
    legislacao: "RDC ANVISA 222/2018",
    campos_conteudo: [
      { campo: "classificacao_residuos", label: "Classificação dos Resíduos Gerados (Grupos A, B, C, D, E)", tipo: "textarea", obrigatorio: true },
      { campo: "empresa_coleta", label: "Empresa Contratada para Coleta Especial (CNPJ)", tipo: "text", obrigatorio: true },
      { campo: "documento_gerado", label: "Conteúdo Integral do Plano (Editável)", tipo: "documento_ia", obrigatorio: true },
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
