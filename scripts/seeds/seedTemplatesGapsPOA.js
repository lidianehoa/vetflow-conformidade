// node scripts/seeds/seedTemplatesGapsPOA.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const TEMPLATES = [

  // ════════════════════════════════════════════════════════════
  // GAP 5 — APPCC COMPLETO
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_APPCC_01",
    titulo: "Plano APPCC — Análise de Perigos e Pontos Críticos de Controle",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "Portaria MAPA 46/1998; Codex Alimentarius CAC/RCP 1-1969; RIISPOA Art. 74",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social da Indústria",    auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                         auto: true  },
      { nome: "CIDADE",             label: "Município",                    auto: true  },
      { nome: "UF",                 label: "UF",                           auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                   auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                   auto: true  },
      { nome: "DATA_ATUAL",         label: "Data de elaboração",           auto: true  },
      { nome: "NUMERO_SIF",         label: "Nº Registro SIF/SIE/SIM",     auto: false },
      { nome: "PRODUTO_LINHA",      label: "Produto e linha de produção",  auto: false },
      { nome: "RESPONSAVEL_LEGAL",  label: "Responsável Legal",            auto: false },
    ],
    conteudo: `PLANO APPCC — ANÁLISE DE PERIGOS E PONTOS CRÍTICOS DE CONTROLE
Ref.: Portaria MAPA 46/1998; Codex Alimentarius CAC/RCP 1-1969; RIISPOA Art. 74

Estabelecimento: {{NOME_CLINICA}} — CNPJ: {{CNPJ}}
Registro: {{NUMERO_SIF}} | Produto/Linha: {{PRODUTO_LINHA}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável Legal: {{RESPONSAVEL_LEGAL}}
Data de Elaboração: {{DATA_ATUAL}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ETAPA 1 — FORMAÇÃO DA EQUIPE APPCC
Coordenador APPCC: {{RT_NOME}} — {{RT_CRMV}}
Membros da equipe: (Listar nomes, cargos e responsabilidades)
___________________________________________

ETAPA 2 — DESCRIÇÃO DO PRODUTO
Produto: {{PRODUTO_LINHA}}
Composição: (Ingredientes e proporções conforme RTIQ)
Características físico-químicas: pH ___ | Aw ___ | Temperatura de armazenamento ___
Embalagem: _______________ | Shelf life: _______________
Uso pretendido: Consumo humano direto / Após cozimento
Público-alvo: _______________

ETAPA 3 — DIAGRAMA DE FLUXO DO PROCESSO
(Anexar fluxograma aprovado pelo órgão de inspeção — MDES)
Etapas: Recepção → Armazenamento → Preparo → Processamento → Tratamento térmico →
         Resfriamento → Embalagem → Armazenamento → Expedição

ETAPA 4 — VERIFICAÇÃO IN LOCO DO FLUXOGRAMA
Data de verificação: ____/____/______ | Verificado por: _______________

ETAPA 5 — ANÁLISE DE PERIGOS (PRINCÍPIO 1)
Para cada etapa do processo, identificar perigos com probabilidade de ocorrência significativa:

EXEMPLO DE TABELA DE ANÁLISE DE PERIGOS:
Etapa | Perigo (B/Q/F) | Causa/Fonte | Significativo? | Justificativa | Medida preventiva
------|----------------|-------------|-----------------|---------------|-------------------
Recepção carne | B: Salmonella, Listeria | MP contaminada | Sim | Alta prevalência | Laudo fornecedor, temperatura ≤7°C
Tratamento térmico | B: Sobrevivência de patógenos | Temperatura insuficiente | Sim | PCC identificado | Controle de Temp/Tempo

ETAPA 6 — DETERMINAÇÃO DOS PONTOS CRÍTICOS DE CONTROLE (PRINCÍPIO 2)
Usar Árvore Decisória do Codex:
Q1: Existe(m) medida(s) preventiva(s) para o perigo identificado? S→Q2 / N→não é PCC
Q2: A etapa elimina ou reduz o perigo a nível aceitável? S→PCC / N→Q3
Q3: Pode contaminação acima do nível aceitável ocorrer? S→Q4 / N→não é PCC
Q4: A etapa seguinte eliminará ou reduzirá o perigo? S→não é PCC / N→PCC

PCCs IDENTIFICADOS:
PCC nº | Etapa | Perigo | Justificativa
--------|-------|--------|---------------
PCC 1 | Tratamento térmico | B: Sobrevivência | Única etapa que elimina o perigo
PCC 2 | Resfriamento | B: Multiplicação | Critério de temperatura crítico

ETAPA 7 — LIMITES CRÍTICOS (PRINCÍPIO 3)
PCC | Parâmetro monitorado | Limite crítico | Base legal
----|---------------------|----------------|----------
PCC 1 | Temperatura interna do produto | ≥ 72°C por 15 segundos | RIISPOA; Codex
PCC 2 | Temperatura de resfriamento | < 4°C em até 2h após término | RIISPOA

ETAPA 8 — MONITORAMENTO DOS PCCs (PRINCÍPIO 4)
PCC | O quê? | Como? | Frequência | Quem?
----|--------|-------|------------|------
PCC 1 | Temperatura | Termômetro calibrado | Em 100% das bateladas | Operador / Monitor

ETAPA 9 — AÇÕES CORRETIVAS (PRINCÍPIO 5)
PCC | Desvio | Ação imediata | Responsável | Registro
----|--------|---------------|-------------|--------
PCC 1 | Temperatura < LC | Bloquear lote, reprocessar ou descartar | RT / Supervisor | Formulário NC-001

ETAPA 10 — VERIFICAÇÃO (PRINCÍPIO 6)
Atividade de verificação | Responsável | Frequência
Calibração de termômetros | Monitor PAC | Conforme PAC 06
Análise microbiológica do produto acabado | Laboratório | Conforme PAC — análises
Auditoria interna do sistema APPCC | RT | Semestral
Revisão completa do plano APPCC | RT | Anual ou quando houver mudança de processo

ETAPA 11 — DOCUMENTAÇÃO E REGISTROS (PRINCÍPIO 7)
Documentos do sistema APPCC arquivados por no mínimo 2 anos:
[ ] Plano APPCC (este documento)
[ ] Registros de monitoramento dos PCCs (Planilha POA_PL_07)
[ ] Registros de ações corretivas
[ ] Registros de calibração de instrumentos
[ ] Relatórios de verificação e auditoria interna

PRÓXIMA REVISÃO: ____/____/______
MOTIVO DA REVISÃO: [ ] Anual [ ] Mudança de processo [ ] Novo produto [ ] Fiscalização

{{CIDADE}}, {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 7 — CERTIFICAÇÃO PARA EXPORTAÇÃO
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_CERT_EXPORT_01",
    titulo: "Declaração de Respaldo para Certificação Sanitária — Exportação",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA Art. 74; Acordos bilaterais MAPA; Portaria MAPA 558/2022",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social da Indústria",     auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                          auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                    auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                    auto: true  },
      { nome: "DATA_ATUAL",         label: "Data",                          auto: true  },
      { nome: "SMART_ID",           label: "Smart ID",                      auto: true  },
      { nome: "NUMERO_SIF",         label: "Nº Registro SIF/SIE/SIM",      auto: false },
      { nome: "PAIS_DESTINO",       label: "País de destino",               auto: false },
      { nome: "PRODUTO_EXPORTAR",   label: "Produto e lote a exportar",     auto: false },
      { nome: "ACORDO_BILATERAL",   label: "Acordo bilateral MAPA aplicável", auto: false },
      { nome: "RESPONSAVEL_LEGAL",  label: "Responsável Legal",             auto: false },
    ],
    conteudo: `DECLARAÇÃO DE RESPALDO PARA CERTIFICAÇÃO SANITÁRIA — EXPORTAÇÃO
