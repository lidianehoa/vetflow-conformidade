import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Grid, Paper, Button, Chip, List, ListItem,
  ListItemIcon, ListItemText, CircularProgress, Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

const PLANOS = [
  {
    id: "trial",
    nome: "TEST DRIVE",
    preco: "R$ 0,00",
    subpreco: "por 3 dias",
    cor: "#546e7a",
    destaque: false,
    recursos: [
      "Acesso completo ao VERTOS CORE",
      "Registro de 01 Empresa",
      "05 Auditorias inclusas",
      "Fábrica de Documentos",
      "Radar de Vencimentos",
      "Ideal para validação técnica",
    ],
    btn: "Iniciar Test Drive",
    interno: true,
  },
  {
    id: "core",
    nome: "VERTOS CORE",
    preco: "R$ 47,90",
    subpreco: "/ mês",
    cor: "#0d47a1",
    destaque: false,
    recursos: [
      "Registro de 01 Empresa/Clínica",
      "Até 05 auditorias técnicas por mês",
      "Acesso total ao MBP (Manual)",
      "Biblioteca com +50 POPs",
      "Repositório de TCLEs completo",
      "SIPEAGRO Digital (Registro Manual)",
      "Radar Sanitário (Alertas automáticos)",
      "Acesso à Central de Ajuda",
    ],
    btn: "Assinar CORE",
    link: "https://pay.hotmart.com/W105785102R?off=fykjr5au",
    interno: false,
  },
  {
    id: "pro",
    nome: "VERTOS PRO",
    preco: "R$ 87,90",
    subpreco: "/ mês",
    cor: "#1b4332",
    destaque: true,
    recursos: [
      "Empresas/Clínicas Ilimitadas",
      "Auditorias Técnicas ilimitadas",
      "Official CRMV Hub (Relatórios 1-clique)",
      "Motor de Preenchimento Automático",
      "SIPEAGRO 2.0 (Cálculo de Saldo)",
      "Alertas de Estoque Inteligentes",
      "Trilha de Auditoria Jurídica imutável",
      "Planilhas Operacionais Dinâmicas",
      "Cockpit de Governança (Radar Blindagem)",
      "Suporte VIP prioritário",
    ],
    btn: "Assinar VERTOS PRO",
    link: "https://pay.hotmart.com/W105785102R?off=x2rj5zam",
    interno: false,
  },
];

export default function Pagamento() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleTrial = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const functions = getFunctions();
      const ativarTrial = httpsCallable(functions, "ativarTrial");
      await ativarTrial();
      navigate("/dashboard");
    } catch (err) {
      console.error("Erro ao ativar trial:", err);
      setErro(err.message?.includes("Trial já utilizado") 
        ? "Você já utilizou seu período de test drive." 
        : "Erro ao ativar acesso. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #f0fdf4 0%, #e8f5e9 100%)",
        py: 6,
        px: 2,
      }}
    >
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight={900} color="#1b4332" gutterBottom>
          Escolha sua Infraestrutura de Compliance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Assine um plano ou inicie seu <strong>Test Drive de 3 dias</strong> agora mesmo.
        </Typography>
      </Box>

      {erro && <Alert severity="error" sx={{ maxWidth: 800, mx: "auto", mb: 3, borderRadius: 2 }}>{erro}</Alert>}

      <Grid container spacing={3} justifyContent="center" maxWidth={1300} mx="auto">
        {PLANOS.map((plano) => (
          <Grid item xs={12} sm={6} md={4} key={plano.id}>
            <Paper
              elevation={plano.destaque ? 12 : 0}
              sx={{
                borderRadius: 5,
                border: plano.destaque ? `2px solid ${plano.cor}` : "1.5px solid #e0e0e0",
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": { transform: "translateY(-8px)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
              }}
            >
              {plano.id === "trial" && (
                <Chip
                  icon={<FlashOnIcon sx={{ fontSize: 14 }} />}
                  label="DISPONÍVEL AGORA"
                  size="small"
                  sx={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "#546e7a", color: "#fff", fontWeight: 800, fontSize: 10, px: 1,
                  }}
                />
              )}
              {plano.destaque && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 14 }} />}
                  label="RECOMENDADO PARA CONSULTORES"
                  size="small"
                  sx={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: plano.cor, color: "#fff", fontWeight: 800, fontSize: 10, px: 1,
                  }}
                />
              )}

              <Box mb={3}>
                <Typography variant="overline" color={plano.cor} fontWeight={900} letterSpacing={2}>
                  {plano.nome}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mt: 1 }}>
                  <Typography variant="h4" fontWeight={900} color={plano.cor}>
                    {plano.preco}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {plano.subpreco}
                  </Typography>
                </Box>
              </Box>

              <List dense sx={{ flex: 1, mb: 3 }}>
                {plano.recursos.map((r, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0.6 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <CheckCircleIcon sx={{ fontSize: 16, color: plano.cor }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={r}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500, color: "#455a64" }}
                    />
                  </ListItem>
                ))}
              </List>

              {plano.interno ? (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleTrial}
                  disabled={loading}
                  sx={{
                    borderColor: plano.cor, color: plano.cor, borderRadius: 4, fontWeight: 800, py: 1.5,
                    "&:hover": { background: `${plano.cor}10` },
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : plano.btn}
                </Button>
              ) : (
                <Button
                  variant={plano.destaque ? "contained" : "outlined"}
                  fullWidth
                  href={plano.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    background: plano.destaque ? plano.cor : "transparent",
                    borderColor: plano.cor, color: plano.destaque ? "#fff" : plano.cor,
                    borderRadius: 4, fontWeight: 800, py: 1.5,
                    "&:hover": { opacity: 0.95 },
                  }}
                >
                  {plano.btn}
                </Button>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={6} sx={{ opacity: 0.7 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Pagamento processado com segurança via Hotmart.
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          O Test Drive libera acesso imediato para experimentação.
        </Typography>
      </Box>
    </Box>
  );
}
