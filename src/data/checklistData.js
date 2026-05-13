// Cores por criticidade
export const COR_CRITICIDADE = {
  "CRÍTICO": "#d32f2f",
  "MAIOR":   "#e65100",
  "MENOR":   "#1565c0",
};

// Gera Smart ID no formato PR-AAAA.MM-XXXXX
export const gerarSmartId = (uid) => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `PR-${ano}.${mes}-${uid?.slice(0,5)?.toUpperCase() || "00000"}`;
};

// Itens genéricos aplicáveis a todos (Documentação Legal e Estrutura Básica)
const ITENS_GERAIS = [
  { id: "G1", desc: "Certificado de Regularidade do CRMV (PJ) afixado e válido?", class: "CRÍTICO", peso: 10, ref: "Res. CFMV 722/2014" },
  { id: "G2", desc: "Alvará Sanitário (Vigilância) vigente e afixado?", class: "CRÍTICO", peso: 10 },
  { id: "G3", desc: "Alvará de Funcionamento (Prefeitura) vigente?", class: "CRÍTICO", peso: 10 },
  { id: "G4", desc: "Controle de Pragas urbanas com certificado dentro da validade (<6 meses)?", class: "MAIOR", peso: 5 },
  { id: "G5", desc: "Limpeza e laudo de potabilidade de caixa d'água atualizado (<6 meses)?", class: "MAIOR", peso: 5 },
  { id: "G6", desc: "PGRSS (Plano de Gerenciamento de Resíduos) implementado?", class: "CRÍTICO", peso: 10, ref: "RDC ANVISA 222/2018" },
  { id: "G7", desc: "Extintores de incêndio dentro do prazo de validade e desobstruídos?", class: "MAIOR", peso: 5 },
];

