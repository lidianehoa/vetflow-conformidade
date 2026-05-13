import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, Chip, Stack,
  Button, LinearProgress, Divider, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, IconButton,
} from "@mui/material";
import AddIcon              from "@mui/icons-material/Add";
import BusinessIcon         from "@mui/icons-material/Business";
import WarningAmberIcon     from "@mui/icons-material/WarningAmber";
import ErrorIcon            from "@mui/icons-material/Error";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import PictureAsPdfIcon    from "@mui/icons-material/PictureAsPdf";
import HistoryIcon         from "@mui/icons-material/History";
import AssignmentIcon      from "@mui/icons-material/Assignment";
import PsychologyIcon      from "@mui/icons-material/Psychology";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useNavigate, useLocation }  from "react-router-dom";
import { db }     from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { LABEL_TIPO, VENCIMENTOS_POR_TIPO } from "../data/checklistsRT";

const COR = "#1b4332";
const ACENTO = "#52b788";

// Calcula alertas de vencimento de uma clínica
function calcularAlertas(clinica) {
  const alertas = [];
  const vencimentos = VENCIMENTOS_POR_TIPO[clinica.tipo] ?? [];
  const hoje = new Date();

  vencimentos.forEach(({ campo, label, diasAlerta }) => {
    if (!clinica[campo]) return;
    const data = new Date(clinica[campo]);
    const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
    if (diff < 0)
      alertas.push({ label, tipo: "error", msg: "Vencido" });
    else if (diff <= diasAlerta)
      alertas.push({ label, tipo: "warning", msg: `${diff}d` });
  });

  return alertas;
}

