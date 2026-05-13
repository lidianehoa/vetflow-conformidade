// ============================================================
// checklistsRT.js
// Sistema de checklists do RT Médico Veterinário
// Baseado no JSON oficial do sistema de checklists RT v1.0.0
// ============================================================

// ── Constantes de configuração ────────────────────────────────
export const RESULTADOS = {
  CONFORME:      "conforme",
  NAO_CONFORME:  "nao_conforme",
  NAO_APLICAVEL: "nao_aplicavel",
};

export const FREQUENCIAS = {
  diario:      "Diário",
  semanal:     "Semanal",
  quinzenal:   "Quinzenal",
  mensal:      "Mensal",
  trimestral:  "Trimestral",
  semestral:   "Semestral",
  anual:       "Anual",
  por_evento:  "Por Evento",
};

export const COR_FREQUENCIA = {
  diario:     "#1b4332",
  semanal:    "#0d47a1",
  mensal:     "#6a1b9a",
  semestral:  "#e65100",
  por_evento: "#b71c1c",
};

// ── Áreas de atuação ──────────────────────────────────────────
export const AREAS = {
  pequenos_animais: {
    id:      "pequenos_animais",
    nome:    "Estabelecimentos de Pequenos Animais",
    descricao: "Hospitais, clínicas, consultórios, pet shops, banho e tosa, hotéis e creches",
    icone:   "Pets",
    cor:     "#1b4332",
  },
  producao_origem_animal: {
    id:      "producao_origem_animal",
    nome:    "Indústria e Produção de Origem Animal",
    descricao: "Frigoríficos, matadouros, laticínios, pescados (SIF/SIE/SIM)",
    icone:   "Factory",
    cor:     "#0d47a1",
  },
  industria_alimentos: {
    id:      "industria_alimentos",
    nome:    "Indústria de Produtos Alimentícios",
    descricao: "Locais que produzem, fatiam, fracionam ou embalam alimentos",
    icone:   "Restaurant",
    cor:     "#6a1b9a",
  },
  comercio_agronegocio: {
    id:      "comercio_agronegocio",
    nome:    "Comércio e Agronegócio",
    descricao: "Fábricas de ração, casas agropecuárias, lojas de medicamentos veterinários",
    icone:   "Store",
    cor:     "#e65100",
  },
  producao_rural: {
    id:      "producao_rural",
    nome:    "Produção e Manejo Rural",
    descricao: "Propriedades rurais de produção animal",
    icone:   "Agriculture",
    cor:     "#2e7d32",
  },
  areas_especiais: {
    id:      "areas_especiais",
    nome:    "Áreas Especiais",
    descricao: "Laboratórios de diagnóstico, controle de pragas, pesquisa, quarentenários",
    icone:   "Science",
    cor:     "#b71c1c",
  },
  controle_pragas: {
    id:      "controle_pragas",
    nome:    "Controle de Pragas",
    descricao: "Empresas especializadas em desinsetização e desratização",
    icone:   "BugReport",
    cor:     "#424242",
  },
};

// ── Mapa tipo de estabelecimento → área ──────────────────────
export const TIPO_PARA_AREA = {
  clinica:              "pequenos_animais",
  acougue:              "producao_origem_animal",
  industria_alimentos:  "industria_alimentos",
  comercio_agronegocio: "comercio_agronegocio",
  producao_rural:       "producao_rural",
  bovinocultura_corte:  "producao_rural",
  bovinocultura_leite:  "producao_rural",
  laboratorio:          "areas_especiais",
  posto_coleta:         "areas_especiais",
  quarentenario:        "areas_especiais",
  dedetizadora:         "controle_pragas",
  creche_hotel:         "creche_hotel",
  laticinio:            "producao_origem_animal",
};

// ── Mapa tipo → IDs dos checklists disponíveis ───────────────
export const CHECKLISTS_POR_TIPO = {
  clinica:              ["PA_CK_01", "PA_CK_02", "PA_CK_03", "PA_CK_04"],
  acougue:              ["POA_CK_01", "POA_CK_02", "POA_CK_03", "POA_CK_04"],
  industria_alimentos:  ["IA_CK_01", "IA_CK_02"],
  comercio_agronegocio: ["CA_CK_01"],
  producao_rural:       ["PR_CK_01", "PR_CK_02"],
  bovinocultura_corte: [
    "PR_CK_01",      // Sanidade do Rebanho (mensal) — já existe
    "PR_CK_02",      // BEA na Propriedade (semestral) — já existe
    "BC_CK_01",      // PNCEBT — Brucelose e Tuberculose (novo)
    "BC_CK_02",      // SISBOV e Rastreabilidade (novo)
    "BC_CK_03",      // Uso Responsável de Antimicrobianos (novo)
  ],
  bovinocultura_leite: [
    "PR_CK_01",      // Sanidade do Rebanho (mensal) — já existe
    "PR_CK_02",      // BEA na Propriedade (semestral) — já existe
    "BL_CK_01",      // Qualidade do Leite — CCS e CPP (novo, quinzenal)
    "BL_CK_02",      // Higiene de Ordenha e Cadeia do Frio (novo, diário)
    "BC_CK_01",      // PNCEBT compartilhado com corte
    "BC_CK_03",      // Antimicrobianos compartilhado com corte
  ],
  laboratorio:          ["AE_CK_01", "AE_CK_02"],
  posto_coleta:         ["AE_CK_01"],
  quarentenario:        ["AE_CK_03"],
  creche_hotel:         ["CH_CK_01", "CH_CK_02"],
  laticinio:            ["LT_CK_01", "POA_CK_02", "IA_CK_01"],
};

