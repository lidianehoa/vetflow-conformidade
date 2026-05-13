import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Button, TextField, CircularProgress,
  Alert, Divider, Grid, MenuItem, Select, FormControl, InputLabel,
  Switch, FormControlLabel,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { useReactToPrint } from "react-to-print";
import { gerarSmartId } from "../data/checklistsRT";
import { gerarHash } from "../data/tcleModels";

// Extrai variáveis {{VAR}} de um texto
function extrairVariaveis(texto) {
  const matches = [...(texto || "").matchAll(/\{\{([^}]+)\}\}/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

function substituir(texto, vars) {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v || `{{${k}}}`), texto);
}

export default function GerarDocumento() {
  const { id } = useParams();
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const navigate = useNavigate();
  const printRef = useRef();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [variaveis, setVariaveis] = useState({});
  const [clinicas, setClinicas] = useState([]);
  const [clinicaSelecionada, setClinicaSelecionada] = useState("");
  const [edicaoLivre, setEdicaoLivre] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");

  if (!pode("gerarDocumento")) {
    return <BloqueioRecurso recurso="Gerador de Documentos" planoMinimo={planoMinimo("gerarDocumento")} />;
  }

  useEffect(() => {
    if (!id) return;
    const loadTemplate = async () => {
      try {
        const snap = await getDoc(doc(db, "template", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setTemplate(data);
          const vars = extrairVariaveis(data.conteudo);
          const initVars = {};
          vars.forEach((v) => { initVars[v] = ""; });
          setVariaveis(initVars);
          setTextoEditado(data.conteudo);
        } else {
          setErro("Documento não encontrado.");
        }
      } catch {
        setErro("Erro ao carregar o documento.");
      } finally {
        setLoading(false);
      }
    };

    const loadClinicas = async () => {
      if (!userData?.uid) return;
      try {
        const q = query(collection(db, "clinicas"), where("userId", "==", userData.uid));
        const snap = await getDocs(q);
        setClinicas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Erro ao carregar clínicas:", e);
      }
    };

    loadTemplate();
    loadClinicas();
  }, [id, userData?.uid]);

  // Atualiza texto editado quando o template carrega ou as variáveis mudam
  useEffect(() => {
    if (template && !edicaoLivre) {
      setTextoEditado(substituir(template.conteudo, variaveis));
    }
  }, [template, variaveis, edicaoLivre]);

  const handleClinicaChange = (e) => {
    const cid = e.target.value;
    setClinicaSelecionada(cid);
    const clinica = clinicas.find(c => c.id === cid);
    if (clinica) {
      const sId = gerarSmartId(userData?.uid);
      setVariaveis(prev => ({
        ...prev,
        NOME_CLINICA: clinica.razaoSocial || clinica.nomeFantasia || "",
        CNPJ: clinica.cnpj || "",
        ENDERECO: clinica.endereco || "",
        CIDADE: clinica.cidade || "",
        UF: clinica.uf || "",
        TELEFONE: clinica.telefone || "",
        RT_NOME: userData?.rtNome || userData?.displayName || "",
        RT_CRMV: userData?.rtCrmv || "",
        SMART_ID: sId,
        DATA_ATUAL: new Date().toLocaleDateString("pt-BR"),
        HORA_ATUAL: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        HASH: gerarHash(sId + (clinica.cnpj || "") + new Date().toLocaleDateString("pt-BR")),
      }));
    }
  };

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const vars = template ? extrairVariaveis(template.conteudo) : [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress sx={{ color: "#1b4332" }} />
      </Box>
    );
  }

  if (erro) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{erro}</Alert>
        <Button onClick={() => navigate("/documentos")} sx={{ mt: 2, color: "#1b4332" }} startIcon={<ArrowBackIcon />}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/documentos")}
          sx={{ color: "#1b4332" }}
        >
          Documentos
        </Button>
        <Typography variant="h5" fontWeight={800} color="#1b4332">
          {template?.nome || template?.titulo || "Gerar Documento"}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Formulário de variáveis */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
              1. Selecionar Estabelecimento
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>Clínica / Cliente</InputLabel>
              <Select
                value={clinicaSelecionada}
                label="Clínica / Cliente"
                onChange={handleClinicaChange}
              >
                <MenuItem value=""><em>Nenhum</em></MenuItem>
                {clinicas.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nomeFantasia || c.razaoSocial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Preenche automaticamente campos como CNPJ, Endereço e RT.
            </Typography>
          </Paper>

          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
              2. Preencher Campos
            </Typography>
            {vars.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Este template não possui campos variáveis.
              </Typography>
            ) : (
              vars.map((v) => (
                <TextField
                  key={v}
                  id={`var-${v.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  label={v.replace(/_/g, " ")}
                  fullWidth
                  value={variaveis[v] || ""}
                  onChange={(e) => setVariaveis((p) => ({ ...p, [v]: e.target.value }))}
                  sx={{ mb: 2 }}
                  size="small"
                />
              ))
            )}
            <Divider sx={{ my: 2 }} />
            <Button
              id="btn-imprimir-doc"
              variant="contained"
              fullWidth
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                background: "#1b4332",
                color: "#fff",
                borderRadius: 3,
                fontWeight: 700,
                "&:hover": { background: "#2d6a4f" },
                mb: 1
              }}
            >
              Imprimir / Baixar
            </Button>
          </Paper>
        </Grid>

        {/* Preview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 4, minHeight: 600, background: "#fff" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {edicaoLivre ? "📝 Edição Manual Ativa" : "📄 Preview em tempo real"}
              </Typography>
              <FormControlLabel
                control={
                  <Switch 
                    size="small" 
                    checked={edicaoLivre} 
                    onChange={(e) => setEdicaoLivre(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography variant="caption" fontWeight={700}>Edição Livre</Typography>}
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {edicaoLivre ? (
              <TextField
                fullWidth
                multiline
                minRows={20}
                variant="standard"
                value={textoEditado}
                onChange={(e) => setTextoEditado(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontFamily: "serif",
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#1a1a1a",
                  }
                }}
              />
            ) : (
              <Box
                ref={printRef}
                sx={{
                  fontFamily: "serif",
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: "#1a1a1a",
                  whiteSpace: "pre-wrap",
                }}
              >
                {textoEditado}
              </Box>
            )}
            
            {/* Hidden box for printing in case of edicaoLivre */}
            {edicaoLivre && (
              <Box sx={{ display: "none" }}>
                <Box
                  ref={printRef}
                  sx={{
                    fontFamily: "serif",
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: "#000",
                    whiteSpace: "pre-wrap",
                    p: "2cm",
                  }}
                >
                  {textoEditado}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
