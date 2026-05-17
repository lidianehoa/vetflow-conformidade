import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, Chip, Accordion, AccordionSummary,
  AccordionDetails, Checkbox, FormControlLabel, LinearProgress, Stack,
  Button, TextField, MenuItem, CircularProgress, Alert, Divider
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import SaveIcon from "@mui/icons-material/Save";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

const FLIGHT_PLAN_DATA = [
  {
    weekIndex: 0,
    title: "Semana 1: Auditoria Diagnóstica & Organização",
    focus: "Diagnóstico Inicial & Mapeamento de Risco",
    tasks: [
      {
        id: "w1_t1",
        what: "Realizar Auditoria Técnica Diagnóstica 360° em todos os setores do estabelecimento",
        why: "Mapear não-conformidades críticas e estruturais antes das fiscalizações oficiais.",
        legalRef: "Resolução CFMV nº 1275/2019 e RDC ANVISA nº 222/2018",
        who: "Responsável Técnico (RT)",
        where: "Todos os setores físicos (Recepção, Consultórios, CC, Higienização, Internação)",
        when: "Primeiros 7 dias de vigência da ART",
        how: "Utilizar o VERTOS OS móvel para auditoria in loco, gerando relatório de blindagem preliminar.",
        howMuch: "R$ 0,00 (Incluso na assinatura VERTOS PRO)"
      },
      {
        id: "w1_t2",
        what: "Organizar e inventariar fisicamente o armário de medicamentos controlados (Portaria 344/98)",
        why: "Evitar divergências com o SIPEAGRO/MAPA que acarretam multas e autuações criminais.",
        legalRef: "Portaria MS nº 344/1998 e Instrução Normativa MAPA nº 35/2015",
        who: "RT + Supervisor de Estoque",
        where: "Farmácia de controlados / Armário blindado",
        when: "Dia 3 ao Dia 5 de atuação",
        how: "Verificar lote, validade e volume físico exato de cada psicotrópico em estoque contra as fichas de registro.",
        howMuch: "R$ 0,00"
      }
    ]
  },
  {
    weekIndex: 1,
    title: "Semana 2: Elaboração de Documentos RT (Manual de Boas Práticas, PGRSS, POPs)",
    focus: "Constituição da Pasta de Segurança Sanitária",
    tasks: [
      {
        id: "w2_t1",
        what: "Redigir e validar o Manual de Boas Práticas (MBP) específico para a unidade de negócios",
        why: "Documento obrigatório que rege as boas práticas sanitárias da equipe.",
        legalRef: "RDC ANVISA nº 216/2004 e Resolução CFMV nº 1275/2019",
        who: "Responsável Técnico (RT)",
        where: "Escritório técnico do RT",
        when: "Dias 8 a 12 do cronograma",
        how: "Customizar o template de MBP gerado pelo assistente IA Vetflow e assinar via certificado ICP-Brasil.",
        howMuch: "R$ 0,00 (Templates integrados na plataforma)"
      },
      {
        id: "w2_t2",
        what: "Elaborar o Plano de Gerenciamento de Resíduos de Serviços de Saúde (PGRSS)",
        why: "Garantir o correto fluxo de segregação, acondicionamento e descarte de resíduos biológicos, químicos e perfurocortantes.",
        legalRef: "RDC ANVISA nº 222/2018 e CONAMA nº 358/2005",
        who: "Responsável Técnico (RT)",
        where: "Toda a unidade (foco nos coletores e expurgos)",
        when: "Dias 13 a 15 do cronograma",
        how: "Dimensionar a geração de resíduos, implantar as lixeiras de pedal padrão e treinar o recolhimento.",
        howMuch: "R$ 0,00 (Dimensionador online Vertos)"
      }
    ]
  },
  {
    weekIndex: 2,
    title: "Semana 3: Treinamento da Equipe & Prontuários (Res. 1653/2025)",
    focus: "Capacitação Operacional & Prontuário Médico Digital",
    tasks: [
      {
        id: "w3_t1",
        what: "Ministrar treinamento presencial de POPs e Boas Práticas de manipulação aos colaboradores",
        why: "A lei exige que toda a equipe técnica e de apoio esteja treinada e ciente dos POPs vigentes.",
        legalRef: "RDC ANVISA nº 216/2004 (Item 4.11) e Resolução CFMV nº 1275/2019",
        who: "RT (Instrução) + Todos os colaboradores",
        where: "Sala de reuniões ou recepção do estabelecimento",
        when: "Dias 16 a 18 do cronograma",
        how: "Explanar as rotinas de higiene, esterilização e registros e colher assinaturas na Ata de Treinamento.",
        howMuch: "Custos operacionais internos apenas"
      },
      {
        id: "w3_t2",
        what: "Auditar por amostragem as fichas clínicas e prontuários médicos (guarda mínima de 5 anos)",
        why: "Adequação às novas e rigorosas diretrizes de documentação clínica e consentimentos informados.",
        legalRef: "Resolução CFMV nº 1653/2025 (Regulamento de Prontuários e TCLEs)",
        who: "Responsável Técnico (RT)",
        where: "Central de Prontuários / Sistema Digital",
        when: "Dias 19 a 22 do cronograma",
        how: "Verificar se 100% dos atendimentos possuem TCLE assinado, anamnese completa, prescrição legível e carimbo com CRMV.",
        howMuch: "R$ 0,00"
      }
    ]
  },
  {
    weekIndex: 3,
    title: "Semana 4: Blindagem Legal & Ouvidoria (Simulação de Fiscalização)",
    focus: "Blindagem Final, Canal de Ouvidoria & Auditoria Interna",
    tasks: [
      {
        id: "w4_t1",
        what: "Conduzir um simulado de fiscalização sanitária rigoroso (roteiro VISA / CRMV)",
        why: "Testar o nível de preparação da unidade e eliminar gargalos finais antes de visitas reais.",
        legalRef: "Código Sanitário Estadual e Resoluções CFMV vigentes",
        who: "RT (Coordenador do Simulado)",
        where: "Toda a clínica e dependências",
        when: "Dias 23 a 26 do cronograma",
        how: "Executar o checklist fiscal completo da VISA e marcar desvios para correção imediata de 24 horas.",
        howMuch: "R$ 0,00"
      },
      {
        id: "w4_t2",
        what: "Implantar o canal oficial de Ouvidoria/Tutores e registrar as diretrizes de consentimento LGPD",
        why: "Proteção jurídica quanto ao uso de dados sensíveis e canal de melhoria contínua de compliance.",
        legalRef: "Lei nº 13.709/2018 (Lei Geral de Proteção de Dados - LGPD)",
        who: "RT + Gerente Administrativo",
        where: "Recepção e canais de atendimento digital da empresa",
        when: "Dias 27 a 30 do cronograma",
        how: "Disponibilizar o QR Code da Ouvidoria em cartaz de recepção e auditar os formulários de consentimento LGPD.",
        howMuch: "R$ 0,00"
      }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: "não_iniciado", label: "Não Iniciado", color: "#888", bg: "#f0f0f0" },
  { value: "em_andamento", label: "Em Andamento", color: "#e65100", bg: "#fff3e0" },
  { value: "concluido", label: "Concluído", color: "#1b4332", bg: "#e8f5e9" },
  { value: "critico", label: "Crítico / Atrasado", color: "#d32f2f", bg: "#ffebee" }
];

export default function FlightPlan5W2H({ clinicaId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [success, setSuccess] = useState("");

  // Estados locais das tarefas (checked / unchecked) e do status de cada semana
  const [taskStates, setTaskStates] = useState({});
  const [weekStatus, setWeekStatus] = useState({
    0: "não_iniciado",
    1: "não_iniciado",
    2: "não_iniciado",
    3: "não_iniciado"
  });
  const [weekNotes, setWeekNotes] = useState({
    0: "",
    1: "",
    2: "",
    3: ""
  });

  // Carregar dados salvos no Firestore
  useEffect(() => {
    if (!clinicaId) return;
    setLoading(true);
    setErro("");
    setSuccess("");

    const fetchFlightPlan = async () => {
      try {
        const docRef = doc(db, "flightPlans", clinicaId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setTaskStates(data.taskStates || {});
          setWeekStatus(data.weekStatus || {
            0: "não_iniciado",
            1: "não_iniciado",
            2: "não_iniciado",
            3: "não_iniciado"
          });
          setWeekNotes(data.weekNotes || {
            0: "",
            1: "",
            2: "",
            3: ""
          });
        } else {
          // Cria o documento vazio inicialmente
          const initialData = {
            clinicaId,
            taskStates: {},
            weekStatus: {
              0: "não_iniciado",
              1: "não_iniciado",
              2: "não_iniciado",
              3: "não_iniciado"
            },
            weekNotes: {
              0: "",
              1: "",
              2: "",
              3: ""
            },
            createdAt: new Date()
          };
          await setDoc(docRef, initialData);
          setTaskStates({});
          setWeekStatus(initialData.weekStatus);
          setWeekNotes(initialData.weekNotes);
        }
      } catch (err) {
        console.error("Erro ao carregar FlightPlan:", err);
        setErro("Não foi possível carregar os dados de progresso do cronograma.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlightPlan();
  }, [clinicaId]);

  // Função para calcular a porcentagem de conclusão de uma semana
  const getWeekCompletion = (weekIndex) => {
    const week = FLIGHT_PLAN_DATA[weekIndex];
    const tasks = week.tasks;
    const completedTasks = tasks.filter(t => taskStates[t.id] === true).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Tratar alteração do checkbox da tarefa
  const handleTaskToggle = async (taskId, weekIndex) => {
    const updatedTaskStates = {
      ...taskStates,
      [taskId]: !taskStates[taskId]
    };
    setTaskStates(updatedTaskStates);

    // Auto-update do status da semana
    const newCompletion = FLIGHT_PLAN_DATA[weekIndex].tasks.filter(t => updatedTaskStates[t.id] === true).length;
    const totalTasks = FLIGHT_PLAN_DATA[weekIndex].tasks.length;
    
    let newStatus = weekStatus[weekIndex];
    if (newCompletion === 0) {
      newStatus = "não_iniciado";
    } else if (newCompletion === totalTasks) {
      newStatus = "concluido";
    } else {
      newStatus = "em_andamento";
    }

    const updatedWeekStatus = {
      ...weekStatus,
      [weekIndex]: newStatus
    };
    setWeekStatus(updatedWeekStatus);

    // Salvar no Firestore
    await persistData(updatedTaskStates, updatedWeekStatus, weekNotes);
  };

  // Tratar alteração manual de status de uma semana
  const handleStatusChange = async (weekIndex, newStatus) => {
    const updatedWeekStatus = {
      ...weekStatus,
      [weekIndex]: newStatus
    };
    setWeekStatus(updatedWeekStatus);
    await persistData(taskStates, updatedWeekStatus, weekNotes);
  };

  // Tratar alteração das anotações do RT
  const handleNotesChange = (weekIndex, text) => {
    setWeekNotes(prev => ({
      ...prev,
      [weekIndex]: text
    }));
  };

  // Salvar anotações manualmente
  const handleSaveNotes = async (weekIndex) => {
    setSaving(true);
    setSuccess("");
    try {
      await persistData(taskStates, weekStatus, weekNotes);
      setSuccess(`Anotações da Semana ${weekIndex + 1} salvas com sucesso!`);
    } catch (err) {
      setErro("Falha ao salvar as anotações técnicos do RT.");
    } finally {
      setSaving(false);
    }
  };

  // Persistir dados no Firestore
  const persistData = async (tasks, status, notes) => {
    if (!clinicaId) return;
    try {
      const docRef = doc(db, "flightPlans", clinicaId);
      await setDoc(docRef, {
        clinicaId,
        taskStates: tasks,
        weekStatus: status,
        weekNotes: notes,
        updatedAt: new Date()
      }, { merge: true });
    } catch (err) {
      console.error("Erro ao salvar no Firestore:", err);
      setErro("Erro de sincronização. As alterações foram salvas apenas localmente.");
    }
  };

  if (loading) {
    return (
      <Box align="center" sx={{ p: 4 }}>
        <CircularProgress sx={{ color: "#1b4332" }} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Carregando cronograma de conformidade 5W2H...
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: "2.5px solid #1b4332", p: 0, overflow: "hidden", mb: 4, boxShadow: "0 8px 24px rgba(27,67,50,0.06)" }}>
      {/* Header Premium do FlightPlan */}
      <Box sx={{ p: 3, bgcolor: "#f1f8f6", borderBottom: "2.5px solid #1b433225", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={900} color="#1b4332" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            🚀 Plano de Voo Mensal do RT (Modelo 5W2H)
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Planejamento estruturado em 4 semanas com foco em blindagem legal, capacitação e compliance sanitário.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip label="CFMV 1653/2025" size="small" sx={{ fontWeight: 900, fontSize: 10, bgcolor: "#1b4332", color: "#fff", px: 1 }} />
          <Chip label="RDC 222/2018" size="small" sx={{ fontWeight: 900, fontSize: 10, bgcolor: "#1b4332", color: "#fff", px: 1 }} />
        </Stack>
      </Box>

      {erro && <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{erro}</Alert>}
      {success && <Alert severity="success" sx={{ m: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Box sx={{ p: 2.5 }}>
        {FLIGHT_PLAN_DATA.map((week) => {
          const compPct = getWeekCompletion(week.weekIndex);
          const currentStatusObj = STATUS_OPTIONS.find(o => o.value === weekStatus[week.weekIndex]) || STATUS_OPTIONS[0];

          // Cores exclusivas para cada semana baseadas no seu propósito
          const weekStyles = {
            0: { primary: "#e65100", light: "#fff3e0", border: "#ffe0b2", bg: "rgba(230, 81, 0, 0.02)", icon: "📋" },
            1: { primary: "#1565c0", light: "#e3f2fd", border: "#bbdefb", bg: "rgba(21, 101, 192, 0.02)", icon: "📂" },
            2: { primary: "#6a1b9a", light: "#f3e5f5", border: "#e1bee7", bg: "rgba(106, 27, 154, 0.02)", icon: "🎓" },
            3: { primary: "#2e7d32", light: "#e8f5e9", border: "#c8e6c9", bg: "rgba(46, 125, 50, 0.02)", icon: "🛡️" }
          };
          const style = weekStyles[week.weekIndex] || weekStyles[0];

          return (
            <Accordion
              key={week.weekIndex}
              elevation={0}
              sx={{
                mb: 2.5,
                border: "2px solid",
                borderColor: style.border,
                borderRadius: "16px !important",
                "&:before": { display: "none" },
                overflow: "hidden",
                boxShadow: `0 4px 12px ${style.primary}05`
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: style.primary }} />}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={7} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: "12px",
                      bgcolor: style.light, color: style.primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 950, fontSize: 20,
                      border: `1.5px solid ${style.border}`
                    }}>
                      {style.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={900} color={style.primary} sx={{ fontSize: "0.95rem" }}>
                        W{week.weekIndex + 1}: {week.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mt: 0.2 }}>
                        🎯 Foco: {week.focus}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Progresso de Tarefas e Status */}
                  <Grid item xs={12} sm={6} md={5} sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
                    <Box sx={{ width: 120 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" fontWeight={750}>Progresso</Typography>
                        <Typography variant="caption" fontWeight={950} color={style.primary}>{compPct}%</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={compPct} 
                        sx={{ 
                          height: 6, borderRadius: 3, bgcolor: style.light,
                          "& .MuiLinearProgress-bar": { bgcolor: style.primary, borderRadius: 3 }
                        }} 
                      />
                    </Box>

                    <Chip
                      label={currentStatusObj.label}
                      size="small"
                      sx={{
                        bgcolor: currentStatusObj.bg,
                        color: currentStatusObj.color,
                        fontWeight: 900,
                        fontSize: 10,
                        border: `1.5px solid ${currentStatusObj.color}25`
                      }}
                    />
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails sx={{ bgcolor: style.bg, pt: 2, px: { xs: 2, md: 3 } }}>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                  {/* Listagem de Tarefas com 5W2H Expandido */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle2" fontWeight={900} color={style.primary} mb={2}>
                      📋 Planilha 5W2H - Ações Semanais
                    </Typography>

                    <Stack spacing={2.5}>
                      {week.tasks.map((task) => (
                        <Paper
                          key={task.id}
                          variant="outlined"
                          sx={{
                            p: 2, borderRadius: 3, 
                            border: `1.5px solid ${taskStates[task.id] ? style.primary + "30" : style.border}`,
                            bgcolor: taskStates[task.id] ? style.light + "15" : "#fff",
                            boxShadow: taskStates[task.id] ? `0 2px 8px ${style.primary}10` : "none",
                            transition: "all 0.2s"
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Checkbox
                              checked={!!taskStates[task.id]}
                              onChange={() => handleTaskToggle(task.id, week.weekIndex)}
                              sx={{
                                color: style.primary, p: 0.5,
                                "&.Mui-checked": { color: style.primary }
                              }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight={850} color="#1b4332" mb={1} sx={{ textDecoration: taskStates[task.id] ? "line-through" : "none", opacity: taskStates[task.id] ? 0.65 : 1 }}>
                                {task.what}
                              </Typography>

                              {/* Grid 5W2H detalhado */}
                              <Grid container spacing={1.5} sx={{ mt: 0.5, p: 1.5, bgcolor: style.light + "10", borderRadius: 2, border: `1.2px solid ${style.border}50` }}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption" color="text.secondary" display="block"><strong>WHY (Por que):</strong> {task.why}</Typography>
                                  <Typography variant="caption" color={style.primary} display="block" sx={{ mt: 0.5, fontWeight: 800 }}><strong>REF. LEGAL:</strong> {task.legalRef}</Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}><strong>WHO (Quem):</strong> {task.who}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="caption" color="text.secondary" display="block"><strong>WHERE (Onde):</strong> {task.where}</Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}><strong>WHEN (Quando):</strong> {task.when}</Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}><strong>HOW (Como):</strong> {task.how}</Typography>
                                  <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5, fontWeight: 800 }}><strong>HOW MUCH (Quanto):</strong> {task.howMuch}</Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Grid>

                  {/* Painel Administrativo de Controle da Semana */}
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: "#fff", height: "100%", border: `1.5px solid ${style.border}` }}>
                      <Typography variant="subtitle2" fontWeight={900} color={style.primary} mb={2}>
                        ⚙️ Controle Administrativo
                      </Typography>

                      <Stack spacing={2.5}>
                        {/* Seletor de Status Manual */}
                        <Box>
                          <TextField
                            select
                            label="Status da Semana"
                            value={weekStatus[week.weekIndex]}
                            onChange={(e) => handleStatusChange(week.weekIndex, e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{ style: { borderRadius: 8 } }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13, fontWeight: 700 }}>
                                <Chip label={opt.label} size="small" sx={{ bgcolor: opt.bg, color: opt.color, fontWeight: 900, height: 20, fontSize: 10 }} />
                              </MenuItem>
                            ))}
                          </TextField>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            Você pode forçar manualmente o status da semana se necessário.
                          </Typography>
                        </Box>

                        <Divider />

                        {/* Parecer / Anotações do RT */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <TextField
                            label="Anotações do RT & Parecer Técnico"
                            multiline
                            rows={4}
                            value={weekNotes[week.weekIndex] || ""}
                            onChange={(e) => handleNotesChange(week.weekIndex, e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Adicione notas sobre auditorias, problemas de infraestrutura ou desvios de processo observados nesta semana..."
                            InputProps={{ style: { borderRadius: 8 } }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                            onClick={() => handleSaveNotes(week.weekIndex)}
                            disabled={saving}
                            sx={{
                              borderRadius: 2, textTransform: "none", fontWeight: 800, borderColor: style.primary, color: style.primary,
                              "&:hover": { borderColor: style.primary, bgcolor: style.light + "30" }
                            }}
                          >
                            Salvar Anotações
                          </Button>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Paper>
  );
}
