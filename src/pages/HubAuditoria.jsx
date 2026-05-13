// src/pages/HubAuditoria.jsx
// Rota: /auditorias
// 4 abas: Nova Auditoria | Checklists | Histórico | Conquistas

import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import HistoryIcon from "@mui/icons-material/History";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NovaAuditoria from "./NovaAuditoria";
import ChecklistMensal from "./ChecklistMensal";
import Auditorias from "./Auditorias";
import Conquistas from "./Conquistas";

const ABAS = [
  { label: "Nova Auditoria", icon: <AddCircleOutlineIcon fontSize="small" /> },
  { label: "Checklists",     icon: <ChecklistIcon fontSize="small" /> },
  { label: "Histórico",      icon: <HistoryIcon fontSize="small" /> },
  { label: "Conquistas",     icon: <EmojiEventsIcon fontSize="small" /> },
];

export default function HubAuditoria() {
  const [aba, setAba] = useState(0);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider",
        position: "sticky", top: 64, bgcolor: "#f0fdf4", zIndex: 10 }}>
        <Tabs value={aba} onChange={(_, v) => setAba(v)}
          sx={{ px: 3, "& .MuiTab-root": { fontWeight: 700, fontSize: 13, textTransform: "none", minHeight: 48 },
            "& .Mui-selected": { color: "#1b4332" },
            "& .MuiTabs-indicator": { bgcolor: "#1b4332" } }}>
          {ABAS.map((a, i) => (
            <Tab key={i} label={a.label} icon={a.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ p: 0 }}>
        {aba === 0 && <NovaAuditoria />}
        {aba === 1 && <ChecklistMensal />}
        {aba === 2 && <Auditorias />}
        {aba === 3 && <Conquistas />}
      </Box>
    </Box>
  );
}
