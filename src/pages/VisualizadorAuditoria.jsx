import React, { useRef, useEffect, useState } from "react";
import { 
  Box, Typography, Paper, Button, Divider, Grid, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, CircularProgress, Stack, Alert
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useReactToPrint } from "react-to-print";
import { db } from "../firebase";
import { CHECKLISTS, LABEL_TIPO } from "../data/checklistsRT";
import { getAreaById } from "../data/rtTypes";

const COR_PRIMARIA = "#1b4332";

export default function VisualizadorAuditoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [auditoria, setAuditoria] = useState(null);
  const [clinica, setClinica] = useState(null);
  const [loading, setLoading] = useState(true);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Relatorio_Auditoria_${auditoria?.smartId || id}`,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aSnap = await getDoc(doc(db, "auditorias", id));
        if (aSnap.exists()) {
          const aData = aSnap.data();
          setAuditoria(aData);
          
          if (aData.clinicaId) {
            const cSnap = await getDoc(doc(db, "clinicas", aData.clinicaId));
            if (cSnap.exists()) setClinica(cSnap.data());
          }
        }
      } catch (err) {
        console.error("Erro ao carregar auditoria:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <CircularProgress sx={{ color: COR_PRIMARIA }} />
    </Box>
  );

  if (!auditoria) return <Alert severity="error">Auditoria não encontrada.</Alert>;

  // Filtrar Não Conformidades
  const ncs = [];
  const todasRespostas = auditoria.respostas || {};
  
  // Mapear todas as descrições de itens dos checklists
  const mapaItens = {};
  Object.values(CHECKLISTS).forEach(ck => {
    ck.itens.forEach(it => {
      mapaItens[it.id] = it;
    });
  });

  Object.entries(todasRespostas).forEach(([itemId, status]) => {
    if (status === "nao_conforme") {
      ncs.push({
        id: itemId,
        ...mapaItens[itemId]
      });
    }
  });

  const area = clinica?.tipo ? getAreaById(clinica.tipo) : null;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 4, display: "print-none" }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Voltar</Button>
        <Box sx={{ flex: 1 }} />
        <Button 
          variant="contained" 
          startIcon={<PictureAsPdfIcon />} 
          onClick={handlePrint}
          sx={{ bgcolor: COR_PRIMARIA, fontWeight: 700 }}
        >
          Gerar PDF para Envio
        </Button>
      </Stack>

      <Paper 
        ref={componentRef} 
        elevation={0} 
        sx={{ 
          p: 6, 
          borderRadius: 0, 
          border: "1px solid #eee",
          background: "#fff",
          position: "relative",
          "& .MuiTypography-root": { color: "#333" }
        }}
      >
        {/* Marca d'água de Conformidade */}
        <Box sx={{ position: "absolute", top: 40, right: 40, textAlign: "right" }}>
          <Typography variant="h3" fontWeight={900} color={auditoria.score >= 90 ? "#1b433220" : "#d32f2f20"}>
            {auditoria.score}%
          </Typography>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: "uppercase" }}>
            Score de Blindagem
          </Typography>
        </Box>

        {/* Cabeçalho */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" fontWeight={800} color={COR_PRIMARIA} sx={{ letterSpacing: 2 }}>
            Relatório Técnico de Auditoria & Conformidade
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ mt: 1, mb: 1 }}>
            {clinica?.nomeFantasia || "Estabelecimento"}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">DATA DA INSPEÇÃO</Typography>
              <Typography variant="body2" fontWeight={700}>
                {auditoria.criadoEm?.toDate()?.toLocaleDateString("pt-BR")}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" display="block">SMART ID / PROTOCOLO</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "monospace" }}>
                {auditoria.smartId || id}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Resumo */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2, textTransform: "uppercase" }}>
              1. Parecer Técnico do RT
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f9fbf9", borderStyle: "dashed" }}>
              <Typography variant="body2" sx={{ fontStyle: "italic", lineHeight: 1.6 }}>
                "{auditoria.parecerRT || "Nenhum parecer registrado."}"
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2, textTransform: "uppercase" }}>
              2. Status de Blindagem
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, bgcolor: auditoria.score >= 90 ? "#e8f5e9" : "#fff3e0" }}>
                <Typography variant="caption" fontWeight={700}>Conformidade</Typography>
                <Typography variant="body2" fontWeight={900}>{auditoria.score}%</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 2, border: "1px solid #eee" }}>
                <Typography variant="caption" fontWeight={700}>Não Conformidades</Typography>
                <Typography variant="body2" fontWeight={900} color={ncs.length > 0 ? "error" : "success"}>
                  {ncs.length} itens
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Não Conformidades */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 2, textTransform: "uppercase", color: "#d32f2f", display: "flex", alignItems: "center", gap: 1 }}>
            <ErrorIcon fontSize="small" /> 3. Detalhamento de Não Conformidades (NC)
          </Typography>
          
          {ncs.length === 0 ? (
            <Alert icon={<CheckCircleIcon />} severity="success">
              Nenhuma não conformidade detectada nesta inspeção. Estabelecimento operando em conformidade total nos itens auditados.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: "#fdf2f2" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: "#d32f2f" }}>Item Auditado</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#d32f2f" }}>Critério Técnico / Legislação</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: "#d32f2f" }} align="center">Gravidade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ncs.map((nc) => (
                    <TableRow key={nc.id}>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="body2" fontWeight={700}>{nc.desc || "Item não identificado"}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{nc.categoria}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2 }}>
                        <Typography variant="caption" sx={{ lineHeight: 1.4, display: "block" }}>
                          {nc.criterio || "Conforme diretrizes vigentes."}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={nc.class || "Médio"} 
                          size="small" 
                          color={nc.class === "CRÍTICO" ? "error" : "warning"}
                          sx={{ fontWeight: 800, fontSize: 10, height: 20 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Evidências Fotográficas */}
        {Object.keys(auditoria.evidencias || {}).length > 0 && (
          <Box sx={{ mb: 6, pageBreakBefore: "auto" }}>
            <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 3, textTransform: "uppercase", color: COR_PRIMARIA, display: "flex", alignItems: "center", gap: 1 }}>
              <PhotoCameraIcon fontSize="small" /> 4. Evidências Fotográficas
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(auditoria.evidencias).map(([itemId, url]) => (
                <Grid item xs={6} key={itemId}>
                  <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                    <Box 
                      component="img" 
                      src={url} 
                      sx={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 1, mb: 1 }} 
                    />
                    <Typography variant="caption" fontWeight={700} sx={{ display: "block", lineHeight: 1.2 }}>
                      Item: {mapaItens[itemId]?.desc || itemId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Status: {todasRespostas[itemId] === "conforme" ? "✅ Conforme" : "❌ Não Conforme"}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Rodapé de Assinatura */}
        <Box sx={{ mt: 10, pt: 4, borderTop: "1px solid #eee" }}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Box sx={{ borderBottom: "1px solid #333", width: "100%", mb: 1, mt: 4 }} />
              <Typography variant="body2" fontWeight={800} align="center">Responsável Técnico (RT)</Typography>
              <Typography variant="caption" align="center" display="block" color="text.secondary">Carimbo e Assinatura</Typography>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ borderBottom: "1px solid #333", width: "100%", mb: 1, mt: 4 }} />
              <Typography variant="body2" fontWeight={800} align="center">Representante do Estabelecimento</Typography>
              <Typography variant="caption" align="center" display="block" color="text.secondary">Ciente em {new Date().toLocaleDateString("pt-BR")}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 8, textAlign: "center", opacity: 0.5 }}>
          <Typography variant="caption">
            Este relatório foi gerado eletronicamente pelo sistema VERTOS OS — Blindagem 360°.
            A autenticidade pode ser verificada via Smart ID: {auditoria.smartId}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
