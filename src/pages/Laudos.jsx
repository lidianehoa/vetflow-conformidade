import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Grid, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TextField, InputAdornment, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { TIPOS_LAUDO } from "../data/laudoTypes";

const COR = "#1b4332";

export default function Laudos() {
  const navigate = useNavigate();
  const userData = useUserData();
  const [laudos, setLaudos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!userData?.uid) return;
    const loadLaudos = async () => {
      try {
        const q = query(
          collection(db, "laudos"),
          where("userId", "==", userData.uid),
          orderBy("criadoEm", "desc")
        );
        const snap = await getDocs(q);
        setLaudos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro ao carregar laudos:", e);
      } finally {
        setLoading(false);
      }
    };
    loadLaudos();
  }, [userData?.uid]);

  const filtrados = laudos.filter(l => 
    l.numeroLaudo?.toLowerCase().includes(busca.toLowerCase()) ||
    l.nomeTemplate?.toLowerCase().includes(busca.toLowerCase()) ||
    l.resumo?.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "assinado": return { bg: "#e8f5e9", text: "#2e7d32" };
      case "em_revisao": return { bg: "#fff3e0", text: "#ef6c00" };
      case "cancelado": return { bg: "#ffebee", text: "#c62828" };
      default: return { bg: "#f5f5f5", text: "#757575" };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} color={COR} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <FactCheckIcon sx={{ fontSize: 32 }} /> Central de Laudos Técnicos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestão de laudos clínicos, necropsias e verificações de PAC com assinatura digital.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate("/laudos/novo")}
          sx={{ bgcolor: COR, borderRadius: "12px", px: 3, py: 1.2, fontWeight: 700, "&:hover": { bgcolor: "#2d6a4f" } }}
        >
          Emitir Novo Laudo
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: "16px", mb: 3, border: "1px solid #e8f5e9" }} elevation={0}>
        <TextField
          fullWidth
          placeholder="Buscar por número, tipo ou conteúdo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#90a4ae" }} />
              </InputAdornment>
            ),
            sx: { borderRadius: "10px", bgcolor: "#f9fdfa" }
          }}
          size="small"
        />
      </Paper>

      {loading ? (
        <Typography sx={{ textAlign: "center", py: 8, color: "#90a4ae" }}>Carregando laudos...</Typography>
      ) : filtrados.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10, bgcolor: "#f9fdfa", borderRadius: "20px", border: "2px dashed #e8f5e9" }}>
          <FactCheckIcon sx={{ fontSize: 64, color: "#e8f5e9", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>Nenhum laudo encontrado</Typography>
          <Typography variant="body2" color="text.secondary">Inicie sua primeira emissão técnica clicando no botão acima.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e8f5e9", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f8f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Nº Laudo</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Tipo / Documento</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Data Emissão</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map((l) => {
                const s = getStatusColor(l.status);
                return (
                  <TableRow key={l.id} hover>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem" }}>{l.numeroLaudo}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{l.nomeTemplate}</Typography>
                      <Typography variant="caption" color="text.secondary">{l.resumo}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {l.dataEmissao || (l.criadoEm?.toDate()?.toLocaleDateString("pt-BR"))}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={l.status?.replace("_", " ").toUpperCase()} 
                        size="small"
                        icon={l.status === "assinado" ? <VerifiedUserIcon sx={{ fontSize: "14px !important" }} /> : null}
                        sx={{ 
                          bgcolor: s.bg, color: s.text, fontWeight: 800, fontSize: "0.65rem",
                          "& .MuiChip-icon": { color: s.text }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Visualizar / Editar">
                        <IconButton size="small" onClick={() => navigate(`/laudos/gerar/${l.id}`)}>
                          <VisibilityIcon sx={{ color: COR }} />
                        </IconButton>
                      </Tooltip>
                      <IconButton size="small">
                        <PrintIcon sx={{ color: "#90a4ae" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
