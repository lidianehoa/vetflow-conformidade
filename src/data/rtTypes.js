/**
 * Tipos de RT (Responsável Técnico) Veterinário
 * Baseado nas diretrizes do CFMV e CRMVs estaduais
 * Guia de Documentos Obrigatórios — atualizado conforme diretrizes vigentes
 */

export const AREAS_ATUACAO = [
  {
    id: "pequenos_animais",
    label: "Pequenos Animais",
    emoji: "🐾",
    cor: "#1b4332",
    bg: "#e8f5e9",
    descricao: "Hospitais, clínicas, consultórios, pet shops, banho e tosa, hotéis, creches e alojamentos",
    exemplos: "Hospitais, Clínicas, Consultórios, Pet Shops, Hotéis, Creches",
    setoresRelevantes: ["A", "B", "C", "D", "E"],
    regulamentacoes: ["Res. CFMV 1275/2019", "Res. CFMV 1653/2025", "RDC ANVISA 222/2018"],
    documentosObrigatorios: [
      { nome: "Manual de Boas Práticas (MBP)", ref: "Res. CFMV 1275/2019", critico: true },
      { nome: "PGRSS — Plano de Gerenciamento de Resíduos de Serviços de Saúde", ref: "RDC ANVISA 222/2018", critico: true },
      { nome: "POPs de Higienização e Esterilização", ref: "Res. CFMV 1275/2019", critico: true },
      { nome: "Livro de Psicotrópicos (Portaria 344/98)", ref: "Port. MS 344/1998", critico: true },
      { nome: "Prontuários Médicos (guarda mínima de 5 anos)", ref: "Res. CFMV 1653/2025", critico: true },
      { nome: "Termos de Consentimento Informado (TCLE)", ref: "Res. CFMV 1653/2025", critico: true },
      { nome: "Contratos de Hospedagem (Hotel / Creche)", ref: null, critico: false },
    ],
  },
  {
    id: "laticinios",
    label: "RT Laticínios & Lácteos",
    emoji: "🥛",
    cor: "#1565c0",
    bg: "#e3f2fd",
    descricao: "Usinas de beneficiamento, fábricas de queijos, iogurtes e derivados lácteos",
    exemplos: "Laticínios, Queijarias, Entrepostos de Leite",
    setoresRelevantes: ["A", "D", "E"],
    regulamentacoes: ["RIISPOA (Dec. 9.013/17)", "IN MAPA 76/2018", "IN MAPA 77/2018"],
    documentosObrigatorios: [
      { nome: "PAC — Programas de Autocontrole", ref: "RIISPOA", critico: true },
      { nome: "BPF — Boas Práticas de Fabricação", ref: "Portaria 368/97", critico: true },
      { nome: "PPHO — Procedimento Padrão de Higiene Operacional", ref: "RIISPOA", critico: true },
      { nome: "Plano APPCC (HACCP)", ref: "Codex Alimentarius", critico: true },
      { nome: "Laudos de Potabilidade da Água", ref: "Portaria 888/21", critico: true },
      { nome: "Memorial Descritivo de Produtos (MAPA)", ref: null, critico: true },
      { nome: "Planilhas de Cadeia de Frio (Logística)", ref: null, critico: false },
    ],
  },
  {
    id: "industria_poa",
    label: "Indústria — Prod. Origem Animal",
    emoji: "🏭",
    cor: "#0d47a1",
    bg: "#e3f2fd",
    descricao: "Frigoríficos, matadouros, fábricas de laticínios, pescados e mel",
    exemplos: "Frigoríficos, Laticínios, Entrepostos de Mel e Pescado",
    setoresRelevantes: ["A", "D", "E"],
    regulamentacoes: ["IN MAPA 35/2015", "RDC ANVISA 222/2018", "RIISPOA"],
    documentosObrigatorios: [
      { nome: "Programas de Autocontrole (PAC)", ref: "RIISPOA / IN MAPA", critico: true },
      { nome: "PPHO — Procedimentos Padrão de Higiene Operacional", ref: "IN MAPA", critico: true },
      { nome: "Plano APPCC / HACCP", ref: "CODEX Alimentarius", critico: true },
      { nome: "Memorial Descritivo de Fabricação", ref: null, critico: true },
      { nome: "Planilhas de Monitoramento de Temperatura", ref: "IN MAPA 60/2019", critico: false },
      { nome: "Laudos de Potabilidade de Água", ref: "Portaria MS 888/2021", critico: false },
    ],
  },
  {
    id: "industria_alimenticia",
    label: "Indústria Alimentícia",
    emoji: "🍖",
    cor: "#e65100",
    bg: "#fff3e0",
    descricao: "Locais que produzem, fatiam, fracionam, embalam ou rotulam alimentos",
    exemplos: "Unidades de Fracionamento, Fatiados, Rotulagem",
    setoresRelevantes: ["A", "D"],
    regulamentacoes: ["RDC ANVISA 216/2004", "RDC ANVISA 275/2002", "IN MAPA 60/2019"],
    documentosObrigatorios: [
      { nome: "Manual de BPF — Boas Práticas de Fabricação", ref: "RDC ANVISA 216/2004", critico: true },
      { nome: "POPs de Controle de Pragas e Vetores", ref: "RDC ANVISA 275/2002", critico: true },
      { nome: "Registros de Rastreabilidade de Lotes", ref: "Lei 10.674/2003", critico: true },
      { nome: "Plano de Recall (Recolhimento de Produtos)", ref: "RDC ANVISA 24/2015", critico: true },
      { nome: "Fichas de Saúde dos Manipuladores de Alimentos", ref: "RDC ANVISA 216/2004", critico: false },
    ],
  },
  {
    id: "comercio_agronegocio",
    label: "Comércio e Agronegócio",
    emoji: "🌾",
    cor: "#6a1b9a",
    bg: "#f3e5f5",
    descricao: "Fábricas de ração, casas agropecuárias, lojas de medicamentos veterinários",
    exemplos: "Fábricas de Ração, Casas Agropecuárias, Lojas de Medicamentos",
    setoresRelevantes: ["A", "E"],
    regulamentacoes: ["IN MAPA 35/2015", "Port. MS 344/1998", "RDC ANVISA 344/2020"],
    documentosObrigatorios: [
      { nome: "Registro SIPEAGRO (MAPA)", ref: "IN MAPA 35/2015", critico: true },
      { nome: "Receituário Veterinário com Retenção de Receitas", ref: "Port. MS 344/1998", critico: true },
      { nome: "Planilha de Temperatura de Termolábeis (Vacinas)", ref: "Res. CFMV 1275/2019", critico: true },
      { nome: "Manual de Armazenamento de Insumos", ref: "RDC ANVISA 344/2020", critico: false },
      { nome: "Plano de Logística Reversa (Produtos Vencidos)", ref: "Lei 12.305/2010", critico: false },
    ],
  },
  {
    id: "producao_rural",
    label: "Produção e Manejo Rural",
    emoji: "🐄",
    cor: "#558b2f",
    bg: "#f1f8e9",
    descricao: "Propriedades rurais de produção animal",
    exemplos: "Fazendas de Corte/Leite, Granjas, Suinocultura",
    setoresRelevantes: ["A", "D", "E"],
    regulamentacoes: ["IN MAPA 48/2013", "CONAMA 316/2002", "Lei 9.605/98"],
    documentosObrigatorios: [
      { nome: "Calendário Sanitário e de Vacinação", ref: "IN MAPA 48/2013", critico: true },
      { nome: "Caderno de Campo — Registro de Tratamentos", ref: "IN MAPA 48/2013", critico: true },
      { nome: "Protocolos de Bem-Estar Animal", ref: "Lei 9.605/98", critico: true },
      { nome: "Fichas de Índices Zootécnicos", ref: null, critico: false },
      { nome: "Plano de Manejo de Efluentes e Carcaças", ref: "CONAMA 316/2002", critico: false },
    ],
  },
  {
    id: "areas_especiais",
    label: "Áreas Especiais",
    emoji: "🔬",
    cor: "#b71c1c",
    bg: "#ffebee",
    descricao: "Laboratórios de diagnóstico, controle de pragas, centros de pesquisa, ensino e quarentenários",
    exemplos: "Laboratórios, Controle de Pragas, Centros de Pesquisa",
    setoresRelevantes: ["A", "B", "D", "E"],
    regulamentacoes: ["Res. CFMV 1275/2019", "RDC ANVISA 302/2005", "CONAMA 316/2002"],
    documentosObrigatorios: [
      { nome: "Manual da Qualidade (ISO 17025)", ref: "ABNT NBR ISO/IEC 17025", critico: true },
      { nome: "Protocolos CEUA — Comissão de Ética no Uso de Animais", ref: "Lei 11.794/2008", critico: true },
      { nome: "Ordens de Serviço (Controle de Pragas Urbanas)", ref: "CONAMA 316/2002", critico: true },
      { nome: "POPs de Biossegurança Laboratorial", ref: "RDC ANVISA 302/2005", critico: true },
      { nome: "Registros de Quarentena e Trânsito Animal", ref: "IN MAPA 35/2015", critico: false },
    ],
  },
  {
    id: "bovinocultura_corte",
    label: "Bovinocultura de Corte",
    emoji: "🥩",
    cor: "#5d4037",
    bg: "#efebe9",
    descricao: "Propriedades rurais destinadas à cria, recria e engorda de bovinos para abate",
    exemplos: "Fazendas de Gado de Corte, Confinamentos",
    setoresRelevantes: ["A", "D", "E"],
    regulamentacoes: ["IN MAPA 48/2013", "IN MAPA 281/2019 (SISBOV)", "PNCEBT"],
    documentosObrigatorios: [
      { nome: "Caderno de Campo (Registros Sanitários)", ref: "IN MAPA 44/2007", critico: true },
      { nome: "Inventário SISBOV / Rastreabilidade", ref: "IN MAPA 281/2019", critico: true },
      { nome: "Comprovantes de Vacinação Brucelose/Aftosa", ref: "PNCEBT", critico: true },
      { nome: "Planilha de Controle de Antimicrobianos", ref: "IN MAPA 44/2020", critico: true },
    ],
  },
  {
    id: "bovinocultura_leite",
    label: "Bovinocultura de Leite",
    emoji: "🥛",
    cor: "#0277bd",
    bg: "#e1f5fe",
    descricao: "Propriedades destinadas à produção de leite in natura",
    exemplos: "Fazendas Leiteiras, Tambos",
    setoresRelevantes: ["A", "D", "E"],
    regulamentacoes: ["IN MAPA 76/2018", "IN MAPA 77/2018", "PNQL"],
    documentosObrigatorios: [
      { nome: "Laudos de Qualidade do Leite (CCS/CPP)", ref: "IN MAPA 76/2018", critico: true },
      { nome: "Protocolo de Higiene de Ordenha", ref: "IN MAPA 77/2018", critico: true },
      { nome: "Caderno de Campo e Sanidade", ref: "IN MAPA 44/2007", critico: true },
      { nome: "Controle de Resíduos e Carência", ref: "IN MAPA 44/2020", critico: true },
    ],
  },
  {
    id: "creche_hotel",
    label: "Creche / Hotel para Cães",
    emoji: "🏨",
    cor: "#f9a825",
    bg: "#fff9c4",
    descricao: "Alojamento coletivo sem fins médicos/cirúrgicos",
    exemplos: "Creches Caninas, Hotéis de Animais",
    setoresRelevantes: ["A", "B", "E"],
    regulamentacoes: ["Res. CFMV 1275/2019", "Diretrizes de Bem-Estar CFMV"],
    documentosObrigatorios: [
      { nome: "Manual de Boas Práticas e Manejo", ref: "Res. CFMV 1275/2019", critico: true },
      { nome: "POPs de Higienização e Admissão", ref: "Res. CFMV 1275/2019", critico: true },
      { nome: "Contratos e Termos de Responsabilidade", ref: null, critico: true },
      { nome: "Plano de Enriquecimento Ambiental", ref: null, critico: false },
    ],
  },
];

