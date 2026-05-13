# PROMPT MASTER — RECONSTRUÇÃO COMPLETA DO VETFLOW CONFORMIDADE
# Cole este prompt no Claude Code (terminal) ou no chat do VS Code com a extensão Claude

---

Você é um engenheiro sênior React. Sua tarefa é reconstruir do zero o app **VetFlow Conformidade** — uma plataforma SaaS de compliance veterinário — usando React + Vite + Material UI v6 + Firebase.

## STACK OBRIGATÓRIA

- React 18 + Vite
- Material UI v6 (`@mui/material`, `@mui/icons-material`)
- Firebase v10 (Auth + Firestore + Storage)
- React Router DOM v6
- ApexCharts (`react-apexcharts`) para o radar chart
- `react-to-print` para impressão de TCLEs

## ESTRUTURA DE PASTAS A CRIAR

```
vetflow-conformidade/
├── public/
├── src/
│   ├── assets/
│   │   └── logo.png              ← placeholder (usuário vai substituir)
│   ├── firebase/
│   │   └── index.js              ← config do Firebase
│   ├── hooks/
│   │   ├── useAuth.js            ← hook de autenticação
│   │   └── usePlano.js           ← hook de permissões por plano
│   ├── data/
│   │   ├── checklistData.js      ← 85 itens dos setores A–E
│   │   └── tcleModels.js         ← 4 modelos de TCLE
│   ├── components/
│   │   ├── Layout.jsx            ← sidebar + wrapper
│   │   ├── ProtectedRoute.jsx    ← guard com Context
│   │   └── BloqueioRecurso.jsx   ← tela/card de bloqueio
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Cadastro.jsx
│   │   ├── Pagamento.jsx         ← tela de planos
│   │   ├── Dashboard.jsx         ← VET.FLOW Cockpit
│   │   ├── Auditorias.jsx        ← Portal de Compliance
│   │   ├── NovaAuditoria.jsx     ← Inspeção 360°
│   │   ├── ChecklistMensal.jsx
│   │   ├── Termos.jsx            ← Gerador de TCLE
│   │   ├── Documentos.jsx        ← Fábrica de Docs
│   │   ├── GerarDocumento.jsx
│   │   └── Perfil.jsx
│   ├── App.jsx                   ← router principal
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

---

## 1. FIREBASE — src/firebase/index.js

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const db      = getFirestore(app);
export const storage = getStorage(app);
```

---

## 2. HOOK DE AUTH — src/hooks/useAuth.js

```js
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [user, setUser]       = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading };
}
```

---

## 3. HOOK DE PERMISSÕES — src/hooks/usePlano.js

```js
import { useMemo } from "react";

export const LABEL_PLANO = {
  freemium:    "Freemium",
  rt_solo:     "RT Solo",
  clinica_pro: "Clínica Pro",
  pending:     "Sem plano",
};

const PERMISSOES = {
  freemium: {
    dashboard: false, auditorias: false, novaAuditoria: false,
    checklist: false, termos: false, documentos: true,
    gerarDocumento: false, manualBoasPraticas: false, simplesVet: false,
  },
  rt_solo: {
    dashboard: false, auditorias: true, novaAuditoria: true,
    checklist: true, termos: true, documentos: true,
    gerarDocumento: true, manualBoasPraticas: true, simplesVet: false,
  },
  clinica_pro: {
    dashboard: true, auditorias: true, novaAuditoria: true,
    checklist: true, termos: true, documentos: true,
    gerarDocumento: true, manualBoasPraticas: true, simplesVet: true,
  },
};

export const PLANO_MINIMO = {
  dashboard: "clinica_pro", auditorias: "rt_solo", novaAuditoria: "rt_solo",
  checklist: "rt_solo", termos: "rt_solo", gerarDocumento: "rt_solo",
  manualBoasPraticas: "rt_solo", simplesVet: "clinica_pro",
};

export function usePlano(userData) {
  const plan = userData?.plan ?? "freemium";
  const permissoes = useMemo(() => PERMISSOES[plan] ?? PERMISSOES.freemium, [plan]);
  const pode = (recurso) => permissoes[recurso] === true;
  const planoMinimo = (recurso) => LABEL_PLANO[PLANO_MINIMO[recurso]] ?? "RT Solo";
  return { plan, label: LABEL_PLANO[plan], pode, planoMinimo };
}
```

---

## 4. DADOS DO CHECKLIST — src/data/checklistData.js

Crie o arquivo com exatamente estes 85 itens organizados em 5 setores:

