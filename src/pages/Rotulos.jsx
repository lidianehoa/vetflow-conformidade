import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Button, Grid, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, TextField, InputAdornment, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { useNavigate } from "react-router-dom";

const COR = "#1b4332";

export default function Rotulos() {
  const navigate = useNavigate();
  const userData = useUserData();
  const [rotulos, setRotulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!userData?.uid) return;
    const loadRotulos = async () => {
      try {
        const q = query(
          collection(db, "rotulos"),
          where("userId", "==", userData.uid),
          orderBy("atualizadoEm", "desc")
        );
        const snap = await getDocs(q);
        setRotulos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro ao carregar rótulos:", e);
      } finally {
        setLoading(false);
      }
    };
    loadRotulos();
  }, [userData?.uid]);

  const filtrados = rotulos.filter(r => 
    r.nomeProduto?.toLowerCase().includes(busca.toLowerCase()) ||
    r.marca?.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case "Aprovado": return { bg: "#e8f5e9", text: "#2e7d32", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
      case "Requer Lupa": return { bg: "#fff3e0", text: "#ef6c00", icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> };
      case "Em Análise": return { bg: "#e3f2fd", text: "#1565c0", icon: null };
      default: return { bg: "#f5f5f5", text: "#757575", icon: null };
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} color={COR} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocalOfferIcon sx={{ fontSize: 32 }} /> Gestão de Rótulos e Embalagens
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Validador Nutricional, cálculo de Lupa Frontal (FOP) e Adequação RDC 429/2020 (ANVISA) e MAPA.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate("/rotulos/novo")}
          sx={{ bgcolor: COR, borderRadius: "12px", px: 3, py: 1.2, fontWeight: 700, "&:hover": { bgcolor: "#2d6a4f" } }}
        >
          Validar Novo Rótulo
        </Button>
      </Box>

      <Paper sx={{ p: 2, borderRadius: "16px", mb: 3, border: "1px solid #e8f5e9" }} elevation={0}>
        <TextField
          fullWidth
          placeholder="Buscar por produto ou marca..."
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
        <Typography sx={{ textAlign: "center", py: 8, color: "#90a4ae" }}>Carregando portfólio de rótulos...</Typography>
      ) : filtrados.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10, bgcolor: "#f9fdfa", borderRadius: "20px", border: "2px dashed #e8f5e9" }}>
          <LocalOfferIcon sx={{ fontSize: 64, color: "#e8f5e9", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" fontWeight={700}>Nenhum rótulo cadastrado</Typography>
          <Typography variant="body2" color="text.secondary">Adicione o seu primeiro produto para validar a tabela nutricional.</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e8f5e9", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f8f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Produto / Marca</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Categoria</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Lupa Frontal (FOP)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: COR }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map((r) => {
                const s = getStatusInfo(r.status || "Rascunho");
                
                // Exibir lupas se houver
                const temLupa = r.lupas && r.lupas.length > 0;

                return (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={800}>{r.nomeProduto}</Typography>
                      <Typography variant="caption" color="text.secondary">{r.marca}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.85rem" }}>
                      {r.categoria || "—"}
                    </TableCell>
                    <TableCell>
                      {temLupa ? (
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {r.lupas.map((lupa, idx) => (
                            <Chip 
                              key={idx}
                              label={lupa} 
                              size="small"
                              sx={{ bgcolor: "#000", color: "#fff", fontWeight: 800, fontSize: "0.6rem", height: 18 }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Isento</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={r.status || "Rascunho"} 
                        size="small"
                        icon={s.icon}
                        sx={{ 
                          bgcolor: s.bg, color: s.text, fontWeight: 800, fontSize: "0.7rem",
                          "& .MuiChip-icon": { color: s.text }
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Visualizar / Editar">
                        <IconButton size="small" onClick={() => navigate(`/rotulos/editar/${r.id}`)}>
                          <VisibilityIcon sx={{ color: COR }} />
                        </IconButton>
                      </Tooltip>
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
