// ============================================================
// Documentos.jsx — Fábrica de Documentos VetFlow
//
// Planos:
//   Freemium  → vê a lista, botão "Gerar" bloqueado
//   RT Solo+  → acessa todos os documentos
//
// Categorias reorganizadas em 5 grupos com subcategorias
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, TextField, Chip, Stack, Grid,
  Card, CardContent, CardActions, Button, CircularProgress,
  InputAdornment, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LockIcon from "@mui/icons-material/Lock";
import ArticleIcon from "@mui/icons-material/Article";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useUserData } from "./ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import { CATEGORIAS, normalizarCategoria } from "../data/categoriaTemplates";

const COR = "#1b4332";
const ACENTO = "#52b788";

// ─── Chip de categoria com cor ───────────────────────────────
function CatChip({ label, selecionada, cor, corFundo, onClick }) {
  return (
    <Chip
      label={label}
      onClick={onClick}
      size="small"
      sx={{
        bgcolor: selecionada ? cor : corFundo,
        color: selecionada ? "#fff" : cor,
        border: `1px solid ${cor}`,
        fontWeight: selecionada ? 700 : 500,
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.15s",
        "&:hover": { bgcolor: cor, color: "#fff" },
      }}
    />
  );
}

// ─── Card de documento ───────────────────────────────────────
function CardDoc({ doc, pode, navigate }) {
  const cat = normalizarCategoria(doc.categoria);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: "14px",
        border: "1px solid #eee",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(27,67,50,0.1)" },
      }}
    >
      <CardContent sx={{ pb: 0, flexGrow: 1 }}>
        {/* Badge categoria */}
        <Chip
          label={cat.label}
          size="small"
          sx={{
            bgcolor: cat.corFundo,
            color: cat.cor,
            fontWeight: 700,
            fontSize: "0.65rem",
            height: 20,
            mb: 1.5,
            borderRadius: "6px",
          }}
        />

        {/* Tipo */}
        <Typography
          sx={{ fontSize: "0.68rem", color: "#aaa", fontWeight: 700, mb: 0.5, letterSpacing: 0.5 }}
        >
          POP
        </Typography>

        {/* Nome */}
        <Typography
          sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#333", lineHeight: 1.4 }}
        >
          {doc.nome}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 1.5 }}>
        {pode("gerarDocumento") ? (
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<ArticleIcon sx={{ fontSize: 14 }} />}
            onClick={() => navigate(`/documentos/gerar/${doc.id}?origem=${doc.origem || "template"}`)}
            sx={{
              bgcolor: COR,
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.8rem",
              "&:hover": { bgcolor: "#2d6a4f" },
            }}
          >
            Gerar Documento
          </Button>
        ) : (
          <Tooltip title="Disponível no plano RT Solo ou superior">
            <span style={{ width: "100%" }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                disabled
                startIcon={<LockIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "0.8rem",
                }}
              >
                Plano RT Solo
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}

