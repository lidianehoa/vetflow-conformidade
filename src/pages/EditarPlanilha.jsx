import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, CircularProgress, Alert, Tooltip, Stack
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";

import planilhasData from "../../scripts/seeds/planilhasSistema.json";
import { gerarPlanilhaExcel } from "../utils/excelGenerator";

export default function EditarPlanilha() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();

  const [planilha, setPlanilha] = useState(null);
  const [unidade, setUnidade] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    // 1. Encontrar o schema da planilha pelo ID
    let found = null;
    for (const area of planilhasData.areas) {
      const p = area.planilhas.find(p => p.id === id);
      if (p) {
        found = p;
        break;
      }
    }
    if (!found) {
      setLoading(false);
      return;
    }
    setPlanilha(found);

    // 2. Buscar dados salvos no Firestore
    if (userData?.uid) {
      const fetchData = async () => {
        try {
          // Dados da empresa para o Excel
          const uniSnap = await getDoc(doc(db, "unidades", userData.uid));
          if (uniSnap.exists()) setUnidade(uniSnap.data());

          // Registros da planilha
          const docRef = doc(db, "planilhas_preenchidas", `${userData.uid}_${id}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setRows(docSnap.data().rows || []);
          }
        } catch (error) {
          console.error("Erro ao carregar dados da planilha:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id, userData?.uid]);

  const handleSaveToFirestore = async () => {
    if (!userData?.uid || !planilha) return;
    setSaving(true);
    try {
      const docRef = doc(db, "planilhas_preenchidas", `${userData.uid}_${id}`);
      await setDoc(docRef, {
        userId: userData.uid,
        planilhaId: id,
        ultimaAtualizacao: new Date().toISOString(),
        rows: rows
      }, { merge: true });
      // Podemos mostrar um Toast aqui no futuro
    } catch (error) {
      console.error("Erro ao salvar planilha no Firestore", error);
      alert("Erro ao salvar a planilha no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // Passamos as linhas (rows) para o gerador injetar no Excel
    gerarPlanilhaExcel(planilha, userData, unidade, rows);
  };

  // --- Funções do Modal ---
  const handleOpenModal = (index = -1) => {
    setEditingIndex(index);
    if (index >= 0) {
      setFormData(rows[index]);
    } else {
      setFormData({});
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({});
    setEditingIndex(-1);
  };

  const handleFormChange = (campo, value) => {
    setFormData(prev => ({ ...prev, [campo]: value }));
  };

  const handleSaveRow = () => {
    // Validação de campos obrigatórios
    const missing = planilha.colunas.filter(c => c.obrigatorio && (!formData[c.campo] || formData[c.campo] === ""));
    if (missing.length > 0) {
      alert(`Por favor, preencha os campos obrigatórios:\n\n${missing.map(c => `- ${c.label}`).join("\n")}`);
      return;
    }

    if (editingIndex >= 0) {
      const newRows = [...rows];
      newRows[editingIndex] = { ...formData, updatedAt: new Date().toISOString() };
      setRows(newRows);
    } else {
      setRows([...rows, { id: Date.now().toString(), createdAt: new Date().toISOString(), ...formData }]);
    }
    handleCloseModal();
  };

  const handleDeleteRow = (index) => {
    if (window.confirm("Deseja realmente excluir este registro?")) {
      const newRows = [...rows];
      newRows.splice(index, 1);
      setRows(newRows);
    }
  };

  // --- Renderização Dinâmica de Inputs ---
  const renderInput = (col) => {
    const isError = col.obrigatorio && !formData[col.campo];
    
    if (col.tipo === "select") {
      return (
        <TextField
          key={col.campo}
          select
          fullWidth
          margin="normal"
          label={col.label}
          value={formData[col.campo] || ""}
          onChange={(e) => handleFormChange(col.campo, e.target.value)}
          required={col.obrigatorio}
          error={isError && editingIndex === -2} // Só mostra erro se for submeter (lógica simplificada)
        >
          {col.opcoes?.map(opt => (
            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
          ))}
        </TextField>
      );
    }

    if (col.tipo === "textarea") {
      return (
        <TextField
          key={col.campo}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          label={col.label}
          value={formData[col.campo] || ""}
          onChange={(e) => handleFormChange(col.campo, e.target.value)}
          required={col.obrigatorio}
        />
      );
    }

    return (
      <TextField
        key={col.campo}
        fullWidth
        margin="normal"
        type={col.tipo === "date" ? "date" : col.tipo === "number" ? "number" : "text"}
        label={col.label}
        value={formData[col.campo] || ""}
        onChange={(e) => handleFormChange(col.campo, e.target.value)}
        required={col.obrigatorio}
        InputLabelProps={col.tipo === "date" ? { shrink: true } : {}}
      />
    );
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center" mt={10}>
        <CircularProgress sx={{ color: "#1b4332" }} />
        <Typography mt={2} color="text.secondary">Carregando planilha...</Typography>
      </Box>
    );
  }

  if (!planilha) {
    return (
      <Box p={4} maxWidth={800} mx="auto">
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Planilha não encontrada ou ID inválido.
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/planilhas")} sx={{ mt: 2 }}>
          Voltar para Planilhas
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, margin: "0 auto", height: "100%", display: "flex", flexDirection: "column" }}>
      
      {/* HEADER */}
      <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate("/planilhas")} sx={{ bgcolor: "#f5f5f5" }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#1b4332" lineHeight={1.2}>
              {planilha.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {planilha.legislacao || "Planilha de Registro Interno"}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={handleExport}
            sx={{ borderColor: "#1b4332", color: "#1b4332", fontWeight: 700, borderRadius: 2 }}
          >
            Exportar Excel
          </Button>
          <Button 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            onClick={handleSaveToFirestore}
            disabled={saving}
            sx={{ bgcolor: "#1b4332", "&:hover": { bgcolor: "#2d6a4f" }, fontWeight: 700, borderRadius: 2 }}
          >
            Salvar no Sistema
          </Button>
        </Stack>
      </Box>

      {/* INFORMAÇÕES DA PLANILHA */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f0fdf4", border: "1px solid #c8e6c9", borderRadius: 3 }}>
        <Typography variant="body2" color="#1b4332">
          <strong>Objetivo:</strong> {planilha.descricao}
        </Typography>
        <Box display="flex" gap={2} mt={1}>
          <Chip label={`Frequência: ${planilha.frequencia || "N/A"}`} size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600 }} />
          <Chip label={`Registros: ${rows.length}`} size="small" sx={{ bgcolor: "#fff", border: "1px solid #ccc", fontWeight: 600 }} />
        </Box>
      </Paper>

      {/* TABELA DE DADOS (DATA GRID) */}
      <Paper elevation={0} sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid #e0e0e0", borderRadius: 3 }}>
        <Box p={2} borderBottom="1px solid #e0e0e0" display="flex" justifyContent="space-between" alignItems="center" bgcolor="#fafafa">
          <Typography variant="subtitle1" fontWeight={700} color="#37474f">
            Registros
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            size="small"
            onClick={() => handleOpenModal(-1)}
            sx={{ bgcolor: "#2d6a4f", "&:hover": { bgcolor: "#40916c" }, borderRadius: 2 }}
          >
            Nova Linha
          </Button>
        </Box>

        <TableContainer sx={{ flex: 1, maxHeight: "calc(100vh - 350px)" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {planilha.colunas.map(col => (
                  <TableCell key={col.campo} sx={{ fontWeight: 700, bgcolor: "#f5f5f5", color: "#455a64", whiteSpace: "nowrap" }}>
                    {col.label} {col.obrigatorio && <span style={{color: "red"}}>*</span>}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, bgcolor: "#f5f5f5", color: "#455a64", align: "right" }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={planilha.colunas.length + 1} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Nenhum registro adicionado. Clique em "Nova Linha" para começar.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={row.id || index} hover>
                    {planilha.colunas.map(col => (
                      <TableCell key={col.campo} sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row[col.campo] || "—"}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenModal(index)} sx={{ color: "#1976d2" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" onClick={() => handleDeleteRow(index)} sx={{ color: "#d32f2f" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODAL DE FORMULÁRIO DINÂMICO */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: "#1b4332", bgcolor: "#f0fdf4" }}>
          {editingIndex >= 0 ? "Editar Registro" : "Novo Registro"}
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={1}>
            {planilha.colunas.map(col => renderInput(col))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
          <Button onClick={handleCloseModal} sx={{ color: "#546e7a", fontWeight: 600 }}>Cancelar</Button>
          <Button onClick={handleSaveRow} variant="contained" sx={{ bgcolor: "#1b4332", fontWeight: 700, borderRadius: 2 }}>
            {editingIndex >= 0 ? "Atualizar" : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
