import React, { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper, Button, Chip, Card, CardContent,
  LinearProgress, Divider, Alert, Stack,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import TableChartIcon from "@mui/icons-material/TableChart";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import ReactApexChart from "react-apexcharts";
import { getAreaById } from "../data/rtTypes";
import { getNivel } from "../data/gamificacao";
import { generateFlightPlan } from "../data/flightPlan";

const SETORES_LABELS = ["Recepção (A)", "Clínica (B)", "CC (C)", "Higienização (D)", "Medicamentos (E)"];

function RadarChart({ scores }) {
  const options = {
    chart: { type: "radar", toolbar: { show: false }, background: "transparent" },
    xaxis: { categories: SETORES_LABELS },
    yaxis: { min: 0, max: 100 },
    fill: { opacity: 0.3, colors: ["#52b788"] },
    stroke: { colors: ["#1b4332"], width: 2 },
    markers: { colors: ["#1b4332"], size: 4 },
    plotOptions: { radar: { polygons: { strokeColors: "#e8f5e9", connectorColors: "#e8f5e9" } } },
    tooltip: { y: { formatter: (v) => `${v}%` } },
    legend: { show: false },
  };
  const series = [{ name: "Conformidade", data: scores }];
  return <ReactApexChart options={options} series={series} type="radar" height={280} />;
}

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

export default function Dashboard() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const navigate = useNavigate();
  const [scores, setScores] = useState([80, 75, 60, 85, 70]);
  const [loading, setLoading] = useState(true);
  const [unidade, setUnidade] = useState(null);
  
  // Novos estados para KPIs
  const [scoreGeral, setScoreGeral] = useState(0);
  const [totalAuditorias, setTotalAuditorias] = useState(0);
  const [auditoriasAltas, setAuditoriasAltas] = useState(0);
  const [ultimaData, setUltimaData] = useState("—");
  const [estoqueCritico, setEstoqueCritico] = useState(0);

  // Carregar dados da unidade (vencimentos + área RT)
  useEffect(() => {
    if (!userData?.selectedClinicaId) return;
    getDoc(doc(db, "clinicas", userData.selectedClinicaId))
      .then((snap) => { if (snap.exists()) setUnidade({ id: snap.id, ...snap.data() }); })
      .catch(() => {});
  }, [userData?.selectedClinicaId]);

  const areaRT = unidade?.areaAtuacao ? getAreaById(unidade.areaAtuacao) : null;

  // Load auditorias
  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "auditorias"),
      where("userId", "==", userData.uid),
      where("clinicaId", "==", userData.selectedClinicaId),
      orderBy("criadoEm", "desc"),
      limit(20)
    );
    getDocs(q).then((snap) => {
      setTotalAuditorias(snap.docs.length);
      
      if (!snap.empty) {
        const bySetor = {};
        snap.docs.forEach((auditDoc) => {
          const data = auditDoc.data();
          if (data.secaoId && data.score !== undefined) {
            if (!bySetor[data.secaoId] || data.criadoEm > bySetor[data.secaoId].criadoEm) {
              bySetor[data.secaoId] = data;
            }
          }
        });
        
        const newScores = ["A","B","C","D","E"].map((s) => bySetor[s]?.score ?? 0);
        if (newScores.some(s => s > 0)) setScores(newScores);

        // Cálculos para KPIs
        const scoresValidos = Object.values(bySetor).map(v => v.score).filter(v => v > 0);
        const media = scoresValidos.length > 0 
          ? Math.round(scoresValidos.reduce((a, b) => a + b, 0) / scoresValidos.length) 
          : 0;
        
        setScoreGeral(media);
        setAuditoriasAltas(snap.docs.filter(d => (d.data().score || 0) >= 95).length);
        setUltimaData(snap.docs[0]?.data().criadoEm?.toDate()?.toLocaleDateString("pt-BR") || "—");
      }
    }).finally(() => setLoading(false));

    // Carregar Alertas de Estoque (SIPEAGRO) para PRO
    if (userData?.plan === "pro") {
      const qE = query(collection(db, "controlados", userData.uid, "estoque"), where("status", "==", "ativo"));
      getDocs(qE).then(snap => {
        const criticos = snap.docs.filter(d => {
          const item = d.data();
          return (item.volumeRestante / item.volumeTotal) <= 0.1;
        }).length;
        setEstoqueCritico(criticos);
      });
    }
  }, [userData?.uid, userData?.selectedClinicaId, userData?.plan]);

  if (!pode("dashboard")) {
    return <BloqueioRecurso recurso="VERTOS Cockpit" planoMinimo={planoMinimo("dashboard")} />;
  }

  const riscos = scores.filter((s) => s < 70).length;

  // Gerador dinâmico do Plano de Voo baseado na Área e Especialidades
  const planningData = React.useMemo(() => {
    return generateFlightPlan(unidade?.areaAtuacao, userData?.especialidades || []);
  }, [unidade?.areaAtuacao, userData?.especialidades]);

  const [activeWeek, setActiveWeek] = useState(0);

  // Cálculo de alertas para o KPI
  const getAlertas = () => {
    if (!unidade) return [];
    const keys = ["vencSipeagro", "vencAlvara", "vencCaixaAgua", "vencCrmv", "vencVacinas", "vencArt"];
    const alerts = [];
    keys.forEach(k => {
      const v = unidade[k];
      if (v) {
        const dias = Math.ceil((new Date(v) - new Date()) / 86400000);
        if (dias < 0) alerts.push({ label: k, tipo: "error" });
        else if (dias <= 30) alerts.push({ label: k, tipo: "warning" });
      }
    });
    if (!unidade.numSipeagro) {
      alerts.push({ label: "Nº SIPEAGRO", tipo: "warning" });
    }
    if (estoqueCritico > 0) {
      alerts.push({ label: "Estoque Crítico", tipo: "warning" });
    }
    return alerts;
  };
  const alertas = getAlertas();

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      
      {/* 1. Banner de manutenção preventiva no topo */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        bgcolor: "#f0fdf4", border: "1px solid #b7e4c7",
        borderRadius: "12px", p: 1.5, mb: 2,
      }}>
        <BuildIcon sx={{ color: "#52b788", fontSize: 18, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.78rem", color: "#1b4332", fontWeight: 600, flex: 1 }}>
          <strong>MAIO / NOV:</strong> Manutenção Preventiva — Autoclave e Monitores Multiparamétricos
          conforme RDC 197/2017.
        </Typography>
      </Box>

      {/* 2. Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1b4332">
            VERTOS OS · COCKPIT
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
            <Typography variant="body2" color="text.secondary">
              Painel de comando — visão 360° do compliance
            </Typography>
            {areaRT && (
              <Chip
                label={`${areaRT.emoji} ${areaRT.label}`}
                size="small"
                sx={{ background: areaRT.bg, color: areaRT.cor, fontWeight: 600, fontSize: 11,
                  border: `1px solid ${areaRT.cor}30` }}
              />
            )}
          </Box>
        </Box>
        <Chip
          icon={riscos > 0 ? <WarningAmberIcon /> : <CheckCircleIcon />}
          label={riscos > 0 ? `⚠ ${riscos} RISCO${riscos > 1 ? "S" : ""}` : "OPERAÇÃO PROTEGIDA"}
          sx={{
            background: riscos > 0 ? "#fff3e0" : "#e8f5e9",
            color: riscos > 0 ? "#e65100" : "#1b4332",
            fontWeight: 700,
            fontSize: 13,
            border: `1px solid ${riscos > 0 ? "#ffe0b2" : "#c8e6c9"}`,
          }}
        />
      </Box>

      {/* 3. Mensagem de Responsabilidade Técnica (REDUZIDO) */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: "16px", 
        border: "1px solid #1b433230", 
        background: "linear-gradient(135deg, #fff 0%, #f9fdfa 100%)",
        boxShadow: "0 4px 12px rgba(27,67,50,0.05)",
      }}>
        <Box sx={{ p: 2, display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: "12px", 
            bgcolor: "#1b4332", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
          }}>
            <VerifiedUserIcon sx={{ fontSize: 24, color: "#fff" }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={900} color="#1b4332">
              A Missão do Responsável Técnico
            </Typography>
            <Typography variant="caption" sx={{ color: "#666", lineHeight: 1.4, fontWeight: 500, display: "block" }}>
              Zele pela qualidade técnica, ética e segurança da empresa, fiscalização e sociedade.
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, opacity: 0.1 }} />
          <Typography variant="caption" sx={{ fontStyle: "italic", color: "#888", fontWeight: 600, maxWidth: 250, display: { xs: "none", md: "block" } }}>
            "O RT é o elo entre a empresa e a sociedade."
          </Typography>
        </Box>
      </Card>

      {/* 3.1 ALERTA DE VENCIMENTOS (AUMENTADO E CENTRAL) */}
      {alertas.length > 0 && (
        <Paper elevation={0} sx={{ 
          mb: 3, p: 2, borderRadius: "16px", 
          bgcolor: alertas.some(a => a.tipo === "error") ? "#FCEBEB" : "#FFF8E1",
          border: `1px solid ${alertas.some(a => a.tipo === "error") ? "#F8D7DA" : "#FFE082"}`,
          display: "flex", alignItems: "center", gap: 2
        }}>
          <Box sx={{ 
            p: 1.5, borderRadius: "50%", 
            bgcolor: alertas.some(a => a.tipo === "error") ? "#d32f2f" : "#ffa000",
            color: "#fff", display: "flex"
          }}>
            <ErrorIcon fontSize="medium" />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={900} color={alertas.some(a => a.tipo === "error") ? "#d32f2f" : "#b26a00"}>
              {alertas.some(a => a.tipo === "error") ? "⚠️ ATENÇÃO: DOCUMENTAÇÃO VENCIDA!" : "🔔 ATENÇÃO: VENCIMENTOS PRÓXIMOS"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Existem {alertas.length} item(s) que precisam de sua atenção imediata na {unidade?.nomeFantasia || "unidade"}.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => navigate("/perfil")}
            sx={{ 
              bgcolor: alertas.some(a => a.tipo === "error") ? "#d32f2f" : "#ffa000",
              "&:hover": { bgcolor: alertas.some(a => a.tipo === "error") ? "#b71c1c" : "#ff8f00" }
            }}
          >
            Regularizar Agora
          </Button>
        </Paper>
      )}

      {/* 4. Linha de 4 KPI cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Score geral",
            valor: scoreGeral,            // média dos scores A-E em %
            sub: `Última inspeção · ${ultimaData}`,
            extra: <LinearProgress variant="determinate" value={scoreGeral}
                     sx={{ mt: 0.5, borderRadius: 4, height: 5,
                           "& .MuiLinearProgress-bar": { bgcolor: "#52b788" },
                           bgcolor: "#e8f5e9" }} />,
          },
          {
            label: "Auditorias",
            valor: totalAuditorias,
            sub: "Total realizadas",
            badge: auditoriasAltas === 0
              ? { txt: "0 com ≥95%", cor: "warning" }
              : { txt: `${auditoriasAltas} com ≥95%`, cor: "success" },
          },
          {
            label: "Vencimentos",
            valor: alertas.length,
            sub: "Alertas ativos",
            badge: alertas.some(a => a.tipo === "error")
              ? { txt: `${alertas.filter(a => a.tipo === "error").length} vencido(s)`, cor: "error" }
              : alertas.length === 0
                ? { txt: "Tudo em dia", cor: "success" }
                : { txt: `${alertas.length} próximo(s)`, cor: "warning" },
          },
          {
            label: "Planilhas",
            valor: "7",
            sub: "Obrigatórias exigidas",
            badge: { txt: "+ 3 sugeridas", cor: "info" },
            isNovo: true,                 // exibe chip "novo" no label
          },
        ].map((kpi, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "14px", borderColor: "#e0e0e0" }}>
              <Typography variant="overline" sx={{ fontSize: "0.6rem", fontWeight: 800, color: "#888" }}>
                {kpi.label}
                {kpi.isNovo && (
                  <Chip label="novo" size="small" sx={{
                    ml: 0.5, height: 14, fontSize: "0.55rem", fontWeight: 800,
                    bgcolor: "#e3f2fd", color: "#1565c0",
                  }} />
                )}
              </Typography>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: "#1b4332", lineHeight: 1 }}>
                {typeof kpi.valor === "number" ? kpi.valor : kpi.valor}
                {typeof kpi.valor === "number" && kpi.label === "Score geral" ? "%" : ""}
              </Typography>
              {kpi.extra}
              <Typography variant="caption" sx={{ color: "#888", fontSize: "0.65rem" }}>
                {kpi.sub}
              </Typography>
              {kpi.badge && (
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={kpi.badge.txt}
                    size="small"
                    color={kpi.badge.cor}
                    sx={{ height: 16, fontSize: "0.55rem", fontWeight: 800 }}
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 2, border: "0.5px solid", borderColor: "divider",
        background: "linear-gradient(135deg, #1565c008, #e6510008)",
        borderRadius: 3, p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography fontWeight={700} fontSize={14}>
              🎯 Trilha de Auditoria — Diretrizes CFMV/CRMVs 2023
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {userData?.gamificacao
                ? `${getNivel(userData.gamificacao?.historico_scores?.[0] ?? 0).emoji} ${getNivel(userData.gamificacao?.historico_scores?.[0] ?? 0).nome} · ${userData.gamificacao?.xp?.toLocaleString("pt-BR") ?? 0} XP`
                : "Avalie seu compliance com base nas Diretrizes CFMV 2023"
              }
            </Typography>
          </Box>
          <Button variant="contained" size="small"
            onClick={() => navigate("/trilha-auditoria")}
            sx={{ borderRadius: 2, fontWeight: 700, whiteSpace: "nowrap" }}>
            Auditar Agora
          </Button>
        </Stack>
      </Card>

      <Grid container spacing={3}>
        {/* Radar de conformidade */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1.5px solid #e8f5e9", p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1b4332">
                Escudo de Blindagem Ativo
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<DescriptionIcon />}
                  onClick={() => navigate("/termos")}
                  variant="outlined"
                  sx={{ borderColor: "#1b4332", color: "#1b4332", borderRadius: 2, fontSize: 11 }}
                >
                  TCLE
                </Button>
                <Button
                  size="small"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate("/auditorias/nova")}
                  variant="contained"
                  sx={{ background: "#1b4332", color: "#fff", borderRadius: 2, fontSize: 11 }}
                >
                  Auditar
                </Button>
              </Box>
            </Box>

            <RadarChart scores={scores} />

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1, mb: 2, flexWrap: "wrap" }}>
              {["A","B","C","D","E"].map((s, i) => (
                <Chip key={s} label={`${s}: ${scores[i]}%`} size="small"
                  sx={{ background: scores[i] >= 70 ? "#e8f5e9" : "#fff3e0", color: scores[i] >= 70 ? "#1b4332" : "#e65100", fontWeight: 700, fontSize: 10 }} />
              ))}
            </Box>

            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => navigate("/relatorios-crmv")}
              startIcon={<EmojiEventsIcon sx={{ fontSize: 14 }} />}
              sx={{
                color: "#1565c0", borderColor: "#1565c0",
                fontSize: "0.6rem", borderRadius: "8px",
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
            >
              Relatórios CRMV
            </Button>
          </Paper>
        </Grid>

        {/* Radar de vencimentos */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1.5px solid #e8f5e9", p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={1}>
              Radar de Vencimentos
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Alertas com 30 dias de antecedência
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
              {[
                { label: "SIPEAGRO", key: "vencSipeagro" },
                { label: "Alvará Sanitário", key: "vencAlvara" },
                { label: "Caixa d’água", key: "vencCaixaAgua" },
                { label: "CRMV", key: "vencCrmv" },
                { label: "Cadeia de Vacinas", key: "vencVacinas" },
                { label: "Validade da ART", key: "vencArt" },
              ].map((item) => (
                <VencimentoItem key={item.key} label={item.label} venc={unidade?.[item.key]} />
              ))}
              {alertas.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ py: 2, display: "block", textAlign: "center" }}>
                  Nenhum vencimento próximo ou atrasado.
                </Typography>
              )}
            </Box>
            
            <Box mt={1} mb={2}>
              <Typography variant="caption" color="text.secondary">
                Configure vencimentos em{" "}
                <span
                  style={{ color: "#1b4332", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => navigate("/perfil")}
                >
                  Perfil / Unidade
                </span>
              </Typography>
            </Box>

            {/* Ações rápidas */}
            <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #f0f0f0" }}>
              <Typography variant="overline" sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#aaa" }}>
                Ações rápidas
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {[
                  { label: "Rel. CRMV",     icon: <EmojiEventsIcon sx={{ fontSize: 16 }} />, path: "/relatorios-crmv", isNovo: true  },
                  { label: "Rotina Diária", icon: <CalendarMonthIcon sx={{ fontSize: 16 }} />, path: "/rotina",          isNovo: true  },
                  { label: "Planilhas",     icon: <TableChartIcon  sx={{ fontSize: 16 }} />, path: "/planilhas",       isNovo: true  },
                  { label: "Gerar TCLE",    icon: <DescriptionIcon sx={{ fontSize: 16 }} />, path: "/termos",          isNovo: false },
                  { label: "Nova Auditoria",icon: <AddCircleIcon   sx={{ fontSize: 16 }} />, path: "/auditorias/nova", isNovo: false },
                ].map((acao) => (
                  <Grid item xs={6} key={acao.label}>
                    <Box
                      onClick={() => navigate(acao.path)}
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.8,
                        p: 0.8, borderRadius: "10px", cursor: "pointer",
                        border: "1px solid #f0f0f0", bgcolor: "#fafafa",
                        transition: "all 0.2s",
                        "&:hover": { bgcolor: "#f0fdf4", borderColor: "#52b788" },
                      }}
                    >
                      <Box sx={{ color: "#52b788" }}>{acao.icon}</Box>
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#1b4332" }}>
                        {acao.label}
                      </Typography>
                      {acao.isNovo && (
                        <Chip label="novo" size="small" sx={{
                          ml: "auto", height: 14, fontSize: "0.5rem", fontWeight: 800,
                          bgcolor: "#e3f2fd", color: "#1565c0",
                        }} />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* ── PLANO DE VOO MENSAL (REMODELADO) ── */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ borderRadius: 4, border: "1.5px solid #1b4332", p: 0, overflow: "hidden" }}>
            {/* Header do Bloco */}
            <Box sx={{ p: 3, bgcolor: "#f1f8f6", borderBottom: "1.5px solid #1b433220", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#1b4332">
                  Plano de Voo Mensal do RT
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Planejamento Integrado: CFMV, ANVISA e SIPEAGRO
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                {["CFMV 1374", "RDC 222", "SIPEAGRO"].map(tag => (
                  <Chip key={tag} label={tag} size="small" sx={{ fontWeight: 800, fontSize: 10, bgcolor: "#1b4332", color: "#fff" }} />
                ))}
              </Box>
            </Box>

            <Grid container>
              {/* Seletor de Semana (Lateral no Desktop, Topo no Mobile) */}
              <Grid item xs={12} md={3} sx={{ borderRight: { md: "1.5px solid #1b433220" }, bgcolor: "#fff" }}>
                <Box sx={{ p: 1 }}>
                  {planningData.map((data, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setActiveWeek(idx)}
                      sx={{
                        p: 2, mb: 1, borderRadius: 3, cursor: "pointer", transition: "all 0.2s",
                        bgcolor: activeWeek === idx ? "#1b4332" : "transparent",
                        color: activeWeek === idx ? "#fff" : "#1b4332",
                        "&:hover": { bgcolor: activeWeek === idx ? "#1b4332" : "#f0fdf4" }
                      }}
                    >
                      <Typography variant="overline" sx={{ fontWeight: 900, lineHeight: 1, opacity: 0.8 }}>Semana {idx + 1}</Typography>
                      <Typography variant="subtitle2" fontWeight={800}>{data.focus}</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>

              {/* Conteúdo da Semana Ativa */}
              <Grid item xs={12} md={9} sx={{ p: 3, bgcolor: "#fff" }}>
                <Typography variant="subtitle1" fontWeight={900} color="#1b4332" mb={3} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarMonthIcon sx={{ color: "#52b788" }} />
                  {planningData[activeWeek].week}
                </Typography>

                <Grid container spacing={2}>
                  {planningData[activeWeek].tasks.map((task) => (
                    <Grid item xs={12} key={task.id}>
                      <Box sx={{ 
                        display: "flex", alignItems: "center", justifyContent: "space-between", 
                        p: 2, borderRadius: 3, border: "1.2px solid #e8f5e9",
                        transition: "all 0.2s",
                        "&:hover": { borderColor: "#1b4332", bgcolor: "#f9fdfa" }
                      }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box sx={{ 
                            p: 1, borderRadius: 2, 
                            bgcolor: task.urgent ? "#fff3e0" : "#f0fdf4",
                            color: task.urgent ? "#e65100" : "#1b4332"
                          }}>
                            {task.urgent ? <WarningAmberIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">{task.text}</Typography>
                            <Typography variant="caption" sx={{ color: "#aaa", fontWeight: 800, textTransform: "uppercase", fontSize: 9 }}>
                              Base Legal: {task.source}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #e8f5e9" }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>

            {/* Rodapé de Alertas */}
            <Box sx={{ p: 2, bgcolor: "#fafafa", borderTop: "1.5px solid #1b433220" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Alert icon={<BuildIcon fontSize="small" />} severity="warning" sx={{ borderRadius: 3, "& .MuiAlert-message": { fontSize: "0.75rem" } }}>
                    <strong>Alerta Crítico (SIPEAGRO):</strong> Relatórios de psicotrópicos devem ser fechados mensalmente para evitar multas.
                  </Alert>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Alert icon={<AssignmentIcon fontSize="small" />} severity="info" sx={{ borderRadius: 3, "& .MuiAlert-message": { fontSize: "0.75rem" } }}>
                    <strong>Gestão de Laudos (Res. 1374):</strong> Armazenamento obrigatório por 5 anos. Participe do CEQ anualmente.
                  </Alert>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* ─── BLINDAGEM 360°: BASE DE CONHECIMENTO & OUVIDORIA ─── */}
        <Grid item xs={12} container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, bgcolor: "#1b4332", color: "#fff", height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
                <PsychologyIcon sx={{ fontSize: 150 }} />
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <HelpOutlineIcon /> Base de Conhecimento
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                  Acesse POPs, Manuais e a 1ª Edição das Diretrizes de Atuação do RT (2023).
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => navigate("/ajuda")}
                  sx={{ bgcolor: "#fff", color: "#1b4332", fontWeight: 800, "&:hover": { bgcolor: "#f0fdf4" } }}
                >
                  Explorar Biblioteca
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, border: "1.5px solid #e8f5e9", height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} color="#1b4332" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SupportAgentIcon /> Ouvidoria & Jurídico
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Canal direto para dúvidas sobre fiscalização, contratos e Blindagem Jurídica.
                </Typography>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => navigate("/suporte")}
                  sx={{ borderColor: "#1b4332", color: "#1b4332", fontWeight: 800 }}
                >
                  Falar com Consultor
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, border: "1.5px solid #fff3e0", bgcolor: "#fff8f1", height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={900} color="#e65100" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <WarningAmberIcon /> Matriz de Estresse
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VolumeUpIcon sx={{ fontSize: 14 }} /> Nível Sonoro (dB)
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>Baixo</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={30} sx={{ height: 6, borderRadius: 3, bgcolor: "#ffe0b2", "& .MuiLinearProgress-bar": { bgcolor: "#fb8c00" } }} />
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 14 }} /> Poluição Visual
                      </Typography>
                      <Typography variant="caption" fontWeight={700}>Controlado</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={15} sx={{ height: 6, borderRadius: 3, bgcolor: "#ffe0b2", "& .MuiLinearProgress-bar": { bgcolor: "#fb8c00" } }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', mt: 1 }}>
                    Fatores ambientais monitorados conforme CFMV 1000/2012.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
