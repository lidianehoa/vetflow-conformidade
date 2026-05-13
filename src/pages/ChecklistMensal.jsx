import React, { useState, useMemo, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, InputAdornment,
  CircularProgress, Grid, Stack, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { 
  CHECKLISTS, 
  CHECKLISTS_POR_TIPO, 
  FREQUENCIAS, 
  COR_FREQUENCIA, 
  COR_CRITICIDADE,
  AREAS,
  TIPO_PARA_AREA
} from "../data/checklistsRT";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

export default function ChecklistMensal() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const [busca, setBusca] = useState("");
  const [tab, setTab] = useState(0); 
  const [areaRT, setAreaRT] = useState(null);

  if (!pode("checklist")) {
    return <BloqueioRecurso recurso="Checklist Mensal" planoMinimo={planoMinimo("checklist")} />;
  }

  const [clinicaSelecionada, setClinicaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os detalhes da clínica ativa
  useEffect(() => {
    if (!userData?.selectedClinicaId || typeof userData.selectedClinicaId !== 'string') {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, "clinicas", userData.selectedClinicaId))
      .then(snap => {
        if (snap.exists()) setClinicaSelecionada({ id: snap.id, ...snap.data() });
      })
      .finally(() => setLoading(false));
  }, [userData?.selectedClinicaId]);

  const checklistsDisponiveis = useMemo(() => {
    if (!clinicaSelecionada) return [];
    const ids = CHECKLISTS_POR_TIPO[clinicaSelecionada.tipo] || [];
    return ids.map(id => CHECKLISTS[id]).filter(Boolean);
  }, [clinicaSelecionada]);

  const frequenciasExistentes = useMemo(() => {
    const freqs = new Set(checklistsDisponiveis.map(c => c.frequencia));
    return ["Todos", ...Array.from(freqs)];
  }, [checklistsDisponiveis]);

  const checklistsFiltrados = useMemo(() => {
    let lista = checklistsDisponiveis;
    const freqTab = frequenciasExistentes[tab];
    if (tab > 0 && freqTab) {
      lista = lista.filter(c => c.frequencia === freqTab);
    }
    return lista;
  }, [tab, checklistsDisponiveis, frequenciasExistentes]);

  if (loading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
      <Box mb={4} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1b4332" gutterBottom>
            Explorador de Checklists RT
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clinicaSelecionada 
              ? `Exibindo checklists para ${clinicaSelecionada.nomeFantasia || clinicaSelecionada.razaoSocial}`
              : "Selecione uma unidade na barra lateral para ver os checklists."}
          </Typography>
        </Box>
        {clinicaSelecionada && (
           <Chip 
            label={`${checklistsDisponiveis.length} Checklists`}
            sx={{ bgcolor: "#1b4332", color: "#fff", fontWeight: 700 }}
          />
        )}
      </Box>

      {!clinicaSelecionada && !loading && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Selecione um estabelecimento na barra lateral para carregar os checklists regulatórios.
        </Alert>
      )}

      {/* Busca */}
      <TextField
        id="checklist-busca"
        placeholder="Buscar por descrição, ID ou referência legal..."
        fullWidth
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#90a4ae" }} /></InputAdornment>,
          sx: { borderRadius: 3 },
        }}
      />

      {/* Tabs por Frequência */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, "& .MuiTab-root": { fontWeight: 600, textTransform: "none", minWidth: 80 }, "& .Mui-selected": { color: "#1b4332 !important" } }}
        TabIndicatorProps={{ style: { background: "#1b4332" } }}
      >
        {frequenciasExistentes.map((f) => (
          <Tab key={f} label={f === "Todos" ? "Todos" : FREQUENCIAS[f]} />
        ))}
      </Tabs>

      {/* Checklists em Accordions */}
      {checklistsFiltrados.map((ck) => (
        <Accordion key={ck.id} sx={{ mb: 2, borderRadius: "12px !important", overflow: "hidden", border: "1.5px solid #e8f5e9", "&:before": { display: "none" } }} elevation={0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", pr: 2 }}>
              <Chip 
                label={FREQUENCIAS[ck.frequencia]} 
                size="small" 
                sx={{ bgcolor: COR_FREQUENCIA[ck.frequencia], color: "#fff", fontWeight: 700, fontSize: 10 }} 
              />
              <Typography fontWeight={700} color="#1b4332">{ck.nome}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {ck.itens.length} itens · {ck.legislacao}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f9fbf9" }}>
                    <TableCell sx={{ fontWeight: 700, width: 80 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Verificação</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 100 }}>Criticidade</TableCell>
                    <TableCell sx={{ fontWeight: 700, width: 60 }}>Peso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ck.itens
                    .filter(i => !busca || i.desc.toLowerCase().includes(busca.toLowerCase()) || i.id.toLowerCase().includes(busca.toLowerCase()))
                    .map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell><Typography variant="caption" fontWeight={700}>{item.id}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ display: "block", fontWeight: 600 }}>{item.desc}</Typography>
                        <Typography variant="caption" color="text.secondary" fontSize={9}>{item.criterio}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.class} 
                          size="small" 
                          sx={{ 
                            bgcolor: COR_CRITICIDADE[item.class] + "15", 
                            color: COR_CRITICIDADE[item.class], 
                            fontWeight: 700, fontSize: 9, height: 18 
                          }} 
                        />
                      </TableCell>
                      <TableCell><Typography variant="caption" fontWeight={700}>{item.peso}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
