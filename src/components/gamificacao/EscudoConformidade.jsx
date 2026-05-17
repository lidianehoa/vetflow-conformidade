import React from "react";
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Grid, 
  Stack, 
  Paper,
  Tooltip,
  Divider
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import WarningIcon from "@mui/icons-material/Warning";
import GavelIcon from "@mui/icons-material/Gavel";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { calcularEscudo } from "../../data/gamificacao";

export default function EscudoConformidade({ auditorias = [], userData = {}, compact = false }) {
  const { escudo_pct = 0, riscos = [], nivel = null } = calcularEscudo(auditorias, userData);

  // Fallback se não houver nível ou dados
  const displayNivel = nivel || {
    level: 1,
    nome: "RT Iniciante",
    emoji: "🥚",
    cor: "#9e9e9e",
    descricao: "Primeiros passos na conformidade.",
    alerta_legal: "Nível de proteção inicial. Risco regulatório residual elevado."
  };

  const displayEscudoPct = escudo_pct ?? 0;

  // Círculo SVG de progresso
  const radius = 45;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (displayEscudoPct / 100) * circumference;

  const getRiscoColor = (pct) => {
    if (pct > 40) return "#c62828"; // Vermelho
    if (pct >= 15) return "#e65100"; // Laranja
    return "#1a7f4b"; // Verde
  };

  if (compact) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          borderRadius: 4, 
          border: "1.5px solid #eee",
          display: "flex",
          alignItems: "center",
          gap: 2,
          bgcolor: "#fdfdfd"
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex", width: 60, height: 60 }}>
          <svg height="60" width="60" style={{ transform: "rotate(-90deg)" }}>
            <circle
              stroke="#eceff1"
              fill="transparent"
              strokeWidth={stroke - 2}
              r={normalizedRadius}
              cx="30"
              cy="30"
            />
            <circle
              stroke={displayNivel.cor || "#1a7f4b"}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx="30"
              cy="30"
            />
          </svg>
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" fontWeight="bold" color="text.primary">
              {displayEscudoPct}%
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {displayNivel.emoji} {displayNivel.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Escudo de Conformidade Ativo
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        border: "1.5px solid #e8f5e9",
        background: "linear-gradient(135deg, #ffffff 0%, #f9fdfa 100%)",
        boxShadow: "0 8px 32px rgba(27, 67, 50, 0.04)"
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Lado Esquerdo: Arco de Progresso Grande */}
        <Grid item xs={12} md={4} sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Box sx={{ position: "relative", display: "inline-flex", width: 140, height: 140, mb: 2 }}>
            <svg height="140" width="140" style={{ transform: "rotate(-90deg)" }}>
              <circle
                stroke="#f1f8f6"
                fill="transparent"
                strokeWidth={stroke}
                r={radius + 10}
                cx="70"
                cy="70"
              />
              <circle
                stroke="#1a7f4b"
                fill="transparent"
                strokeWidth={stroke + 2}
                strokeDasharray={(2 * Math.PI * (radius + 10)) + " " + (2 * Math.PI * (radius + 10))}
                style={{ 
                  strokeDashoffset: (2 * Math.PI * (radius + 10)) - (displayEscudoPct / 100) * (2 * Math.PI * (radius + 10)) 
                }}
                strokeLinecap="round"
                r={radius + 10}
                cx="70"
                cy="70"
              />
            </svg>
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon sx={{ color: "#1a7f4b", fontSize: 28, mb: -0.5 }} />
              <Typography variant="h4" fontWeight={900} color="#1b4332">
                {displayEscudoPct}%
              </Typography>
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: 9, tracking: 1, textTransform: "uppercase" }}>
                Proteção Ativa
              </Typography>
            </Box>
          </Box>
          <Typography variant="h6" fontWeight={900} color="#1b4332">
            {displayNivel.emoji} {displayNivel.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, mt: 0.5, fontSize: 13 }}>
            {displayNivel.descricao}
          </Typography>
        </Grid>

        {/* Lado Direito: Barras de Risco Por Órgão */}
        <Grid item xs={12} md={8}>
          <Typography variant="subtitle2" fontWeight={800} color="#1b4332" mb={2}>
            EXPOSIÇÃO REGULATÓRIA RESIDUAL POR ÓRGÃO
          </Typography>

          <Stack spacing={2.5}>
            {riscos.map((risco) => {
              const riscoColor = getRiscoColor(risco.risco_pct);
              return (
                <Box key={risco.orgao}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {risco.orgao === "MAPA" && <GavelIcon sx={{ color: "text.secondary", fontSize: 18 }} />}
                      {risco.orgao === "CRMV" && <ShieldIcon sx={{ color: "text.secondary", fontSize: 18 }} />}
                      {risco.orgao === "Vigilância" && <LocalHospitalIcon sx={{ color: "text.secondary", fontSize: 18 }} />}
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {risco.label}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" fontWeight={800} sx={{ px: 1, py: 0.2, borderRadius: 1, bgcolor: riscoColor + "15", color: riscoColor }}>
                        Risco {risco.nivel_texto} ({risco.risco_pct}%)
                      </Typography>
                    </Stack>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={risco.risco_pct} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: "#f0f0f0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: riscoColor,
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontSize: 11, fontStyle: "italic" }}>
                    {risco.nota}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Bloco de Proteção Prática */}
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#ffebee20", border: "1px solid #d32f2f15" }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <WarningIcon sx={{ color: "#d32f2f", mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="#c62828" mb={0.5}>
              O QUE ESTE NÍVEL DE PROTEÇÃO SIGNIFICA NA PRÁTICA:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
              {displayNivel.alerta_legal}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Rodapé explicativo */}
      <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 2, fontSize: 9 }}>
        ⚠️ Estimativas educativas baseadas em histórico de fiscalizações do MAPA/CRMV. Não constituem assessoria jurídica.
      </Typography>
    </Paper>
  );
}
