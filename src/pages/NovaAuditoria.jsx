import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Select,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, LinearProgress, Stepper, Step,
  StepLabel, Grid, CircularProgress, Divider, Accordion,
  AccordionSummary, AccordionDetails, Tooltip, IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { 
  gerarSmartId, 
  RESULTADOS, 
  COR_CRITICIDADE, 
  FREQUENCIAS,
  AREAS,
  LABEL_TIPO
} from "../data/checklistsRT";

// ── 1. MATRIZ DE AUDITORIA POR ÁREA (BLOCOS ESPECÍFICOS) ──────────────────
const BLOCOS_POR_AREA = {
  pequenos_animais: [
    {
      id: "PA1", titulo: "Etapa 1: Infraestrutura e Higiene Sanitária",
      itens: [
        { id: "PA1_1", desc: "Barreiras Físicas: Higienização entre pacientes com virucidas?", class: "CRÍTICO" },
        { id: "PA1_2", desc: "Isolamento: Acesso restrito, pedilúvio e ventilação independente?", class: "CRÍTICO" },
        { id: "PA1_3", desc: "Mobiliário: Material impermeável e sem fissuras?", class: "MAIOR" },
      ]
    },
    {
      id: "PA2", titulo: "Etapa 2: Manejo de Fármacos e Sedação",
      itens: [
        { id: "PA2_1", desc: "Medicamentos Controlados: Estoque bate com livro? Armário com chave do RT?", class: "CRÍTICO" },
        { id: "PA2_2", desc: "Protocolos Anestésicos: Sedação sob supervisão permanente (Art. 27)?", class: "CRÍTICO" },
        { id: "PA2_3", desc: "Validade: Caixa de emergência sem fármacos vencidos?", class: "CRÍTICO" },
      ]
    },
    {
      id: "PA3", titulo: "Etapa 3: Serviços Auxiliares (Banho/Tosa/Creche)",
      itens: [
        { id: "PA3_1", desc: "Utensílios: Lâminas de tosa desinfetadas após cada animal?", class: "MAIOR" },
        { id: "PA3_2", desc: "Controle Ectoparasitas: Fichas comprovam inspeção de pulgas/carrapatos?", class: "MAIOR" },
        { id: "PA3_3", desc: "Água: Laudo de potabilidade anual da caixa d'água disponível?", class: "MAIOR" },
      ]
    }
  ],
  areas_especiais: [ // Laboratórios (Res. 1374)
    {
      id: "LAB1", titulo: "Fase Pré-Analítica (Entrada e Recepção)",
      itens: [
        { id: "LAB1_1", desc: "Requisições: 100% com nome e CRMV do médico requisitante?", class: "CRÍTICO" },
        { id: "LAB1_2", desc: "Prazo: Requisições dentro da validade de 30 dias (Art. 7º)?", class: "MAIOR" },
        { id: "LAB1_3", desc: "Logística: Registros de temperatura no ato da recepção (caixas térmicas)?", class: "MAIOR" },
        { id: "LAB1_4", desc: "Identificação: Etiquetas resistentes à umidade com ID e Data?", class: "MAIOR" },
      ]
    },
    {
      id: "LAB2", titulo: "Fase Analítica (Processamento e Infra)",
      itens: [
        { id: "LAB2_1", desc: "CIQ: Roda amostras-controle antes da rotina diária? Mapas de trabalho?", class: "CRÍTICO" },
        { id: "LAB2_2", desc: "Manutenção: Selos de calibração em balanças/pipetas e microscópios limpos?", class: "MAIOR" },
        { id: "LAB2_3", desc: "Biossegurança (Microbio): Capela com filtro HEPA e manutenção em dia?", class: "CRÍTICO" },
        { id: "LAB2_4", desc: "Biologia Molecular: Separação física Extração vs Amplificação?", class: "CRÍTICO" },
        { id: "LAB2_5", desc: "Temperatura: Registros diários (Manhã/Tarde) de refrigeração/estufas?", class: "CRÍTICO" },
      ]
    },
    {
      id: "LAB3", titulo: "Fase Pós-Analítica (Laudo e Arquivo)",
      itens: [
        { id: "LAB3_1", desc: "Laudo: Contém metodologia, Ref. p/ espécie e assinatura do RT?", class: "CRÍTICO" },
        { id: "LAB3_2", desc: "Notificação: Fluxo documentado p/ doenças compulsórias (Art. 26)?", class: "CRÍTICO" },
        { id: "LAB3_3", desc: "Arquivo: Recuperação de laudo de 4-5 anos atrás testada?", class: "MAIOR" },
      ]
    }
  ],
  producao_origem_animal: [
    // FASE 1 — Chão de Fábrica
    {
      id: "POA_F1", titulo: "Fase 1.1 · Recepção e Validação de Matéria-Prima (Filtro de Entrada)",
      fase: "chao",
      legislacao: "RIISPOA Dec.9.013/2017; IN MAPA 161/2022 — PAC 10",
      itens: [
        { id:"POA_F1_01", desc:"GTA / atestado sanitário conferido e arquivado para cada lote de animais ou MP?", class:"CRÍTICO" },
        { id:"POA_F1_02", desc:"Temperatura da MP medida e registrada na chegada (dentro do limite crítico)?", class:"CRÍTICO" },
        { id:"POA_F1_03", desc:"pH e características sensoriais (odor, cor, textura) verificados e registrados?", class:"CRÍTICO" },
        { id:"POA_F1_04", desc:"Laudos de análise de insumos, aditivos e embalagens arquivados e vigentes?", class:"MAIOR" },
        { id:"POA_F1_05", desc:"Selos de inspeção (SIF/SIE/SIM/SISBI-POA) presentes em 100% das MP?", class:"CRÍTICO" },
        { id:"POA_F1_06", desc:"MP fora do padrão gerou RNC imediato e foi segregada com identificação?", class:"CRÍTICO" },
        { id:"POA_F1_07", desc:"Lista de fornecedores qualificados atualizada com laudos vigentes?", class:"MAIOR" },
      ]
    },
    {
      id: "POA_F2", titulo: "Fase 1.2 · Liberação Pré-Operacional — Barreira Sanitária (PPHO)",
      fase: "chao",
      legislacao: "IN MAPA 161/2022 — PAC 07",
      itens: [
        { id:"POA_F2_01", desc:"Planilha de PPHO Pré-Operacional preenchida ANTES do início da produção?", class:"CRÍTICO" },
        { id:"POA_F2_02", desc:"Monitor assinou a liberação atestando limpeza e sanitização completa?", class:"CRÍTICO" },
        { id:"POA_F2_03", desc:"Cloração da água de abastecimento verificada (0,2–2 mg/L) e registrada?", class:"CRÍTICO" },
        { id:"POA_F2_04", desc:"pH da água dentro do padrão potável (6–9,5) e registrado?", class:"MAIOR" },
        { id:"POA_F2_05", desc:"Equipamentos e superfícies de contato com produto sem resíduos ou odor?", class:"CRÍTICO" },
        { id:"POA_F2_06", desc:"Ausência de pragas ou indícios (fezes, roeduras) nas áreas de produção?", class:"CRÍTICO" },
        { id:"POA_F2_07", desc:"Lâmpadas com proteção contra estilhaços íntegra nas áreas de manipulação?", class:"MAIOR" },
      ]
    },
    {
      id: "POA_F3", titulo: "Fase 1.3 · Monitoramento Operacional — PCCs e Temperaturas",
      fase: "chao",
      legislacao: "Portaria MAPA 46/1998 (APPCC); IN MAPA 161/2022 — PAC 07 e PAC 11",
      itens: [
        { id:"POA_F3_01", desc:"Planilhas de monitoramento dos PCCs preenchidas em tempo real (não 'de gaveta')?", class:"CRÍTICO" },
        { id:"POA_F3_02", desc:"Temperatura de cozimento/pasteurização atingiu o limite crítico definido no APPCC?", class:"CRÍTICO" },
        { id:"POA_F3_03", desc:"Detector de metais (quando exigido) testado com padrões rastreáveis a cada turno?", class:"CRÍTICO" },
        { id:"POA_F3_04", desc:"PPHO Operacional: higiene dos manipuladores monitorada durante a produção?", class:"CRÍTICO" },
        { id:"POA_F3_05", desc:"Câmaras frias e túneis de congelamento dentro dos limites (resfriado ≤4°C; congelado ≤-18°C)?", class:"CRÍTICO" },
        { id:"POA_F3_06", desc:"Temperaturas de câmaras registradas 2x/dia com termômetro calibrado?", class:"CRÍTICO" },
        { id:"POA_F3_07", desc:"Produto acabado protegido de contaminação cruzada com MP durante o processo?", class:"CRÍTICO" },
        { id:"POA_F3_08", desc:"Subprodutos e resíduos recolhidos continuamente sem acúmulo no chão?", class:"MAIOR" },
      ]
    },
    {
      id: "POA_F4", titulo: "Fase 1.4 · Fechamento, Rastreabilidade e Expedição",
      fase: "chao",
      legislacao: "IN MAPA 161/2022 — PAC 13; RIISPOA Art. 65",
      itens: [
        { id:"POA_F4_01", desc:"Planilha de Formação de Lote cruzando MP, insumos e produto final preenchida?", class:"CRÍTICO" },
        { id:"POA_F4_02", desc:"Boletim de Expedição com temperatura de saída e condições do veículo registrado?", class:"CRÍTICO" },
        { id:"POA_F4_03", desc:"Certificado Sanitário Nacional (CSN) emitido quando exigido para o destino?", class:"CRÍTICO" },
        { id:"POA_F4_04", desc:"Rótulos conferem com a formulação (ingredientes, alérgenos, validade, lote)?", class:"CRÍTICO" },
        { id:"POA_F4_05", desc:"Amostras de retenção (contraprova) arquivadas e identificadas por lote?", class:"MAIOR" },
        { id:"POA_F4_06", desc:"Destino de cada lote registrado (cliente, NF, data de entrega)?", class:"CRÍTICO" },
      ]
    },
    // FASE 2 — Gestão do RT
    {
      id: "POA_G1", titulo: "Fase 2.1 · Documentação Legal e Registros Regulatórios",
      fase: "gestao",
      legislacao: "RIISPOA Dec.9.013/2017 Art.44; Sistema CFMV/CRMV",
      itens: [
        { id:"POA_G1_01", desc:"Título de Registro SIF/SIE/SIM/SISBI-POA ativo e afixado em local visível?", class:"CRÍTICO" },
        { id:"POA_G1_02", desc:"ART do RT vigente, averbada no CRMV e compatível com o escopo da indústria?", class:"CRÍTICO" },
        { id:"POA_G1_03", desc:"Alvará Sanitário e Alvará de Funcionamento da prefeitura vigentes?", class:"CRÍTICO" },
        { id:"POA_G1_04", desc:"Licença Ambiental de Operação (LO) vigente? LP e LI arquivadas?", class:"CRÍTICO" },
        { id:"POA_G1_05", desc:"MDES (Memorial Descritivo) aprovado e atualizado pelo órgão de inspeção?", class:"CRÍTICO" },
        { id:"POA_G1_06", desc:"Croquis de fluxos (pessoal, produto, resíduos, água) aprovados e atualizados?", class:"MAIOR" },
        { id:"POA_G1_07", desc:"Livro de Registro de Visitas do RT com entradas atualizadas e assinadas?", class:"CRÍTICO" },
        { id:"POA_G1_08", desc:"MBPF revisado e assinado? POPs afixados nas áreas de execução?", class:"CRÍTICO" },
      ]
    },
    {
      id: "POA_G2", titulo: "Fase 2.2 · Saúde e Higiene dos Manipuladores (PAC 02)",
      fase: "gestao",
      legislacao: "IN MAPA 161/2022 — PAC 02; NR-7; RDC ANVISA 216/2004",
      itens: [
        { id:"POA_G2_01", desc:"ASOs (Atestados de Saúde Ocupacional) vigentes para 100% dos manipuladores?", class:"CRÍTICO" },
        { id:"POA_G2_02", desc:"PCMSO elaborado por médico do trabalho, vigente e com cronograma de exames?", class:"CRÍTICO" },
        { id:"POA_G2_03", desc:"Registros de treinamento em higiene e manipulação com assinatura dos funcionários?", class:"CRÍTICO" },
        { id:"POA_G2_04", desc:"Nenhum manipulador com lesões cutâneas ou sintomas infecciosos em contato com produto?", class:"CRÍTICO" },
        { id:"POA_G2_05", desc:"EPIs corretos em uso por área (avental, bota, touca, luva, máscara conforme o setor)?", class:"CRÍTICO" },
        { id:"POA_G2_06", desc:"Vestiários separados por sexo, limpos e com EPI disponível para troca?", class:"MAIOR" },
      ]
    },
    {
      id: "POA_G3", titulo: "Fase 2.3 · Rastreabilidade e Plano de Recall — Escudo Jurídico do RT",
      fase: "gestao",
      legislacao: "IN MAPA 161/2022 — PAC 13; RDC ANVISA 24/2015",
      itens: [
        { id:"POA_G3_01", desc:"Plano de Recolhimento (Recall) elaborado, testado e com responsáveis definidos?", class:"CRÍTICO" },
        { id:"POA_G3_02", desc:"Simulação de recall realizada nos últimos 12 meses com relatório arquivado?", class:"CRÍTICO" },
        { id:"POA_G3_03", desc:"Sistema capaz de rastrear 100% de um lote do fornecedor ao ponto de venda em <4h?", class:"CRÍTICO" },
        { id:"POA_G3_04", desc:"Planilhas de expedição com destino, data e lote de cada entrega arquivadas?", class:"CRÍTICO" },
        { id:"POA_G3_05", desc:"Lote com suspeita de contaminação: RT exigiu laudo antes de liberar? Termo de Constatação emitido se houve pressão da diretoria?", class:"CRÍTICO" },
        { id:"POA_G3_06", desc:"Calibração de todos instrumentos (termômetros, balanças, peagâmetros) com certificados vigentes?", class:"CRÍTICO" },
      ]
    },
    {
      id: "POA_G4", titulo: "Fase 2.4 · PGRS — Resíduos, Efluentes e Conformidade Ambiental",
      fase: "gestao",
      legislacao: "Lei 12.305/2010 (PNRS); CONAMA 430/2011; RIISPOA",
      itens: [
        { id:"POA_G4_01", desc:"PGRS elaborado, aprovado e com responsável identificado?", class:"CRÍTICO" },
        { id:"POA_G4_02", desc:"ETE (sistema de efluentes) em operação dentro dos parâmetros legais?", class:"CRÍTICO" },
        { id:"POA_G4_03", desc:"Manifesto de Transporte de Resíduos emitido a cada coleta e arquivado?", class:"CRÍTICO" },
        { id:"POA_G4_04", desc:"Subprodutos não comestíveis (graxaria) com contrato e manifesto de destinação?", class:"CRÍTICO" },
        { id:"POA_G4_05", desc:"Análises periódicas do efluente tratado (DBO, DQO, pH, coliformes) arquivadas?", class:"MAIOR" },
        { id:"POA_G4_06", desc:"Resíduos sólidos triados (orgânico, reciclável, industrial perigoso) conforme PGRS?", class:"MAIOR" },
      ]
    },
    {
      id: "POA_REGISTRO", titulo: "Fase Extra · Registro de Produtos e PGA/SIGSIF",
      fase: "gestao", legislacao: "Portaria MAPA 558/2022",
      itens: [
        { id:"POA_REG_1", desc:"Todos os produtos expedidos possuem registro ATIVO no PGA/SIGSIF?", class:"CRÍTICO" },
        { id:"POA_REG_2", desc:"Rótulos impressos conferem 100% com os dados e RTIQ aprovados no registro?", class:"CRÍTICO" },
        { id:"POA_REG_3", desc:"Aditivos e ingredientes listados no rótulo constam no memorial aprovado?", class:"CRÍTICO" }
      ]
    },
    {
      id: "POA_OBRIG_SIF", titulo: "Fase Extra · Obrigações Administrativas SIF",
      fase: "gestao", legislacao: "RIISPOA Art. 74",
      itens: [
        { id:"POA_SIF_1", desc:"Dados estatísticos de produção e condenações enviados ao SIF até o 10º dia útil?", class:"CRÍTICO" },
        { id:"POA_SIF_2", desc:"Paralisação ou reinício de atividades comunicado ao SIF com 72h de antecedência?", class:"CRÍTICO" },
        { id:"POA_SIF_3", desc:"Processos administrativos/autuações respondidos dentro do prazo legal?", class:"MAIOR" }
      ]
    },
    {
      id: "POA_FORMULACAO", titulo: "Fase Extra · Formulação e Combate à Fraude",
      fase: "chao", legislacao: "RDC ANVISA 778/2023",
      itens: [
        { id:"POA_FORM_1", desc:"Uso de aditivos (nitritos/nitratos) rigorosamente dentro do limite legal (RDC 778/2023)?", class:"CRÍTICO" },
        { id:"POA_FORM_2", desc:"Uso de maltodextrina apenas quando o RTIQ autoriza expressamente (direto ou mix)?", class:"CRÍTICO" },
        { id:"POA_FORM_3", desc:"Controle de pesagem de ingredientes/aditivos assinado e auditável lote a lote?", class:"CRÍTICO" }
      ]
    },
    {
      id: "POA_TI_PAC", titulo: "Fase Extra · Auditabilidade Digital dos PACs",
      fase: "gestao", legislacao: "RIISPOA Art. 74 § 1º",
      itens: [
        { id:"POA_TI_1", desc:"Sistema de registro digital garante imutabilidade e rastreabilidade de alterações?", class:"CRÍTICO" },
        { id:"POA_TI_2", desc:"Acesso ao sistema restrito por senhas ou biometria individual (login/senha)?", class:"CRÍTICO" },
        { id:"POA_TI_3", desc:"Acesso de leitura ao sistema disponibilizado in loco para os fiscais do SIF?", class:"CRÍTICO" }
      ]
    },
    {
      id: "POA_RISCO_AVES", titulo: "Fase Extra · Gestão de Risco em Abatedouros de Aves",
      fase: "gestao", legislacao: "Portaria SDA 736/2022",
      itens: [
        { id:"POA_AVE_1", desc:"Protocolo de segregação de lotes com histórico de Salmonella spp. aplicado?", class:"CRÍTICO" },
        { id:"POA_AVE_2", desc:"Destinação de carcaças positivas para Salmonella spp. conforme normas do SIF?", class:"CRÍTICO" },
        { id:"POA_AVE_3", desc:"Plano de Ação para redução de condenações por miopatias (pectoralis maior) ativo?", class:"MAIOR" }
      ]
    }
  ],

  comercio_agronegocio: [
    {
      id: "COM1", titulo: "Etapa 1: Armazenamento e Logística",
      itens: [
        { id: "COM1_1", desc: "Distanciamento: 30cm das paredes e 10cm do chão (pallets)?", class: "MAIOR" },
        { id: "COM1_2", desc: "Ambiente: Local seco, arejado e sem luz solar direta?", class: "MAIOR" },
        { id: "COM1_3", desc: "Pragas: Certificado de desratização por empresa licenciada?", class: "CRÍTICO" },
      ]
    },
    {
      id: "COM2", titulo: "Etapa 2: Venda de Medicamentos",
      itens: [
        { id: "COM2_1", desc: "Prescrição: Antibióticos/controlados fora do alcance (atrás do balcão)?", class: "CRÍTICO" },
        { id: "COM2_2", desc: "Ética: Equipe treinada para não diagnosticar ou prescrever?", class: "CRÍTICO" },
      ]
    }
  ],
  producao_rural: [
    {
      id: "RUR1", titulo: "Etapa 1: Profilaxia e Biosseguridade",
      itens: [
        { id: "RUR1_1", desc: "Vacinação: Inventário de doses cruza com animais vacinados?", class: "CRÍTICO" },
        { id: "RUR1_2", desc: "Farmácia: Vacinas em frigorífico exclusivo (2°C a 8°C)?", class: "CRÍTICO" },
        { id: "RUR1_3", desc: "Quarentena: Área isolada para animais recém-adquiridos?", class: "MAIOR" },
      ]
    },
    {
      id: "RUR2", titulo: "Etapa 2: Resíduos e Bem-Estar",
      itens: [
        { id: "RUR2_1", desc: "Carcaças: Vala sanitária, composteira ou incinerador legalizado?", class: "CRÍTICO" },
        { id: "RUR2_2", desc: "Manejo: Contenção evita dor e sofrimento desnecessário?", class: "CRÍTICO" },
      ]
    }
  ],
  bovinocultura_corte: [
    {
      id: "BC_DOC", titulo: "Documentação Legal e Registros Sanitários",
      itens: [
        { id:"BC_DOC_1", desc:"ART do RT vigente, averbada no CRMV e compatível com a propriedade?",                 class:"CRÍTICO" },
        { id:"BC_DOC_2", desc:"Cadastro Ambiental Rural (CAR) ativo e regularizado?",                                class:"MAIOR"   },
        { id:"BC_DOC_3", desc:"Licença Ambiental de Operação (LO) vigente?",                                         class:"MAIOR"   },
        { id:"BC_DOC_4", desc:"Programa Sanitário Anual da Propriedade elaborado e em execução?",                    class:"MAIOR"   },
        { id:"BC_DOC_5", desc:"Livro de Registro de Visitas do RT com entradas atualizadas e assinadas?",            class:"CRÍTICO" },
      ]
    },
    {
      id: "BC_PNCEBT", titulo: "PNCEBT — Brucelose e Tuberculose",
      itens: [
        { id:"BC_PNCEBT_1", desc:"Vacinação antibrucela das fêmeas entre 3 e 8 meses em dia com comprovante?",       class:"CRÍTICO" },
        { id:"BC_PNCEBT_2", desc:"Resultado do teste de brucelose dentro do prazo de validade do programa?",         class:"CRÍTICO" },
        { id:"BC_PNCEBT_3", desc:"Resultado de tuberculinização (PPD) por MV habilitado e dentro do prazo?",         class:"CRÍTICO" },
        { id:"BC_PNCEBT_4", desc:"Animais positivos notificados à Defesa Sanitária Animal estadual?",                class:"CRÍTICO" },
      ]
    },
    {
      id: "BC_SISBOV", titulo: "SISBOV — Rastreabilidade e Identificação",
      itens: [
        { id:"BC_SIS_1", desc:"100% dos animais acima do peso mínimo identificados com brinco SISBOV?",              class:"CRÍTICO" },
        { id:"BC_SIS_2", desc:"Brincos legíveis e íntegros — reposições de caídos registradas?",                     class:"MAIOR"   },
        { id:"BC_SIS_3", desc:"Inventário do rebanho atualizado com nascimentos, mortes e transferências?",          class:"CRÍTICO" },
        { id:"BC_SIS_4", desc:"GTAs de saída contêm números de brinco SISBOV de todos os animais?",                  class:"CRÍTICO" },
        { id:"BC_SIS_5", desc:"Nascimentos lançados no sistema dentro de 30 dias do evento?",                        class:"MAIOR"   },
      ]
    },
    {
      id: "BC_NUTRI", titulo: "Nutrição, Manejo e Bem-Estar Produtivo",
      itens: [
        { id:"BC_NUT_1", desc:"Dieta formulada por MV ou zootecnista disponível para verificação?",                   class:"MAIOR"   },
        { id:"BC_NUT_2", desc:"Cochos e bebedouros limpos, funcionando e em número adequado por animal?",             class:"CRÍTICO" },
        { id:"BC_NUT_3", desc:"Condição corporal média do rebanho entre 3 e 4 (Escala 1–5)?",                         class:"MAIOR"   },
        { id:"BC_NUT_4", desc:"Sal mineralizado disponível ad libitum com comprovante de fornecimento?",              class:"MAIOR"   },
        { id:"BC_NUT_5", desc:"Instalações sem pontas cortantes, cercas íntegras e corredores sem lama excessiva?",  class:"MAIOR"   },
      ]
    },
    {
      id: "BC_ANTIM", titulo: "Uso Responsável de Antimicrobianos",
      itens: [
        { id:"BC_ANT_1", desc:"Receituário veterinário emitido para 100% dos antimicrobianos usados no período?",    class:"CRÍTICO" },
        { id:"BC_ANT_2", desc:"Período de carência respeitado para todos os animais em tratamento?",                  class:"CRÍTICO" },
        { id:"BC_ANT_3", desc:"Animais em carência identificados e separados do lote de abate?",                     class:"CRÍTICO" },
        { id:"BC_ANT_4", desc:"Embalagens vazias destinadas ao canal logístico reverso?",                             class:"MAIOR"   },
      ]
    }
  ],
  bovinocultura_leite: [
    {
      id: "BL_DOC", titulo: "Documentação Legal — Leite",
      itens: [
        { id:"BL_DOC_1", desc:"ART do RT vigente e compatível com a propriedade?",                                   class:"CRÍTICO" },
        { id:"BL_DOC_2", desc:"CAR ativo e licença ambiental de operação vigente?",                                   class:"MAIOR"   },
        { id:"BL_DOC_3", desc:"Programa Sanitário Anual e Protocolo de Ordenha elaborados e em execução?",           class:"MAIOR"   },
        { id:"BL_DOC_4", desc:"Contrato com laticínio ativo e vigente?",                                             class:"MAIOR"   },
        { id:"BL_DOC_5", desc:"Livro de Registro de Visitas do RT atualizado e assinado?",                           class:"CRÍTICO" },
      ]
    },
    {
      id: "BL_LEITE", titulo: "Qualidade do Leite — CCS, CPP e PNQL",
      itens: [
        { id:"BL_LEI_1", desc:"Último boletim CCS dentro do limite legal (≤500.000 cél/mL)?",                        class:"CRÍTICO" },
        { id:"BL_LEI_2", desc:"Último boletim CPP dentro do limite legal (≤300.000 UFC/mL)?",                        class:"CRÍTICO" },
        { id:"BL_LEI_3", desc:"Coleta realizada por laboratório credenciado pela RBQL?",                             class:"CRÍTICO" },
        { id:"BL_LEI_4", desc:"Histórico dos últimos 12 meses de CCS e CPP arquivado?",                              class:"MAIOR"   },
        { id:"BL_LEI_5", desc:"Protocolo de prevenção de mastite sendo seguido quando CCS > 200.000?",              class:"MAIOR"   },
      ]
    },
    {
      id: "BL_ORDENHA", titulo: "Higiene de Ordenha e Cadeia do Frio",
      itens: [
        { id:"BL_ORD_1", desc:"Protocolo de pré-dipping com solução antisséptica aprovada sendo executado?",         class:"CRÍTICO" },
        { id:"BL_ORD_2", desc:"Teste da caneca de fundo escuro (primeiros jatos) realizado em todas as vacas?",      class:"CRÍTICO" },
        { id:"BL_ORD_3", desc:"Pós-dipping realizado imediatamente após a ordenha em todas as vacas?",               class:"CRÍTICO" },
        { id:"BL_ORD_4", desc:"Leite resfriado a ≤4°C em até 3h após a ordenha?",                                    class:"CRÍTICO" },
        { id:"BL_ORD_5", desc:"Temperatura do tanque registrada e dentro do limite (≤4°C)?",                         class:"CRÍTICO" },
        { id:"BL_ORD_6", desc:"Vacas com mastite clínica identificadas com leite descartado (não entra no tanque)?", class:"CRÍTICO" },
        { id:"BL_ORD_7", desc:"Vacas em tratamento com carência respeitada — leite descartado?",                     class:"CRÍTICO" },
        { id:"BL_ORD_8", desc:"Ordenhadeira higienizada com CIP (Cleaning In Place) após cada uso?",                 class:"MAIOR"   },
      ]
    },
    {
      id: "BL_PNCEBT_L", titulo: "PNCEBT — Brucelose e Tuberculose (Leite)",
      itens: [
        { id:"BL_PCT_1", desc:"Vacinação antibrucela das fêmeas entre 3 e 8 meses com comprovante?",                 class:"CRÍTICO" },
        { id:"BL_PCT_2", desc:"Resultado de brucelose e tuberculose dentro do prazo do programa?",                   class:"CRÍTICO" },
        { id:"BL_PCT_3", desc:"Positivos notificados à Defesa Sanitária Animal e isolados?",                         class:"CRÍTICO" },
      ]
    },
    {
      id: "BL_ANTIM_L", titulo: "Medicamentos e Carência (Leite)",
      itens: [
        { id:"BL_ANT_1", desc:"Receituário veterinário emitido para todos os antimicrobianos?",                      class:"CRÍTICO" },
        { id:"BL_ANT_2", desc:"Carência dos antibióticos respeitada antes do leite entrar no tanque?",               class:"CRÍTICO" },
        { id:"BL_ANT_3", desc:"Ficha individual por vaca com histórico de tratamentos arquivada?",                   class:"MAIOR"   },
        { id:"BL_ANT_4", desc:"Teste de triagem de resíduos (betatest ou similar) quando houver dúvida?",            class:"MAIOR"   },
      ]
    }
  ],
  creche_hotel: [
    {
      id: "CH1", titulo: "Etapa 1: Documentação e Regularização",
      itens: [
        { id:"CH1_1", desc:"Alvará Sanitário (CMVS) vigente e afixado em local visível?",                            class:"CRÍTICO" },
        { id:"CH1_2", desc:"Alvará de Funcionamento da Prefeitura vigente?",                                         class:"CRÍTICO" },
        { id:"CH1_3", desc:"Registro do estabelecimento no CRMV (Certificado Regularidade PJ)?",                    class:"CRÍTICO" },
        { id:"CH1_4", desc:"ART do médico veterinário RT vigente e compatível com o vínculo?",                      class:"CRÍTICO" },
        { id:"CH1_5", desc:"Laudo do Corpo de Bombeiros (AVCB ou CLCB) vigente?",                                   class:"CRÍTICO" },
        { id:"CH1_6", desc:"Manual de Boas Práticas assinado pelo RT e com revisão anual?",                         class:"CRÍTICO" },
        { id:"CH1_7", desc:"POPs de limpeza, desinfecção, controle de pragas e resíduos elaborados e afixados?",    class:"CRÍTICO" },
        { id:"CH1_8", desc:"PGRSS vigente com comprovante de coleta por empresa licenciada (Manifesto)?",           class:"CRÍTICO" },
        { id:"CH1_9", desc:"CNPJ com CNAE compatível com creche/hotel para animais (9609-2/99 ou 7500-1/00)?",      class:"MAIOR"   },
      ]
    },
    {
      id: "CH2", titulo: "Etapa 2: Admissão e Documentação dos Pets",
      itens: [
        { id:"CH2_1", desc:"Ficha de admissão e termo de responsabilidade assinado para cada animal hospedado?",    class:"CRÍTICO" },
        { id:"CH2_2", desc:"Vacinação obrigatória verificada na entrada (Raiva, V8/V10)?",                          class:"CRÍTICO" },
        { id:"CH2_3", desc:"Vacina Gripe/Bordetella exigida na admissão (ambiente coletivo)?",                      class:"CRÍTICO" },
        { id:"CH2_4", desc:"Comprovação de vermifugação recente (máx. 6 meses)?",                                   class:"MAIOR"   },
        { id:"CH2_5", desc:"Controle de ectoparasitas (antipulgas/carrapatos) comprovado na admissão?",             class:"CRÍTICO" },
        { id:"CH2_6", desc:"Triagem sanitária visual realizada na entrada (animais doentes barrados)?",             class:"CRÍTICO" },
      ]
    },
    {
      id: "CH3", titulo: "Etapa 3: Infraestrutura e Biossegurança",
      itens: [
        { id:"CH3_1", desc:"Portas duplas ou câmara de contenção funcionando (sem risco de fuga)?",                 class:"CRÍTICO" },
        { id:"CH3_2", desc:"Ambiente telado/cercado impedindo contato com animais externos?",                       class:"CRÍTICO" },
        { id:"CH3_3", desc:"Pisos impermeáveis, sem rachaduras e de fácil higienização?",                           class:"CRÍTICO" },
        { id:"CH3_4", desc:"Ventilação/climatização adequada sem correntes diretas?",                               class:"MAIOR"   },
        { id:"CH3_5", desc:"Área de isolamento para animais doentes ou suspeitos disponível?",                      class:"CRÍTICO" },
        { id:"CH3_6", desc:"Separação por porte/comportamento implementada?",                                       class:"MAIOR"   },
        { id:"CH3_7", desc:"Espaço mínimo adequado por animal (locomoção sem restrição)?",                          class:"CRÍTICO" },
      ]
    },
    {
      id: "CH4", titulo: "Etapa 4: Higiene, Limpeza e Controle de Doenças",
      itens: [
        { id:"CH4_1", desc:"POP de higienização executado entre animais nas baias com produto virucida?",            class:"CRÍTICO" },
        { id:"CH4_2", desc:"Água fresca disponível ad libitum em bebedouros limpos?",                               class:"CRÍTICO" },
        { id:"CH4_3", desc:"Dejetos recolhidos e área desinfetada após cada coleta?",                               class:"CRÍTICO" },
        { id:"CH4_4", desc:"Camas/colchões higienizados entre hóspedes diferentes?",                                class:"MAIOR"   },
        { id:"CH4_5", desc:"Certificado de controle de pragas vigente e mapa de iscas conferido?",                  class:"CRÍTICO" },
        { id:"CH4_6", desc:"Ausência de pragas ou indícios nas áreas dos animais?",                                 class:"CRÍTICO" },
      ]
    },
    {
      id: "CH5", titulo: "Etapa 5: Bem-Estar Animal e Equipe",
      itens: [
        { id:"CH5_1", desc:"Observação comportamental registrada ao menos 2x ao dia?",                              class:"CRÍTICO" },
        { id:"CH5_2", desc:"Enriquecimento ambiental disponível adequado à espécie e porte?",                      class:"MAIOR"   },
        { id:"CH5_3", desc:"Ausência de sinais de sofrimento (automutilação, vocalização excessiva, apatia)?",     class:"CRÍTICO" },
        { id:"CH5_4", desc:"EPIs em uso pela equipe durante manejo e limpeza?",                                     class:"MAIOR"   },
        { id:"CH5_5", desc:"Protocolo de emergência veterinária documentado e equipe treinada?",                    class:"CRÍTICO" },
        { id:"CH5_6", desc:"ASOs vigentes para todos que manipulam animais?",                                       class:"MAIOR"   },
      ]
    },
  ]
};

