// scripts/seeds/seedTemplates.js
// Execução: node scripts/seeds/seedTemplates.js
// Requer: serviceAccountKey.json na raiz do projeto

import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── Os 6 templates de creche/hotel ────────────────────────────────────────
const TEMPLATES = [

  // ── 1. MBP ──────────────────────────────────────────────────────────────
  {
    id: "CH_DOC_MBP_01",
    titulo: "Manual de Boas Práticas — Creche e Hotel para Cães",
    categoria: "MBP / Manual de Boas Práticas",
    subtipo: "creche_hotel",
    legislacao: "Res. CFMV 1275/2019; RDC ANVISA 216/2004; Res. CFMV 1000/2012",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_CLINICA",        label: "Nome do Estabelecimento",       auto: true  },
      { nome: "CNPJ",                label: "CNPJ",                          auto: true  },
      { nome: "ENDERECO",            label: "Endereço",                      auto: true  },
      { nome: "CIDADE",              label: "Cidade",                        auto: true  },
      { nome: "UF",                  label: "UF",                            auto: true  },
      { nome: "TELEFONE",            label: "Telefone",                      auto: true  },
      { nome: "RT_NOME",             label: "Nome do RT",                    auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",                    auto: true  },
      { nome: "DATA_ATUAL",          label: "Data",                          auto: true  },
      { nome: "CAPACIDADE_ANIMAIS",  label: "Capacidade máxima de animais",  auto: false },
      { nome: "HORARIO_FUNCIONAMENTO",label: "Horário de funcionamento",     auto: false },
      { nome: "RESPONSAVEL_LEGAL",   label: "Nome do Responsável Legal",     auto: false },
    ],
    conteudo: `MANUAL DE BOAS PRÁTICAS
CRECHE E HOTEL PARA CÃES

ESTABELECIMENTO: {{NOME_CLINICA}}
CNPJ: {{CNPJ}}
ENDEREÇO: {{ENDERECO}} — {{CIDADE}} / {{UF}}
TELEFONE: {{TELEFONE}}
RESPONSÁVEL TÉCNICO: {{RT_NOME}} — {{RT_CRMV}}
RESPONSÁVEL LEGAL: {{RESPONSAVEL_LEGAL}}
CAP. MÁXIMA: {{CAPACIDADE_ANIMAIS}} animais
HORÁRIO: {{HORARIO_FUNCIONAMENTO}}
DATA DE ELABORAÇÃO: {{DATA_ATUAL}}
Referências: Res. CFMV 1275/2019; Res. CFMV 1000/2012; RDC ANVISA 216/2004; Lei 9.605/1998; NR-32

1. OBJETIVO
Estabelecer as diretrizes técnicas e sanitárias para o funcionamento do {{NOME_CLINICA}}.

2. RESPONSABILIDADE TÉCNICA
RT: {{RT_NOME}} — {{RT_CRMV}}. Competências: elaborar/revisar MBP anualmente, manter POPs atualizados, supervisionar condições sanitárias e de bem-estar, orientar e treinar equipe.

3. ADMISSÃO — DOCUMENTAÇÃO EXIGIDA DO PET
- Vacinação: Raiva (anual), V8/V10, Gripe/Bordetella
- Vermifugação (máx. 6 meses) e controle de ectoparasitas
- Ficha de admissão preenchida pelo tutor
- Termo de Responsabilidade e Autorização de Emergência (Res. CFMV 1653/2025)

4. TRIAGEM SANITÁRIA
Inspeção visual na entrada: sinais de doença, ectoparasitas visíveis, condição corporal. Animais doentes são recusados até apresentação de alta veterinária.

5. INSTALAÇÕES
Portas duplas, ambiente telado, pisos impermeáveis, ventilação adequada, área de isolamento exclusiva. Capacidade: {{CAPACIDADE_ANIMAIS}} animais. Funcionamento: {{HORARIO_FUNCIONAMENTO}}.

6. HIGIENIZAÇÃO
Fluxo: remoção de resíduos → detergente → enxágue → desinfetante virucida → tempo de contato → enxágue → secagem. Baias desinfetadas entre cada animal. Dejetos recolhidos a cada 2h. Água trocada diariamente.

7. PGRSS (RDC ANVISA 222/2018)
Grupo A (biológico): saco branco leitoso → empresa licenciada com manifesto.
Grupo B (químico): recipiente identificado → empresa especializada.
Grupo D (comum): coleta seletiva municipal.
Grupo E (perfurocortante): descarpack → empresa licenciada.

8. CONTROLE DE PRAGAS
Empresa licenciada com visitas periódicas, relatório e mapa de iscas arquivados pelo RT. Barreiras físicas permanentes (ralos, telas, vedação de frestas).

9. BEM-ESTAR ANIMAL (Res. CFMV 1000/2012 — 5 Liberdades)
Água e alimentação ad libitum. Abrigo adequado. Isolamento de animais doentes. Espaço para comportamento natural. Manejo humanitário. Observação clínica ≥ 2x/dia.

10. EQUIPE
ASOs vigentes (NR-7), treinamento anual documentado, EPIs obrigatórios (luvas, avental, calçado fechado).

11. EMERGÊNCIA VETERINÁRIA
Isolamento do animal, contato com RT/MV de plantão, comunicação imediata ao tutor. Todo atendimento de urgência requer autorização prévia do Termo assinado na admissão.

12. REVISÃO
Revisão anual ou em caso de mudança relevante nas atividades, estrutura ou legislação.

{{CIDADE}}, {{DATA_ATUAL}}

___________________________________________
{{RT_NOME}} — {{RT_CRMV}}
Responsável Técnico

___________________________________________
{{RESPONSAVEL_LEGAL}}
Responsável Legal — {{CNPJ}}`,
  },

  // ── 2. POP — Higiene e Desinfecção ────────────────────────────────────
  {
    id: "CH_DOC_POP_01",
    titulo: "POP — Higiene e Desinfecção de Instalações (Creche/Hotel)",
    categoria: "POP / Manual",
    subtipo: "creche_hotel",
    legislacao: "RDC ANVISA 216/2004; Res. CFMV 1138/2016",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_CLINICA",         label: "Nome do Estabelecimento",          auto: true  },
      { nome: "RT_NOME",              label: "Nome do RT",                       auto: true  },
      { nome: "RT_CRMV",              label: "CRMV do RT",                       auto: true  },
      { nome: "DATA_ATUAL",           label: "Data",                             auto: true  },
      { nome: "PRODUTO_DESINFETANTE", label: "Produto desinfetante (nome/marca)", auto: false },
      { nome: "FREQUENCIA_LIMPEZA",   label: "Frequência de limpeza completa",   auto: false },
    ],
    conteudo: `POP — HIGIENE E DESINFECÇÃO DE INSTALAÇÕES
Estabelecimento: {{NOME_CLINICA}} | RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: RDC ANVISA 216/2004; Res. CFMV 1138/2016

OBJETIVO: Prevenir doenças infecciosas (Parvovirose, Cinomose, Giardíase) padronizando a higienização das instalações.

RESPONSÁVEL: Auxiliar de higienização (execução) / RT (supervisão e visto)

MATERIAIS: Luvas de borracha, avental impermeável, calçado fechado, pá, mangueira, detergente neutro, desinfetante virucida {{PRODUTO_DESINFETANTE}} (registrado MAPA/ANVISA), rodo, esfregão, borrifador.

PASSO A PASSO — BAIAS E ÁREAS COLETIVAS:
1. Retirar o animal da área
2. Remover fezes, pelos e resíduos sólidos com pá → descartar em saco branco leitoso (Grupo A)
3. Pré-lavagem com água em pressão moderada
4. Aplicar detergente neutro, esfregar com esfregão (mín. 3 min), atenção a cantos e grades
5. Enxaguar completamente até eliminar toda a espuma
6. Aplicar {{PRODUTO_DESINFETANTE}} na concentração indicada pelo fabricante, cobertura 100% das superfícies
7. Respeitar o tempo de contato indicado pelo fabricante (mín. 10 min)
8. Enxágue final conforme instrução do produto
9. Secar completamente antes de realocar o animal

FREQUÊNCIAS MÍNIMAS:
- Baias/canis individuais: após cada saída de animal; ao início e fim do expediente
- Área coletiva: {{FREQUENCIA_LIMPEZA}} e sempre que houver dejeto
- Bebedouros: lavagem diária com detergente e enxágue
- Comedouros: lavagem após cada uso
- Área de soltura/passeio: coleta de fezes a cada 2h

REGISTRO: Preencher Planilha de Controle de Higienização após cada procedimento completo.

AÇÕES CORRETIVAS:
- Superfície com resíduo orgânico após o processo → repetir etapas 4 a 9
- Produto vencido → substituir e comunicar o RT
- Animal doente na área → isolar e acionar RT antes da limpeza

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}}`,
  },

  // ── 3. POP — Admissão e Triagem ───────────────────────────────────────
  {
    id: "CH_DOC_POP_02",
    titulo: "POP — Admissão e Triagem Sanitária de Pets",
    categoria: "POP / Manual",
    subtipo: "creche_hotel",
    legislacao: "Res. CFMV 1275/2019; Res. CFMV 1000/2012; Res. CFMV 1653/2025",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_CLINICA", label: "Nome do Estabelecimento", auto: true },
      { nome: "RT_NOME",      label: "Nome do RT",              auto: true },
      { nome: "RT_CRMV",      label: "CRMV do RT",              auto: true },
      { nome: "DATA_ATUAL",   label: "Data",                    auto: true },
    ],
    conteudo: `POP — ADMISSÃO E TRIAGEM SANITÁRIA DE PETS
Estabelecimento: {{NOME_CLINICA}} | RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: Res. CFMV 1275/2019; Res. CFMV 1000/2012; Res. CFMV 1653/2025

OBJETIVO: Garantir que apenas animais sadios e devidamente vacinados ingressem nas instalações coletivas.

RESPONSÁVEL: Atendente ou Auxiliar veterinário treinado (execução) / RT em casos suspeitos (validação)

DOCUMENTAÇÃO EXIGIDA — Verificar e registrar na Ficha de Admissão:
[ ] Carteira de vacinação — Raiva (validade anual)
[ ] Carteira de vacinação — V8 ou V10 (Cinomose, Parvovirose, Hepatite, Leptospirose)
[ ] Vacina Gripe / Bordetella (obrigatória em ambiente coletivo)
[ ] Comprovação de vermifugação (receita ou declaração — máx. 6 meses)
[ ] Comprovação de controle de ectoparasitas (antipulgas/carrapatos)
[ ] Ficha de admissão preenchida pelo tutor
[ ] Termo de Responsabilidade e Autorização de Emergência assinado (Res. CFMV 1653/2025)

TRIAGEM SANITÁRIA — SINAIS DE BARRAMENTO IMEDIATO:
- Vômito ou diarreia recente (últimas 24h)
- Corrimento ocular, nasal ou genital purulento
- Tosse, espirros frequentes ou dificuldade respiratória
- Feridas abertas, lesões cutâneas extensas ou abcessos
- Apatia extrema ou alteração neurológica
- Infestação de pulgas ou carrapatos visíveis
- Vacinas vencidas ou ausentes

SE APROVADO: Registrar "Aprovado — Triagem Normal" na ficha. Encaminhar à baia/área designada.
SE RECUSADO: Registrar o motivo. Informar o tutor respeitosamente. O animal não permanece nas dependências.

SEPARAÇÃO E ALOJAMENTO:
- Porte: pequenos / médios / grandes em áreas distintas
- Comportamento: sociáveis em área coletiva; territorialistas em baia individual
- Primeira visita: observação nas primeiras 2h

MONITORAMENTO DURANTE A ESTADIA:
- Observação clínica e comportamental mín. 2x/dia com registro na ficha
- Comunicar RT para qualquer alteração significativa
- Comunicar tutor no mesmo dia para qualquer intercorrência

SAÍDA: Conferir identidade antes da entrega. Informar tutor sobre ocorrências. Higienizar a baia.

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}}`,
  },

  // ── 4. POP — Controle de Pragas ───────────────────────────────────────
  {
    id: "CH_DOC_POP_03",
    titulo: "POP — Controle Integrado de Pragas",
    categoria: "POP / Manual",
    subtipo: "creche_hotel",
    legislacao: "RDC ANVISA 216/2004; Portaria CVS-15/2009",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_CLINICA",            label: "Nome do Estabelecimento",             auto: true  },
      { nome: "RT_NOME",                 label: "Nome do RT",                          auto: true  },
      { nome: "RT_CRMV",                 label: "CRMV do RT",                          auto: true  },
      { nome: "DATA_ATUAL",              label: "Data",                                auto: true  },
      { nome: "EMPRESA_DESINSETIZADORA", label: "Empresa de controle de pragas",       auto: false },
      { nome: "FREQUENCIA_VISITA",       label: "Frequência das visitas (ex: Mensal)", auto: false },
    ],
    conteudo: `POP — CONTROLE INTEGRADO DE PRAGAS
Estabelecimento: {{NOME_CLINICA}} | RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: RDC ANVISA 216/2004; Portaria CVS-15/2009

OBJETIVO: Controlar roedores, insetos e ectoparasitas nas instalações, protegendo animais, colaboradores e comunidade.

EMPRESA CONTRATADA: {{EMPRESA_DESINSETIZADORA}}
FREQUÊNCIA DE VISITAS: {{FREQUENCIA_VISITA}}
DOCUMENTOS ARQUIVADOS: Certificado de execução, relatório de visita, mapa de iscas.
RESPONSÁVEL PELO ARQUIVO: RT {{RT_NOME}}

MEDIDAS PREVENTIVAS PERMANENTES (verificar semanalmente):
- Ralos com telas ou tampas anti-roedores íntegras
- Janelas e aberturas com telas de malha ≤ 2mm, sem rasgos
- Portas com batentes vedados, sem frestas ≥ 1cm
- Área externa sem lixo, entulho ou vegetação rasteira junto às paredes
- Rações armazenadas em recipientes herméticos, elevados ≥ 10cm do chão

MONITORAMENTO SEMANAL (colaborador designado):
[ ] Iscas raticidas íntegras conforme mapa — registrar consumo
[ ] Nenhuma isca dentro das áreas dos animais
[ ] Ausência de fezes de roedores em cantos e prateleiras
[ ] Ausência de roeduras em embalagens, cabos ou estruturas
[ ] Armadilhas luminosas limpas com lâmpada UV funcionando
[ ] Ausência de insetos nas áreas dos animais

REGISTRO: Planilha de Controle de Pragas assinada semanalmente.

AÇÕES CORRETIVAS:
1. Isolar a área afetada
2. Comunicar o RT imediatamente
3. Acionar {{EMPRESA_DESINSETIZADORA}} para visita emergencial
4. Avaliar impacto nos animais e no estoque de alimentos
5. Registrar o ocorrido e as ações tomadas

ATENÇÃO: Nenhum produto raticida ou inseticida deve ser aplicado sem a empresa licenciada nas áreas dos animais.

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}}`,
  },

  // ── 5. PGRSS ──────────────────────────────────────────────────────────
  {
    id: "CH_DOC_PGRSS_01",
    titulo: "PGRSS — Plano de Gerenciamento de Resíduos (Creche/Hotel)",
    categoria: "Biossegurança e Resíduos",
    subtipo: "creche_hotel",
    legislacao: "RDC ANVISA 222/2018; Lei 12.305/2010 (PNRS)",
    frequenciaRevisao: "Anual",
    variaveis: [
      { nome: "NOME_CLINICA",      label: "Nome do Estabelecimento",   auto: true  },
      { nome: "CNPJ",              label: "CNPJ",                      auto: true  },
      { nome: "ENDERECO",          label: "Endereço",                  auto: true  },
      { nome: "CIDADE",            label: "Cidade",                    auto: true  },
      { nome: "UF",                label: "UF",                        auto: true  },
      { nome: "RT_NOME",           label: "Nome do RT",                auto: true  },
      { nome: "RT_CRMV",           label: "CRMV do RT",                auto: true  },
      { nome: "DATA_ATUAL",        label: "Data",                      auto: true  },
      { nome: "EMPRESA_COLETA",    label: "Empresa coletora de RSS",   auto: false },
      { nome: "RESPONSAVEL_LEGAL", label: "Nome do Responsável Legal", auto: false },
    ],
    conteudo: `PLANO DE GERENCIAMENTO DE RESÍDUOS DE SERVIÇOS DE SAÚDE — PGRSS
Estabelecimento: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}
Endereço: {{ENDERECO}} — {{CIDADE}} / {{UF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável Legal: {{RESPONSAVEL_LEGAL}}
Data: {{DATA_ATUAL}} | Ref.: RDC ANVISA 222/2018; Lei 12.305/2010

OBJETIVO: Estabelecer procedimentos para o gerenciamento correto dos resíduos desde a geração até a destinação final.

CLASSIFICAÇÃO E SEGREGAÇÃO:

GRUPO A — Resíduos Biológicos
O que é: fezes, materiais com sangue/secreções, pelos contaminados, curativos usados, materiais de limpeza de baias.
Acondicionamento: saco plástico BRANCO LEITOSO resistente, lixeira com tampa e pedal, identificada com símbolo de infectante.
Destinação: empresa licenciada {{EMPRESA_COLETA}} com emissão de Manifesto de Resíduos.

GRUPO B — Resíduos Químicos
O que é: medicamentos veterinários vencidos, produtos de limpeza em excesso, embalagens de produtos químicos não-lavadas.
Acondicionamento: recipiente rígido rotulado como 'Resíduo Químico'.
Destinação: empresa especializada em resíduos químicos ou devolução ao fornecedor/fabricante.

GRUPO D — Resíduos Comuns (Classe II)
O que é: papel, papelão, embalagens plásticas limpas, resíduos de escritório.
Acondicionamento: sacos pretos ou coleta seletiva por cor (CONAMA).
Destinação: coleta municipal ou cooperativas de reciclagem.

GRUPO E — Resíduos Perfurocortantes
O que é: agulhas, lâminas de bisturi, ampolas de vidro quebradas.
Acondicionamento: coletor rígido resistente (descarpack) até 2/3 da capacidade, com tampa rosqueada.
Destinação: empresa licenciada {{EMPRESA_COLETA}} com emissão de Manifesto de Resíduos.

ARMAZENAMENTO INTERNO:
- Grupos A e E: abrigo externo coberto, acesso restrito, identificado com símbolo de infectante, aguarda coleta
- Grupo B: área separada, ventilada, identificada, longe de fontes de calor
- Grupo D: local limpo, coberto, separado dos demais
- Nenhum resíduo permanece nas áreas dos animais por mais de 24h

EMPRESA COLETORA: {{EMPRESA_COLETA}}
Manifesto de Transporte emitido a cada coleta e arquivado pelo RT por mínimo 5 anos.

TREINAMENTO: Inicial e anual — segregação correta, uso de EPIs, procedimento de acidente com perfurocortante.

RESPONSABILIDADES:
- RT {{RT_NOME}}: elaboração, revisão anual, supervisão, arquivo dos Manifestos
- Colaboradores: segregação correta no ponto de geração
- {{EMPRESA_COLETA}}: coleta, transporte e destinação final com Manifesto

{{CIDADE}}, {{DATA_ATUAL}}

___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal`,
  },

  // ── 6. Termo de Emergência ────────────────────────────────────────────
  {
    id: "CH_DOC_TERMO_01",
    titulo: "Termo de Responsabilidade e Autorização de Emergência — Creche/Hotel",
    categoria: "TCLE / Termos",
    subtipo: "creche_hotel",
    legislacao: "Res. CFMV 1653/2025; Res. CFMV 1000/2012; Código Civil Art. 186",
    frequenciaRevisao: "Por evento — uma via por animal por hospedagem",
    variaveis: [
      { nome: "NOME_CLINICA",        label: "Nome do Estabelecimento",  auto: true  },
      { nome: "CNPJ",                label: "CNPJ",                     auto: true  },
      { nome: "RT_NOME",             label: "Nome do RT",               auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",               auto: true  },
      { nome: "DATA_ATUAL",          label: "Data",                     auto: true  },
      { nome: "SMART_ID",            label: "Smart ID",                 auto: true  },
      { nome: "NOME_ANIMAL",         label: "Nome do animal",           auto: false },
      { nome: "ESPECIE_RACA_IDADE",  label: "Espécie, raça e idade",   auto: false },
      { nome: "RESPONSAVEL",         label: "Nome do responsável",      auto: false },
      { nome: "CPF_RESPONSAVEL",     label: "CPF do responsável",       auto: false },
    ],
    conteudo: `TERMO DE RESPONSABILIDADE E AUTORIZAÇÃO DE EMERGÊNCIA

Estabelecimento: {{NOME_CLINICA}} — CNPJ: {{CNPJ}}
Responsável Técnico: {{RT_NOME}} — {{RT_CRMV}}
Smart ID: {{SMART_ID}} | Data: {{DATA_ATUAL}}
Ref.: Res. CFMV 1653/2025; Res. CFMV 1000/2012

IDENTIFICAÇÃO DO ANIMAL:
Nome: {{NOME_ANIMAL}} | Espécie / Raça / Idade: {{ESPECIE_RACA_IDADE}}

IDENTIFICAÇÃO DO RESPONSÁVEL:
Nome: {{RESPONSAVEL}} | CPF: {{CPF_RESPONSAVEL}}

1. DECLARAÇÃO DE SAÚDE E VACINAÇÃO
Declaro que {{NOME_ANIMAL}} está em boas condições de saúde, não apresenta sinais de doença infecciosa e possui vacinação em dia para Raiva, V8/V10 e Gripe (Bordetella), conforme carteira apresentada neste ato.
Declaro que o animal foi vermifugado nos últimos 6 meses e recebeu tratamento preventivo contra pulgas e carrapatos.

2. CONDIÇÕES ESPECIAIS DE SAÚDE
O animal possui condição clínica preexistente, alergia, medicação em uso ou necessidade especial?
( ) Não
( ) Sim — Descrever: ___________________________
Medicação em uso: _______________ Frequência/dose: _______________ Dieta especial: _______________

3. AUTORIZAÇÃO DE EMERGÊNCIA
Autorizo o {{NOME_CLINICA}} a providenciar atendimento veterinário de urgência para {{NOME_ANIMAL}}, às minhas expensas, caso ocorra intercorrência clínica durante sua permanência:
( ) Autorizo qualquer procedimento de urgência necessário, sem limitação de valor
( ) Autorizo procedimentos até o limite de R$ _______________
( ) Solicito contato prévio obrigatório antes de qualquer procedimento

Contato de emergência:
Nome: ______________________________ Tel. 1: ________________ Tel. 2: ________________

4. RISCOS DO AMBIENTE COLETIVO
Estou ciente de que ambientes coletivos apresentam risco de transmissão de doenças entre animais, mesmo com todas as medidas preventivas adotadas.

5. RESPONSABILIDADE FINANCEIRA
Respondo financeiramente por qualquer atendimento veterinário autorizado neste Termo.

{{DATA_ATUAL}}

_____________________________ {{RESPONSAVEL}} | CPF: {{CPF_RESPONSAVEL}} | Tutor
_____________________________ Atendente — {{NOME_CLINICA}}

Via 1: Arquivo do estabelecimento  |  Via 2: Tutor responsável
VERTOS OS · Smart ID: {{SMART_ID}} · {{RT_NOME}} — {{RT_CRMV}}`,
  },
];

// ── Seed para o Firestore ──────────────────────────────────────────────────
async function seed() {
  console.log(`\nIniciando seed de ${TEMPLATES.length} templates...\n`);
  const batch = db.batch();

  for (const template of TEMPLATES) {
    const ref = db.collection("template").doc(template.id);
    batch.set(ref, {
      ...template,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      ativo: true,
    });
    console.log(`  ✅ ${template.id}: ${template.titulo}`);
  }

  await batch.commit();
  console.log("\nSeed concluído com sucesso!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
