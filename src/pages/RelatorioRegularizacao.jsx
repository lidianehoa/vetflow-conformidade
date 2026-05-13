import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, TextField, Button, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Stack, Alert, CircularProgress, MenuItem,
  FormControlLabel, Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";

const COR = "#1b4332";

export default function RelatorioRegularizacao() {
  const userData = useUserData();
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [form, setForm] = useState({
    referencia: "Boletins de Vistoria SESAU",
    introducao: "Este relatório detalha o status de regularização do estabelecimento frente às exigências da Secretaria Municipal de Saúde Pública (SESAU).",
    
    licenciamento: [
      { item: "1.a", desc: "Requerimento de Licença Sanitária", status: "pendente", obs: "Preencher formulário oficial da CAC." },
      { item: "1.b", desc: "CNPJ ou CPF", status: "ok", obs: "Regular em todos os registros." },
      { item: "1.c/4", desc: "Alvará de Localização", status: "ok", obs: "" },
      { item: "1.d", desc: "Documento de Constituição", status: "pendente", obs: "Providenciar cópia física." },
    ],
    
    manutencao: [
      { item: "5/6", desc: "Controle de Pragas (Desinsetização)", status: "ok", obs: "" },
      { item: "7", desc: "Higienização de Caixa d'Água", status: "ok", obs: "" },
      { item: "8", desc: "Manutenção de Climatizadores", status: "ok", obs: "" },
      { item: "9", desc: "Limpeza de Bebedouros e Filtros", status: "pendente", obs: "Necessário comprovante de troca." },
    ],
    
    saude: [
      { item: "10", desc: "Vacinação (Antirrábica/Antitetânica)", status: "pendente", obs: "Coletar cópias das carteiras." },
      { item: "11", desc: "Manual de Boas Práticas e POPs", status: "ok", obs: "Documento elaborado." },
    ],
    
    adequacoes: [
      "Instalação de espelhos de tomadas e fiação embutida.",
      "Substituição/reforma das gaiolas com sinais de ferrugem.",
      "Instalação de suportes de sabonete líquido e papel toalha.",
      "Lixeiras dotadas de tampa e acionamento por pedal.",
    ],
    
    assinaturaNome: userData?.displayName || "",
    assinaturaCargo: "Gestor(a) de Regularidade Administrativa",
    dataRelatorio: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (userData?.selectedClinicaId) {
      getDoc(doc(db, "clinicas", userData.selectedClinicaId)).then(snap => {
        if (snap.exists()) setUnidade(snap.data());
      });
    }
  }, [userData?.selectedClinicaId]);

  const handleStatusChange = (section, index, newStatus) => {
    const newList = [...form[section]];
    newList[index].status = newStatus;
    setForm({ ...form, [section]: newList });
  };

  const handleObsChange = (section, index, val) => {
    const newList = [...form[section]];
    newList[index].obs = val;
    setForm({ ...form, [section]: newList });
  };

  const addAdequacao = () => setForm({ ...form, adequacoes: [...form.adequacoes, ""] });
  const updateAdequacao = (idx, val) => {
    const list = [...form.adequacoes];
    list[idx] = val;
    setForm({ ...form, adequacoes: list });
  };
  const removeAdequacao = (idx) => setForm({ ...form, adequacoes: form.adequacoes.filter((_, i) => i !== idx) });

  const handleSalvar = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "relatorios_regularizacao"), {
        ...form,
        clinicaId: userData.selectedClinicaId,
        userId: userData.uid,
        criadoEm: serverTimestamp(),
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Typography variant="h6" fontWeight={800} color={COR} mb={3}>
        Emissão de Relatório de Regularização (SESAU)
      </Typography>

      {sucesso && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Relatório salvo com sucesso! ✅</Alert>}

      <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 4 }}>
        <Stack spacing={4}>
          {/* Cabeçalho */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Unidade" fullWidth disabled value={unidade?.nomeFantasia || ""} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Referência" fullWidth value={form.referencia} onChange={e => setForm({...form, referencia: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Introdução" fullWidth multiline rows={2} value={form.introducao} onChange={e => setForm({...form, introducao: e.target.value})} />
            </Grid>
          </Grid>

          <Divider />

          {/* Tabelas de Itens */}
          {[
            { key: "licenciamento", title: "1. Documentação de Licenciamento" },
            { key: "manutencao", title: "2. Controles de Manutenção e Terceiros" },
            { key: "saude", title: "3. Saúde e Procedimentos Operacionais" }
          ].map(sec => (
            <Box key={sec.key}>
              <Typography variant="subtitle2" fontWeight={700} color={COR} mb={2}>{sec.title}</Typography>
              <TableContainer sx={{ border: "1px solid #eee", borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: "#f9fdfa" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Observações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form[sec.key].map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell width={80}>{row.item}</TableCell>
                        <TableCell width={300}>{row.desc}</TableCell>
                        <TableCell align="center" width={120}>
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Button 
                              size="small" 
                              variant={row.status === "ok" ? "contained" : "outlined"}
                              color="success"
                              onClick={() => handleStatusChange(sec.key, idx, "ok")}
                              sx={{ minWidth: 40, p: 0.5 }}
                            >✅</Button>
                            <Button 
                              size="small" 
                              variant={row.status === "pendente" ? "contained" : "outlined"}
                              color="error"
                              onClick={() => handleStatusChange(sec.key, idx, "pendente")}
                              sx={{ minWidth: 40, p: 0.5 }}
                            >❌</Button>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <TextField 
                            fullWidth 
                            size="small" 
                            variant="standard" 
                            value={row.obs} 
                            onChange={e => handleObsChange(sec.key, idx, e.target.value)} 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}

          <Divider />

          {/* Adequações Físicas */}
          <Box>
            <Typography variant="subtitle2" fontWeight={700} color={COR} mb={2}>4. Adequações Físicas e Checklist</Typography>
            <Stack spacing={1}>
              {form.adequacoes.map((text, idx) => (
                <Stack key={idx} direction="row" spacing={1}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    value={text} 
                    onChange={e => updateAdequacao(idx, e.target.value)}
                    placeholder="Descreva a adequação física necessária..."
                  />
                  <IconButton size="small" color="error" onClick={() => removeAdequacao(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <Button startIcon={<AddIcon />} size="small" onClick={addAdequacao} sx={{ alignSelf: "flex-start", mt: 1 }}>
                Adicionar Adequação
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Rodapé do Relatório */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField label="Nome para Assinatura" fullWidth value={form.assinaturaNome} onChange={e => setForm({...form, assinaturaNome: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Cargo/Função" fullWidth value={form.assinaturaCargo} onChange={e => setForm({...form, assinaturaCargo: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Data" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.dataRelatorio} onChange={e => setForm({...form, dataRelatorio: e.target.value})} />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdfIcon />}
              sx={{ borderColor: COR, color: COR, fontWeight: 700 }}
            >
              Visualizar PDF
            </Button>
            <Button 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSalvar}
              disabled={loading}
              sx={{ background: COR, fontWeight: 700, px: 4 }}
            >
              {loading ? "Salvando..." : "Salvar Relatório"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
