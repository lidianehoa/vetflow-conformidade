import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Paper, Tabs, Tab, CircularProgress,
  Button, Stack, Chip, Divider, List, ListItem, ListItemText, Alert,
} from "@mui/material";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
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

  useEffect(() => {
    if (!clinicaId) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "clinicas", clinicaId));
        if (snap.exists()) {
          const data = snap.data();
          setClinica(data);
          
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
    })();
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
          <Tab label="Auditorias" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Documentos" sx={{ fontWeight: 700, textTransform: "none" }} />
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
                      <Button fullWidth variant="outlined" startIcon={<EmojiEventsIcon />} 
                        onClick={() => navigate("/relatorios-crmv", { state: { clinicaId } })}
                        sx={{ borderRadius: 2, fontSize: 11 }}>Relatórios</Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          )}

          {tab === 1 && (
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

          {tab === 2 && (
            <Box textAlign="center" py={5}>
              <DescriptionIcon sx={{ fontSize: 48, color: "#eee", mb: 2 }} />
              <Typography color="text.secondary">Módulo de Documentos em expansão para este tipo de estabelecimento.</Typography>
            </Box>
          )}

          {tab === 3 && (
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
      </Paper>
    </Box>
  );
}
