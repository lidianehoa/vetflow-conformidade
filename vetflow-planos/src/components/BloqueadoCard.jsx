// src/components/BloqueadoCard.jsx
// ================================================================
// Exibido quando o usuário tenta acessar funcionalidade bloqueada.
//
// COMO USAR:
//   import BloqueadoCard from "../components/BloqueadoCard";
//   const { temAcesso } = usePlano();
//   if (!temAcesso("tcle"))       return <BloqueadoCard funcionalidade="tcle" />;
//   if (!temAcesso("documentos")) return <BloqueadoCard funcionalidade="documentos" />;
// ================================================================
import React from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { PLANOS } from "../config/planos";

const COR = "#1b4332";

const INFO = {
  tcle: {
    emoji: "📄",
    titulo: "Gerador de TCLE Blindado",
    descricao: "Crie Termos de Consentimento Livre e Esclarecido com embasamento legal automático, prontos para fiscalização.",
    planoMinimo: "rtSolo",
  },
  documentos: {
    emoji: "📁",
    titulo: "Fábrica de Documentos",
    descricao: "Gere POPs, manuais e documentos formatados prontos para o CRMV.",
    planoMinimo: "rtSolo",
  },
  manualBoasPraticas: {
    emoji: "📋",
    titulo: "Manual de Boas Práticas",
    descricao: "Acesse o manual completo conforme Resolução CFMV 1653/2025 e 1275/2019.",
    planoMinimo: "rtSolo",
  },
  plano5W2H: {
    emoji: "🗺️",
    titulo: "Plano de Voo 5W2H",
    descricao: "Gere seu plano de ação mensal com priorização automática de riscos.",
    planoMinimo: "rtSolo",
  },
  dashboardRisco: {
    emoji: "📊",
    titulo: "Dashboard de Risco em Tempo Real",
    descricao: "Veja o nível de conformidade da clínica atualizado a cada auditoria.",
    planoMinimo: "rtSolo",
  },
  relatorioPDF: {
    emoji: "📤",
    titulo: "Relatório PDF para o CRMV",
    descricao: "Exporte relatórios de auditoria formatados para entrega ao CRMV.",
    planoMinimo: "clinicaPro",
  },
  multiUsuarios: {
    emoji: "👥",
    titulo: "Múltiplos Usuários",
    descricao: "Adicione toda a equipe com diferentes perfis de acesso.",
    planoMinimo: "clinicaPro",
  },
};

export default function BloqueadoCard({ funcionalidade }) {
  const navigate = useNavigate();
  const info = INFO[funcionalidade] || {
    emoji: "🔒",
    titulo: "Funcionalidade Premium",
    descricao: "Esta funcionalidade requer upgrade de plano.",
    planoMinimo: "rtSolo",
  };
  const planoMinimo = PLANOS[info.planoMinimo];

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, p: 3 }}>
      <Box
        sx={{
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          bgcolor: "#f0fdf4",
          border: "1.5px solid rgba(82,183,136,0.35)",
          borderRadius: "24px",
          p: 4,
        }}
      >
        {/* Ícone cadeado */}
        <Box sx={{
          width: 60, height: 60, bgcolor: COR, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          mx: "auto", mb: 2,
        }}>
          <LockOutlinedIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>

        <Typography sx={{ fontSize: "2rem", mb: 1 }}>{info.emoji}</Typography>

        <Typography sx={{ fontWeight: 800, color: COR, fontSize: "1.1rem", mb: 1 }}>
          {info.titulo}
        </Typography>

        <Typography sx={{ color: "#555", fontSize: "0.85rem", lineHeight: 1.65, mb: 3 }}>
          {info.descricao}
        </Typography>

        <Chip
          label={`Disponível no ${planoMinimo.nome} — ${planoMinimo.precoLabel}/mês`}
          sx={{
            bgcolor: COR, color: "#d8f3dc",
            fontWeight: 700, fontSize: "0.75rem",
            mb: 3, height: 26,
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate("/pagamento")}
          sx={{
            bgcolor: COR, borderRadius: "14px", py: 1.5,
            fontWeight: 900, fontSize: "0.95rem", textTransform: "none",
            boxShadow: "0 6px 18px rgba(27,67,50,0.2)",
            "&:hover": { bgcolor: "#2d6a4f", transform: "translateY(-1px)" },
            transition: "all 0.2s",
          }}
        >
          Ver planos e fazer upgrade →
        </Button>

        <Typography sx={{ fontSize: "0.7rem", color: "#aaa", mt: 2 }}>
          Liberação instantânea após pagamento via PagSeguro
        </Typography>
      </Box>
    </Box>
  );
}
