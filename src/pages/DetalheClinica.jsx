import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Paper, Tabs, Tab, CircularProgress,
  Button, Stack, Chip, Divider, List, ListItem, ListItemText, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ListItemIcon, Tooltip, CardContent, Card, FormControlLabel,
  Checkbox, Select, MenuItem
} from "@mui/material";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, updateDoc, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import RadarChart from "../components/RadarChart";
import { LABEL_TIPO, VENCIMENTOS_POR_TIPO, getChecklistsPorTipo } from "../data/checklistsRT";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TableChartIcon from "@mui/icons-material/TableChart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import GroupsIcon from "@mui/icons-material/Groups";
import EngineeringIcon from "@mui/icons-material/Engineering";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import BuildIcon from "@mui/icons-material/Build";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GavelIcon from "@mui/icons-material/Gavel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import FolderCopyIcon from "@mui/icons-material/FolderCopy";
import HandymanIcon from "@mui/icons-material/Handyman";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { gerarHashSHA256, gerarSmartID } from "../utils/security";
import { consultarAssistenteCompliance, gerarAnaliseLegislativa } from "../services/firebaseAI";

function VencimentoItem({ label, venc }) {
  if (!venc) return null;
  const dias = Math.ceil((new Date(venc) - new Date()) / 86400000);
  const vencido = dias < 0;
  const proximo = dias >= 0 && dias <= 30;
  if (!vencido && !proximo) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
      {vencido
        ? <ErrorIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
        : <WarningAmberIcon sx={{ color: "#e65100", fontSize: 20 }} />}
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" fontWeight={600} color={vencido ? "#d32f2f" : "#e65100"}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {vencido ? `Vencido há ${Math.abs(dias)} dias` : `Vence em ${dias} dias`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function DetalheClinica() {
  const { clinicaId } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();
  const [clinica, setClinica] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [scores, setScores] = useState([]);
  const [labels, setLabels] = useState([]);
  const [dialogBVO, setDialogBVO] = useState(false);
  const [textoBVO, setTextoBVO] = useState("");
  const [interpretando, setInterpretando] = useState(false);
  const location = useLocation();
  const [diagnostico, setDiagnostico] = useState(null);

  // Gatilho para abrir o BVO se vier via atalho da Central
  useEffect(() => {
    if (location.state?.openBVO) {
      setDialogBVO(true);
    }
  }, [location.state]);

  useEffect(() => {
    const carregar = async () => {
      if (!clinicaId || typeof clinicaId !== 'string') return;
      try {
        const snap = await getDoc(doc(db, "clinicas", clinicaId));
        if (snap.exists()) {
          const data = snap.data();
          setClinica(data);
          
          // Get sector labels for radar
          const checklists = getChecklistsPorTipo(data.tipo);
          setLabels(checklists.map(c => c.nome.split("—")[0].trim()));
          
          // Load inspections (vistorias)
          const qV = query(
            collection(db, `clinicas/${clinicaId}/vistorias`),
            orderBy("dataProcessamento", "desc")
          );
          const snapV = await getDocs(qV);
          const vistorias = snapV.docs.map(d => ({ id: d.id, ...d.data() }));
          if (vistorias.length > 0) setDiagnostico(vistorias[0]); // Pega a mais recente
          
          // Load auditorias
          const q = query(
            collection(db, "auditorias"),
            where("clinicaId", "==", clinicaId),
            orderBy("criadoEm", "desc"),
            limit(10)
          );
          const snapA = await getDocs(q);
          const lista = snapA.docs.map(d => ({ id: d.id, ...d.data() }));
          setAuditorias(lista);

          if (!snapA.empty) {
            const bySetor = {};
            lista.forEach(a => {
              if (a.secaoId && !bySetor[a.secaoId]) bySetor[a.secaoId] = a.score;
            });
            const newScores = checklists.map(c => bySetor[c.id] ?? 0);
            setScores(newScores);
          } else {
            setScores(checklists.map(() => 0));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [clinicaId]);

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
      <CircularProgress sx={{ color: "#52b788" }} />
    </Box>
  );

  if (!clinica) return <Alert severity="error">Estabelecimento não encontrado.</Alert>;

  const scoreGeral = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto", pb: 10 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={900} color="#1b4332">
            {clinica.nomeFantasia || clinica.razaoSocial}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {LABEL_TIPO[clinica.tipo]} · {clinica.cidade} / {clinica.estado}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate("/central-rt")} sx={{ borderRadius: 2, textTransform: "none" }}>
          Voltar à Central
        </Button>
      </Stack>

      <Paper sx={{ mb: 3, borderRadius: 3, overflow: "hidden" }} elevation={0} variant="outlined">
        <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ bgcolor: "#f8f9fa", borderBottom: "1px solid #eee" }}>
          <Tab label="Visão Geral" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Diagnóstico 360°" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Auditorias" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Documentos" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Equipe" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Terceiros" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Perfil" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="🏛️ Vistorias" sx={{ fontWeight: 700, textTransform: "none" }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
                  Radar de Conformidade
                </Typography>
                <RadarChart scores={scores} labels={labels} />
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap", mt: 2 }}>
                  {labels.map((l, i) => (
                    <Chip key={i} label={`${l}: ${scores[i]}%`} size="small" 
                      sx={{ background: scores[i] >= 70 ? "#e8f5e9" : "#fff3e0", color: scores[i] >= 70 ? "#1b4332" : "#e65100", fontWeight: 700, fontSize: 10 }} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
                  Vencimentos Próximos
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  {(VENCIMENTOS_POR_TIPO[clinica.tipo] || []).map((v) => (
                    <VencimentoItem key={v.campo} label={v.label} venc={clinica[v.campo]} />
                  ))}
                  {!(VENCIMENTOS_POR_TIPO[clinica.tipo] || []).some(v => clinica[v.campo]) && (
                    <Typography variant="body2" color="text.secondary" textAlign="center">Nenhum vencimento configurado.</Typography>
                  )}
                </Paper>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: "#888" }}>Ações Rápidas</Typography>
                  <Grid container spacing={1} mt={0.5}>
                    <Grid item xs={6}>
                      <Button fullWidth variant="outlined" startIcon={<AssignmentIcon />} 
                        onClick={() => navigate("/auditorias/nova", { state: { clinicaId, tipo: clinica.tipo } })}
                        sx={{ borderRadius: 2, fontSize: 11 }}>Auditar</Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button fullWidth variant="contained" startIcon={<PsychologyIcon />} 
                        onClick={() => setDialogBVO(true)}
                        sx={{ borderRadius: 2, fontSize: 11, bgcolor: "#1b4332" }}>Importar BVO</Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}

          {tab === 1 && <AbaDiagnostico clinica={clinica} clinicaId={clinicaId} diagnostico={diagnostico} setDiagnostico={setDiagnostico} />}
          {tab === 2 && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={700} color="#1b4332">
                  Histórico de Auditorias
                </Typography>
                <Button variant="contained" startIcon={<AddCircleIcon />} 
                  onClick={() => navigate("/auditorias/nova", { state: { clinicaId, tipo: clinica.tipo } })}
                  sx={{ bgcolor: "#1b4332", borderRadius: 2 }}>Nova Auditoria</Button>
              </Stack>
              {auditorias.length === 0 ? (
                <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>Nenhuma auditoria realizada ainda.</Typography>
              ) : (
                <List>
                  {auditorias.map(a => (
                    <ListItem key={a.id} divider>
                      <ListItemText 
                        primary={`Auditoria ${a.smartId} - Score: ${a.score}%`} 
                        secondary={a.criadoEm?.toDate()?.toLocaleDateString("pt-BR")}
                      />
                      <Chip label={a.nivelConformidade} color={a.score >= 70 ? "success" : "error"} size="small" />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {tab === 4 && <AbaEquipe clinica={clinica} clinicaId={clinicaId} />}
          {tab === 5 && <AbaTerceiros clinica={clinica} clinicaId={clinicaId} />}

          {tab === 6 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Razão Social</Typography>
                <Typography fontWeight={600}>{clinica.razaoSocial}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">CNPJ</Typography>
                <Typography fontWeight={600}>{clinica.cnpj}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Endereço</Typography>
                <Typography fontWeight={600}>{clinica.endereco}, {clinica.cidade} - {clinica.estado}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Responsável Técnico</Typography>
                <Typography fontWeight={600}>{clinica.rtNome} (CRMV: {clinica.crmv})</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Carga Horária</Typography>
                <Typography fontWeight={600}>{clinica.cargaHorariaSemanal}h / semana</Typography>
              </Grid>
            </Grid>
          )}

          {tab === 7 && <AbaVistorias clinica={clinica} clinicaId={clinicaId} />}
        </Box>

        {/* DIALOG IMPORTAR BVO */}
        <Dialog open={dialogBVO} onClose={() => !interpretando && setDialogBVO(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: "#1b4332" }}>Importar BVO / Notificação Vigilância Sanitária</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Cole o texto do Boletim de Vistoria ou selecione o arquivo PDF. 
              A IA VERTOS irá analisar as pendências conforme a especialidade da unidade.
            </Typography>
            <Stack spacing={2}>
              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none' }}>
                Selecionar Arquivo PDF / Texto
                <input type="file" hidden accept=".pdf,.txt" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (res) => setTextoBVO(res.target.result);
                    reader.readAsText(file);
                  }
                }} />
              </Button>
              <TextField
                multiline rows={6} fullWidth placeholder="Ou cole o conteúdo aqui..."
                value={textoBVO} onChange={e => setTextoBVO(e.target.value)}
                disabled={interpretando}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogBVO(false)} disabled={interpretando}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={async () => {
                setInterpretando(true);
                try {
                  const res = await gerarAnaliseLegislativa(
                    textoBVO, 
                    clinica.cidade, 
                    clinica.estado,
                    clinica.tipo
                  );
                  
                  const docRef = await addDoc(collection(db, `clinicas/${clinicaId}/vistorias`), {
                    ...res,
                    dataProcessamento: new Date().toISOString()
                  });
                  
                  setTab(1); 
                  setDialogBVO(false);
                  setTextoBVO("");
                } catch (e) {
                  console.error(e);
                  alert("Erro ao interpretar documento. Tente extrair o texto manualmente.");
                } finally {
                  setInterpretando(false);
                }
              }}
              disabled={!textoBVO || interpretando}
              sx={{ bgcolor: "#1b4332" }}
              startIcon={interpretando && <CircularProgress size={16} color="inherit" />}
            >
              {interpretando ? "Analisando..." : "Gerar Diagnóstico 360°"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

// ── COMPONENTE: ABA EQUIPE (Blindagem 360°) ──────────────────────
function AbaEquipe({ clinica, clinicaId }) {
  const [membro, setMembro] = useState({ nome: "", cargo: "", vencAntirrabica: "", vencAntitetanica: "", vencSorologia: "", epiConfirmado: false });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!membro.nome) return;
    setLoading(true);
    try {
      const dataStr = `${membro.nome}-${membro.vencSorologia}-${membro.epiConfirmado}`;
      const hash = await gerarHashSHA256(dataStr);
      const novoMembro = {
        ...membro,
        id: Date.now().toString(),
        smartId: gerarSmartID("STAFF"),
        hash,
        criadoEm: new Date().toISOString()
      };
      const novaEquipe = [...(clinica.equipe || []), novoMembro];
      await updateDoc(doc(db, "clinicas", clinicaId), { equipe: novaEquipe });
      setMembro({ nome: "", cargo: "", vencAntirrabica: "", vencAntitetanica: "", vencSorologia: "", epiConfirmado: false });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>Gestão de Pessoas e Segurança Ocupacional</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}><TextField label="Nome do Colaborador" size="small" fullWidth value={membro.nome} onChange={e => setMembro({...membro, nome: e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField label="Cargo" size="small" fullWidth value={membro.cargo} onChange={e => setMembro({...membro, cargo: e.target.value})} /></Grid>
          <Grid item xs={12} md={2}><TextField label="Val. Sorologia" type="date" size="small" fullWidth InputLabelProps={{shrink:true}} value={membro.vencSorologia} onChange={e => setMembro({...membro, vencSorologia: e.target.value})} /></Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ mr: 1 }}>EPI Entregue?</Typography>
              <Button 
                size="small" 
                variant={membro.epiConfirmado ? "contained" : "outlined"}
                onClick={() => setMembro({...membro, epiConfirmado: !membro.epiConfirmado})}
                color={membro.epiConfirmado ? "success" : "inherit"}
                sx={{ borderRadius: 2, fontSize: 10 }}
              >
                {membro.epiConfirmado ? "Confirmado ✔️" : "Pendente"}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={handleAdd} disabled={loading} sx={{ bgcolor: "#1b4332" }}>
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <List>
        {(clinica.equipe || []).map(m => (
          <ListItem key={m.id} divider sx={{ px: 1 }}>
            <ListItemText 
              primary={<Typography fontWeight={700} fontSize={14}>{m.nome} <Chip label={m.cargo} size="small" sx={{ fontSize: 10, height: 18 }} /></Typography>}
              secondary={`Sorologia: ${m.vencSorologia || '—'} | Smart ID: ${m.smartId}`}
            />
            <Stack direction="row" spacing={1}>
              <Chip icon={<EngineeringIcon />} label={m.epiConfirmado ? "EPI OK" : "EPI Pendente"} color={m.epiConfirmado ? "success" : "warning"} size="small" />
              <Tooltip title={`Hash: ${m.hash}`}>
                <HealthAndSafetyIcon sx={{ color: "#52b788", fontSize: 20 }} />
              </Tooltip>
            </Stack>
          </ListItem>
        ))}
        {(clinica.equipe || []).length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>Nenhum colaborador cadastrado.</Typography>
        )}
      </List>
    </Box>
  );
}

// ── COMPONENTE: ABA TERCEIROS (Dossiê 360°) ──────────────────────
function AbaTerceiros({ clinica, clinicaId }) {
  const [terceiro, setTerceiro] = useState({ nome: "", tipo: "Veterinário Volante", crmv_cnpj: "", regularidade: false });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!terceiro.nome) return;
    setLoading(true);
    try {
      const novoT = { ...terceiro, id: Date.now().toString(), atualizadoEm: new Date().toISOString() };
      const novosT = [...(clinica.terceiros || []), novoT];
      await updateDoc(doc(db, "clinicas", clinicaId), { terceiros: novosT });
      setTerceiro({ nome: "", tipo: "Veterinário Volante", crmv_cnpj: "", regularidade: false });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>Dossiê de Terceiros e Prestadores</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: "#f1f8f6" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}><TextField label="Nome/Empresa" size="small" fullWidth value={terceiro.nome} onChange={e => setTerceiro({...terceiro, nome: e.target.value})} /></Grid>
          <Grid item xs={12} md={3}>
            <Select size="small" fullWidth value={terceiro.tipo} onChange={e => setTerceiro({...terceiro, tipo: e.target.value})}>
              <MenuItem value="Veterinário Volante">Veterinário Volante</MenuItem>
              <MenuItem value="Laboratório Externo">Laboratório Externo</MenuItem>
              <MenuItem value="Gestão de Resíduos">Gestão de Resíduos</MenuItem>
              <MenuItem value="Manutenção de Equipamentos">Manutenção de Equipamentos</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} md={2}><TextField label="CRMV ou CNPJ" size="small" fullWidth value={terceiro.crmv_cnpj} onChange={e => setTerceiro({...terceiro, crmv_cnpj: e.target.value})} /></Grid>
          <Grid item xs={12} md={2}>
            <FormControlLabel 
              control={<Checkbox checked={terceiro.regularidade} onChange={e => setTerceiro({...terceiro, regularidade: e.target.checked})} />}
              label={<Typography variant="caption">Regularizado?</Typography>}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={handleAdd} disabled={loading} sx={{ bgcolor: "#1b4332" }}>Validar</Button>
          </Grid>
        </Grid>
      </Paper>

      <List>
        {(clinica.terceiros || []).map(t => (
          <ListItem key={t.id} divider>
            <ListItemText 
              primary={<Typography fontWeight={700}>{t.nome} <Chip label={t.tipo} size="small" variant="outlined" sx={{ fontSize: 9, height: 16 }} /></Typography>}
              secondary={`CRMV/CNPJ: ${t.crmv_cnpj || '—'}`}
            />
            {t.regularidade ? (
              <Chip icon={<FactCheckIcon />} label="Regularizado" color="success" size="small" />
            ) : (
              <Chip icon={<WarningAmberIcon />} label="Pendente" color="warning" size="small" />
            )}
          </ListItem>
        ))}
        {(clinica.terceiros || []).length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>Nenhum terceiro registrado.</Typography>
        )}
      </List>
    </Box>
  );
}

