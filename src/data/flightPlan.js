// src/data/flightPlan.js

/**
 * Biblioteca de tarefas do Plano de Voo (Cronograma Mensal do RT)
 * Organizado por nicho de atuação para garantir conformidade específica.
 */

const TASK_LIBRARY = {
  pequenos_animais: {
    week1: { focus: "SIPEAGRO & Insumos", tasks: [
      { id: 'pa1', text: "Inventário de Psicotrópicos (Estoque Físico vs. SIPEAGRO)", urgent: true, source: "MAPA" },
      { id: 'pa2', text: "Lançamento de relatórios mensais no sistema SIPEAGRO", urgent: true, source: "MAPA" },
      { id: 'pa3', text: "Verificação de validades: Saneantes e Farmácia de Emergência", urgent: false, source: "ANVISA" }
    ]},
    week2: { focus: "Controle de Infecção", tasks: [
      { id: 'pa4', text: "Monitoramento biológico da Autoclave (Teste de 24h/48h)", urgent: true, source: "ANVISA" },
      { id: 'pa5', text: "Revisão do PGRSS: Fluxo de descarte e acondicionamento", urgent: false, source: "RDC 222" },
      { id: 'pa6', text: "Inspeção de barreiras sanitárias e limpeza terminal do CC", urgent: false, source: "CFMV" }
    ]}
  },
  poa_laticinios: {
    week1: { focus: "Matéria-Prima & Autocontrole", tasks: [
      { id: 'poa1', text: "Auditoria de recepção: Testes de Alizarol e Acidez do Leite", urgent: true, source: "RIISPOA" },
      { id: 'poa2', text: "Verificação de planilhas de PAC (Programas de Autocontrole)", urgent: true, source: "MAPA" },
      { id: 'poa3', text: "Monitoramento de temperatura: Silos e Resfriadores", urgent: true, source: "PAC 04" }
    ]},
    week2: { focus: "Higiene Operacional (PPHO)", tasks: [
      { id: 'poa4', text: "Verificação pré-operacional de PPHO (Higienização de Linhas)", urgent: true, source: "MAPA" },
      { id: 'poa5', text: "Controle de potabilidade da água e níveis de cloro residual", urgent: true, source: "PAC 01" },
      { id: 'poa6', text: "Auditoria de fluxogramas de produção e pontos críticos", urgent: false, source: "APPCC" }
    ]}
  },
  laboratorios: {
    week1: { focus: "Qualidade & Calibração", tasks: [
      { id: 'lab1', text: "Verificação de CIQ (Controle Interno de Qualidade) diário", urgent: true, source: "ISO 17025" },
      { id: 'lab2', text: "Calibração de micropipetas e equipamentos de medição", urgent: false, source: "Qualidade" },
      { id: 'lab3', text: "Monitoramento de temperatura de reagentes e ultrafreezers", urgent: true, source: "RDC 302" }
    ]},
    week2: { focus: "Biossegurança Laboratorial", tasks: [
      { id: 'lab4', text: "Auditoria de descarte de resíduos biológicos e químicos", urgent: true, source: "PGRSS" },
      { id: 'lab5', text: "Manutenção preventiva de capelas de exaustão e centrífugas", urgent: false, source: "Segurança" },
      { id: 'lab6', text: "Verificação de EPIs e integridade de cabines biológicas", urgent: true, source: "Biossegurança" }
    ]}
  },
  agropecuaria: {
    week1: { focus: "Termolábeis & Receituário", tasks: [
      { id: 'ag1', text: "Verificação de temperatura de vacinas e biológicos", urgent: true, source: "MAPA" },
      { id: 'ag2', text: "Auditoria de receitas retidas (Psicotrópicos/Antimicrobianos)", urgent: true, source: "IN 35/15" },
      { id: 'ag3', text: "Conferência de prazos de validade em gôndolas e estoque", urgent: false, source: "CDC/MAPA" }
    ]},
    week2: { focus: "SIPEAGRO & Logística", tasks: [
      { id: 'ag4', text: "Lançamento de movimentações no sistema SIPEAGRO", urgent: true, source: "MAPA" },
      { id: 'ag5', text: "Verificação de plano de logística reversa (Vencidos)", urgent: false, source: "Ambiental" }
    ]}
  }
};

const GENERIC_WEEKS = {
  week3: { focus: "Auditoria de Documentação", tasks: [
    { id: 'g1', text: "Auditoria de Prontuários/Registros e Assinaturas Técnicas", urgent: false, source: "CFMV 1653" },
    { id: 'g2', text: "Validação de termos de consentimento (TCLE) e responsabilidade", urgent: true, source: "Ética Profissional" },
    { id: 'g3', text: "Revisão de POPs e Manual de Boas Práticas (Vigência)", urgent: false, source: "Qualidade" }
  ]},
  week4: { focus: "Gestão e Renovações", tasks: [
    { id: 'g4', text: "Verificar vencimentos: Alvará, ART, VRE e Laudos de Pragas", urgent: true, source: "Fiscalização" },
    { id: 'g5', text: "Treinamento mensal da equipe (Registro em Ata assinada)", urgent: false, source: "CFMV" },
    { id: 'g6', text: "Revisão do arquivo de segurança (Guarda mínima de 5 anos)", urgent: false, source: "Jurídico" }
  ]}
};

/**
 * Gera o Plano de Voo dinamicamente com base na área da clínica e especialidades do RT.
 */
export function generateFlightPlan(areaId, especialidades = []) {
  // Mapeia IDs de área do sistema para as chaves da biblioteca
  const areaKey = 
    (areaId === 'pequenos_animais') ? 'pequenos_animais' :
    (areaId === 'laticinios' || areaId === 'industria_poa' || areaId === 'industria_alimenticia') ? 'poa_laticinios' :
    (areaId === 'areas_especiais') ? 'laboratorios' :
    (areaId === 'comercio_agronegocio') ? 'agropecuaria' : 'pequenos_animais';

  const base = TASK_LIBRARY[areaKey] || TASK_LIBRARY.pequenos_animais;
  
  const plan = [
    { week: `Semana 1: ${base.week1.focus}`, focus: base.week1.focus, tasks: [...base.week1.tasks] },
    { week: `Semana 2: ${base.week2.focus}`, focus: base.week2.focus, tasks: [...base.week2.tasks] },
    { week: `Semana 3: ${GENERIC_WEEKS.week3.focus}`, focus: GENERIC_WEEKS.week3.focus, tasks: [...GENERIC_WEEKS.week3.tasks] },
    { week: `Semana 4: ${GENERIC_WEEKS.week4.focus}`, focus: GENERIC_WEEKS.week4.focus, tasks: [...GENERIC_WEEKS.week4.tasks] },
  ];

  // Injeções dinâmicas por Especialidade do RT
  if (especialidades.includes("Gestão de Resíduos")) {
    plan[1].tasks.push({ id: 'esp1', text: "Auditoria de Manifesto de Resíduos (MTR/SIGOR)", urgent: true, source: "IBAMA/SEMAD" });
  }
  
  if (especialidades.includes("Bem-estar Animal")) {
    plan[2].tasks.push({ id: 'esp2', text: "Avaliação de protocolos de Bem-Estar (Cinco Liberdades)", urgent: false, source: "CFMV 1236" });
  }

  if (especialidades.includes("Vigilância Sanitária")) {
    plan[3].tasks.push({ id: 'esp3', text: "Simulação de Inspeção Sanitária (Roteiro VISA)", urgent: true, source: "VISA Local" });
  }

  return plan;
}
