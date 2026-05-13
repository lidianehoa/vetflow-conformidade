// ============================================================
// BloqueioRecurso.jsx
//
// Dois componentes:
//   BloqueioRecurso  → tela inteira de bloqueio com CTA
//   BloqueioInline   → card compacto dentro de uma tela
//
// USO PADRÃO em cada tela protegida:
//
//   import { useUserData } from "../components/ProtectedRoute";
//   import { usePlano }    from "../hooks/usePlano";
//   import { BloqueioRecurso } from "../components/BloqueioRecurso";
//
//   export default function ChecklistMensal() {
//     const userData = useUserData();
//     const { pode, planoMinimo } = usePlano(userData);
//
//     if (!pode("checklist")) {
//       return <BloqueioRecurso recurso="checklist" planoMinimo={planoMinimo("checklist")} />;
//     }
//
//     return <SeuConteudoReal />;
//   }
// ============================================================

import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

const COR = "#1b4332";
const ACENTO = "#52b788";
const FUNDO = "#f0fdf4";

// Textos específicos para cada recurso bloqueado
const INFO = {
  dashboard: {
    icone: "📊",
    titulo: "VET.FLOW Cockpit",
    desc: "O painel com Escudo de Blindagem, Radar de Vencimentos e Plano de Voo Mensal está disponível no Clínica Pro.",
  },
  auditorias: {
    icone: "🔍",
    titulo: "Portal de Compliance",
    desc: "Acesse o histórico de inspeções, evolução da blindagem e exportação de relatórios em PDF.",
  },
  novaAuditoria: {
    icone: "📋",
    titulo: "Inspeção 360°",
    desc: "Realize auditorias completas com 85 itens baseados na Res. 1275, 1653/2025 e SIPEAGRO/MAPA.",
  },
  checklist: {
    icone: "✅",
    titulo: "Checklist Mensal",
    desc: "Acompanhe o cronograma semanal de conformidade RT com todos os setores e evidências.",
  },
  termos: {
    icone: "📄",
    titulo: "Gerador de TCLE",
    desc: "Emita Termos de Consentimento blindados juridicamente — Cirurgia, Anestesia, Internação e Eutanásia.",
  },
  gerarDocumento: {
    icone: "🏭",
    titulo: "Fábrica de Documentos",
    desc: "Gere e personalize documentos completos além dos POPs básicos — MBP, PGRSS, laudos e muito mais.",
  },
  manualBoasPraticas: {
    icone: "📚",
    titulo: "Manual de Boas Práticas",
    desc: "Acesse o manual completo com referências às resoluções CFMV, RDC ANVISA e SIPEAGRO/MAPA.",
  },
  simplesVet: {
    icone: "🔗",
    titulo: "Integração SimplesVet",
    desc: "Sincronize dados da clínica com o SimplesVet e exporte relatórios de auditoria diretamente.",
  },
};

// ─── Tela inteira de bloqueio ────────────────────────────────
export function BloqueioRecurso({ recurso, planoMinimo = "RT Solo" }) {
  const navigate = useNavigate();
  const info = INFO[recurso] ?? {
    icone: "🔒",
    titulo: "Recurso Premium",
    desc: "Este recurso está disponível em planos pagos.",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        p: { xs: 3, md: 6 },
        textAlign: "center",
      }}
    >
      {/* Ícone */}
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          bgcolor: FUNDO,
          border: `2px solid ${ACENTO}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          mb: 3,
        }}
      >
        {info.icone}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 900, color: COR, mb: 1 }}>
        {info.titulo}
      </Typography>

      <Typography
        sx={{ color: "#666", fontSize: "0.95rem", maxWidth: 420, lineHeight: 1.7, mb: 1.5 }}
      >
        {info.desc}
      </Typography>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          bgcolor: FUNDO,
          border: `1px solid ${ACENTO}`,
          borderRadius: "20px",
          px: 2,
          py: 0.6,
          mb: 4,
        }}
      >
        <LockIcon sx={{ color: ACENTO, fontSize: 14 }} />
        <Typography sx={{ color: COR, fontWeight: 700, fontSize: "0.82rem" }}>
          Disponível a partir do plano {planoMinimo}
        </Typography>
      </Box>

      <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }}>
        <Button
          variant="contained"
          onClick={() => navigate("/pagamento")}
          sx={{
            bgcolor: COR,
            borderRadius: "14px",
            px: 4,
            py: 1.5,
            fontWeight: 900,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow: "0 6px 18px rgba(27,67,50,0.2)",
            "&:hover": { bgcolor: "#2d6a4f", transform: "translateY(-1px)" },
            transition: "all 0.2s",
          }}
        >
          Ver planos e fazer upgrade
        </Button>

        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            borderColor: "#ddd",
            color: "#999",
            borderRadius: "14px",
            px: 3,
            py: 1.5,
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { borderColor: COR, color: COR },
          }}
        >
          Voltar
        </Button>
      </Stack>
    </Box>
  );
}

// ─── Card inline de bloqueio ─────────────────────────────────
// Use quando quiser mostrar o cadeado dentro de uma seção
// sem ocupar a tela inteira. Ex: card no Dashboard.
export function BloqueioInline({ recurso, planoMinimo = "RT Solo" }) {
  const navigate = useNavigate();
  const info = INFO[recurso] ?? { icone: "🔒", titulo: "Recurso Premium" };

  return (
    <Box
      sx={{
        border: "1.5px dashed #a8d5be",
        borderRadius: "16px",
        p: 3,
        textAlign: "center",
        bgcolor: "#f9fef9",
      }}
    >
      <Typography sx={{ fontSize: "1.5rem", mb: 0.5 }}>{info.icone}</Typography>
      <Typography sx={{ fontWeight: 700, color: COR, fontSize: "0.92rem", mb: 0.5 }}>
        {info.titulo}
      </Typography>
      <Typography sx={{ color: "#888", fontSize: "0.78rem", mb: 2 }}>
        Plano {planoMinimo} ou superior
      </Typography>
      <Button
        variant="contained"
        size="small"
        onClick={() => navigate("/pagamento")}
        sx={{
          bgcolor: COR,
          borderRadius: "10px",
          fontWeight: 700,
          textTransform: "none",
          fontSize: "0.8rem",
          "&:hover": { bgcolor: "#2d6a4f" },
        }}
      >
        Fazer upgrade
      </Button>
    </Box>
  );
}