export const CHECKLISTS_POR_AREA = {
  pequenos_animais: [
    {
      id: "DOC", titulo: "DOCUMENTAÇÃO E LEGAL", cor: "#1b4332",
      itens: [
        ...ITENS_GERAIS,
        { id: "DOC1", desc: "MBP (Manual de Boas Práticas) atualizado e assinado pelo RT?", class: "CRÍTICO", peso: 10, ref: "Res. 1275/2019" },
        { id: "DOC2", desc: "Prontuários: completos, assinados e arquivados por no mínimo 5 anos?", class: "CRÍTICO", peso: 10, ref: "Res. 1653/2025" },
        { id: "DOC3", desc: "Termos de Consentimento (TCLE) assinados para procedimentos de risco?", class: "CRÍTICO", peso: 10, ref: "Res. 1653/2025" },
      ]
    },
    {
      id: "CLI", titulo: "ÁREA CLÍNICA E BIOSSEGURANÇA", cor: "#0d47a1",
      itens: [
        { id: "CLI1", desc: "Procedimentos de esterilização validados (Teste Biológico na Autoclave)?", class: "CRÍTICO", peso: 10, ref: "RDC ANVISA 15" },
        { id: "CLI2", desc: "Estrutura: Canis, gatis e mesas de exame estão limpos, impermeáveis e sem odores?", class: "MAIOR", peso: 5 },
        { id: "CLI3", desc: "Isolamento: fluxo diferenciado e sinalizado para doenças infectocontagiosas?", class: "CRÍTICO", peso: 10, ref: "Res. 1275/2019" },
        { id: "CLI4", desc: "Kit de emergência (RCP) completo e oxigênio disponível?", class: "CRÍTICO", peso: 10 },
      ]
    },
    {
      id: "MED", titulo: "MEDICAMENTOS CONTROLADOS", cor: "#b71c1c",
      itens: [
        { id: "MED1", desc: "Livro da Portaria 344/98 bate com o stock físico de controlados?", class: "CRÍTICO", peso: 10, ref: "Port. MS 344/98" },
        { id: "MED2", desc: "Armário de controlados resistente, fixo na parede e sob chave exclusiva do RT?", class: "CRÍTICO", peso: 10 },
        { id: "MED3", desc: "Geladeira de vacinas: temperatura (2°C–8°C) registrada diariamente?", class: "CRÍTICO", peso: 10 },
      ]
    }
  ],

  industria_poa: [
    {
      id: "PAC", titulo: "AUTOCONTROLES (PAC) E PPHO", cor: "#1b4332",
      itens: [
        ...ITENS_GERAIS,
        { id: "PAC1", desc: "PPHO: A limpeza pré-operacional foi validada visualmente antes do abate/produção?", class: "CRÍTICO", peso: 10 },
        { id: "PAC2", desc: "PPHO: Análises microbiológicas de superfície estão dentro dos limites?", class: "MAIOR", peso: 5 },
        { id: "PAC3", desc: "Registros diários dos Programas de Autocontrole (PAC) preenchidos e assinados?", class: "CRÍTICO", peso: 10 },
        { id: "PAC4", desc: "Água: O registro de cloração está dentro dos parâmetros (0,5 a 2,0 ppm)?", class: "CRÍTICO", peso: 10 },
      ]
    },
    {
      id: "APPCC", titulo: "SEGURANÇA ALIMENTAR (APPCC)", cor: "#e65100",
      itens: [
        { id: "APPCC1", desc: "PCCs: Os limites críticos (ex: Temperatura de Câmara/Cozimento) foram respeitados no turno?", class: "CRÍTICO", peso: 10 },
        { id: "APPCC2", desc: "Planilhas de monitoramento de temperatura das câmaras frias atualizadas?", class: "CRÍTICO", peso: 10 },
        { id: "APPCC3", desc: "Rastreabilidade: É possível identificar a origem do lote auditado em até 2h?", class: "CRÍTICO", peso: 10 },
        { id: "APPCC4", desc: "Produtos retidos ou não conformes estão segregados e identificados?", class: "MAIOR", peso: 5 },
      ]
    },
    {
      id: "BPE", titulo: "BOAS PRÁTICAS E HIGIENE", cor: "#0d47a1",
      itens: [
        { id: "BPE1", desc: "Higiene: Funcionários usam uniformes limpos, toucas e não portam adornos?", class: "CRÍTICO", peso: 10 },
        { id: "BPE2", desc: "Exames médicos ocupacionais (ASO) dos manipuladores estão em dia?", class: "MAIOR", peso: 5 },
        { id: "BPE3", desc: "Barreiras sanitárias (lavabos, pedilúvios) abastecidas com sabão e papel?", class: "CRÍTICO", peso: 10 },
      ]
    }
  ],

  industria_alimenticia: [
    {
      id: "BPF", titulo: "BOAS PRÁTICAS DE FABRICAÇÃO (BPF)", cor: "#1b4332",
      itens: [
        ...ITENS_GERAIS,
        { id: "BPF1", desc: "Manual de BPF e POPs atualizados e acessíveis à equipe de produção?", class: "CRÍTICO", peso: 10, ref: "RDC 216/2004" },
        { id: "BPF2", desc: "Higiene de Manipuladores: Uniformes adequados, sem adornos e mãos higienizadas?", class: "CRÍTICO", peso: 10 },
        { id: "BPF3", desc: "Saúde: Atestados de saúde ocupacional dos manipuladores estão válidos?", class: "MAIOR", peso: 5 },
        { id: "BPF4", desc: "Limpeza: Instalações, equipamentos e utensílios encontram-se higienizados?", class: "CRÍTICO", peso: 10 },
      ]
    },
    {
      id: "RAS", titulo: "RASTREABILIDADE E QUALIDADE", cor: "#6a1b9a",
      itens: [
        { id: "RAS1", desc: "Rastreabilidade de Lotes: Registros de produção permitem identificar origem e destino?", class: "CRÍTICO", peso: 10 },
        { id: "RAS2", desc: "Matérias-primas e embalagens são inspecionadas no recebimento?", class: "MAIOR", peso: 5 },
        { id: "RAS3", desc: "Rotulagem obedece as normas vigentes (alergenos, validade, lote)?", class: "CRÍTICO", peso: 10 },
        { id: "RAS4", desc: "Produtos devolvidos ou vencidos estão separados em área restrita?", class: "MAIOR", peso: 5 },
      ]
    }
  ],

  comercio_agronegocio: [
    {
      id: "DOC", titulo: "LEGALIZAÇÃO E ESTRUTURA", cor: "#1b4332",
      itens: [
        ...ITENS_GERAIS,
        { id: "AGR1", desc: "Registro no MAPA (SIPEAGRO) ativo e dentro da validade?", class: "CRÍTICO", peso: 10, ref: "IN 35/2015" },
        { id: "AGR2", desc: "Armazenamento: Rações estão sobre estrados (pallets) e afastadas das paredes?", class: "CRÍTICO", peso: 10 },
        { id: "AGR3", desc: "Ambiente protegido contra entrada de pássaros, roedores e pragas?", class: "MAIOR", peso: 5 },
      ]
    },
    {
      id: "EST", titulo: "ESTOQUE E VENDAS", cor: "#6a1b9a",
      itens: [
        { id: "EST1", desc: "Receituário: As receitas de venda de controlados/antimicrobianos estão retidas e arquivadas?", class: "CRÍTICO", peso: 10 },
        { id: "EST2", desc: "Termolábeis: A cadeia de frio das vacinas está monitorada (2°C a 8°C)?", class: "CRÍTICO", peso: 10 },
        { id: "EST3", desc: "Stock: Existem produtos com data de validade vencida expostos nas prateleiras?", class: "CRÍTICO", peso: 10 },
        { id: "EST4", desc: "Lançamentos de controle no SIPEAGRO estão rigorosamente em dia?", class: "MAIOR", peso: 5 },
      ]
    }
  ],

  producao_rural: [
    {
      id: "SAN", titulo: "SANIDADE E MANEJO", cor: "#558b2f",
      itens: [
        { id: "RUR1", desc: "Inscrição Estadual e cadastro da propriedade na Agência de Defesa ativos?", class: "CRÍTICO", peso: 10 },
        { id: "RUR2", desc: "Sanidade: O calendário de vacinação obrigatória (ex: Febre Aftosa, Brucelose) está em dia?", class: "CRÍTICO", peso: 10 },
        { id: "RUR3", desc: "Identificação: Os animais estão devidamente identificados (brinco, marcação)?", class: "MAIOR", peso: 5 },
        { id: "RUR4", desc: "Caderno de campo/Tratamentos é preenchido a cada aplicação de medicamento?", class: "CRÍTICO", peso: 10 },
        { id: "RUR5", desc: "Resíduos/Medicamentos: Foi respeitado o período de carência dos lotes tratados?", class: "CRÍTICO", peso: 10 },
      ]
    },
    {
      id: "BEM", titulo: "BEM-ESTAR ANIMAL E AMBIENTE", cor: "#0d47a1",
      itens: [
        { id: "BEM1", desc: "Bem-Estar: Os animais têm acesso irrestrito a água limpa e sombra/abrigo?", class: "CRÍTICO", peso: 10 },
        { id: "BEM2", desc: "Instalações estão livres de objetos cortantes ou estruturas que causem lesão?", class: "MAIOR", peso: 5 },
        { id: "BEM3", desc: "Manejo de mortalidade (composteira, fossa) obedece normas sanitárias e ambientais?", class: "CRÍTICO", peso: 10 },
        { id: "BEM4", desc: "Descarte de embalagens de agrotóxicos/medicamentos (logística reversa) é realizado?", class: "MAIOR", peso: 5 },
      ]
    }
  ],

  areas_especiais: [
    {
      id: "ETI", titulo: "ÉTICA E BIOSSEGURANÇA", cor: "#b71c1c",
      itens: [
        ...ITENS_GERAIS,
        { id: "ESP1", desc: "Ética: Todos os projetos de pesquisa têm aprovação documentada da CEUA?", class: "CRÍTICO", peso: 10 },
        { id: "ESP2", desc: "Acesso: O controle de acesso a áreas de risco biológico é efetivo e restrito?", class: "CRÍTICO", peso: 10 },
        { id: "ESP3", desc: "Resíduos Químicos/Biológicos: O descarte segue o fluxo normativo de segurança?", class: "CRÍTICO", peso: 10 },
      ]
    },
    {
      id: "EQU", titulo: "EQUIPAMENTOS E PROCEDIMENTOS", cor: "#0d47a1",
      itens: [
        { id: "EQU1", desc: "Calibração: Pipetas, estufas e equipamentos críticos têm selo de calibração válido?", class: "CRÍTICO", peso: 10 },
        { id: "EQU2", desc: "POPs de procedimentos analíticos ou de contenção estão fixados e revisados?", class: "MAIOR", peso: 5 },
        { id: "EQU3", desc: "EPIs específicos (óculos, luvas nitrílicas, jalecos) estão disponíveis e sendo usados?", class: "CRÍTICO", peso: 10 },
      ]
    }
  ]
};

