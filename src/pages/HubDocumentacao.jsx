// src/pages/HubDocumentacao.jsx
// Rota: /documentacao
// 4 abas: Documentos | Planilhas | Laudos | Relatórios CRMV

import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import FolderIcon          from "@mui/icons-material/Folder";
import TableViewIcon       from "@mui/icons-material/TableView";
import FactCheckIcon       from "@mui/icons-material/FactCheck";
import AccountBalanceIcon  from "@mui/icons-material/AccountBalance";
import Documentos          from "./Documentos";
import Planilhas           from "./Planilhas";
import Laudos              from "./Laudos";
import RelatoriosCRMV      from "./RelatoriosCRMV";

const ABAS = [
  { label: "Documentos",      icon: <FolderIcon fontSize="small" /> },
  { label: "Planilhas",       icon: <TableViewIcon fontSize="small" /> },
  { label: "Laudos Técnicos", icon: <FactCheckIcon fontSize="small" /> },
  { label: "Relatórios CRMV", icon: <AccountBalanceIcon fontSize="small" /> },
];

export default function HubDocumentacao() {
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
        {aba === 0 && <Documentos />}
        {aba === 1 && <Planilhas />}
        {aba === 2 && <Laudos />}
        {aba === 3 && <RelatoriosCRMV />}
      </Box>
    </Box>
  );
}
