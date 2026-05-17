/**
 * VERTOS OS — Base de Legislação Sanitária Estadual
 * Regramentos Jurídico-Sanitários das 27 Unidades Federadas Brasileiras
 *
 * Fonte: "Gestão das ações sanitárias das Secretarias Estaduais de Saúde:
 * análise dos respectivos regramentos e códigos de vigilância sanitária" (2021)
 *
 * Uso: importar getLegislacaoEstado(uf) no prompt do Intérprete BVO para
 * enriquecer a análise com a legislação sanitária específica do estado da clínica.
 *
 * ATENÇÃO MULTI-TENANT: cada clínica cadastrada deve ter o campo `estado` (UF)
 * preenchido. O prompt deve sempre incluir a legislação do estado correspondente.
 */

// ─────────────────────────────────────────────────────────────
// LEGISLAÇÃO FEDERAL — base comum a todos os estados
// ─────────────────────────────────────────────────────────────
export const LEGISLACAO_FEDERAL = {
  cfmv: [
    {
      codigo: "Resolução CFMV nº 1.015/2012",
      descricao: "Dispõe sobre o exercício da Medicina Veterinária e as atribuições do médico-veterinário responsável técnico.",
      areas: ["responsabilidade_tecnica", "estabelecimentos_veterinarios"]
    },
    {
      codigo: "Resolução CFMV nº 1.138/2016",
      descricao: "Aprova o Código de Ética do Médico-Veterinário.",
      areas: ["etica", "responsabilidade_profissional"]
    },
    {
      codigo: "Resolução CFMV nº 1.236/2018",
      descricao: "Define os estabelecimentos médico-veterinários e suas categorias.",
      areas: ["classificacao_estabelecimentos", "requisitos_estruturais"]
    },
    {
      codigo: "Resolução CFMV nº 1.256/2019",
      descricao: "Dispõe sobre bem-estar animal em estabelecimentos veterinários.",
      areas: ["bem_estar_animal", "estrutura_fisica"]
    },
    {
      codigo: "Resolução CFMV nº 1.000/2012",
      descricao: "Dispõe sobre procedimentos e métodos de eutanásia em animais.",
      areas: ["eutanasia", "protocolos_clinicos"]
    }
  ],
  mapa: [
    {
      codigo: "IN MAPA nº 35/2019",
      descricao: "Registro, fabricação, importação, exportação e comércio de produtos veterinários.",
      areas: ["medicamentos_veterinarios", "controle_estoque"]
    },
    {
      codigo: "IN MAPA nº 48/2013",
      descricao: "Regulamento técnico para medicamentos veterinários de uso controlado.",
      areas: ["controlados", "receituario_veterinario"]
    },
    {
      codigo: "IN MAPA nº 27/2018",
      descricao: "Registro de estabelecimentos e profissionais que fabriquem, importem ou comercializem produtos veterinários.",
      areas: ["licenciamento", "estabelecimentos_veterinarios"]
    },
    {
      codigo: "Decreto Federal nº 6.296/2007",
      descricao: "Regulamenta a Lei nº 10.519/2002 sobre exploração e comércio de animais.",
      areas: ["comercio_animais", "criadouros"]
    },
    {
      codigo: "Lei Federal nº 9.605/1998",
      descricao: "Lei de Crimes Ambientais — penalidades para maus-tratos a animais.",
      areas: ["bem_estar_animal", "responsabilidade_legal"]
    },
    {
      codigo: "Lei Federal nº 9.782/1999",
      descricao: "Define o Sistema Nacional de Vigilância Sanitária (ANVISA).",
      areas: ["vigilancia_sanitaria", "licenciamento_federal"]
    },
    {
      codigo: "RDC ANVISA nº 222/2018",
      descricao: "Regulamento técnico para o gerenciamento de resíduos de serviços de saúde (RSS).",
      areas: ["residuos_solidos", "gestao_ambiental"]
    },
    {
      codigo: "Lei Federal nº 7.802/1989 (Lei dos Agrotóxicos)",
      descricao: "Regula produção, comercialização e uso de agrotóxicos e afins.",
      areas: ["controle_pragas", "produtos_quimicos"]
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// LEGISLAÇÃO ESTADUAL — 27 UFs
// ─────────────────────────────────────────────────────────────
export const LEGISLACAO_ESTADUAL = {

  AC: {
    uf: "AC",
    estado: "Acre",
    orgaoFiscalizador: "SESACRE — Secretaria de Estado de Saúde do Acre",
    vigilanciaSanitaria: "VISA-AC",
    codigoSanitarioBase: {
      numero: "Lei Complementar nº 62",
      data: "07/12/1982",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Acre. Regula as condições de saúde pública, higiene e funcionamento de estabelecimentos.",
      areas: ["licenciamento_sanitario", "estrutura_fisica", "higiene", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 4.567/2001 — Regulamentação de estabelecimentos de saúde animal",
      "Portarias SESACRE vigentes sobre vigilância sanitária veterinária"
    ],
    observacoesRT: "Consultar CRMV-AC e SESACRE para atualizações. O Acre possui fiscalização integrada com o IBAMA para estabelecimentos próximos a áreas de preservação.",
    crmvRegional: "CRMV-AC",
    prazoLicensaVisa: "Renovação anual do Alvará Sanitário",
    documentosEspecificos: [
      "Alvará de Funcionamento Sanitário (SESACRE)",
      "Licença Ambiental (IMAC) para estabelecimentos com resíduos hospitalares",
      "ART do Responsável Técnico junto ao CRMV-AC"
    ]
  },

  AL: {
    uf: "AL",
    estado: "Alagoas",
    orgaoFiscalizador: "SESAU-AL — Secretaria de Estado de Saúde de Alagoas",
    vigilanciaSanitaria: "VISA-AL",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 4.406",
      data: "12/12/1982",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Alagoas. Estabelece normas de higiene, saúde pública e vigilância sanitária.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos_solidos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 35.432 — Normas para estabelecimentos de saúde",
      "Portaria SESAU-AL sobre Gerenciamento de Resíduos de Serviços de Saúde"
    ],
    observacoesRT: "Alagoas exige o Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS) atualizado para renovação do alvará.",
    crmvRegional: "CRMV-AL",
    prazoLicensaVisa: "Renovação anual do Alvará Sanitário",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-AL)",
      "PGRSS aprovado pela VISA",
      "ART do RT junto ao CRMV-AL",
      "Licença Ambiental do IMA-AL (se aplicável)"
    ]
  },

  AP: {
    uf: "AP",
    estado: "Amapá",
    orgaoFiscalizador: "SESA-AP — Secretaria de Estado de Saúde do Amapá",
    vigilanciaSanitaria: "VISA-AP",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 7.199",
      data: "13/11/2002",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Amapá. Normas gerais de saúde pública e controle sanitário.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica"]
    },
    normasComplementares: [
      "Portarias SESA-AP sobre vigilância sanitária de estabelecimentos de saúde animal",
      "Decreto Estadual regulamentando RSS no Amapá"
    ],
    observacoesRT: "Estado com fiscalização ambiental rigorosa pelo IMAP. Clínicas veterinárias próximas a áreas de proteção ambiental devem ter licença específica.",
    crmvRegional: "CRMV-AP (jurisdição do CRMV-PA em alguns casos)",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (SESA-AP)",
      "Licença Ambiental IMAP",
      "ART do RT junto ao CRMV-AP/PA"
    ]
  },

  AM: {
    uf: "AM",
    estado: "Amazonas",
    orgaoFiscalizador: "SUSAM — Superintendência Estadual de Saúde do Amazonas",
    vigilanciaSanitaria: "VISA-AM / DEVISA",
    codigoSanitarioBase: {
      numero: "Lei Complementar nº 70",
      data: "03/12/2009",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Amazonas. Regulamenta saúde pública, vigilância sanitária e epidemiológica.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "controle_vetores", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 32.111/2012 — Plano Estadual de RSS",
      "Portaria SUSAM sobre estabelecimentos veterinários",
      "Resolução CEMAAM sobre licenciamento ambiental"
    ],
    observacoesRT: "O Amazonas tem fiscalização dupla: SUSAM (sanitária) e IPAAM (ambiental). Manaus possui legislação municipal adicional (Código Sanitário de Manaus).",
    crmvRegional: "CRMV-AM",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (DEVISA/SUSAM)",
      "Licença Ambiental IPAAM",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-AM"
    ]
  },

  BA: {
    uf: "BA",
    estado: "Bahia",
    orgaoFiscalizador: "SESA-BA — Secretaria da Saúde do Estado da Bahia",
    vigilanciaSanitaria: "DIVISA-BA / VISA municipal",
    codigoSanitarioBase: {
      numero: "Decreto Estadual nº 29.414",
      data: "05/01/1983",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado da Bahia. Base legal para todas as ações de vigilância sanitária estadual.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "controle_alimentos", "residuos"]
    },
    normasComplementares: [
      "Lei Estadual nº 12.212/2011 — Política Estadual de RSS",
      "Portaria SESA-BA nº 26/2013 — Estabelecimentos de saúde",
      "Resolução CEPRAM sobre licenciamento ambiental"
    ],
    observacoesRT: "A Bahia tem sistema de fiscalização descentralizado — municípios com mais de 30.000 habitantes têm VISA municipal autônoma. Salvador possui legislação específica adicional.",
    crmvRegional: "CRMV-BA",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (DIVISA-BA ou VISA municipal)",
      "PGRSS aprovado pela VISA competente",
      "Licença Ambiental INEMA (se aplicável)",
      "ART do RT junto ao CRMV-BA"
    ]
  },

  CE: {
    uf: "CE",
    estado: "Ceará",
    orgaoFiscalizador: "SESA-CE — Secretaria da Saúde do Estado do Ceará",
    vigilanciaSanitaria: "VISA-CE / NUVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 10.760",
      data: "17/12/1982",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Ceará. Disciplina a vigilância sanitária e epidemiológica.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "controle_vetores"]
    },
    normasComplementares: [
      "Decreto Estadual nº 33.608/2020 — Reorganização da VISA-CE",
      "Resolução COEMA-CE sobre RSS",
      "Portaria SESA-CE sobre estabelecimentos de saúde animal"
    ],
    observacoesRT: "O Ceará integrou o sistema de vigilância sanitária municipal através do SUS. Fortaleza tem SEUMA (fiscalização ambiental) com exigências específicas.",
    crmvRegional: "CRMV-CE",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-CE ou municipal)",
      "PGRSS aprovado",
      "Certificado de Controle de Pragas",
      "ART do RT junto ao CRMV-CE"
    ]
  },

  DF: {
    uf: "DF",
    estado: "Distrito Federal",
    orgaoFiscalizador: "SES-DF — Secretaria de Estado de Saúde do Distrito Federal",
    vigilanciaSanitaria: "VISA-DF / DIVISA",
    codigoSanitarioBase: {
      numero: "Lei Distrital nº 5.321",
      data: "07/03/2014",
      status: "Em vigor",
      descricao: "Código Sanitário do Distrito Federal. Um dos mais modernos do país, com linguagem atualizada e regulamentação abrangente.",
      areas: ["licenciamento_sanitario", "estrutura_fisica", "higiene", "residuos", "vigilancia_epidemiologica"]
    },
    normasComplementares: [
      "Decreto Distrital nº 36.670/2015 — Regulamenta o Código Sanitário do DF",
      "Portaria SES-DF nº 276/2021 — Estabelecimentos veterinários",
      "Instrução Normativa IBRAM sobre licenciamento ambiental no DF"
    ],
    observacoesRT: "O DF tem legislação mais recente e organizada. A VISA-DF exige Alvará específico para clínicas veterinárias com internação. IBRAM fiscaliza questões ambientais.",
    crmvRegional: "CRMV-DF",
    prazoLicensaVisa: "Renovação bienal (verificar atualização)",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-DF)",
      "Licença Ambiental IBRAM (para estabelecimentos com RSS classe II)",
      "PGRSS aprovado pela VISA-DF",
      "Registro no CRMV-DF do estabelecimento",
      "ART do RT junto ao CRMV-DF"
    ]
  },

  ES: {
    uf: "ES",
    estado: "Espírito Santo",
    orgaoFiscalizador: "SESA-ES — Secretaria de Estado da Saúde do Espírito Santo",
    vigilanciaSanitaria: "VISA-ES / GEVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 6.066",
      data: "31/12/1999",
      status: "Em vigor (com emendas)",
      descricao: "Código Estadual de Saúde do Espírito Santo. Regulamenta vigilância sanitária, epidemiológica e saúde ambiental.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "saude_ambiental"]
    },
    normasComplementares: [
      "Decreto Estadual nº 4.344-R/2018 — Regulamento de RSS no ES",
      "Portaria SESA-ES sobre estabelecimentos veterinários",
      "IEMA — Instrução Normativa sobre licenciamento ambiental"
    ],
    observacoesRT: "O ES tem sistema de descentralização avançado. Municípios habilitados em Gestão Plena do Sistema de Saúde têm autonomia total na vigilância sanitária.",
    crmvRegional: "CRMV-ES",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-ES ou municipal)",
      "PGRSS aprovado",
      "Licença Ambiental IEMA (se aplicável)",
      "ART do RT junto ao CRMV-ES"
    ]
  },

  GO: {
    uf: "GO",
    estado: "Goiás",
    orgaoFiscalizador: "SES-GO — Secretaria de Estado da Saúde de Goiás",
    vigilanciaSanitaria: "VISA-GO / DVSSA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 16.140",
      data: "02/10/2007",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Goiás. Atualizado em relação à maioria dos estados, incorpora conceitos modernos de vigilância sanitária.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "controle_vetores", "agua_esgoto"]
    },
    normasComplementares: [
      "Decreto Estadual nº 9.316/2018 — Regulamento Sanitário de Goiás",
      "Portaria SES-GO sobre estabelecimentos de saúde animal",
      "Resolução CONAMA e SECIMA-GO sobre RSS"
    ],
    observacoesRT: "Goiás tem um dos códigos sanitários mais recentes do Centro-Oeste. Goiânia possui VISA municipal autônoma com exigências adicionais para clínicas veterinárias com cirurgia.",
    crmvRegional: "CRMV-GO",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-GO ou municipal)",
      "PGRSS aprovado pela VISA competente",
      "Certificado de Desinsetização/Desratização",
      "Licença Ambiental SECIMA (se aplicável)",
      "ART do RT junto ao CRMV-GO"
    ]
  },

  MA: {
    uf: "MA",
    estado: "Maranhão",
    orgaoFiscalizador: "SES-MA — Secretaria de Estado da Saúde do Maranhão",
    vigilanciaSanitaria: "VISA-MA / COVISA",
    codigoSanitarioBase: {
      numero: "Lei Complementar nº 39",
      data: "15/12/1998",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Maranhão. Regula saúde pública, vigilância sanitária e epidemiológica.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 19.714/2003 — Regulamento de RSS no MA",
      "Portaria SES-MA sobre estabelecimentos veterinários",
      "SEMA-MA — Instrução Normativa ambiental"
    ],
    observacoesRT: "São Luís tem fiscalização municipal própria. O Maranhão exige registro da clínica junto ao CRMV-MA como condição para o Alvará Sanitário.",
    crmvRegional: "CRMV-MA",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-MA)",
      "Registro da Clínica no CRMV-MA",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-MA"
    ]
  },

  MT: {
    uf: "MT",
    estado: "Mato Grosso",
    orgaoFiscalizador: "SES-MT — Secretaria de Estado de Saúde de Mato Grosso",
    vigilanciaSanitaria: "VISA-MT / DVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 7.110",
      data: "10/02/1999",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Mato Grosso. Regula vigilância sanitária e saúde pública estadual.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua"]
    },
    normasComplementares: [
      "Decreto Estadual nº 1.293/2017 — Regulamento sanitário de MT",
      "Portaria SES-MT sobre estabelecimentos de saúde animal",
      "SEMA-MT — Instrução Normativa para RSS e licença ambiental"
    ],
    observacoesRT: "Cuiabá e Várzea Grande possuem VISA municipal. MT tem fiscalização agropecuária forte pela INDEA-MT, que atua em conjunto com o CRMV-MT para estabelecimentos veterinários.",
    crmvRegional: "CRMV-MT",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-MT ou municipal)",
      "Registro no INDEA-MT (quando aplicável)",
      "PGRSS aprovado",
      "Licença Ambiental SEMA-MT",
      "ART do RT junto ao CRMV-MT"
    ]
  },

  MS: {
    uf: "MS",
    estado: "Mato Grosso do Sul",
    orgaoFiscalizador: "SES-MS — Secretaria de Estado de Saúde de Mato Grosso do Sul",
    vigilanciaSanitaria: "VISA-MS / DVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 1.293",
      data: "21/09/1992",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Mato Grosso do Sul. Disciplina vigilância sanitária, condições higiênico-sanitárias e licenciamento de estabelecimentos.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "controle_vetores"]
    },
    normasComplementares: [
      "Decreto Estadual nº 14.396/2015 — Regulamento de RSS em MS",
      "Portaria SES-MS nº 72/2019 — Estabelecimentos de saúde animal",
      "IMASUL — Instrução Normativa sobre licenciamento ambiental",
      "Lei Municipal de Campo Grande nº 4.547/2007 — Posturas e saúde pública",
      "Resolução CRMV-MS sobre responsabilidade técnica em clínicas veterinárias"
    ],
    observacoesRT: "Campo Grande possui VISA municipal própria (VISA-CG). O CRMV-MS exige registro do estabelecimento e renovação anual da ART do RT. O IMASUL fiscaliza o descarte de RSS (resíduos de saúde animal).",
    crmvRegional: "CRMV-MS",
    prazoLicensaVisa: "Renovação anual do Alvará Sanitário",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-MS ou VISA-CG para Campo Grande)",
      "Alvará de Localização e Funcionamento (Prefeitura Municipal)",
      "ART do Responsável Técnico junto ao CRMV-MS (renovação anual)",
      "Registro do Estabelecimento no CRMV-MS",
      "PGRSS — Plano de Gerenciamento de Resíduos de Serviços de Saúde",
      "Contrato com empresa coletora de RSS (classe A e B)",
      "Certificado de Desinsetização e Desratização (mínimo semestral)",
      "Licença Ambiental IMASUL (estabelecimentos com internação ou cirurgia)"
    ]
  },

  MG: {
    uf: "MG",
    estado: "Minas Gerais",
    orgaoFiscalizador: "SES-MG — Secretaria de Estado de Saúde de Minas Gerais",
    vigilanciaSanitaria: "VISA-MG / DVSA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 13.317",
      data: "24/09/1999",
      status: "Em vigor (com emendas frequentes)",
      descricao: "Código de Saúde do Estado de Minas Gerais. Um dos mais completos do país, com atualizações frequentes e regulamentação específica por tipo de estabelecimento.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos", "controle_vetores"]
    },
    normasComplementares: [
      "Decreto Estadual nº 43.292/2003 — Regulamenta o Código de Saúde MG",
      "Resolução SES-MG nº 5.876/2021 — RSS em MG",
      "Deliberação Normativa COPAM sobre licenciamento ambiental",
      "Portaria SES-MG sobre estabelecimentos veterinários",
      "Lei Municipal de BH nº 8.616/2003 (para estabelecimentos em BH)"
    ],
    observacoesRT: "MG tem sistema avançado de regionalização da VISA. BH, Uberlândia e outras cidades com população >100k têm VISA municipal plena. O IEF-MG fiscaliza questões ambientais relacionadas.",
    crmvRegional: "CRMV-MG",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (SES-MG ou VISA municipal)",
      "PGRSS aprovado pela VISA competente",
      "Licença Ambiental SUPRAM/SEMAD (se aplicável)",
      "ART do RT junto ao CRMV-MG",
      "Registro do estabelecimento no CRMV-MG"
    ]
  },

  PA: {
    uf: "PA",
    estado: "Pará",
    orgaoFiscalizador: "SESPA — Secretaria de Estado de Saúde Pública do Pará",
    vigilanciaSanitaria: "VISA-PA / CEVS",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 5.199",
      data: "10/12/1984",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Pará. Regula condições sanitárias e funcionamento de estabelecimentos.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "agua", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 1.277/2008 — RSS no Pará",
      "Portaria SESPA sobre estabelecimentos de saúde animal",
      "SEMAS-PA — Instrução Normativa ambiental"
    ],
    observacoesRT: "Belém possui VISA municipal. O Pará tem fiscalização adicional do IBAMA e SEMAS para clínicas que atendam fauna silvestre (exótica).",
    crmvRegional: "CRMV-PA",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-PA ou municipal)",
      "Licença SEMAS-PA (para atendimento de fauna silvestre)",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-PA"
    ]
  },

  PB: {
    uf: "PB",
    estado: "Paraíba",
    orgaoFiscalizador: "SES-PB — Secretaria de Estado da Saúde da Paraíba",
    vigilanciaSanitaria: "VISA-PB / GEVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 7.069",
      data: "12/04/2002",
      status: "Em vigor (com emendas)",
      descricao: "Código de Saúde do Estado da Paraíba. Regulamenta vigilância sanitária e condições de saúde pública.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua"]
    },
    normasComplementares: [
      "Decreto Estadual nº 28.625/2007 — Regulamentação do Código de Saúde PB",
      "Portaria SES-PB sobre estabelecimentos veterinários",
      "SUDEMA — Instrução Normativa ambiental"
    ],
    observacoesRT: "João Pessoa tem VISA municipal própria. A PB exige que o RT seja domiciliado no estado para emissão da ART junto ao CRMV-PB.",
    crmvRegional: "CRMV-PB",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-PB ou municipal)",
      "PGRSS aprovado",
      "Licença Ambiental SUDEMA (se aplicável)",
      "ART do RT junto ao CRMV-PB"
    ]
  },

  PR: {
    uf: "PR",
    estado: "Paraná",
    orgaoFiscalizador: "SESA-PR — Secretaria de Estado da Saúde do Paraná",
    vigilanciaSanitaria: "VISA-PR / DVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 13.331",
      data: "23/11/2001",
      status: "Em vigor (com emendas)",
      descricao: "Código de Saúde do Estado do Paraná. Regulamenta vigilância sanitária, epidemiológica e saúde ambiental de forma integrada.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos", "controle_vetores"]
    },
    normasComplementares: [
      "Decreto Estadual nº 5.520/2002 — Regulamento do Código de Saúde PR",
      "Portaria SESA-PR nº 551/2021 — Estabelecimentos de saúde animal",
      "IAT — Instrução Normativa sobre licenciamento ambiental",
      "Resolução SESA-PR sobre RSS"
    ],
    observacoesRT: "Curitiba possui VISA municipal avançada (SMSA). O PR tem regionalização bem estruturada — 18 regionais de saúde com VISA regionais. IAT fiscaliza questões ambientais.",
    crmvRegional: "CRMV-PR",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-PR ou VISA municipal)",
      "PGRSS aprovado e empresa coletora contratada",
      "Licença Ambiental IAT (quando aplicável)",
      "ART do RT junto ao CRMV-PR",
      "Registro do estabelecimento no CRMV-PR"
    ]
  },

  PE: {
    uf: "PE",
    estado: "Pernambuco",
    orgaoFiscalizador: "SES-PE — Secretaria Estadual de Saúde de Pernambuco",
    vigilanciaSanitaria: "VISA-PE / DVSS",
    codigoSanitarioBase: {
      numero: "Decreto Estadual nº 20.786",
      data: "10/08/1998",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Pernambuco. Normas de saúde pública, vigilância sanitária e epidemiológica.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos"]
    },
    normasComplementares: [
      "Lei Estadual nº 13.787/2009 — Política Estadual de RSS",
      "Portaria SES-PE sobre estabelecimentos de saúde animal",
      "CPRH-PE — Instrução Normativa ambiental"
    ],
    observacoesRT: "Recife tem VISA municipal (Secretaria de Saúde do Recife) com exigências adicionais. PE tem protocolo específico para descarte de resíduos de laboratório veterinário.",
    crmvRegional: "CRMV-PE",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-PE ou municipal)",
      "Licença Ambiental CPRH",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-PE"
    ]
  },

  PI: {
    uf: "PI",
    estado: "Piauí",
    orgaoFiscalizador: "SESAPI — Secretaria de Estado da Saúde do Piauí",
    vigilanciaSanitaria: "VISA-PI / GVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 6.174",
      data: "06/02/2012",
      status: "Em vigor",
      descricao: "Código de Saúde do Estado do Piauí. Uma das legislações sanitárias estaduais mais recentes, com abordagem moderna.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "saude_trabalhador"]
    },
    normasComplementares: [
      "Decreto Estadual nº 15.222/2013 — Regulamento do Código de Saúde PI",
      "Portaria SESAPI sobre estabelecimentos veterinários",
      "SEMAR-PI — Instrução Normativa ambiental"
    ],
    observacoesRT: "Teresina tem VISA municipal ativa. O PI tem parceria com o MAPA para fiscalização de estabelecimentos que comercializam medicamentos veterinários.",
    crmvRegional: "CRMV-PI",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-PI ou municipal)",
      "PGRSS aprovado",
      "Licença Ambiental SEMAR-PI",
      "ART do RT junto ao CRMV-PI"
    ]
  },

  RJ: {
    uf: "RJ",
    estado: "Rio de Janeiro",
    orgaoFiscalizador: "SES-RJ — Secretaria de Estado de Saúde do Rio de Janeiro",
    vigilanciaSanitaria: "VISA-RJ / SUBVISA",
    codigoSanitarioBase: {
      numero: "Decreto Estadual nº 1.754",
      data: "16/03/1978",
      status: "Em vigor (amplamente emendado)",
      descricao: "Código Sanitário do Estado do Rio de Janeiro. Base muito antiga, amplamente atualizada por portarias e decretos complementares ao longo das décadas.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos"]
    },
    normasComplementares: [
      "Lei Estadual nº 6.408/2013 — Política Estadual de RSS no RJ",
      "Resolução SES-RJ nº 1.887/2019 — Estabelecimentos de saúde",
      "INEA — Instrução Normativa ambiental RJ",
      "Lei Municipal do Rio nº 2.687/1998 (para estabelecimentos na capital)"
    ],
    observacoesRT: "O Rio de Janeiro tem um dos sistemas de VISA mais descentralizados do Brasil. A Cidade do RJ tem VISA municipal muito atuante (VISA-Rio). Niterói e outras cidades grandes têm VISA própria.",
    crmvRegional: "CRMV-RJ",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-RJ ou VISA municipal)",
      "PGRSS aprovado com contrato de empresa coletora",
      "Licença Ambiental INEA (quando aplicável)",
      "ART do RT junto ao CRMV-RJ",
      "Registro do estabelecimento no CRMV-RJ"
    ]
  },

  RN: {
    uf: "RN",
    estado: "Rio Grande do Norte",
    orgaoFiscalizador: "SESAP-RN — Secretaria de Estado da Saúde Pública do RN",
    vigilanciaSanitaria: "VISA-RN / GEVISA",
    codigoSanitarioBase: {
      numero: "Lei Complementar nº 31",
      data: "24/11/1982",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Rio Grande do Norte. Regulamenta vigilância sanitária e saúde pública.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua"]
    },
    normasComplementares: [
      "Decreto Estadual nº 13.127/1997 — Regulamento RSS no RN",
      "Portaria SESAP-RN sobre estabelecimentos de saúde animal",
      "IDEMA — Instrução Normativa ambiental"
    ],
    observacoesRT: "Natal possui VISA municipal ativa. O RN tem protocolo específico para clínicas veterinárias com atendimento a animais silvestres (fauna da Caatinga).",
    crmvRegional: "CRMV-RN",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-RN ou municipal)",
      "PGRSS aprovado",
      "Licença Ambiental IDEMA (se aplicável)",
      "ART do RT junto ao CRMV-RN"
    ]
  },

  RS: {
    uf: "RS",
    estado: "Rio Grande do Sul",
    orgaoFiscalizador: "SES-RS — Secretaria de Estado da Saúde do Rio Grande do Sul",
    vigilanciaSanitaria: "VISA-RS / DGVS",
    codigoSanitarioBase: {
      numero: "Decreto Estadual nº 23.430",
      data: "24/10/1974",
      status: "Base Ativa com revogações parciais recentes (Dec. 58.584/2026 revogou partes)",
      descricao: "Código Sanitário do Estado do Rio Grande do Sul. Base muito antiga, com constantes atualizações. O Dec. 58.584/2026 revogou partes importantes — verificar texto consolidado atualizado.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 58.584/2026 — Revoga partes do Código Sanitário RS (VERIFICAR TEXTO INTEGRAL)",
      "Portaria SES-RS nº 487/2019 — RSS no RS",
      "FEPAM — Instrução Normativa ambiental RS",
      "Resolução CONSEMA sobre RSS",
      "Portaria SES-RS sobre estabelecimentos veterinários"
    ],
    observacoesRT: "ATENÇÃO: O RS passou por atualização recente do seu código sanitário em 2026. Porto Alegre tem VISA municipal (VISA-POA) muito ativa. FEPAM fiscaliza questões ambientais. Caxias do Sul e outras cidades grandes têm VISA própria.",
    crmvRegional: "CRMV-RS",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-RS ou municipal)",
      "PGRSS aprovado e empresa coletora contratada",
      "Licença Ambiental FEPAM (quando aplicável)",
      "ART do RT junto ao CRMV-RS",
      "Registro do estabelecimento no CRMV-RS"
    ]
  },

  RO: {
    uf: "RO",
    estado: "Rondônia",
    orgaoFiscalizador: "SESAU-RO — Secretaria de Estado de Saúde de Rondônia",
    vigilanciaSanitaria: "VISA-RO / GVISA",
    codigoSanitarioBase: {
      numero: "Decreto-Lei Estadual nº 36",
      data: "17/12/1982",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Rondônia. Regula condições sanitárias e vigilância em saúde.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "agua", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 12.669/2007 — RSS em RO",
      "Portaria SESAU-RO sobre estabelecimentos veterinários",
      "SEDAM-RO — Instrução Normativa ambiental"
    ],
    observacoesRT: "Porto Velho tem VISA municipal. RO tem fiscalização ambiental do SEDAM, especialmente relevante para clínicas próximas a áreas de proteção ambiental amazônicas.",
    crmvRegional: "CRMV-RO",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-RO ou municipal)",
      "Licença Ambiental SEDAM",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-RO"
    ]
  },

  RR: {
    uf: "RR",
    estado: "Roraima",
    orgaoFiscalizador: "SESAU-RR — Secretaria Estadual de Saúde de Roraima",
    vigilanciaSanitaria: "VISA-RR",
    codigoSanitarioBase: {
      numero: "Lei Complementar Estadual nº 62",
      data: "14/01/2003",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Roraima. Regulamenta vigilância sanitária, epidemiológica e saúde ambiental.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "agua", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual sobre RSS em RR",
      "FEMACT — Instrução Normativa ambiental de Roraima",
      "Portaria SESAU-RR sobre estabelecimentos de saúde animal"
    ],
    observacoesRT: "Roraima tem o menor mercado veterinário do país. IBAMA tem forte presença pelo bioma amazônico. Boa Vista concentra a maioria dos estabelecimentos. Verificar sempre com o CRMV-RR as exigências atuais.",
    crmvRegional: "CRMV-RR (jurisdição compartilhada com CRMV-AM em alguns casos)",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-RR)",
      "Licença Ambiental FEMACT",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-RR/AM"
    ]
  },

  SC: {
    uf: "SC",
    estado: "Santa Catarina",
    orgaoFiscalizador: "SES-SC — Secretaria de Estado da Saúde de Santa Catarina",
    vigilanciaSanitaria: "VISA-SC / DIVIS",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 6.320",
      data: "20/12/1983",
      status: "Base Ativa. PL 253/2018 tramitando para substituição por novo Código",
      descricao: "Código Sanitário do Estado de Santa Catarina. Em processo de modernização — o PL 253/2018 aguarda aprovação para substituir integralmente esta lei.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "agua", "alimentos", "residuos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 31.455/1987 — Regulamento do Código Sanitário SC",
      "Portaria SES-SC nº 551/2020 — Estabelecimentos de saúde",
      "IMA-SC — Instrução Normativa ambiental",
      "Resolução CONSEMA sobre RSS em SC"
    ],
    observacoesRT: "Florianópolis tem VISA municipal ativa. SC tem exigências específicas de biossegurança para clínicas veterinárias com serviço de internação. ATENÇÃO: acompanhar votação do novo Código Sanitário (PL 253/2018).",
    crmvRegional: "CRMV-SC",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-SC ou municipal)",
      "PGRSS aprovado com contrato de empresa coletora habilitada",
      "Licença Ambiental IMA-SC (quando aplicável)",
      "ART do RT junto ao CRMV-SC",
      "Registro do estabelecimento no CRMV-SC"
    ]
  },

  SP: {
    uf: "SP",
    estado: "São Paulo",
    orgaoFiscalizador: "SES-SP — Secretaria de Estado da Saúde de São Paulo",
    vigilanciaSanitaria: "VISA-SP / CVS / COVISA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 10.083",
      data: "23/09/1998",
      status: "Em vigor (com emendas frequentes)",
      descricao: "Código Sanitário do Estado de São Paulo. Um dos mais completos e atualizados do Brasil, com regulamentações específicas por tipo de estabelecimento.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos", "controle_vetores", "biosseguranca"]
    },
    normasComplementares: [
      "Decreto Estadual nº 55.660/2010 — Regulamento do Código Sanitário SP",
      "Resolução SS-SP nº 50/2019 — Estabelecimentos veterinários",
      "Portaria CVS-SP nº 1/2019 — RSS em SP",
      "CETESB — Instrução Normativa ambiental",
      "Decreto Municipal de São Paulo nº 58.701/2019 (para estabelecimentos na capital)"
    ],
    observacoesRT: "SP tem o sistema de vigilância sanitária mais complexo do Brasil. A capital tem COVISA municipal autônoma. Municípios com >50k hab. geralmente têm VISA própria. A Resolução SS nº 50/2019 é específica para estabelecimentos veterinários e deve ser conhecida por todo RT que atua em SP.",
    crmvRegional: "CRMV-SP",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-SP ou municipal — COVISA em SP capital)",
      "Auto de Vistoria do Corpo de Bombeiros (AVCB) — obrigatório em SP",
      "PGRSS aprovado pela VISA e empresa coletora contratada",
      "Licença Ambiental CETESB (quando aplicável)",
      "ART do RT junto ao CRMV-SP",
      "Registro do estabelecimento no CRMV-SP",
      "Certificado de Desinsetização e Desratização (empresa cadastrada na VISA)"
    ]
  },

  SE: {
    uf: "SE",
    estado: "Sergipe",
    orgaoFiscalizador: "SES-SE — Secretaria de Estado da Saúde de Sergipe",
    vigilanciaSanitaria: "VISA-SE / DIRETORIA",
    codigoSanitarioBase: {
      numero: "Lei Estadual nº 6.345",
      data: "03/01/2008",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado de Sergipe. Legislação relativamente recente, com regulamentação moderna de vigilância sanitária.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "residuos", "agua", "alimentos"]
    },
    normasComplementares: [
      "Decreto Estadual nº 29.565/2014 — Regulamento do Código Sanitário SE",
      "Portaria SES-SE sobre estabelecimentos de saúde animal",
      "SEMA-SE — Instrução Normativa ambiental"
    ],
    observacoesRT: "Aracaju tem VISA municipal ativa. SE é um dos estados com menor número de municípios, facilitando a fiscalização estadual centralizada.",
    crmvRegional: "CRMV-SE",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-SE ou municipal)",
      "PGRSS aprovado",
      "Licença Ambiental SEMA-SE",
      "ART do RT junto ao CRMV-SE"
    ]
  },

  TO: {
    uf: "TO",
    estado: "Tocantins",
    orgaoFiscalizador: "SES-TO — Secretaria de Estado da Saúde do Tocantins",
    vigilanciaSanitaria: "VISA-TO / GERSA",
    codigoSanitarioBase: {
      numero: "Decreto Estadual nº 680",
      data: "23/11/1998",
      status: "Em vigor (com emendas)",
      descricao: "Código Sanitário do Estado do Tocantins. Regulamenta vigilância sanitária e condições de saúde pública no estado mais novo do Brasil.",
      areas: ["licenciamento_sanitario", "higiene", "estrutura_fisica", "agua", "residuos"]
    },
    normasComplementares: [
      "Lei Estadual nº 1.787/2007 — Política Estadual de RSS no TO",
      "Portaria SES-TO sobre estabelecimentos de saúde animal",
      "NATURATINS — Instrução Normativa ambiental do Tocantins"
    ],
    observacoesRT: "Palmas tem VISA municipal. TO tem fiscalização ambiental do NATURATINS, especialmente relevante para clínicas próximas ao Cerrado e Amazônia Legal.",
    crmvRegional: "CRMV-TO",
    prazoLicensaVisa: "Renovação anual",
    documentosEspecificos: [
      "Alvará Sanitário (VISA-TO ou municipal)",
      "Licença Ambiental NATURATINS",
      "PGRSS aprovado",
      "ART do RT junto ao CRMV-TO"
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// FUNÇÕES UTILITÁRIAS
// ─────────────────────────────────────────────────────────────

/**
 * Retorna a legislação completa de um estado específico.
 * Use no prompt do Intérprete BVO passando clinicaData.estado (UF).
 *
 * @param {string} uf - Sigla do estado (ex: "MS", "SP", "RJ")
 * @returns {object} Legislação estadual + federal combinada
 */
export function getLegislacaoEstado(uf) {
  const estadual = LEGISLACAO_ESTADUAL[uf?.toUpperCase()];
  if (!estadual) {
    console.warn(`[Vertos] Legislação para UF "${uf}" não encontrada. Usando base federal.`);
    return {
      federal: LEGISLACAO_FEDERAL,
      estadual: null,
      aviso: `Legislação específica para ${uf} não cadastrada. Aplicar base federal + consultar VISA e CRMV locais.`
    };
  }
  return {
    federal: LEGISLACAO_FEDERAL,
    estadual
  };
}

/**
 * Gera bloco de texto formatado para inserção no prompt da IA.
 * Chamado dentro de `interpretarBVO` para enriquecer o contexto legislativo.
 *
 * @param {string} uf - Sigla do estado
 * @returns {string} Bloco de texto pronto para o prompt
 */
export function getTextoLegislacaoParaPrompt(uf) {
  const leg = getLegislacaoEstado(uf);

  if (!leg.estadual) {
    return `
LEGISLAÇÃO APLICÁVEL:
Estado não identificado — aplicar legislação federal base:
- Resolução CFMV nº 1.015/2012 (Responsabilidade Técnica)
- Resolução CFMV nº 1.236/2018 (Classificação de Estabelecimentos)
- IN MAPA nº 35/2019 (Medicamentos Veterinários)
- RDC ANVISA nº 222/2018 (Resíduos de Serviços de Saúde)
- Lei Federal nº 9.605/1998 (Crimes Ambientais / Maus-tratos)
`;
  }

  const e = leg.estadual;
  const fed = leg.federal;

  return `
LEGISLAÇÃO APLICÁVEL — ${e.estado.toUpperCase()} (${e.uf})

CÓDIGO SANITÁRIO ESTADUAL:
- ${e.codigoSanitarioBase.numero} (${e.codigoSanitarioBase.data}) — ${e.codigoSanitarioBase.descricao}
- Status: ${e.codigoSanitarioBase.status}

ÓRGÃO FISCALIZADOR ESTADUAL: ${e.orgaoFiscalizador}
VIGILÂNCIA SANITÁRIA: ${e.vigilanciaSanitaria}
CRMV REGIONAL: ${e.crmvRegional}
PRAZO DO ALVARÁ: ${e.prazoLicensaVisa}

NORMAS COMPLEMENTARES ESTADUAIS:
${e.normasComplementares.map(n => `- ${n}`).join('\n')}

DOCUMENTOS OBRIGATÓRIOS NO ${e.uf}:
${e.documentosEspecificos.map(d => `- ${d}`).join('\n')}

OBSERVAÇÕES IMPORTANTES PARA O RT NO ${e.estado.toUpperCase()}:
${e.observacoesRT}

LEGISLAÇÃO FEDERAL APLICÁVEL (válida em todo o Brasil):
CFMV:
${fed.cfmv.map(n => `- ${n.codigo}: ${n.descricao}`).join('\n')}

MAPA / ANVISA:
${fed.mapa.map(n => `- ${n.codigo}: ${n.descricao}`).join('\n')}
`;
}

/**
 * Lista todos os estados cadastrados.
 * Útil para validação de formulário de cadastro de clínica.
 */
export function listarEstadosCadastrados() {
  return Object.keys(LEGISLACAO_ESTADUAL).sort();
}

/**
 * Verifica se um estado tem legislação cadastrada.
 * @param {string} uf
 * @returns {boolean}
 */
export function estadoTemLegislacao(uf) {
  return !!LEGISLACAO_ESTADUAL[uf?.toUpperCase()];
}