Ref.: RIISPOA Art. 74; Acordos Bilaterais MAPA; Portaria MAPA 558/2022
Smart ID: {{SMART_ID}} | Data: {{DATA_ATUAL}}

ESTABELECIMENTO: {{NOME_CLINICA}} — CNPJ: {{CNPJ}}
Registro SIF/SIE/SIM: {{NUMERO_SIF}}
País de Destino: {{PAIS_DESTINO}} | Acordo Bilateral: {{ACORDO_BILATERAL}}
Produto / Lote: {{PRODUTO_EXPORTAR}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável Legal: {{RESPONSAVEL_LEGAL}}

DECLARAÇÃO DO RESPONSÁVEL TÉCNICO

Na qualidade de Médico Veterinário Responsável Técnico do {{NOME_CLINICA}}, inscrito(a) sob
o {{RT_CRMV}}, declaro para os fins de certificação sanitária oficial que:

1. CONFORMIDADE DO PRODUTO
O produto {{PRODUTO_EXPORTAR}} foi elaborado em conformidade com:
[ ] Legislação sanitária brasileira vigente (RIISPOA; Portaria MAPA 368/1997)
[ ] Requisitos específicos do país de destino ({{PAIS_DESTINO}}) nos termos do acordo bilateral {{ACORDO_BILATERAL}}
[ ] RTIQs específicos do produto
[ ] Registro de produto ativo no PGA/SIGSIF

2. CONFORMIDADE DOS CONTROLES
[ ] Programas de Autocontrole (PACs) implementados, monitorados e com registros auditáveis
[ ] Sistema APPCC validado e em operação
[ ] Resultados de análises laboratoriais dentro dos padrões — laudos arquivados
[ ] Rastreabilidade completa da matéria-prima ao produto acabado garantida

3. CONFORMIDADE ESTRUTURAL
[ ] Instalações aprovadas pelo SIF e em conformidade com o MDES vigente
[ ] Equipe treinada — ASOs e PCMSO vigentes
[ ] Controle de temperatura das câmaras dentro dos limites durante toda a cadeia fria

4. AUSÊNCIA DE IMPEDIMENTOS SANITÁRIOS
Declaro não ter conhecimento de não conformidades sanitárias não corrigidas que possam
comprometer a inocuidade e identidade do produto destinado à exportação.

Esta declaração é documento de respaldo ao médico-veterinário oficial para emissão do
Certificado Sanitário Internacional (CSI).

{{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 2 — POP DE ROTULAGEM E RTIQs
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_POP_ROTULAGEM_01",
    titulo: "POP — Registro e Controle de Rotulagem (RTIQs)",
    categoria: "POP / Manual",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA Art. 427–434; RDC ANVISA 429/2020; RDC ANVISA 727/2022; RTIQs MAPA",
    variaveis: [
      { nome: "NOME_CLINICA",    label: "Razão Social",          auto: true  },
      { nome: "RT_NOME",         label: "Nome do RT",            auto: true  },
      { nome: "RT_CRMV",         label: "CRMV do RT",            auto: true  },
      { nome: "DATA_ATUAL",      label: "Data",                  auto: true  },
      { nome: "NUMERO_SIF",      label: "Nº Registro SIF/SIE/SIM", auto: false },
    ],
    conteudo: `POP — REGISTRO E CONTROLE DE ROTULAGEM (RTIQs)
Estabelecimento: {{NOME_CLINICA}} | Reg.: {{NUMERO_SIF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: RIISPOA Art. 427–434; RDC ANVISA 429/2020; RDC ANVISA 727/2022; RTIQs MAPA

1. OBJETIVO
Garantir que todos os produtos fabricados pelo estabelecimento possuam registro vigente no PGA/SIGSIF e rótulos aprovados pelo órgão de inspeção, em conformidade com os RTIQs específicos.

2. REGISTRO PRÉVIO DE PRODUTOS — OBRIGATORIEDADE
NENHUM produto pode ser fabricado sem registro ativo no PGA/SIGSIF (Portaria MAPA 558/2022).

Procedimento de registro:
1. Elaborar memorial descritivo de fabricação com composição centesimal e fluxograma
2. Submeter ao SIF/SIE/SIM para aprovação
3. Após aprovação, registrar o produto na plataforma PGA/SIGSIF
4. Arquivar o número de registro e a data de aprovação

3. CONTROLE DE ROTULAGEM
Verificação obrigatória antes da impressão de qualquer rótulo:

Elemento do rótulo | Requisito | Base legal
Denominação de venda | Conforme RTIQ específico | RIISPOA Art. 427–434
Lista de ingredientes | Ordem decrescente de quantidade, declaração de alergênicos | RDC ANVISA 727/2022
Informação nutricional | Tabela conforme RDC ANVISA 429/2020 | RDC ANVISA 429/2020
Prazo de validade | Data de validade ou fabricação + prazo | Código de Defesa do Consumidor
Peso líquido | Conforme INMETRO | Portaria INMETRO 248/2008
Identificação do lote | Rastreabilidade | Portaria CVS-6/99
Carimbos de inspeção | SIF/SIE/SIM conforme porte de comércio | RIISPOA Art. 437

4. PRODUTOS CÁRNEOS — CONTROLES ESPECÍFICOS
Aditivos permitidos: exclusivamente os da RDC ANVISA 778/2023 para a categoria
Nitratos/nitritos: não ultrapassar limites máximos — verificar por lote
Maltodextrina: somente quando o RTIQ autoriza expressamente — incluindo uso indireto em mixes (Ofício DIPOA 131/2020)
Composição centesimal: verificar conformidade com o RTIQ a cada mudança de formulação

5. REVISÃO DE RÓTULOS — OBRIGATORIEDADE
Revisar rótulos quando:
- Qualquer alteração na formulação do produto
- Publicação ou atualização do RTIQ específico
- Alteração na lista de aditivos permitidos
- Solicitação do SIF/SIE/SIM

6. ARQUIVO
Manter arquivo com: registro PGA/SIGSIF, arte do rótulo aprovada, data de aprovação e RTIQ de referência.
Período de guarda: enquanto o produto estiver em produção + 2 anos após descontinuação.

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}}`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 3 — COMUNICAÇÃO OFICIAL AO SIF
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_OFICIO_SIF_01",
    titulo: "Ofício de Comunicação ao SIF — Paralisação ou Reinício de Atividades",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA Art. 74; Portaria MAPA 393/2021",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social",                  auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                          auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                    auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                    auto: true  },
      { nome: "DATA_ATUAL",         label: "Data do ofício",                auto: true  },
      { nome: "SMART_ID",           label: "Smart ID / Protocolo",          auto: true  },
      { nome: "NUMERO_SIF",         label: "Nº Registro SIF/SIE/SIM",      auto: false },
      { nome: "TIPO_COMUNICACAO",   label: "Tipo (Paralisação ou Reinício)", auto: false },
      { nome: "DATA_EVENTO",        label: "Data prevista da paralisação/reinício", auto: false },
      { nome: "MOTIVO",             label: "Motivo / Justificativa",        auto: false },
      { nome: "LINHAS_AFETADAS",    label: "Linhas ou setores afetados",    auto: false },
      { nome: "RESPONSAVEL_LEGAL",  label: "Responsável Legal",             auto: false },
    ],
    conteudo: `OFÍCIO DE COMUNICAÇÃO — {{TIPO_COMUNICACAO}} DE ATIVIDADES
Ref.: RIISPOA Art. 74; Portaria MAPA 393/2021
Protocolo / Smart ID: {{SMART_ID}}
Data: {{DATA_ATUAL}}

Ao Serviço de Inspeção Federal / Estadual / Municipal
Unidade Administrativa responsável pelo Reg. {{NUMERO_SIF}}

Assunto: Comunicação de {{TIPO_COMUNICACAO}} de atividades industriais

Prezados Senhores,

O {{NOME_CLINICA}}, pessoa jurídica inscrita sob o CNPJ {{CNPJ}}, estabelecimento registrado
sob o nº {{NUMERO_SIF}}, vem, por meio do seu Responsável Técnico médico-veterinário
{{RT_NOME}} ({{RT_CRMV}}), conforme determina o RIISPOA (Art. 74), comunicar a
{{TIPO_COMUNICACAO}} das atividades industriais nas seguintes condições:

DATA PREVISTA DO EVENTO: {{DATA_EVENTO}} (conforme exigência de antecedência mínima de 72h)

LINHAS / SETORES AFETADOS: {{LINHAS_AFETADAS}}

MOTIVO / JUSTIFICATIVA: {{MOTIVO}}

Coloca-se à disposição para eventuais esclarecimentos adicionais.

Atenciosamente,

{{NOME_CLINICA}} — CNPJ: {{CNPJ}}
{{DATA_ATUAL}}

___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal

___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico

Visto do SIF: __________________________________ Data: ____/____/______`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 6 — CONTROLE DE FORMULAÇÃO E COMBATE À FRAUDE
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_POP_FORMULACAO_01",
    titulo: "POP — Controle de Formulação Centesimal e Combate à Fraude",
    categoria: "POP / Manual",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA; RTIQs MAPA; RDC ANVISA 778/2023; Ofício DIPOA 131/2020",
    variaveis: [
      { nome: "NOME_CLINICA",    label: "Razão Social",           auto: true  },
      { nome: "RT_NOME",         label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",         label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",      label: "Data",                   auto: true  },
      { nome: "NUMERO_SIF",      label: "Nº Registro SIF/SIE/SIM", auto: false },
      { nome: "PRODUTO_LINHA",   label: "Produto e linha",        auto: false },
    ],
    conteudo: `POP — CONTROLE DE FORMULAÇÃO CENTESIMAL E COMBATE À FRAUDE
Estabelecimento: {{NOME_CLINICA}} | Reg.: {{NUMERO_SIF}}
Produto/Linha: {{PRODUTO_LINHA}} | RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: RIISPOA; RTIQs MAPA; RDC ANVISA 778/2023; Ofício DIPOA 131/2020

1. OBJETIVO
Garantir que o produto fabricado corresponda exatamente ao memorial descritivo registrado no SIF, prevenindo fraudes e não conformidades de identidade e qualidade.

2. VALIDAÇÃO DE FORMULAÇÃO (ANTES DO INÍCIO DA PRODUÇÃO)
Para cada produto ou sempre que houver alteração de formulação:
[ ] Verificar composição centesimal: proteína, gordura, umidade, amido conforme RTIQ
[ ] Confirmar que todos os ingredientes estão listados no registro do produto
[ ] Verificar que os aditivos estão na lista permitida (RDC ANVISA 778/2023)
[ ] Confirmar que nitratos e nitritos estão dentro dos limites máximos do RTIQ
[ ] Verificar uso de maltodextrina: permitido apenas se o RTIQ autoriza expressamente — incluindo uso indireto em mixes e condimentos (Ofício DIPOA 131/2020)
[ ] Confirmar que ingredientes não declarados no registro NÃO estão sendo usados

3. CONTROLE DE PESAGEM E DOSAGEM (DURANTE A PRODUÇÃO)
[ ] Ingredientes pesados em balança calibrada com certificado INMETRO vigente
[ ] Dosagem de aditivos controlada por planilha lote a lote
[ ] Registro de pesagem assinado pelo operador e conferido pelo monitor de PAC
[ ] Qualquer desvio registrado imediatamente — lote bloqueado até avaliação

4. VERIFICAÇÃO DO PRODUTO ACABADO
Frequência mínima: 1 análise por mês por produto em laboratório credenciado
Parâmetros verificados:
- Proteína total (%) — limite RTIQ: _____ % mín.
- Gordura total (%) — limite RTIQ: _____ % máx.
- Umidade (%) — limite RTIQ: _____ % máx.
- Amido (se aplicável) — limite RTIQ: _____ % máx.
- Nitratos/Nitritos (se aplicável) — limite máximo: conforme RDC ANVISA 778/2023

5. AÇÃO CORRETIVA — DESVIO DE FORMULAÇÃO
1. Bloquear imediatamente o lote com etiqueta "EM ANÁLISE — NÃO EXPEDIR"
2. Comunicar RT e gestor da produção
3. Investigar a causa-raiz (pesagem incorreta, ingrediente errado, etc.)
4. Avaliar destinação: reprocessamento (se tecnicamente viável) ou descarte
5. Registrar a não conformidade no sistema
6. Comunicar ao SIF se houver risco de produto não conforme já expedido

6. ARQUIVO
Planilhas de pesagem, laudos de análise do produto acabado e registros de não conformidades: arquivar por no mínimo 2 anos.

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}}`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 8 — CHECKLIST DE VALIDAÇÃO PRÉVIA DE PLANTAS/MDES
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_CHECK_MDES_01",
    titulo: "Checklist de Validação Prévia de Plantas e MDES antes do Envio ao SIF",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA Art. 44; Portaria MAPA 393/2021",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social",                  auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                          auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                    auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                    auto: true  },
      { nome: "DATA_ATUAL",         label: "Data",                          auto: true  },
      { nome: "SMART_ID",           label: "Smart ID",                      auto: true  },
      { nome: "TIPO_SOLICITACAO",   label: "Tipo (Novo registro / Reforma / Ampliação)", auto: false },
      { nome: "RESPONSAVEL_LEGAL",  label: "Responsável Legal",             auto: false },
    ],
    conteudo: `CHECKLIST DE VALIDAÇÃO PRÉVIA — PLANTAS E MDES
Smart ID: {{SMART_ID}} | Data: {{DATA_ATUAL}}
Estabelecimento: {{NOME_CLINICA}} | CNPJ: {{CNPJ}}
Tipo de solicitação: {{TIPO_SOLICITACAO}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável Legal: {{RESPONSAVEL_LEGAL}}
Ref.: RIISPOA Art. 44; Portaria MAPA 393/2021

ATENÇÃO: Verificar TODOS os itens antes do envio ao órgão de inspeção.
Itens com NÃO devem ser corrigidos antes do protocolo.

1. VERIFICAÇÃO DO MEMORIAL DESCRITIVO (MDES)
[ ] Razão social, CNPJ e registro SIF/SIE/SIM corretos?
[ ] Capacidade de produção declarada compatível com a realidade?
[ ] Capacidade instalada de frio (câmaras) correta (m³ e temperatura)?
[ ] Fluxograma de produção de cada linha aprovado e atualizado?
[ ] Croquis de fluxos (pessoal, produto, resíduos, água) atualizados?
[ ] Localização das câmaras de frio compatível com a planta?

2. VERIFICAÇÃO DA PLANTA BAIXA (LAYOUT)
[ ] Escala compatível com as dimensões reais das instalações?
[ ] Todas as dependências obrigatórias identificadas (recepção, câmaras, processamento, embalagem, expurgo, vestiários, sanitários)?
[ ] Separação física área limpa / área suja representada corretamente?
[ ] Separação área alto risco / baixo risco representada (beneficiamento)?
[ ] Pontos de acesso de pessoal e produto identificados (sentido único)?
[ ] Rede hidráulica e pontos de coleta de água identificados?
[ ] Localização das iscas e armadilhas do controle de pragas identificada?

3. CONFORMIDADE COM A REALIDADE (VERIFICAÇÃO IN LOCO)
[ ] Visitado o estabelecimento e confirmada a correspondência entre planta e realidade?
[ ] Divergências identificadas corrigidas nas plantas antes do envio?
[ ] Equipamentos declarados no MDES instalados e em funcionamento?

4. DECLARAÇÃO DO RT
Confirmo ter verificado in loco a conformidade entre as plantas, o MDES e a realidade
das instalações do {{NOME_CLINICA}}, estando os documentos aptos para protocolização no
órgão oficial de inspeção.

{{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 15 — PGRS ATUALIZADO COM LINHAS VERMELHA/VERDE
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_PGRS_FRIGORIFICO_01",
    titulo: "PGRS — Gerenciamento de Resíduos e Efluentes — Abatedouro/Frigorífico",
    categoria: "Biossegurança e Resíduos",
    subtipo: "frigorifico",
    legislacao: "Lei 12.305/2010 (PNRS); CONAMA 430/2011; RIISPOA; Licença Ambiental",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social",                   auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                           auto: true  },
      { nome: "ENDERECO",           label: "Endereço",                       auto: true  },
      { nome: "CIDADE",             label: "Município",                      auto: true  },
      { nome: "UF",                 label: "UF",                             auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                     auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                     auto: true  },
      { nome: "DATA_ATUAL",         label: "Data",                           auto: true  },
      { nome: "NUMERO_SIF",         label: "Nº Registro SIF/SIE/SIM",       auto: false },
      { nome: "EMPRESA_ETE",        label: "Empresa operadora da ETE",       auto: false },
      { nome: "EMPRESA_SUBPRODUTOS",label: "Empresa de subprodutos/graxaria", auto: false },
      { nome: "EMPRESA_RESIDUOS",   label: "Empresa coletora de resíduos",   auto: false },
      { nome: "RESPONSAVEL_LEGAL",  label: "Responsável Legal",              auto: false },
    ],
    conteudo: `PLANO DE GERENCIAMENTO DE RESÍDUOS SÓLIDOS E EFLUENTES