// ── COMPONENTE: ABA DIAGNÓSTICO 360 (Agente Vertos Intelligence) ──
function AbaDiagnostico({ clinica, clinicaId, diagnostico, setDiagnostico }) {
  const navigate = useNavigate();

  if (!diagnostico) return (
    <Box textAlign="center" py={8}>
      <PsychologyIcon sx={{ fontSize: 64, color: "#eee", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>Sem Diagnóstico Ativo</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Importe um documento fiscal para gerar automaticamente<br/>
        seu plano de ação de blindagem jurídica sênior.
      </Typography>
      <Button variant="contained" onClick={() => window.scrollTo(0, 0)} sx={{ bgcolor: "#1b4332" }}>
        Subir Documento Agora
      </Button>
    </Box>
  );

  return (
    <Box>
      {/* Cabeçalho do Relatório */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, bgcolor: "#1b4332", color: "#fff", borderRadius: 4, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", right: -20, top: -20, opacity: 0.1 }}>
          <PsychologyIcon sx={{ fontSize: 200 }} />
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={900}>ANALISTA LEGISLATIVO SÊNIOR</Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Setor: {diagnostico.setor_atuacao} | Risco de Multa: {diagnostico.analise_de_risco_multa}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Chip label="PROATIVO" sx={{ bgcolor: "#52b788", color: "#1b4332", fontWeight: 900, mb: 1 }} />
          </Box>
        </Stack>
        
        <Box sx={{ bgcolor: "rgba(255,255,255,0.1)", p: 2, borderRadius: 2, border: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography variant="subtitle2" fontWeight={800} mb={1}>Resumo da Fiscalização</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>{diagnostico.resumo_fiscalizacao}</Typography>
        </Box>
      </Paper>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={900} color="#1b4332" mb={2}>📂 Exigências Documentais</Typography>
          <List>
            {(diagnostico.exigencias_documentais || []).map((item, i) => (
              <ListItem key={i} sx={{ bgcolor: "#f8f9fa", mb: 1, borderRadius: 2 }}>
                <ListItemText primary={<Typography variant="body2">{item}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={900} color="#c62828" mb={2}>🏗️ Exigências Estruturais</Typography>
          <List>
            {(diagnostico.exigencias_estruturais || []).map((item, i) => (
              <ListItem key={i} sx={{ bgcolor: "#fff5f5", mb: 1, borderRadius: 2, border: "1px solid #ffcdd2" }}>
                <ListItemText primary={<Typography variant="body2">{item}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "#e3f2fd", borderColor: "#bbdefb" }}>
        <Typography variant="subtitle2" fontWeight={800} color="#1565c0" mb={1}>💡 Orientação Prática para o RT</Typography>
        <Typography variant="body2">{diagnostico.orientacao_praticas_rt}</Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" fontWeight={800} color="#1b4332" mb={1}>📜 Base Legal e Prazos</Typography>
        <Typography variant="body2" mb={1}>**Prazos Identificados:** {diagnostico.prazos_identificados}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {(diagnostico.leis_e_resolucoes_citadas || []).map((lei, i) => (
            <Chip key={i} label={lei} size="small" variant="outlined" sx={{ mt: 1 }} />
          ))}
        </Stack>
      </Box>

      {/* 4. Encerramento Prova de Atuação */}
      <Alert 
        severity="success" 
        icon={<VerifiedUserIcon />}
        sx={{ borderRadius: 4, p: 3, border: "2px dashed #52b788", bgcolor: "#f1f8f6" }}
      >
        <Typography variant="subtitle1" fontWeight={900}>4. Encerramento no VERTOS OS (Prova de Atuação)</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Após realizar as ações acima, o Responsável Técnico deve fotografar as correções e anexar no módulo de **Nova Auditoria** do VERTOS para gerar o Score final e o certificado de conformidade.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2, bgcolor: "#1b4332", fontWeight: 900 }}
          onClick={() => navigate("/auditorias/nova", { state: { clinicaId, tipo: clinica.tipo } })}
        >
          Iniciar Auditoria de Prova
        </Button>
      </Alert>


      {/* Rodapé do Relatório */}
      <Box sx={{ mt: 6, pb: 4, textAlign: "center", borderTop: "1px solid #eee", pt: 4 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          Relatório de Blindagem — {clinica.nomeFantasia} — Smart ID: {diagnostico.smart_id}
        </Typography>
        <Typography variant="caption" fontWeight={700} color="#1b4332">
          Responsável Técnico: {clinica.rtNome} (CRMV: {clinica.crmv})
        </Typography>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: ABA VISTORIAS (Órgãos Oficiais)
// ═══════════════════════════════════════════════════════════════
function AbaVistorias({ clinica, clinicaId }) {
  const navigate = useNavigate();

  // Estados
  const [vistorias, setVistorias]           = useState([]);
  const [carregando, setCarregando]         = useState(true);
  const [dialogNova, setDialogNova]         = useState(false);
  const [vistoriaSel, setVistoriaSel]       = useState(null);
  const [analisando, setAnalisando]         = useState(false);
  const [uploadando, setUploadando]         = useState(false);
  const [itemsChecked, setItemsChecked]     = useState({});

  // Form nova vistoria
  const [form, setForm] = useState({
    orgao: "Vigilância Sanitária",
    numeroBoletim: "",
    dataVistoria: "",
    prazoResposta: "30",
    observacoes: "",
  });
  const [arquivos, setArquivos] = useState([]);
  const [textoBVO, setTextoBVO] = useState("");

  // ── Carregar vistorias da subcollection ──────────────────────
  useEffect(() => {
    if (!clinicaId) return;
    const q = query(
      collection(db, "clinicas", clinicaId, "vistorias"),
      orderBy("criadoEm", "desc")
    );
    const unsub = onSnapshot(q, snap => {
      setVistorias(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
    return unsub;
  }, [clinicaId]);

  // ── Upload de PDF para Storage ───────────────────────────────
  const handleUploadArquivos = async (files) => {
    if (!files?.length) return [];
    setUploadando(true);
    const urls = [];
    for (const file of files) {
      const storageRef = ref(
        storage,
        `clinicas/${clinicaId}/vistorias/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push({ nome: file.name, url, tipo: file.type, tamanho: file.size });
    }
    setUploadando(false);
    return urls;
  };

  // ── Salvar vistoria + disparar análise IA ───────────────────
  const handleSalvarVistoria = async () => {
    if (!form.orgao || !form.dataVistoria) {
      alert("Preencha o órgão e a data da vistoria.");
      return;
    }
    setAnalisando(true);
    try {
      // 1. Upload dos PDFs
      const docs = await handleUploadArquivos(arquivos);

      // 2. Salvar vistoria sem análise primeiro
      const vistoriaRef = await addDoc(
        collection(db, "clinicas", clinicaId, "vistorias"),
        {
          ...form,
          prazoResposta: Number(form.prazoResposta),
          documentos: docs,
          status: "analisando",
          criadoEm: serverTimestamp(),
          clinicaId,
          clinicaNome: clinica?.nomeFantasia || clinica?.razaoSocial || "",
        }
      );

      // 3. Análise IA (usando texto colado ou extraído)
      if (textoBVO.trim().length > 50) {
        const { analisarVistoria } = await import("../utils/analiseBVO");
        const analise = await analisarVistoria(textoBVO, form.orgao, form.dataVistoria);

        // 4. Atualizar com análise
        await updateDoc(
          doc(db, "clinicas", clinicaId, "vistorias", vistoriaRef.id),
          { analise, status: "analisada" }
        );
      } else {
        await updateDoc(
          doc(db, "clinicas", clinicaId, "vistorias", vistoriaRef.id),
          { status: "sem_analise" }
        );
      }

      setDialogNova(false);
      setForm({ orgao: "Vigilância Sanitária", numeroBoletim: "", dataVistoria: "", prazoResposta: "30", observacoes: "" });
      setArquivos([]);
      setTextoBVO("");
    } catch (e) {
      console.error("Erro ao salvar vistoria:", e);
      alert("Erro ao processar. Verifique o formato do texto e tente novamente.");
    } finally {
      setAnalisando(false);
    }
  };

  // ── Toggle de item concluído ─────────────────────────────────
  const toggleItem = async (vistoriaId, itemNum) => {
    const key = `${vistoriaId}_${itemNum}`;
    const novoEstado = !itemsChecked[key];
    setItemsChecked(prev => ({ ...prev, [key]: novoEstado }));

    // Persiste no Firestore
    const vistoria = vistorias.find(v => v.id === vistoriaId);
    const itensConc = vistoria?.itensConcluidos || [];
    const atualizado = novoEstado
      ? [...new Set([...itensConc, itemNum])]
      : itensConc.filter(n => n !== itemNum);

    await updateDoc(
      doc(db, "clinicas", clinicaId, "vistorias", vistoriaId),
      { itensConcluidos: atualizado }
    );
  };

  // ── Cores por prioridade ─────────────────────────────────────
  const corPrioridade = (p) => ({
    URGENTE: { bg: "#FCEBEB", text: "#A32D2D", border: "#FCA5A5" },
    ALTA:    { bg: "#FFF3E0", text: "#854F0B", border: "#FDE68A" },
    MEDIA:   { bg: "#E6F1FB", text: "#185FA5", border: "#93C5FD" },
    BAIXA:   { bg: "#F0FDF4", text: "#1B4332", border: "#86EFAC" },
  }[p] ?? { bg: "#F3F4F6", text: "#444", border: "#E5E7EB" });

  const corCategoria = (c) => ({
    DOCUMENTACAO:    "#185FA5",
    INFRAESTRUTURA:  "#854F0B",
    HIGIENE_ROTINA:  "#1B4332",
    COLABORADORES:   "#534AB7",
    CONTROLE_PRAGAS: "#A32D2D",
    LICENCIAMENTO:   "#0d47a1",
  }[c] ?? "#6B7280");

  const labelCategoria = (c) => ({
    DOCUMENTACAO:    "📄 Documentação",
    INFRAESTRUTURA:  "🔧 Infraestrutura",
    HIGIENE_ROTINA:  "🧹 Higiene / Rotina",
    COLABORADORES:   "👥 Colaboradores",
    CONTROLE_PRAGAS: "🐛 Controle de Pragas",
    LICENCIAMENTO:   "🏛️ Licenciamento",
  }[c] ?? c);

  // ── Calcular progresso de uma vistoria ──────────────────────
  const calcProgresso = (v) => {
    if (!v.analise?.itens?.length) return 0;
    const conc = v.itensConcluidos?.length ?? 0;
    return Math.round((conc / v.analise.itens.length) * 100);
  };

  const diasRestantes = (v) => {
    if (!v.dataVistoria) return null;
    const base = new Date(v.dataVistoria + "T00:00:00");
    const prazo = new Date(base);
    prazo.setDate(prazo.getDate() + (v.prazoResposta ?? 30));
    return Math.ceil((prazo - new Date()) / 86400000);
  };

  // ── RENDER LISTA DE VISTORIAS ─────────────────────────────────
  const renderListaVistorias = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={900} color="#1b4332">
            🏛️ Vistorias de Órgãos Oficiais
          </Typography>
          <Typography variant="caption" color="text.secondary">
            BVOs, autos de infração e notificações da Vigilância Sanitária, CRMV, MAPA e outros
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setDialogNova(true)}
          sx={{ bgcolor: "#1b4332", borderRadius: 2, fontWeight: 700, textTransform: "none" }}
        >
          Nova Vistoria
        </Button>
      </Stack>

      {carregando ? (
        <Box textAlign="center" py={6}><CircularProgress sx={{ color: "#1b4332" }} /></Box>
      ) : vistorias.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", bgcolor: "#f8f9fa", borderRadius: 4, border: "1px dashed #ccc" }}>
          <GavelIcon sx={{ fontSize: 56, color: "#ccc", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>Nenhuma vistoria registrada</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Importe um BVO, notificação ou auto de infração para que o agente de IA gere o plano de ação.
          </Typography>
          <Button variant="outlined" onClick={() => setDialogNova(true)} sx={{ borderColor: "#1b4332", color: "#1b4332", fontWeight: 700, textTransform: "none" }}>
            Registrar primeira vistoria
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {vistorias.map(v => {
            const dias = diasRestantes(v);
            const prog = calcProgresso(v);
            const vencido = dias !== null && dias < 0;
            const urgente = dias !== null && dias <= 7 && dias >= 0;

            return (
              <Card key={v.id} elevation={0} sx={{
                border: vencido ? "2px solid #FCA5A5" : urgente ? "2px solid #FDE68A" : "1px solid #e5e7eb",
                borderRadius: 3,
                cursor: "pointer",
                transition: "box-shadow .15s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,.08)" }
              }}
                onClick={() => {
                  const conc = v.itensConcluidos || [];
                  const init = {};
                  conc.forEach(n => { init[`${v.id}_${n}`] = true; });
                  setItemsChecked(prev => ({ ...prev, ...init }));
                  setVistoriaSel(v);
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography fontWeight={900} fontSize={14} color="#1b4332">
                          {v.orgao}
                        </Typography>
                        {v.numeroBoletim && (
                          <Chip label={`BVO ${v.numeroBoletim}`} size="small"
                            sx={{ bgcolor: "#e3f2fd", color: "#0d47a1", fontWeight: 700, fontSize: 10 }} />
                        )}
                        {v.status === "analisada" && (
                          <Chip label="✅ Analisado" size="small"
                            sx={{ bgcolor: "#e8f5e9", color: "#1b4332", fontWeight: 700, fontSize: 10 }} />
                        )}
                        {v.status === "analisando" && (
                          <Chip label="⏳ Processando" size="small"
                            sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 700, fontSize: 10 }} />
                        )}
                        {v.status === "sem_analise" && (
                          <Chip label="📄 Sem análise IA" size="small"
                            sx={{ bgcolor: "#f3f4f6", color: "#6b7280", fontWeight: 700, fontSize: 10 }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Vistoria em {v.dataVistoria} · Prazo: {v.prazoResposta} dias
                        {v.analise?.totalItens > 0 && ` · ${v.analise.totalItens} itens`}
                      </Typography>
                    </Box>
                    <Box textAlign="right" flexShrink={0}>
                      {dias !== null && (
                        <Chip
                          label={vencido ? `⚠ Prazo vencido há ${Math.abs(dias)}d` : `${dias}d restantes`}
                          size="small"
                          sx={{
                            bgcolor: vencido ? "#FCEBEB" : urgente ? "#FFF3E0" : "#E6F1FB",
                            color: vencido ? "#A32D2D" : urgente ? "#854F0B" : "#185FA5",
                            fontWeight: 700, fontSize: 10
                          }}
                        />
                      )}
                    </Box>
                  </Stack>

                  {v.analise?.itens?.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography fontSize={11} color="text.secondary">
                          {v.itensConcluidos?.length ?? 0}/{v.analise.itens.length} itens concluídos
                        </Typography>
                        <Typography fontSize={11} fontWeight={700}
                          color={prog === 100 ? "#1b4332" : prog >= 60 ? "#185FA5" : "#A32D2D"}>
                          {prog}%
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 6, bgcolor: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <Box sx={{
                          height: "100%", borderRadius: 3, transition: "width .3s",
                          width: `${prog}%`,
                          bgcolor: prog === 100 ? "#1b4332" : prog >= 60 ? "#185FA5" : "#A32D2D",
                        }} />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );

  // ── RENDER DETALHE DA VISTORIA ────────────────────────────────
  const renderDetalheVistoria = () => {
    const v = vistoriaSel;
    if (!v) return null;
    const analise = v.analise;
    const prog = calcProgresso(v);
    const dias = diasRestantes(v);

    const itensPorCategoria = {};
    if (analise?.itens) {
      analise.itens.forEach(item => {
        if (!itensPorCategoria[item.categoria]) itensPorCategoria[item.categoria] = [];
        itensPorCategoria[item.categoria].push(item);
      });
    }

    return (
      <Box>
        {/* Breadcrumb */}
        <Button
          startIcon={<span>←</span>}
          onClick={() => setVistoriaSel(null)}
          sx={{ color: "#1b4332", fontWeight: 700, textTransform: "none", mb: 2 }}
        >
          Voltar à lista
        </Button>

        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: "#0a0f0d", borderRadius: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#fff">
                {v.orgao}{v.numeroBoletim && ` — BVO ${v.numeroBoletim}`}
              </Typography>
              <Typography variant="caption" color="#52b788">
                Vistoria em {v.dataVistoria} · Prazo de resposta: {v.prazoResposta} dias
                {analise?.totalItens > 0 && ` · ${analise.totalItens} exigências`}
              </Typography>
              {analise?.resumoExecutivo && (
                <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ mt: 1.5, fontStyle: "italic" }}>
                  "{analise.resumoExecutivo}"
                </Typography>
              )}
            </Box>
            <Stack alignItems="flex-end" spacing={1}>
              <Chip
                label={dias !== null
                  ? (dias < 0 ? `⚠ Prazo vencido` : `${dias} dias restantes`)
                  : ""}
                sx={{
                  bgcolor: dias < 0 ? "#FCEBEB" : dias <= 7 ? "#FFF3E0" : "#E6F1FB",
                  color: dias < 0 ? "#A32D2D" : dias <= 7 ? "#854F0B" : "#185FA5",
                  fontWeight: 800, fontSize: 12
                }}
              />
              <Typography variant="h4" fontWeight={900} color={prog === 100 ? "#52b788" : "#fff"}>
                {prog}%
              </Typography>
              <Typography variant="caption" color="#52b788">
                {v.itensConcluidos?.length ?? 0}/{analise?.itens?.length ?? 0} concluídos
              </Typography>
            </Stack>
          </Stack>

          {/* Barra de progresso */}
          <Box sx={{ mt: 2, height: 8, bgcolor: "rgba(255,255,255,.1)", borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ height: "100%", width: `${prog}%`, bgcolor: "#52b788", borderRadius: 4, transition: "width .4s" }} />
          </Box>
        </Paper>

        {/* PDFs anexados */}
        {v.documentos?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} color="#1b4332" gutterBottom>
              📎 Documentos Originais
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {v.documentos.map((d, i) => (
                <Chip key={i}
                  label={d.nome}
                  component="a" href={d.url} target="_blank"
                  clickable
                  icon={<UploadFileIcon fontSize="small" />}
                  size="small"
                  sx={{ bgcolor: "#e3f2fd", color: "#0d47a1", fontWeight: 600, fontSize: 11 }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {!analise ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Esta vistoria não possui análise de IA. Cole o texto do boletim ao registrar para gerar o plano de ação automático.
          </Alert>
        ) : (
          <>
            {/* ── PLANO DE AÇÃO ── */}
            <Typography variant="h6" fontWeight={900} color="#1b4332" gutterBottom sx={{ mt: 1 }}>
              📋 Plano de Ação
            </Typography>

            {/* Bloco 1 — Documentação interna */}
            {analise.planoAcao?.documentacaoInterna?.length > 0 && (
              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: "#E6F1FB", border: "1px solid #93C5FD", borderRadius: 3 }}>
                <Typography fontWeight={900} fontSize={14} color="#185FA5" gutterBottom>
                  📄 Documentação a preparar
                </Typography>
                <Stack spacing={1}>
                  {analise.planoAcao.documentacaoInterna.map((a, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ mt: 0.5, flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                        bgcolor: "#185FA5", color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontSize={13} fontWeight={600}>{a.acao}</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                          <Chip label={`Itens: ${a.itensRelacionados?.join(", ")}`} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fff", color: "#185FA5" }} />
                          <Chip label={a.prazo} size="small"
                            sx={{ fontSize: 10, bgcolor: "#dbeafe", color: "#1e40af", fontWeight: 700 }} />
                          <Chip label={a.onde} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fff", color: "#185FA5" }} />
                        </Stack>
                      </Box>
                      {a.rota && (
                        <Button size="small" onClick={() => navigate(a.rota)}
                          sx={{ textTransform: "none", color: "#185FA5", fontWeight: 700, flexShrink: 0 }}>
                          Ir →
                        </Button>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Bloco 2 — Ações externas */}
            {analise.planoAcao?.acoesExternas?.length > 0 && (
              <Paper elevation={0} sx={{ p: 2.5, mb: 2, bgcolor: "#FFF3E0", border: "1px solid #FDE68A", borderRadius: 3 }}>
                <Typography fontWeight={900} fontSize={14} color="#854F0B" gutterBottom>
                  🔧 Ações fora do sistema (campo)
                </Typography>
                <Stack spacing={1}>
                  {analise.planoAcao.acoesExternas.map((a, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ mt: 0.5, flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                        bgcolor: "#854F0B", color: "#fff", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                        {i + 1}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontSize={13} fontWeight={600}>{a.acao}</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                          <Chip label={`Itens: ${a.itensRelacionados?.join(", ")}`} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fff", color: "#854F0B" }} />
                          <Chip label={a.prazo} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fef3c7", color: "#92400e", fontWeight: 700 }} />
                          <Chip label={a.responsavel} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fff", color: "#854F0B" }} />
                          <Chip label={a.custoEstimado} size="small"
                            sx={{ fontSize: 10, bgcolor: "#fee2e2", color: "#991b1b" }} />
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Bloco 3 — Ações no sistema */}
            {analise.planoAcao?.acoesNoSistema?.length > 0 && (
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 3 }}>
                <Typography fontWeight={900} fontSize={14} color="#1B4332" gutterBottom>
                  ⚡ Resolver pelo VERTOS OS
                </Typography>
                <Stack spacing={1}>
                  {analise.planoAcao.acoesNoSistema.map((a, i) => (
                    <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography fontSize={13} fontWeight={600}>{a.acao}</Typography>
                        <Typography fontSize={11} color="text.secondary">
                          Itens {a.itensRelacionados?.join(", ")} · {a.rota}
                        </Typography>
                      </Box>
                      <Button size="small" variant="contained"
                        onClick={() => navigate(a.rota)}
                        sx={{ bgcolor: "#1b4332", borderRadius: 2, textTransform: "none",
                          fontWeight: 700, fontSize: 11, py: 0.5, flexShrink: 0 }}>
                        Acessar
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* ── ITENS POR CATEGORIA com checkbox ── */}
            <Typography variant="h6" fontWeight={900} color="#1b4332" gutterBottom>
              ✅ Itens da Vistoria — marque o que foi concluído
            </Typography>

            {Object.entries(itensPorCategoria).map(([cat, itens]) => (
              <Box key={cat} sx={{ mb: 3 }}>
                <Typography fontSize={13} fontWeight={800}
                  sx={{ color: corCategoria(cat), mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  {labelCategoria(cat)}
                  <Chip label={`${itens.filter(i => itemsChecked[`${v.id}_${i.numero}`]).length}/${itens.length}`}
                    size="small"
                    sx={{ bgcolor: corCategoria(cat) + "20", color: corCategoria(cat), fontWeight: 700, fontSize: 10 }} />
                </Typography>
                <Stack spacing={1}>
                  {itens.map(item => {
                    const concluido = !!itemsChecked[`${v.id}_${item.numero}`];
                    const cores = corPrioridade(item.prioridade);
                    return (
                      <Box key={item.numero} sx={{
                        display: "flex", gap: 1.5, p: 1.5, borderRadius: 2,
                        bgcolor: concluido ? "#F0FDF4" : cores.bg,
                        border: `1px solid ${concluido ? "#86EFAC" : cores.border}`,
                        opacity: concluido ? 0.7 : 1,
                        transition: "all .2s",
                      }}>
                        <Box sx={{ flexShrink: 0, mt: 0.2, cursor: "pointer" }}
                          onClick={() => toggleItem(v.id, item.numero)}>
                          {concluido
                            ? <CheckBoxIcon sx={{ color: "#1b4332", fontSize: 20 }} />
                            : <CheckBoxOutlineBlankIcon sx={{ color: cores.text, fontSize: 20 }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                            <Typography fontSize={11} fontWeight={700}
                              sx={{ color: cores.text, bgcolor: cores.bg,
                                border: `1px solid ${cores.border}`, px: 1, py: 0.2, borderRadius: 1 }}>
                              {item.prioridade}
                            </Typography>
                            <Typography fontSize={12} fontWeight={600}
                              sx={{ textDecoration: concluido ? "line-through" : "none", color: "#333" }}>
                              Item {item.numero}
                            </Typography>
                            <Chip label={item.prazoItem} size="small"
                              sx={{ fontSize: 9, height: 18, bgcolor: "#f3f4f6", color: "#6b7280" }} />
                            <Chip label={item.responsavel} size="small"
                              sx={{ fontSize: 9, height: 18, bgcolor: "#ede7f6", color: "#534AB7" }} />
                          </Stack>
                          <Typography fontSize={12} color="#374151" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                            {item.descricao}
                          </Typography>
                          {item.rotaVertos && (
                            <Button size="small"
                              onClick={() => navigate(item.rotaVertos)}
                              sx={{ textTransform: "none", color: "#1b4332", fontWeight: 700, p: 0, mt: 0.5, fontSize: 11 }}>
                              Usar VERTOS OS →
                            </Button>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  };

  // ── DIALOG NOVA VISTORIA ──────────────────────────────────────
  const renderDialogNova = () => (
    <Dialog open={dialogNova} onClose={() => setDialogNova(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "#1b4332", color: "#fff", fontWeight: 900 }}>
        🏛️ Registrar Nova Vistoria Oficial
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select label="Órgão Fiscalizador" fullWidth size="small"
              value={form.orgao}
              onChange={e => setForm(p => ({ ...p, orgao: e.target.value }))}>
              {["Vigilância Sanitária", "CRMV", "MAPA / MAPA Estadual",
                "IBAMA / Órgão Ambiental", "Prefeitura Municipal",
                "Defesa Civil", "Ministério do Trabalho", "Outro"].map(o => (
                <MenuItem key={o} value={o}>{o}</MenuItem>
              ))}
            </TextField>
            <TextField label="Nº do Boletim/Protocolo" size="small" fullWidth
              placeholder="ex: 395/2025"
              value={form.numeroBoletim}
              onChange={e => setForm(p => ({ ...p, numeroBoletim: e.target.value }))} />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Data da Vistoria" type="date" size="small" fullWidth
              InputLabelProps={{ shrink: true }}
              value={form.dataVistoria}
              onChange={e => setForm(p => ({ ...p, dataVistoria: e.target.value }))} />
            <TextField label="Prazo de Resposta (dias)" type="number" size="small" fullWidth
              value={form.prazoResposta}
              onChange={e => setForm(p => ({ ...p, prazoResposta: e.target.value }))} />
          </Stack>

          <TextField label="Observações" multiline rows={2} size="small" fullWidth
            placeholder="Notas adicionais sobre a vistoria..."
            value={form.observacoes}
            onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} />

          {/* Upload de PDFs */}
          <Box>
            <Typography fontSize={13} fontWeight={700} color="#1b4332" gutterBottom>
              📎 Anexar PDFs do Boletim (opcional)
            </Typography>
            <Box sx={{ border: "2px dashed #d1fae5", borderRadius: 2, p: 2, textAlign: "center", cursor: "pointer",
              bgcolor: "#f0fdf4", "&:hover": { bgcolor: "#dcfce7" } }}
              onClick={() => document.getElementById("upload-bvo").click()}>
              <input id="upload-bvo" type="file" accept="application/pdf,image/*" multiple hidden
                onChange={e => setArquivos(Array.from(e.target.files))} />
              <UploadFileIcon sx={{ fontSize: 32, color: "#1b4332", mb: 1 }} />
              <Typography fontSize={13} color="#1b4332" fontWeight={600}>
                {arquivos.length > 0
                  ? arquivos.map(f => f.name).join(", ")
                  : "Clique para selecionar ou arraste os PDFs"}
              </Typography>
            </Box>
          </Box>

          {/* Texto do BVO para análise IA */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <SmartToyIcon sx={{ color: "#1b4332", fontSize: 18 }} />
              <Typography fontSize={13} fontWeight={800} color="#1b4332">
                Cole o texto do boletim para análise automática pela IA
              </Typography>
            </Stack>
            <Typography fontSize={11} color="text.secondary" sx={{ mb: 1 }}>
              Copie e cole o conteúdo do BVO/notificação. O agente vai identificar todos os itens,
              classificar por categoria e gerar o plano de ação separando documentação, ações externas e recursos do sistema.
            </Typography>
            <TextField
              multiline rows={8} fullWidth size="small"
              placeholder="Cole aqui o texto completo do Boletim de Vistoria e Orientação..."
              value={textoBVO}
              onChange={e => setTextoBVO(e.target.value)}
              sx={{ fontFamily: "monospace", fontSize: 12 }}
            />
            {textoBVO.length > 0 && (
              <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.5 }}>
                {textoBVO.length} caracteres · {Math.round(textoBVO.split(/\s+/).length / 750)} min de leitura do modelo
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={() => setDialogNova(false)} disabled={analisando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={analisando || uploadando || !form.dataVistoria}
          onClick={handleSalvarVistoria}
          startIcon={analisando
            ? <CircularProgress size={16} color="inherit" />
            : <SmartToyIcon />}
          sx={{ bgcolor: "#1b4332", borderRadius: 2, fontWeight: 700, textTransform: "none" }}
        >
          {analisando
            ? "Analisando com IA..."
            : uploadando
            ? "Enviando arquivos..."
            : "Registrar e Analisar"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ── RENDER PRINCIPAL ─────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
      {vistoriaSel ? renderDetalheVistoria() : renderListaVistorias()}
      {renderDialogNova()}
    </Box>
  );
}

