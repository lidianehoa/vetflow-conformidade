export const planilhasRT = [
  {
    id: "pequenos_animais",
    title: "Pequenos Animais",
    subtitle: "Clínicas, hospitais, pet shops, hotéis e creches",
    emoji: "🐾",
    color: "#0d47a1",
    bg: "#e3f2fd",
    obligatory: [
      "Registro de prontuários e fichas de atendimento clínico",
      "Controle de estoque e receituário de medicamentos (Portaria 344/ANVISA e IN MAPA 16/2018)",
      "Livro de registro de entorpecentes e psicotrópicos",
      "ART – Anotação de Responsabilidade Técnica (CRMV)",
      "Registro de internações e altas (hospitalização)",
      "Controle de resíduos de saúde – PGRSS (RDC ANVISA 222/2018)",
      "Registro de esterilização de materiais cirúrgicos (autoclave)",
      "Ficha de anestesia (quando houver centro cirúrgico)"
    ],
    suggested: [
      "Planilha de agendamento e taxa de ocupação (hotel/creche)",
      "Controle de temperatura de câmara fria de vacinas e medicamentos",
      "Checklist diário de limpeza e desinfecção das instalações",
      "Registro de vacinação e vermifugação dos animais hospedados",
      "Controle de ocorrências/incidentes com animais",
      "Planilha de controle de pragas (quando terceirizado)",
      "Avaliação de fornecedores de insumos e rações",
      "Registro de treinamento da equipe (banho, tosa, manejo)"
    ]
  },
  {
    id: "industria_poa",
    title: "Prod. Origem Animal",
    subtitle: "Frigoríficos, laticínios, pescados, mel (SIF/SIE/SIM)",
    emoji: "🏭",
    color: "#1b4332",
    bg: "#e8f5e9",
    obligatory: [
      "Planilhas dos 13 PACs (Programas de Autocontrole – IN MAPA 161/2022)",
      "Monitorização pré-operacional e operacional de higiene (PPHO)",
      "Controle de temperatura de câmaras, túneis e expedição",
      "Registro de calibração de equipamentos e instrumentos",
      "Controle de potabilidade da água (cloração e análises)",
      "Controle de pragas (mapa de iscas, visitas da empresa)",
      "Registro de rastreabilidade de lotes e recall",
      "Planilha do Plano APPCC – monitorização de PCCs",
      "Registro de análises laboratoriais (microbiológicas e físico-químicas)",
      "Bem-estar animal – pré-abate e insensibilização (se aplicável)",
      "Registro de recepção e qualificação de fornecedores",
      "Controle de concentração de soluções"
    ],
    suggested: [
      "Indicadores de produtividade e perdas por reprocessamento",
      "Planilha de validade e giro de estoque (PVPS/FEFO)",
      "Registro de treinamentos e capacitações da equipe",
      "Controle de embalagens, rótulos e laudos de declaração de conformidade",
      "Mapa de risco das instalações (manutenção preventiva)",
      "Dashboard mensal de resultados de autocontrole (não conformidades)",
      "Registro de devoluções e reclamações de clientes",
      "Planilha de auditorias internas semestrais"
    ]
  },
  {
    id: "industria_alimentos",
    title: "Alimentos (Indústria)",
    subtitle: "Produção, fracionamento, embalagem e rotulagem",
    emoji: "🍴",
    color: "#b71c1c",
    bg: "#ffebee",
    obligatory: [
      "Manual de Boas Práticas de Fabricação – BPF (RDC ANVISA 275/2002 e RDC 216/2004)",
      "Checklist de verificação das BPF (diário/semanal)",
      "Controle de pragas integrado (Portaria CVS-15/2009 por estado)",
      "Controle de potabilidade da água",
      "Higiene e saúde dos manipuladores (atestados e treinamento)",
      "Controle de temperatura na produção, armazenamento e transporte",
      "Memorial Descritivo de Fabricação e Formulação do produto",
      "Registro de análises laboratoriais obrigatórias por RTIQ",
      "Registro de recebimento de matérias-primas e fornecedores",
      "Controle de validade e rastreabilidade de lotes"
    ],
    suggested: [
      "Planilha de rendimento e perdas de processo",
      "Controle de calibração de balanças e termômetros",
      "Registro de limpeza e sanitização de equipamentos (CIP/COP)",
      "Ficha de ocorrências e desvios de processo",
      "Cronograma de auditorias de fornecedores",
      "Planilha de gestão de devoluções e recall",
      "Controle de umidade e temperatura do ambiente de produção",
      "Registro fotográfico de não conformidades"
    ]
  },
  {
    id: "comercio_agronegocio",
    title: "Comércio e Agroneg.",
    subtitle: "Rações, casas agropecuárias, medicamentos veterinários",
    emoji: "🛒",
    color: "#4a148c",
    bg: "#f3e5f5",
    obligatory: [
      "ART registrada no CRMV da UF de atuação",
      "Livro de receituário agronômico / veterinário (para venda de medicamentos)",
      "Controle de estoque e validade de medicamentos e produtos veterinários",
      "Registro de entorpecentes e psicotrópicos (quando aplicável)",
      "Licença sanitária e alvará do estabelecimento",
      "Registro de produtos no MAPA (para rações e medicamentos)",
      "Controle de temperatura de armazenamento (vacinas, biológicos)"
    ],
    suggested: [
      "Planilha de rastreabilidade de lotes de ração e medicamentos",
      "Controle de pragas e higienização do armazém",
      "Registro de treinamento de vendedores sobre uso correto de produtos",
      "Qualificação de fornecedores e laudos de análise de rações",
      "Planilha de devoluções e prazo de validade crítico",
      "Controle de temperatura e umidade do estoque",
      "Checklist de inspeção de armazéns e câmaras frias"
    ]
  },
  {
    id: "producao_rural",
    title: "Produção Rural",
    subtitle: "Propriedades de produção animal (bovinocultura, suinocultura, avicultura, etc.)",
    emoji: "🚜",
    color: "#e65100",
    bg: "#fff3e0",
    obligatory: [
      "GTA – Guia de Trânsito Animal (emissão e arquivo)",
      "Registro de vacinação obrigatória (aftosa, brucelose, raiva conforme UF)",
      "Comunicação de nascimentos, mortes e movimentações ao SISBOV/SIGEF",
      "Laudos e resultados de exames de brucelose e tuberculose (IN MAPA 10/2017)",
      "Controle de medicamentos veterinários utilizados e período de carência",
      "Registro de abastecimento de água e sanidade do rebanho"
    ],
    suggested: [
      "Planilha de controle zootécnico (peso, reprodução, produtividade)",
      "Registro de mortalidade e causas (análise de perdas)",
      "Controle de estoque de insumos, vacinas e medicamentos",
      "Ficha de manejo sanitário individual (bezerros, matrizes)",
      "Cronograma de vacinações e vermifugações do rebanho",
      "Planilha de bem-estar animal e avaliação das instalações",
      "Registro de treinamento dos funcionários rurais",
      "Controle de fornecedores de ração e ingredientes"
    ]
  }
];