export const OBSERVACOES_GERAIS = [
  {
    titulo: "ART — Anotação de Responsabilidade Técnica",
    texto: "É o documento mestre que formaliza o vínculo. Deve estar visível ao público no estabelecimento.",
    emoji: "📋",
  },
  {
    titulo: "Treinamentos da Equipe",
    texto: "Todo RT deve manter atas de treinamento assinadas pelos funcionários sobre os POPs e o Manual de Boas Práticas.",
    emoji: "📚",
  },
  {
    titulo: "Certificados de Terceiros",
    texto: "Certificados de limpeza de caixa d'água e dedetização devem ser arquivados junto aos documentos do RT.",
    emoji: "📎",
  },
  {
    titulo: "Assinatura e Carimbo",
    texto: "Todos os manuais e POPs devem conter a assinatura e o carimbo com o número do CRMV do RT titular.",
    emoji: "✍️",
  },
];

export const TIPOS_FORMALIZACAO = [
  {
    id: "titular",
    label: "RT Principal / Titular",
    descricao: "Responsável direto e primário pela ART — Anotação de Responsabilidade Técnica",
    cor: "#1b4332",
  },
  {
    id: "suplencia",
    label: "RT de Suplência",
    descricao: "Substitui o RT titular por tempo determinado, com vigência da ART do substituído",
    cor: "#e65100",
  },
];

/**
 * Retorna o objeto de área pelo ID.
 */
export function getAreaById(id) {
  return AREAS_ATUACAO.find((a) => a.id === id) ?? AREAS_ATUACAO[0];
}

/**
 * Retorna os setores relevantes para uma área de atuação.
 */
export function getSetoresByArea(areaId) {
  const area = getAreaById(areaId);
  return area?.setoresRelevantes ?? ["A", "B", "C", "D", "E"];
}
