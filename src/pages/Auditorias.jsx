import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip, CircularProgress,
  Tabs, Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LinkIcon from "@mui/icons-material/Link";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryIcon from "@mui/icons-material/History";
import { useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import ReactApexChart from "react-apexcharts";
import RelatorioRegularizacao from "./RelatorioRegularizacao";
import { BadgeIntegridade } from "../components/Segurança/BadgeIntegridade";

function getScoreColor(score) {
  if (score >= 90) return "#1b4332";
  if (score >= 70) return "#e65100";
  return "#d32f2f";
}

export default function Auditorias() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const navigate = useNavigate();
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  if (!pode("auditorias")) {
    return <BloqueioRecurso recurso="Portal de Compliance" planoMinimo={planoMinimo("auditorias")} />;
  }

  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(
      collection(db, "auditorias"),
      where("userId", "==", userData.uid),
      where("clinicaId", "==", userData.selectedClinicaId),
      orderBy("criadoEm", "desc")
    );
    getDocs(q).then((snap) => {
      setAuditorias(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }).finally(() => setLoading(false));
  }, [userData?.uid, userData?.selectedClinicaId]);

  const evolucao = auditorias.slice().reverse().map((a) => a.score ?? 0);
  const labels = auditorias.slice().reverse().map((a) =>
    a.criadoEm?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—"
  );

  const chartOptions = {
    chart: { type: "line", toolbar: { show: false } },
    xaxis: { categories: labels, labels: { style: { fontSize: "11px" } } },
    yaxis: { min: 0, max: 100, labels: { formatter: (v) => `${v}%` } },
    stroke: { curve: "smooth", colors: ["#1b4332"], width: 3 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.25, opacityTo: 0, stops: [0, 100] } },
    markers: { colors: ["#52b788"], size: 5 },
    tooltip: { y: { formatter: (v) => `${v}%` } },
    grid: { borderColor: "#e8f5e9" },
  };

  const ultimoScore = auditorias[0]?.score ?? null;
  const totalProtegidas = auditorias.filter((a) => (a.score ?? 0) >= 95).length;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1b4332">
            Portal de Compliance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspeções técnicas e regularização sanitária
          </Typography>
        </Box>
        <Button
          id="btn-nova-auditoria"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/auditorias/nova")}
          sx={{ background: "#1b4332", color: "#fff", borderRadius: 3, fontWeight: 700 }}
        >
          Nova Auditoria
        </Button>
      </Box>

      <Tabs 
        value={tab} 
        onChange={(e, v) => setTab(v)} 
        sx={{ 
          mb: 4,
          "& .MuiTabs-indicator": { bgcolor: "#1b4332" },
          "& .MuiTab-root": { fontWeight: 700, color: "#888", textTransform: "none" },
          "& .Mui-selected": { color: "#1b4332 !important" }
        }}
      >
        <Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Histórico de Auditorias" />
        <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Regularização (Vigilância Sanitária)" />
      </Tabs>

      {tab === 1 ? (
        <RelatorioRegularizacao />
      ) : (
        <>
          {/* Stats */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 3, p: 2.5, minWidth: 140, flex: "0 0 auto" }}>
              <Typography variant="h4" fontWeight={800} color="#1b4332">
                {ultimoScore !== null ? `${ultimoScore}%` : "—"}
              </Typography>
              <Typography variant="caption" color="text.secondary">Última inspeção</Typography>
            </Paper>
            <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 3, p: 2.5, minWidth: 140, flex: "0 0 auto" }}>
              <Typography variant="h4" fontWeight={800} color="#1b4332">{totalProtegidas}</Typography>
              <Typography variant="caption" color="text.secondary">Inspeções ≥ 95%</Typography>
            </Paper>
            <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 3, p: 2.5, minWidth: 140, flex: "0 0 auto" }}>
              <Typography variant="h4" fontWeight={800} color="#1b4332">{auditorias.length}</Typography>
              <Typography variant="caption" color="text.secondary">Total de auditorias</Typography>
            </Paper>
          </Box>

          {/* Gráfico evolução */}
          {evolucao.length > 0 && (
            <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
                Evolução da Blindagem
              </Typography>
              <ReactApexChart
                options={chartOptions}
                series={[{ name: "Score", data: evolucao }]}
                type="area"
                height={220}
              />
            </Paper>
          )}

          {/* Tabela histórico */}
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid #e8f5e9" }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1b4332">
                Histórico de Inspeções
              </Typography>
            </Box>
            {loading ? (
              <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress sx={{ color: "#1b4332" }} /></Box>
            ) : auditorias.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography color="text.secondary">Nenhuma auditoria ainda. Clique em "Nova Auditoria".</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background: "#f0fdf4" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Smart ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Identificação</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Setor</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Data</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Integridade</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1b4332" }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditorias.map((aud) => (
                      <TableRow key={aud.id} hover>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace" color="#546e7a">
                            {aud.smartId || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{aud.nomeProntuario || "—"}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={aud.secaoId || "—"} size="small"
                            sx={{ background: "#e8f5e9", color: "#1b4332", fontWeight: 700, fontSize: 11 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {aud.criadoEm?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800} color={getScoreColor(aud.score ?? 0)}>
                            {aud.score ?? "—"}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <BadgeIntegridade registro={aud} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="Visualizar Relatório / PDF">
                              <IconButton 
                                size="small" 
                                sx={{ color: "#1b4332" }}
                                onClick={() => navigate(`/auditorias/visualizar/${aud.id}`)}
                              >
                                <PictureAsPdfIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {pode("simplesVet") && (
                              <Tooltip title="Abrir no SimplesVet">
                                <IconButton size="small" sx={{ color: "#0d47a1" }}>
                                  <LinkIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}
