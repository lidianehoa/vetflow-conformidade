import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Grid, Paper, Tabs, Tab, CircularProgress,
  Button, Stack, Chip, Divider, List, ListItem, ListItemText, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ListItemIcon, Tooltip, CardContent, Card, FormControlLabel,
  Checkbox, Select, MenuItem
} from "@mui/material";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
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
import { gerarHashSHA256, gerarSmartID } from "../utils/security";
import { interpretarBVO } from "../utils/bvoAI";

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
          if (data.ultimoDiagnostico) setDiagnostico(data.ultimoDiagnostico);
          
          // Get sector labels for radar
          const checklists = getChecklistsPorTipo(data.tipo);
          setLabels(checklists.map(c => c.nome.split("—")[0].trim()));
          
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
            // Calculate latest scores for radar
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
                  // Mapeia o tipo da clínica para a especialidade da IA
                  const specMap = {
                    'clinica': 'Clínico/Hospitalar',
                    'hospital': 'Clínico/Hospitalar',
                    'consultorio': 'Clínico/Hospitalar',
                    'petshop': 'Comércio/Varejo',
                    'banho_tosa': 'Serviços (Banho e Tosa/Creche)',
                    'hotel_creche': 'Serviços (Banho e Tosa/Creche)'
                  };
                  const especialidade = specMap[clinica.tipo] || 'Clínico/Hospitalar';
                  
                  const res = await interpretarBVO(textoBVO, especialidade);
                  setDiagnostico(res);
                  await updateDoc(doc(db, "clinicas", clinicaId), { ultimoDiagnostico: res });
                  setTab(1); 
                  setDialogBVO(false);
                  setTextOBVO("");
                } catch (e) {
                  alert("Erro ao interpretar BVO. Verifique o formato do texto.");
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

// ── COMPONENTE: ABA DIAGNÓSTICO 360 (BVO AI) ──────────────────────
function AbaDiagnostico({ clinica, clinicaId, diagnostico, setDiagnostico }) {
  const navigate = useNavigate();

  if (!diagnostico) return (
    <Box textAlign="center" py={8}>
      <PsychologyIcon sx={{ fontSize: 64, color: "#eee", mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>Sem Diagnóstico Ativo</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Importe um BVO ou Notificação da Vigilância Sanitária para gerar automaticamente<br/>
        seu plano de ação de conformidade 360°.
      </Typography>
    </Box>
  );

  const renderFase = (titulo, itens, cor, icon) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" fontWeight={900} color={cor} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon} {titulo}
      </Typography>
      <Grid container spacing={2}>
        {(itens || []).map((item, i) => (
          <Grid item xs={12} md={6} key={i}>
            <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: `5px solid ${cor}` }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="caption" fontWeight={800} color={cor}>ITEM {item.item}</Typography>
                  <Tooltip title="Ver no sistema">
                    <Button size="small" onClick={() => navigate(item.rota)} sx={{ minWidth: 0, p: 0.5, color: cor }}>
                      <AddCircleIcon fontSize="small" />
                    </Button>
                  </Tooltip>
                </Stack>
                <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>{item.descricao}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, p: 1, bgcolor: "#f8f9fa", borderRadius: 1 }}>
                  💡 {item.solucao}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "#1b4332", color: "#fff", borderRadius: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" fontWeight={900}>Diagnóstico 360° — Auditoria IA</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Processado em: {new Date(diagnostico.dataProcessamento).toLocaleString()} | ID: {diagnostico.smartId}
            </Typography>
          </Box>
          <Chip label="CONFORMIDADE 2023" size="small" sx={{ bgcolor: "#fff", color: "#1b4332", fontWeight: 900 }} />
        </Stack>
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', opacity: 0.9 }}>
          "{diagnostico.resumoExecutivo}"
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<FactCheckIcon />}
          sx={{ mt: 2, bgcolor: "#52b788", color: "#1b4332", fontWeight: 800, "&:hover": { bgcolor: "#b7e4c7" } }}
          onClick={() => {
            const preFill = {
              resumo_executivo: diagnostico.resumoExecutivo,
              fase1_infra: (diagnostico.diagnostico.infraestrutura || []).map(i => `${i.item}: ${i.descricao}`).join('\n'),
              fase2_logistica: (diagnostico.diagnostico.logistica || []).map(i => `${i.item}: ${i.descricao}`).join('\n'),
              fase3_burocracia: (diagnostico.diagnostico.burocracia || []).map(i => `${i.item}: ${i.descricao}`).join('\n'),
            };
            navigate("/laudos/novo/LAU_CONSOLIDADO_BVO", { state: { preFill } });
          }}
        >
          Exportar Relatório Consolidado
        </Button>
      </Paper>

      {renderFase("Fase 1: Infraestrutura", diagnostico.diagnostico.infraestrutura, "#c62828", <BuildIcon />)}
      <Divider sx={{ my: 4 }} />
      {renderFase("Fase 2: Logística e Processos", diagnostico.diagnostico.logistica, "#e65100", <LocalShippingIcon />)}
      <Divider sx={{ my: 4 }} />
      {renderFase("Fase 3: Burocracia e Documentos", diagnostico.diagnostico.burocracia, "#1565c0", <FactCheckIcon />)}
      
      <Box sx={{ mt: 6, p: 3, border: '1px dashed #52b788', borderRadius: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="#1b4332" fontWeight={700}>
          🛡️ Prova de Atuação: Após sanar as pendências, anexe as evidências fotos nas Auditorias para o Smart ID final.
        </Typography>
      </Box>
    </Box>
  );
}
