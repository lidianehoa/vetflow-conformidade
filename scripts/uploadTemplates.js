/**
 * uploadTemplates.js
 * Script de upload de templates para o Firestore — VetFlow Conformidade
 *
 * USO:
 *   node scripts/uploadTemplates.js
 *
 * Requer: dotenv instalado (npm install dotenv)
 * Lê as credenciais do .env na raiz do projeto.
 * Usa o Firebase REST API (sem Admin SDK) — compatível com o ambiente Vite.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// Carregar .env manualmente
const envFile = readFileSync(resolve(rootDir, ".env"), "utf-8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("=").map((p) => p.trim()))
);

const PROJECT_ID = env.VITE_FIREBASE_PROJECT_ID;
const API_KEY    = env.VITE_FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error("❌ Preencha VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_API_KEY no .env");
  process.exit(1);
}

// URL base do Firestore REST
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Templates a fazer upload ─────────────────────────────────────────────────

const TEMPLATES = [
  {
    id: "manual_pac_industria_poa",
    nome: "Manual PAC — Programas de Autocontrole",
    categoria: "INDUSTRIA POA",
    subcategoria: "PAC / PPHO",
    origem: "template",
    area: "industria_poa",
    ref: "RIISPOA / Circular DIPOA 175/2005 / IN MAPA",
    conteudo: gerarConteudoPAC(),
  },
  {
    id: "ppho_higiene_operacional",
    nome: "PPHO — Procedimento Padrão de Higiene Operacional",
    categoria: "INDUSTRIA POA",
    subcategoria: "PAC / PPHO",
    origem: "template",
    area: "industria_poa",
    ref: "RIISPOA / Circular DIPOA 175/2005 / RDC ANVISA 216/2004",
    conteudo: gerarConteudoPPHO(),
  },
  {
    id: "plano_appcc",
    nome: "Plano APPCC (Análise de Perigos e Pontos Críticos de Controle)",
    categoria: "INDUSTRIA POA",
    subcategoria: "HACCP / APPCC",
    origem: "template",
    area: "industria_poa",
    ref: "Portaria MS 1.428/1993 / Codex Alimentarius",
    conteudo: gerarConteudoAPPCC(),
  },
  {
    id: "memorial_descritivo_fabricacao",
    nome: "Memorial Descritivo de Fabricação",
    categoria: "INDUSTRIA POA",
    subcategoria: "Registro de Produtos",
    origem: "template",
    area: "industria_poa",
    ref: "RIISPOA / Regulamento Técnico de Identidade e Qualidade (RTIQ)",
    conteudo: gerarConteudoMemorial(),
  },
];

// ─── Gera o conteúdo textual do Manual PAC com {{variáveis}} ─────────────────

function gerarConteudoPAC() {
  return `MANUAL DE PROGRAMAS DE AUTOCONTROLE (PAC)
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO DO ESTABELECIMENTO
Razão Social: {{NOME_EMPRESA}}
Endereço: {{ENDERECO}}
Atividade Principal: {{ATIVIDADE_PRINCIPAL}}
Registro: {{TIPO_REGISTRO}} nº {{NUMERO_REGISTRO}}

RESPONSÁVEL TÉCNICO
Nome: {{RT_NOME}}
CRMV: {{RT_CRMV}}
Data de Elaboração: {{DATA_ELABORACAO}}
Revisão: Anual ou quando houver alteração no processo

═══════════════════════════════════════════════════════════
SEÇÃO 1 — INTRODUÇÃO E OBJETIVO
═══════════════════════════════════════════════════════════

Este manual descreve os procedimentos de autocontrole implementados
no estabelecimento {{NOME_EMPRESA}} para garantir a inocuidade,
identidade e qualidade dos produtos de origem animal, em conformidade
com as normas federais e estaduais vigentes.

Ref.: RIISPOA (Decreto 9.013/2017) / Circular DIPOA 175/2005 / IN MAPA

═══════════════════════════════════════════════════════════
SEÇÃO 2 — ESTRUTURA PADRÃO DE CADA PAC
═══════════════════════════════════════════════════════════

Para cada programa, o RT deve registrar:
  • OBJETIVO         — O que o programa pretende garantir
  • ESCOPO           — Quais áreas ou processos estão abrangidos
  • RESPONSABILIDADE — Quem executa e quem fiscaliza
  • PROCEDIMENTO     — O passo a passo da operação
  • MONITORAMENTO    — O que, como, frequência e quem verifica
  • AÇÃO CORRETIVA   — O que fazer quando algo sai do padrão
  • VERIFICAÇÃO      — Como o RT garante que o monitoramento é feito
  • REGISTROS        — Quais planilhas/formulários documentam o programa

═══════════════════════════════════════════════════════════
SEÇÃO 3 — PROGRAMAS DE AUTOCONTROLE (PACs)
═══════════════════════════════════════════════════════════

PAC 01 — MANUTENÇÃO DAS INSTALAÇÕES E EQUIPAMENTOS
Descrição: Manutenção preventiva de máquinas e estrutura física
           (pisos, tetos, paredes, ralos e drenos).
Objetivo: {{PAC01_OBJETIVO}}
Responsável: {{PAC01_RESPONSAVEL}}
Frequência de Monitoramento: {{PAC01_FREQUENCIA}}
Registros: {{PAC01_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 02 — VESTUÁRIOS, HIGIENE E HÁBITOS HIGIÊNICOS
Descrição: Controle de uniformes, exames médicos dos funcionários
           e conduta sanitária pessoal.
Objetivo: {{PAC02_OBJETIVO}}
Responsável: {{PAC02_RESPONSAVEL}}
Frequência de Monitoramento: {{PAC02_FREQUENCIA}}
Registros: {{PAC02_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 03 — ILUMINAÇÃO
Descrição: Proteção das lâmpadas contra quedas e intensidade
           luminosa adequada (≥540 lux nas áreas de manipulação).
Objetivo: {{PAC03_OBJETIVO}}
Responsável: {{PAC03_RESPONSAVEL}}
Frequência: {{PAC03_FREQUENCIA}}
Registros: {{PAC03_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 04 — VENTILAÇÃO
Descrição: Controle de condensação e renovação de ar nas áreas
           de manipulação e câmaras.
Objetivo: {{PAC04_OBJETIVO}}
Responsável: {{PAC04_RESPONSAVEL}}
Frequência: {{PAC04_FREQUENCIA}}
Registros: {{PAC04_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 05 — ÁGUAS RESIDUÁRIAS
Descrição: Sistema de esgoto, caixas de gordura e tratamento
           de efluentes industriais.
Objetivo: {{PAC05_OBJETIVO}}
Responsável: {{PAC05_RESPONSAVEL}}
Frequência: {{PAC05_FREQUENCIA}}
Registros: {{PAC05_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 06 — CALIBRAÇÃO DE EQUIPAMENTOS E INSTRUMENTOS
Descrição: Plano de calibração de balanças, termômetros,
           manômetros e equipamentos de medição.
Objetivo: {{PAC06_OBJETIVO}}
Responsável: {{PAC06_RESPONSAVEL}}
Frequência: {{PAC06_FREQUENCIA}}
Registros: {{PAC06_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 07 — PPHO — PROCEDIMENTO PADRÃO DE HIGIENE OPERACIONAL
Descrição: Detalhamento da limpeza pré-operacional e operacional
           de superfícies, utensílios e equipamentos.
Objetivo: {{PAC07_OBJETIVO}}
Responsável: {{PAC07_RESPONSAVEL}}
Frequência: {{PAC07_FREQUENCIA}}
Registros: {{PAC07_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 08 — ABASTECIMENTO DE ÁGUA (POTABILIDADE)
Descrição: Cloração, limpeza de reservatórios e análises
           laboratoriais de potabilidade.
Objetivo: {{PAC08_OBJETIVO}}
Responsável: {{PAC08_RESPONSAVEL}}
Frequência: {{PAC08_FREQUENCIA}}
Laudos Laboratoriais: {{PAC08_LAUDOS}}
Registros: {{PAC08_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 09 — CONTROLE INTEGRADO DE PRAGAS
Descrição: Barreiras físicas, controle químico com iscas e
           mapas de distribuição de iscas.
Objetivo: {{PAC09_OBJETIVO}}
Empresa Terceirizada: {{PAC09_EMPRESA}}
Frequência: {{PAC09_FREQUENCIA}}
Registros: {{PAC09_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 10 — CONTROLE DE MATÉRIA-PRIMA, INGREDIENTES E EMBALAGENS
Descrição: Critérios de recepção, homologação de fornecedores
           qualificados e armazenamento adequado.
Objetivo: {{PAC10_OBJETIVO}}
Responsável: {{PAC10_RESPONSAVEL}}
Frequência: {{PAC10_FREQUENCIA}}
Registros: {{PAC10_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 11 — TEMPERATURAS
Descrição: Monitoramento de câmaras frias, túneis de congelamento,
           expedição e temperatura interna do produto final.
Objetivo: {{PAC11_OBJETIVO}}
Limites Críticos: {{PAC11_LIMITES}}
Responsável: {{PAC11_RESPONSAVEL}}
Frequência: {{PAC11_FREQUENCIA}}
Registros: {{PAC11_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 12 — BEM-ESTAR ANIMAL (se aplicável)
Descrição: Manejo pré-abate, insensibilização humanitária
           e sangria eficiente.
Objetivo: {{PAC12_OBJETIVO}}
Responsável: {{PAC12_RESPONSAVEL}}
Frequência: {{PAC12_FREQUENCIA}}
Registros: {{PAC12_REGISTROS}}

───────────────────────────────────────────────────────────
PAC 13 — RASTREABILIDADE E RECOLHIMENTO (RECALL)
Descrição: Identificação de lotes e plano de ação para
           retirada de produtos do mercado.
Objetivo: {{PAC13_OBJETIVO}}
Responsável pelo Recall: {{PAC13_RESPONSAVEL}}
Frequência de Simulacros: {{PAC13_FREQUENCIA}}
Registros: {{PAC13_REGISTROS}}

═══════════════════════════════════════════════════════════
SEÇÃO 4 — REGISTRO DE MONITORAMENTO (PLANILHA MODELO)
═══════════════════════════════════════════════════════════

Data     | PAC  | Desvio Encontrado               | Ação Corretiva          | Responsável       | Visto RT
---------|------|----------------------------------|-------------------------|-------------------|----------
__/__    | 11   | Câmara 02 — temp. acima de 4°C  | Ajuste compressor/degelo| {{RT_NOME}}       | ___________

═══════════════════════════════════════════════════════════
SEÇÃO 5 — APROVAÇÃO E VIGÊNCIA
═══════════════════════════════════════════════════════════

Este documento entra em vigor em {{DATA_VIGENCIA}} e será revisado
anualmente ou sempre que houver alteração nos processos tecnológicos
da unidade.

Local: {{NOME_EMPRESA}}, {{DATA_ELABORACAO}}

_______________________________________________
{{RT_NOME}}
Responsável Técnico — CRMV: {{RT_CRMV}}

HASH VETFLOW: {{HASH}} | Ref.: RIISPOA / IN MAPA | Smart ID: {{SMART_ID}}`;
}

// ─── Gera o conteúdo textual do PPHO com {{variáveis}} ───────────────────────

function gerarConteudoPPHO() {
  return `PROCEDIMENTO PADRÃO DE HIGIENE OPERACIONAL (PPHO)
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO DO ESTABELECIMENTO
Razão Social: {{NOME_EMPRESA}}
Registro: {{TIPO_REGISTRO}} nº {{NUMERO_REGISTRO}}
Área/Setor de Aplicação: {{AREA_SETOR}}

RESPONSÁVEL TÉCNICO
Nome: {{RT_NOME}}
CRMV: {{RT_CRMV}}
Data de Elaboração: {{DATA_ELABORACAO}}
Versão: {{VERSAO}}

Ref.: RIISPOA (Decreto 9.013/2017) / Circular DIPOA 175/2005 / RDC ANVISA 216/2004

═══════════════════════════════════════════════════════════
SEÇÃO 1 — OBJETIVO
═══════════════════════════════════════════════════════════

Estabelecer os procedimentos de limpeza e sanitização das instalações,
equipamentos e utensílios do setor {{AREA_SETOR}}, de forma a evitar
a contaminação cruzada e garantir a higiene dos produtos manipulados
no estabelecimento {{NOME_EMPRESA}}.

═══════════════════════════════════════════════════════════
SEÇÃO 2 — RESPONSABILIDADE
═══════════════════════════════════════════════════════════

  Execução:      Equipe de Higienização — {{RESPONSAVEL_EXECUCAO}}
  Monitorização: {{RESPONSAVEL_MONITORAMENTO}}
  Verificação:   {{RT_NOME}} (RT) / {{RESPONSAVEL_QUALIDADE}}

═══════════════════════════════════════════════════════════
SEÇÃO 3 — PROCEDIMENTOS PRÉ-OPERACIONAIS
═══════════════════════════════════════════════════════════

Realizados ANTES do início das atividades ou após o turno anterior.

3.1 ETAPAS DE HIGIENIZAÇÃO DE EQUIPAMENTOS E SUPERFÍCIES

  ETAPA 1 — REMOÇÃO DE RESÍDUOS GROSSEIROS
  Retirada manual de restos de matéria-prima, gorduras e detritos
  com auxílio de rodo, espátula ou vassoura adequada.

  ETAPA 2 — PRÉ-ENXAGUAMENTO
  Água a temperatura ambiente ou aquecida (conforme o setor) para
  remoção de sujidades remanescentes. Pressão: {{PRESSAO_AGUA}} bar.

  ETAPA 3 — LAVAGEM COM DETERGENTE
  Tipo de Detergente: {{TIPO_DETERGENTE}} (Alcalino / Ácido / Neutro)
  Concentração: {{CONCENTRACAO_DETERGENTE}}%
  Tempo de Contato: {{TEMPO_DETERGENTE}} minutos
  Modo de Aplicação: {{MODO_APLICACAO_DETERGENTE}}

  ETAPA 4 — ENXAGUAMENTO
  Remoção total do detergente com água potável corrente.
  Temperatura mínima da água: {{TEMP_ENXAGUAMENTO}}°C

  ETAPA 5 — SANITIZAÇÃO
  Agente Sanitizante: {{AGENTE_SANITIZANTE}}
    (Ex.: Quaternário de Amônia / Cloro Ativo / Ácido Peracético)
  Concentração: {{CONCENTRACAO_SANITIZANTE}} ppm / %
  Tempo de Contato: {{TEMPO_SANITIZANTE}} minutos
  Requer enxaguamento posterior: {{REQUER_ENXAGUAMENTO}}

═══════════════════════════════════════════════════════════
SEÇÃO 4 — PROCEDIMENTOS OPERACIONAIS (Durante as Atividades)
═══════════════════════════════════════════════════════════

Realizados durante os intervalos de turno ou após contaminação acidental.

  • HIGIENIZAÇÃO DE UTENSÍLIOS
    Facas, ganchos e bandejas devem ser lavados e sanitizados sempre
    que tocarem no solo ou superfícies não higienizadas.
    Responsável: {{RESPONSAVEL_UTENSILIOS}}

  • RECOLHA DE RESÍDUOS
    Retirada contínua de subprodutos e resíduos das áreas de passagem.
    Frequência: {{FREQUENCIA_RESIDUOS}}

  • HIGIENE DAS MÃOS
    Lavagem e antissepsia obrigatórias ao entrar na sala, ao trocar de
    atividade ou após uso de sanitários.
    Produto antisséptico: {{PRODUTO_ANTISSEPTICO}}

═══════════════════════════════════════════════════════════
SEÇÃO 5 — MONITORIZAÇÃO E FREQUÊNCIA
═══════════════════════════════════════════════════════════

Item Monitorado      | O que Verificar                | Frequência       | Método
---------------------|--------------------------------|------------------|-------------------
Pisos e Paredes      | Ausência de resíduos/bolores   | Diário (Pré-Op)  | Visual
Equipamentos         | Ausência de gordura e odores   | Diário (Pré-Op)  | Visual e Olfativo
Drenos/Ralos         | Fluxo de escoamento e limpeza  | Semanal          | Visual
Eficácia Química     | Resíduo de sanitizante / ATP   | Mensal           | Swab / Teste Químico

Responsável pela monitorização: {{RESPONSAVEL_MONITORAMENTO}}

═══════════════════════════════════════════════════════════
SEÇÃO 6 — AÇÕES CORRETIVAS
═══════════════════════════════════════════════════════════

Gatilho: Sempre que for detectada falha na higienização
         (presença de resíduos visuais, odores ou resultado positivo no swab).

  1. Identificar o equipamento/área com placa de "BLOQUEADO".
  2. Repetir todo o processo (Etapas 1 a 5).
  3. Treinar novamente o colaborador responsável pela falha.
  4. Registrar o desvio no Relatório de Monitorização (Planilha 02).

Responsável pela ação corretiva: {{RESPONSAVEL_ACAO_CORRETIVA}}

═══════════════════════════════════════════════════════════
SEÇÃO 7 — REGISTROS RELACIONADOS
═══════════════════════════════════════════════════════════

  Planilha 01 — Monitorização Pré-Operacional de Higiene
  Planilha 02 — Registro de Ações Corretivas
  Planilha 03 — Controle de Concentração de Soluções Químicas

Arquivo: {{LOCAL_ARQUIVO}} | Retenção mínima: {{RETENCAO_REGISTROS}} anos

═══════════════════════════════════════════════════════════
SEÇÃO 8 — APROVAÇÃO E REVISÃO
═══════════════════════════════════════════════════════════

Versão  | Data       | Alteração        | Elaborado por        | Aprovado por (RT)
--------|------------|------------------|----------------------|--------------------
{{VERSAO}} | {{DATA_ELABORACAO}} | {{DESCRICAO_REVISAO}} | {{ELABORADO_POR}} | {{RT_NOME}} / {{RT_CRMV}}

Este documento entra em vigor em {{DATA_VIGENCIA}}.

Local: {{NOME_EMPRESA}}, {{DATA_ELABORACAO}}

_______________________________________________
{{RT_NOME}}
Responsável Técnico — CRMV: {{RT_CRMV}}

HASH VETFLOW: {{HASH}} | Smart ID: {{SMART_ID}}
Ref.: RIISPOA / Circular DIPOA 175/2005 / RDC ANVISA 216/2004`;
}

// ─── Gera o conteúdo textual do Plano APPCC com {{variáveis}} ────────────────

function gerarConteudoAPPCC() {
  return `PLANO APPCC (Análise de Perigos e Pontos Críticos de Controle)
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO DO ESTABELECIMENTO
Razão Social: {{NOME_EMPRESA}}
Serviço de Inspeção: {{TIPO_REGISTRO}} nº {{NUMERO_REGISTRO}}
Produto / Linha de Produção: {{PRODUTO_LINHA}}

RESPONSÁVEL TÉCNICO
Nome: {{RT_NOME}}
CRMV: {{RT_CRMV}}
Data de Validação: {{DATA_VALIDACAO}}

Ref.: Portaria MS 1.428/1993 / Codex Alimentarius / RDC ANVISA 275/2002

═══════════════════════════════════════════════════════════
SEÇÃO 1 — EQUIPE APPCC
═══════════════════════════════════════════════════════════

Relação dos profissionais multidisciplinares responsáveis pelo plano:

• {{MEMBRO_COORDENADOR}} — Coordenador do Plano (Responsável Técnico)
• {{MEMBRO_PRODUCAO}} — Implementação Operacional (Gerente de Produção)
• {{MEMBRO_QUALIDADE}} — Monitorização e Verificação (Qualidade)

═══════════════════════════════════════════════════════════
SEÇÃO 2 — DESCRIÇÃO DO PRODUTO E USO ESPERADO
═══════════════════════════════════════════════════════════

Produto: {{NOME_PRODUTO}}

CARACTERÍSTICAS FÍSICO-QUÍMICAS:
Descrição: {{DESC_CARACTERISTICAS}}
• pH: {{PARAM_PH}}
• Atividade de Água (Aw): {{PARAM_AW}}
• Teor de Sal: {{PARAM_SAL}}

EMBALAGEM E VIDA ÚTIL:
Tipo de Embalagem: {{TIPO_EMBALAGEM}}
Vida Útil: {{VIDA_UTIL_DIAS}} dias a {{VIDA_UTIL_TEMP}}°C

USO ESPERADO:
Uso Esperado: {{USO_ESPERADO}}
Público-Alvo: {{PUBLICO_ALVO}}

═══════════════════════════════════════════════════════════
SEÇÃO 3 — FLUXOGRAMA DO PROCESSO
═══════════════════════════════════════════════════════════

Etapas sequenciais validadas "in loco":
1. Recepção de Matéria-Prima
2. Armazenagem Fria
3. Corte/Manipulação
4. Salga (se aplicável)
5. Embalagem
6. Estocagem Final
7. Expedição

(O fluxograma detalhado da unidade deve estar anexo a este plano)

═══════════════════════════════════════════════════════════
SEÇÃO 4 — ANÁLISE DE PERIGOS E MEDIDAS PREVENTIVAS
═══════════════════════════════════════════════════════════

Legenda: (B) Biológico | (Q) Químico | (F) Físico

ETAPA: Recepção
Perigo: Salmonella spp. (B)
Severidade: Alta | Probabilidade: Média
Medida Preventiva: {{MEDIDA_RECEPCAO}}
É PCC? SIM — Referência: PCC 1

ETAPA: Corte
Perigo: Fragmentos de Metal (F)
Severidade: Média | Probabilidade: Baixa
Medida Preventiva: {{MEDIDA_CORTE}}
É PCC? NÃO — Referência: PAC

ETAPA: Expedição
Perigo: Multiplicação Bacteriana (B)
Severidade: Alta | Probabilidade: Alta
Medida Preventiva: {{MEDIDA_EXPEDICAO}}
É PCC? SIM — Referência: PCC 2

═══════════════════════════════════════════════════════════
SEÇÃO 5 — RESUMO DO PLANO APPCC (CONTROLE DE PCCs)
═══════════════════════════════════════════════════════════

PCC 1 — RECEPÇÃO
Descrição: Temperatura da Matéria-Prima
Limite Crítico: {{LIMITE_CRITICO_PCC1}} (Máx: {{TEMP_MAX_PCC1}}°C)
Monitorização:
  O que: {{MONIT_O_QUE_PCC1}}
  Como: {{MONIT_COMO_PCC1}}
  Frequência: {{MONIT_FREQ_PCC1}}
  Quem: {{MONIT_QUEM_PCC1}}
Ação Corretiva: {{ACAO_CORRETIVA_PCC1}}
Verificação: {{VERIFICACAO_PCC1}}

───────────────────────────────────────────────────────────
PCC 2 — PASTEURIZAÇÃO / COZIMENTO (Se aplicável)
Descrição: Binômio Tempo x Temperatura
Limite Crítico: {{LIMITE_CRITICO_PCC2}} ({{TEMP_PCC2}}°C por {{TEMPO_PCC2}}s)
Monitorização:
  O que: {{MONIT_O_QUE_PCC2}}
  Como: {{MONIT_COMO_PCC2}}
  Frequência: {{MONIT_FREQ_PCC2}}
  Quem: {{MONIT_QUEM_PCC2}}
Ação Corretiva: {{ACAO_CORRETIVA_PCC2}}
Verificação: {{VERIFICACAO_PCC2}}

═══════════════════════════════════════════════════════════
SEÇÃO 6 — PROCEDIMENTOS DE VERIFICAÇÃO
═══════════════════════════════════════════════════════════

• Calibração: Certificar que todos os instrumentos de monitorização estão calibrados.
• Análises Laboratoriais: Realização de swabs de superfície e análises microbiológicas do produto acabado.
• Auditoria Interna: Verificação semestral de todo o sistema APPCC.

═══════════════════════════════════════════════════════════
SEÇÃO 7 — SISTEMA DE REGISTROS E DOCUMENTAÇÃO
═══════════════════════════════════════════════════════════

Documentos mantidos no local para fiscalização:
• Planilhas de monitorização de PCC
• Relatórios de ações corretivas
• Atas de validação do fluxograma e do plano APPCC

═══════════════════════════════════════════════════════════
SEÇÃO 8 — APROVAÇÃO
═══════════════════════════════════════════════════════════

Este Plano APPCC foi validado em {{DATA_VALIDACAO}} e sua eficácia é garantida
pela assinatura abaixo.

_______________________________________________
{{RT_NOME}}
Médico Veterinário Responsável Técnico
CRMV: {{RT_CRMV}}

HASH VETFLOW: {{HASH}} | Smart ID: {{SMART_ID}}`;
}

// ─── Gera o conteúdo textual do Memorial Descritivo com {{variáveis}} ────────

function gerarConteudoMemorial() {
  return `MEMORIAL DESCRITIVO DE FABRICAÇÃO E COMPOSIÇÃO
═══════════════════════════════════════════════════════════

IDENTIFICAÇÃO DO ESTABELECIMENTO E PRODUTO
Razão Social: {{NOME_EMPRESA}}
Serviço de Inspeção: {{TIPO_REGISTRO}} nº {{NUMERO_REGISTRO}}
Data de Emissão: {{DATA_EMISSAO}}

Produto: {{NOME_PRODUTO}}
Marca Comercial: {{MARCA_COMERCIAL}}
Classificação/Categoria: {{CLASSIFICACAO_CATEGORIA}}

Ref.: RIISPOA / Regulamento Técnico de Identidade e Qualidade (RTIQ)

═══════════════════════════════════════════════════════════
SEÇÃO 1 — COMPOSIÇÃO E FORMULAÇÃO
═══════════════════════════════════════════════════════════

Ingredientes listados em ordem decrescente de quantidade:

1. {{INGREDIENTE_1}} ({{FUNCAO_1}}) — {{PERCENTUAL_1}}%
2. {{INGREDIENTE_2}} ({{FUNCAO_2}}) — {{PERCENTUAL_2}}%
3. {{INGREDIENTE_3}} ({{FUNCAO_3}}) — {{PERCENTUAL_3}}%
TOTAL: 100%

═══════════════════════════════════════════════════════════
SEÇÃO 2 — DESCRIÇÃO DO PROCESSO DE FABRICAÇÃO
═══════════════════════════════════════════════════════════

1. RECEPÇÃO
Descrição: Verificação de temperatura, aspectos sensoriais e documentação sanitária.
Detalhes: {{DESC_RECEPCAO}}

2. PREPARAÇÃO / CORTE
Descrição: {{DESC_PREPARACAO}}

3. PROCESSAMENTO
Descrição: {{DESC_PROCESSAMENTO}}
Parâmetros: {{TEMP_PROCESSAMENTO}}°C por {{TEMPO_PROCESSAMENTO}} minutos

4. ACONDICIONAMENTO / EMBALAGEM
Descrição: {{DESC_ACONDICIONAMENTO}}

5. TRATAMENTO TÉRMICO FINAL (se aplicável)
Tipo: {{TIPO_TRATAMENTO_TERMICO}}
Parâmetros: {{TEMP_TRATAMENTO}}°C por {{TEMPO_TRATAMENTO}} segundos

6. RESFRIAMENTO / ESTOCAGEM
Descrição: {{DESC_RESFRIAMENTO}}

═══════════════════════════════════════════════════════════
SEÇÃO 3 — ACONDICIONAMENTO E EMBALAGEM
═══════════════════════════════════════════════════════════

Embalagem Primária (contato direto): {{EMBALAGEM_PRIMARIA}}
Embalagem Secundária (agrupamento): {{EMBALAGEM_SECUNDARIA}}
Unidade de Venda: {{UNIDADE_VENDA}}

═══════════════════════════════════════════════════════════
SEÇÃO 4 — ARMAZENAMENTO E CONSERVAÇÃO
═══════════════════════════════════════════════════════════

Conservação: {{CONDICOES_CONSERVACAO}} (Min: {{TEMP_MIN}}°C / Máx: {{TEMP_MAX}}°C)
Prazo de Validade: {{PRAZO_VALIDADE}} a partir da data de fabricação.

═══════════════════════════════════════════════════════════
SEÇÃO 5 — ROTULAGEM E CRITÉRIOS SENSORIAIS
═══════════════════════════════════════════════════════════

CRITÉRIOS SENSORIAIS:
• Aspecto: {{ASPECTO_VISUAL}}
• Textura: {{TEXTURA}}
• Odor: {{ODOR}}
• Sabor: {{SABOR}}

INFORMAÇÃO NUTRICIONAL:
Conforme legislação vigente. (Tabela nutricional em anexo)

═══════════════════════════════════════════════════════════
SEÇÃO 6 — CONTROLES DE QUALIDADE LABORATORIAL
═══════════════════════════════════════════════════════════

ANÁLISES MICROBIOLÓGICAS:
{{ANALISES_MICROBIOLOGICAS}}

ANÁLISES FÍSICO-QUÍMICAS:
{{ANALISES_FISICO_QUIMICAS}}

═══════════════════════════════════════════════════════════
SEÇÃO 7 — APROVAÇÃO DO RESPONSÁVEL TÉCNICO
═══════════════════════════════════════════════════════════

Este memorial descreve fielmente o processo produtivo e a composição
do produto citado. O estabelecimento compromete-se a não realizar
alterações sem prévia autorização do serviço de inspeção.

_______________________________________________
{{RT_NOME}}
Médico Veterinário Responsável Técnico
CRMV: {{RT_CRMV}}

HASH VETFLOW: {{HASH}} | Smart ID: {{SMART_ID}}`;
}

// ─── Converter objeto JS → formato Firestore REST ─────────────────────────────

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string")  fields[k] = { stringValue: v };
    if (typeof v === "boolean") fields[k] = { booleanValue: v };
    if (typeof v === "number")  fields[k] = { integerValue: String(v) };
  }
  return fields;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

async function uploadTemplate(template) {
  const { id, ...fields } = template;
  const url = `${FIRESTORE_URL}/template/${id}?key=${API_KEY}`;

  const body = JSON.stringify({
    fields: toFirestoreFields(fields),
  });

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore error [${res.status}]: ${err}`);
  }

  return res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 VetFlow — Upload de Templates para Firestore`);
  console.log(`   Projeto: ${PROJECT_ID}`);
  console.log(`   Templates: ${TEMPLATES.length}\n`);

  for (const template of TEMPLATES) {
    try {
      process.stdout.write(`   ⬆  ${template.nome} ... `);
      await uploadTemplate(template);
      console.log(`✅ OK (id: ${template.id})`);
    } catch (err) {
      console.log(`❌ ERRO\n      ${err.message}`);
    }
  }

  console.log("\n✅ Upload concluído!\n");
}

main();