```js
export const SETORES = [
  {
    id: "A", titulo: "RECEPÇÃO E DOCUMENTAÇÃO LEGAL", cor: "#1b4332",
    itens: [
      { id:"A1",  desc:"Certificado CRMV (PJ) afixado e dentro da validade?",                        class:"CRÍTICO", peso:10, ref:"Res. 722/2014" },
      { id:"A2",  desc:"Registro SIPEAGRO ativo e em dia junto ao MAPA?",                             class:"CRÍTICO", peso:10, ref:"IN MAPA 35/2015" },
      { id:"A3",  desc:"Alvará Sanitário vigente e afixado?",                                          class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"A4",  desc:"Alvará de Funcionamento da Prefeitura vigente?",                               class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"A5",  desc:"Licença Ambiental vigente (se exigível pelo município)?",                      class:"MAIOR",   peso:5,  ref:"CONAMA 316/2002" },
      { id:"A6",  desc:"MBP (Manual de Boas Práticas) revisado (<12 meses) e assinado pelo RT?",      class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"A7",  desc:"POPs documentados, revisados (<12 meses) e assinados pela equipe?",            class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"A8",  desc:"PGRSS (Plano de Gerenciamento de Resíduos) elaborado e atualizado?",           class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"A9",  desc:"Prontuários de pacientes arquivados por no mínimo 5 anos?",                    class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
      { id:"A10", desc:"Treinamentos de POPs registrados com assinatura da equipe?",                   class:"MAIOR",   peso:5,  ref:"Res. 1275/2019" },
      { id:"A11", desc:"Existe fluxo diferenciado e documentado para animais infectocontagiosos?",     class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"A12", desc:"Código de Defesa do Consumidor visível na recepção?",                          class:"MENOR",   peso:1 },
      { id:"A13", desc:"Placa de proibição de maus-tratos (Lei 9.605/98) afixada?",                    class:"MENOR",   peso:1 },
      { id:"A14", desc:"Proteção de dados sensíveis (LGPD) em monitores e fichas?",                    class:"MAIOR",   peso:5,  ref:"Lei 13.709/2018" },
      { id:"A15", desc:"Contratos de prestação de serviços com cláusulas de responsabilidade civil?",  class:"MAIOR",   peso:5 },
      { id:"A16", desc:"Ficha de anamnese preenchida e assinada para cada novo paciente?",             class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
      { id:"A17", desc:"TCLEs para cirurgias de alto risco emitidos com Smart ID?",                    class:"CRÍTICO", peso:10, ref:"Res. 1653/2025" },
      { id:"A18", desc:"Lista de preços afixada ou disponível em meio digital ao cliente?",            class:"MENOR",   peso:1 },
    ]
  },
  {
    id: "B", titulo: "ÁREA CLÍNICA E INTERNAÇÃO", cor: "#0d47a1",
    itens: [
      { id:"B1",  desc:"Geladeira de vacinas: temperatura 2°C–8°C registrada 2× ao dia?",             class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B2",  desc:"Isolamento: porta fechada, pedilúvio ativo e sinalização visível?",            class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B3",  desc:"Carrinho/kit de RCP completo (adrenalina, atropina, intubação)?",              class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B4",  desc:"Oxigênio com carga adequada e debitômetro funcional?",                         class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B5",  desc:"Mesa de exame impermeável, lavável e de fácil higienização?",                  class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B6",  desc:"Pia de higienização de mãos exclusiva no consultório?",                        class:"MAIOR",   peso:5,  ref:"RDC ANVISA 216/2004" },
      { id:"B7",  desc:"Arquivo médico organizado por espécie, paciente e ano?",                       class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
      { id:"B8",  desc:"Balança calibrada com certificado de validação vigente?",                      class:"MAIOR",   peso:5 },
      { id:"B9",  desc:"Separação física sólida (paredes) entre internação geral e infecciosos?",      class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"B10", desc:"EPIs exclusivos do isolamento disponíveis (avental, luvas, máscara N95)?",     class:"MAIOR",   peso:5 },
      { id:"B11", desc:"Prontuário com evolução clínica diária assinada e carimbada?",                 class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
      { id:"B12", desc:"Termômetro clínico para aferição de temperatura do paciente?",                 class:"MENOR",   peso:1 },
      { id:"B13", desc:"Iluminação adequada (≥500 lux) nas áreas de atendimento?",                    class:"MENOR",   peso:1,  ref:"NR-17" },
      { id:"B14", desc:"Oxímetro de pulso disponível e funcional para pacientes internados?",          class:"MAIOR",   peso:5 },
      { id:"B15", desc:"Bombas de infusão contínua calibradas e com manutenção documentada?",          class:"MAIOR",   peso:5 },
      { id:"B16", desc:"Lixeira com pedal e saco branco para resíduos infectantes no consultório?",    class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"B17", desc:"Protocolo de humanização e bem-estar animal documentado e treinado?",          class:"MENOR",   peso:1,  ref:"Lei 9.605/98" },
      { id:"B18", desc:"Registro de vacinações/desverminações do paciente internado?",                 class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
    ]
  },
  {
    id: "C", titulo: "CENTRO CIRÚRGICO E ESTERILIZAÇÃO", cor: "#6a1b9a",
    itens: [
      { id:"C1",  desc:"Autoclave com Teste Biológico semanal Negativo documentado?",                  class:"CRÍTICO", peso:10, ref:"RDC ANVISA 15/2012" },
      { id:"C2",  desc:"Materiais estéreis dentro do prazo de validade?",                               class:"MAIOR",   peso:5 },
      { id:"C3",  desc:"Integridade das embalagens de esterilização (sem rasgos/umidade)?",             class:"MAIOR",   peso:5 },
      { id:"C4",  desc:"CC com ambiente exclusivo, paredes sólidas e porta única controlada?",          class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"C5",  desc:"Sala de preparo/higienização do paciente separada da sala cirúrgica?",          class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"C6",  desc:"Sala cirúrgica com acesso controlado e tráfego restrito?",                      class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"C7",  desc:"Sala de recuperação anestésica equipada fora do CC?",                           class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"C8",  desc:"Anestesia inalatória com vaporizador calibrado e circuito sem vazamento?",      class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"C9",  desc:"Monitor multiparamétrico funcional (SpO2, ECG, PETCO2)?",                       class:"CRÍTICO", peso:10 },
      { id:"C10", desc:"Integrador químico nas embalagens mudou de cor após esterilização?",            class:"MAIOR",   peso:5,  ref:"RDC ANVISA 15/2012" },
      { id:"C11", desc:"Registro de todas as cirurgias realizadas com ID do paciente?",                 class:"MAIOR",   peso:5,  ref:"Res. 1653/2025" },
      { id:"C12", desc:"Protocolo anestésico documentado e assinado pelo RT antes de cada cirurgia?",  class:"CRÍTICO", peso:10, ref:"Res. 1653/2025" },
      { id:"C13", desc:"Instrumentais cirúrgicos íntegros, sem corrosão e esterilizados?",             class:"MAIOR",   peso:5 },
      { id:"C14", desc:"Plano de contingência para emergências anestésicas documentado?",               class:"MAIOR",   peso:5 },
      { id:"C15", desc:"Temperatura do CC controlada entre 18°C–22°C?",                                class:"MENOR",   peso:1,  ref:"RDC ANVISA 50/2002" },
      { id:"C16", desc:"Laudo de manutenção preventiva da autoclave emitido nos últimos 12 meses?",    class:"MAIOR",   peso:5 },
      { id:"C17", desc:"TCLE cirúrgico com Smart ID emitido e assinado antes de cada procedimento?",   class:"CRÍTICO", peso:10, ref:"Res. 1653/2025" },
    ]
  },
  {
    id: "D", titulo: "HIGIENIZAÇÃO E RESÍDUOS", cor: "#e65100",
    itens: [
      { id:"D1",  desc:"Resíduos Grupo A1 em saco branco leitoso e lixeira com pedal?",               class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"D2",  desc:"Perfurocortantes em caixas Descarpack abaixo de 3/4 da capacidade?",           class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"D3",  desc:"DML com separação técnica entre materiais limpos e sujos?",                    class:"MAIOR",   peso:5 },
      { id:"D4",  desc:"Lavanderia com separação técnica (áreas limpa e suja)?",                       class:"MAIOR",   peso:5,  ref:"Res. 1275/2019" },
      { id:"D5",  desc:"Saneantes com registro ativo na ANVISA?",                                      class:"MAIOR",   peso:5,  ref:"RDC ANVISA 344/2020" },
      { id:"D6",  desc:"Limpeza concorrente (entre atendimentos) documentada em planilha?",            class:"MAIOR",   peso:5,  ref:"Res. 1275/2019" },
      { id:"D7",  desc:"Limpeza terminal (semanal/pós-cirurgia) documentada em planilha?",             class:"MAIOR",   peso:5,  ref:"Res. 1275/2019" },
      { id:"D8",  desc:"Controle de pragas com laudo de empresa credenciada (<6 meses)?",              class:"MAIOR",   peso:5 },
      { id:"D9",  desc:"Limpeza e análise da caixa d'água documentada (<6 meses)?",                    class:"MAIOR",   peso:5 },
      { id:"D10", desc:"EPIs de limpeza (luva grossa, avental PVC, bota) disponíveis à equipe?",       class:"MAIOR",   peso:5 },
      { id:"D11", desc:"POP de higienização ambiental afixado no DML?",                                class:"MENOR",   peso:1 },
      { id:"D12", desc:"Manifesto de transporte de resíduos com empresa licenciada arquivado?",        class:"CRÍTICO", peso:10, ref:"RDC ANVISA 222/2018" },
      { id:"D13", desc:"Existe área ou protocolo adequado para manejo de óbitos/necropsia?",           class:"MAIOR",   peso:5 },
      { id:"D14", desc:"Banheiro exclusivo para colaboradores (com chuveiro)?",                        class:"MENOR",   peso:1,  ref:"NR-24" },
      { id:"D15", desc:"Vestiário com armários individuais para guarda de pertences da equipe?",       class:"MENOR",   peso:1,  ref:"NR-24" },
    ]
  },
  {
    id: "E", titulo: "CONTROLE DE MEDICAMENTOS", cor: "#b71c1c",
    itens: [
      { id:"E1",  desc:"Livro de Controlados (Portaria 344/98) preenchido e em dia?",                  class:"CRÍTICO", peso:10, ref:"Port. MS 344/1998" },
      { id:"E2",  desc:"Armário de controlados resistente, fixo e sob chave?",                         class:"CRÍTICO", peso:10, ref:"Port. MS 344/1998" },
      { id:"E3",  desc:"Lançamentos de psicotrópicos no SIPEAGRO em dia?",                             class:"MAIOR",   peso:5,  ref:"IN MAPA 35/2015" },
      { id:"E4",  desc:"Receituário veterinário emitido para todos os controlados dispensados?",        class:"CRÍTICO", peso:10, ref:"Port. MS 344/1998" },
      { id:"E5",  desc:"Validade de todos os medicamentos verificada e registrada mensalmente?",        class:"MAIOR",   peso:5 },
      { id:"E6",  desc:"Medicamentos armazenados conforme bula (temp., luminosidade, umidade)?",       class:"MAIOR",   peso:5 },
      { id:"E7",  desc:"Cadeia de frio para biológicos (vacinas) documentada com gráficos de temperatura?", class:"CRÍTICO", peso:10, ref:"Res. 1275/2019" },
      { id:"E8",  desc:"Nota fiscal de compra de medicamentos arquivada por no mínimo 5 anos?",        class:"MAIOR",   peso:5 },
      { id:"E9",  desc:"Inventário físico de medicamentos realizado mensalmente?",                      class:"MAIOR",   peso:5 },
      { id:"E10", desc:"Medicamentos vencidos segregados (saco vermelho) e descartados corretamente?", class:"MAIOR",   peso:5,  ref:"RDC ANVISA 222/2018" },
      { id:"E11", desc:"Antimicrobianos dispensados apenas com receita veterinária e notificação?",    class:"CRÍTICO", peso:10, ref:"IN MAPA 13/2021" },
      { id:"E12", desc:"Nº de lote e validade registrados no Livro de Controlados a cada uso?",        class:"MAIOR",   peso:5 },
      { id:"E13", desc:"POP de manipulação de citotóxicos afixado (se a clínica utiliza)?",            class:"MAIOR",   peso:5 },
      { id:"E14", desc:"Geladeira exclusiva para medicamentos termolábeis (exceto vacinas)?",          class:"MENOR",   peso:1 },
      { id:"E15", desc:"Registro de Reação Adversa a Medicamentos (RAM) documentado?",                 class:"MENOR",   peso:1 },
      { id:"E16", desc:"Responsável habilitado pela dispensação identificado e treinado?",              class:"MAIOR",   peso:5 },
      { id:"E17", desc:"Concordância entre estoque físico e registros do livro de controle?",          class:"CRÍTICO", peso:10 },
    ]
  },
];

// Gera Smart ID no formato PR-AAAA.MM-XXXXX
export const gerarSmartId = (uid) => {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = String(now.getMonth() + 1).padStart(2, "0");
  return `PR-${ano}.${mes}-${uid?.slice(0,5)?.toUpperCase() || "00000"}`;
};

// Cores por criticidade
export const COR_CRITICIDADE = {
  CRÍTICO: "#d32f2f",
  MAIOR:   "#e65100",
  MENOR:   "#1565c0",
};
```

