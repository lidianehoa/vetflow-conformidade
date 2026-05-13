import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

export default function BloqueioRecurso({ planoMinimo = "VERTOS CORE", recurso = "este recurso" }) {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          border: "1.5px solid #e0e0e0",
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          textAlign: "center",
          maxWidth: 460,
          background: "linear-gradient(135deg, #f0fdf4 0%, #fff 100%)",
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(27,67,50,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
          }}
        >
          <LockIcon sx={{ color: "#1b4332", fontSize: 36 }} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#1b4332" gutterBottom>
          Recurso Bloqueado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>{recurso}</strong> está disponível a partir do plano
        </Typography>
        <Box
          sx={{
            display: "inline-block",
            background: "#1b4332",
            color: "#fff",
            px: 2,
            py: 0.5,
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 14,
            mb: 3,
          }}
        >
          {planoMinimo}
        </Box>
        <br />
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/pagamento")}
          sx={{
            background: "#1b4332",
            color: "#fff",
            borderRadius: 3,
            px: 4,
            "&:hover": { background: "#2d6a4f" },
          }}
        >
          Ver Planos
        </Button>
      </Paper>
    </Box>
  );
}

// Versão inline (chip pequeno dentro de tabela/lista)
export function BloqueioInline({ planoMinimo = "VERTOS CORE" }) {
  const navigate = useNavigate();
  return (
    <Button
      size="small"
      startIcon={<LockIcon />}
      onClick={() => navigate("/pagamento")}
      sx={{
        color: "#1b4332",
        border: "1px solid #1b4332",
        borderRadius: 2,
        fontSize: 11,
        px: 1.5,
        py: 0.3,
        textTransform: "none",
        "&:hover": { background: "rgba(27,67,50,0.06)" },
      }}
    >
      {planoMinimo}
    </Button>
  );
}