// ── CHECKLIST: AÇOUGUE / SIM ──────────────────────────────────
export const SETORES_ACOUGUE = [
  {
    id: "SIM-A", titulo: "DOCUMENTAÇÃO E REGISTRO", cor: "#1b4332",
    itens: [
      { id:"SA1",  desc:"Registro no SIM/SIE/SIF ativo e afixado em local visível?",                    class:"CRÍTICO", peso:10, ref:"Lei 7889/1989" },
      { id:"SA2",  desc:"Alvará Sanitário vigente emitido pela Vigilância Sanitária Municipal?",          class:"CRÍTICO", peso:10, ref:"RDC ANVISA 216/2004" },
      { id:"SA3",  desc:"Alvará de localização e funcionamento da Prefeitura vigente?",                  class:"CRÍTICO", peso:10 },
      { id:"SA4",  desc:"Licença Ambiental de operação (SEMADUR ou equivalente) vigente?",               class:"CRÍTICO", peso:10, ref:"CONAMA 316/2002" },
      { id:"SA5",  desc:"ART do médico veterinário RT homologada pelo CRMV e afixada?",                  class:"CRÍTICO", peso:10, ref:"Lei 5.517/68" },
      { id:"SA6",  desc:"CNPJ, Contrato Social e Inscrição Municipal atualizados em arquivo?",           class:"MAIOR",   peso:5 },
      { id:"SA7",  desc:"Termo de Compromisso assinado pelo responsável legal arquivado?",               class:"MAIOR",   peso:5,  ref:"SIM/CG" },
      { id:"SA8",  desc:"Rótulos de todos os produtos aprovados pelo SIM/SIE/SIF?",                     class:"CRÍTICO", peso:10, ref:"RIISPOA/2017" },
      { id:"SA9",  desc:"Memorial Descritivo do estabelecimento atualizado com planta baixa?",           class:"MAIOR",   peso:5,  ref:"SIM/CG" },
    ]
  },
  {
    id: "SIM-B", titulo: "BOAS PRÁTICAS DE FABRICAÇÃO (BPF)", cor: "#0d47a1",
    itens: [
      { id:"SB1",  desc:"Manual de Boas Práticas (MBP) elaborado, assinado pelo RT e atualizado?",      class:"CRÍTICO", peso:10, ref:"Portaria 368/1997 MAPA" },
      { id:"SB2",  desc:"POPs de limpeza e higienização documentados e treinados com equipe?",           class:"CRÍTICO", peso:10, ref:"Portaria 368/1997 MAPA" },
      { id:"SB3",  desc:"POP de descongelamento de carnes documentado (proibido temp. ambiente)?",       class:"CRÍTICO", peso:10, ref:"RDC ANVISA 216/2004" },
      { id:"SB4",  desc:"POP de controle de pragas documentado com laudo de empresa credenciada?",       class:"MAIOR",   peso:5 },
      { id:"SB5",  desc:"Higienização de uniformes: aventais brancos, botas e toucas em uso?",           class:"MAIOR",   peso:5,  ref:"Portaria 368/1997" },
      { id:"SB6",  desc:"Manipuladores com ASO (atestado de saúde ocupacional) em dia?",                class:"CRÍTICO", peso:10 },
      { id:"SB7",  desc:"Curso de higiene alimentar (mínimo 10h) realizado por todos os manipuladores?",class:"MAIOR",   peso:5 },
      { id:"SB8",  desc:"Certificados de treinamento arquivados com data e assinatura?",                 class:"MAIOR",   peso:5 },
      { id:"SB9",  desc:"Balança calibrada com certificado de calibração vigente?",                      class:"MAIOR",   peso:5 },
    ]
  },
  {
    id: "SIM-C", titulo: "INFRAESTRUTURA E CÂMARAS FRIAS", cor: "#6a1b9a",
    itens: [
      { id:"SC1",  desc:"Câmaras frias com temperatura registrada 2x ao dia (planilha)?",               class:"CRÍTICO", peso:10, ref:"Portaria 368/1997" },
      { id:"SC2",  desc:"Termômetros das câmaras calibrados e com manutenção documentada?",             class:"MAIOR",   peso:5 },
      { id:"SC3",  desc:"Borrachas de vedação das câmaras íntegras (sem rachaduras ou mofo)?",          class:"MAIOR",   peso:5 },
      { id:"SC4",  desc:"Piso, paredes e teto impermeáveis e de fácil higienização?",                   class:"CRÍTICO", peso:10, ref:"Portaria 368/1997" },
      { id:"SC5",  desc:"Serra-fita e moedor de carne com POP de desmontagem e higienização?",          class:"CRÍTICO", peso:10 },
      { id:"SC6",  desc:"Caixas d'água vedadas com análise de qualidade (<6 meses)?",                   class:"MAIOR",   peso:5 },
      { id:"SC7",  desc:"Área de desossa separada fisicamente da área de venda?",                        class:"MAIOR",   peso:5,  ref:"Portaria 368/1997" },
      { id:"SC8",  desc:"Fluxograma de produção afixado e seguido (sem cruzamento limpo/sujo)?",        class:"MAIOR",   peso:5 },
    ]
  },
  {
    id: "SIM-D", titulo: "RASTREABILIDADE E CONTROLE", cor: "#e65100",
    itens: [
      { id:"SD1",  desc:"Toda matéria-prima recebida possui selo SIM/SIE/SIF ou SISBI verificado?",     class:"CRÍTICO", peso:10, ref:"Lei 7889/1989" },
      { id:"SD2",  desc:"Registro de recebimento com NF, temperatura e inspeção visual arquivado?",     class:"CRÍTICO", peso:10 },
      { id:"SD3",  desc:"Teste de rendimento documentado (peso entrada vs. saída do açougue)?",         class:"MAIOR",   peso:5 },
      { id:"SD4",  desc:"Controle de estoque diário com ficha de entrada e saída de produtos?",         class:"MAIOR",   peso:5 },
      { id:"SD5",  desc:"Procedimento documentado para recusa de carcaças fora de temperatura?",        class:"CRÍTICO", peso:10 },
      { id:"SD6",  desc:"Destino de resíduos sólidos (ossos, sebo) com contrato de empresa licenciada?",class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"SD7",  desc:"Perfurocortantes descartados em caixa resistente (tipo Descarpack)?",          class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
    ]
  },
  {
    id: "SIM-E", titulo: "PPHO E APPCC", cor: "#b71c1c",
    itens: [
      { id:"SE1",  desc:"PPHO (Proc. Padrão de Higiene Operacional) elaborado e implementado?",         class:"CRÍTICO", peso:10, ref:"Portaria 368/1997" },
      { id:"SE2",  desc:"APPCC (Análise de Perigos e Pontos Críticos) elaborado e revisado?",           class:"CRÍTICO", peso:10, ref:"Portaria 46/1998 MAPA" },
      { id:"SE3",  desc:"Planilhas de monitoramento dos PCCs preenchidas e arquivadas?",                class:"CRÍTICO", peso:10 },
      { id:"SE4",  desc:"PGRSS (Plano de Gerenciamento de Resíduos) elaborado e atualizado?",           class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"SE5",  desc:"Ações corretivas documentadas para desvios nos pontos críticos?",              class:"MAIOR",   peso:5 },
    ]
  },
];

// ── CHECKLIST: LABORATÓRIO CLÍNICO VETERINÁRIO (Res. 1374/2020) ──
export const SETORES_LABORATORIO = [
  {
    id: "LAB-A", titulo: "RESPONSABILIDADE TÉCNICA E DOCUMENTAÇÃO", cor: "#1b4332",
    itens: [
      { id:"LA1",  desc:"Médico-veterinário RT inscrito no CRMV com ART em dia?",                       class:"CRÍTICO", peso:10, ref:"Res. CFMV 1374/2020 Art.3" },
      { id:"LA2",  desc:"RT assegura cumprimento das legislações federal, estadual e municipal?",        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.5-I" },
      { id:"LA3",  desc:"POPs documentados, atualizados e assinados pelo RT?",                           class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.5-XI" },
      { id:"LA4",  desc:"PGRSS elaborado, implementado e atualizado?",                                   class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.29" },
      { id:"LA5",  desc:"Treinamentos de biossegurança realizados e certificados arquivados?",           class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.5-VIII" },
      { id:"LA6",  desc:"Laudos assinados por médico-veterinário com número do CRMV?",                  class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.10-X" },
      { id:"LA7",  desc:"Laudos e requisições arquivados por mínimo de 5 anos?",                        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.13" },
      { id:"LA8",  desc:"Exames só realizados com requisição válida (máx. 30 dias)?",                   class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.7" },
    ]
  },
  {
    id: "LAB-B", titulo: "ESTRUTURA FÍSICA OBRIGATÓRIA", cor: "#0d47a1",
    itens: [
      { id:"LB1",  desc:"Área de recepção/espera separada da área analítica?",                          class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.14-I" },
      { id:"LB2",  desc:"Área de classificação e conferência de amostras estruturada?",                 class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.14-II" },
      { id:"LB3",  desc:"Sanitário acessível ao público (ou acesso a sanitário do condomínio)?",        class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.14-III" },
      { id:"LB4",  desc:"Área para emissão de laudos e cadastro de pacientes estruturada?",             class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.14-IV" },
      { id:"LB5",  desc:"Sala de lavagem/esterilização ou contrato de terceirização comprovado?",       class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.14-VI" },
      { id:"LB6",  desc:"Bancadas de fácil higienização nas áreas analíticas?",                         class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.15-I" },
      { id:"LB7",  desc:"Climatização nas áreas analíticas?",                                           class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.15-V" },
      { id:"LB8",  desc:"Geladeira exclusiva para reagentes/amostras com termômetro mín./máx.?",        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.15-VI" },
      { id:"LB9",  desc:"Registro diário de temperatura da geladeira de reagentes/amostras?",           class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.15-VI" },
      { id:"LB10", desc:"Todas as pias com papel toalha e dispensador de sabonete?",                    class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.28-IV" },
    ]
  },
  {
    id: "LAB-C", titulo: "CONTROLE DE QUALIDADE", cor: "#6a1b9a",
    itens: [
      { id:"LC1",  desc:"Programa de Controle Interno de Qualidade (CIQ) documentado?",                 class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.18" },
      { id:"LC2",  desc:"Amostras controle analisadas com registros e critérios de aceitação?",         class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.18-I" },
      { id:"LC3",  desc:"Participação em programa de Avaliação Externa de Qualidade (AEQ/CEQ)?",        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.5-XII" },
      { id:"LC4",  desc:"Registros de CIQ e CEQ arquivados por mínimo de 1 ano?",                      class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.21" },
      { id:"LC5",  desc:"Manutenção preventiva dos equipamentos documentada?",                          class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.18-IV" },
      { id:"LC6",  desc:"Mecanismo de identificação dos profissionais que executaram cada exame?",      class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.22" },
    ]
  },
  {
    id: "LAB-D", titulo: "BIOSSEGURANÇA E RESÍDUOS", cor: "#e65100",
    itens: [
      { id:"LD1",  desc:"Fluxo limpo/sujo respeitado (áreas crítica e não-crítica separadas)?",        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.28-II" },
      { id:"LD2",  desc:"Controlados armazenados em armário com fechadura sob responsabilidade do RT?", class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.28-III" },
      { id:"LD3",  desc:"Resíduos de saúde descartados conforme PGRSS e RDC 222/2018?",               class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.29" },
      { id:"LD4",  desc:"Alimentos armazenados fora da área analítica em geladeira exclusiva?",        class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.28-I" },
      { id:"LD5",  desc:"Controle eficaz de vetores e pragas com laudo de empresa credenciada?",       class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.28-X" },
    ]
  },
  {
    id: "LAB-E", titulo: "DOENÇAS DE NOTIFICAÇÃO COMPULSÓRIA", cor: "#b71c1c",
    itens: [
      { id:"LE1",  desc:"Procedimento documentado para notificação de doenças compulsórias?",          class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.26" },
      { id:"LE2",  desc:"Laboratório informa órgãos oficiais sobre resultados suspeitos/positivos?",   class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.13" },
    ]
  },
];

// ── CHECKLIST: POSTO DE COLETA VETERINÁRIO ────────────────────
export const SETORES_POSTO_COLETA = [
  {
    id: "PC-A", titulo: "RESPONSABILIDADE E DOCUMENTAÇÃO", cor: "#1b4332",
    itens: [
      { id:"PA1",  desc:"Médico-veterinário RT com ART ativa e afixada no posto?",                      class:"CRÍTICO", peso:10, ref:"Res. CFMV 1374/2020 Art.3" },
      { id:"PA2",  desc:"POPs de fase pré-analítica documentados e treinados?",                         class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.11" },
      { id:"PA3",  desc:"Requisições de exames arquivadas (máx. 30 dias de validade)?",                class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.7" },
      { id:"PA4",  desc:"PGRSS elaborado e implementado?",                                               class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.29" },
    ]
  },
  {
    id: "PC-B", titulo: "SALA DE COLETA E INFRAESTRUTURA", cor: "#0d47a1",
    itens: [
      { id:"PB1",  desc:"Sala de coleta com mesa impermeável, pia de higienização e armários?",        class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.16-I-a" },
      { id:"PB2",  desc:"Recipientes adequados para descarte de resíduos na sala de coleta?",           class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.16-I-a" },
      { id:"PB3",  desc:"Geladeira exclusiva para amostras com termômetro e registro diário?",          class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.15-VI" },
      { id:"PB4",  desc:"Acondicionamento e envio de amostras conforme orientação do laboratório?",    class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.9" },
      { id:"PB5",  desc:"Sedativos/tranquilizantes para coleta usados com MV presente e supervisionando?", class:"CRÍTICO", peso:10, ref:"Res. 1374/2020 Art.27" },
    ]
  },
  {
    id: "PC-C", titulo: "BIOSSEGURANÇA", cor: "#6a1b9a",
    itens: [
      { id:"PC1",  desc:"EPIs disponíveis e em uso durante as coletas (luvas, máscara, avental)?",     class:"CRÍTICO", peso:10 },
      { id:"PC2",  desc:"Perfurocortantes descartados em caixa resistente?",                            class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"PC3",  desc:"Pias de higienização com papel toalha e sabonete?",                            class:"MAIOR",   peso:5,  ref:"Res. 1374/2020 Art.28-IV" },
    ]
  },
];

// Fallback/Default exporter for old references if needed
export const SETORES = CHECKLISTS_POR_AREA.pequenos_animais;

// ── Mapa de checklists por tipo de estabelecimento ────────────
export const CHECKLIST_POR_TIPO = {
  clinica:      SETORES,            // existente
  acougue:      SETORES_ACOUGUE,
  laboratorio:  SETORES_LABORATORIO,
  posto_coleta: SETORES_POSTO_COLETA,
};

// ── Labels por tipo ───────────────────────────────────────────
export const LABEL_TIPO = {
  clinica:      "Clínica Veterinária",
  acougue:      "Açougue / Beneficiamento",
  laboratorio:  "Laboratório Clínico",
  posto_coleta: "Posto de Coleta",
};

// ── Vencimentos relevantes por tipo ──────────────────────────
export const VENCIMENTOS_POR_TIPO = {
  clinica: [
    { campo: "vencCrmv",     label: "CRMV — Certificado RT",    diasAlerta: 30 },
    { campo: "vencAlvara",   label: "Alvará Sanitário",         diasAlerta: 30 },
    { campo: "vencSipeagro", label: "SIPEAGRO",                 diasAlerta: 30 },
    { campo: "vencCaixaAgua",label: "Caixa d'água",             diasAlerta: 15 },
  ],
  acougue: [
    { campo: "vencCrmv",       label: "ART / CRMV do RT",        diasAlerta: 30 },
    { campo: "vencAlvara",     label: "Alvará Sanitário",         diasAlerta: 30 },
    { campo: "vencSim",        label: "Registro SIM/SIE/SIF",    diasAlerta: 60 },
    { campo: "vencLicAmbiental",label: "Licença Ambiental",      diasAlerta: 60 },
    { campo: "vencCaixaAgua",  label: "Análise Caixa d'água",    diasAlerta: 15 },
  ],
  laboratorio: [
    { campo: "vencCrmv",   label: "CRMV — RT",                   diasAlerta: 30 },
    { campo: "vencAlvara", label: "Alvará Sanitário",             diasAlerta: 30 },
    { campo: "vencAEQ",    label: "AEQ — Avaliação Ext. Qualidade", diasAlerta: 60 },
    { campo: "vencCIQ",    label: "CIQ — Revisão Controle Int.", diasAlerta: 30 },
    { campo: "vencLicAmbiental", label: "Licença Ambiental",     diasAlerta: 60 },
  ],
  posto_coleta: [
    { campo: "vencCrmv",   label: "CRMV — RT",                   diasAlerta: 30 },
    { campo: "vencAlvara", label: "Alvará Sanitário",             diasAlerta: 30 },
  ],
};
