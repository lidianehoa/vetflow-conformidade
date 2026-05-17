import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, TextField, Button, Stack,
  Divider, Alert, CircularProgress, IconButton, Tooltip,
  Card, CardContent, FormControlLabel, Checkbox, Chip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  MenuItem,
} from "@mui/material";
import {
  DeviceThermostat as ThermostatIcon,
  MenuBook as MenuBookIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  CalendarMonth as CalendarIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { collection, addDoc, setDoc, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { TIPO_PARA_AREA } from "../data/checklistsRT";
import { gerarHashSHA256, gerarSmartID } from "../utils/security";

const COR = "#1b4332";
const ACENTO = "#52b788";

const MESES_OPCOES = [
  "Janeiro / 2026", "Fevereiro / 2026", "Março / 2026", "Abril / 2026", "Maio / 2026", "Junho / 2026",
  "Julho / 2026", "Agosto / 2026", "Setembro / 2026", "Outubro / 2026", "Novembro / 2026", "Dezembro / 2026"
];

// TEMPLATE 1: AGROPECUÁRIAS, CASAS DE RAÇÃO E PET SHOPS
const defaultCronogramaPetAgro = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (AGROPECUÁRIAS, CASAS DE RAÇÃO E PET SHOPS)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Organização, armazenamento, restrições de venda e bem-estar (estética/venda).",
      tarefas: [
        {
          nome: "Controle de Temperaturas",
          descricao: "Registrar a temperatura e umidade do ambiente (loja/estoque) e, se aplicável, da geladeira de vacinas e medicamentos termolábeis (manter rigorosamente entre 2°C e 8°C).",
          concluido: false
        },
        {
          nome: "Comércio de Medicamentos",
          descricao: "Fiscalizar o balcão para garantir que balconistas/vendedores não estejam realizando consultas, prescrevendo tratamentos ou indicando medicamentos de uso restrito sem receita.",
          concluido: false
        },
        {
          nome: "Comércio de Rações (A Granel)",
          descricao: "Verificar se os recipientes de venda a granel estão fechados, limpos e se possuem a identificação obrigatória visível ao consumidor (nome do produto, lote, data de fabricação e validade original).",
          concluido: false
        },
        {
          nome: "Estética (Banho e Tosa)",
          subtarefas: [
            {
              descricao: "Verificar a temperatura da água e o uso seguro de secadores/sopradores (risco de intermação/queimaduras).",
              concluido: false
            },
            {
              descricao: "Checar se os animais estão contidos com segurança em guias apropriadas (risco de enforcamento/quedas).",
              concluido: false
            },
            {
              descricao: "Assegurar a desinfecção de lâminas, tesouras e mesas entre o atendimento de cada animal.",
              concluido: false
            }
          ]
        },
        {
          nome: "Comércio de Animais Vivos (Se houver)",
          descricao: "Inspecionar os recintos diários (limpeza, superlotação, água fresca, alimentação e sinais de doenças ou estresse nos animais à venda).",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "Sexta-feira ou véspera de final de semana",
      foco: "Auditoria de estoque, higiene profunda e instalações.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Inspeção de Estoque (Pallets)",
          descricao: "Checar o estoque para garantir que sacos de ração e fardos não estejam em contato direto com o chão (uso de estrados/pallets) nem encostados nas paredes, permitindo a circulação de ar e limpeza."
        },
        {
          nome: "Limpeza Profunda (Banho e Tosa)",
          descricao: "Supervisionar a limpeza pesada de banheiras, ralos, gaiolas de espera e a correta higienização/esterilização das toalhas (se não forem de uso único/terceirizadas)."
        },
        {
          nome: "Controle de Validades (Prateleiras)",
          descricao: "Fazer uma varredura visual nas prateleiras da loja, retirando produtos avariados, com embalagens violadas ou vencidos."
        },
        {
          nome: "Organização de Receituários",
          descricao: "Recolher e organizar as receitas veterinárias exigidas para a venda de medicamentos específicos (como antimicrobianos e controlados, se o estabelecimento possuir licença para tal)."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Controle de pragas e alinhamento da equipe de vendas.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Monitoramento de Pragas",
          descricao: "Inspecionar os cantos das paredes, frestas, estoques de ração e ralos buscando sinais de roedores (fezes, sacos roídos), insetos ou carrapatos no ambiente."
        },
        {
          nome: "Reunião Rápida com Vendedores (Briefing)",
          descricao: "Alinhar a equipe (15 min) sobre o limite da atuação do balconista, reforçando que dúvidas clínicas dos clientes devem ser direcionadas ao consultório veterinário."
        },
        {
          nome: "Inspeção do PGRSS",
          descricao: "Verificar o acondicionamento e descarte correto do lixo comum, embalagens de medicamentos e recicláveis, além de perfurocortantes e biológicos (se o pet shop realizar corte de unha com sangramento acidental, limpeza de orelhas, etc.)."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Documentação legal, varredura geral e treinamentos.",
      concluido: false,
      tarefas: [
        {
          nome: "Gestão Legal e Documental",
          subtarefas: [
            {
              descricao: "O Certificado de Regularidade do CRMV está dentro da validade e afixado em local bem visível ao público?",
              concluido: false
            },
            {
              descricao: "A Anotação de Responsabilidade Técnica (ART) está regular?",
              concluido: false
            },
            {
              descricao: "O Alvará de Funcionamento e as licenças sanitárias estão em dia?",
              concluido: false
            }
          ]
        },
        {
          nome: "Auditoria do Controle de Pragas",
          descricao: "Verificar o certificado da empresa terceirizada de desinsetização/desratização (garantir que foi feito dentro do prazo e com produtos seguros para os animais e clientes).",
          concluido: false
        },
        {
          nome: "Inventário de Vencimentos Críticos",
          descricao: "Levantar todos os produtos (rações, medicamentos, cosméticos do banho e tosa) que vencerão nos próximos 30 a 60 dias para providenciar devolução ou promoção (regras PVPS).",
          concluido: false
        },
        {
          nome: "Treinamento da Equipe",
          descricao: "Realizar uma (1) capacitação oficial com a equipe da loja/banho e tosa. (Ex: Primeiros socorros no banho e tosa, Bem-estar de animais expostos, Cuidados na venda de ração a granel, ou Noções de biossegurança).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registrar fiscalizações (MAPA, Vigilância Sanitária, PROCON, CRMV), acidentes no banho e tosa, apreensão de produtos vencidos ou devoluções de lotes de ração",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 2: LABORATÓRIOS VETERINÁRIOS
const defaultCronogramaLab = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (LABORATÓRIOS VETERINÁRIOS)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Biossegurança, calibração analítica, integridade das amostras e liberação de laudos.",
      tarefas: [
        {
          nome: "Controle de Temperaturas",
          descricao: "Medir e registrar a temperatura de geladeiras, freezers (armazenamento de amostras e reagentes), estufas, banhos-marias e temperatura ambiente.",
          concluido: false
        },
        {
          nome: "Calibração e Controle Interno de Qualidade (CIQ)",
          descricao: "Acompanhar a passagem de brancos, calibradores e soros controle nos equipamentos (bioquímica, hematologia, endocrinologia) antes do início das rotinas.",
          concluido: false
        },
        {
          nome: "Triagem de Amostras (Fase Pré-Analítica)",
          descricao: "Inspecionar a adequação das amostras recebidas (identificação correta, volume, presença de hemólise/lipemia/coágulos) e garantir a notificação imediata das clínicas parceiras em caso de recoleta.",
          concluido: false
        },
        {
          nome: "Validação de Laudos (Fase Pós-Analítica)",
          descricao: "Conferir, validar e assinar os laudos emitidos no dia, assegurando que resultados críticos ou incompatíveis com a vida sejam reprocessados ou comunicados imediatamente ao veterinário solicitante.",
          concluido: false
        },
        {
          nome: "Biossegurança e EPIs",
          descricao: "Fiscalizar o uso ininterrupto de jalecos fechados, luvas, máscaras e óculos de proteção na área técnica. Proibir adornos, alimentação ou uso de celulares na bancada.",
          concluido: false
        },
        {
          nome: "Gestão de Resíduos Diária",
          descricao: "Conferir o nível das caixas de perfurocortantes (Descarpack) e o descarte correto de materiais biológicos (sacos brancos leitosos) e químicos (galões específicos).",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "Sexta-feira ou término da rotina",
      foco: "Manutenção de equipamentos, estoque de reagentes e logística de amostras.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Manutenção de Equipamentos (Nível Usuário)",
          descricao: "Realizar ou supervisionar a limpeza profunda das sondas, agulhas, cubetas e troca de filtros/soluções de lavagem dos analisadores automáticos."
        },
        {
          nome: "Controle de Estoque e Validades",
          descricao: "Verificar o inventário de reagentes, corantes, kits rápidos e tubos de coleta, separando os itens com vencimento próximo (regra PVPS: Primeiro a Vencer, Primeiro a Sair)."
        },
        {
          nome: "Logística de Transporte",
          descricao: "Auditar as caixas térmicas (maletas isotérmicas) usadas pelos motoboys/transportadores (limpeza, integridade e uso correto de gelo reciclável e dataloggers)."
        },
        {
          nome: "Desinfecção de Bancadas e Centrífugas",
          descricao: "Acompanhar a limpeza terminal com hipoclorito de sódio ou outro desinfetante padronizado nas superfícies e interior das centrífugas."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Laboratórios de apoio e alinhamento técnico.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Auditoria de Laboratórios Terceirizados",
          descricao: "Conferir o prazo de entrega, a qualidade e o faturamento dos exames enviados para laboratórios de apoio (terceirizados)."
        },
        {
          nome: "Reunião Técnica (Briefing)",
          descricao: "Reunião rápida (15-20 min) com os analistas e auxiliares de laboratório para discutir erros pré-analíticos recorrentes, desvios de calibração ou atualizações de valores de referência."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Controle Externo de Qualidade, gestão documental legal e treinamentos.",
      concluido: false,
      tarefas: [
        {
          nome: "Controle Externo de Qualidade (CEQ / Proficiência)",
          descricao: "Enviar os resultados das amostras de proficiência (ex: PNCQ, Controllab) dentro do prazo e analisar o relatório de desempenho do mês anterior (aplicando ações corretivas se houver desvios).",
          concluido: false
        },
        {
          nome: "Gestão do PGRSS (Resíduos Sólidos)",
          descricao: "Conferir e arquivar os Manifestos de Transporte de Resíduos (MTR) e os Certificados de Destinação Final emitidos pela empresa coletora de lixo infectante e químico.",
          concluido: false
        },
        {
          nome: "Revisão Documental (POPs e Manuais)",
          subtarefas: [
            {
              descricao: "Os Procedimentos Operacionais Padrão (POPs) de todas as bancadas estão atualizados e disponíveis para a equipe?",
              concluido: false
            },
            {
              descricao: "O Manual de Biossegurança e o PGRSS refletem a realidade atual do laboratório?",
              concluido: false
            }
          ]
        },
        {
          nome: "Revisão Legal",
          subtarefas: [
            {
              descricao: "O Certificado de Regularidade do CRMV e a ART estão válidos e expostos?",
              concluido: false
            },
            {
              descricao: "O Alvará de Funcionamento e a Licença Sanitária estão em dia?",
              concluido: false
            }
          ]
        },
        {
          nome: "Educação Continuada",
          descricao: "Realizar um (1) treinamento registrado com a equipe (Ex: Gerenciamento de derramamento biológico, Interpretação de histogramas hematológicos ou Uso correto de extintores).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registrar quebras de equipamentos, reprovações no Controle de Qualidade Externo, acidentes com perfurocortantes ou fiscalizações",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 3: CRECHES E HOTÉIS PET
const defaultCronogramaCreche = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (CRECHES E HOTÉIS PET)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Triagem de saúde, prevenção de brigas, bem-estar e higiene do ambiente.",
      tarefas: [
        {
          nome: "Triagem de Admissão (Check-in)",
          descricao: "Conferir rigorosamente a exigência de vacinas em dia (V8/V10, Raiva, Gripe, Giárdia), vermifugação e controle de ectoparasitas (pulgas e carrapatos) de todos os animais que dão entrada no dia.",
          concluido: false
        },
        {
          nome: "Manejo e Comportamento",
          descricao: "Supervisionar a introdução de novos animais na matilha e verificar se a separação por porte, nível de energia e temperamento está sendo respeitada para evitar brigas e acidentes.",
          concluido: false
        },
        {
          nome: "Bem-Estar Animal",
          descricao: "Monitorar os sinais vitais e comportamentais (nível de estresse, prostração, vômitos, diarreia). Garantir que os animais têm tempo adequado de descanso, sombra e água fresca abundante.",
          concluido: false
        },
        {
          nome: "Higiene e Desinfecção Diária",
          descricao: "Inspecionar a remoção imediata de fezes/urina das áreas de recreação e a higienização de bebedouros, comedouros e tapetes higiênicos/caixas de areia.",
          concluido: false
        },
        {
          nome: "Segurança das Instalações",
          descricao: "Verificar visualmente a integridade de portões (sistema de duplo portão/eclusa), cercas, telas e ausência de objetos que possam ser engolidos ou causar lesões.",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "Sexta-feira ou véspera de picos de lotação",
      foco: "Limpeza profunda, manutenção e saúde preventiva.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Limpeza Profunda (Desinfecção Sanitária)",
          descricao: "Acompanhar a lavagem e desinfecção com produtos adequados (seguros para pets, como amônia quaternária) de gramados sintéticos, ralos, caminhas, brinquedos e áreas de descanso."
        },
        {
          nome: "Inspeção de Hóspedes Longos",
          descricao: "Realizar uma avaliação física rápida nos cães/gatos que estão hospedados há mais de 7 dias (checar perda de peso, presença de carrapatos ocultos, lesões em coxins ou dermatites)."
        },
        {
          nome: "Auditoria de Fichas/Termos",
          descricao: "Verificar se todos os tutores assinaram os termos de responsabilidade, autorização de atendimento veterinário emergencial e fichas de anamnese comportamental."
        },
        {
          nome: "Kit de Primeiros Socorros",
          descricao: "Checar e repor o kit de emergência do estabelecimento (gaze, ataduras, antissépticos, focinheiras, caixas de transporte para emergências)."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Infraestrutura, controle de pragas e alinhamento de equipe.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Inspeção Estrutural de Risco",
          descricao: "Fazer uma varredura minuciosa em busca de falhas estruturais causadas pelo uso: madeiras roídas, arames soltos, buracos no quintal (risco de fuga), ralos quebrados ou plantas tóxicas que possam ter crescido no local."
        },
        {
          nome: "Reunião de Alinhamento (Briefing)",
          descricao: "Reunião rápida (15-20 min) com os monitores de pátio sobre comunicação canina (linguagem corporal, sinais de apaziguamento e estresse) e correção de falhas de manejo."
        },
        {
          nome: "Controle de Insumos",
          descricao: "Auditar o estoque de rações (armazenamento correto em caixas herméticas, longe do chão/parede e controle de validade) e produtos de limpeza."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Gestão legal, protocols sanitários e capacitação.",
      concluido: false,
      tarefas: [
        {
          nome: "Controle de Pragas e Vetores",
          descricao: "Inspecionar rigorosamente o ambiente contra infestações de carrapatos nas paredes/frestas. Analisar o certificado de controle de pragas (desinsetização/desratização) e garantir que a aplicação seja feita com produtos e períodos de carência seguros para os animais.",
          concluido: false
        },
        {
          nome: "Revisão de Protocolos Emergenciais",
          descricao: "Checar se os contatos das clínicas/hospitais veterinários parceiros 24h e dos tutores estão atualizados e de fácil acesso para todos os monitores.",
          concluido: false
        },
        {
          nome: "Revisão Documental Legal",
          subtarefas: [
            {
              descricao: "A Anotação de Responsabilidade Técnica (ART) e o registro no CRMV estão regulares e fixados em local visível?",
              concluido: false
            },
            {
              descricao: "O Alvará de Funcionamento e as licenças da Vigilância Sanitária estão válidos?",
              concluido: false
            },
            {
              descricao: "O Manual de Boas Práticas e Procedimentos Operacionais Padrão (POPs) está acessível à equipe?",
              concluido: false
            }
          ]
        },
        {
          nome: "Capacitação da Equipe",
          descricao: "Realizar um (1) treinamento formal com a equipe de monitores. (Temas sugeridos: Primeiros Socorros em engasgos/intermação (heat stroke), Prevenção de Zoonoses, ou Manejo de Brigas no Pátio).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registrar brigas graves, fugas, surtos de tosse dos canis/giárdia, fiscalizações ou acidentes estruturais",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 4: FÁBRICA DE DEFUMADOS E EMBUTIDOS
const defaultCronogramaFabrica = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (FÁBRICA DE DEFUMADOS E EMBUTIDOS)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Controlo de aditivos, eficiência térmica (cocção/defumação) e segurança.",
      tarefas: [
        {
          nome: "Receção de Matéria-Prima",
          descricao: "Inspeção das carnes (temperatura, aspeto, carimbos do Serviço de Inspeção) e tripas (naturais ou artificiais) à chegada.",
          concluido: false
        },
        {
          nome: "Controlo de Aditivos (Cura)",
          descricao: "Supervisão rigorosa da pesagem e adição de nitratos/nitritos e antioxidantes, garantindo que não ultrapassam os limites legais permitidos.",
          concluido: false
        },
        {
          nome: "Monitorização Térmica (Cocção/Defumação)",
          descricao: "Conferir os registos de temperatura no interior das estufas e, crucialmente, no centro geométrico dos produtos (chouriços, salsichas, presuntos) para garantir a eliminação de patógenos.",
          concluido: false
        },
        {
          nome: "Higiene PPHO",
          descricao: "Inspecionar a limpeza e desinfeção de máquinas de picar (moedores), misturadoras, embutideiras, estufas e utensílios antes do início da produção.",
          concluido: false
        },
        {
          nome: "Câmaras de Cura e Secagem",
          descricao: "Controlar e registar a humidade relativa e a temperatura das câmaras onde os produtos curados/defumados repousam.",
          concluido: false
        },
        {
          nome: "Boas Práticas de Fabrico (BPF)",
          descricao: "Confirmar o uso de EPIs e uniformes limpos pela equipa, bem como a higienização das mãos e botas nas barreiras sanitárias.",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "6ª feira ou fecho de lote",
      foco: "Auditoria de formulações, rastreabilidade e higienização profunda.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Auditoria de Registos (PACs)",
          descricao: "Conferência das planilhas de produção diária, verificando se os tempos de estufa e as formulações estão de acordo com os padrões aprovados."
        },
        {
          nome: "Higienização Profunda (Estufas e Grelhas)",
          descricao: "Acompanhar a remoção de alcatrão e resíduos de fumo das estufas, carros e varas de defumação."
        },
        {
          nome: "Controlo de Rotulagem e Lotes",
          descricao: "Verificar se os produtos acabados estão corretamente rotulados (ingredientes, lote, validade, percentagem de carne/gordura e selo de inspeção)."
        },
        {
          nome: "Separação de Áreas (Contaminação Cruzada)",
          descricao: "Auditar o fluxo de trabalho para garantir que os colaboradores e equipamentos da área de carnes cruas não cruzam com a área de produtos prontos (cozidos/defumados)."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Calibração de equipamentos e monitorização analítica.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Aferição de Equipamentos",
          descricao: "Testar e calibrar balanças (especialmente as usadas para aditivos finos) e termómetros de espeto (fundamentais para a temperatura interna dos produtos)."
        },
        {
          nome: "Análises Laboratoriais (Amostragem)",
          descricao: "Recolha de produtos acabados para análises microbiológicas (ex: Salmonella, Listeria, coliformes) e físico-químicas (teor de humidade, proteínas, nitritos residuais), conforme o plano APPCC/HACCP."
        },
        {
          nome: "Reunião de Produção",
          descricao: "Reunião breve com os operadores das estufas e embutideiras para avaliar quebras de tripa, problemas de coloração da defumação ou falhas mecânicas."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Gestão de pragas, água, documentação e treino.",
      concluido: false,
      tarefas: [
        {
          nome: "Controlo da Água",
          descricao: "Analisar os relatórios de qualidade da água (cloro residual, pH, análises microbiológicas da rede de abastecimento).",
          concluido: false
        },
        {
          nome: "Atualização do APPCC / HACCP",
          descricao: "Rever o plano de Análise de Perigos, verificando se houve falhas nos limites críticos de cocção ou níveis de conservantes no mês anterior.",
          concluido: false
        },
        {
          nome: "Gestão de Pragas (Vetores)",
          descricao: "Acompanhar a vistoria da empresa especializada, com atenção especial às áreas de armazenamento de especiarias e tripas secas (focos comuns de insetos).",
          concluido: false
        },
        {
          nome: "Revisão Documental e Legal",
          subtarefas: [
            {
              descricao: "A Anotação de Responsabilidade Técnica (ART) e as licenças sanitárias/ambientais estão válidas?",
              concluido: false
            },
            {
              descricao: "Os memoriais descritivos dos produtos estão atualizados e aprovados pelo Serviço de Inspeção?",
              concluido: false
            },
            {
              descricao: "Os exames médicos (ASO) dos manipuladores estão em dia?",
              concluido: false
            }
          ]
        },
        {
          nome: "Programa de Formação da Equipa",
          descricao: "Realizar um (1) treino documentado (Ex: Perigos do excesso de nitritos, Manuseamento seguro de facas, ou Contaminação por Listeria em áreas húmidas).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registar devoluções de lotes, problemas com fumo/lenha, reprovação em testes laboratoriais ou autuações",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 5: LATICÍNIOS / INDÚSTRIA DE LEITE
const defaultCronogramaLaticinio = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (LATICÍNIOS / INDÚSTRIA DE LEITE)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Qualidade do leite cru, eficiência térmica e prevenção de contaminações.",
      tarefas: [
        {
          nome: "Receção do Leite (Testes de Plataforma)",
          descricao: "Supervisionar ou realizar os testes de aprovação do leite cru (Alizarol, temperatura, acidez titulável, densidade, crioscopia, pesquisa de antibióticos e fraudes/adulterantes).",
          concluido: false
        },
        {
          nome: "Tratamento Térmico (Pasteurização/UHT)",
          descricao: "Conferir os gráficos/discos dos termógrafos e validar a eficácia do tratamento através dos testes de Fosfatase Alcalina (negativo) e Peroxidase (positivo).",
          concluido: false
        },
        {
          nome: "Higiene Pré-Operacional e Operacional (PPHO e CIP)",
          descricao: "Inspecionar a eficiência das limpezas in circuito fechado (CIP - Cleaning in Place) de silos, tubulações e pasteurizadores, bem como a limpeza manual de tanques e formas de queijo.",
          concluido: false
        },
        {
          nome: "Controlo de Temperaturas",
          descricao: "Monitorizar as temperaturas dos silos de leite cru, tanques de fermentação, câmaras de cura/maturação e câmaras frigoríficas de produtos acabados.",
          concluido: false
        },
        {
          nome: "Documentação de Trânsito",
          descricao: "Verificação da documentação de origem do leite (ex: rotas de recolha, GTA se aplicável, boletins sanitários de rebanhos).",
          concluido: false
        },
        {
          nome: "Equipa e Boas Práticas de Fabrico (BPF)",
          descricao: "Confirmar o uso adequado de fardamentos claros e limpos, toucas, máscaras, botas e a correta lavagem e desinfeção das mãos nas barreiras sanitárias.",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "6ª feira ou fecho do ciclo produtivo",
      foco: "Auditoria de autocontrolos, água e rastreabilidade.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Auditoria de Registos dos PACs",
          descricao: "Conferência por amostragem das planilhas preenchidas pelos operadores relativas aos Programas de Autocontrolo (temperaturas, dosagens de ingredientes, tempos de coagulação)."
        },
        {
          nome: "Controlo da Água",
          descricao: "Verificação dos níveis de cloro livre residual e pH da água de abastecimento industrial (fundamental para evitar contaminação do leite nas lavagens)."
        },
        {
          nome: "Gestão de Pragas (Telas e Barreiras)",
          descricao: "Inspeção visual das barreiras físicas do laticínio, como telas milimétricas nas janelas das zonas de fabrico e ralos sifonados, evitando a entrada de insetos (especialmente moscas)."
        },
        {
          nome: "Rastreabilidade e Rotulagem",
          descricao: "Verificação do correto preenchimento dos lotes de produção, adição de fermentos/coalhos e conferência de rotulagem das embalagens (datas de fabrico e validade)."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Calibração analítica, qualidade do produto e alinhamento de equipa.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Verificação de Equipamentos Críticos",
          descricao: "Aferição da calibração de termómetros, crioscópios, lactodensímetros, balanças e sensores do painel do pasteurizador."
        },
        {
          nome: "Análises Laboratoriais Externas/Internas",
          descricao: "Recolha de amostras de água, swabs de superfícies (mãos, equipamentos) e de produtos acabados (queijos, iogurtes, manteiga) para envio ao laboratório microbiológico/físico-químico de referência."
        },
        {
          nome: "Reunião de Produção e Qualidade",
          descricao: "Breve reunião (briefing) com chefias de produção para análise de rendimento do leite, problemas de coagulação ou eventuais devoluções de mercado na quinzena."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Gestão documental, ambiental e cumprimento de normas do SIF/SIE/SIM.",
      concluido: false,
      tarefas: [
        {
          nome: "Gestão do Soro de Leite e Efluentes",
          descricao: "Auditar o destino do soro (se encaminhado para alimentação animal ou tratamento) e verificar o funcionamento da Estação de Tratamento de Efluentes (ETE), garantindo que os parâmetros de descarga estão dentro da lei.",
          concluido: false
        },
        {
          nome: "Atualização do APPCC / HACCP",
          descricao: "Revisão do plano de Análise de Perigos e Pontos Críticos de Controlo, avaliando limites críticos (ex: quebras na cadeia de frio ou falhas na pasteurização) e ações corretivas.",
          concluido: false
        },
        {
          nome: "Controlo de Pragas Oficial",
          descricao: "Acompanhar a visita da empresa especializada em desinsetização/desratização e arquivar os relatórios.",
          concluido: false
        },
        {
          nome: "Revisão Documental Legal",
          subtarefas: [
            {
              descricao: "A Anotação de Responsabilidade Técnica (ART) e o registo no CRMV estão regulares?",
              concluido: false
            },
            {
              descricao: "As licenças (Sanitária, Ambiental e Serviço de Inspeção Oficial) estão válidas?",
              concluido: false
            },
            {
              descricao: "Os exames médicos de saúde ocupacional (ASO) da equipa estão atualizados (controlo de doenças transmitidas por alimentos)?",
              concluido: false
            }
          ]
        },
        {
          nome: "Programa de Formação",
          descricao: "Realizar pelo menos uma (1) capacitação oficial com a equipa (Ex: Higienização CIP, Contaminação Cruzada, Diluição de Produtos Químicos ou Controlo de Adulterantes).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registar devoluções de leite por acidez/antibióticos, falhas de equipamento, autuações da Inspeção ou resultados laboratoriais fora do padrão",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 6: FRIGORÍFICOS / INDÚSTRIA DE CARNES
const defaultCronogramaFrigorifico = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (FRIGORÍFICOS / INDÚSTRIA DE CARNES)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar diariamente",
      foco: "Bem-Estar Animal, Higiene Operacional e Segurança Alimentar contínua.",
      tarefas: [
        {
          nome: "Bem-Estar Animal (Abate)",
          descricao: "Inspeção rigorosa na receção, descarga, currais de descanso, dieta hídrica, condução e eficácia da insensibilização/atordoamento.",
          concluido: false
        },
        {
          nome: "Documentação de Trânsito",
          descricao: "Verificação das Guias de Trânsito Animal (GTA) e dos certificados sanitários que acompanham os lotes.",
          concluido: false
        },
        {
          nome: "Higiene Pré-Operacional e Operacional (PPHO)",
          descricao: "Auditar a higienização das linhas de abate, salas de desmancha/corte, facas, serras e esterilizadores antes e durante o funcionamento.",
          concluido: false
        },
        {
          nome: "Inspeção Sanitária",
          descricao: "Acompanhamento da Inspeção Ante-Mortem e Post-Mortem (junto aos médicos-veterinários oficiais do SIF/SIE/SIM).",
          concluido: false
        },
        {
          nome: "Controlo de Temperaturas",
          descricao: "Monitorização das câmaras de refrigeração/arrefecimento, túneis de congelação e temperatura ambiente das salas de processamento.",
          concluido: false
        },
        {
          nome: "Gestão de Subprodutos e Resíduos",
          descricao: "Garantir a segregação e destino correto de Material de Risco Específico (MRE), condenações e encaminhamento à graxaria/unidade de subprodutos.",
          concluido: false
        },
        {
          nome: "Equipa e Barreiras Sanitárias",
          descricao: "Confirmar o uso adequado de fardamentos, EPIs e o correto funcionamento das barreiras sanitárias (lavagem de botas e mãos).",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "6ª feira ou fecho do ciclo produtivo",
      foco: "Auditoria de autocontrolos e calibração de processos.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Auditoria de Registos dos PACs",
          descricao: "Conferência por amostragem das planilhas preenchidas pela equipa de Controlo de Qualidade relativas aos Programas de Autocontrolo."
        },
        {
          nome: "Controlo da Água",
          descricao: "Verificação dos níveis de cloro livre residual, pH e turbidez da água de abastecimento industrial."
        },
        {
          nome: "Gestão de Pragas",
          descricao: "Inspeção visual das barreiras físicas (telas, ralos sifonados, portas) e do perímetro externo quanto a focos de atração de vetores."
        },
        {
          nome: "Rastreabilidade e Rotulagem",
          descricao: "Verificação do correto preenchimento dos lotes de produção e conferência de rotulagem das carcaças e produtos embalados."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Manutenção, equipamentos e monitorização analítica.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Verificação de Equipamentos Críticos",
          descricao: "Aferição da calibração de termómetros, balanças, detetores de metais e dos equipamentos de insensibilização elétrica/pneumática."
        },
        {
          nome: "Análises Laboratoriais",
          descricao: "Recolha de amostras (ou avaliação de resultados) para análise microbiológica da água, de superfícies (swabs) e de produtos acabados, conforme o cronograma do sistema HACCP."
        },
        {
          nome: "Reunião de Produção e Qualidade",
          descricao: "Breve reunião (briefing) com chefias de produção para análise de desvios operacionais ou condenações atípicas observadas na quinzena."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Gestão documental e estratégia.",
      concluido: false,
      tarefas: [
        {
          nome: "Atualização do APPCC / HACCP",
          descricao: "Revisão do plano de Análise de Perigos e Pontos Críticos de Controlo, avaliando se os limites críticos foram respeitados e se ocorreram ações corretivas eficazes no mês anterior.",
          concluido: false
        },
        {
          nome: "Gestão Ambiental e de Efluentes",
          descricao: "Verificar o funcionamento da Estação de Tratamento de Efluentes (ETE) e se as análises mensais de descarga estão dentro dos padrões normativos.",
          concluido: false
        },
        {
          nome: "Controlo de Pragas Oficial",
          descricao: "Acompanhar a visita da empresa especializada em controlo de pragas e arquivar os respetivos relatórios/certificados.",
          concluido: false
        },
        {
          nome: "Revisão Documental Legal",
          subtarefas: [
            {
              descricao: "A Anotação de Responsabilidade Técnica (ART) e o registo no CRMV estão regulares?",
              concluido: false
            },
            {
              descricao: "As licenças (Sanitária, Ambiental e de Registo no Serviço de Inspeção) estão válidas?",
              concluido: false
            },
            {
              descricao: "O atestado de saúde ocupacional (ASO) dos manipuladores está em dia?",
              concluido: false
            }
          ]
        },
        {
          nome: "Programa de Formação e Treino",
          descricao: "Realizar pelo menos uma (1) capacitação oficial com a equipa (Ex: Boas Práticas de Fabricação, Bem-Estar Animal, Higiene Pessoal ou Limpeza e Sanitização).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registar autuações da Inspeção Oficial, quebras de equipamento, problemas de bem-estar animal ou devoluções de lotes",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

// TEMPLATE 7: AÇOUGUES / TALHOS
const defaultCronogramaAcougue = (estabelecimentoNome, rtNome, mesAno) => ({
  titulo: "CRONOGRAMA MENSAL DE ROTINAS - RESPONSABILIDADE TÉCNICA (AÇOUGUES / TALHOS)",
  cabecalho: {
    estabelecimento: estabelecimentoNome || "",
    mes_ano: mesAno || "",
    responsavel_tecnico: rtNome || ""
  },
  rotinas: {
    diarias: {
      frequencia: "Executar ou supervisionar todos os dias",
      foco: "Higiene operacional, controlo de temperatura e segurança alimentar.",
      tarefas: [
        {
          nome: "Higiene Pré-Operacional (PPHO)",
          descricao: "Inspecionar visualmente a limpeza de balcões, serras, picadoras/moedores, facas e tábuas antes do início das atividades.",
          concluido: false
        },
        {
          nome: "Controlo de Temperaturas",
          descricao: "Medir e registar a temperatura das câmaras frigoríficas (refrigeração e congelação), balcões de exposição e ilhas.",
          concluido: false
        },
        {
          nome: "Receção de Matéria-Prima",
          descricao: "Verificar a temperatura da carne à chegada, aspeto visual, carimbos de inspeção sanitária (SIF/SIE/SIM) e Guias de Trânsito (GTA/CSI).",
          concluido: false
        },
        {
          nome: "Equipa e Fardamento",
          descricao: "Confirmar se os manipuladores estão com uniformes limpos, toucas, calçado adequado, mãos higienizadas e sem adornos (anéis, brincos, relógios).",
          concluido: false
        },
        {
          nome: "Gestão de Resíduos",
          descricao: "Assegurar que as quebras, ossos e sebo estão acondicionados in recipientes próprios, identificados e armazenados em local refrigerado até à recolha.",
          concluido: false
        },
        {
          nome: "Prevenção de Contaminação Cruzada",
          descricao: "Garantir a separação adequada entre diferentes tipos de carnes (ex: aves e bovinos) e entre produtos crus e temperados/processados.",
          concluido: false
        }
      ]
    },
    semanais: {
      frequencia: "Sexta-feira ou véspera de maior movimento",
      foco: "Manutenção da qualidade, validade e limpeza profunda.",
      semanas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false },
        { numero: 3, concluido: false },
        { numero: 4, concluido: false }
      ],
      tarefas: [
        {
          nome: "Higienização Profunda",
          descricao: "Acompanhar ou auditar a desmontagem e lavagem profunda de equipamentos críticos (serras-fita, amaciadores, picadoras de carne)."
        },
        {
          nome: "Controlo de Validades e Rotação (PVPS)",
          descricao: "Auditar as câmaras e balcões garantindo a regra 'Primeiro a Vencer, Primeiro a Sair'. Retirar produtos próximos do fim da validade."
        },
        {
          nome: "Auditoria de Registos",
          descricao: "Verificar se a equipa preencheu corretamente todas as planilhas diárias de controlo de temperatura e limpeza ao longo da semana."
        },
        {
          nome: "Cloração da Água",
          descricao: "Verificar os níveis de cloro livre na água de abastecimento do estabelecimento (se aplicável/exigido pela legislação local)."
        }
      ]
    },
    quinzenais: {
      frequencia: "Dias 15 e 30",
      foco: "Ferramentas de trabalho e alinhamento de equipa.",
      quinzenas: [
        { numero: 1, concluido: false },
        { numero: 2, concluido: false }
      ],
      tarefas: [
        {
          nome: "Verificação de Equipamentos de Medição",
          descricao: "Checar a integridade e aferir/calibrar termómetros de espeto e balanças de pesagem."
        },
        {
          nome: "Reunião de Alinhamento (Briefing)",
          descricao: "Reunião rápida (10-15 min) com os manipuladores de carnes para reforçar pontos falhos observados nas Boas Práticas (ex: lavagem de mãos, uso da chaira, organização da câmara)."
        },
        {
          nome: "Inspeção de Embalagens",
          descricao: "Verificar as condições de armazenamento das embalagens (sacos, cuvetes, película aderente), que devem estar protegidas de poeiras e humidade."
        }
      ]
    },
    mensais: {
      frequencia: "1º ao 5º dia útil do mês",
      foco: "Gestão documental, fiscalização e programas de autocontrolo.",
      concluido: false,
      tarefas: [
        {
          nome: "Rastreabilidade e Arquivo",
          descricao: "Organizar e arquivar os certificados sanitários, notas fiscais e rótulos das carcaças/peças recebidas no mês para garantir a rastreabilidade em caso de fiscalização.",
          concluido: false
        },
        {
          nome: "Controlo de Pragas",
          descricao: "Verificar as iscas e armadilhas. Analisar o certificado de desinsetização/desratização (se está próximo do vencimento, providenciar a renovação com empresa certificada).",
          concluido: false
        },
        {
          nome: "Revisão Documental (Manuais e POPs)",
          subtarefas: [
            {
              descricao: "O Manual de Boas Práticas de Fabricação (MBPF) está atualizado e acessível?",
              concluido: false
            },
            {
              descricao: "Os Procedimentos Operacionais Padrão (POPs) estão a ser seguidos?",
              concluido: false
            },
            {
              descricao: "O Atestado de Saúde Ocupacional (ASO) dos manipuladores está em dia?",
              concluido: false
            }
          ]
        },
        {
          nome: "Gestão Legal",
          descricao: "Confirmar a validade do Alvará Sanitário, Licença de Funcionamento, e se a Anotação de Responsabilidade Técnica (ART) está regular e afixada em local visível.",
          concluido: false
        },
        {
          nome: "Treinamento Continuado",
          descricao: "Realizar um (1) treino formal e documentado com a equipa (Ex: Doenças Transmitidas por Alimentos - DTA, higienização de balcões, ou atendimento seguro).",
          concluido: false
        }
      ]
    }
  },
  ocorrencias_plano_acao: {
    descricao: "Registar avarias em câmaras frigoríficas, interceções de carne sem procedência, fiscalizações recebidas, etc.",
    registos: []
  },
  assinatura: {
    nome_legivel: "",
    carimbo_crmv: ""
  }
});

export default function RotinaDiaria() {
  const userData = useUserData();
  const [abaAtiva, setAbaAtiva] = useState(0); // 0 = Registro Diário, 1 = Cronograma Mensal
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [unidade, setUnidade] = useState(null);

  // Estados do Cronograma Mensal
  const [cronoLoading, setCronoLoading] = useState(false);
  const [cronoSalvarLoading, setCronoSalvarLoading] = useState(false);
  const [cronoSucesso, setCronoSucesso] = useState(false);
  const [cronoErro, setCronoErro] = useState("");
  const [selectedMesAno, setSelectedMesAno] = useState("");
  const [cronograma, setCronograma] = useState(null);

  const [form, setForm] = useState({
    temps: ["", ""], // Array dinâmico de temperaturas
    tempAmbiente: "",
    ocorrencias: "",
    limpezaConcluida: false,
    conferenciaValidade: false,
    checkEquipamentos: false,
    // Laticínios / Leite
    testeAlizarol: "",
    testeDensidade: "",
    higieneOrdenhaCIP: false,
    // Clínica
    armarioControladosTrancado: false,
    // Comércio
    balancoMedicamentos: false,
    conferenciaReceitas: false,
    // Rural / Corte
    vacinacaoDia: false,
    bemEstarCheck: false,
    limpezaCochos: false,
    // Creche e Hotel
    triagemAdmissao: false,
    limpezaBaias: false,
    // POA
    liberacaoPPHO: false,
    monitoramentoPCC: false,
    // Laboratório
    controleQualidade: false,
    calibracaoDiaria: false,
    // Blindagem 360°
    checkEpiDigital: false,
    vazaoPressaoAgua: false,
    rodizioSaudeMental: false,
  });

  // Inicializar o Mês/Ano atual no padrão "Mês / Ano"
  useEffect(() => {
    const data = new Date();
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const mesAtual = meses[data.getMonth()];
    const anoAtual = data.getFullYear();
    setSelectedMesAno(`${mesAtual} / ${anoAtual}`);
  }, []);

  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) return;
    fetchUnidade();
    fetchHistorico();
  }, [userData?.uid, userData?.selectedClinicaId]);

  // Carregar ou inicializar o Cronograma sempre que a Unidade ou o Mês/Ano mudar
  useEffect(() => {
    if (!userData?.selectedClinicaId || !selectedMesAno) return;
    fetchCronograma();
  }, [userData?.selectedClinicaId, selectedMesAno, unidade?.id]);

  // Atualizar estabelecimento no cronograma quando unidade carregar
  useEffect(() => {
    if (unidade && cronograma && !cronograma.cabecalho.estabelecimento) {
      setCronograma(prev => ({
        ...prev,
        cabecalho: {
          ...prev.cabecalho,
          estabelecimento: unidade.nomeFantasia || ""
        }
      }));
    }
  }, [unidade, cronograma]);

  const fetchUnidade = async () => {
    const snap = await getDoc(doc(db, "clinicas", userData.selectedClinicaId));
    if (snap.exists()) setUnidade({ id: snap.id, ...snap.data() });
  };

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "rotinas_diarias"),
        where("clinicaId", "==", userData.selectedClinicaId),
        orderBy("criadoEm", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setHistorico(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCronograma = async () => {
    setCronoLoading(true);
    setCronoErro("");
    try {
      const docId = `${userData.selectedClinicaId}_${selectedMesAno.replace(/\s+/g, "").replace(/\//g, "_")}`;
      const docRef = doc(db, "cronogramas_mensais", docId);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setCronograma(snap.data());
      } else {
        // Inicializar de forma 100% dinâmica baseado na área de atuação real da unidade!
        const areaStrTemp = unidade ? (TIPO_PARA_AREA[unidade.tipo] || unidade.areaAtuacao) : "pequenos_animais";
        const isLabTemp = areaStrTemp === "areas_especiais" || unidade?.tipo === "laboratorio";
        const isCrecheTemp = areaStrTemp === "creche_hotel" || unidade?.tipo === "creche_hotel";
        const isLaticinioTemp = areaStrTemp === "laticinio" || unidade?.tipo === "laticinio" || unidade?.tipo === "bovinocultura_leite";
        const isFrigorificoTemp = areaStrTemp === "producao_origem_animal" || unidade?.tipo === "frigorifico" || unidade?.tipo === "abatedouro";
        const isFabricaTemp = areaStrTemp === "producao_origem_animal" || areaStrTemp === "industria_alimentos" || unidade?.tipo === "fabrica_embutidos" || unidade?.tipo === "fabrica_defumados" || unidade?.tipo === "fabrica_racao";
        const isAcougueTemp = areaStrTemp === "comercio_varejista" || unidade?.tipo === "acougue" || unidade?.tipo === "casa_carnes";

        let templateBase;
        if (isAcougueTemp) {
          templateBase = defaultCronogramaAcougue(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else if (isFrigorificoTemp) {
          templateBase = defaultCronogramaFrigorifico(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else if (isLaticinioTemp) {
          templateBase = defaultCronogramaLaticinio(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else if (isFabricaTemp) {
          templateBase = defaultCronogramaFabrica(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else if (isCrecheTemp) {
          templateBase = defaultCronogramaCreche(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else if (isLabTemp) {
          templateBase = defaultCronogramaLab(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        } else {
          templateBase = defaultCronogramaPetAgro(unidade?.nomeFantasia || "", userData?.displayName || userData?.rtNome || "", selectedMesAno);
        }

        setCronograma(templateBase);
      }
    } catch (err) {
      console.error("Erro ao buscar cronograma:", err);
      setCronoErro("Erro ao carregar o cronograma mensal.");
    } finally {
      setCronoLoading(false);
    }
  };

  const handleSalvarCronograma = async () => {
    if (!userData?.selectedClinicaId || !cronograma) return;
    setCronoSalvarLoading(true);
    setCronoSucesso(false);
    setCronoErro("");
    try {
      const docId = `${userData.selectedClinicaId}_${selectedMesAno.replace(/\s+/g, "").replace(/\//g, "_")}`;
      
      // Assinatura digital do RT via Hash SHA-256
      const dataStr = JSON.stringify(cronograma) + userData.uid + new Date().toISOString();
      const hash = await gerarHashSHA256(dataStr);
      
      const payload = {
        ...cronograma,
        clinicaId: userData.selectedClinicaId,
        userId: userData.uid,
        tenantId: unidade?.tenantId || userData.uid,
        atualizadoEm: serverTimestamp(),
        hashSeguranca: hash,
      };

      await setDoc(doc(db, "cronogramas_mensais", docId), payload);
      setCronograma(payload);
      setCronoSucesso(true);
      setTimeout(() => setCronoSucesso(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar cronograma:", err);
      setCronoErro("Erro ao salvar o cronograma mensal no banco.");
    } finally {
      setCronoSalvarLoading(false);
    }
  };

  // Handlers para manipular o estado do Cronograma
  const handleCronoCabecalhoChange = (field, val) => {
    setCronograma(prev => ({
      ...prev,
      cabecalho: { ...prev.cabecalho, [field]: val }
    }));
  };

  const handleCronoAssinaturaChange = (field, val) => {
    setCronograma(prev => ({
      ...prev,
      assinatura: { ...prev.assinatura, [field]: val }
    }));
  };

  const handleDiariaTaskChange = (taskIdx, checked) => {
    setCronograma(prev => {
      const newTarefas = [...prev.rotinas.diarias.tarefas];
      newTarefas[taskIdx] = { ...newTarefas[taskIdx], concluido: checked };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          diarias: { ...prev.rotinas.diarias, tarefas: newTarefas }
        }
      };
    });
  };

  const handleDiariaSubtaskChange = (taskIdx, subIdx, checked) => {
    setCronograma(prev => {
      const newTarefas = [...prev.rotinas.diarias.tarefas];
      const newSub = [...newTarefas[taskIdx].subtarefas];
      newSub[subIdx] = { ...newSub[subIdx], concluido: checked };
      newTarefas[taskIdx] = { ...newTarefas[taskIdx], subtarefas: newSub };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          diarias: { ...prev.rotinas.diarias, tarefas: newTarefas }
        }
      };
    });
  };

  const handleSemanaChange = (semanaIdx, checked) => {
    setCronograma(prev => {
      const newSemanas = [...prev.rotinas.semanais.semanas];
      newSemanas[semanaIdx] = { ...newSemanas[semanaIdx], concluido: checked };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          semanais: { ...prev.rotinas.semanais, semanas: newSemanas }
        }
      };
    });
  };

  const handleQuinzenaChange = (quinzenaIdx, checked) => {
    setCronograma(prev => {
      const newQuinzenas = [...prev.rotinas.quinzenais.quinzenas];
      newQuinzenas[quinzenaIdx] = { ...newQuinzenas[quinzenaIdx], concluido: checked };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          quinzenais: { ...prev.rotinas.quinzenais, quinzenas: newQuinzenas }
        }
      };
    });
  };

  const handleMensalTaskChange = (taskIdx, checked) => {
    setCronograma(prev => {
      const newTarefas = [...prev.rotinas.mensais.tarefas];
      newTarefas[taskIdx] = { ...newTarefas[taskIdx], concluido: checked };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          mensais: { ...prev.rotinas.mensais, tarefas: newTarefas }
        }
      };
    });
  };

  const handleMensalSubtaskChange = (taskIdx, subIdx, checked) => {
    setCronograma(prev => {
      const newTarefas = [...prev.rotinas.mensais.tarefas];
      const newSub = [...newTarefas[taskIdx].subtarefas];
      newSub[subIdx] = { ...newSub[subIdx], concluido: checked };
      newTarefas[taskIdx] = { ...newTarefas[taskIdx], subtarefas: newSub };
      return {
        ...prev,
        rotinas: {
          ...prev.rotinas,
          mensais: { ...prev.rotinas.mensais, tarefas: newTarefas }
        }
      };
    });
  };

  const handleAddOcorrencia = () => {
    setCronograma(prev => {
      const newRegistros = [
        ...(prev.ocorrencias_plano_acao?.registos || []),
        {
          data: new Date().toLocaleDateString("pt-BR"),
          ocorrencia: "",
          plano_acao: ""
        }
      ];
      return {
        ...prev,
        ocorrencias_plano_acao: {
          ...prev.ocorrencias_plano_acao,
          registos: newRegistros
        }
      };
    });
  };

  const handleOcorrenciaFieldChange = (idx, field, val) => {
    setCronograma(prev => {
      const newRegistros = [...prev.ocorrencias_plano_acao.registos];
      newRegistros[idx] = { ...newRegistros[idx], [field]: val };
      return {
        ...prev,
        ocorrencias_plano_acao: {
          ...prev.ocorrencias_plano_acao,
          registos: newRegistros
        }
      };
    });
  };

  const handleRemoveOcorrencia = (idx) => {
    setCronograma(prev => {
      const newRegistros = prev.ocorrencias_plano_acao.registos.filter((_, i) => i !== idx);
      return {
        ...prev,
        ocorrencias_plano_acao: {
          ...prev.ocorrencias_plano_acao,
          registos: newRegistros
        }
      };
    });
  };

  const getCronoProgresso = () => {
    if (!cronograma) return 0;
    let totais = 0;
    let concluidos = 0;

    // Diárias
    cronograma.rotinas.diarias.tarefas.forEach(t => {
      if (t.subtarefas) {
        t.subtarefas.forEach(s => {
          totais++;
          if (s.concluido) concluidos++;
        });
      } else {
        totais++;
        if (t.concluido) concluidos++;
      }
    });

    // Semanais
    cronograma.rotinas.semanais.semanas.forEach(s => {
      totais++;
      if (s.concluido) concluidos++;
    });

    // Quinzenais
    cronograma.rotinas.quinzenais.quinzenas.forEach(q => {
      totais++;
      if (q.concluido) concluidos++;
    });

    // Mensais
    cronograma.rotinas.mensais.tarefas.forEach(t => {
      if (t.subtarefas) {
        t.subtarefas.forEach(s => {
          totais++;
          if (s.concluido) concluidos++;
        });
      } else {
        totais++;
        if (t.concluido) concluidos++;
      }
    });

    if (totais === 0) return 0;
    return Math.round((concluidos / totais) * 100);
  };

  // Handlers originais de Registro Diário
  const handleTempChange = (idx, val) => {
    const newTemps = [...form.temps];
    newTemps[idx] = val;
    setForm({ ...form, temps: newTemps });
  };

  const addGeladeira = () => setForm({ ...form, temps: [...form.temps, ""] });
  const remGeladeira = () => {
    if (form.temps.length > 1) {
      const newTemps = [...form.temps];
      newTemps.pop();
      setForm({ ...form, temps: newTemps });
    }
  };

  const handleSalvar = async () => {
    if (!userData?.selectedClinicaId) return;
    setSalvando(true);
    try {
      const dataStr = JSON.stringify(form) + userData.uid + new Date().toISOString();
      const hash = await gerarHashSHA256(dataStr);

      await addDoc(collection(db, "rotinas_diarias"), {
        ...form,
        userId: userData.uid,
        tenantId: unidade?.tenantId || userData.uid,
        clinicaId: userData.selectedClinicaId,
        userName: userData.displayName || userData.rtNome || "Usuário",
        areaAtuacao: unidade?.areaAtuacao || "N/A",
        criadoEm: serverTimestamp(),
        dataRef: new Date().toLocaleDateString("pt-BR"),
        hashIntegridade: hash,
        smartId: gerarSmartID("DAILY"),
      });
      setSucesso(true);
      setForm({
        temps: form.temps.map(() => ""),
        tempAmbiente: "",
        ocorrencias: "",
        limpezaConcluida: false,
        conferenciaValidade: false,
        checkEquipamentos: false,
        testeAlizarol: "",
        testeDensidade: "",
        higieneOrdenhaCIP: false,
        armarioControladosTrancado: false,
        balancoMedicamentos: false,
        conferenciaReceitas: false,
        vacinacaoDia: false,
        bemEstarCheck: false,
        limpezaCochos: false,
        triagemAdmissao: false,
        limpezaBaias: false,
        liberacaoPPHO: false,
        monitoramentoPCC: false,
        controleQualidade: false,
        calibracaoDiaria: false,
        checkEpiDigital: false,
        vazaoPressaoAgua: false,
        rodizioSaudeMental: false,
      });
      fetchHistorico();
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar rotina:", err);
    } finally {
      setSalvando(false);
    }
  };

  const areaStr = unidade ? (TIPO_PARA_AREA[unidade.tipo] || unidade.areaAtuacao) : null;
  const isPequenosAnimais = areaStr === "pequenos_animais";
  const isPOA = areaStr === "producao_origem_animal" || areaStr === "industria_alimentos";
  const isLeite = unidade?.tipo === "bovinocultura_leite" || unidade?.tipo === "laticinio" || areaStr === "laticinio";
  const isCorte = unidade?.tipo === "bovinocultura_corte" || unidade?.tipo === "producao_rural";
  const isComercio = areaStr === "comercio_agronegocio";
  const isCreche = areaStr === "creche_hotel" || unidade?.tipo === "creche_hotel";
  const isLab = areaStr === "areas_especiais" || unidade?.tipo === "laboratorio";

  const isLaticinio = isLeite;
  const isFrigorifico = areaStr === "producao_origem_animal" || unidade?.tipo === "frigorifico" || unidade?.tipo === "abatedouro";
  const isAcougue = areaStr === "comercio_varejista" || unidade?.tipo === "acougue" || unidade?.tipo === "casa_carnes";
  const isFabrica = !isLaticinio && !isFrigorifico && !isAcougue && (areaStr === "producao_origem_animal" || areaStr === "industria_alimentos" || unidade?.tipo === "fabrica_embutidos" || unidade?.tipo === "fabrica_defumados" || unidade?.tipo === "fabrica_racao");
  
  const isRural = isCorte || isLeite;
  const isPetAgroComercio = isComercio || isPequenosAnimais || isCreche;
  const isLabSector = isLab;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto", pb: 10 }}>
      {/* Injeção de Estilos de Impressão Direta A4 */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              background: #white !important;
              color: #000 !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Header Centralizado */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} className="no-print">
        <Box>
          <Typography variant="h5" fontWeight={900} color={COR}>
            Rotina & Cronogramas do RT
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unidade?.nomeFantasia} — Unidade de {unidade?.tipo?.toUpperCase()}
          </Typography>
        </Box>
        <Chip label={new Date().toLocaleDateString("pt-BR")} sx={{ fontWeight: 700, bgcolor: COR, color: "#fff" }} />
      </Stack>

      {/* Seletor de Abas Principal */}
      <Tabs
        value={abaAtiva}
        onChange={(e, val) => setAbaAtiva(val)}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 4,
          borderBottom: "1px solid #e8f5e9",
          "& .MuiTab-root": { fontWeight: 700, textTransform: "none", fontSize: 14 }
        }}
        className="no-print"
      >
        <Tab label="📝 Registro Diário (Hoje)" icon={<CheckCircleOutlineIcon fontSize="small" />} iconPosition="start" />
        <Tab label="📅 Cronograma Mensal (Planejamento)" icon={<CalendarIcon fontSize="small" />} iconPosition="start" />
      </Tabs>

      {/* VIEW: REGISTRO DIÁRIO */}
      {abaAtiva === 0 && (
        <Box className="no-print">
          {sucesso && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Registro diário salvo com sucesso! ✅</Alert>}
          <Grid container spacing={3}>
            {/* Formulário de Registro */}
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
                <Stack spacing={3}>
                  {/* Temperaturas Dinâmicas */}
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2" fontWeight={800} color={COR} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ThermostatIcon fontSize="small" /> Controle de Frio (°C)
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={remGeladeira} sx={{ color: "#d32f2f" }} disabled={form.temps.length <= 1}><RemoveCircleOutlineIcon /></IconButton>
                        <Typography variant="caption" fontWeight={700}>{form.temps.length} Equip.</Typography>
                        <IconButton size="small" onClick={addGeladeira} sx={{ color: ACENTO }}><AddCircleOutlineIcon /></IconButton>
                      </Stack>
                    </Stack>
                    
                    <Grid container spacing={2}>
                      {form.temps.map((t, i) => (
                        <Grid item xs={6} sm={4} key={i}>
                          <TextField
                            label={`Geladeira ${i + 1}`}
                            type="number"
                            size="small"
                            fullWidth
                            value={t}
                            onChange={(e) => handleTempChange(i, e.target.value)}
                            placeholder="2 a 8"
                          />
                        </Grid>
                      ))}
                      <Grid item xs={6} sm={4}>
                        <TextField
                          label="Ambiente"
                          type="number"
                          size="small"
                          fullWidth
                          value={form.tempAmbiente}
                          onChange={(e) => setForm({ ...form, tempAmbiente: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider />

                  {/* ESPECIALIDADE: LABORATÓRIO */}
                  {isLabSector && (
                    <Box sx={{ p: 2, bgcolor: "#f3e5f5", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#6a1b9a" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🔬 Fase Analítica e Qualidade
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.controleQualidade} onChange={(e) => setForm({ ...form, controleQualidade: e.target.checked })} />}
                        label={<Typography variant="body2">Amostras de Controle Interno (CIQ) processadas e aprovadas</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.calibracaoDiaria} onChange={(e) => setForm({ ...form, calibracaoDiaria: e.target.checked })} />}
                        label={<Typography variant="body2">Verificação diária de equipamentos (Balanças, Pipetas, Estufas)</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: POA */}
                  {(isPOA || isFrigorifico || isAcougue) && (
                    <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#1565c0" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🏭 Indústria de Origem Animal / Alimentos
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.liberacaoPPHO} onChange={(e) => setForm({ ...form, liberacaoPPHO: e.target.checked })} />}
                        label={<Typography variant="body2">Liberação Pré-Operacional (PPHO) realizada com sucesso</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.monitoramentoPCC} onChange={(e) => setForm({ ...form, monitoramentoPCC: e.target.checked })} />}
                        label={<Typography variant="body2">Planilhas de monitoramento dos PCCs preenchidas em tempo real</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: LEITE */}
                  {isLeite && (
                    <Box sx={{ p: 2, bgcolor: "#e1f5fe", borderRadius: 3, mt: isPOA ? 2 : 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#0277bd" mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🥛 Testes e Higiene (Leite)
                      </Typography>
                      <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Teste Alizarol (%)"
                            size="small"
                            fullWidth
                            value={form.testeAlizarol}
                            onChange={(e) => setForm({ ...form, testeAlizarol: e.target.value })}
                            placeholder="ex: 72%"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Densidade (g/ml)"
                            size="small"
                            fullWidth
                            value={form.testeDensidade}
                            onChange={(e) => setForm({ ...form, testeDensidade: e.target.value })}
                            placeholder="ex: 1.030"
                          />
                        </Grid>
                      </Grid>
                      <FormControlLabel
                        control={<Checkbox checked={form.higieneOrdenhaCIP} onChange={(e) => setForm({ ...form, higieneOrdenhaCIP: e.target.checked })} />}
                        label={<Typography variant="body2">Limpeza CIP (Equipamentos/Ordenha) concluída com sanitizante</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: CLÍNICA */}
                  {isPequenosAnimais && (
                    <Box sx={{ p: 2, bgcolor: "#f1f8f6", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#1b4332" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🔐 Controle de Psicotrópicos
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.armarioControladosTrancado} onChange={(e) => setForm({ ...form, armarioControladosTrancado: e.target.checked })} />}
                        label={<Typography variant="body2" fontWeight={600}>Armário de substâncias controladas conferido e TRANCADO</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: CRECHE */}
                  {isCreche && (
                    <Box sx={{ p: 2, bgcolor: "#fce4ec", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#c2185b" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🐕 Rotina de Hospedagem
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.triagemAdmissao} onChange={(e) => setForm({ ...form, triagemAdmissao: e.target.checked })} />}
                        label={<Typography variant="body2">Triagem sanitária rigorosa na admissão de novos hóspedes</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.limpezaBaias} onChange={(e) => setForm({ ...form, limpezaBaias: e.target.checked })} />}
                        label={<Typography variant="body2">Limpeza das baias/alojamentos com produto virucida</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: COMÉRCIO */}
                  {isComercio && (
                    <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#e65100" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        💊 Gestão de Estoque e Receitas
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.balancoMedicamentos} onChange={(e) => setForm({ ...form, balancoMedicamentos: e.target.checked })} />}
                        label={<Typography variant="body2">Balanço de entrada/saída de medicamentos realizado</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.conferenciaReceitas} onChange={(e) => setForm({ ...form, conferenciaReceitas: e.target.checked })} />}
                        label={<Typography variant="body2">Conferência de retenção de receitas e carimbos</Typography>}
                      />
                    </Box>
                  )}

                  {/* ESPECIALIDADE: PRODUÇÃO RURAL */}
                  {isRural && (
                    <Box sx={{ p: 2, bgcolor: "#f1f8e9", borderRadius: 3 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="#558b2f" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        🐄 Manejo e Sanidade Animal (Campo)
                      </Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.vacinacaoDia} onChange={(e) => setForm({ ...form, vacinacaoDia: e.target.checked })} />}
                        label={<Typography variant="body2">Aplicação de vacinas/medicamentos do dia registrada no caderno</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.bemEstarCheck} onChange={(e) => setForm({ ...form, bemEstarCheck: e.target.checked })} />}
                        label={<Typography variant="body2">Verificação de disponibilidade de água e sombra (Bem-estar)</Typography>}
                      />
                      {isCorte && (
                        <FormControlLabel
                          control={<Checkbox checked={form.limpezaCochos} onChange={(e) => setForm({ ...form, limpezaCochos: e.target.checked })} />}
                          label={<Typography variant="body2">Limpeza e abastecimento de cochos/bebedouros confirmados</Typography>}
                        />
                      )}
                    </Box>
                  )}

                  {/* Checklist Geral */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color={COR} mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleOutlineIcon fontSize="small" /> Checklist de Conformidade
                    </Typography>
                    <Stack>
                      <FormControlLabel
                        control={<Checkbox checked={form.limpezaConcluida} onChange={(e) => setForm({ ...form, limpezaConcluida: e.target.checked })} />}
                        label={<Typography variant="body2">Limpeza e desinfecção de áreas críticas concluída</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.conferenciaValidade} onChange={(e) => setForm({ ...form, conferenciaValidade: e.target.checked })} />}
                        label={<Typography variant="body2">Conferência de validade de insumos e perecíveis</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.checkEquipamentos} onChange={(e) => setForm({ ...form, checkEquipamentos: e.target.checked })} />}
                        label={<Typography variant="body2">Verificação de equipamentos (Autoclave/Monitores)</Typography>}
                      />
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="overline" color="primary" fontWeight={800}>🛡️ Blindagem 360°</Typography>
                      <FormControlLabel
                        control={<Checkbox checked={form.checkEpiDigital} onChange={(e) => setForm({ ...form, checkEpiDigital: e.target.checked })} />}
                        label={<Typography variant="body2" fontWeight={600}>Confirmação de Uso/Entrega de EPIs (Log Digital)</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.vazaoPressaoAgua} onChange={(e) => setForm({ ...form, vazaoPressaoAgua: e.target.checked })} />}
                        label={<Typography variant="body2">Monitoramento de vazão/pressão da água (Higienização)</Typography>}
                      />
                      <FormControlLabel
                        control={<Checkbox checked={form.rodizioSaudeMental} onChange={(e) => setForm({ ...form, rodizioSaudeMental: e.target.checked })} />}
                        label={<Typography variant="body2">Validação de Escala de Rodízio (Saúde Mental)</Typography>}
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Livro de Ocorrências */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color={COR} mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <MenuBookIcon fontSize="small" /> Livro de Ocorrências e Orientações
                    </Typography>
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="Registre aqui intercorrências, orientações à equipe..."
                      value={form.ocorrencias}
                      onChange={(e) => setForm({ ...form, ocorrencias: e.target.value })}
                      sx={{ bgcolor: "#f9fdfa" }}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={salvando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSalvar}
                    disabled={salvando}
                    sx={{ bgcolor: COR, py: 1.5, borderRadius: 3, fontWeight: 800 }}
                  >
                    {salvando ? "Salvando..." : "Finalizar Registro Diário"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            {/* Histórico Recente */}
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle1" fontWeight={800} color={COR} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <HistoryIcon /> Histórico de Registros
              </Typography>
              {loading ? (
                <CircularProgress size={24} sx={{ color: ACENTO }} />
              ) : (
                <Stack spacing={2}>
                  {historico.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Nenhum registro encontrado.</Typography>
                  ) : (
                    historico.map((log) => (
                      <Card key={log.id} variant="outlined" sx={{ borderRadius: 3, borderLeft: `4px solid ${COR}` }}>
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="caption" fontWeight={800} color={COR}>{log.dataRef}</Typography>
                            <Chip label={log.areaAtuacao} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 800 }} />
                          </Stack>
                          <Stack direction="row" spacing={2} mb={1} flexWrap="wrap">
                            {log.temps?.map((t, i) => (
                              <Box key={i}>
                                <Typography variant="caption" color="text.secondary" display="block">G{i+1}</Typography>
                                <Typography variant="body2" fontWeight={700}>{t || "—"}°</Typography>
                              </Box>
                            ))}
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">Amb</Typography>
                              <Typography variant="body2" fontWeight={700}>{log.tempAmbiente || "—"}°</Typography>
                            </Box>
                          </Stack>
                          {log.testeAlizarol && (
                            <Typography variant="caption" sx={{ display: "block", color: "#0277bd", fontWeight: 700 }}>
                              🥛 Alizarol: {log.testeAlizarol} | Dens: {log.testeDensidade}
                            </Typography>
                          )}
                          {log.higieneOrdenhaCIP && (
                            <Typography variant="caption" sx={{ display: "block", color: "#0277bd", fontWeight: 700 }}>
                              🧼 CIP/Higiene Concluída
                            </Typography>
                          )}
                          {log.liberacaoPPHO && (
                            <Typography variant="caption" sx={{ display: "block", color: "#1565c0", fontWeight: 700 }}>
                              🏭 PPHO Liberado | PCCs OK: {log.monitoramentoPCC ? 'Sim' : 'Não'}
                            </Typography>
                          )}
                          {log.triagemAdmissao && (
                            <Typography variant="caption" sx={{ display: "block", color: "#c2185b", fontWeight: 700 }}>
                              🐕 Triagem & Baias OK
                            </Typography>
                          )}
                          {log.controleQualidade && (
                            <Typography variant="caption" sx={{ display: "block", color: "#6a1b9a", fontWeight: 700 }}>
                              🔬 CIQ e Calibração OK
                            </Typography>
                          )}
                          {log.armarioControladosTrancado && (
                            <Typography variant="caption" sx={{ display: "block", color: "#1b4332", fontWeight: 700 }}>
                              🔐 Armário de Controlados: TRANCADO
                            </Typography>
                          )}
                          {log.conferenciaReceitas && (
                            <Typography variant="caption" sx={{ display: "block", color: "#e65100", fontWeight: 700 }}>
                              💊 Receitas Conferidas
                            </Typography>
                          )}
                          {log.vacinacaoDia && (
                            <Typography variant="caption" sx={{ display: "block", color: "#558b2f", fontWeight: 700 }}>
                              🐄 Sanidade/Vacinação OK
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              )}
              
              <Box sx={{ mt: 4, p: 2, bgcolor: "#fff8e1", borderRadius: 3, border: "1px solid #ffe082" }}>
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberIcon sx={{ color: "#f57c00", fontSize: 20 }} />
                  <Typography variant="caption" color="#5d4037">
                    <strong>Nota do Antigravity:</strong> Este registro diário constitui prova material de que o RT está exercendo sua função de vigilância, protegendo você contra alegações de negligência.
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* VIEW: CRONOGRAMA MENSAL */}
      {abaAtiva === 1 && (
        <Box>
          {/* Seletor de Mês/Ano e Ações Rápidas de Visualização */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }} className="no-print">
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" fontWeight={800} color={COR} mb={0.5}>
                  Selecione o Mês de Referência:
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={selectedMesAno}
                  onChange={(e) => setSelectedMesAno(e.target.value)}
                >
                  {MESES_OPCOES.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: { xs: 1, sm: 2 } }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                >
                  Imprimir Cronograma
                </Button>
                <Button
                  variant="contained"
                  startIcon={cronoSalvarLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSalvarCronograma}
                  disabled={cronoSalvarLoading || !cronograma}
                  sx={{ borderRadius: 2, bgcolor: COR, "&:hover": { bgcolor: "#143628" }, textTransform: "none", fontWeight: 700 }}
                >
                  {cronoSalvarLoading ? "Salvando..." : "Salvar Cronograma"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {cronoSucesso && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }} className="no-print">Cronograma Mensal salvo e autenticado eletronicamente com sucesso! 🛡️</Alert>}
          {cronoErro && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} className="no-print">{cronoErro}</Alert>}

          {/* Validação de Unidade / Tipo para o Cronograma */}
          {!isPetAgroComercio && !isLabSector && !isFabrica && !isLaticinio && !isFrigorifico && !isAcougue && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }} className="no-print">
              <strong>Nota de Conformidade:</strong> Este cronograma mensal foi estruturado para <strong>Casas Agropecuárias, Casas de Ração, Pet Shops, Alojamentos, Creches/Hotéis, Laticínios, Frigoríficos, Açougues, Indústrias de Carnes/Embutidos e Laboratórios Veterinários</strong>. Como sua unidade selecionada possui um segmento diferente, as tarefas padrões exibidas abaixo servirão como modelo instrutivo do VERTOS OS.
            </Alert>
          )}

          {cronoLoading || !cronograma ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress sx={{ color: COR }} />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Carregando cronograma de conformidade...
              </Typography>
            </Box>
          ) : (
            <Box id="print-area">
              {/* CARTÃO/FOLHA DO CRONOGRAMA */}
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, bgcolor: "#fff", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                
                {/* Cabeçalho Oficial do Livro de Registro */}
                <Box sx={{ borderBottom: "3px solid #1b4332", pb: 2, mb: 3 }}>
                  <Typography variant="h6" fontWeight={900} color={COR} align="center" mb={1} sx={{ letterSpacing: 0.5 }}>
                    {cronograma.titulo}
                  </Typography>
                  <Typography variant="caption" display="block" align="center" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 700 }} className="no-print">
                    🛡️ LIVRO DE REGISTRO DO RESPONSÁVEL TÉCNICO VIGENTE (CFMV/MAPA)
                  </Typography>
                </Box>

                {/* Form de Cabeçalho / Metadados */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Estabelecimento"
                      size="small"
                      fullWidth
                      value={cronograma.cabecalho.estabelecimento}
                      onChange={(e) => handleCronoCabecalhoChange("estabelecimento", e.target.value)}
                      variant="standard"
                      InputProps={{ style: { fontWeight: 700 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Mês / Ano de Referência"
                      size="small"
                      fullWidth
                      value={cronograma.cabecalho.mes_ano}
                      disabled
                      variant="standard"
                      InputProps={{ style: { fontWeight: 700, color: "#000" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Médico(a) Veterinário(a) RT"
                      size="small"
                      fullWidth
                      value={cronograma.cabecalho.responsavel_tecnico}
                      onChange={(e) => handleCronoCabecalhoChange("responsavel_tecnico", e.target.value)}
                      variant="standard"
                      InputProps={{ style: { fontWeight: 700 } }}
                    />
                  </Grid>
                </Grid>

                {/* Medidor de Conformidade / Progresso - Gamificado */}
                <Card variant="outlined" sx={{ mb: 4, borderRadius: 3, bgcolor: "#f0fdf4", border: "1px dashed #52b788" }} className="no-print">
                  <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress variant="determinate" value={getCronoProgresso()} size={60} thickness={5} sx={{ color: COR }} />
                        <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" component="div" color="text.secondary" fontWeight={800}>{`${getCronoProgresso()}%`}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800} color={COR}>
                          Blindagem de Conformidade Mensal
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Marque as tarefas e feche as semanas para comprovar a fiscalização do estabelecimento perante o CRMV/MAPA.
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={getCronoProgresso() === 100 ? "100% Blindado 🛡️" : "Em execução ⏳"}
                      sx={{ fontWeight: 800, bgcolor: getCronoProgresso() === 100 ? COR : "#f59e0b", color: "#fff" }}
                    />
                  </CardContent>
                </Card>

                {/* MÓDULOS DE FREQUÊNCIA DO CRONOGRAMA */}
                <Stack spacing={3}>
                  
                  {/* 1. ROTINAS DIÁRIAS */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: `5px solid ${COR}` }}>
                    <Typography variant="subtitle1" fontWeight={900} color={COR} mb={0.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      📋 Rotinas Diárias
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                      ⏱️ Frequência: {cronograma.rotinas.diarias.frequencia} | Foco: {cronograma.rotinas.diarias.foco}
                    </Typography>
                    
                    <Stack spacing={1}>
                      {cronograma.rotinas.diarias.tarefas.map((t, tIdx) => (
                        <Box key={tIdx} sx={{ pl: 0.5 }}>
                          {t.subtarefas ? (
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Typography variant="body2" fontWeight={800} color="#333" mb={1}>
                                🧑‍⚕️ {t.nome} (Sub-checklist de segurança):
                              </Typography>
                              <Stack spacing={0.5} sx={{ pl: 3 }}>
                                {t.subtarefas.map((sub, sIdx) => (
                                  <FormControlLabel
                                    key={sIdx}
                                    control={
                                      <Checkbox
                                        checked={sub.concluido}
                                        onChange={(e) => handleDiariaSubtaskChange(tIdx, sIdx, e.target.checked)}
                                        size="small"
                                        sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography variant="body2" color="text.primary" sx={{ fontSize: 13, lineHeight: 1.3 }}>
                                          {sub.descricao}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                ))}
                              </Stack>
                            </Box>
                          ) : (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={t.concluido}
                                  onChange={(e) => handleDiariaTaskChange(tIdx, e.target.checked)}
                                  size="small"
                                  sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: 13 }}>
                                    {t.nome}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11, mt: 0.2 }}>
                                    {t.descricao}
                                  </Typography>
                                </Box>
                              }
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  {/* 2. ROTINAS SEMANAIS */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: `5px solid ${ACENTO}` }}>
                    <Typography variant="subtitle1" fontWeight={900} color={COR} mb={0.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      📦 Rotinas Semanais
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                      ⏱️ Frequência: {cronograma.rotinas.semanais.frequencia} | Foco: {cronograma.rotinas.semanais.foco}
                    </Typography>

                    {/* Instruções de Tarefas Semanais */}
                    <Box sx={{ mb: 2, bgcolor: "#fafafa", p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={800} display="block" color="text.secondary" mb={1}>
                        TAREFAS A INSPECIONAR SEMANALMENTE:
                      </Typography>
                      <Grid container spacing={2}>
                        {cronograma.rotinas.semanais.tarefas.map((t, idx) => (
                          <Grid item xs={12} sm={6} key={idx}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>
                              • {t.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                              {t.descricao}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Tracker das Semanas */}
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" mb={1}>
                      FECHAMENTO E VIGILÂNCIA DA SEMANA:
                    </Typography>
                    <Grid container spacing={1}>
                      {cronograma.rotinas.semanais.semanas.map((s, idx) => (
                        <Grid item xs={6} sm={3} key={idx}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={s.concluido}
                                onChange={(e) => handleSemanaChange(idx, e.target.checked)}
                                size="small"
                                sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                              />
                            }
                            label={
                              <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                                Semana {s.numero} Concluída
                              </Typography>
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>

                  {/* 3. ROTINAS QUINZENAIS */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #f59e0b" }}>
                    <Typography variant="subtitle1" fontWeight={900} color={COR} mb={0.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      🐜 Rotinas Quinzenais
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                      ⏱️ Frequência: {cronograma.rotinas.quinzenais.frequencia} | Foco: {cronograma.rotinas.quinzenais.foco}
                    </Typography>

                    {/* Sub-painel Instruções de Tarefas Quinzenais */}
                    <Box sx={{ mb: 2, bgcolor: "#fafafa", p: 1.5, borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={800} display="block" color="text.secondary" mb={1}>
                        TAREFAS A INSPECIONAR QUINZENALMENTE:
                      </Typography>
                      <Grid container spacing={2}>
                        {cronograma.rotinas.quinzenais.tarefas.map((t, idx) => (
                          <Grid item xs={12} sm={4} key={idx}>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>
                              • {t.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 10, lineHeight: 1.2 }}>
                              {t.descricao}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Tracker das Quinzenas */}
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" mb={1}>
                      REGISTRO DE VISTORIA QUINZENAL:
                    </Typography>
                    <Stack direction="row" spacing={4}>
                      {cronograma.rotinas.quinzenais.quinzenas.map((q, idx) => (
                        <FormControlLabel
                          key={idx}
                          control={
                            <Checkbox
                              checked={q.concluido}
                              onChange={(e) => handleQuinzenaChange(idx, e.target.checked)}
                              size="small"
                              sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                            />
                          }
                          label={
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: 13 }}>
                              {q.numero}ª Quinzena Fechada
                            </Typography>
                          }
                        />
                      ))}
                    </Stack>
                  </Paper>

                  {/* 4. ROTINAS MENSAIS */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #6a1b9a" }}>
                    <Typography variant="subtitle1" fontWeight={900} color={COR} mb={0.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      🏛️ Rotinas Mensais
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, mb: 1.5 }}>
                      ⏱️ Frequência: {cronograma.rotinas.mensais.frequencia} | Foco: {cronograma.rotinas.mensais.foco}
                    </Typography>

                    <Stack spacing={1}>
                      {cronograma.rotinas.mensais.tarefas.map((t, tIdx) => (
                        <Box key={tIdx} sx={{ pl: 0.5 }}>
                          {t.subtarefas ? (
                            <Box sx={{ mt: 1, mb: 1 }}>
                              <Typography variant="body2" fontWeight={800} color="#333" mb={1}>
                                📋 {t.nome} (Sub-checklist de regularidade):
                              </Typography>
                              <Stack spacing={0.5} sx={{ pl: 3 }}>
                                {t.subtarefas.map((sub, sIdx) => (
                                  <FormControlLabel
                                    key={sIdx}
                                    control={
                                      <Checkbox
                                        checked={sub.concluido}
                                        onChange={(e) => handleMensalSubtaskChange(tIdx, sIdx, e.target.checked)}
                                        size="small"
                                        sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                                      />
                                    }
                                    label={
                                      <Box>
                                        <Typography variant="body2" color="text.primary" sx={{ fontSize: 13, lineHeight: 1.3 }}>
                                          {sub.descricao}
                                        </Typography>
                                      </Box>
                                    }
                                  />
                                ))}
                              </Stack>
                            </Box>
                          ) : (
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={t.concluido}
                                  onChange={(e) => handleMensalTaskChange(tIdx, e.target.checked)}
                                  size="small"
                                  sx={{ color: COR, "&.Mui-checked": { color: COR } }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: 13 }}>
                                    {t.nome}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: 11, mt: 0.2 }}>
                                    {t.descricao}
                                  </Typography>
                                </Box>
                              }
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  {/* 5. LIVRO DE OCORRÊNCIAS & PLANOS DE AÇÃO - INTERATIVO */}
                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: "5px solid #d32f2f" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" fontWeight={900} color={COR} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        📖 Ocorrências e Plano de Ação
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<AddIcon />}
                        onClick={handleAddOcorrencia}
                        className="no-print"
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                      >
                        Nova Ocorrência
                      </Button>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12, mb: 2 }}>
                      {cronograma.ocorrencias_plano_acao.descricao}
                    </Typography>

                    {(cronograma.ocorrencias_plano_acao?.registos || []).length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center", bgcolor: "#fbfbfb", borderRadius: 2, border: "1px dashed #ddd" }}>
                        <Typography variant="caption" color="text.secondary">
                          Nenhuma ocorrência registrada neste mês. Tudo em perfeita conformidade! ✅
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small">
                          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, width: "15%" }}>Data</TableCell>
                              <TableCell sx={{ fontWeight: 800, width: "40%" }}>Descrição da Ocorrência</TableCell>
                              <TableCell sx={{ fontWeight: 800, width: "35%" }}>Plano de Ação Corretiva</TableCell>
                              <TableCell align="center" className="no-print" sx={{ fontWeight: 800, width: "10%" }}>Ação</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {cronograma.ocorrencias_plano_acao.registos.map((reg, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    value={reg.data}
                                    onChange={(e) => handleOcorrenciaFieldChange(idx, "data", e.target.value)}
                                    variant="standard"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    multiline
                                    value={reg.ocorrencia}
                                    onChange={(e) => handleOcorrenciaFieldChange(idx, "ocorrencia", e.target.value)}
                                    placeholder={isAcougue ? "Ex: Avaria em câmaras frigoríficas ou interceptação de carne sem procedência..." : isFrigorifico ? "Ex: Condenação de lote atípica ou falha no atordoamento..." : isLaticinio ? "Ex: Leite reprovado no alizarol..." : "Ex: Desvio de temperatura..."}
                                    variant="standard"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    multiline
                                    value={reg.plano_acao}
                                    onChange={(e) => handleOcorrenciaFieldChange(idx, "plano_acao", e.target.value)}
                                    placeholder={isAcougue ? "Ex: Manutenção emergencial, descarte e contato com Vigilância..." : isFrigorifico ? "Ex: Correção de parâmetros ou descarte..." : "Ex: Descarte ou reprocessamento..."}
                                    variant="standard"
                                  />
                                </TableCell>
                                <TableCell align="center" className="no-print">
                                  <IconButton size="small" color="error" onClick={() => handleRemoveOcorrencia(idx)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Paper>

                  {/* 6. ASSINATURA ELETRÔNICA E CARIMBO DO RT */}
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "#f9fdfa" }}>
                    <Typography variant="subtitle2" fontWeight={800} color={COR} mb={2}>
                      ✍️ Assinatura Eletrônica e Carimbo do Responsável Técnico
                    </Typography>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Assinatura por Extenso (Nome Completo)"
                          fullWidth
                          size="small"
                          value={cronograma.assinatura.nome_legivel}
                          onChange={(e) => handleCronoAssinaturaChange("nome_legivel", e.target.value)}
                          placeholder="Digite seu nome completo"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Carimbo do RT (CRMV nº / UF)"
                          fullWidth
                          size="small"
                          value={cronograma.assinatura.carimbo_crmv}
                          onChange={(e) => handleCronoAssinaturaChange("carimbo_crmv", e.target.value)}
                          placeholder="Ex: CRMV-MS 9999"
                        />
                      </Grid>
                    </Grid>

                    {/* Bloco de Termo de Autenticidade do Sistema */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: "#fff", borderRadius: 2, border: "1px solid #e8f5e9" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <CheckCircleOutlineIcon sx={{ color: COR }} />
                        <Box>
                          <Typography variant="caption" fontWeight={900} color={COR} display="block">
                            AUTENTICADO VIA VETFLOW OS E ASSINADO ELETRONICAMENTE
                          </Typography>
                          {cronograma.hashSeguranca ? (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: "monospace", fontSize: 9 }}>
                              HASH DE PROTEÇÃO LEGAL: {cronograma.hashSeguranca}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary" display="block">
                              O hash criptográfico de proteção jurídica será gerado automaticamente ao salvar o cronograma.
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  </Paper>

                </Stack>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