// Card de cada clínica
function CardClinica({ clinica, auditorias, navigate }) {
  const alertas     = calcularAlertas(clinica);
  const ultimaAudit = auditorias[clinica.id];
  const score       = ultimaAudit?.score ?? null;

  const corScore = score === null ? "#aaa"
    : score >= 80 ? "#0F6E56"
    : score >= 60 ? "#854F0B"
    : "#A32D2D";

  const status = score === null ? "Sem auditoria"
    : score >= 80 ? "Conforme"
    : score >= 60 ? "Regular"
    : "Crítico";

  const chipSx = score === null
    ? { bgcolor: "#f0f0f0", color: "#888" }
    : score >= 80
      ? { bgcolor: "#E1F5EE", color: "#0F6E56" }
      : score >= 60
        ? { bgcolor: "#FAEEDA", color: "#854F0B" }
        : { bgcolor: "#FCEBEB", color: "#A32D2D" };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2, borderRadius: "16px", cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(27,67,50,0.1)", borderColor: ACENTO },
      }}
      onClick={() => navigate(`/clinicas/${clinica.id}`)}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: COR }}>
            {clinica.nomeFantasia || clinica.razaoSocial}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#888" }}>
            {clinica.cidade} · {LABEL_TIPO[clinica.tipo]}
          </Typography>
        </Box>
        <Chip label={status} size="small" sx={{ ...chipSx, fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
      </Stack>

      {/* Barra de score */}
      <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
        <LinearProgress
          variant={score !== null ? "determinate" : "indeterminate"}
          value={score ?? 0}
          sx={{
            flex: 1, height: 5, borderRadius: 3,
            bgcolor: "#f0f0f0",
            "& .MuiLinearProgress-bar": { bgcolor: corScore, borderRadius: 3 },
          }}
        />
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: corScore, minWidth: 32 }}>
          {score !== null ? `${score}%` : "—"}
        </Typography>
      </Stack>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Stack spacing={0.4} mb={1}>
          {alertas.slice(0, 2).map((a, i) => (
            <Stack key={i} direction="row" spacing={0.5} alignItems="center">
              {a.tipo === "error"
                ? <ErrorIcon sx={{ fontSize: 12, color: "#A32D2D" }} />
                : <WarningAmberIcon sx={{ fontSize: 12, color: "#854F0B" }} />
              }
              <Typography sx={{ fontSize: "0.72rem", color: a.tipo === "error" ? "#A32D2D" : "#854F0B" }}>
                {a.label} — {a.msg}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Última auditoria e Atalho IA */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: "0.7rem", color: "#aaa" }}>
          {ultimaAudit
            ? `Última auditoria: ${ultimaAudit.data}`
            : "Nenhuma auditoria realizada"}
        </Typography>
        
        <Tooltip title="Intérprete BVO (IA)">
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clinicas/${clinica.id}`, { state: { openBVO: true } });
            }}
            sx={{ 
              bgcolor: COR + "08", 
              color: COR, 
              "&:hover": { bgcolor: COR, color: "#fff" } 
            }}
          >
            <PsychologyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

export default function CentralRT() {
  const navigate   = useNavigate();
  const userData = useUserData();
  const [clinicas,   setClinicas]   = useState([]);
  const [auditorias, setAuditorias] = useState({}); // { clinicaId: { score, data } }
  const [historico,  setHistorico]  = useState([]); // Lista de todas as auditorias
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!userData?.uid) return;
    (async () => {
      try {
        setLoading(true);
        // Busca todas as clínicas do RT
        const snapC = await getDocs(
          query(collection(db, "clinicas"), where("userId", "==", userData.uid))
        );
        const listaClinicas = snapC.docs.map(d => ({ id: d.id, ...d.data() }));
        setClinicas(listaClinicas);

        // Busca TODAS as auditorias do RT para o histórico global
        const snapA = await getDocs(
          query(
            collection(db, "auditorias"),
            where("userId", "==", userData.uid),
            orderBy("criadoEm", "desc")
          )
        );
        const listaAuditorias = snapA.docs.map(d => ({ id: d.id, ...d.data() }));
        setHistorico(listaAuditorias);

        // Mapeia a última auditoria de cada clínica para os cards
        const mapaUltimas = {};
        listaClinicas.forEach(c => {
          const auditsDaClinica = listaAuditorias.filter(a => a.clinicaId === c.id);
          if (auditsDaClinica.length > 0) {
            const ult = auditsDaClinica[0];
            mapaUltimas[c.id] = {
              score: ult.score,
              data: ult.criadoEm?.toDate()?.toLocaleDateString("pt-BR") ?? "—",
            };
          }
        });
        setAuditorias(mapaUltimas);
      } catch (err) {
        console.error("Erro na Central RT:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [userData?.uid]);

  // KPIs consolidados
  const totalAlertas = clinicas.reduce((acc, c) => acc + calcularAlertas(c).length, 0);
  const alertasErro  = clinicas.reduce((acc, c) =>
    acc + calcularAlertas(c).filter(a => a.tipo === "error").length, 0);
  const scores = clinicas.map(c => auditorias[c.id]?.score).filter(s => s != null);
  const mediaScore = scores.length ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : null;
  const totalHoras = clinicas.reduce((acc, c) => acc + (Number(c.cargaHorariaSemanal) || 0), 0);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
      <CircularProgress sx={{ color: ACENTO }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 10 }}>
      {/* Aviso de Carga Horária */}
      {totalHoras > 40 && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: "12px", fontWeight: 700 }}>
          ⚠ Atenção: Total de carga horária semanal ({totalHoras}h) excede o limite recomendado de 40h/semana.
        </Alert>
      )}

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: COR }}>
            Central de Conformidade RT
          </Typography>
          <Typography sx={{ color: "#888", fontSize: "0.88rem" }}>
            Visão geral de {clinicas.length} estabelecimento(s) vinculado(s)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/clinicas/nova")}
          sx={{ bgcolor: COR, borderRadius: "12px", textTransform: "none",
                fontWeight: 700, "&:hover": { bgcolor: "#2d6a4f" } }}
        >
          Adicionar estabelecimento
        </Button>
      </Stack>

      {/* KPIs */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: "Estabelecimentos", valor: clinicas.length, sub: "vinculados ao seu CRMV",
            badge: null },
          { label: "Score médio", valor: mediaScore !== null ? `${mediaScore}%` : "—",
            sub: "conformidade geral",
            badge: mediaScore === null ? null
              : mediaScore >= 80 ? { txt: "Conforme", cor: "success" }
              : mediaScore >= 60 ? { txt: "Regular", cor: "warning" }
              : { txt: "Crítico", cor: "error" } },
          { label: "Alertas", valor: totalAlertas, sub: "vencimentos próximos",
            badge: alertasErro > 0 ? { txt: `${alertasErro} vencido(s)`, cor: "error" } : null },
          { label: "Carga Horária", valor: `${totalHoras}h`,
            sub: "total semanal acumulada", 
            badge: totalHoras > 40 ? { txt: "Excedida", cor: "error" } : null },
        ].map((k, i) => (
          <Grid item xs={6} md={3} key={i}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: "14px" }}>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#888",
                              textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}>
                {k.label}
              </Typography>
              <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: COR, lineHeight: 1 }}>
                {k.valor}
              </Typography>
              <Typography sx={{ fontSize: "0.7rem", color: "#aaa", mt: 0.3 }}>{k.sub}</Typography>
              {k.badge && (
                <Chip label={k.badge.txt} size="small" color={k.badge.cor}
                  sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, mt: 0.5 }} />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Grid de clínicas */}
      {clinicas.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, borderRadius: "16px", textAlign: "center",
                                        borderStyle: "dashed" }}>
          <BusinessIcon sx={{ fontSize: 48, color: "#e0e0e0", mb: 2 }} />
          <Typography sx={{ fontWeight: 700, color: "#aaa", mb: 1 }}>
            Nenhum estabelecimento cadastrado
          </Typography>
          <Typography sx={{ fontSize: "0.85rem", color: "#bbb", mb: 3 }}>
            Adicione as clínicas, açougues e laboratórios pelos quais você é RT
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}
            onClick={() => navigate("/clinicas/nova")}
            sx={{ bgcolor: COR, borderRadius: "12px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: "#2d6a4f" } }}>
            Adicionar primeiro estabelecimento
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {clinicas.map(c => (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <CardClinica
                clinica={c}
                auditorias={auditorias}
                navigate={navigate}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Seção: Histórico de Auditorias (Fundida aqui) */}
      <Box sx={{ mt: 6 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <HistoryIcon sx={{ color: COR }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: COR }}>
            Histórico Consolidado de Inspeções
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ borderRadius: "16px", overflow: "hidden" }}>
          {historico.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                Nenhuma auditoria realizada até o momento.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f9fdfa" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: COR, fontSize: "0.75rem" }}>ESTABELECIMENTO</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: COR, fontSize: "0.75rem" }}>IDENTIFICAÇÃO</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: COR, fontSize: "0.75rem" }}>DATA</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: COR, fontSize: "0.75rem" }}>SCORE</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: COR, fontSize: "0.75rem" }} align="right">AÇÕES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historico.map((aud) => {
                    const clin = clinicas.find(c => c.id === aud.clinicaId);
                    const corScore = aud.score >= 90 ? "#1b4332" : aud.score >= 70 ? "#e65100" : "#d32f2f";
                    return (
                      <TableRow key={aud.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                            {clin?.nomeFantasia || "Estabelecimento removido"}
                          </Typography>
                          <Typography sx={{ fontSize: "0.65rem", color: "#aaa" }}>
                            {aud.smartId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.82rem" }}>
                          {aud.nomeProntuario || "—"}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", color: "#888" }}>
                          {aud.criadoEm?.toDate?.()?.toLocaleDateString("pt-BR") ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${aud.score}%`} 
                            size="small"
                            sx={{ 
                              bgcolor: corScore + "15", 
                              color: corScore, 
                              fontWeight: 900, 
                              fontSize: "0.75rem",
                              height: 22
                            }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Ver Detalhes">
                              <IconButton size="small" sx={{ color: COR }}>
                                <AssignmentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Baixar PDF">
                              <IconButton size="small" sx={{ color: "#546e7a" }}>
                                <PictureAsPdfIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
