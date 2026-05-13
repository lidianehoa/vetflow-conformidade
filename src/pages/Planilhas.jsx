import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Grid, List, ListItem, ListItemIcon, ListItemText, Paper, Chip, IconButton, Tooltip
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import PetsIcon from "@mui/icons-material/Pets";
import FactoryIcon from "@mui/icons-material/Factory";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import ScienceIcon from "@mui/icons-material/Science";

// Importa os dados unificados do JSON seed
import planilhasData from "../../scripts/seeds/planilhasSistema.json";
import { gerarPlanilhaExcel } from "../utils/excelGenerator";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";

const iconMap = {
  "paw": <PetsIcon fontSize="inherit" />,
  "factory": <FactoryIcon fontSize="inherit" />,
  "chef-hat": <RestaurantIcon fontSize="inherit" />,
  "shopping-cart": <ShoppingCartIcon fontSize="inherit" />,
  "tractor": <AgricultureIcon fontSize="inherit" />,
  "flask": <ScienceIcon fontSize="inherit" />
};

const colorMap = {
  "pequenos_animais": { color: "#0d47a1", bg: "#e3f2fd" },
  "producao_origem_animal": { color: "#1b4332", bg: "#e8f5e9" },
  "industria_alimentos": { color: "#b71c1c", bg: "#ffebee" },
  "comercio_agronegocio": { color: "#4a148c", bg: "#f3e5f5" },
  "producao_rural": { color: "#e65100", bg: "#fff3e0" },
  "areas_especiais": { color: "#004d40", bg: "#e0f2f1" }
};

export default function Planilhas() {
  const navigate = useNavigate();
  const userData = useUserData();
  const [unidade, setUnidade] = useState(null);
  const [expanded, setExpanded] = useState(planilhasData.areas[0].id);

  useEffect(() => {
    if (!userData?.uid || typeof userData.uid !== 'string') return;
    getDoc(doc(db, "unidades", userData.uid))
      .then((snap) => {
        if (snap.exists()) setUnidade(snap.data());
      })
      .catch(() => {});
  }, [userData?.uid]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleDownload = (planilha) => {
    // Chama o gerador passando o objeto da planilha, usuário e empresa
    gerarPlanilhaExcel(planilha, userData, unidade);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, margin: "0 auto" }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} color="#1b4332" gutterBottom>
          {planilhasData.sistema.nome}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {planilhasData.sistema.descricao}
        </Typography>
      </Box>

      {planilhasData.areas.map((area) => {
        const theme = colorMap[area.id] || { color: "#333", bg: "#eee" };
        const obrigatorias = area.planilhas.filter(p => p.tipo === "obrigatoria");
        const sugeridas = area.planilhas.filter(p => p.tipo === "sugerida");

        return (
          <Accordion
            key={area.id}
            expanded={expanded === area.id}
            onChange={handleChange(area.id)}
            sx={{
              mb: 2,
              borderRadius: "16px !important",
              "&:before": { display: "none" },
              boxShadow: expanded === area.id ? "0 8px 24px rgba(0,0,0,0.05)" : "0 2px 8px rgba(0,0,0,0.02)",
              border: "1px solid #e8f5e9",
              overflow: "hidden"
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ p: { xs: 2, md: 3 }, "& .MuiAccordionSummary-content": { m: 0 } }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ width: 48, height: 48, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, bgcolor: theme.bg, color: theme.color }}>
                  {iconMap[area.icone] || <PetsIcon fontSize="inherit" />}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color={theme.color}>{area.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{area.descricao}</Typography>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ p: { xs: 2, md: 3 }, pt: 0, bgcolor: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
              <Grid container spacing={3} mt={1}>
                {/* Obrigatórias */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: "1px solid #ffcdd2", height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Chip label="OBRIGATÓRIAS" size="small" sx={{ bgcolor: "#ffebee", color: "#b71c1c", fontWeight: 700, fontSize: 11 }} />
                      <Typography variant="caption" fontWeight={700} color="#546e7a">EXIGIDAS POR LEI/ÓRGÃO</Typography>
                    </Box>
                    <List disablePadding>
                      {obrigatorias.map((planilha, idx) => (
                        <ListItem key={planilha.id} disableGutters sx={{ alignItems: "flex-start", borderBottom: idx < obrigatorias.length - 1 ? "1px solid #ffebee" : "none", py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            <CheckCircleOutlineIcon sx={{ color: "#c62828", fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={planilha.nome}
                            secondary={
                              <React.Fragment>
                                <Typography component="span" variant="caption" color="text.secondary" display="block">
                                  {planilha.descricao}
                                </Typography>
                                {planilha.legislacao && (
                                  <Typography component="span" variant="caption" color="#1b4332" fontWeight={600} display="block" mt={0.5}>
                                    📄 {planilha.legislacao}
                                  </Typography>
                                )}
                              </React.Fragment>
                            }
                            primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "#37474f" }}
                          />
                          <Box display="flex" gap={1} ml={2}>
                            <Tooltip title="Preencher no App">
                              <IconButton onClick={() => navigate(`/planilhas/editar/${planilha.id}`)} size="small" sx={{ color: "#1b4332", bgcolor: "#e8f5e9", "&:hover": { bgcolor: "#c8e6c9" } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Baixar Planilha Modelo (Excel)">
                              <IconButton onClick={() => handleDownload(planilha)} size="small" sx={{ color: "#b0bec5", "&:hover": { color: "#c62828", bgcolor: "#ffebee" } }}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Sugeridas */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, border: "1px solid #c8e6c9", height: "100%" }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Chip label="SUGERIDAS" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: 11 }} />
                      <Typography variant="caption" fontWeight={700} color="#546e7a">BOAS PRÁTICAS DO RT</Typography>
                    </Box>
                    <List disablePadding>
                      {sugeridas.map((planilha, idx) => (
                        <ListItem key={planilha.id} disableGutters sx={{ alignItems: "flex-start", borderBottom: idx < sugeridas.length - 1 ? "1px solid #e8f5e9" : "none", py: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            <AddCircleOutlineIcon sx={{ color: "#2e7d32", fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={planilha.nome}
                            secondary={
                              <Typography component="span" variant="caption" color="text.secondary" display="block">
                                {planilha.descricao}
                              </Typography>
                            }
                            primaryTypographyProps={{ variant: "body2", fontWeight: 600, color: "#37474f" }}
                          />
                          <Box display="flex" gap={1} ml={2}>
                            <Tooltip title="Preencher no App">
                              <IconButton onClick={() => navigate(`/planilhas/editar/${planilha.id}`)} size="small" sx={{ color: "#1b4332", bgcolor: "#e8f5e9", "&:hover": { bgcolor: "#c8e6c9" } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Baixar Planilha Modelo (Excel)">
                              <IconButton onClick={() => handleDownload(planilha)} size="small" sx={{ color: "#b0bec5", "&:hover": { color: "#2e7d32", bgcolor: "#e8f5e9" } }}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