// ── TODOS OS CHECKLISTS ───────────────────────────────────────
export const CHECKLISTS = {

  // ════════════════════════════════════════════════════════════
  // ÁREA: LATICÍNIOS
  // ════════════════════════════════════════════════════════════

  LT_CK_01: {
    id: "LT_CK_01",
    area: "producao_origem_animal",
    nome: "Auditoria Técnica — Laticínios (RIISPOA)",
    objetivo: "Garantir a segurança alimentar e conformidade técnica no processamento de leite e derivados.",
    frequencia: "mensal",
    responsavelPreenchimento: "Responsável Técnico (RT)",
    legislacao: "RIISPOA / IN 76/77 MAPA",
    cabecalho: [
      { campo: "data",        label: "Data da Inspeção", tipo: "date", obrigatorio: true },
      { campo: "responsavel", label: "RT Auditor",     tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"LT_01_01", categoria:"Recepção", desc:"Temperatura do leite na recepção (≤ 7°C)", criterio:"Termômetro calibrado; registro em planilha de recepção", class:"CRÍTICO", peso:10 },
      { id:"LT_01_02", categoria:"Recepção", desc:"Teste de Alizarol e Densidade", criterio:"Estabilidade em 72%; densidade entre 1,028 e 1,034 g/ml", class:"CRÍTICO", peso:10 },
      { id:"LT_01_03", categoria:"Processamento", desc:"Eficiência da Pasteurização", criterio:"Fosfatase negativa e Peroxidase positiva (se aplicável)", class:"CRÍTICO", peso:10 },
      { id:"LT_01_04", categoria:"Processamento", desc:"Higiene de tanques e tubulações (CIP)", criterio:"Registros de concentração química e tempo de contato", class:"MAIOR", peso:5 },
      { id:"LT_01_05", categoria:"Estocagem", desc:"Cadeia de Frio — Câmaras e Túneis", criterio:"Produtos entre 1°C e 5°C; termógrafos funcionando", class:"CRÍTICO", peso:10 },
      { id:"LT_01_06", categoria:"Expedição", desc:"Integridade de Embalagem e Rotulagem", criterio:"Número de lote e data de validade legíveis; selo SIF/SIE/SIM", class:"MAIOR", peso:5 },
      { id:"LT_01_07", categoria:"Qualidade", desc:"Laudos de Potabilidade de Água (Semestral)", criterio:"Presença de laudo laboratorial conforme Portaria 888/21", class:"CRÍTICO", peso:10 },
      { id:"LT_01_08", categoria:"Resíduos", desc:"Descarte de efluentes e soro", criterio:"Destinação ambientalmente correta e documentada", class:"MENOR", peso:2 },
    ],
    acoesCorretivas: [
      "Rejeitar carga de leite com temperatura elevada ou Alizarol instável",
      "Interromper produção em caso de falha na pasteurização",
      "Recalibrar termômetros e sensores de temperatura imediatamente",
      "Notificar a gerência sobre falhas em infraestrutura sanitária",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: PEQUENOS ANIMAIS
  // ════════════════════════════════════════════════════════════

  PA_CK_01: {
    id: "PA_CK_01",
    area: "pequenos_animais",
    nome: "Higiene e Limpeza das Instalações",
    objetivo: "Verificar as condições de higiene de todas as áreas antes da abertura e após o encerramento.",
    frequencia: "diario",
    turno: ["abertura", "encerramento"],
    responsavelPreenchimento: "Auxiliar de higienização / Técnico designado",
    responsavelVerificacao: "RT",
    legislacao: "Res. CFMV 1138/2016; RDC ANVISA 216/2004",
    cabecalho: [
      { campo: "data",        label: "Data",         tipo: "date",   obrigatorio: true },
      { campo: "turno",       label: "Turno",        tipo: "select", opcoes: ["Abertura","Encerramento"], obrigatorio: true },
      { campo: "responsavel", label: "Responsável",  tipo: "text",   obrigatorio: true },
      { campo: "visto_rt",    label: "Visto RT+CRMV",tipo: "text",   obrigatorio: true },
    ],
    itens: [
      { id:"PA_CK_01_01", categoria:"Recepção e Sala de Espera",       desc:"Piso limpo, sem resíduos visíveis",                      criterio:"Ausência de sujidades, manchas ou dejetos",                           class:"MAIOR", peso:5 },
      { id:"PA_CK_01_02", categoria:"Recepção e Sala de Espera",       desc:"Cadeiras e superfícies desinfetadas",                    criterio:"Uso de desinfetante adequado e sem odores",                           class:"MAIOR", peso:5 },
      { id:"PA_CK_01_03", categoria:"Recepção e Sala de Espera",       desc:"Lixeiras com saco plástico e tampadas",                 criterio:"Lixeiras íntegras, fechadas e identificadas",                         class:"MENOR", peso:1 },
      { id:"PA_CK_01_04", categoria:"Consultório / Sala de Atendimento",desc:"Mesa de exame desinfetada entre atendimentos",          criterio:"Uso de desinfetante aprovado após cada paciente",                     class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_05", categoria:"Consultório / Sala de Atendimento",desc:"Equipamentos (estetoscópio, otoscópio) higienizados",   criterio:"Limpeza com álcool 70% após uso",                                    class:"MAIOR", peso:5 },
      { id:"PA_CK_01_06", categoria:"Consultório / Sala de Atendimento",desc:"Descartáveis (agulhas, seringas) em coletor rígido",    criterio:"Coletor não ultrapassando 2/3 da capacidade",                        class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_07", categoria:"Centro Cirúrgico",                desc:"Paredes, piso e teto sem resíduos ou umidade excessiva", criterio:"Ausência de manchas, bolores ou acúmulo de sujidade",                 class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_08", categoria:"Centro Cirúrgico",                desc:"Mesa cirúrgica e instrumental esterilizados",            criterio:"Embalagens íntegras com indicador químico aprovado",                  class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_09", categoria:"Centro Cirúrgico",                desc:"Autoclave funcionando e registros atualizados",          criterio:"Último ciclo registrado, resultado aprovado",                        class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_10", categoria:"Internamento / Hospitalização",   desc:"Baias e caixas de internamento limpas e desinfetadas",   criterio:"Ausência de dejetos, odores e resíduos orgânicos",                   class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_11", categoria:"Internamento / Hospitalização",   desc:"Bebedouros e comedouros lavados",                        criterio:"Sem resíduos de alimento ou biofilme",                               class:"MAIOR", peso:5 },
      { id:"PA_CK_01_12", categoria:"Internamento / Hospitalização",   desc:"Colchões/camas dos pacientes limpos e secos",            criterio:"Ausência de umidade, manchas ou contaminação cruzada",               class:"MAIOR", peso:5 },
      { id:"PA_CK_01_13", categoria:"Banho e Tosa",                    desc:"Banheiras higienizadas entre atendimentos",              criterio:"Desinfecção com produto aprovado após cada animal",                   class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_14", categoria:"Banho e Tosa",                    desc:"Tesouras, pentes e lâminas desinfetados",               criterio:"Imersão em solução desinfetante entre cada animal",                   class:"MAIOR", peso:5 },
      { id:"PA_CK_01_15", categoria:"Banho e Tosa",                    desc:"Drenos e ralos desobstruídos",                          criterio:"Fluxo livre, sem acúmulo de pelo ou resíduos",                        class:"MENOR", peso:1 },
      { id:"PA_CK_01_16", categoria:"Hotel / Creche",                  desc:"Canis e gatis higienizados",                            criterio:"Piso, paredes e grades sem dejetos ou sujidades",                     class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_17", categoria:"Hotel / Creche",                  desc:"Área de soltura/passeio limpa",                         criterio:"Fezes recolhidas e área desinfetada",                                class:"MAIOR", peso:5 },
      { id:"PA_CK_01_18", categoria:"Banheiros / Vestiário",           desc:"Banheiros limpos, com sabão e papel-toalha",            criterio:"Dispensadores abastecidos e piso seco",                              class:"MAIOR", peso:5 },
      { id:"PA_CK_01_19", categoria:"Geral",                           desc:"Ausência de pragas ou indícios (fezes, roeduras)",      criterio:"Nenhum sinal de roedor, inseto ou outra praga",                      class:"CRÍTICO", peso:10 },
      { id:"PA_CK_01_20", categoria:"Geral",                           desc:"Resíduos biológicos acondicionados corretamente",       criterio:"Saco branco leitoso identificado e lacrado",                         class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Realizar limpeza e desinfecção imediata da área não conforme",
      "Registrar o desvio e a ação tomada no campo de observações",
      "Comunicar o RT para avaliação se o desvio impactar o atendimento",
      "Identificar a causa raiz e treinar o colaborador responsável",
    ],
  },

  PA_CK_02: {
    id: "PA_CK_02",
    area: "pequenos_animais",
    nome: "Higiene e Conduta dos Colaboradores",
    objetivo: "Verificar o cumprimento das normas de higiene pessoal, uso de EPI e conduta sanitária.",
    frequencia: "diario",
    turno: ["abertura"],
    responsavelPreenchimento: "RT / Supervisor",
    legislacao: "Res. CFMV 1138/2016",
    cabecalho: [
      { campo: "data",        label: "Data",          tipo: "date", obrigatorio: true },
      { campo: "responsavel", label: "Responsável",   tipo: "text", obrigatorio: true },
      { campo: "visto_rt",    label: "Visto RT",      tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"PA_CK_02_01", categoria:"Higiene Pessoal",    desc:"Colaboradores com uniformes limpos e completos",                          criterio:"Uniforme íntegro, limpo e identificado com nome/cargo",              class:"MAIOR",   peso:5 },
      { id:"PA_CK_02_02", categoria:"Higiene Pessoal",    desc:"Cabelos presos ou cobertos com touca",                                   criterio:"Nenhum fio de cabelo exposto nas áreas de manipulação",              class:"MAIOR",   peso:5 },
      { id:"PA_CK_02_03", categoria:"Higiene Pessoal",    desc:"Ausência de adornos na manipulação (anéis, pulseiras, brincos)",         criterio:"Nenhum acessório que represente risco de contaminação",              class:"MAIOR",   peso:5 },
      { id:"PA_CK_02_04", categoria:"Higiene Pessoal",    desc:"Unhas curtas, limpas e sem esmalte",                                     criterio:"Padrão para todos que manipulam animais ou alimentos",               class:"MAIOR",   peso:5 },
      { id:"PA_CK_02_05", categoria:"EPI",                desc:"Luvas descartáveis disponíveis e em uso quando necessário",              criterio:"Estoque adequado, uso correto e descarte pós-uso",                   class:"CRÍTICO", peso:10 },
      { id:"PA_CK_02_06", categoria:"EPI",                desc:"Máscaras disponíveis para procedimentos de risco",                       criterio:"Uso em cirurgias, contenção de agressivos e limpeza química",        class:"MAIOR",   peso:5 },
      { id:"PA_CK_02_07", categoria:"Higiene das Mãos",   desc:"Lavatórios com sabão, álcool gel e papel-toalha",                        criterio:"Dispensadores abastecidos em todos os pontos de higienização",       class:"CRÍTICO", peso:10 },
      { id:"PA_CK_02_08", categoria:"Higiene das Mãos",   desc:"Colaboradores higienizam as mãos antes dos atendimentos",               criterio:"Observação direta do cumprimento do protocolo",                      class:"CRÍTICO", peso:10 },
      { id:"PA_CK_02_09", categoria:"Saúde Ocupacional",  desc:"Nenhum colaborador com sintomas de doença infecciosa em contato com animais", criterio:"Verificar ausência de tosse, vômito, diarreia ou lesões cutâneas", class:"CRÍTICO", peso:10 },
      { id:"PA_CK_02_10", categoria:"Saúde Ocupacional",  desc:"ASO (Atestado de Saúde Ocupacional) vigente para todos",                criterio:"Documentação atualizada e arquivada pelo RH",                        class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Orientar e corrigir o colaborador no ato",
      "Afastar colaborador sintomático do contato com animais",
      "Registrar o desvio e agendar treinamento de reciclagem",
      "Notificar RT para avaliação de desvios recorrentes",
    ],
  },

  PA_CK_03: {
    id: "PA_CK_03",
    area: "pequenos_animais",
    nome: "Controle de Medicamentos e Estoque",
    objetivo: "Verificar condições de armazenamento, validade e controle de medicamentos veterinários.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA 16/2018; Portaria SVS/MS 344/1998",
    cabecalho: [
      { campo: "data",      label: "Data da Verificação", tipo: "date", obrigatorio: true },
      { campo: "nome_rt",   label: "Nome do RT",          tipo: "text", obrigatorio: true },
      { campo: "crmv",      label: "CRMV",                tipo: "text", obrigatorio: true },
      { campo: "assinatura",label: "Assinatura RT",       tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"PA_CK_03_01", categoria:"Armazenamento", desc:"Medicamentos armazenados em local limpo, seco e arejado",               criterio:"Ausência de umidade, luz solar direta e calor excessivo",            class:"MAIOR",   peso:5 },
      { id:"PA_CK_03_02", categoria:"Armazenamento", desc:"Refrigerador de medicamentos e vacinas entre 2°C e 8°C",               criterio:"Temperatura verificada e registrada — planilha atualizada",          class:"CRÍTICO", peso:10 },
      { id:"PA_CK_03_03", categoria:"Armazenamento", desc:"Psicotrópicos e entorpecentes em armário trancado",                    criterio:"Chave sob responsabilidade exclusiva do RT ou MV designado",         class:"CRÍTICO", peso:10 },
      { id:"PA_CK_03_04", categoria:"Validade",       desc:"Nenhum medicamento vencido em estoque",                               criterio:"Verificar data de validade de 100% dos itens no mês",                class:"CRÍTICO", peso:10 },
      { id:"PA_CK_03_05", categoria:"Validade",       desc:"Medicamentos próximos ao vencimento (<30 dias) identificados",        criterio:"Etiqueta 'USAR PRIMEIRO' e comunicação ao RT",                       class:"MAIOR",   peso:5 },
      { id:"PA_CK_03_06", categoria:"Controle",       desc:"Livro/planilha de psicotrópicos atualizado e sem rasuras",            criterio:"Todos os movimentos lançados com assinatura do responsável",         class:"CRÍTICO", peso:10 },
      { id:"PA_CK_03_07", categoria:"Controle",       desc:"Receituário veterinário arquivado por no mínimo 5 anos",              criterio:"Receitas físicas ou digitais acessíveis e organizadas",              class:"MAIOR",   peso:5 },
      { id:"PA_CK_03_08", categoria:"Descarte",       desc:"Medicamentos vencidos segregados para descarte correto",              criterio:"Não descartados no lixo comum — aguardando coleta especializada",    class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Segregar e identificar imediatamente qualquer medicamento vencido",
      "Solicitar coleta especializada para descarte de medicamentos",
      "Corrigir temperatura do refrigerador e acionar assistência técnica se necessário",
      "Atualizar planilha de controle e comunicar a equipe",
    ],
  },

  PA_CK_04: {
    id: "PA_CK_04",
    area: "pequenos_animais",
    nome: "Bem-Estar Animal — Hotel e Creche",
    objetivo: "Avaliar as condições de alojamento, manejo e bem-estar dos animais hospedados.",
    frequencia: "semestral",
    responsavelPreenchimento: "RT",
    legislacao: "Res. CFMV 1000/2012; Lei Federal 9.605/1998",
    cabecalho: [
      { campo: "data",    label: "Data da Avaliação", tipo: "date", obrigatorio: true },
      { campo: "nome_rt", label: "Nome do RT",        tipo: "text", obrigatorio: true },
      { campo: "crmv",    label: "CRMV",              tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"PA_CK_04_01", categoria:"Instalações",      desc:"Espaço mínimo adequado por animal alojado",                           criterio:"Animal consegue se deitar, levantar e virar sem dificuldade",        class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_02", categoria:"Instalações",      desc:"Temperatura e ventilação adequadas no alojamento",                    criterio:"Sem correntes de ar frio diretas ou calor excessivo",                class:"MAIOR",   peso:5 },
      { id:"PA_CK_04_03", categoria:"Instalações",      desc:"Iluminação natural ou artificial suficiente",                         criterio:"Animais conseguem realizar ciclo claro/escuro adequado",             class:"MENOR",   peso:1 },
      { id:"PA_CK_04_04", categoria:"Alimentação/Água", desc:"Água fresca disponível ad libitum para todos os animais",             criterio:"Bebedouros limpos, cheios e funcionando",                            class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_05", categoria:"Alimentação/Água", desc:"Dieta prescrita ou de rotina fornecida corretamente",                criterio:"Quantidade e frequência adequadas à espécie e porte",                class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_06", categoria:"Saúde",            desc:"Animais avaliados diariamente por funcionário treinado",             criterio:"Registro de qualquer alteração comportamental ou clínica",           class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_07", categoria:"Saúde",            desc:"Animais doentes ou suspeitos isolados dos demais",                   criterio:"Área de isolamento disponível e em uso quando necessário",           class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_08", categoria:"Comportamento",    desc:"Animais com acesso a enriquecimento ambiental",                      criterio:"Brinquedos, camas ou estímulos adequados à espécie",                class:"MAIOR",   peso:5 },
      { id:"PA_CK_04_09", categoria:"Comportamento",    desc:"Ausência de estereotipias ou comportamentos de sofrimento",          criterio:"Sem automutilação, vocalização excessiva ou apatia extrema",        class:"CRÍTICO", peso:10 },
      { id:"PA_CK_04_10", categoria:"Documentação",     desc:"Termo de responsabilidade assinado pelo tutor de cada animal",       criterio:"Documento arquivado com informações de saúde e autorização",        class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Isolar imediatamente animal com sinais de sofrimento ou doença",
      "Contatar tutor em caso de alteração clínica relevante",
      "Acionar atendimento veterinário de urgência quando necessário",
      "Registrar todas as ocorrências no prontuário do animal",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: PRODUÇÃO DE ORIGEM ANIMAL (SIM/SIF/SIE)
  // ════════════════════════════════════════════════════════════

  POA_CK_01: {
    id: "POA_CK_01",
    area: "producao_origem_animal",
    nome: "Pré-Operacional Diário de Higiene (PPHO)",
    objetivo: "Verificar as condições de higiene antes do início da produção.",
    frequencia: "diario",
    turno: ["pre_operacional"],
    responsavelPreenchimento: "Monitor de PAC / Auxiliar de Qualidade",
    responsavelVerificacao: "RT",
    legislacao: "IN MAPA 161/2022 – PAC 07",
    cabecalho: [
      { campo: "data",        label: "Data",                  tipo: "date", obrigatorio: true },
      { campo: "hora_inicio", label: "Hora de Início",        tipo: "time", obrigatorio: true },
      { campo: "area_setor",  label: "Área / Setor",          tipo: "text", obrigatorio: true },
      { campo: "monitor",     label: "Monitor Responsável",   tipo: "text", obrigatorio: true },
      { campo: "visto_rt",    label: "Visto RT",              tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"POA_CK_01_01", categoria:"Pisos e Ralos",         desc:"Pisos limpos, sem resíduos de matéria orgânica ou gordura",      criterio:"Ausência visual de sujidades após limpeza pré-operacional",         class:"CRÍTICO", peso:10 },
      { id:"POA_CK_01_02", categoria:"Pisos e Ralos",         desc:"Ralos e drenos desobstruídos e limpos",                          criterio:"Fluxo de escoamento livre, sem acúmulo de resíduos",                class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_03", categoria:"Paredes e Tetos",       desc:"Paredes sem resíduos, manchas ou bolores",                       criterio:"Superfície visualmente limpa até a altura de trabalho",             class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_04", categoria:"Paredes e Tetos",       desc:"Teto e estrutura aérea sem acúmulo de condensação",             criterio:"Ausência de goteiras, umidade ou mofo visível",                     class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_05", categoria:"Equipamentos",          desc:"Superfícies de contato com produto limpas e sanitizadas",       criterio:"Ausência de gordura, resíduo proteico ou odor",                     class:"CRÍTICO", peso:10 },
      { id:"POA_CK_01_06", categoria:"Equipamentos",          desc:"Ausência de ferrugem, tipo ou material estranho nos equipamentos",criterio:"Inspeção visual completa de todas as superfícies de contato",      class:"CRÍTICO", peso:10 },
      { id:"POA_CK_01_07", categoria:"Utensílios",            desc:"Facas, ganchos e bandejas higienizados e armazenados corretamente",criterio:"Utensílios em suportes suspensos ou superfícies sanitizadas",      class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_08", categoria:"Água e Sanitizantes",   desc:"Pontos de abastecimento de água limpos e funcionando",          criterio:"Torneiras, mangueiras e conexões íntegras e higienizadas",          class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_09", categoria:"Água e Sanitizantes",   desc:"Cloro residual livre dentro do padrão (0,2 a 2 mg/L)",         criterio:"Medido com kit colorimétrico no ponto de uso — registrado",         class:"CRÍTICO", peso:10 },
      { id:"POA_CK_01_10", categoria:"Iluminação/Proteção",   desc:"Lâmpadas com proteção contra estilhaços íntegra",              criterio:"Nenhuma lâmpada sem proteção nas áreas de manipulação",             class:"MAIOR",   peso:5 },
      { id:"POA_CK_01_11", categoria:"Pragas",                desc:"Ausência de indícios de pragas (fezes, roeduras, insetos)",     criterio:"Inspeção visual de cantos, drenos e áreas de difícil acesso",      class:"CRÍTICO", peso:10 },
      { id:"POA_CK_01_12", categoria:"Liberação",             desc:"Área liberada para início da produção",                         criterio:"Todos os itens conformes ou desvios corrigidos antes da liberação", class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Identificar o equipamento ou área com placa 'BLOQUEADO'",
      "Repetir o processo de higienização (etapas 1 a 5 do PPHO)",
      "Registrar o desvio na planilha de ações corretivas",
      "Não iniciar produção na área até liberação pelo RT",
      "Investigar causa raiz e treinar colaborador responsável",
    ],
  },

  POA_CK_02: {
    id: "POA_CK_02",
    area: "producao_origem_animal",
    nome: "Operacional de Higiene (Durante a Produção)",
    objetivo: "Monitorar as condições de higiene e boas práticas durante o turno de produção.",
    frequencia: "diario",
    turno: ["operacional"],
    responsavelPreenchimento: "Monitor de PAC",
    responsavelVerificacao: "RT",
    legislacao: "IN MAPA 161/2022 – PAC 07",
    cabecalho: [
      { campo: "data",             label: "Data",            tipo: "date", obrigatorio: true },
      { campo: "hora_verificacao", label: "Hora",            tipo: "time", obrigatorio: true },
      { campo: "setor",            label: "Setor",           tipo: "text", obrigatorio: true },
      { campo: "monitor",          label: "Monitor",         tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"POA_CK_02_01", categoria:"Higiene dos Manipuladores", desc:"Colaboradores com uniformes limpos e EPIs corretos",             criterio:"Avental, bota, luva, touca e máscara conforme o setor",             class:"CRÍTICO", peso:10 },
      { id:"POA_CK_02_02", categoria:"Higiene dos Manipuladores", desc:"Higienização das mãos realizada corretamente nos pontos de controle",criterio:"Observação direta de uso de água, sabão e sanitizante",            class:"CRÍTICO", peso:10 },
      { id:"POA_CK_02_03", categoria:"Higiene dos Manipuladores", desc:"Ausência de adornos, relógios e celulares nas áreas de produção", criterio:"Nenhum acessório pessoal nas áreas de manipulação de produto",     class:"MAIOR",   peso:5 },
      { id:"POA_CK_02_04", categoria:"Processo",                  desc:"Utensílios higienizados ao cair no chão ou tocar superfície não sanitizada",criterio:"Retirada imediata para re-higienização — sem retorno direto", class:"CRÍTICO", peso:10 },
      { id:"POA_CK_02_05", categoria:"Processo",                  desc:"Recolha contínua de subprodutos e resíduos das áreas de passagem",criterio:"Ausência de acúmulo de resíduos no chão durante a produção",       class:"MAIOR",   peso:5 },
      { id:"POA_CK_02_06", categoria:"Processo",                  desc:"Produto acabado protegido de contaminação cruzada",             criterio:"Separação física entre matéria-prima e produto processado",         class:"CRÍTICO", peso:10 },
      { id:"POA_CK_02_07", categoria:"Temperaturas",              desc:"Temperatura das câmaras dentro dos limites críticos",           criterio:"Câmaras de resfriado ≤4°C; congelado ≤-18°C",                      class:"CRÍTICO", peso:10 },
      { id:"POA_CK_02_08", categoria:"Temperaturas",              desc:"Temperatura interna do produto dentro do padrão",              criterio:"Medição com termômetro calibrado conforme frequência do APPCC",     class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Corrigir imediatamente o desvio identificado",
      "Isolar o lote ou produto potencialmente contaminado para avaliação",
      "Registrar o desvio na planilha de monitorização operacional",
      "Comunicar RT para avaliação de desvios críticos",
    ],
  },

  POA_CK_03: {
    id: "POA_CK_03",
    area: "producao_origem_animal",
    nome: "Controle de Pragas",
    objetivo: "Inspecionar barreiras físicas, iscas e indícios de pragas.",
    frequencia: "semanal",
    responsavelPreenchimento: "Monitor de PAC / Empresa terceirizada",
    responsavelVerificacao: "RT",
    legislacao: "IN MAPA 161/2022 – PAC 09",
    cabecalho: [
      { campo: "data",          label: "Data da Inspeção",      tipo: "date", obrigatorio: true },
      { campo: "inspetor",      label: "Inspetor Responsável",  tipo: "text", obrigatorio: true },
      { campo: "empresa_pragas",label: "Empresa de Pragas (se terceirizada)",tipo:"text", obrigatorio: false },
      { campo: "visto_rt",      label: "Visto RT",              tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"POA_CK_03_01", categoria:"Barreiras Físicas", desc:"Portas e janelas com telas ou cortinas de ar funcionando",         criterio:"Nenhuma abertura sem barreira física para entrada de pragas",       class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_02", categoria:"Barreiras Físicas", desc:"Ralos com telas ou tampas anti-roedores",                         criterio:"Proteções íntegras e fixadas corretamente",                         class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_03", categoria:"Barreiras Físicas", desc:"Ausência de frestas em paredes, pisos ou rodapés",                criterio:"Nenhuma abertura ≥1cm sem vedação adequada",                        class:"MAIOR",   peso:5 },
      { id:"POA_CK_03_04", categoria:"Iscas e Armadilhas",desc:"Iscas raticidas íntegras e posicionadas conforme mapa",           criterio:"Todas as iscas do mapa verificadas e registradas",                  class:"MAIOR",   peso:5 },
      { id:"POA_CK_03_05", categoria:"Iscas e Armadilhas",desc:"Nenhuma isca dentro das áreas de manipulação de produto",        criterio:"Iscas apenas em áreas externas, casas de força e armazéns",        class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_06", categoria:"Indícios de Pragas",desc:"Ausência de fezes de roedores nas áreas inspecionadas",           criterio:"Inspeção de cantos, prateleiras, drenos e áreas escuras",          class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_07", categoria:"Indícios de Pragas",desc:"Ausência de insetos voadores ou rasteiros nas áreas de produção", criterio:"Inspeção visual e monitoramento de armadilhas luminosas",          class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_08", categoria:"Indícios de Pragas",desc:"Ausência de roeduras em embalagens, paredes ou cabos elétricos", criterio:"Inspeção de almoxarifado, câmaras e áreas periféricas",             class:"CRÍTICO", peso:10 },
      { id:"POA_CK_03_09", categoria:"Arredores",         desc:"Área externa sem acúmulo de resíduos ou entulho",                criterio:"Sem materiais que possam servir de abrigo para pragas",             class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Vedar imediatamente frestas e aberturas identificadas",
      "Acionar empresa de controle de pragas para reforço de aplicação",
      "Intensificar limpeza na área com indícios de praga",
      "Registrar e comunicar RT — avaliar impacto nos produtos",
    ],
  },

  POA_CK_04: {
    id: "POA_CK_04",
    area: "producao_origem_animal",
    nome: "Verificação dos 13 PACs",
    objetivo: "Verificar se todos os Programas de Autocontrole estão sendo implementados.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA 161/2022",
    cabecalho: [
      { campo: "mes_ano",          label: "Mês/Ano de Referência", tipo: "text", obrigatorio: true },
      { campo: "data_verificacao", label: "Data da Verificação",   tipo: "date", obrigatorio: true },
      { campo: "nome_rt",          label: "Nome do RT",            tipo: "text", obrigatorio: true },
      { campo: "crmv",             label: "CRMV",                  tipo: "text", obrigatorio: true },
      { campo: "assinatura",       label: "Assinatura RT",         tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"POA_CK_04_01", categoria:"PACs", desc:"PAC 01 – Manutenção: registros preventivos atualizados",             criterio:"Planilhas preenchidas e ações corretivas documentadas",               class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_02", categoria:"PACs", desc:"PAC 02 – Vestuários e Higiene: exames e treinamentos em dia",        criterio:"ASOs vigentes e registros de treinamento arquivados",                class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_03", categoria:"PACs", desc:"PAC 03 – Iluminação: proteções íntegras e intensidade adequada",     criterio:"Inspeção visual realizada e registrada",                             class:"MAIOR",   peso:5 },
      { id:"POA_CK_04_04", categoria:"PACs", desc:"PAC 04 – Ventilação: sistema funcionando, sem condensação excessiva",criterio:"Filtros limpos e registros de manutenção atualizados",               class:"MAIOR",   peso:5 },
      { id:"POA_CK_04_05", categoria:"PACs", desc:"PAC 05 – Águas Residuárias: sistema de efluentes funcionando",       criterio:"Sem refluxo, odores ou vazamentos no sistema de esgoto",           class:"MAIOR",   peso:5 },
      { id:"POA_CK_04_06", categoria:"PACs", desc:"PAC 06 – Calibração: instrumentos dentro do prazo",                 criterio:"Certificados vigentes e plano de calibração atualizado",             class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_07", categoria:"PACs", desc:"PAC 07 – PPHO: checklists pré e operacional preenchidos diariamente",criterio:"100% dos dias de produção com registros",                          class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_08", categoria:"PACs", desc:"PAC 08 – Água: análises de cloro diárias e laudo semestral",        criterio:"Planilhas de cloro completas e laudo laboratorial vigente",         class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_09", categoria:"PACs", desc:"PAC 09 – Pragas: visitas da empresa e mapa de iscas atualizados",   criterio:"Relatórios de visita arquivados e mapa de iscas conferido",         class:"MAIOR",   peso:5 },
      { id:"POA_CK_04_10", categoria:"PACs", desc:"PAC 10 – Matéria-Prima: registros de recebimento e fornecedores",   criterio:"Planilhas de recebimento completas e laudos de fornecedores",       class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_11", categoria:"PACs", desc:"PAC 11 – Temperaturas: registros de câmaras e expedição completos", criterio:"Nenhum dia de produção sem registro de temperatura",                class:"CRÍTICO", peso:10 },
      { id:"POA_CK_04_12", categoria:"PACs", desc:"PAC 12 – Bem-Estar Animal: registros de abate/insensibilização",    criterio:"Checklists de bem-estar pré-abate preenchidos e arquivados",        class:"MAIOR",   peso:5 },
      { id:"POA_CK_04_13", categoria:"PACs", desc:"PAC 13 – Rastreabilidade: lotes identificados e recall atualizado", criterio:"Planilhas de lote completas e simulação de recall registrada",      class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Identificar PAC com não conformidade e aplicar ação corretiva imediata",
      "Atualizar registros em atraso com data de regularização",
      "Registrar desvios no relatório mensal do RT",
      "Planejar treinamento para equipes com desvios recorrentes",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: INDÚSTRIA DE ALIMENTOS
  // ════════════════════════════════════════════════════════════

  IA_CK_01: {
    id: "IA_CK_01",
    area: "industria_alimentos",
    nome: "Boas Práticas de Fabricação (BPF)",
    objetivo: "Verificar o cumprimento das BPF nas áreas de produção, manipulação e embalagem.",
    frequencia: "diario",
    responsavelPreenchimento: "Supervisor de Qualidade / RT",
    legislacao: "RDC ANVISA 275/2002; RDC ANVISA 216/2004",
    cabecalho: [
      { campo: "data",         label: "Data",           tipo: "date", obrigatorio: true },
      { campo: "area_avaliada",label: "Área Avaliada",  tipo: "text", obrigatorio: true },
      { campo: "avaliador",    label: "Avaliador",      tipo: "text", obrigatorio: true },
      { campo: "visto_rt",     label: "Visto RT",       tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"IA_CK_01_01", categoria:"Instalações",        desc:"Área de produção limpa, organizada e sem materiais estranhos",     criterio:"Apenas materiais necessários à produção presentes na área",         class:"MAIOR",   peso:5 },
      { id:"IA_CK_01_02", categoria:"Instalações",        desc:"Fluxo de produção sem cruzamento de cru e processado",            criterio:"Separação física ou temporal entre produtos em diferentes estágios", class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_03", categoria:"Instalações",        desc:"Equipamentos em bom estado de conservação",                       criterio:"Sem peças soltas, ferrugem ou avarias que possam contaminar",      class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_04", categoria:"Manipuladores",      desc:"Todos os manipuladores com uniforme completo e limpo",            criterio:"Avental, touca, bota e luva conforme exigência da área",           class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_05", categoria:"Manipuladores",      desc:"Lavagem de mãos realizada nos momentos corretos",                 criterio:"Ao entrar na área, trocar de atividade e após sanitário",          class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_06", categoria:"Manipuladores",      desc:"Nenhum manipulador com sinais de doença infecciosa",             criterio:"Colaboradores sintomáticos afastados da manipulação",               class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_07", categoria:"Matérias-Primas",    desc:"Matérias-primas identificadas com lote e validade",              criterio:"Etiquetagem legível em todos os insumos em uso",                    class:"MAIOR",   peso:5 },
      { id:"IA_CK_01_08", categoria:"Matérias-Primas",    desc:"Nenhuma matéria-prima vencida em uso ou estoque ativo",          criterio:"Verificação de validade de 100% dos insumos do dia",                class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_09", categoria:"Temperaturas",       desc:"Temperatura de produção dentro do padrão estabelecido",          criterio:"Medição e registro conforme plano APPCC ou BPF",                    class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_10", categoria:"Embalagem/Rotulagem",desc:"Rótulos conferem com o produto embalado",                        criterio:"Nome, lote, validade e declaração nutricional corretos",            class:"CRÍTICO", peso:10 },
      { id:"IA_CK_01_11", categoria:"Embalagem/Rotulagem",desc:"Embalagens íntegras, limpas e sem contaminação prévia",          criterio:"Nenhuma embalagem amassada, rasgada ou com sujidade",               class:"MAIOR",   peso:5 },
      { id:"IA_CK_01_12", categoria:"Resíduos",           desc:"Resíduos recolhidos frequentemente e acondicionados corretamente",criterio:"Lixeiras tampadas, identificadas e esvaziadas conforme rotina",     class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Corrigir o desvio imediatamente e segregar produto potencialmente afetado",
      "Registrar o desvio e a ação corretiva",
      "Avaliar necessidade de reprocessamento ou descarte do produto",
      "Comunicar RT para desvios que impactem a segurança do alimento",
    ],
  },

  IA_CK_02: {
    id: "IA_CK_02",
    area: "industria_alimentos",
    nome: "Controle de Pragas e Condições Estruturais",
    objetivo: "Verificar o controle integrado de pragas e a integridade das instalações físicas.",
    frequencia: "semanal",
    responsavelPreenchimento: "RT / Supervisor de Qualidade",
    legislacao: "RDC ANVISA 275/2002; Portaria CVS-15/2009",
    cabecalho: [
      { campo: "data",       label: "Data",         tipo: "date", obrigatorio: true },
      { campo: "responsavel",label: "Responsável",  tipo: "text", obrigatorio: true },
      { campo: "visto_rt",   label: "Visto RT",     tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"IA_CK_02_01", categoria:"Estrutura", desc:"Paredes, pisos e tetos sem rachaduras ou descascamentos",            criterio:"Superfícies íntegras, laváveis e em bom estado de conservação",    class:"MAIOR",   peso:5 },
      { id:"IA_CK_02_02", categoria:"Estrutura", desc:"Telas nas aberturas para ventilação íntegras",                       criterio:"Malha ≤2mm, sem rasgos ou buracos",                                  class:"MAIOR",   peso:5 },
      { id:"IA_CK_02_03", categoria:"Pragas",    desc:"Iscas e armadilhas verificadas conforme mapa",                       criterio:"Todas as iscas inspecionadas e estado registrado",                  class:"MAIOR",   peso:5 },
      { id:"IA_CK_02_04", categoria:"Pragas",    desc:"Armadilhas luminosas para insetos limpas e com lâmpada funcionando", criterio:"Bandeja coletora vazia e lâmpada UV ativa",                         class:"MENOR",   peso:1 },
      { id:"IA_CK_02_05", categoria:"Pragas",    desc:"Área externa sem acúmulo de resíduos ou entulho",                   criterio:"Sem materiais que possam servir de abrigo para vetores",            class:"MAIOR",   peso:5 },
      { id:"IA_CK_02_06", categoria:"Pragas",    desc:"Nenhum indício de praga dentro das áreas de produção",              criterio:"Ausência de fezes, roeduras, ninhos ou insetos",                    class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Acionar empresa de controle de pragas para inspeção e tratamento",
      "Vedar frestas e aberturas identificadas imediatamente",
      "Intensificar limpeza nas áreas com indícios de praga",
      "Registrar e comunicar RT — avaliar impacto nos produtos fabricados",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: COMÉRCIO E AGRONEGÓCIO
  // ════════════════════════════════════════════════════════════

  CA_CK_01: {
    id: "CA_CK_01",
    area: "comercio_agronegocio",
    nome: "Condições do Estabelecimento e Estoque",
    objetivo: "Verificar as condições sanitárias do estabelecimento, armazenamento e documentação.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA 16/2018; Decreto Federal 9.013/2017",
    cabecalho: [
      { campo: "data",      label: "Data",           tipo: "date", obrigatorio: true },
      { campo: "nome_rt",   label: "Nome do RT",     tipo: "text", obrigatorio: true },
      { campo: "crmv",      label: "CRMV",           tipo: "text", obrigatorio: true },
      { campo: "assinatura",label: "Assinatura RT",  tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"CA_CK_01_01", categoria:"Instalações",   desc:"Estabelecimento limpo, organizado e sem acúmulo de resíduos",         criterio:"Pisos, prateleiras e bancadas limpos e organizados",                class:"MAIOR",   peso:5 },
      { id:"CA_CK_01_02", categoria:"Instalações",   desc:"Ausência de pragas ou indícios no interior do estabelecimento",       criterio:"Inspeção de prateleiras, cantos e armazém",                         class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_03", categoria:"Armazenamento", desc:"Medicamentos veterinários armazenados conforme recomendação do fabricante",criterio:"Temperatura, umidade e luminosidade dentro dos padrões do rótulo", class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_04", categoria:"Armazenamento", desc:"Refrigerador de vacinas e biológicos entre 2°C e 8°C",               criterio:"Termômetro verificado e registrado diariamente",                    class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_05", categoria:"Armazenamento", desc:"Nenhum produto vencido disponível para venda",                        criterio:"Verificação de 100% do estoque ativo — itens vencidos segregados",  class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_06", categoria:"Armazenamento", desc:"Psicotrópicos e entorpecentes em armário trancado",                  criterio:"Acesso restrito ao RT e pessoal autorizado",                        class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_07", categoria:"Documentação",  desc:"ART do RT vigente e afixada ou disponível no estabelecimento",       criterio:"ART dentro do prazo de validade registrado no CRMV",                class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_08", categoria:"Documentação",  desc:"Livro de receituário veterinário atualizado",                        criterio:"Todos os movimentos lançados sem rasuras",                          class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_09", categoria:"Documentação",  desc:"Licença sanitária e alvará vigentes",                                criterio:"Documentos dentro do prazo e disponíveis para fiscalização",        class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_10", categoria:"Documentação",  desc:"Registros MAPA de todos os produtos comercializados em arquivo",     criterio:"Nenhum produto sem registro válido à venda",                        class:"CRÍTICO", peso:10 },
      { id:"CA_CK_01_11", categoria:"Equipe",        desc:"Funcionários treinados para orientação correta sobre uso de medicamentos",criterio:"Registro de treinamento atualizado no último ano",               class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Retirar imediatamente produtos vencidos ou sem registro de circulação",
      "Corrigir temperatura do refrigerador e acionar assistência técnica se necessário",
      "Regularizar documentação com prazo máximo de 30 dias",
      "Registrar desvios e comunicar ao órgão competente se exigido",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: PRODUÇÃO RURAL
  // ════════════════════════════════════════════════════════════

  PR_CK_01: {
    id: "PR_CK_01",
    area: "producao_rural",
    nome: "Sanidade do Rebanho",
    objetivo: "Avaliar o status sanitário do rebanho, vacinação e uso de medicamentos.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT / Produtor",
    legislacao: "IN MAPA 44/2007; IN MAPA 10/2017; Regulamentos estaduais de defesa sanitária",
    cabecalho: [
      { campo: "data",        label: "Data",               tipo: "date", obrigatorio: true },
      { campo: "propriedade", label: "Nome da Propriedade",tipo: "text", obrigatorio: true },
      { campo: "municipio_uf",label: "Município / UF",     tipo: "text", obrigatorio: true },
      { campo: "nome_rt",     label: "Nome do RT",         tipo: "text", obrigatorio: true },
      { campo: "crmv",        label: "CRMV",               tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"PR_CK_01_01", categoria:"Vacinação",       desc:"Vacinação antiaftosa em dia conforme calendário da UF",                 criterio:"Comprovante de vacinação da última campanha arquivado",             class:"CRÍTICO", peso:10 },
      { id:"PR_CK_01_02", categoria:"Vacinação",       desc:"Vacinação contra brucelose das fêmeas entre 3 e 8 meses",              criterio:"Registro de vacinação com lote e MV responsável",                   class:"CRÍTICO", peso:10 },
      { id:"PR_CK_01_03", categoria:"Vacinação",       desc:"Calendário de vacinação para clostridiose e outras doenças atualizado", criterio:"Planilha de vacinação preenchida e arquivada",                      class:"MAIOR",   peso:5 },
      { id:"PR_CK_01_04", categoria:"Exames",          desc:"Testes de brucelose e tuberculose realizados conforme PNCEBT",          criterio:"Resultados negativos dentro do prazo de validade exigido",         class:"CRÍTICO", peso:10 },
      { id:"PR_CK_01_05", categoria:"Medicamentos",    desc:"Estoque de medicamentos dentro do prazo de validade",                   criterio:"Verificação de 100% dos produtos em estoque na propriedade",       class:"MAIOR",   peso:5 },
      { id:"PR_CK_01_06", categoria:"Medicamentos",    desc:"Período de carência respeitado para animais em tratamento",            criterio:"Nenhum animal em tratamento enviado ao abate antes do fim da carência",class:"CRÍTICO",peso:10 },
      { id:"PR_CK_01_07", categoria:"Rastreabilidade", desc:"Todos os animais com identificação individual (brinco/SISBOV)",         criterio:"100% dos animais acima do peso mínimo legalmente exigido identificados",class:"MAIOR",peso:5 },
      { id:"PR_CK_01_08", categoria:"Rastreabilidade", desc:"GTAs emitidas para todas as movimentações do período",                 criterio:"Arquivo de GTAs do mês completo e sem pendências",                  class:"CRÍTICO", peso:10 },
      { id:"PR_CK_01_09", categoria:"Mortalidade",     desc:"Registro de mortalidade atualizado com causas identificadas",          criterio:"Nenhuma morte sem registro e destinação correta da carcaça",       class:"MAIOR",   peso:5 },
      { id:"PR_CK_01_10", categoria:"Instalações",     desc:"Bebedouros e cochos limpos e funcionando",                             criterio:"Sem lodo, algas ou sujidades que comprometam a qualidade",         class:"MAIOR",   peso:5 },
      { id:"PR_CK_01_11", categoria:"Instalações",     desc:"Área de descarte de carcaças adequada (compostagem, fosso, etc.)",     criterio:"Método de descarte aprovado pela defesa sanitária em funcionamento",class:"CRÍTICO",peso:10 },
    ],
    acoesCorretivas: [
      "Agendar vacinações ou exames em atraso imediatamente",
      "Bloquear movimentação de animais com pendências sanitárias",
      "Notificar a defesa sanitária estadual em caso de suspeita de doença de notificação obrigatória",
      "Registrar todas as ações no diário sanitário da propriedade",
    ],
  },

  PR_CK_02: {
    id: "PR_CK_02",
    area: "producao_rural",
    nome: "Bem-Estar Animal na Propriedade",
    objetivo: "Avaliar as condições de bem-estar dos animais nas instalações e no manejo diário.",
    frequencia: "semestral",
    responsavelPreenchimento: "RT",
    legislacao: "Res. CFMV 1000/2012; Lei Federal 9.605/1998",
    cabecalho: [
      { campo: "data",        label: "Data da Avaliação",tipo: "date", obrigatorio: true },
      { campo: "propriedade", label: "Propriedade",      tipo: "text", obrigatorio: true },
      { campo: "nome_rt",     label: "Nome do RT",       tipo: "text", obrigatorio: true },
      { campo: "crmv",        label: "CRMV",             tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"PR_CK_02_01", categoria:"Liberdades BEA", desc:"Animais livres de fome e sede",                              criterio:"Acesso a água potável e alimentação suficiente ad libitum ou conforme manejo",class:"CRÍTICO",peso:10 },
      { id:"PR_CK_02_02", categoria:"Liberdades BEA", desc:"Animais livres de desconforto",                             criterio:"Abrigo adequado contra sol, chuva e temperatura extrema",            class:"CRÍTICO", peso:10 },
      { id:"PR_CK_02_03", categoria:"Liberdades BEA", desc:"Animais livres de dor, lesão e doença",                     criterio:"Ausência de animais com lesões não tratadas, claudicação severa ou doença",class:"CRÍTICO",peso:10 },
      { id:"PR_CK_02_04", categoria:"Liberdades BEA", desc:"Animais livres para expressar comportamento natural",       criterio:"Espaço adequado para locomoção, interação social e descanso",        class:"MAIOR",   peso:5 },
      { id:"PR_CK_02_05", categoria:"Liberdades BEA", desc:"Animais livres de medo e sofrimento",                       criterio:"Ausência de práticas abusivas, maus-tratos ou confinamento excessivo",class:"CRÍTICO",peso:10 },
      { id:"PR_CK_02_06", categoria:"Instalações",    desc:"Instalações sem pontas cortantes ou materiais perigosos expostos",criterio:"Inspeção visual de currais, cercas, cochos e abrigos",           class:"MAIOR",   peso:5 },
      { id:"PR_CK_02_07", categoria:"Manejo",         desc:"Uso de instrumentos de manejo adequados (sem choques excessivos)",criterio:"Uso racional de bastões — sem agressão injustificada",           class:"CRÍTICO", peso:10 },
      { id:"PR_CK_02_08", categoria:"Manejo",         desc:"Funcionários treinados em manejo humanitário",              criterio:"Registro de treinamento de bem-estar animal para a equipe",         class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Tratar imediatamente animais com sinais de dor ou doença",
      "Corrigir instalações que ofereçam risco físico aos animais",
      "Capacitar equipe em manejo humanitário",
      "Registrar e comunicar autoridade competente em casos de maus-tratos identificados",
    ],
  },

// ════════════════════════════════════════════════════════════════
// CHECKLISTS COMPARTILHADOS — BOVINOS (CORTE E LEITE)
// ════════════════════════════════════════════════════════════════

  BC_CK_01: {
    id: "BC_CK_01",
    area: "producao_rural",
    nome: "PNCEBT — Controle de Brucelose e Tuberculose",
    objetivo: "Verificar o cumprimento do Programa Nacional de Controle e Erradicação da Brucelose e da Tuberculose Bovina.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA 10/2017 (PNCEBT); IN MAPA 44/2007",
    itens: [
      { id:"BC_CK01_01", categoria:"Brucelose",       desc:"Fêmeas entre 3 e 8 meses vacinadas contra brucelose (B19 ou RB51)?",                class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_02", categoria:"Brucelose",       desc:"Comprovante de vacinação antibrucela com lote, data e MV responsável arquivado?",    class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_03", categoria:"Brucelose",       desc:"Resultado do teste de brucelose (último exame) dentro do prazo de validade?",        class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_04", categoria:"Tuberculose",     desc:"Resultado do teste de tuberculinização (PPD) dentro do prazo de validade?",          class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_05", categoria:"Tuberculose",     desc:"Laudo veterinário do teste de tuberculinização assinado por MV habilitado pelo MAPA?",class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_06", categoria:"Trânsito",        desc:"GTAs emitidas para 100% das movimentações — sem animais sem GTA no período?",       class:"CRÍTICO", peso:10, ref:"IN MAPA 44/2007" },
      { id:"BC_CK01_07", categoria:"Trânsito",        desc:"Animais positivos ou suspeitos isolados e com destinação documental registrada?",   class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_08", categoria:"Registros",       desc:"Arquivo de resultados de exames do PNCEBT organizado por animal e data?",           class:"MAIOR",   peso:5,  ref:"IN MAPA 10/2017 — PNCEBT" },
      { id:"BC_CK01_09", categoria:"Notificação",     desc:"Animais positivos notificados à Defesa Sanitária Animal estadual imediatamente?",   class:"CRÍTICO", peso:10, ref:"IN MAPA 10/2017 — PNCEBT" },
    ],
    acoesCorretivas: [
      "Notificar imediatamente a Defesa Sanitária Animal do estado em caso de positivo",
      "Isolar o animal positivo e suspender movimentações do lote",
      "Regularizar vacinações em atraso e arquivar comprovantes",
      "Emitir GTA retroativa apenas quando autorizado pela Defesa — nunca circular sem GTA",
    ],
  },

  BC_CK_02: {
    id: "BC_CK_02",
    area: "producao_rural",
    nome: "SISBOV — Rastreabilidade e Identificação Bovina",
    objetivo: "Verificar a conformidade com o Sistema Brasileiro de Identificação e Certificação de Bovinos e Bubalinos.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT / Produtor",
    legislacao: "IN MAPA 281/2019 (SISBOV); IN MAPA 44/2007",
    itens: [
      { id:"BC_CK02_01", categoria:"Identificação",   desc:"100% dos animais acima do peso mínimo exigido com brinco SISBOV instalado?",         class:"CRÍTICO", peso:10, ref:"IN MAPA 281/2019" },
      { id:"BC_CK02_02", categoria:"Identificação",   desc:"Brincos íntegros e legíveis em todos os animais (sem brincos caídos não repostos)?", class:"MAIOR",   peso:5,  ref:"IN MAPA 281/2019" },
      { id:"BC_CK02_03", categoria:"Identificação",   desc:"Reposição de brincos caídos registrada com código e data no sistema?",               class:"MAIOR",   peso:5,  ref:"IN MAPA 281/2019" },
      { id:"BC_CK02_04", categoria:"Cadastro",        desc:"Cadastro da propriedade no SISBOV/Certifica Minas ou sistema estadual vigente?",     class:"CRÍTICO", peso:10, ref:"IN MAPA 281/2019" },
      { id:"BC_CK02_05", categoria:"Cadastro",        desc:"Planilha de Inventário do rebanho atualizada com nascimentos, mortes e transferências?", class:"CRÍTICO", peso:10, ref:"IN MAPA 281/2019" },
      { id:"BC_CK02_06", categoria:"Trânsito",        desc:"GTAs de saída contêm número de brinco SISBOV de todos os animais enviados?",         class:"CRÍTICO", peso:10, ref:"IN MAPA 281/2019; IN MAPA 44/2007" },
      { id:"BC_CK02_07", categoria:"CAR",             desc:"Cadastro Ambiental Rural (CAR) da propriedade ativo e regularizado?",                 class:"MAIOR",   peso:5,  ref:"Lei 12.651/2012 — Código Florestal" },
      { id:"BC_CK02_08", categoria:"Registros",       desc:"Registros de nascimento lançados no sistema dentro de 30 dias do evento?",           class:"MAIOR",   peso:5,  ref:"IN MAPA 281/2019" },
    ],
    acoesCorretivas: [
      "Repor brincos caídos imediatamente e registrar no sistema",
      "Regularizar animais não identificados antes de qualquer movimentação",
      "Atualizar o inventário com nascimentos, mortes e compras pendentes",
      "Contatar o credenciador SISBOV caso haja inconsistência no cadastro",
    ],
  },

  BC_CK_03: {
    id: "BC_CK_03",
    area: "producao_rural",
    nome: "Uso Responsável de Antimicrobianos e Controle de Medicamentos",
    objetivo: "Verificar o uso racional de antimicrobianos e o cumprimento do receituário veterinário obrigatório.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA 44/2020; Portaria MS 344/1998; Decreto 6.296/2007",
    itens: [
      { id:"BC_CK03_01", categoria:"Receituário",     desc:"Receituário veterinário emitido para 100% dos antimicrobianos utilizados no período?", class:"CRÍTICO", peso:10, ref:"IN MAPA 44/2020" },
      { id:"BC_CK03_02", categoria:"Receituário",     desc:"Receituário assinado por MV e arquivado por no mínimo 3 anos?",                       class:"CRÍTICO", peso:10, ref:"IN MAPA 44/2020" },
      { id:"BC_CK03_03", categoria:"Carência",        desc:"Período de carência respeitado para todos os animais em tratamento antes do abate?",  class:"CRÍTICO", peso:10, ref:"Decreto 6.296/2007; Bula do produto" },
      { id:"BC_CK03_04", categoria:"Carência",        desc:"Animais em tratamento marcados/identificados e separados do lote de abate?",          class:"CRÍTICO", peso:10, ref:"RIISPOA" },
      { id:"BC_CK03_05", categoria:"Estoque",         desc:"Estoque de antimicrobianos e psicotrópicos em armário trancado sob responsabilidade do RT?", class:"CRÍTICO", peso:10, ref:"Portaria MS 344/1998" },
      { id:"BC_CK03_06", categoria:"Estoque",         desc:"Nenhum medicamento vencido em estoque ativo na propriedade?",                         class:"CRÍTICO", peso:10, ref:"IN MAPA 44/2020" },
      { id:"BC_CK03_07", categoria:"Descarte",        desc:"Embalagens vazias de medicamentos destinadas corretamente (devolução ao canal logístico reverso)?", class:"MAIOR", peso:5, ref:"Lei 12.305/2010; SINDAN" },
      { id:"BC_CK03_08", categoria:"Descarte",        desc:"Medicamentos vencidos segregados para devolução ao fornecedor ou descarte especializado?", class:"MAIOR", peso:5, ref:"Lei 12.305/2010" },
      { id:"BC_CK03_09", categoria:"Registros",       desc:"Ficha de controle de medicamentos por animal preenchida para cada tratamento?",       class:"MAIOR",   peso:5,  ref:"IN MAPA 44/2020" },
    ],
    acoesCorretivas: [
      "Emitir receituário retroativo APENAS quando legalmente permitido — jamais aplicar sem receita",
      "Isolar imediatamente animais em carência e registrar data prevista de liberação",
      "Segregar medicamentos vencidos e acionar canal logístico reverso",
      "Comunicar ao RT qualquer aplicação de medicamento fora do protocolo",
    ],
  },

// ════════════════════════════════════════════════════════════════
// CHECKLISTS EXCLUSIVOS — BOVINOS DE LEITE
// ════════════════════════════════════════════════════════════════

  BL_CK_01: {
    id: "BL_CK_01",
    area: "producao_rural",
    nome: "Qualidade do Leite — CCS e CPP",
    objetivo: "Monitorar a Contagem de Células Somáticas (CCS) e a Contagem Padrão em Placa (CPP) conforme o PNQL.",
    frequencia: "quinzenal",
    responsavelPreenchimento: "RT / Produtor",
    legislacao: "IN MAPA 76/2018 (PNQL); IN MAPA 77/2018",
    itens: [
      { id:"BL_CK01_01", categoria:"CCS",             desc:"CCS do último boletim do laboratório credenciado dentro do limite legal (≤500.000 cél/mL)?", class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018 — limite CCS" },
      { id:"BL_CK01_02", categoria:"CCS",             desc:"Boletim de CCS do laboratório arquivado e disponível para fiscalização?",                    class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018" },
      { id:"BL_CK01_03", categoria:"CPP",             desc:"CPP do último boletim dentro do limite legal (≤300.000 UFC/mL)?",                            class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018 — limite CPP" },
      { id:"BL_CK01_04", categoria:"CPP",             desc:"Boletim de CPP do laboratório arquivado e disponível para fiscalização?",                    class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018" },
      { id:"BL_CK01_05", categoria:"Coleta",          desc:"Leite coletado por laboratório credenciado pela RBQL (Rede Brasileira de Laboratórios)?",    class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018" },
      { id:"BL_CK01_06", categoria:"Coleta",          desc:"Frequência de coleta para análise conforme exigência do programa (mín. mensal)?",            class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018" },
      { id:"BL_CK01_07", categoria:"Ações",           desc:"Quando CCS > 200.000: protocolo de prevenção de mastite sendo implementado?",                class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018; Boas práticas" },
      { id:"BL_CK01_08", categoria:"Ações",           desc:"Quando CPP > 100.000: revisão do protocolo de higiene de ordenha iniciada?",                class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018; Boas práticas" },
      { id:"BL_CK01_09", categoria:"Registros",       desc:"Histórico dos últimos 12 meses de CCS e CPP arquivado e disponível para o RT?",             class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018" },
    ],
    acoesCorretivas: [
      "CCS > 500.000 ou CPP > 300.000: revisar higiene de ordenha imediatamente e notificar laticínio",
      "Identificar vacas problema (CMT) e tratar ou descartar",
      "Calibrar equipamento de ordenha e verificar pré e pós-dipping",
      "Registrar todas as ações no relatório mensal do RT",
    ],
  },

  BL_CK_02: {
    id: "BL_CK_02",
    area: "producao_rural",
    nome: "Higiene de Ordenha e Cadeia do Frio",
    objetivo: "Verificar as boas práticas de ordenha e a conservação do leite desde a coleta até a expedição.",
    frequencia: "diario",
    turno: ["manhã", "tarde"],
    responsavelPreenchimento: "Responsável pela ordenha",
    legislacao: "IN MAPA 77/2018; IN MAPA 76/2018; Res. CFMV 1000/2012",
    itens: [
      { id:"BL_CK02_01", categoria:"Pré-dipping",     desc:"Pré-dipping realizado com solução antisséptica aprovada (imersão por 30 segundos)?",    class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_02", categoria:"Pré-dipping",     desc:"Tetos secos com papel toalha descartável individual antes da ordenha?",                  class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_03", categoria:"Teste",           desc:"Teste da caneca de fundo escuro realizado (primeiros jatos descartados)?",               class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_04", categoria:"Higiene do ordenhador", desc:"Ordenhador com mãos limpas, uniforme limpo e sem feridas abertas?",               class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_05", categoria:"Equipamento",     desc:"Teteiras e componentes da ordenhadeira higienizados antes da ordenha?",                  class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_06", categoria:"Pós-dipping",     desc:"Pós-dipping realizado com produto iodado ou glicerinado imediatamente após a ordenha?", class:"CRÍTICO", peso:10, ref:"IN MAPA 77/2018" },
      { id:"BL_CK02_07", categoria:"Temperatura",     desc:"Leite resfriado a ≤4°C em até 3h após a ordenha?",                                       class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018" },
      { id:"BL_CK02_08", categoria:"Temperatura",     desc:"Temperatura do tanque de resfriamento registrada e dentro do limite (≤4°C)?",            class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018" },
      { id:"BL_CK02_09", categoria:"Equipamento",     desc:"Termômetro do tanque calibrado e com registro de verificação?",                          class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018" },
      { id:"BL_CK02_10", categoria:"Saúde animal",    desc:"Vacas com mastite clínica identificadas e leite descartado (não entra no tanque)?",      class:"CRÍTICO", peso:10, ref:"IN MAPA 76/2018; Boas práticas" },
      { id:"BL_CK02_11", categoria:"Saúde animal",    desc:"Vacas em tratamento com antimicrobiano com leite descartado durante o período de carência?", class:"CRÍTICO", peso:10, ref:"IN MAPA 44/2020" },
      { id:"BL_CK02_12", categoria:"Coleta",          desc:"Caminhão tanque da coleta com certificação e condições higiênicas verificadas?",          class:"MAIOR",   peso:5,  ref:"IN MAPA 76/2018" },
    ],
    acoesCorretivas: [
      "Leite fora de temperatura: não enviar para coleta — avaliar possibilidade de resfriamento",
      "Vaca com mastite clínica: tratar, descartar leite e registrar na ficha individual",
      "Teteira com resíduo: higienizar novamente antes de usar",
      "Registrar todos os desvios e comunicar o RT para avaliação",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: ÁREAS ESPECIAIS (Laboratórios, Quarentenário)
  // ════════════════════════════════════════════════════════════

  AE_CK_01: {
    id: "AE_CK_01",
    area: "areas_especiais",
    nome: "Biossegurança em Laboratório",
    objetivo: "Verificar os protocolos de biossegurança, uso de EPI e condições dos equipamentos.",
    frequencia: "diario",
    responsavelPreenchimento: "Técnico de Laboratório / RT",
    legislacao: "Res. CONCEA; RDC ANVISA 222/2018; Boas Práticas de Laboratório (BPL)",
    cabecalho: [
      { campo: "data",             label: "Data",              tipo: "date", obrigatorio: true },
      { campo: "setor_laboratorio",label: "Setor / Laboratório",tipo: "text", obrigatorio: true },
      { campo: "responsavel",      label: "Responsável",       tipo: "text", obrigatorio: true },
      { campo: "visto_rt",         label: "Visto RT",          tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"AE_CK_01_01", categoria:"EPI e Biossegurança", desc:"Todos com jaleco, luvas e óculos ao manipular amostras",              criterio:"100% de conformidade no uso de EPIs obrigatórios",                  class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_02", categoria:"EPI e Biossegurança", desc:"Máscaras PFF2/N95 disponíveis para procedimentos de risco aerossol",   criterio:"Estoque mínimo adequado e uso correto em procedimentos aplicáveis", class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_03", categoria:"EPI e Biossegurança", desc:"Cabine de segurança biológica ligada e funcionando",                   criterio:"Fluxo de ar adequado, lâmpada UV ativa e certificado vigente",     class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_04", categoria:"Higiene",             desc:"Bancadas descontaminadas antes e após uso",                            criterio:"Uso de álcool 70% ou outro desinfetante aprovado para o nível de risco",class:"CRÍTICO",peso:10 },
      { id:"AE_CK_01_05", categoria:"Higiene",             desc:"Coletores de resíduos biológicos identificados e não ultrapassando 2/3",criterio:"Sacos brancos leitosos e coletores rígidos para perfurocortantes",  class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_06", categoria:"Equipamentos",        desc:"Geladeiras e freezers de amostras dentro dos limites de temperatura",  criterio:"Registros de temperatura verificados dentro do prazo aceitável",    class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_07", categoria:"Equipamentos",        desc:"Autoclave de resíduos com ciclo validado",                            criterio:"Último ciclo registrado com indicador biológico/químico aprovado",  class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_08", categoria:"Equipamentos",        desc:"Centrífugas e equipamentos críticos sem avarias ou vazamentos",       criterio:"Inspeção visual pré-uso com registro de não conformidades",         class:"MAIOR",   peso:5 },
      { id:"AE_CK_01_09", categoria:"Rastreabilidade",     desc:"Amostras identificadas com código, data e solicitante",               criterio:"Nenhuma amostra sem identificação completa no laboratório",         class:"CRÍTICO", peso:10 },
      { id:"AE_CK_01_10", categoria:"Acesso",              desc:"Acesso ao laboratório restrito a pessoal autorizado",                 criterio:"Portas de áreas de risco fechadas com símbolo de biorrisco",       class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Interromper o procedimento em caso de risco iminente de contaminação",
      "Realizar descontaminação da área ou equipamento afetado",
      "Registrar o incidente e comunicar o RT e o responsável de biossegurança",
      "Investigar causa raiz e atualizar protocolo se necessário",
    ],
  },

  AE_CK_02: {
    id: "AE_CK_02",
    area: "areas_especiais",
    nome: "Gestão de Animais de Laboratório",
    objetivo: "Verificar as condições de alojamento, saúde e bem-estar dos animais em pesquisa.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT / Responsável CEUA",
    legislacao: "Lei Federal 11.794/2008; Resoluções Normativas CONCEA",
    cabecalho: [
      { campo: "data",    label: "Data da Verificação",         tipo: "date", obrigatorio: true },
      { campo: "bioterio",label: "Biotério / Setor",            tipo: "text", obrigatorio: true },
      { campo: "nome_rt", label: "Nome do RT / Responsável CEUA",tipo: "text", obrigatorio: true },
      { campo: "crmv",    label: "CRMV",                        tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"AE_CK_02_01", categoria:"Alojamento",     desc:"Gaiolas e caixas-moradia limpas e com maravalha/substrato adequado",  criterio:"Troca de substrato realizada conforme protocolo do biotério",       class:"CRÍTICO", peso:10 },
      { id:"AE_CK_02_02", categoria:"Alojamento",     desc:"Temperatura do biotério entre 20°C e 24°C (roedores)",               criterio:"Registros de temperatura e umidade verificados no período",        class:"CRÍTICO", peso:10 },
      { id:"AE_CK_02_03", categoria:"Alojamento",     desc:"Ciclo claro/escuro de 12h/12h controlado automaticamente",            criterio:"Timer de iluminação funcionando e horários corretos",               class:"MAIOR",   peso:5 },
      { id:"AE_CK_02_04", categoria:"Alimentação",    desc:"Ração e água ad libitum e dentro do prazo de validade",               criterio:"Ração identificada com lote e validade — sem bolores ou umidade",  class:"CRÍTICO", peso:10 },
      { id:"AE_CK_02_05", categoria:"Saúde",          desc:"Inspeção clínica dos animais realizada diariamente por pessoal treinado",criterio:"Registros de inspeção diária arquivados",                        class:"CRÍTICO", peso:10 },
      { id:"AE_CK_02_06", categoria:"Saúde",          desc:"Animais doentes ou mortos removidos e destinados corretamente",       criterio:"Necrópsia realizada quando indicado — registro no sistema do biotério",class:"CRÍTICO",peso:10 },
      { id:"AE_CK_02_07", categoria:"Protocolo CEUA", desc:"Todos os experimentos possuem protocolo CEUA aprovado e vigente",     criterio:"Nenhum experimento fora das condições aprovadas pelo comitê",      class:"CRÍTICO", peso:10 },
      { id:"AE_CK_02_08", categoria:"Protocolo CEUA", desc:"Uso de analgesia e anestesia conforme protocolo aprovado",            criterio:"Registros de uso de medicamentos completos e assinados pelo MV",   class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Tratar imediatamente animais com sinais clínicos anormais",
      "Comunicar o CEUA sobre qualquer desvio do protocolo aprovado",
      "Registrar óbitos e submeter à necrópsia quando indicado",
      "Suspender experimento em caso de risco grave ao bem-estar animal",
    ],
  },

  AE_CK_03: {
    id: "AE_CK_03",
    area: "areas_especiais",
    nome: "Quarentenário — Importação e Exportação de Animais",
    objetivo: "Verificar o cumprimento dos requisitos sanitários de quarentena.",
    frequencia: "por_evento",
    responsavelPreenchimento: "RT",
    legislacao: "IN MAPA vigente para importação/exportação; Decreto Federal 9.013/2017",
    cabecalho: [
      { campo: "data_entrada",        label: "Data de Entrada em Quarentena",      tipo: "date", obrigatorio: true },
      { campo: "numero_lote",         label: "Nº do Lote / Certificado Sanitário", tipo: "text", obrigatorio: true },
      { campo: "especie",             label: "Espécie",                            tipo: "text", obrigatorio: true },
      { campo: "pais_origem_destino", label: "País de Origem / Destino",           tipo: "text", obrigatorio: true },
      { campo: "nome_rt",             label: "Nome do RT",                         tipo: "text", obrigatorio: true },
      { campo: "crmv",                label: "CRMV",                              tipo: "text", obrigatorio: true },
    ],
    itens: [
      { id:"AE_CK_03_01", categoria:"Documentação",  desc:"Certificado Sanitário Internacional (CSI) conferido e arquivado",    criterio:"Documento original ou cópia autenticada disponível",                class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_02", categoria:"Documentação",  desc:"Autorização prévia do MAPA para importação obtida",                 criterio:"Número da autorização registrado no sistema VIGIAGRO",              class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_03", categoria:"Quarentena",    desc:"Animais alojados em instalações exclusivas de quarentena",          criterio:"Sem contato físico ou indireto com outros animais fora da quarentena",class:"CRÍTICO",peso:10 },
      { id:"AE_CK_03_04", categoria:"Quarentena",    desc:"Período de quarentena cumprido integralmente",                      criterio:"Data de entrada e data prevista de saída registradas",               class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_05", categoria:"Saúde",         desc:"Exames exigidos pelo protocolo sanitário realizados",              criterio:"Resultados dos exames dentro dos padrões exigidos pelo MAPA",       class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_06", categoria:"Saúde",         desc:"Animais inspecionados clinicamente ao menos 1x ao dia",            criterio:"Registros diários de inspeção clínica arquivados",                  class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_07", categoria:"Biossegurança", desc:"Barreira sanitária (pedilúvio, roupas exclusivas) em funcionamento",criterio:"Solução desinfetante do pedilúvio trocada conforme protocolo",       class:"CRÍTICO", peso:10 },
      { id:"AE_CK_03_08", categoria:"Biossegurança", desc:"Resíduos dos animais em quarentena tratados como material de risco",criterio:"Descarte conforme PGRSS — sem mistura com resíduos comuns",         class:"CRÍTICO", peso:10 },
    ],
    acoesCorretivas: [
      "Notificar imediatamente o MAPA em caso de suspeita de doença exótica",
      "Prolongar quarentena em caso de exame positivo ou inconclusivo",
      "Isolar animal suspeito dentro da área de quarentena",
      "Registrar todas as ocorrências e comunicar autoridade sanitária competente",
    ],
  },

  // ════════════════════════════════════════════════════════════
  // ÁREA: CRECHE E HOTEL PARA CÃES
  // ════════════════════════════════════════════════════════════

  CH_CK_01: {
    id: "CH_CK_01",
    area: "creche_hotel",
    nome: "Higiene Diária — Creche e Hotel",
    objetivo: "Verificar condições de higiene e bem-estar ao início e ao final do período.",
    frequencia: "diario",
    turno: ["abertura", "encerramento"],
    responsavelPreenchimento: "Cuidador / Técnico designado",
    responsavelVerificacao: "RT",
    legislacao: "RDC ANVISA 216/2004; Res. CFMV 1000/2012",
    itens: [
      { id:"CH_CK_01_01", categoria:"Documentação de Entrada",   desc:"Carteira de vacinação verificada e em dia para todos os ingressantes do dia?",     class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_02", categoria:"Documentação de Entrada",   desc:"Ficha de admissão preenchida e termo de responsabilidade assinado pelo tutor?",    class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_03", categoria:"Triagem Sanitária",         desc:"Inspeção visual de entrada: ausência de sinais de doença, ectoparasitas e feridas?", class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_04", categoria:"Higiene das Instalações",   desc:"Baias, canis e áreas coletivas limpas e desinfetadas com produto virucida?",       class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_05", categoria:"Higiene das Instalações",   desc:"Bebedouros lavados e cheios — água fresca disponível ad libitum?",                  class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_06", categoria:"Higiene das Instalações",   desc:"Dejetos recolhidos e área desinfetada após cada coleta?",                           class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_07", categoria:"Bem-Estar",                 desc:"Observação comportamental: nenhum animal com sinais de sofrimento ou doença?",      class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_08", categoria:"Bem-Estar",                 desc:"Alimentação fornecida conforme ficha do tutor (ração/horário correto)?",            class:"MAIOR",   peso:5 },
      { id:"CH_CK_01_09", categoria:"Biossegurança",             desc:"Equipe com EPIs em uso durante manejo e limpeza?",                                  class:"MAIOR",   peso:5 },
      { id:"CH_CK_01_10", categoria:"Biossegurança",             desc:"Lixeiras com saco branco leitoso e tampadas nas áreas de manipulação?",             class:"MAIOR",   peso:5 },
      { id:"CH_CK_01_11", categoria:"Segurança",                 desc:"Portas duplas funcionando — nenhum risco de fuga identificado?",                    class:"CRÍTICO", peso:10 },
      { id:"CH_CK_01_12", categoria:"Segurança",                 desc:"Animais separados por porte/comportamento conforme protocolo?",                     class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Barrar entrada de animal com vacinas vencidas ou sinais de doença",
      "Realizar higienização imediata da área com não conformidade",
      "Isolar animal com comportamento atípico ou sinais clínicos",
      "Comunicar o tutor imediatamente em caso de intercorrência",
      "Acionar o RT para avaliação de situações críticas",
    ],
  },

  CH_CK_02: {
    id: "CH_CK_02",
    area: "creche_hotel",
    nome: "Verificação Mensal — Documentação e Infraestrutura",
    objetivo: "Confirmar que toda a documentação obrigatória está vigente e as instalações em conformidade.",
    frequencia: "mensal",
    responsavelPreenchimento: "RT",
    legislacao: "Res. CFMV 1275/2019; Vigilância Sanitária Municipal",
    itens: [
      { id:"CH_CK_02_01", categoria:"Documentação",   desc:"Alvará Sanitário (CMVS) e Alvará de Funcionamento vigentes?",            class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_02", categoria:"Documentação",   desc:"Certificado de Regularidade PJ no CRMV vigente?",                        class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_03", categoria:"Documentação",   desc:"ART do RT vigente e compatível?",                                         class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_04", categoria:"Documentação",   desc:"Laudo do Corpo de Bombeiros (AVCB/CLCB) vigente?",                        class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_05", categoria:"Documentação",   desc:"MBP revisado (revisão anual) e assinado pelo RT?",                        class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_06", categoria:"Documentação",   desc:"POPs afixados nas áreas de execução e atualizados?",                      class:"MAIOR",   peso:5 },
      { id:"CH_CK_02_07", categoria:"Documentação",   desc:"PGRSS vigente com comprovante de coleta por empresa licenciada?",         class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_08", categoria:"Documentação",   desc:"Certificado de controle de pragas vigente?",                              class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_09", categoria:"Infraestrutura", desc:"Portas duplas, telas e cercas íntegras (sem brechas)?",                   class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_10", categoria:"Infraestrutura", desc:"Pisos impermeáveis sem rachaduras ou deterioração?",                      class:"MAIOR",   peso:5 },
      { id:"CH_CK_02_11", categoria:"Infraestrutura", desc:"Área de isolamento disponível e funcional?",                              class:"CRÍTICO", peso:10 },
      { id:"CH_CK_02_12", categoria:"Equipe",         desc:"ASOs vigentes para todos os cuidadores e funcionários?",                  class:"MAIOR",   peso:5 },
      { id:"CH_CK_02_13", categoria:"Equipe",         desc:"Treinamento de manuseio humanitário registrado nos últimos 12 meses?",    class:"MAIOR",   peso:5 },
      { id:"CH_CK_02_14", categoria:"Bem-Estar",      desc:"Enriquecimento ambiental disponível e adequado por porte/espécie?",       class:"MAIOR",   peso:5 },
    ],
    acoesCorretivas: [
      "Regularizar documentação vencida com prazo máximo de 30 dias",
      "Comunicar ao CRMV qualquer mudança na RT ou nos serviços prestados",
      "Corrigir infraestrutura identificada como risco antes da próxima auditoria",
      "Registrar desvios no relatório mensal do RT",
    ],
  },
};

// ── Função auxiliar: retorna checklists de um tipo de estabelecimento ──
export function getChecklistsPorTipo(tipo) {
  const ids = CHECKLISTS_POR_TIPO[tipo] ?? [];
  return ids.map(id => CHECKLISTS[id]).filter(Boolean);
}

// ── Função auxiliar: calcula score de um resultado de checklist ────────
export function calcularScore(respostas, checklistId) {
  const ck = CHECKLISTS[checklistId];
  if (!ck) return 0;
  let pontosPerdidos = 0;
  let total = 0;
  ck.itens.forEach(item => {
    const r = respostas[item.id];
    if (r === RESULTADOS.NAO_APLICAVEL) return;
    total += item.peso;
    if (r === RESULTADOS.NAO_CONFORME) pontosPerdidos += item.peso;
  });
  if (total === 0) return 100;
  return Math.max(0, Math.round(100 - (pontosPerdidos / total) * 100));
}

// ── Utilitários para substituição do checklistData.js ────────────────

export const COR_CRITICIDADE = {
  "CRÍTICO": "#d32f2f",
  "MAIOR":   "#e65100",
  "MENOR":   "#1565c0",
};

export const gerarSmartId = (uid) => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `PR-${ano}.${mes}-${uid?.slice(0,5)?.toUpperCase() || "00000"}`;
};

export const LABEL_TIPO = {
  clinica:              "Clínica Veterinária",
  acougue:              "Açougue / Beneficiamento",
  industria_alimentos:  "Indústria de Alimentos",
  comercio_agronegocio: "Comércio e Agronegócio",
  producao_rural:       "Produção Rural (Genérico)",
  bovinocultura_corte:  "Bovinos de Corte",
  bovinocultura_leite:  "Bovinos de Leite",
  laboratorio:          "Laboratório Clínico",
  posto_coleta:         "Posto de Coleta",
  quarentenario:        "Quarentenário",
  creche_hotel:         "Creche / Hotel para Cães",
  laticinio:            "Laticínio / Lácteos",
};

const VENCIMENTOS_BOVINOS_BASE = [
  { campo: "vencCrmv",    label: "ART / CRMV do RT",           diasAlerta: 30 },
  { campo: "vencAlvara",  label: "Alvará Sanitário",            diasAlerta: 30 },
  { campo: "vencPncebt",  label: "PNCEBT — Próximo teste (brucelose/tuberculose)", diasAlerta: 30 },
  { campo: "vencVacinas", label: "Campanha Antiaftosa",         diasAlerta: 30 },
  { campo: "vencArt",     label: "Validade da ART",             diasAlerta: 30 },
];

export const VENCIMENTOS_POR_TIPO = {
  clinica: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencCertificado", label: "Certificado Regularidade", diasAlerta: 30 },
    { campo: "vencRegistroPJ",  label: "Registro Empresa/PJ",     diasAlerta: 30 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencSipeagro",    label: "Cadastro SIPEAGRO",        diasAlerta: 45 },
    { campo: "vencManualBP",    label: "Manual Boas Práticas",    diasAlerta: 30 },
    { campo: "vencPgrss",       label: "PGRSS (Resíduos)",         diasAlerta: 30 },
    { campo: "vencPop",         label: "Atualização de POPs",      diasAlerta: 30 },
    { campo: "vencBombeiros",   label: "Corpo de Bombeiros",       diasAlerta: 60 },
    { campo: "vencLicAmbiental",label: "Licença Ambiental",        diasAlerta: 60 },
    { campo: "vencReceitas",    label: "Receitas Controladas",    diasAlerta: 5 }, // 30 dias de validade
  ],
  acougue: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencSim",         label: "Registro SIM/SIE/SIF",    diasAlerta: 60 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencManualBP",    label: "Manual Boas Práticas",    diasAlerta: 30 },
    { campo: "vencPop",         label: "Revisão de POPs",         diasAlerta: 30 },
    { campo: "vencLicAmbiental",label: "Licença Ambiental",        diasAlerta: 60 },
    { campo: "vencMapa",        label: "Cadastro no MAPA",        diasAlerta: 45 },
  ],
  laboratorio: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencCertificado", label: "Certificado Regularidade", diasAlerta: 30 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencSipeagro",    label: "Cadastro SIPEAGRO",        diasAlerta: 45 },
    { campo: "vencManualBP",    label: "Manual Boas Práticas",    diasAlerta: 30 },
    { campo: "vencPgrss",       label: "PGRSS (Resíduos)",         diasAlerta: 30 },
    { campo: "vencAEQ",         label: "AEQ (Qualidade)",         diasAlerta: 60 },
    { campo: "vencLicAmbiental",label: "Licença Ambiental",        diasAlerta: 60 },
  ],
  posto_coleta: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencPgrss",       label: "PGRSS (Resíduos)",         diasAlerta: 30 },
  ],
  creche_hotel: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencCertificado", label: "Certificado Regularidade", diasAlerta: 30 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencManualBP",    label: "Manual Boas Práticas",    diasAlerta: 30 },
    { campo: "vencPop",         label: "Revisão de POPs",         diasAlerta: 30 },
    { campo: "vencBombeiros",   label: "Corpo de Bombeiros",       diasAlerta: 60 },
    { campo: "vencDezinfest",   label: "Controle de Pragas",      diasAlerta: 30 },
  ],
  laticinio: [
    { campo: "vencArt",         label: "A.R.T. (Anual)",          diasAlerta: 30 },
    { campo: "vencCertificado", label: "Certificado Regularidade", diasAlerta: 30 },
    { campo: "vencRegistroPJ",  label: "Registro Empresa/PJ",     diasAlerta: 30 },
    { campo: "vencMapa",        label: "Cadastro MAPA (SIF/SIE)", diasAlerta: 60 },
    { campo: "vencManualBP",    label: "BPF (Boas Práticas)",      diasAlerta: 45 },
    { campo: "vencAlvara",      label: "Alvará Sanitário",         diasAlerta: 45 },
    { campo: "vencLicAmbiental",label: "Licença Ambiental",        diasAlerta: 60 },
    { campo: "vencCaixaAgua",   label: "Potabilidade Água",        diasAlerta: 15 },
    { campo: "vencPop",         label: "Atualização PAC/PPHO",    diasAlerta: 30 },
  ],
  bovinocultura_corte: [
    ...VENCIMENTOS_BOVINOS_BASE,
    { campo: "vencSisbov",       label: "Renovação SISBOV",                    diasAlerta: 30 },
    { campo: "vencLicAmbiental", label: "Licença Ambiental de Operação",       diasAlerta: 60 },
    { campo: "vencReceituario",  label: "Receituário veterinário mais recente", diasAlerta: 30 },
  ],
  bovinocultura_leite: [
    ...VENCIMENTOS_BOVINOS_BASE,
    { campo: "vencLaudoLeite",   label: "Laudo de Qualidade do Leite (CCS/CPP)", diasAlerta: 15 },
    { campo: "vencLicAmbiental", label: "Licença Ambiental de Operação",        diasAlerta: 60 },
    { campo: "vencReceituario",  label: "Receituário veterinário mais recente",  diasAlerta: 30 },
  ],
};
