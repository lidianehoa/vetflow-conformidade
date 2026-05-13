import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Paper, Button, TextField, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Alert, InputAdornment, Accordion, AccordionSummary,
  AccordionDetails, Divider, List, ListItem, ListItemIcon, ListItemText,
  Card, CardContent, Grid, Tabs, Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import InfoIcon from "@mui/icons-material/Info";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { useReactToPrint } from "react-to-print";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import {
  CATEGORIAS_VERTOS, normalizarCategoria, getCategoriaById,
} from "../data/categoriaTemplates";
import {
  AREAS_ATUACAO, OBSERVACOES_GERAIS, getAreaById,
} from "../data/rtTypes";
import { TCLE_MODELOS, gerarHash } from "../data/tcleModels";
import { gerarSmartId } from "../data/checklistsRT";

// ─── Seção: Guia de Documentos por Área ──────────────────────────────────────

function GuiaDocumentos({ areaAtual }) {
  const [expandido, setExpandido] = useState(areaAtual?.id ?? false);

  return (
    <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, mb: 4, overflow: "hidden" }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 2, px: 3, py: 2,
        background: "linear-gradient(90deg, #1b4332 0%, #2d6a4f 100%)",
      }}>
        <DescriptionIcon sx={{ color: "#52b788", fontSize: 24 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={800} color="#fff">
            Guia de Documentos Obrigatórios por Área de RT
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.7)">
            Registros e manuais que o RT deve elaborar, implementar e manter atualizados
          </Typography>
        </Box>
        {areaAtual && (
          <Chip
            label={`${areaAtual.emoji} Sua área: ${areaAtual.label}`}
            size="small"
            sx={{ ml: "auto", background: areaAtual.bg, color: areaAtual.cor, fontWeight: 700, fontSize: 11 }}
          />
        )}
      </Box>

      {AREAS_ATUACAO.map((area) => {
        const isMinhaArea = areaAtual?.id === area.id;
        return (
          <Accordion
            key={area.id}
            expanded={expandido === area.id}
            onChange={(_, open) => setExpandido(open ? area.id : false)}
            elevation={0}
            disableGutters
            sx={{
              borderBottom: "1px solid #f0fdf4",
              "&:before": { display: "none" },
              background: isMinhaArea ? area.bg : "#fff",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: area.cor }} />}
              sx={{ px: 3, py: 0.5, minHeight: 56 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                <Typography variant="h5" lineHeight={1}>{area.emoji}</Typography>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} color={area.cor}>
                      {area.label}
                    </Typography>
                    {isMinhaArea && (
                      <Chip label="Sua área" size="small"
                        sx={{ background: area.cor, color: "#fff", fontWeight: 700, fontSize: 10, height: 18 }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{area.exemplos}</Typography>
                </Box>
                <Chip
                  label={`${area.documentosObrigatorios.length} docs`}
                  size="small"
                  sx={{ ml: "auto", mr: 2, background: area.bg, color: area.cor, fontWeight: 700, fontSize: 11,
                    border: `1px solid ${area.cor}30` }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 3, pt: 0, pb: 2.5 }}>
              <List dense disablePadding>
                {area.documentosObrigatorios.map((d, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0.4 }}>
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      {d.critico
                        ? <CheckCircleIcon sx={{ fontSize: 16, color: area.cor }} />
                        : <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "#90a4ae" }} />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" fontWeight={d.critico ? 600 : 400} color={d.critico ? "#1a1a1a" : "#546e7a"}>
                            {d.nome}
                          </Typography>
                          {d.ref && (
                            <Typography variant="caption" color={area.cor} fontWeight={600} fontSize={10}>
                              {d.ref}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
}

// ─── Seção: Gerador de TCLE ───────────────────────────────────────────────────

const ICONES_TCLE = { 
  Cirurgia: "🔬", 
  Anestesia: "💉", 
  Internação: "🏥", 
  Eutanásia: "🕊️",
  Manual: "📖",
  POP: "📋"
};

function substituir(texto, vars) {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v || `{{${k}}}`), texto);
}

function GeradorTCLE({ userData }) {
  const [etapa, setEtapa] = useState("selecao");
  const [modelo, setModelo] = useState(null);
  const [smartId] = useState(() => gerarSmartId(userData?.uid));
  const [form, setForm] = useState({ NOME_ANIMAL: "", ESPECIE_RACA_IDADE: "", RESPONSAVEL: "", CPF_RESPONSAVEL: "" });
  const printRef = useRef();

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const vars = {
    SMART_ID: smartId,
    DATA_ATUAL: new Date().toLocaleDateString("pt-BR"),
    HORA_ATUAL: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    NOME_CLINICA: userData?.razaoSocial || "{{NOME_CLINICA}}",
    CNPJ: userData?.cnpj || "{{CNPJ}}",
    RT_NOME: userData?.rtNome || "{{RT_NOME}}",
    RT_CRMV: userData?.crmv || "{{RT_CRMV}}",
    RAZAO_SOCIAL: userData?.razaoSocial || "{{RAZAO_SOCIAL}}",
    ENDERECO_UNIDADE: userData?.endereco || "Rua Vitório Zeolla, 597, Carandá Bosque – Campo Grande/MS",
    HASH: gerarHash(smartId + (form.RESPONSAVEL || "") + new Date().toLocaleDateString("pt-BR")),
    ...form,
  };

  const textoFinal = modelo ? substituir(modelo.conteudo, vars) : "";

  if (etapa === "selecao") {
    return (
      <Grid container spacing={2}>
        {TCLE_MODELOS.map((m) => (
          <Grid item xs={12} sm={6} md={3} key={m.id}>
            <Paper
              elevation={0}
              onClick={() => { setModelo(m); setEtapa("preenchimento"); }}
              sx={{
                border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3, cursor: "pointer", textAlign: "center",
                transition: "all 0.2s", "&:hover": { borderColor: "#1b4332", background: "#f0fdf4", transform: "translateY(-2px)" }
              }}
            >
              <Typography variant="h2" mb={1}>{ICONES_TCLE[m.categoria]}</Typography>
              <Typography variant="subtitle2" fontWeight={700} color="#1b4332" gutterBottom>{m.titulo}</Typography>
              <Chip label={m.categoria} size="small" sx={{ background: "#e8f5e9", color: "#1b4332", fontWeight: 600, fontSize: 11 }} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1b4332" mb={2}>Preencher Dados</Typography>
          {Object.keys(form).map(k => (
            <TextField
              key={k} label={k.replace("_", " ")} fullWidth size="small" sx={{ mb: 2 }}
              value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))}
            />
          ))}
          <Box display="flex" gap={1}>
            <Button variant="outlined" fullWidth onClick={() => setEtapa("selecao")}>Voltar</Button>
            <Button variant="contained" fullWidth startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: "#1b4332" }}>Imprimir</Button>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={8}>
        <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 4, background: "#fafffe", minHeight: 400 }}>
          <Box ref={printRef} sx={{ fontFamily: "monospace", fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {textoFinal}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

function formatarTituloDocumento(texto) {
  if (!texto || typeof texto !== 'string') return "Documento RT";
  
  // 1. Remove números seguidos de ponto no início (ex: "14. Protocolo" -> "Protocolo")
  let limpo = texto.replace(/^\d+\.\s*/, '');
  
  // 2. Converte para minúsculas
  limpo = limpo.toLowerCase();
  
  // 3. Exceções e Siglas
  const ignorar = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'para', 'com', 'por', 'a', 'o', 'as', 'os'];
  const siglas = ['tcle', 'pgrss', 'ciq', 'rt', 'crmv', 'mapa', 'anvisa', 'poa', 'appcc', 'ppho', 'pac'];
  
  // 4. Aplica Title Case
  return limpo.split(/\s+/).map((palavra, index) => {
    const cleanWord = palavra.replace(/[^a-záéíóúãõç]/g, '');
    if (siglas.includes(cleanWord)) {
      return palavra.toUpperCase();
    }
    if (index > 0 && ignorar.includes(palavra)) {
      return palavra;
    }
    if (palavra.length > 0) {
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    }
    return palavra;
  }).join(' ');
}

function getTemplateName(t) {
  if (!t) return "Documento RT";
  let nameEncontrado = null;
  
  const name = t.nome || t.titulo || t.name || t.title || t.Nome || t.Titulo || (t._meta && t._meta.nome);
  if (name && typeof name === 'string') {
    nameEncontrado = name;
  } else {
    // Procura por chaves aninhadas que possam conter o título
    const nestedKey = Object.keys(t).find(k => k !== 'id' && typeof t[k] === 'object' && t[k] !== null && (t[k].titulo || t[k].nome));
    if (nestedKey) {
      nameEncontrado = t[nestedKey].titulo || t[nestedKey].nome;
    } else {
      // Varredura profunda
      for (const [k, v] of Object.entries(t)) {
        const kLower = k.toLowerCase();
        if (typeof v === 'string' && (kLower.includes('nome') || kLower.includes('titulo') || kLower.includes('title') || kLower.includes('assunto') || kLower.includes('label'))) {
          nameEncontrado = v;
          break;
        }
      }
    }
  }

  if (nameEncontrado) {
    return formatarTituloDocumento(nameEncontrado);
  }

  // Fallback inteligente para o ID do documento
  if (t.id && typeof t.id === 'string') {
    return formatarTituloDocumento(t.id.replace(/[-_]/g, ' '));
  }
  
  return "Documento RT";
}

export default function Documentos() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const navigate = useNavigate();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [catSelecionada, setCatSelecionada] = useState("todos");
  const [areaRT, setAreaRT] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState(0);

  useEffect(() => {
    if (!userData?.uid) return;
    getDoc(doc(db, "unidades", userData.uid))
      .then((snap) => {
        if (snap.exists() && snap.data().areaAtuacao) {
          setAreaRT(getAreaById(snap.data().areaAtuacao));
        }
      })
      .catch(() => {});
  }, [userData?.uid]);

  useEffect(() => {
    getDocs(collection(db, "template"))
      .then((snap) => {
        setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  const templatesFiltrados = useMemo(() => {
    let lista = templates.map((t) => ({ ...t, categoriaVetflow: normalizarCategoria(t.categoria) }));
    if (catSelecionada !== "todos") lista = lista.filter((t) => t.categoriaVetflow === catSelecionada);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(t => getTemplateName(t).toLowerCase().includes(q) || (t.categoria || "").toLowerCase().includes(q));
    }
    return lista;
  }, [templates, catSelecionada, busca]);

  const agrupado = useMemo(() => {
    if (catSelecionada !== "todos") return null;
    const grupos = {};
    templatesFiltrados.forEach((t) => {
      const catId = t.categoriaVetflow;
      if (!grupos[catId]) grupos[catId] = [];
      grupos[catId].push(t);
    });
    return grupos;
  }, [templatesFiltrados, catSelecionada]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={800} color="#1b4332" gutterBottom>Central de Documentos RT</Typography>
        <Typography variant="body2" color="text.secondary">Templates regulatórios, TCLEs e guia de documentos obrigatórios.</Typography>
      </Box>

      <Tabs value={abaAtiva} onChange={(_, v) => setAbaAtiva(v)} sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}>
        <Tab icon={<DescriptionIcon />} iconPosition="start" label="Templates RT" sx={{ fontWeight: 700 }} />
        <Tab icon={<HistoryEduIcon />} iconPosition="start" label="Gerador de Documentos" sx={{ fontWeight: 700 }} />
        <Tab icon={<AssignmentIcon />} iconPosition="start" label="Guia de Obrigações" sx={{ fontWeight: 700 }} />
      </Tabs>

      {abaAtiva === 0 && (
        <Box>
           <TextField id="documentos-busca" placeholder="Buscar template..." fullWidth value={busca} onChange={(e) => setBusca(e.target.value)}
            sx={{ mb: 2 }} InputProps={{ startAdornment: <SearchIcon sx={{ color: "#90a4ae" }} />, sx: { borderRadius: 3 } }} />
          
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            <Chip label="Todos" onClick={() => setCatSelecionada("todos")} sx={{ background: catSelecionada === "todos" ? "#1b4332" : "#fff", color: catSelecionada === "todos" ? "#fff" : "#1b4332", fontWeight: 700, cursor: "pointer", border: "1px solid #c8e6c9" }} />
            {CATEGORIAS_VERTOS.map((cat) => (
              <Chip key={cat.id} label={`${cat.emoji} ${cat.label}`} onClick={() => setCatSelecionada(cat.id)} sx={{ background: catSelecionada === cat.id ? cat.cor : "#fff", color: catSelecionada === cat.id ? "#fff" : cat.cor, fontWeight: 700, cursor: "pointer", border: `1px solid ${cat.cor}40` }} />
            ))}
          </Box>

          {loading ? <CircularProgress /> : agrupado ? (
            Object.entries(agrupado).map(([catId, itens]) => {
              const catObj = getCategoriaById(catId);
              return (
                <Box key={catId} mb={4}>
                  <Typography variant="subtitle2" fontWeight={700} color={catObj?.cor} mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {catObj?.emoji} {catObj?.label} <Chip label={itens.length} size="small" sx={{ height: 16, fontSize: 10 }} />
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableBody>
                        {itens.map(t => (
                          <TableRow key={t.id} hover>
                            <TableCell><Typography variant="body2" fontWeight={600}>{getTemplateName(t)}</Typography></TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="contained" onClick={() => navigate(`/documentos/gerar/${t.id}`)} sx={{ bgcolor: "#1b4332", borderRadius: 2 }}>Gerar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableBody>
                  {templatesFiltrados.map(t => (
                    <TableRow key={t.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>{getTemplateName(t)}</Typography></TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="contained" onClick={() => navigate(`/documentos/gerar/${t.id}`)} sx={{ bgcolor: "#1b4332", borderRadius: 2 }}>Gerar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {abaAtiva === 1 && <GeradorTCLE userData={userData} />}

      {abaAtiva === 2 && <GuiaDocumentos areaAtual={areaRT} />}
    </Box>
  );
}
