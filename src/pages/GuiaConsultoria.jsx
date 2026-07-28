import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, TextField, Grid, Stepper, Step, StepLabel, StepContent,
  Card, CardContent, Divider, Chip, IconButton, CircularProgress, Alert, List, ListItem,
  ListItemText, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, Radio, RadioGroup
} from "@mui/material";
import {
  Add as AddIcon, Explore as ExploreIcon, UploadFile as UploadFileIcon, Description as DescriptionIcon,
  Agriculture as AgricultureIcon, Analytics as AnalyticsIcon, WaterDrop as WaterDropIcon, Pets as PetsIcon
} from "@mui/icons-material";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";

// ── COMPONENTES DE FASES (ESPECÍFICOS POR SISTEMA) ───────────────────────────

function Fase1({ dados, setDados, pendencias, setPendencias }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Faça um raio-x estrutural, sanitário e zootécnico. Identifique os gargalos produtivos atuais.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Situação da Estrutura (Pastos, Currais, Bebedouros, Sala de Ordenha)"
            fullWidth multiline rows={2}
            value={dados.estrutura || ""}
            onChange={e => setDados({...dados, estrutura: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Status Sanitário (Vacinas obrigatórias, surtos recentes)"
            fullWidth multiline rows={2}
            value={dados.sanitario || ""}
            onChange={e => setDados({...dados, sanitario: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Principais Gargalos ou Pendências a Corrigir"
            fullWidth multiline rows={2}
            value={pendencias || ""}
            onChange={e => setPendencias(e.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function Fase2({ dados, setDados, sistema }) {
  const getPOPs = () => {
    if (sistema === "cria") return [
      { id: "colostro", label: "POP de Colostragem (Brix >22%)" },
      { id: "umbigo", label: "POP de Cura de Umbigo (Iodo 10%)" },
      { id: "vacina", label: "POP de Vacinação (Brucelose, IBR/BVD)" },
      { id: "desmame", label: "Protocolo de Desmame (Creep-feeding)" }
    ];
    if (sistema === "engorda") return [
      { id: "recepcao", label: "Protocolo de Recepção/Triagem e Vacinas" },
      { id: "dieta", label: "POP de Adaptação de Dieta (Rampas de Amido)" },
      { id: "verme", label: "Controle Parasitário e Vermifugação Estratégica" },
      { id: "carencia", label: "Manejo Rigoroso de Períodos de Carência" }
    ];
    if (sistema === "leite") return [
      { id: "ordenha", label: "POP de Ordenha (Pre/Post-Dipping, Caneco)" },
      { id: "cip", label: "POP de Lavagem CIP do Sistema/Tanque" },
      { id: "anionica", label: "Protocolo de Dieta Aniônica (Pré-parto)" },
      { id: "antibiotico", label: "Gestão e Teste de Resíduos de Antibióticos no Leite" }
    ];
    return [];
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Implemente e audite os Procedimentos Operacionais essenciais para este sistema.
      </Typography>
      <Grid container spacing={1}>
        {getPOPs().map(pop => (
          <Grid item xs={12} key={pop.id}>
            <FormControlLabel
              control={<Checkbox checked={dados[pop.id] || false} onChange={e => setDados({...dados, [pop.id]: e.target.checked})} />}
              label={pop.label}
            />
          </Grid>
        ))}
      </Grid>
      <TextField
        label="Anotações sobre a adequação dos POPs"
        fullWidth multiline rows={2} sx={{ mt: 2 }}
        value={dados.obsPops || ""}
        onChange={e => setDados({...dados, obsPops: e.target.value})}
      />
    </Box>
  );
}

function Fase3({ dados, setDados }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Educação continuada: registre os treinamentos práticos aplicados para vaqueiros e retireiros.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tema do Treinamento Realizado"
            fullWidth size="small"
            value={dados.temaTreinamento || ""}
            onChange={e => setDados({...dados, temaTreinamento: e.target.value})}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Carga Horária (horas)"
            type="number" fullWidth size="small"
            value={dados.cargaHoraria || ""}
            onChange={e => setDados({...dados, cargaHoraria: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Lista de Participantes (Nomes/Funções)"
            fullWidth multiline rows={2}
            value={dados.participantes || ""}
            onChange={e => setDados({...dados, participantes: e.target.value})}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

function Fase4({ dados, setDados, sistema }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Monitoramento técnico da rotina. Colete os indicadores táticos da propriedade.
      </Typography>
      
      {sistema === "cria" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Fase da Estação de Monta" fullWidth size="small" value={dados.estacao || ""} onChange={e => setDados({...dados, estacao: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel control={<Checkbox checked={dados.andrologico || false} onChange={e => setDados({...dados, andrologico: e.target.checked})} />} label="Exames Andrológicos OK?" />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Resultados de D.G. (Diagnóstico Gestação) e IATF" fullWidth multiline rows={2} value={dados.dg || ""} onChange={e => setDados({...dados, dg: e.target.value})} />
          </Grid>
        </Grid>
      )}

      {sistema === "engorda" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="GMD Atual (Kg/dia)" type="number" fullWidth size="small" value={dados.gmd || ""} onChange={e => setDados({...dados, gmd: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField label="Score de Cocho e Qualidade da Água" fullWidth size="small" value={dados.cocho || ""} onChange={e => setDados({...dados, cocho: e.target.value})} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Relato Clínico (Lama, Estresse Térmico, Acidose, Casco)" fullWidth multiline rows={2} value={dados.clinico || ""} onChange={e => setDados({...dados, clinico: e.target.value})} />
          </Grid>
        </Grid>
      )}

      {sistema === "leite" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="CCS Atual (x1000 cel/mL)" type="number" fullWidth size="small" value={dados.ccs || ""} onChange={e => setDados({...dados, ccs: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="CBT do Tanque" type="number" fullWidth size="small" value={dados.cbt || ""} onChange={e => setDados({...dados, cbt: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Média Prod. (L/Vaca/Dia)" type="number" fullWidth size="small" value={dados.litrosVaca || ""} onChange={e => setDados({...dados, litrosVaca: e.target.value})} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Acompanhamento Metabólico (Pré/Pós-Parto)" fullWidth multiline rows={2} value={dados.metabolico || ""} onChange={e => setDados({...dados, metabolico: e.target.value})} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

function Fase5({ dados, setDados, sistema }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Análise Econômica (KPIs): Consolide os índices reprodutivos, produtivos e emita o parecer ao proprietário.
      </Typography>
      
      {sistema === "cria" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="Taxa de Prenhez (%)" type="number" fullWidth size="small" value={dados.taxaPrenhez || ""} onChange={e => setDados({...dados, taxaPrenhez: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Taxa de Desmame (%)" type="number" fullWidth size="small" value={dados.taxaDesmame || ""} onChange={e => setDados({...dados, taxaDesmame: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Kg de Bezerro / Vaca" type="number" fullWidth size="small" value={dados.kgBezerro || ""} onChange={e => setDados({...dados, kgBezerro: e.target.value})} />
          </Grid>
        </Grid>
      )}

      {sistema === "engorda" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField label="Ganho de Carcaça (Kg)" type="number" fullWidth size="small" value={dados.ganhoCarcaca || ""} onChange={e => setDados({...dados, ganhoCarcaca: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Eficiência Alimentar" fullWidth size="small" value={dados.eficiencia || ""} onChange={e => setDados({...dados, eficiencia: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Rendimento de Carcaça (%)" type="number" fullWidth size="small" value={dados.rendimento || ""} onChange={e => setDados({...dados, rendimento: e.target.value})} />
          </Grid>
        </Grid>
      )}

      {sistema === "leite" && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Taxa de Prenhez Rebanho Leite (%)" type="number" fullWidth size="small" value={dados.prenhezLeite || ""} onChange={e => setDados({...dados, prenhezLeite: e.target.value})} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Intervalo entre Partos (IEP - Meses)" type="number" fullWidth size="small" value={dados.iep || ""} onChange={e => setDados({...dados, iep: e.target.value})} />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Data da Próxima Visita (Agendamento)"
            type="date" fullWidth size="small" InputLabelProps={{ shrink: true }}
            value={dados.proximaVisita || ""} onChange={e => setDados({...dados, proximaVisita: e.target.value})}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Relatório Executivo e Parecer ao Produtor"
            fullWidth multiline rows={4}
            value={dados.parecerGeral || ""} onChange={e => setDados({...dados, parecerGeral: e.target.value})}
          />
        </Grid>
      </Grid>
    </Box>
  );
}


// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

const FASES = [
  { id: 1, label: "Diagnóstico Inicial (Raio-X)", componente: Fase1, obj: "Levantamento estrutural, sanitário e zootécnico." },
  { id: 2, label: "Plano de Ação e POPs", componente: Fase2, obj: "Procedimentos, protocolos e dietas adaptadas." },
  { id: 3, label: "Treinamento e Capacitação", componente: Fase3, obj: "Qualificação da equipe de campo." },
  { id: 4, label: "Monitoramento e Visitas", componente: Fase4, obj: "Coleta de dados técnicos da rotina." },
  { id: 5, label: "Análise Econômica (KPIs)", componente: Fase5, obj: "Relatório gerencial, impacto e fechamento." },
];

const SISTEMAS = [
  { id: "cria", label: "Cria / Recria (Corte)", icon: <PetsIcon sx={{ fontSize: 40, color: "#f57c00" }} /> },
  { id: "engorda", label: "Engorda / Confinamento", icon: <AnalyticsIcon sx={{ fontSize: 40, color: "#d32f2f" }} /> },
  { id: "leite", label: "Bovinocultura de Leite", icon: <WaterDropIcon sx={{ fontSize: 40, color: "#0288d1" }} /> },
];

export default function GuiaConsultoria() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  
  const [view, setView] = useState("list"); 
  const [consultorias, setConsultorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado
  const [activeConsId, setActiveConsId] = useState(null);
  const [sistemaProducao, setSistemaProducao] = useState("cria");
  const [activeStep, setActiveStep] = useState(0);
  const [fasesData, setFasesData] = useState({});
  const [uploading, setUploading] = useState(false);

  // Dialogs
  const [openNova, setOpenNova] = useState(false);
  const [sistemaNovo, setSistemaNovo] = useState("cria");

  const [openPular, setOpenPular] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  if (!pode("novaAuditoria")) {
    return <BloqueioRecurso recurso="Consultoria Especializada" planoMinimo={planoMinimo("novaAuditoria")} />;
  }

  const clinicaId = userData?.selectedClinicaId;

  useEffect(() => {
    if (!clinicaId) return;
    loadConsultorias();
  }, [clinicaId]);

  const loadConsultorias = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "consultorias"), where("clinicaId", "==", clinicaId), orderBy("criadoEm", "desc"));
      const snap = await getDocs(q);
      setConsultorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const iniciarNovaConsultoria = async () => {
    setOpenNova(false);
    try {
      const nova = {
        tenantId: userData.uid,
        clinicaId: clinicaId,
        clinicaNome: userData?.clinicas?.find(c => c.id === clinicaId)?.nomeFantasia || "Fazenda",
        status: "Em andamento",
        faseAtual: 0,
        criadoEm: serverTimestamp(),
        fases: {},
        sistemaProducao: sistemaNovo
      };
      const ref = await addDoc(collection(db, "consultorias"), nova);
      setActiveConsId(ref.id);
      setSistemaProducao(sistemaNovo);
      setActiveStep(0);
      setFasesData({});
      setView("workflow");
    } catch (err) {
      console.error(err);
    }
  };

  const retomarConsultoria = (c) => {
    setActiveConsId(c.id);
    setSistemaProducao(c.sistemaProducao || "cria");
    setActiveStep(c.faseAtual || 0);
    setFasesData(c.fases || {});
    setView("workflow");
  };

  const getFasePayload = (status, extra = {}) => ({
    status,
    dados: fasesData[activeStep]?.dados || {},
    pendencias: fasesData[activeStep]?.pendencias || "",
    anexos: fasesData[activeStep]?.anexos || [],
    assinatura: { uid: userData.uid, nome: userData.displayName, data: new Date().toISOString() },
    ...extra
  });

  const handleNext = async () => {
    try {
      const payload = getFasePayload("concluida");
      const updatedFases = { ...fasesData, [activeStep]: payload };
      
      const nextStep = activeStep + 1;
      const isFinished = nextStep === FASES.length;
      
      await updateDoc(doc(db, "consultorias", activeConsId), {
        fases: updatedFases,
        faseAtual: isFinished ? activeStep : nextStep,
        status: isFinished ? "Concluída" : "Em andamento",
        atualizadoEm: serverTimestamp()
      });

      setFasesData(updatedFases);
      if (isFinished) {
        setView("list");
        loadConsultorias();
      } else {
        setActiveStep(nextStep);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePular = async () => {
    if (!justificativa.trim()) return alert("A justificativa é obrigatória.");
    try {
      const payload = getFasePayload("pulada", { justificativa });
      const updatedFases = { ...fasesData, [activeStep]: payload };
      
      await updateDoc(doc(db, "consultorias", activeConsId), {
        fases: updatedFases,
        faseAtual: activeStep + 1,
        atualizadoEm: serverTimestamp()
      });

      setFasesData(updatedFases);
      setActiveStep(activeStep + 1);
      setOpenPular(false);
      setJustificativa("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const storageRef = ref(storage, `consultorias/${activeConsId}/fase_${activeStep}_${Date.now()}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const currentAnexos = fasesData[activeStep]?.anexos || [];
      const updatedData = {
        ...fasesData,
        [activeStep]: { ...fasesData[activeStep], anexos: [...currentAnexos, { name: file.name, url }] }
      };
      setFasesData(updatedData);
    } catch (err) {
      console.error("Upload falhou", err);
    }
    setUploading(false);
  };

  const updateCurrentFase = (key, value) => {
    setFasesData({
      ...fasesData,
      [activeStep]: { ...(fasesData[activeStep] || {}), [key]: value }
    });
  };

  if (!clinicaId) {
    return (
      <Box p={4} textAlign="center">
        <Typography>Selecione uma fazenda/propriedade no topo.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <ExploreIcon sx={{ color: "#1b4332", fontSize: 32 }} />
        <Typography variant="h5" fontWeight={800} color="#1b4332">
          Gestor de Consultoria Especializada
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Fluxo metodológico avançado focado na rentabilidade, gestão e monitoramento zootécnico (Corte e Leite).
      </Typography>

      {view === "list" && (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1.5px solid #e8f5e9" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="subtitle1" fontWeight={800} color="#1b4332">
              Histórico de Acompanhamentos — Fazenda
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNova(true)} sx={{ bgcolor: "#1b4332" }}>
              Nova Consultoria
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {loading ? (
            <CircularProgress />
          ) : consultorias.length === 0 ? (
            <Typography color="text.secondary">Nenhuma consultoria especializada encontrada.</Typography>
          ) : (
            <List>
              {consultorias.map(c => (
                <ListItem key={c.id} sx={{ mb: 1, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <ListItemText 
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography fontWeight={700}>Consulta: {new Date(c.criadoEm?.toDate()).toLocaleDateString()}</Typography>
                        <Chip size="small" label={c.status} color={c.status === "Concluída" ? "success" : "warning"} />
                        <Chip size="small" label={SISTEMAS.find(s=>s.id === c.sistemaProducao)?.label || "Misto"} variant="outlined" />
                      </Box>
                    }
                    secondary={`Fase Atual: ${c.faseAtual + 1} / 5`}
                  />
                  {c.status !== "Concluída" && (
                    <Button variant="outlined" size="small" onClick={() => retomarConsultoria(c)}>Retomar</Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {view === "workflow" && (
        <Paper elevation={0} sx={{ p: {xs: 2, md: 4}, borderRadius: 4, border: "1.5px solid #1b4332" }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={800} color="#1b4332" display="flex" alignItems="center" gap={1}>
              <AgricultureIcon /> {SISTEMAS.find(s=>s.id === sistemaProducao)?.label}
            </Typography>
            <Button variant="text" onClick={() => setView("list")}>Voltar ao Histórico</Button>
          </Box>
          
          <Stepper activeStep={activeStep} orientation="vertical">
            {FASES.map((fase, index) => {
              const FaseComponent = fase.componente;
              const isFaseConcluida = fasesData[index]?.status === "concluida" || fasesData[index]?.status === "pulada";

              return (
                <Step key={fase.id}>
                  <StepLabel 
                    optional={<Typography variant="caption">{fase.obj}</Typography>}
                    StepIconProps={{ sx: { color: isFaseConcluida ? "#2e7d32 !important" : activeStep === index ? "#1b4332 !important" : "inherit" } }}
                  >
                    <Typography fontWeight={activeStep === index ? 800 : 500}>{fase.label}</Typography>
                    {fasesData[index]?.status === "pulada" && <Chip size="small" label="Pulada" color="warning" sx={{ height: 16, fontSize: 10, ml: 1 }} />}
                  </StepLabel>
                  
                  <StepContent>
                    <Box sx={{ p: 2, bgcolor: "#f9fdfa", borderRadius: 3, border: "1px solid #e8f5e9", my: 2 }}>
                      
                      <FaseComponent 
                        dados={fasesData[activeStep]?.dados || {}} 
                        setDados={v => updateCurrentFase("dados", v)}
                        pendencias={fasesData[activeStep]?.pendencias || ""}
                        setPendencias={v => updateCurrentFase("pendencias", v)}
                        sistema={sistemaProducao}
                      />

                      <Box mt={3} p={2} border="1px dashed #c8e6c9" borderRadius={2}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>Evidências / Planilhas Anexas</Typography>
                        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                          <input accept="image/*,application/pdf,.xlsx,.csv" id={`upload-${index}`} type="file" style={{ display: "none" }} onChange={handleFileUpload} />
                          <label htmlFor={`upload-${index}`}>
                            <Button variant="outlined" component="span" size="small" startIcon={uploading ? <CircularProgress size={16}/> : <UploadFileIcon />} disabled={uploading}>Anexar</Button>
                          </label>
                          {(fasesData[activeStep]?.anexos || []).map((a, i) => (
                            <Chip key={i} icon={<DescriptionIcon />} label={a.name} size="small" onClick={() => window.open(a.url)} />
                          ))}
                        </Box>
                      </Box>

                      <Box mt={4} display="flex" gap={2}>
                        <Button variant="contained" onClick={handleNext} sx={{ bgcolor: "#1b4332" }}>
                          {activeStep === FASES.length - 1 ? "Concluir Consultoria" : "Salvar e Avançar"}
                        </Button>
                        {activeStep < FASES.length - 1 && (
                          <Button variant="text" color="warning" onClick={() => setOpenPular(true)}>Pular (Justificar)</Button>
                        )}
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      )}

      {/* MODAL NOVA CONSULTORIA */}
      <Dialog open={openNova} onClose={() => setOpenNova(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: "#1b4332", textAlign: "center" }}>Qual é o Sistema de Produção?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" mb={3} color="text.secondary">
            O fluxo metodológico se moldará automaticamente ao perfil escolhido.
          </Typography>
          <Grid container spacing={2}>
            {SISTEMAS.map(s => (
              <Grid item xs={12} key={s.id}>
                <Card 
                  onClick={() => setSistemaNovo(s.id)}
                  sx={{ cursor: "pointer", border: "2px solid", borderColor: sistemaNovo === s.id ? "#1b4332" : "#e0e0e0", bgcolor: sistemaNovo === s.id ? "#e8f5e9" : "#fff" }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: "16px !important" }}>
                    {s.icon}
                    <Typography fontWeight={800}>{s.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "center" }}>
          <Button onClick={() => setOpenNova(false)}>Cancelar</Button>
          <Button variant="contained" sx={{ bgcolor: "#1b4332" }} onClick={iniciarNovaConsultoria}>Iniciar Fluxo</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL PULAR */}
      <Dialog open={openPular} onClose={() => setOpenPular(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800, color: "#e65100" }}>Pular Etapa</DialogTitle>
        <DialogContent>
          <TextField fullWidth multiline rows={3} label="Justificativa Técnica" value={justificativa} onChange={e => setJustificativa(e.target.value)} sx={{ mt: 1 }}/>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpenPular(false)}>Cancelar</Button><Button variant="contained" color="warning" onClick={handlePular}>Pular</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
