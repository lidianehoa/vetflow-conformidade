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
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { gerarHashSHA256, gerarSmartID } from "../utils/security";
import { consultarAssistenteCompliance, gerarAnaliseLegislativa } from "../utils/analiseIA";

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
  const [arquivos, setArquivos] = useState([]);
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
            const checklists = getChecklistsPorTipo(data.tipo)?.setores || [];
            const newScores = checklists.map(c => bySetor[c.id] ?? 0);
            setScores(newScores);
          } else {
            const checklists = getChecklistsPorTipo(data.tipo)?.setores || [];
            setScores(checklists.map(() => 0));
          }
        }
      } catch (err) {
        console.error("Erro ao carregar clínica:", err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [clinicaId]);

  const alertasParaIA = clinica ? VENCIMENTOS_POR_TIPO[clinica.tipo]?.map(({ label, campo }) => {
    if (!clinica[campo]) return null;
    return { label, data: clinica[campo] };
  }).filter(Boolean) : [];

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

          {tab === 7 && <AbaVistorias clinica={clinica} clinicaId={clinicaId} alertasParaIA={alertasParaIA} />}
        </Box>

        <Dialog open={dialogBVO} onClose={() => !interpretando && setDialogBVO(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 900, color: "#1b4332" }}>Importar BVO / Notificação Vigilância Sanitária</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Cole o texto do Boletim de Vistoria ou selecione o arquivo PDF. 
              A IA VERTOS irá analisar as pendências conforme a especialidade da unidade.
            </Typography>
            <Stack spacing={2}>
              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', borderRadius: 2 }}>
                {arquivos.length > 0 ? arquivos[0].name : "Selecionar Arquivo PDF / Texto"}
                <input type="file" hidden accept=".pdf,.txt" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setArquivos([file]);
                    if (file.name.endsWith('.txt')) {
                      const reader = new FileReader();
                      reader.onload = (res) => setTextoBVO(res.target.result);
                      reader.readAsText(file);
                    } else {
                      setTextoBVO("PDF selecionado. Por favor, cole o texto abaixo se a extração automática não for possível.");
                    }
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
                  let docUrl = "";
                  if (arquivos.length > 0) {
                    const storageRef = ref(storage, `clinicas/${clinicaId}/diagnosticos/${Date.now()}_${arquivos[0].name}`);
                    await uploadBytes(storageRef, arquivos[0]);
                    docUrl = await getDownloadURL(storageRef);
                  }

                  const res = await gerarAnaliseLegislativa(
                    textoBVO, 
                    clinica.estado || "", 
                    clinica.cidade || "", 
                    clinica.tipo || "Clínica"
                  );
                  
                  const docRef = await addDoc(collection(db, `clinicas/${clinicaId}/diagnosticos`), {
                    ...res,
                    tenantId: userData.uid,
                    textoOriginal: textoBVO,
                    arquivoUrl: docUrl,
                    dataProcessamento: new Date().toISOString()
                  });
                  
                  setDiagnostico({ ...res, id: docRef.id });
                  setTab(1); 
                  setDialogBVO(false);
                  setTextoBVO("");
                  setArquivos([]);
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

const diagStyles = `
  .solucao-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .solucao-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
  }
  .solucao-icone { font-size: 20px; }
  .solucao-problema { color: #1e293b; font-size: 16px; font-weight: 800; }
  
  .cinco-w2h { display: flex; flex-direction: column; gap: 16px; }
  .w2h-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
    gap: 12px; 
  }
  .w2h-item {
    background: #f8fafc;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
  }
  .w2h-destaque { background: #eff6ff; border-color: #dbeafe; }
  .w2h-label { 
    display: block; 
    font-size: 10px; 
    font-weight: 800; 
    color: #64748b; 
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .w2h-valor { font-size: 13px; color: #334155; font-weight: 600; margin: 0; }
  
  .w2h-acoes { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
    margin-top: 4px;
  }
  .w2h-acao { padding: 12px; border-radius: 8px; }
  .w2h-acao-vertos { background: #1e293b; color: #fff; }
  .w2h-acao-externo { background: #f1f5f9; border: 1px solid #e2e8f0; }
  .w2h-acao-label { font-size: 11px; font-weight: 800; display: block; margin-bottom: 4px; opacity: 0.9; }
  .w2h-acao-texto { font-size: 13px; margin: 0; line-height: 1.4; }
  
  .w2h-custo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: #f0fdf4;
    border-radius: 8px;
    border: 1px solid #dcfce7;
  }
  .w2h-custo-valor { font-weight: 800; color: #166534; font-size: 14px; }
  .fase-sem-pendencia { color: #64748b; font-style: italic; font-size: 14px; }
`;

function AbaDiagnostico({ clinica, clinicaId, diagnostico, setDiagnostico }) {
  const navigate = useNavigate();

  if (!diagnostico) return (
    <Box textAlign="center" py={10}>
      <PsychologyIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
      <Typography variant="h6" color="#334155" fontWeight={900} gutterBottom>Diagnóstico 360° Pendente</Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Nenhum documento oficial foi processado para esta unidade.<br/>
        O Agente Vertos Intelligence aguarda o upload do BVO ou Notificação.
      </Typography>
      <Button 
        variant="contained" 
        onClick={() => window.scrollTo(0, 0)} 
        sx={{ bgcolor: "#4338ca", borderRadius: 2, px: 4, py: 1.5, fontWeight: 700, textTransform: "none" }}
      >
        Importar Documento Agora
      </Button>
    </Box>
  );

  const FaseCard = ({ num, titulo, cor, icon: Icon, fase }) => (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4, mb: 3, borderLeft: `6px solid ${cor}` }}>
      <style>{diagStyles}</style>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: cor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Typography fontWeight={900}>{num}</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 10, fontWeight: 800 }}>FASE {num}</Typography>
          <Typography variant="h6" fontWeight={900} color="#334155">{titulo}</Typography>
        </Box>
        <Icon sx={{ color: "#cbd5e1" }} />
      </Stack>

      <Stack spacing={2}>
        {fase?.solucoes && fase.solucoes.map((solucao, idx) => (
          <div key={idx} className="solucao-card">
            <div className="solucao-header">
              <span className="solucao-icone">⚡</span>
              <strong className="solucao-problema">{solucao.problema}</strong>
            </div>

            {solucao['5w2h'] && (
              <div className="cinco-w2h">
                <div className="w2h-grid">
                  <div className="w2h-item w2h-destaque">
                    <span className="w2h-label">O QUE fazer</span>
                    <p className="w2h-valor">{solucao['5w2h'].o_que}</p>
                  </div>
                  <div className="w2h-item">
                    <span className="w2h-label">⚖️ POR QUE (legislação)</span>
                    <p className="w2h-valor">{solucao['5w2h'].por_que}</p>
                  </div>
                  <div className="w2h-item">
                    <span className="w2h-label">👤 QUEM</span>
                    <p className="w2h-valor">{solucao['5w2h'].quem}</p>
                  </div>
                  <div className="w2h-item">
                    <span className="w2h-label">📅 QUANDO</span>
                    <p className="w2h-valor">{solucao['5w2h'].quando}</p>
                  </div>
                  <div className="w2h-item">
                    <span className="w2h-label">📍 ONDE</span>
                    <p className="w2h-valor">{solucao['5w2h'].onde}</p>
                  </div>
                </div>

                <div className="w2h-acoes">
                  <div className="w2h-acao w2h-acao-vertos">
                    <span className="w2h-acao-label">🖥️ Como resolver no Vertos</span>
                    <p className="w2h-acao-texto">{solucao['5w2h'].como_vertos}</p>
                  </div>
                  <div className="w2h-acao w2h-acao-externo">
                    <span className="w2h-acao-label">🏢 Como resolver externamente</span>
                    <p className="w2h-acao-texto">{solucao['5w2h'].como_externo}</p>
                  </div>
                </div>

                <div className="w2h-custo">
                  <span className="w2h-label">💰 CUSTO ESTIMADO</span>
                  <span className="w2h-custo-valor">{solucao['5w2h'].custo}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {(!fase?.solucoes || fase.solucoes.length === 0) && (
          <p className="fase-sem-pendencia">✅ Nenhuma pendência identificada nesta fase.</p>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      {/* Hero Header High-End */}
      <Box sx={{ 
        p: 4, mb: 4, borderRadius: 5, 
        background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", 
        color: "#fff", position: "relative", overflow: "hidden" 
      }}>
        <Box sx={{ position: "absolute", right: -40, top: -40, opacity: 0.1 }}>
          <VerifiedUserIcon sx={{ fontSize: 240 }} />
        </Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Chip label="ESPECIALISTA EM BLINDAGEM" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 800, fontSize: 10, mb: 2 }} />
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -1 }}>DIAGNÓSTICO 360°</Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 500 }}>
              {clinica.nomeFantasia} · Blindagem de Fé Pública Ativada
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.7 }}>Smart ID</Typography>
            <Typography variant="h6" fontWeight={900}>{diagnostico.smartId || "VOS-360-X"}</Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {diagnostico.fases?.map((fase, i) => (
            <FaseCard 
              key={fase.id}
              num={fase.id} 
              titulo={fase.nome} 
              fase={fase}
              cor={["#6366f1", "#8b5cf6", "#4f46e5", "#10b981", "#f59e0b"][i] || "#6366f1"}
              icon={
                fase.icone === "building" ? EngineeringIcon :
                fase.icone === "package" ? ShoppingBagIcon :
                fase.icone === "file-text" ? HistoryEduIcon :
                fase.icone === "users" ? GroupsIcon :
                fase.icone === "message-circle" ? PsychologyIcon : EngineeringIcon
              }
            />
          ))}
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: "#f8fafc", position: "sticky", top: 20 }}>
            <Typography variant="subtitle1" fontWeight={900} color="#334155" mb={2}>Resumo Executivo</Typography>
            <Typography variant="body2" color="#64748b" lineHeight={1.6} mb={3}>
              {diagnostico.resumoExecutivo || diagnostico.parecer || "Processando análise detalhada do estabelecimento..."}
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="subtitle2" fontWeight={800} color="#334155" mb={2}>Ações Imediatas</Typography>
            <Stack spacing={1}>
              <Button fullWidth variant="contained" 
                onClick={() => navigate("/auditorias/nova", { state: { clinicaId, tipo: clinica.tipo } })}
                sx={{ bgcolor: "#1e293b", borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
                Iniciar Auditoria de Prova
              </Button>
              <Button fullWidth variant="outlined" 
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, borderColor: "#cbd5e1", color: "#334155" }}>
                Exportar Dossiê PDF
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE: ABA VISTORIAS (Órgãos Oficiais)
// ═══════════════════════════════════════════════════════════════
function AbaVistorias({ clinica, clinicaId, alertasParaIA }) {
  const navigate = useNavigate();

  // Estados de visualização e dados
  const [vistorias, setVistorias]           = useState([]);
  const [carregando, setCarregando]         = useState(true);
  const [dialogNova, setDialogNova]         = useState(false);
  const [vistoriaSel, setVistoriaSel]       = useState(null);
  const [analisando, setAnalisando]         = useState(false);
  const [loadingMsg, setLoadingMsg]         = useState("Iniciando análise...");
  const [uploadando, setUploadando]         = useState(false);
  const [itemsChecked, setItemsChecked]     = useState({});

  // Form e Contexto
  const [form, setForm] = useState({
    orgao: "Vigilância Sanitária",
    numeroBoletim: "",
    dataVistoria: "",
    prazoResposta: "30",
    observacoes: "",
  });
  const [arquivos, setArquivos] = useState([]);
  const [textoBVO, setTextoBVO] = useState("");

  const SLATE = "#334155";
  const INDIGO = "#4338ca";

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

  /**
   * handleStartAnalysis: O coração do Agente Vertos Intelligence
   * Envia o contexto da clínica e o documento para blindagem 360
   */
  const handleStartAnalysis = async () => {
    if (!form.dataVistoria) {
      alert("A data da vistoria é obrigatória para o nexo legal.");
      return;
    }
    setAnalisando(true);
    try {
      // 1. Persistência de Prova (Upload PDF)
      const docs = await handleUploadArquivos(arquivos);

      // 2. Registro Inicial do Protocolo
      const vistoriaRef = await addDoc(
        collection(db, "clinicas", clinicaId, "vistorias"),
        {
          ...form,
          documentos: docs,
          status: "processando_ia",
          criadoEm: serverTimestamp(),
          contexto: { cidade: clinica.cidade, uf: clinica.estado, tipo: clinica.tipo }
        }
      );

      // 3. Processamento pelo Agente Especialista
      if (textoBVO.trim().length > 20) {
        setLoadingMsg("Interpretando normas da SESAU/MS...");
        const { interpretarBVO } = await import("../utils/analiseIA");
        
        setTimeout(() => setLoadingMsg("Aplicando Blindagem de Fé Pública (LC 148/2009)..."), 2000);
        
        const analise = await interpretarBVO(textoBVO, clinica, alertasParaIA);

        // 4. Mapeamento das 3 Fases de Blindagem
        await updateDoc(
          doc(db, "clinicas", clinicaId, "vistorias", vistoriaRef.id),
          { analise, status: "blindagem_concluida" }
        );
      }

      setDialogNova(false);
      resetForm();
    } catch (e) {
      console.error("Falha no Agente:", e);
    } finally {
      setAnalisando(false);
    }
  };

  const resetForm = () => {
    setForm({ orgao: "Vigilância Sanitária", numeroBoletim: "", dataVistoria: "", prazoResposta: "30", observacoes: "" });
    setArquivos([]);
    setTextoBVO("");
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

  // ── LISTA DE VISTORIAS ──────────────────────────────────────
  const renderListaVistorias = () => (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={900} color={SLATE}>Vistorias Oficiais</Typography>
          <Typography variant="caption" color="text.secondary">
            BVOs, autos de infração e notificações da Vigilância Sanitária, CRMV, MAPA e outros
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => setDialogNova(true)}
          sx={{ bgcolor: INDIGO, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
        >
          Nova Vistoria
        </Button>
      </Stack>

      {carregando ? (
        <Box textAlign="center" py={6}><CircularProgress sx={{ color: INDIGO }} /></Box>
      ) : vistorias.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
          <GavelIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 2 }} />
          <Typography variant="h6" color={SLATE} fontWeight={800} gutterBottom>Nenhuma vistoria oficial</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Importe um BVO ou Notificação para que o Agente Vertos Intelligence gere a sua blindagem 360.
          </Typography>
          <Button variant="outlined" onClick={() => setDialogNova(true)} sx={{ borderColor: INDIGO, color: INDIGO, fontWeight: 700, borderRadius: 2 }}>
            Registrar primeira vistoria
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {vistorias.map(v => (
            <Grid item xs={12} key={v.id}>
              <Paper 
                variant="outlined" 
                sx={{ p: 2.5, borderRadius: 4, cursor: "pointer", transition: "all .2s", "&:hover": { borderColor: INDIGO, bgcolor: "#f8fafc", boxShadow: "0 4px 12px rgba(67,56,202,0.05)" } }}
                onClick={() => setVistoriaSel(v)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                      <Typography fontWeight={900} color={SLATE}>{v.orgao}</Typography>
                      {v.status === "blindagem_concluida" && (
                        <Chip label="🛡️ BLINDADO 360" size="small" sx={{ bgcolor: "#e0e7ff", color: INDIGO, fontWeight: 900, fontSize: 9, height: 18 }} />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Boletim: {v.numeroBoletim || "S/N"} · Data: {new Date(v.dataVistoria).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#cbd5e1" }} />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
  // ── DETALHE DA VISTORIA ──────────────────────────────────────
  const renderDetalheVistoria = () => {
    const v = vistoriaSel;
    const analise = v.analise;

    const PhaseBlock = ({ num, title, items, color }) => (
      <Box sx={{ mb: 4 }}>
        <Typography fontWeight={900} color={color} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1.5, fontSize: 14, textTransform: "uppercase", letterSpacing: 1 }}>
          <Box sx={{ width: 24, height: 24, borderRadius: 1.5, bgcolor: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{num}</Box>
          {title}
        </Typography>
        <Stack spacing={1.5}>
          {items?.map((it, i) => (
            <Paper key={i} elevation={0} variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderLeft: `5px solid ${color}`, bgcolor: "#fff" }}>
              <Typography variant="body2" fontWeight={800} color={SLATE} mb={0.5}>{it.item || it.descricao}</Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={2} sx={{ lineHeight: 1.5 }}>{it.descricao}</Typography>
              <Box sx={{ bgcolor: "#f1f5f9", p: 1.5, borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <Typography variant="caption" fontWeight={800} color={INDIGO}>🎯 PLANO DE AÇÃO: {it.solucao}</Typography>
              </Box>
            </Paper>
          ))}
          {(!items || items.length === 0) && <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", ml: 5 }}>Nenhuma pendência crítica identificada nesta fase.</Typography>}
        </Stack>
      </Box>
    );

    return (
      <Box>
        <Button startIcon={<span>←</span>} onClick={() => setVistoriaSel(null)} sx={{ mb: 2, color: SLATE, fontWeight: 700, textTransform: "none" }}>Voltar à Lista</Button>
        
        <Paper elevation={0} sx={{ p: 4, borderRadius: 5, background: `linear-gradient(135deg, ${SLATE} 0%, #1e293b 100%)`, color: "#fff", mb: 4, position: "relative", overflow: "hidden" }}>
          <Box sx={{ position: "absolute", right: -30, top: -30, opacity: 0.1 }}>
            <GavelIcon sx={{ fontSize: 180 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.7, fontWeight: 800, letterSpacing: 2 }}>Dossiê de Blindagem Técnica</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>{v.orgao}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Protocolo: {v.numeroBoletim || "S/N"} · Vistoria Oficial em {new Date(v.dataVistoria).toLocaleDateString()}</Typography>
            </Box>
            {analise?.scoreBlindagem !== undefined && (
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800, display: "block", mb: 0.5 }}>SCORE DE BLINDAGEM</Typography>
                <Typography variant="h3" fontWeight={900} sx={{ color: analise.scoreBlindagem > 80 ? "#4ade80" : analise.scoreBlindagem > 50 ? "#fbbf24" : "#f87171" }}>
                  {analise.scoreBlindagem}%
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {analise ? (
              <>
                <PhaseBlock num="1" title="Infraestrutura (Execução Técnica)" items={analise.fase1_infra} color="#6366f1" />
                <PhaseBlock num="2" title="Gestão de Suprimentos (Logística)" items={analise.fase2_logistica} color="#8b5cf6" />
                <PhaseBlock num="3" title="Burocracia e Documentação" items={analise.fase3_burocracia} color="#4f46e5" />
              </>
            ) : (
              <Box textAlign="center" py={10}>
                <CircularProgress sx={{ color: INDIGO, mb: 2 }} />
                <Typography color="text.secondary">O Agente Vertos Intelligence está processando a blindagem...</Typography>
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ position: "sticky", top: 20 }}>
              <Typography variant="subtitle2" fontWeight={900} color={SLATE} gutterBottom sx={{ mb: 2 }}>📎 Arquivos de Fé Pública</Typography>
              <Stack spacing={1.5} mb={4}>
                {v.documentos?.map((d, i) => (
                  <Button key={i} component="a" href={d.url} target="_blank" variant="outlined" startIcon={<UploadFileIcon />} 
                    sx={{ borderRadius: 3, textTransform: "none", borderColor: "#cbd5e1", color: SLATE, justifyContent: "flex-start", fontWeight: 700, fontSize: 12 }}>
                    {d.nome}
                  </Button>
                ))}
              </Stack>
              {analise?.resumoExecutivo && (
                <Paper sx={{ p: 3, borderRadius: 5, bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <PsychologyIcon sx={{ color: INDIGO, fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={900} color="#1e40af">Resumo da Auditoria</Typography>
                  </Stack>
                  <Typography variant="body2" color="#1e3a8a" sx={{ lineHeight: 1.6, fontSize: 13 }}>{analise.resumoExecutivo}</Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // ── DIALOG NOVA VISTORIA ──────────────────────────────────────
  const renderDialogNova = () => (
    <Dialog open={dialogNova} onClose={() => setDialogNova(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 5 } }}>
      <DialogTitle sx={{ bgcolor: SLATE, color: "#fff", fontWeight: 900, py: 3 }}>
        🏛️ Nova Vistoria Oficial
      </DialogTitle>
      <DialogContent sx={{ pt: 4 }}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField select label="Órgão Fiscalizador" fullWidth size="small"
                value={form.orgao}
                onChange={e => setForm(p => ({ ...p, orgao: e.target.value }))}>
                {["Vigilância Sanitária", "CRMV", "MAPA / MAPA Estadual", "IBAMA / Órgão Ambiental", "Prefeitura Municipal", "Outro"].map(o => (
                  <MenuItem key={o} value={o}>{o}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Nº do Boletim" size="small" fullWidth placeholder="ex: 395/2025" value={form.numeroBoletim} onChange={e => setForm(p => ({ ...p, numeroBoletim: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Data da Vistoria" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={form.dataVistoria} onChange={e => setForm(p => ({ ...p, dataVistoria: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Prazo de Resposta (dias)" type="number" size="small" fullWidth value={form.prazoResposta} onChange={e => setForm(p => ({ ...p, prazoResposta: e.target.value }))} />
            </Grid>
          </Grid>

          <Box>
            <Typography fontSize={12} fontWeight={900} color={SLATE} gutterBottom>📎 Upload do BVO (PDF/Imagem)</Typography>
            <Box sx={{ border: "2px dashed #cbd5e1", borderRadius: 4, p: 3, textAlign: "center", cursor: "pointer", bgcolor: "#f8fafc", "&:hover": { bgcolor: "#f1f5f9" } }} onClick={() => document.getElementById("upload-bvo-2").click()}>
              <input id="upload-bvo-2" type="file" accept="application/pdf,image/*" multiple hidden onChange={e => setArquivos(Array.from(e.target.files))} />
              <UploadFileIcon sx={{ fontSize: 40, color: INDIGO, mb: 1 }} />
              <Typography fontSize={13} color={SLATE} fontWeight={700}>
                {arquivos.length > 0 ? arquivos.map(f => f.name).join(", ") : "Clique para anexar os documentos oficiais"}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <PsychologyIcon sx={{ color: INDIGO, fontSize: 20 }} />
              <Typography fontSize={13} fontWeight={900} color={SLATE}>Extração e Blindagem Inteligente</Typography>
            </Stack>
            <TextField multiline rows={6} fullWidth placeholder="Cole o texto do boletim para processamento imediato pelo Agente..." value={textoBVO} onChange={e => setTextoBVO(e.target.value)} sx={{ bgcolor: "#fff", borderRadius: 2 }} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 4, gap: 1 }}>
        <Button onClick={() => setDialogNova(false)} disabled={analisando} sx={{ fontWeight: 700, color: SLATE }}>Cancelar</Button>
        <Button variant="contained" disabled={analisando || uploadando || !form.dataVistoria} onClick={handleStartAnalysis} startIcon={analisando ? <CircularProgress size={16} color="inherit" /> : <SmartToyIcon />} sx={{ bgcolor: INDIGO, borderRadius: 3, px: 4, fontWeight: 800, textTransform: "none" }}>
          {analisando ? loadingMsg : "Analisar e Blindar"}
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