---

## 5. MODELOS DE TCLE — src/data/tcleModels.js

```js
// Hash de autenticidade (função utilitária)
export const gerarHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
};

export const TCLE_MODELOS = [
  {
    id: "cirurgia_eletiva",
    titulo: "TCLE — Procedimento Cirúrgico Eletivo",
    categoria: "Cirurgia",
    conteudo: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO CIRÚRGICO ELETIVO VETERINÁRIO

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Tutor Responsável: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO DE CONSENTIMENTO:

Eu, {{RESPONSAVEL}}, na condição de tutor(a) e responsável legal pelo animal acima identificado, declaro ter sido informado(a) de forma clara, objetiva e em linguagem acessível sobre as seguintes condições do procedimento proposto:

1. PROCEDIMENTO: A equipe médico-veterinária propôs a realização de procedimento cirúrgico eletivo, cujas indicações clínicas, benefícios esperados, técnica empregada e tempo estimado de recuperação foram devidamente explicados.

2. RISCOS ANESTÉSICOS E CIRÚRGICOS: Compreendo que todo procedimento implicado com anestesia e ato cirúrgico envolve riscos inerentes que incluem, mas não se limitam a: reações adversas a fármacos, complicações cardiovasculares e respiratórias, deiscência de sutura, infecção de sítio cirúrgico e, em casos extremos, óbito do paciente.

3. ALTERNATIVAS: Fui informado(a) sobre as alternativas existentes ao procedimento proposto e, livre de qualquer coação, optei pelo procedimento cirúrgico.

4. DIREITO DE RECUSA: Tenho ciência de que posso, a qualquer momento e sem penalidade, revogar o presente consentimento, responsabilizando-me pelas consequências médico-veterinárias de tal decisão.

5. INTERNAÇÃO E PÓS-OPERATÓRIO: Estou ciente das instruções de cuidados pós-operatórios e comprometo-me a cumpri-las, bem como a trazer o animal para as revisões agendadas.

6. AUTORIZAÇÃO FINANCEIRA: Estou ciente e concordo com os valores dos serviços informados previamente.

Desta forma, CONSINTO livremente com a realização do procedimento proposto.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}}
Tutor(a) Responsável — CPF/RG: {{CPF_RESPONSAVEL}}

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH DE AUTENTICIDADE VETFLOW: {{HASH}}
Ref.: Res. CFMV 1653/2025 | Smart ID: {{SMART_ID}}`
  },
  {
    id: "anestesia_geral",
    titulo: "TCLE — Anestesia Geral",
    categoria: "Anestesia",
    conteudo: `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
PROCEDIMENTO ANESTÉSICO VETERINÁRIO

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Tutor Responsável: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO DE CONSENTIMENTO ANESTÉSICO:

Eu, {{RESPONSAVEL}}, declaro ter recebido orientação completa sobre o protocolo anestésico indicado para meu animal, incluindo:

1. PROTOCOLO ANESTÉSICO: Foram explicados os medicamentos a serem utilizados, suas ações e possíveis efeitos adversos.

2. MONITORAÇÃO: Durante todo o procedimento meu animal será monitorado por equipamentos (oxímetro, ECG, capnógrafo) e por profissional habilitado.

3. RISCOS: Declaro estar ciente de que, mesmo em animais saudáveis, a anestesia geral apresenta riscos potenciais, incluindo reações alérgicas, hipotensão, hipotermia, despertar prolongado e, raramente, óbito.

4. JEJUM: Fui orientado(a) sobre o período de jejum alimentar e hídrico necessário e garanto que o animal foi mantido em jejum conforme protocolo.

5. HISTÓRICO CLÍNICO: Informei toda a história clínica relevante do animal, incluindo uso prévio de medicamentos, condições crônicas e reações adversas conhecidas.

CONSINTO com a realização do procedimento anestésico descrito.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Tutor(a) Responsável

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) / Anestesista Responsável

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025`
  },
  {
    id: "internacao",
    titulo: "TCLE — Internação Hospitalar",
    categoria: "Internação",
    conteudo: `AUTORIZAÇÃO DE INTERNAÇÃO HOSPITALAR VETERINÁRIA

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Tutor Responsável: {{RESPONSAVEL}} | Contato: {{CPF_RESPONSAVEL}}

AUTORIZO a internação hospitalar do animal acima identificado nas dependências de {{NOME_CLINICA}}, declaro estar ciente de que:

1. CUIDADOS: Meu animal receberá monitoração clínica contínua, medicação e cuidados de enfermagem conforme protocolo estabelecido pelo Médico(a) Veterinário(a).

2. COMUNICAÇÃO: Serei contatado(a) imediatamente em caso de intercorrências, piora do quadro clínico ou necessidade de procedimentos adicionais.

3. AUTORIZAÇÃO DE EMERGÊNCIA: Em caso de urgência ou impossibilidade de contato, autorizo a equipe a tomar as providências médico-veterinárias necessárias para preservar a vida do meu animal.

4. VISITAS: Estou ciente das regras de visita da clínica e comprometido(a) a respeitá-las.

5. ALTA: Comprometo-me a buscar o animal na data e horário combinados, ciente de que o atraso pode gerar custos adicionais de internação.

6. RESPONSABILIDADE FINANCEIRA: Estou ciente dos honorários e autorizo as cobranças referentes aos serviços prestados durante a internação.

ASSINO o presente Termo em plena consciência de meus direitos e obrigações.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Tutor(a) Responsável

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025`
  },
  {
    id: "eutanasia",
    titulo: "TCLE — Eutanásia Humanitária",
    categoria: "Eutanásia",
    conteudo: `TERMO DE CONSENTIMENTO PARA EUTANÁSIA HUMANITÁRIA

Smart ID de Prontuário: {{SMART_ID}}
Data de Emissão: {{DATA_ATUAL}} | {{HORA_ATUAL}}
Clínica: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}

IDENTIFICAÇÃO DO PACIENTE:
Animal: {{NOME_ANIMAL}}
Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}
Tutor Responsável: {{RESPONSAVEL}} | CPF/RG: {{CPF_RESPONSAVEL}}

DECLARAÇÃO:

Eu, {{RESPONSAVEL}}, declaro que após receber explicação detalhada sobre o estado clínico do animal e as opções terapêuticas disponíveis, compreendo que o animal encontra-se em sofrimento irreversível e que a eutanásia humanitária representa a alternativa mais ética e compassiva.

DECLARO expressamente que:
1. Fui informado(a) de que a eutanásia é um procedimento irreversível;
2. Tomei a decisão de forma livre, consciente e sem qualquer coerção;
3. O procedimento será realizado com medicação específica que proporciona morte indolor e rápida;
4. Autorizo o descarte ético do corpo conforme orientação da clínica.

CONSINTO livremente com a realização da eutanásia humanitária.

Local e Data: {{NOME_CLINICA}}, {{DATA_ATUAL}}

_______________________________________________
{{RESPONSAVEL}} — CPF/RG: {{CPF_RESPONSAVEL}}
Tutor(a) Responsável

_______________________________________________
{{RT_NOME}} | CRMV: {{RT_CRMV}}
Médico(a) Veterinário(a) Responsável Técnico(a)

HASH: {{HASH}} | Smart ID: {{SMART_ID}} | Ref.: Res. CFMV 1653/2025 + Lei 9.605/98`
  },
];
```

---

## 6. FIRESTORE — COLEÇÕES E CAMPOS

### `users/{uid}`
```
plan: "freemium" | "rt_solo" | "clinica_pro" | "pending"
email: string
displayName: string
createdAt: timestamp
```

### `unidades/{uid}`
```
razaoSocial: string
cnpj: string
gestor: string
rtNome: string
crmv: string
logoUrl: string
vencSipeagro: string (ISO date)
vencAlvara: string (ISO date)
vencCaixaAgua: string (ISO date)
vencCrmv: string (ISO date)
vencVacinas: string (ISO date)
realizaCirurgia: boolean
possuiInternacao: boolean
atendimento24h: boolean
postoColeta: boolean
fazTelemedicina: boolean
cronograma: array (plano de voo semanal customizável)
```

### `auditorias/{docId}`
```
userId: string
smartId: string
idAnimal: string
nomeProntuario: string
secaoId: string ("A"|"B"|"C"|"D"|"E"|"COMPLETA")
pontosInfracao: number
nivelConformidade: string
criticasNC: array
parecerRT: string
plano5W2H: { o_que, porque, onde, quem, quando, como, quanto }
respostas: object { [itemId]: "Concluído"|"Pendente"|"Atrasado"|"N/A" }
score: number (0-100)
criadoEm: timestamp
responsavelTecnico: string
```

### `template/{docId}` (já existente no Firestore)
```
nome: string
categoria: string
subcategoria: string
origem: "template" | "custom"
conteudo: string
```

---

## 7. COMPORTAMENTO DE CADA PÁGINA

### Login.jsx
- Email/senha com `signInWithEmailAndPassword`
- Botão "Entrar com Google" com `signInWithPopup(GoogleAuthProvider)`
- Link para /cadastro
- Cores: fundo branco, botões #1b4332

### Cadastro.jsx
- Email, senha, nome
- Ao criar conta: salva em `users/{uid}` com `plan: "pending"` e redireciona para /pagamento
- Botão Google também redireciona para /pagamento se `plan` não existe

### Pagamento.jsx (PlanosAssinatura)
- 3 cards: Freemium (grátis), RT Solo (R$97/mês), Clínica Pro (R$197/mês)
- Freemium: salva `plan: "freemium"` em `users/{uid}` e redireciona para /documentos
- RT Solo: href para `https://pag.ae/SEU_LINK_RT_SOLO`
- Clínica Pro: href para `https://pag.ae/SEU_LINK_CLINICA_PRO`
- Planos RT Solo e Clínica Pro bloqueados para freemium com guard

