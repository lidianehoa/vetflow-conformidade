import React from "react";
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";

const RELATORIOS = [
  {
    id: "atividades",
    titulo: "Relatório de Atividades RT",
    desc: "Resumo periódico (ex: semestral) das auditorias realizadas, frequência de visitas e panorama de conformidade do estabelecimento. Exigido por diversos CRMVs regionais.",
    icon: <DescriptionIcon sx={{ fontSize: 40, color: "#1b4332" }} />,
    bg: "#e8f5e9",
    tag: "Periódico / Frequente",
  },
  {
    id: "constatacao",
    titulo: "Termo de Constatação e Notificação",
    desc: "Documento oficial para notificar o proprietário sobre não conformidades críticas ou graves identificadas na auditoria. Resguarda o RT juridicamente.",
    icon: <ReportProblemIcon sx={{ fontSize: 40, color: "#d32f2f" }} />,
    bg: "#ffebee",
    tag: "Uso Específico / Alerta",
  },
  {
    id: "plano_trabalho",
    titulo: "Plano de Trabalho do RT",
    desc: "Cronograma e planejamento estratégico das ações do RT. Geralmente enviado ao Setor de ART do CRMV no momento de homologação ou renovação do contrato.",
    icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: "#e65100" }} />,
    bg: "#fff3e0",
    tag: "Homologação de ART",
  },
  {
    id: "livro_visitas",
    titulo: "Livro de Visitas Técnicas",
    desc: "Geração de folhas de rosto e compilação das auditorias em formato de 'diário' para composição do Livro Físico a ser exigido durante inspeção dos fiscais.",
    icon: <MenuBookIcon sx={{ fontSize: 40, color: "#0d47a1" }} />,
    bg: "#e3f2fd",
    tag: "Arquivamento Local",
  },
];

export default function RelatoriosCRMV() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const navigate = useNavigate();

  // Permite acesso se tiver plano de documentos (Clinica Pro ou RT Solo)
  if (!pode("gerarDocumento")) {
    return <BloqueioRecurso recurso="Relatórios CRMV" planoMinimo={planoMinimo("gerarDocumento")} />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <AccountBalanceIcon sx={{ color: "#1b4332", fontSize: 32 }} />
        <Typography variant="h5" fontWeight={800} color="#1b4332">
          Relatórios Oficiais CRMV
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Compilação automática dos dados de auditoria em documentos formais para proteção jurídica e comunicação com o conselho regional.
      </Typography>

      <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 4 }}>
        <Grid container spacing={3}>
          {RELATORIOS.map((rel) => (
            <Grid item xs={12} sm={6} key={rel.id}>
              <Card
                elevation={0}
                sx={{
                  border: "1.5px solid #e8f5e9",
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#c8e6c9", boxShadow: "0 4px 12px rgba(27,67,50,0.05)" },
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 3, background: rel.bg }}>
                      {rel.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={0.5} lineHeight={1.2}>
                        {rel.titulo}
                      </Typography>
                      <Chip label={rel.tag} size="small"
                        sx={{ background: "#f5f5f5", color: "#546e7a", fontWeight: 700, fontSize: 10, height: 18 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" mb={3} sx={{ flex: 1 }}>
                    {rel.desc}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<OpenInNewIcon />}
                    onClick={() => navigate(`/relatorios-crmv/gerar/${rel.id}`)}
                    sx={{ background: "#1b4332", color: "#fff", borderRadius: 2, fontWeight: 700 }}
                  >
                    Gerar Documento
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