// ── 2. FLUXO TRANSVERSAL (PARA TODAS AS ÁREAS) ──────────────────────────
const BLOCOS_TRANSVERSAIS = [
  {
    id: "TRANS", titulo: "Fluxo Documental e Ético da RT (Geral)",
    itens: [
      { id: "TR1", desc: "Presença RT: Livro de Visitas contém orientações detalhadas?", class: "CRÍTICO" },
      { id: "TR2", desc: "Treinamentos: Atas com tema, data, lista e conteúdo assinado?", class: "MAIOR" },
      { id: "TR3", desc: "PGRSS: Comprovante de coleta por empresa licenciada (Manifesto)?", class: "CRÍTICO" },
      { id: "TR4", desc: "Carga Horária: Compatível p/ assistência real em todos os locais?", class: "CRÍTICO" },
      { id: "TR5", desc: "ART: Vigente e compatível com o vínculo (Titular/Suplente)?", class: "CRÍTICO" },
    ]
  }
];

const STATUS_OPCOES = [
  { val: "Pendente",              label: "Pendente",      color: "#9e9e9e" },
  { val: RESULTADOS.CONFORME,     label: "✅ Conforme",    color: "#1b4332" },
  { val: RESULTADOS.NAO_CONFORME, label: "❌ Não Conforme",color: "#d32f2f" },
  { val: RESULTADOS.NAO_APLICAVEL,label: "N/A",           color: "#757575" },
];