// ─── Componente principal ────────────────────────────────────
export default function Documentos() {
  const navigate = useNavigate();
  const userData = useUserData();
  const { pode } = usePlano(userData);

  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busca, setBusca]       = useState("");
  const [catAtiva, setCatAtiva] = useState("todas");

  // Carrega templates do Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "template"));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDocs(lista);
      } catch (err) {
        console.error("Erro ao carregar templates:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtra por busca + categoria
  const docsFiltrados = useMemo(() => {
    return docs.filter((d) => {
      const textoBusca = busca.toLowerCase();
      const buscaOk =
        !busca ||
        d.nome?.toLowerCase().includes(textoBusca) ||
        d.categoria?.toLowerCase().includes(textoBusca);

      const cat = normalizarCategoria(d.categoria);
      const catOk = catAtiva === "todas" || cat.categoriaId === catAtiva;

      return buscaOk && catOk;
    });
  }, [docs, busca, catAtiva]);

  // Contagem por categoria (para badges nos chips)
  const contagemPorCat = useMemo(() => {
    const map = {};
    docs.forEach((d) => {
      const cat = normalizarCategoria(d.categoria);
      map[cat.categoriaId] = (map[cat.categoriaId] || 0) + 1;
    });
    return map;
  }, [docs]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, pb: 10 }}>

      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: COR }}>
          Fábrica de Documentos
        </Typography>
        <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
          {loading ? "Carregando..." : `${docs.length} modelos de blindagem encontrados no seu banco.`}
        </Typography>
      </Box>

      {/* Barra de busca */}
      <TextField
        fullWidth
        placeholder="Buscar POP, TCLE ou Manual..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        size="small"
        sx={{ mb: 3, maxWidth: 500 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#aaa", fontSize: 18 }} />
            </InputAdornment>
          ),
          sx: { borderRadius: "12px" },
        }}
      />

      {/* Filtros por categoria */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: 1 }}>
        <Chip
          label={`Todos (${docs.length})`}
          onClick={() => setCatAtiva("todas")}
          size="small"
          sx={{
            bgcolor: catAtiva === "todas" ? COR : "#f0f0f0",
            color: catAtiva === "todas" ? "#fff" : "#555",
            fontWeight: catAtiva === "todas" ? 700 : 500,
            fontSize: "0.75rem",
            cursor: "pointer",
          }}
        />
        {CATEGORIAS.map((cat) => (
          <CatChip
            key={cat.id}
            label={`${cat.label} (${contagemPorCat[cat.id] || 0})`}
            selecionada={catAtiva === cat.id}
            cor={cat.cor}
            corFundo={cat.corFundo}
            onClick={() => setCatAtiva(catAtiva === cat.id ? "todas" : cat.id)}
          />
        ))}
      </Stack>

      {/* Aviso freemium */}
      {!pode("gerarDocumento") && (
        <Box
          sx={{
            bgcolor: "#fffde7",
            border: "1px solid #ffe082",
            borderRadius: "12px",
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <LockIcon sx={{ color: "#f59e0b", flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#7a4f00" }}>
              Você está no plano Freemium
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: "#a06000" }}>
              Visualize os modelos disponíveis. Para gerar documentos, assine o RT Solo ou Clínica Pro.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/pagamento")}
            sx={{
              ml: "auto", bgcolor: COR, borderRadius: "10px",
              textTransform: "none", fontWeight: 700, flexShrink: 0,
              "&:hover": { bgcolor: "#2d6a4f" },
            }}
          >
            Ver planos
          </Button>
        </Box>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: ACENTO }} />
        </Box>
      )}

      {/* Resultado vazio */}
      {!loading && docsFiltrados.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8, color: "#aaa" }}>
          <Typography>Nenhum documento encontrado para "{busca}"</Typography>
        </Box>
      )}

      {/* Grid de documentos agrupados por categoria */}
      {!loading && catAtiva === "todas"
        ? CATEGORIAS.map((cat) => {
            const grupo = docsFiltrados.filter(
              (d) => normalizarCategoria(d.categoria).categoriaId === cat.id
            );
            if (grupo.length === 0) return null;
            return (
              <Box key={cat.id} sx={{ mb: 4 }}>
                {/* Cabeçalho do grupo */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    mb: 2,
                    pb: 1.5,
                    borderBottom: `2px solid ${cat.cor}20`,
                  }}
                >
                  <Box
                    sx={{
                      width: 10, height: 10, borderRadius: "50%",
                      bgcolor: cat.cor, flexShrink: 0,
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: cat.cor }}>
                    {cat.label}
                  </Typography>
                  <Chip
                    label={grupo.length}
                    size="small"
                    sx={{ bgcolor: cat.corFundo, color: cat.cor, fontWeight: 700, height: 20, fontSize: "0.7rem" }}
                  />
                </Stack>

                <Grid container spacing={2}>
                  {grupo.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                      <CardDoc doc={doc} pode={pode} navigate={navigate} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })
        : (
          <Grid container spacing={2}>
            {docsFiltrados.map((doc) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                <CardDoc doc={doc} pode={pode} navigate={navigate} />
              </Grid>
            ))}
          </Grid>
        )
      }
    </Box>
  );
}