### Dashboard.jsx (VET.FLOW Cockpit) — APENAS CLÍNICA PRO
- Cabeçalho: "VET.FLOW COCKPIT" + chip "OPERAÇÃO PROTEGIDA" ou "⚠ N RISCOS"
- Card esquerdo: Radar chart (ApexCharts) com scores dos 5 setores A-E vindos das auditorias + botões TCLE e Auditar
- Card direito: Radar de Vencimentos — lista alertas de vencimento (SIPEAGRO, Alvará, Caixa d'água, CRMV) com 30 dias de antecedência (error=vencido, warning=próximo)
- Plano de Voo Mensal: 4 cards de semana (customizável, salvo em `unidades/{uid}.cronograma`)
- Banner Atividade Especial: "MAIO / NOV: Manutenção Preventiva — Autoclave e Monitores Multiparamétricos" (ref. RDC 197/2017)
- Metodologia VetFlow: 4 passos — Planejar → Executar (85 itens) → Classificar (score de risco) → Agir (5W2H + TCLE)

### Auditorias.jsx — RT SOLO+
- Título "Portal de Compliance"
- Botão "Nova Auditoria" → /auditorias/nova
- Gráfico de linha (ApexCharts) com evolução da blindagem ao longo do tempo
- Card lateral: última inspeção em % + contagem de inspeções com score ≥ 95%
- Tabela de histórico: data, score, botões PDF e SimplesVet (SimplesVet só Clínica Pro)

### NovaAuditoria.jsx — RT SOLO+
Fluxo em 3 etapas (estado: "inicio" → "checklist" → "concluido"):
1. **Início**: campo Nome do Animal, ID SimplesVet (gera Smart ID automático no formato `PR-AAAA.MM-XXXXX`)
2. **Checklist**: seleção de setor (A-E ou COMPLETA), tabela com colunas ID | Verificação | Lei | Status (dropdown: Pendente/Concluído/Atrasado/N/A) | Evidência
   - Score calculado em tempo real: 100 - (pontos de itens não concluídos)
   - Alerta fixo: "Ausência de registros de Esterilização (Autoclave) ou falta de testes biológicos semanais é considerada falta grave"
3. **Conclusão**: Parecer RT (textarea), Plano 5W2H (7 campos), botão Concluir → salva em `auditorias/{docId}`

### ChecklistMensal.jsx — RT SOLO+
- Tabela com todos os 85 itens
- Barra de busca por texto
- Filtro por setor (tabs: Todos, A, B, C, D, E)
- Status de cada item (lido do Firestore ou local)
- Badges coloridos por criticidade (CRÍTICO=vermelho, MAIOR=laranja, MENOR=azul)

### Termos.jsx — RT SOLO+
Fluxo em 2 etapas ("selecao" → "preenchimento"):
1. Campo Smart ID (auto-gerado), 4 cards de modelo (Cirurgia, Anestesia, Internação, Eutanásia)
2. Formulário: Nome Animal, Espécie/Raça/Idade, Responsável, CPF/RG
   - Preview do TCLE com substituição de {{variáveis}}
   - Botão Imprimir (react-to-print)
   - HASH gerado automaticamente com a função `gerarHash`

### Documentos.jsx — Freemium: só listagem | RT Solo+: gerar
- Lista templates do Firestore (`template` collection)
- **5 categorias reorganizadas** (use o arquivo `categoriaTemplates.js`):
  - Centro Cirúrgico (83 docs) — unifica CIRURGIAS + POPS CIRURGIAS + CENTRO CIRURGICO
  - Diagnóstico e Exames (26 docs) — EXAMES
  - Clínica e Tratamentos (22 docs) — TRATAMENTOS + ATENDIMENTO
  - Biossegurança e Resíduos (36 docs) — LIMPEZA + LIMPEZA E HIGIENIZAÇÃO + MBP E PGRSS
  - Compliance e Jurídico (54 docs) — RESOLUCAO-NO-1374 + KIT COMPLETO + KIT ESSENCIAL
- Chips de filtro coloridos por categoria + chip "Todos"
- Barra de busca por nome ou categoria
- Quando "Todos" selecionado: agrupa por categoria com cabeçalho colorido
- Freemium: botão "Gerar" desabilitado com tooltip e banner de upgrade
- RT Solo+: botão "Gerar Documento" → /documentos/gerar/:id
- Use `normalizarCategoria(doc.categoria)` para converter o valor do Firestore → nova categoria

### GerarDocumento.jsx — RT SOLO+
- Carrega template pelo ID
- Formulário de preenchimento das variáveis {{}}
- Preview em tempo real
- Botão Imprimir / Download

### Perfil.jsx — todos os planos
Formulário com 2 seções:
1. **Identidade Jurídica & Logo**: Avatar circular com logo (upload para Firebase Storage), Razão Social, CNPJ, Nome do Gestor
2. **Responsável Técnico**: Nome do RT, CRMV
3. **Vencimentos**: campos date para SIPEAGRO, Alvará Sanitário, Caixa d'água, CRMV, Vacinas
4. **Características**: checkboxes (Realiza Cirurgia, Possui Internação, Atendimento 24h, Posto de Coleta, Faz Telemedicina)
- Salva em `unidades/{uid}` com merge

---

## 8. CORES E ESTILO GLOBAL

```js
// Paleta VetFlow
const COR_PRINCIPAL = "#1b4332";  // verde escuro
const COR_SECUNDARIA = "#2d6a4f"; // verde médio
const COR_ACENTO = "#52b788";     // verde claro
const COR_FUNDO = "#f0fdf4";      // verde muito claro

// Tema MUI
createTheme({
  palette: {
    primary: { main: "#1b4332" },
    secondary: { main: "#52b788" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 12, textTransform: "none", fontWeight: 700 } } },
    MuiCard:   { styleOverrides: { root: { borderRadius: 16 } } },
  }
});
```

---

## 9. SIDEBAR (Layout.jsx)

Menu lateral permanente com largura 220px, fundo branco, borda direita suave.

Itens do menu:
- Dashboard → / (ícone: DashboardIcon) — ocultar se plano for freemium ou rt_solo
- Auditorias → /auditorias (ícone: AssignmentIcon)
- Nova Auditoria → /auditorias/nova (ícone: AddCircleOutlineIcon)
- Checklist Mensal → /checklist (ícone: ChecklistIcon)
- Termos (TCLE) → /termos (ícone: DescriptionIcon)
- Documentos → /documentos (ícone: FolderIcon)
- Perfil / Unidade → /perfil (ícone: BusinessIcon)
- Sair do Sistema → (vermelho, bottom)

Item ativo: fundo rgba(82,183,136,0.08), ícone e texto em #1b4332 bold.

---

## 10. PACKAGE.JSON DEPENDÊNCIAS

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@mui/material": "^6.0.0",
    "@mui/icons-material": "^6.0.0",
    "@emotion/react": "^11.13.0",
    "@emotion/styled": "^11.13.0",
    "firebase": "^10.13.0",
    "react-apexcharts": "^1.4.0",
    "apexcharts": "^3.54.0",
    "react-to-print": "^2.15.0"
  }
}
```

---

## 11. .ENV.EXAMPLE

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## INSTRUÇÕES FINAIS

1. Crie todos os arquivos listados na estrutura de pastas
2. Use os dados exatos dos itens 4 e 5 (checklist e TCLEs) — não invente novos
3. Cada página deve importar `useUserData` do ProtectedRoute e `usePlano` do hook, e retornar `<BloqueioRecurso>` quando o plano não autorizar
4. O campo `plan` no Firestore é a fonte de verdade — nunca hardcode planos no frontend
5. Mantenha o padrão visual: fundo branco, verde #1b4332, bordas arredondadas 16-20px, Material UI
6. Após criar todos os arquivos, rode `npm install && npm run dev` para verificar se compila sem erros