export default function NovaAuditoria() {
  const userData = useUserData();
  const navigate = useNavigate();
  const { pode, planoMinimo } = usePlano(userData);
  const [smartId] = useState(() => gerarSmartId(userData?.uid));

  if (!pode("novaAuditoria")) {
    return <BloqueioRecurso recurso="Nova Auditoria" planoMinimo={planoMinimo("novaAuditoria")} />;
  }

  const [etapa, setEtapa] = useState("inicio");
  const [clinica, setClinica] = useState(null);
  const [loadingClinica, setLoadingClinica] = useState(true);
  
  const [tipoRT, setTipoRT] = useState("titular");
  const [identificacao, setIdentificacao] = useState("");
  const [respostas, setRespostas] = useState({});
  const [evidencias, setEvidencias] = useState({});
  const [parecerRT, setParecerRT] = useState("");
  const [w5h2, setW5h2] = useState({ o_que: "", porque: "", onde: "", quem: "", quando: "", como: "", quanto: "" });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!userData?.selectedClinicaId) {
      setLoadingClinica(false);
      return;
    }
    setLoadingClinica(true);
    getDoc(doc(db, "clinicas", userData.selectedClinicaId))
      .then(snap => { if (snap.exists()) setClinica({ id: snap.id, ...snap.data() }); })
      .finally(() => setLoadingClinica(false));
  }, [userData?.selectedClinicaId]);

  const isPOA = ["acougue","frigorifico","laticinios","embutidos","pescados","mel_apicultura"].includes(clinica?.tipo);
  const isAgro = ["producao_rural", "bovinocultura_corte", "bovinocultura_leite"].includes(clinica?.tipo);

  const blocosAtivos = useMemo(() => {
    if (!clinica) return BLOCOS_TRANSVERSAIS;
    if (isPOA) {
      // Frigorífico tem bloco extra de BEA
      const todosPOA = BLOCOS_POR_AREA.producao_origem_animal;
      if (clinica.tipo === "frigorifico") return [...todosPOA, ...BLOCOS_TRANSVERSAIS];
      if (clinica.tipo === "mel_apicultura") {
        // Mel não faz chão de fábrica de abate; usa só gestão + água
        const blocosMel = todosPOA.filter(b => ["POA_F2","POA_F4","POA_G1","POA_G2","POA_G3","POA_G4"].includes(b.id));
        return [...blocosMel, ...BLOCOS_TRANSVERSAIS];
      }
      return [...todosPOA, ...BLOCOS_TRANSVERSAIS];
    }
    const area = clinica.tipo === "creche_hotel" ? "creche_hotel" : (clinica.tipo === "bovinocultura_corte" ? "bovinocultura_corte" : (clinica.tipo === "bovinocultura_leite" ? "bovinocultura_leite" : (clinica.areaAtuacao || "pequenos_animais")));
    const especificos = BLOCOS_POR_AREA[area] || BLOCOS_POR_AREA[clinica.tipo] || BLOCOS_POR_AREA.pequenos_animais;
    return [...especificos, ...BLOCOS_TRANSVERSAIS];
  }, [clinica, isPOA]);

  const score = useMemo(() => {
    const todos = blocosAtivos.flatMap(b => b.itens);
    const pesoMap = { "CRÍTICO": 10, "MAIOR": 5, "MENOR": 1 };
    let total = 0, obtido = 0;
    todos.forEach(item => {
      const p = pesoMap[item.class] || 1;
      const resp = respostas[item.id];
      if (!resp || resp === "Pendente" || resp === RESULTADOS.NAO_APLICAVEL) return;
      total += p;
      if (resp === RESULTADOS.CONFORME) obtido += p;
    });
    return total === 0 ? 0 : Math.round((obtido / total) * 100);
  }, [respostas, blocosAtivos]);

  const respRespondidas = Object.keys(respostas).filter(k => respostas[k] !== "Pendente").length;
  const totalItens = blocosAtivos.flatMap(b => b.itens).length;

  const concluir = async () => {
    setSalvando(true);
    try {
      const sId = gerarSmartId(userData.uid);
      await addDoc(collection(db, "auditorias"), {
        userId: userData.uid,
        clinicaId: clinica?.id || null,
        smartId: sId,
        nomeProntuario: identificacao,
        tipoRT,
        secaoId: isPOA ? `POA-Compliance360-${clinica?.tipo}` : "Roteiro Detalhado 2024",
        score,
        areaAuditada: isPOA ? "producao_origem_animal" : (clinica?.tipo === "creche_hotel" ? "creche_hotel" : (clinica?.tipo === "bovinocultura_corte" ? "bovinocultura_corte" : (clinica?.tipo === "bovinocultura_leite" ? "bovinocultura_leite" : (clinica?.areaAtuacao || "pequenos_animais")))),
        respostas,
        evidencias,
        parecerRT,
        plano5W2H: w5h2,
        // Metadados de imutabilidade e retenção legal (5 anos)
        dataExpiracaoRetencao: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
        imutavel: true,
        criadoEm: serverTimestamp(),
      });
      setEtapa("concluido");
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  if (loadingClinica) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h5" fontWeight={900} color={isPOA ? "#0d47a1" : (isAgro ? "#2e7d32" : "#1b4332")} mb={0.5}>
        {isPOA ? "🏭 Trilha de RT — Indústria POA (Compliance 360°)" : (isAgro ? "🌾 Trilha Agro — Propriedade Rural (Sanidade & Manejo)" : "Roteiro de Auditoria RT")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={isPOA || isAgro ? 1 : 4}>
        {isPOA ? `RIISPOA Dec.9.013/2017 · IN MAPA 161/2022 · RDC ANVISA 275/2002 — ${clinica?.tipo?.toUpperCase() || "POA"}` : 
         isAgro ? `PNCEBT · SISBOV · PNQL · BEA — ${LABEL_TIPO[clinica?.tipo] || "Produção Rural"}` :
         "Baseado na Res. CFMV 1374/20 e Guia Exaustivo de Conformidade"}
      </Typography>
      
      {isPOA && (
        <Box sx={{ display:"flex", gap:1, mb:3, flexWrap:"wrap" }}>
          {[{label:"Fase 1: Chão de Fábrica",color:"#0d47a1"},{label:"Fase 2: Gestão do RT",color:"#1b4332"}].map(f=>(
            <Chip key={f.label} label={f.label} size="small" sx={{ bgcolor: f.color, color:"#fff", fontWeight:700, fontSize:11 }} />
          ))}
          <Chip label="Matriz de Respaldo Jurídico ativo" size="small" variant="outlined" sx={{ borderColor:"#b71c1c", color:"#b71c1c", fontWeight:700, fontSize:11 }} />
        </Box>
      )}

      {isAgro && (
        <Box sx={{ display:"flex", gap:1, mb:3, flexWrap:"wrap" }}>
          {[{label:"Inspeção de Rebanho",color:"#2e7d32"},{label:"Manejo & Documentação",color:"#4caf50"}].map(f=>(
            <Chip key={f.label} label={f.label} size="small" sx={{ bgcolor: f.color, color:"#fff", fontWeight:700, fontSize:11 }} />
          ))}
          <Chip label="Matriz Agro & Defesa Sanitária ativa" size="small" variant="outlined" sx={{ borderColor:"#2e7d32", color:"#2e7d32", fontWeight:700, fontSize:11 }} />
        </Box>
      )}

      <Stepper activeStep={etapa === "inicio" ? 0 : etapa === "auditoria" ? 1 : 2} sx={{ mb: 5 }}>
        {["Setup", "Inspeção", "Resultado"].map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
      </Stepper>

      {etapa === "inicio" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1.5px solid #e8f5e9" }}>
              <Typography variant="subtitle1" fontWeight={800} color="#1b4332" mb={3}>Identificação</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" fontWeight={800} color="text.secondary">VÍNCULO DO RT</Typography>
                <Grid container spacing={1} mt={0.5}>
                  {[
                    { val: "titular", label: "RT Titular/Principal" },
                    { val: "suplente", label: "RT Suplente" }
                  ].map(opt => (
                    <Grid item xs={6} key={opt.val}>
                      <Button 
                        fullWidth variant={tipoRT === opt.val ? "contained" : "outlined"}
                        onClick={() => setTipoRT(opt.val)}
                        sx={{ borderRadius: 2, py: 1 }}
                      >{opt.label}</Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <TextField
                label="Identificação (Paciente/Amostra/Lote) *"
                fullWidth value={identificacao} onChange={e => setIdentificacao(e.target.value)} sx={{ mb: 4 }}
              />

              <Button
                variant="contained" fullWidth disabled={!identificacao.trim() || !clinica}
                onClick={() => setEtapa("auditoria")}
                sx={{ bgcolor: "#1b4332", py: 2, borderRadius: 3, fontWeight: 800 }}
              >Iniciar Auditoria de Especialidade</Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            {clinica && (
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1.5px solid #e8f5e9", bgcolor: "#f9fdfa" }}>
                <Typography variant="subtitle2" fontWeight={800} color="#1b4332" mb={1}>
                  📋 Foco: {clinica.tipo === "creche_hotel" ? "Creche / Hotel para Cães" : (AREAS[clinica.areaAtuacao]?.nome || "Geral")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  O roteiro foi adaptado automaticamente para as exigências técnicas da área de {clinica.tipo === "creche_hotel" ? "Creche / Hotel para Cães" : (AREAS[clinica.areaAtuacao]?.nome || "Geral")}.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" fontWeight={700} display="block">Smart ID: {smartId}</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {etapa === "auditoria" && (
        <Box>
          <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: "1.5px solid #e8f5e9", display: "flex", gap: 3, alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
               <Typography variant="caption" fontWeight={800} color="#1b4332">Status: {respRespondidas}/{totalItens} itens</Typography>
               <LinearProgress variant="determinate" value={(respRespondidas/totalItens)*100} sx={{ height: 6, borderRadius: 3, mt: 1 }} />
            </Box>
            <Chip label={`${score}% Conformidade`} sx={{ bgcolor: score >= 80 ? "#1b4332" : "#d32f2f", color: "#fff", fontWeight: 900 }} />
          </Paper>

          {blocosAtivos.map(bloco => (
            <Accordion key={bloco.id} defaultExpanded elevation={0} sx={{ mb: 2, borderRadius: "16px !important", border: `1.5px solid ${bloco.fase === "gestao" ? "#e3f2fd" : bloco.fase === "chao" ? "#e8f5e9" : "#e8f5e9"}`, "&:before": { display: "none" } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: bloco.fase === "gestao" ? "#f3f8ff" : bloco.fase === "chao" ? "#f9fdfa" : "transparent", borderRadius: "16px 16px 0 0" }}>
                <Box sx={{ flex:1 }}>
                  <Typography fontWeight={800} color={bloco.fase === "gestao" ? "#0d47a1" : "#1b4332"}>{bloco.titulo}</Typography>
                  {bloco.legislacao && <Typography variant="caption" color="text.secondary" fontSize={10}>{bloco.legislacao}</Typography>}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "#f9fbf9" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem" }}>CRITÉRIO TÉCNICO</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", width: 180 }}>RESULTADO</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", width: 200 }}>OBS / EVIDÊNCIA</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bloco.itens.map(i => (
                        <TableRow key={i.id} hover sx={{ bgcolor: respostas[i.id] === RESULTADOS.NAO_CONFORME ? "#fff5f5" : "inherit" }}>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                              <Box sx={{ minWidth: 8, height: 8, borderRadius: "50%", bgcolor: COR_CRITICIDADE[i.class], mt: 0.8 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={700} fontSize="0.8rem">{i.desc}</Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{i.class}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Select size="small" fullWidth value={respostas[i.id] || "Pendente"} onChange={e => setRespostas(p => ({...p, [i.id]: e.target.value}))} sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
                              {STATUS_OPCOES.map(s => <MenuItem key={s.val} value={s.val} sx={{ color: s.color, fontWeight: 700 }}>{s.label}</MenuItem>)}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <TextField size="small" fullWidth placeholder="Relatar..." value={evidencias[i.id] || ""} onChange={e => setEvidencias(p => ({...p, [i.id]: e.target.value}))} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Box mt={4} display="flex" gap={2}>
            <Button variant="outlined" onClick={() => setEtapa("inicio")}>Voltar</Button>
            <Button variant="contained" onClick={() => setEtapa("conclusao")} sx={{ bgcolor: "#1b4332", px: 6 }}>Próximo</Button>
          </Box>
        </Box>
      )}

      {etapa === "conclusao" && (
        <Paper elevation={0} sx={{ p: 5, borderRadius: 5, border: "1.5px solid #e8f5e9" }}>
          <Typography variant="h6" fontWeight={900} color="#1b4332" mb={4}>Conclusão e Parecer RT</Typography>
          <TextField label="Parecer Técnico Final *" multiline rows={5} fullWidth value={parecerRT} onChange={e => setParecerRT(e.target.value)} sx={{ mb: 4 }} />
          <Typography variant="subtitle2" fontWeight={800} mb={2}>Plano de Ação 5W2H</Typography>
          <Grid container spacing={2} mb={4}>
            {Object.keys(w5h2).map(k => (
              <Grid item xs={12} sm={4} key={k}>
                <TextField label={k.replace("_", " ").toUpperCase()} fullWidth size="small" value={w5h2[k]} onChange={e => setW5h2(p => ({...p, [k]: e.target.value}))} />
              </Grid>
            ))}
          </Grid>
          <Box display="flex" gap={2}>
            <Button variant="outlined" onClick={() => setEtapa("auditoria")} sx={{ flex: 1 }}>Voltar</Button>
            <Button variant="contained" disabled={!parecerRT.trim() || salvando} onClick={concluir} sx={{ bgcolor: "#1b4332", flex: 2 }}>{salvando ? "Salvando..." : "✅ Salvar Auditoria"}</Button>
          </Box>
        </Paper>
      )}

      {etapa === "concluido" && (
        <Box textAlign="center" py={10}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "#1b4332", mb: 2 }} />
          <Typography variant="h4" fontWeight={900}>Auditoria Registrada!</Typography>
          <Typography color="text.secondary" mb={4}>ID de Verificação: {smartId}</Typography>
          <Button variant="contained" onClick={() => navigate("/central-rt")} sx={{ bgcolor: "#1b4332" }}>Voltar para Central</Button>
        </Box>
      )}
    </Box>
  );
}