ABATEDOURO / FRIGORÍFICO
Ref.: Lei 12.305/2010 (PNRS); CONAMA 430/2011; RIISPOA; Licença Ambiental

Estabelecimento: {{NOME_CLINICA}} | CNPJ: {{CNPJ}} | Reg.: {{NUMERO_SIF}}
Endereço: {{ENDERECO}} — {{CIDADE}} / {{UF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável Legal: {{RESPONSAVEL_LEGAL}}
Data: {{DATA_ATUAL}}

1. GESTÃO DE EFLUENTES LÍQUIDOS

LINHA VERMELHA — Efluentes do Abate
Origem: Sangue e líquidos das áreas de abate, couro, vísceras e higienização do abate.
Característica: Alta carga orgânica, decomposição rápida, risco sanitário elevado.
Tratamento: ETE dedicada — operada por {{EMPRESA_ETE}}
Parâmetros de lançamento monitorados (CONAMA 430/2011):
  DBO ≤ 120 mg/L | DQO ≤ 300 mg/L | pH entre 5 e 9 | Coliformes termotolerantes ≤ 1.000 NMP/100mL
Frequência de análise do efluente tratado: Mensal
Laudos arquivados por: 5 anos

LINHA VERDE — Efluentes da Recepção e Pátio
Origem: Lavagem de caminhões, pátios de recepção, currais e áreas de condução dos animais.
Característica: Alta concentração de material fecal e orgânico.
Tratamento: Pré-tratamento (gradeamento e caixa de gordura) antes do lançamento na ETE.
Segregação: As linhas vermelha e verde são coletadas e tratadas SEPARADAMENTE.

2. SUBPRODUTOS NÃO COMESTÍVEIS
Destino: {{EMPRESA_SUBPRODUTOS}} (graxaria / farinheira)
Subprodutos: sangue, sebo, ossos, aparas, vísceras não comestíveis
Manifesto de Transporte: emitido a cada coleta — arquivado pelo RT por 5 anos

3. RESÍDUOS SÓLIDOS INDUSTRIAIS
Grupo A (biológicos): saco branco leitoso — empresa licenciada {{EMPRESA_RESIDUOS}}
Grupo B (químicos): empresa especializada — CADRI quando exigido
Grupo D (comuns): coleta seletiva municipal
Grupo E (perfurocortantes): descarpack — empresa licenciada {{EMPRESA_RESIDUOS}}

4. RESPONSABILIDADES
RT: elaboração, revisão anual, supervisão e arquivo dos manifestos
Operação da ETE: {{EMPRESA_ETE}}
Coleta de resíduos: {{EMPRESA_RESIDUOS}}
Subprodutos: {{EMPRESA_SUBPRODUTOS}}

5. REVISÃO
Revisão anual ou sempre que houver alteração no volume/tipo de resíduos ou nas condições da Licença Ambiental.

{{CIDADE}}, {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 18 — RECALL ATUALIZADO COM 9 ELEMENTOS RDC 655/2022
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_RECALL_RDC655_01",
    titulo: "Plano de Recolhimento — Recall (RDC ANVISA 655/2022 — 9 Elementos)",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "RDC ANVISA 655/2022; IN MAPA 161/2022 — PAC 13",
    variaveis: [
      { nome: "NOME_CLINICA",        label: "Razão Social",                  auto: true  },
      { nome: "CNPJ",                label: "CNPJ",                          auto: true  },
      { nome: "RT_NOME",             label: "Nome do RT",                    auto: true  },
      { nome: "RT_CRMV",             label: "CRMV do RT",                    auto: true  },
      { nome: "DATA_ATUAL",          label: "Data",                          auto: true  },
      { nome: "NUMERO_SIF",          label: "Nº Registro SIF/SIE/SIM",      auto: false },
      { nome: "RESPONSAVEL_RECALL",  label: "Responsável pelo recall (nome e cargo)", auto: false },
      { nome: "TELEFONE_EMERGENCIA", label: "Telefone de emergência 24h",    auto: false },
      { nome: "RESPONSAVEL_LEGAL",   label: "Responsável Legal",             auto: false },
    ],
    conteudo: `PLANO DE RECOLHIMENTO DE PRODUTOS — RECALL
Ref.: RDC ANVISA 655/2022; IN MAPA 161/2022 — PAC 13; RIISPOA Art. 74
Estabelecimento: {{NOME_CLINICA}} — CNPJ: {{CNPJ}} | Reg.: {{NUMERO_SIF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Responsável pelo Recall: {{RESPONSAVEL_RECALL}}
Tel. Emergência 24h: {{TELEFONE_EMERGENCIA}} | Data: {{DATA_ATUAL}}

Este plano contempla os 9 elementos obrigatórios estabelecidos pela RDC ANVISA 655/2022.

ELEMENTO 1 — SITUAÇÕES PARA ADOÇÃO DO RECALL
Acionar este plano quando houver:
a) Resultado analítico fora dos padrões (patógenos, resíduos, contaminantes, composição)
b) Reclamações de consumidores com indício fundamentado de dano à saúde
c) Determinação do MAPA, ANVISA, SIF/SIE/SIM ou Vigilância Sanitária
d) Identificação interna de não conformidade crítica em produto já expedido
e) Produto com rotulagem incorreta que possa induzir o consumidor a risco

ELEMENTO 2 — PROCEDIMENTOS PARA RÁPIDO E EFETIVO RECOLHIMENTO
1. Identificar precisamente o lote afetado (número, data de fabricação, validade)
2. Bloquear imediatamente o estoque remanescente na fábrica
3. Contatar distribuidores, varejistas e importadores (quando aplicável) com dados completos do lote
4. Emitir Nota de Devolução para produtos retornados
5. Meta: 100% do lote identificado e bloqueado em até 4 horas do acionamento

ELEMENTO 3 — SEGREGAÇÃO DOS PRODUTOS RECOLHIDOS E DESTINAÇÃO FINAL
Local de segregação: Câmara/área com acesso restrito, identificada "PRODUTO RETIDO — RECALL"
Destinação possível:
[ ] Análise confirmatória → liberação → se conforme
[ ] Reprocessamento → quando tecnicamente viável
[ ] Descarte/inutilização → conforme RIISPOA — com supervisão do SIF
[ ] Devolução ao fornecedor → quando a origem do problema for a matéria-prima

ELEMENTO 4 — COMUNICAÇÃO DO RECOLHIMENTO À CADEIA PRODUTIVA
Destinatários: Distribuidores, revendedores, operadores logísticos, cooperativas
Meio: E-mail com confirmação de recebimento + telefone para casos urgentes
Conteúdo mínimo: nome do produto, lote, data de fabricação, validade, motivo do recall e instruções
Prazo para comunicação: Até 24h do acionamento do plano

ELEMENTO 5 — COMUNICAÇÃO ÀS EMPRESAS IMPORTADORAS (EXPORTAÇÃO)
Quando aplicável (produto já enviado ao exterior):
Contato imediato com o importador no país de destino
Coordenação com o MAPA para comunicação oficial bilateral
Prazo: Imediato — dentro de 24h

ELEMENTO 6 — COMUNICAÇÃO DO RECOLHIMENTO À ANVISA
Notificar a ANVISA conforme RDC 655/2022 com:
- Identificação completa do produto e lote
- Motivo técnico do recall
- Extensão geográfica da distribuição
- Medidas tomadas pelo estabelecimento
Prazo: Conforme prazos específicos da RDC 655/2022 por tipo de risco

ELEMENTO 7 — COMUNICAÇÃO DO RECOLHIMENTO AO SIF/ÓRGÃO DE INSPEÇÃO
Notificar imediatamente o SIF local com:
- Relatório técnico do problema identificado
- Ações tomadas
- Atualização diária do status do recolhimento

ELEMENTO 8 — COMUNICAÇÃO DO RECOLHIMENTO AOS CONSUMIDORES
Quando risco à saúde identificado:
Mensagem de alerta conforme modelo abaixo:

"AVISO DE RECOLHIMENTO — [NOME DO PRODUTO]
A empresa [{{NOME_CLINICA}}] informa o recolhimento voluntário do produto [nome do produto],
lote [número], com validade [data], fabricado em [data].
MOTIVO: [breve descrição técnica]
O QUE FAZER: Não consumir o produto. Devolver ao local de compra ou descartar.
Dúvidas: [telefone de emergência {{TELEFONE_EMERGENCIA}}]"

Canais: Redes sociais da empresa, SAC, varejistas, imprensa (quando necessário)

ELEMENTO 9 — RESPONSÁVEIS PELA EXECUÇÃO DO PLANO
Coordenador: {{RESPONSAVEL_RECALL}} | {{TELEFONE_EMERGENCIA}}
RT: {{RT_NOME}} — {{RT_CRMV}}
Responsável Legal: {{RESPONSAVEL_LEGAL}}

SIMULAÇÃO ANUAL OBRIGATÓRIA (PAC 13)
Data da última simulação: ____/____/______ | Resultado: _______________
Ações corretivas identificadas: _______________
Próxima simulação programada: ____/____/______

{{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ {{RESPONSAVEL_LEGAL}} | Responsável Legal`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 20 — TERMO DE REGISTRO DE CRUELDADE (Res. CFMV 1.236/2018)
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_TERMO_CRUELDADE_01",
    titulo: "Termo de Registro de Constatação de Crueldade ou Maus-Tratos a Animais",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "Res. CFMV 1.236/2018; Lei 9.605/1998 Art. 32; RIISPOA; Portaria MAPA 365/2021",
    variaveis: [
      { nome: "NOME_CLINICA",       label: "Razão Social",                   auto: true  },
      { nome: "CNPJ",               label: "CNPJ",                           auto: true  },
      { nome: "RT_NOME",            label: "Nome do RT",                     auto: true  },
      { nome: "RT_CRMV",            label: "CRMV do RT",                     auto: true  },
      { nome: "DATA_ATUAL",         label: "Data e hora do registro",        auto: true  },
      { nome: "SMART_ID",           label: "Smart ID",                       auto: true  },
      { nome: "NUMERO_SIF",         label: "Nº Registro SIF/SIE/SIM",       auto: false },
      { nome: "DESCRICAO_FATO",     label: "Descrição detalhada do fato",    auto: false },
      { nome: "LOCAL_OCORRENCIA",   label: "Local da ocorrência nas instalações", auto: false },
      { nome: "IDENTIFICACAO_TESTEMUNHAS", label: "Testemunhas (nome e função)", auto: false },
      { nome: "ACOES_IMEDIATAS",    label: "Ações imediatas tomadas",        auto: false },
      { nome: "ORGAO_NOTIFICADO",   label: "Órgão notificado (SIF/MAPA/Polícia)", auto: false },
    ],
    conteudo: `TERMO DE REGISTRO DE CONSTATAÇÃO DE CRUELDADE OU MAUS-TRATOS A ANIMAIS
Ref.: Res. CFMV 1.236/2018; Lei 9.605/1998 Art. 32; Portaria MAPA 365/2021
Smart ID: {{SMART_ID}} | Data e Hora: {{DATA_ATUAL}}

Estabelecimento: {{NOME_CLINICA}} — CNPJ: {{CNPJ}} | Reg.: {{NUMERO_SIF}}
RT Registrador: {{RT_NOME}} — {{RT_CRMV}}

1. DESCRIÇÃO DO FATO CONSTATADO
Local da ocorrência: {{LOCAL_OCORRENCIA}}
Descrição: {{DESCRICAO_FATO}}

2. TESTEMUNHAS
{{IDENTIFICACAO_TESTEMUNHAS}}

3. AÇÕES IMEDIATAS TOMADAS
{{ACOES_IMEDIATAS}}

4. NOTIFICAÇÃO AOS ÓRGÃOS COMPETENTES
Conforme a Res. CFMV 1.236/2018, o Médico Veterinário é obrigado a registrar e comunicar
constatações de crueldade ou maus-tratos aos animais. Notificação realizada a:
{{ORGAO_NOTIFICADO}} | Data da notificação: ____/____/______ | Protocolo: _______________

5. DECLARAÇÃO DO RT
Declaro que as informações acima são verídicas e que este registro é feito em cumprimento
à obrigação ética e legal do Médico Veterinário Responsável Técnico, conforme:
- Res. CFMV 1.236/2018 (obrigatoriedade de comunicação)
- Lei 9.605/1998 Art. 32 (crimes ambientais — maus-tratos a animais)
- Portaria MAPA 365/2021 (abate humanitário)

Este documento deve ser arquivado no Livro de Registro do RT e cópia encaminhada ao
SIF e ao CRMV estadual.

___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico
___________________ _________________________ | Representante Legal — Ciente em: ____/____/______
___________________ _________________________ | Testemunha`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 16 — POP DO LIVRO DIGITAL DE OCORRÊNCIAS DO RT
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_LIVRO_RT_01",
    titulo: "POP — Livro de Registro e Ocorrências do RT (Sistema Digital Auditável)",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "Res. CFMV — ART; RIISPOA Art. 74; Aspectos Gerais — Diretrizes CFMV 2023",
    variaveis: [
      { nome: "NOME_CLINICA",    label: "Razão Social",           auto: true  },
      { nome: "RT_NOME",         label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",         label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",      label: "Data",                   auto: true  },
      { nome: "NUMERO_SIF",      label: "Nº Registro SIF/SIE/SIM", auto: false },
    ],
    conteudo: `POP — LIVRO DE REGISTRO E OCORRÊNCIAS DO RT
Estabelecimento: {{NOME_CLINICA}} | Reg.: {{NUMERO_SIF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Data: {{DATA_ATUAL}}
Ref.: Res. CFMV — ART; RIISPOA Art. 74; Diretrizes CFMV/CRMVs — 1ª Ed. 2023

1. OBJETIVO
Estabelecer o padrão de registro das visitas técnicas, orientações à diretoria,
não conformidades e ocorrências, garantindo auditabilidade e rastreabilidade jurídica.

2. OBRIGATORIEDADE
O Livro de Registro é o maior respaldo jurídico do RT em caso de autuações ou
sindicâncias. Toda visita e toda orientação prestada DEVE ser registrada.

3. CONTEÚDO MÍNIMO DE CADA REGISTRO
- Data e horário de entrada e saída
- Atividades realizadas na visita
- Orientações prestadas à diretoria/responsável
- Não conformidades identificadas
- Prazos estabelecidos para ações corretivas
- Status das não conformidades anteriores (resolvidas ou pendentes)
- Assinatura do RT e do representante legal presente

4. SISTEMA DIGITAL — REQUISITOS DE AUDITABILIDADE (RIISPOA Art. 74 §1)
O sistema digital utilizado para o Livro de Registro deve garantir:
[ ] Autenticação: acesso restrito por credenciais do RT (login + senha ou certificado digital)
[ ] Imutabilidade: registros não podem ser editados após assinatura sem trilha de auditoria
[ ] Trilha de auditoria: qualquer alteração registra data, hora e quem alterou
[ ] Disponibilidade: acesso pelo SIF quando solicitado
[ ] Backup: cópia de segurança automática com periodicidade definida

5. EXPORTAÇÃO PARA O CRMV
Mensalmente: exportar relatório de visitas para compor o Relatório Mensal de Atividades do RT
Anualmente: disponibilizar o histórico completo quando solicitado pelo CRMV para fins de ART

6. GUARDA
O Livro de Registro deve ser mantido por no mínimo 5 anos (analogia com os laudos
de laboratório — Res. CFMV 1.374/2020).

{{NOME_CLINICA}} — {{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico`,
  },

  // ════════════════════════════════════════════════════════════
  // GAP 12 — CADASTRO DE PRODUTORES
  // ════════════════════════════════════════════════════════════
  {
    id: "POA_DOC_CADASTRO_PROD_01",
    titulo: "Cadastro de Produtores e Fornecedores de Matéria-Prima",
    categoria: "Compliance e Jurídico",
    subtipo: "producao_origem_animal",
    legislacao: "RIISPOA Art. 74; Portaria MAPA 558/2022; SISBI-POA",
    variaveis: [
      { nome: "NOME_CLINICA",   label: "Razão Social",           auto: true  },
      { nome: "CNPJ",           label: "CNPJ",                   auto: true  },
      { nome: "NUMERO_SIF",     label: "Nº Registro SIF/SIE/SIM", auto: false },
      { nome: "RT_NOME",        label: "Nome do RT",             auto: true  },
      { nome: "RT_CRMV",        label: "CRMV do RT",             auto: true  },
      { nome: "DATA_ATUAL",     label: "Data de revisão",        auto: true  },
    ],
    conteudo: `CADASTRO DE PRODUTORES E FORNECEDORES DE MATÉRIA-PRIMA
Ref.: RIISPOA Art. 74; SISBI-POA; Portaria MAPA 558/2022

Estabelecimento: {{NOME_CLINICA}} | CNPJ: {{CNPJ}} | Reg.: {{NUMERO_SIF}}
RT: {{RT_NOME}} — {{RT_CRMV}} | Data de revisão: {{DATA_ATUAL}}

REQUISITOS PARA QUALIFICAÇÃO DE FORNECEDOR
Todo fornecedor de matéria-prima de origem animal deve atender:
[ ] Registro ativo no SIF/SIE/SIM ou equivalência reconhecida pelo MAPA (SISBI-POA)
[ ] Laudo de análise da matéria-prima dentro do período de validade
[ ] GTA (Guia de Trânsito Animal) válida para cada movimentação (quando aplicável)
[ ] Nenhum embargo ou interdição ativa pelo MAPA ou Vigilância Sanitária

TABELA DE FORNECEDORES ATIVOS
(Preencher e manter atualizado — revisão mínima semestral)

Fornecedor | CNPJ/CPF | Reg. Inspeção | Produto | Laudo vigente até | Status
___________|__________|_______________|_________|___________________|_______
           |          |               |         |                   | Ativo
           |          |               |         |                   | Ativo
           |          |               |         |                   | Ativo

PROCEDIMENTO DE QUALIFICAÇÃO DE NOVO FORNECEDOR
1. Solicitar documentação: CNPJ, registro no órgão de inspeção, laudo de análise
2. Verificar equivalência no SISBI-POA (quando fornecedor estadual ou municipal)
3. Realizar visita técnica ou análise de produto antes da aprovação (quando possível)
4. Aprovar formalmente com assinatura do RT
5. Inserir na tabela acima com data de qualificação

PROCEDIMENTO DE SUSPENSÃO DE FORNECEDOR
Suspender imediatamente quando:
- Laudo de análise fora dos padrões
- Embargo ou interdição pelo MAPA
- Rejeição de mais de 2 lotes consecutivos
- Cancelamento do registro no órgão de inspeção

Fornecedor suspenso não pode fornecer MP até regularização comprovada.

{{DATA_ATUAL}}
___________________ {{RT_NOME}} — {{RT_CRMV}} | Responsável Técnico`,
  },
];

async function seed() {
  console.log(`\nSeed de ${TEMPLATES.length} templates (resolução de gaps)...\n`);
  const batch = db.batch();
  for (const t of TEMPLATES) {
    batch.set(db.collection("template").doc(t.id), {
      ...t, criadoEm: admin.firestore.FieldValue.serverTimestamp(), ativo: true,
    });
    console.log(`  ✅ ${t.id}: ${t.titulo}`);
  }
  await batch.commit();
  console.log("\nConcluído!");
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });
