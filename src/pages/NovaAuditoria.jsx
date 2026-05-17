import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Paper, Button, TextField, MenuItem, Select,
  FormControl, InputLabel, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, LinearProgress, Stepper, Step,
  StepLabel, Grid, CircularProgress, Divider, Accordion,
  AccordionSummary, AccordionDetails, Tooltip, IconButton, Tabs, Tab,
  Radio, RadioGroup, FormControlLabel, Stack, Card, CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ChecklistIcon from "@mui/icons-material/Checklist";
import HistoryIcon from "@mui/icons-material/History";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import NavigateBefore from "@mui/icons-material/NavigateBefore";
import NavigateNext from "@mui/icons-material/NavigateNext";
import Star from "@mui/icons-material/Star";
import Gavel from "@mui/icons-material/Gavel";
import Label from "@mui/icons-material/Label";
import Factory from "@mui/icons-material/Factory";
import Groups from "@mui/icons-material/Groups";
import Nature from "@mui/icons-material/Nature";
import LocalShipping from "@mui/icons-material/LocalShipping";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../firebase";
import { gerarResumoMensal, gerarParecerAuditoria, gerarPlanoAcaoNC } from "../utils/analiseIA";
import { 
  getGamificacaoPorArea, 
  getNivel, 
  calcularScoreTrilha, 
  calcularXPAuditoria,
  proximoPassoMaisImpactante
} from "../data/gamificacao";
import EscudoConformidade from "../components/gamificacao/EscudoConformidade";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { 
  gerarSmartId, 
  RESULTADOS, 
  COR_CRITICIDADE, 
  LABEL_TIPO,
  CHECKLISTS,
  CHECKLISTS_POR_TIPO
} from "../data/checklistsRT";

// Importações das abas secundárias
import ChecklistMensal from "./ChecklistMensal";
import Auditorias from "./Auditorias";
import Conquistas from "./Conquistas";

const TIPOS_AUDITORIA = [
  {
    id: "rotina",
    label: "Rotina RT",
    icon: "📋",
    descricao: "Verificação rápida dos itens de rotina do mês. Foco nos itens críticos.",
    cor: "#1b4332",
    bg: "#e8f5e9",
  },
  {
    id: "completa",
    label: "Auditoria Completa",
    icon: "🔍",
    descricao: "Roteiro técnico completo por área. Todos os blocos e itens da especialidade.",
    cor: "#0d47a1",
    bg: "#e3f2fd",
  },
  {
    id: "trilha_cfmv",
    label: "Trilha CFMV 2023",
    icon: "⭐",
    descricao: "Auditoria guiada pelas Diretrizes de RT do Sistema CFMV/CRMVs 2023. Com gamificação ativa.",
    cor: "#6a1b9a",
    bg: "#f3e5f5",
    gameMode: true,
  },
];

export default function NovaAuditoria() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const [aba, setAba] = useState(0);

  if (!pode("novaAuditoria")) {
    return <BloqueioRecurso recurso="Auditoria" planoMinimo={planoMinimo("novaAuditoria")} />;
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      {/* HUB HEADER TABS */}
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", position: "sticky", top: 0, bgcolor: "#f0fdf4", zIndex: 10, mb: 3 }}>
        <Tabs value={aba} onChange={(_, v) => setAba(v)}
          sx={{ 
            px: { xs: 1, md: 3 }, 
            "& .MuiTab-root": { fontWeight: 800, fontSize: 13, textTransform: "none", minHeight: 64 },
            "& .Mui-selected": { color: "#1b4332" },
            "& .MuiTabs-indicator": { bgcolor: "#1b4332", height: 3 }
          }}>
          <Tab label="Nova Auditoria" icon={<AddCircleOutlineIcon />} iconPosition="start" />
          <Tab label="Checklists"     icon={<ChecklistIcon />} iconPosition="start" />
          <Tab label="Histórico"      icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Conquistas"     icon={<EmojiEventsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        {aba === 0 && <NovaAuditoriaFluxo />}
        {aba === 1 && <ChecklistMensal />}
        {aba === 2 && <Auditorias />}
        {aba === 3 && <Conquistas />}
      </Box>
    </Box>
  );
}

// ── COMPONENTE INTERNO: FLUXO DE NOVA AUDITORIA ──────────────────────────
function NovaAuditoriaFluxo() {
  const { uid, selectedClinicaId, clinicaData } = useUserData();
  const navigate = useNavigate();
  const [smartId] = useState(() => gerarSmartId(uid));
  const [etapa, setEtapa] = useState("inicio");
  
  const [tipoRT, setTipoRT] = useState("titular");
  const [identificacao, setIdentificacao] = useState("");
  const [tipoAuditoria, setTipoAuditoria] = useState("completa");
  const [gamData, setGamData] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [respostas, setRespostas] = useState({});
  const [planosNC, setPlanosNC] = useState({});
  const [evidencias, setEvidencias] = useState({});
  const [parecerRT, setParecerRT] = useState("");

  const triggerGerarPlanoNC = async (itemId, itemText, itemClass) => {
    if (planosNC[itemId]) return;
    
    setPlanosNC(prev => ({
      ...prev,
      [itemId]: { loading: true }
    }));
    
    try {
      const gravidades = {
        "CRÍTICO": "Grave",
        "MAIOR": "Moderada",
        "MENOR": "Leve"
      };
      const gravidade = gravidades[itemClass] || "Moderada";
      const estado = clinicaData?.estado || clinicaData?.uf || "MS";
      
      const plano = await gerarPlanoAcaoNC(
        itemText,
        clinicaData?.tipo || "Clínica Veterinária",
        estado,
        gravidade
      );
      
      setPlanosNC(prev => ({
        ...prev,
        [itemId]: { ...plano, loading: false }
      }));
    } catch (err) {
      console.error("Erro ao gerar plano de ação:", err);
      setPlanosNC(prev => ({
        ...prev,
        [itemId]: { loading: false, erro: true }
      }));
    }
  };
  const [scoreFinal, setScoreFinal] = useState(0);
  const [badgesDesbloqueados, setBadgesDesbloqueados] = useState([]);
  const [xpGanho, setXpGanho] = useState(0);

  useEffect(() => {
    if (uid) {
      getDoc(doc(db, "users", uid)).then(snap => {
        if (snap.exists()) setGamData(snap.data().gamificacao);
      });
    }
  }, [uid]);

  const concluir = async (resCalculado) => {
    setSalvando(true);
    try {
      const score = resCalculado?.score ?? 0;
      const areaAtual = clinicaData?.areaAtuacao || "pequenos_animais";

      let xpFinal = 0;
      let bNovos = [];

      if (tipoAuditoria === "trilha_cfmv") {
        const hist = gamData?.historico_scores ?? [];
        xpFinal = calcularXPAuditoria(resCalculado, hist);
        
        const { BADGES } = getGamificacaoPorArea(areaAtual);
        const auditorias_locais = [{ ...resCalculado, respostas,
          itensConformes: Object.entries(respostas).filter(([,v]) => v === "conforme").map(([id]) => ({ id })) }];
        
        // Passa um objeto simulando userData para os critérios
        const mockUserData = { uid, clinicaData };
        bNovos = BADGES.filter(b => !gamData?.badges?.includes(b.id) && b.criterio?.(mockUserData, auditorias_locais));

        const novoXP = (gamData?.xp ?? 0) + xpFinal + bNovos.reduce((acc, b) => acc + (b.xp ?? 0), 0);
        const novo_hist = [score, ...(gamData?.historico_scores ?? [])].slice(0, 12);

        await setDoc(doc(db, "users", uid), {
          gamificacao: {
            xp: novoXP,
            badges: [...(gamData?.badges ?? []), ...bNovos.map(b => b.id)],
            historico_scores: novo_hist,
            ultima_auditoria: serverTimestamp(),
          }
        }, { merge: true });
      }

      await addDoc(collection(db, "auditorias"), {
        userId: uid,
        tenantId: uid, // Campo obrigatório para as regras de segurança
        clinicaId: clinicaData?.id || null,
        smartId,
        nomeProntuario: identificacao,
        tipoRT,
        tipoAuditoria,
        score,
        respostas,
        planosNC,
        evidencias,
        parecerRT,
        xpGanho: xpFinal,
        badgesDesbloqueados: bNovos.map(b => b.id),
        criadoEm: serverTimestamp(),
      });

      setScoreFinal(score);
      setXpGanho(xpFinal);
      setBadgesDesbloqueados(bNovos);
      setEtapa("concluido");
    } catch (err) {
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box>
      <Stepper activeStep={etapa === "inicio" ? 0 : etapa === "auditoria" ? 1 : 2} sx={{ mb: 4 }}>
        {["Setup", "Inspeção", "Resultado"].map(l => <Step key={l}><StepLabel>{l}</StepLabel></Step>)}
      </Stepper>

      {etapa === "inicio" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: "1.5px solid #e8f5e9" }}>
              <Typography variant="h6" fontWeight={800} color="#1b4332" mb={3}>Configuração da Auditoria</Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ letterSpacing: 1 }}>MÉTODO DE AUDITORIA</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {TIPOS_AUDITORIA.map(tipo => (
                    <Grid item xs={12} key={tipo.id}>
                      <Card 
                        onClick={() => setTipoAuditoria(tipo.id)}
                        sx={{ 
                          cursor: "pointer", 
                          border: "2px solid",
                          borderColor: tipoAuditoria === tipo.id ? tipo.cor : "#f0fdf4",
                          bgcolor: tipoAuditoria === tipo.id ? tipo.bg : "#fff",
                          transition: "all 0.2s"
                        }}>
                        <CardContent sx={{ p: "16px !important", display: "flex", alignItems: "center", gap: 2 }}>
                          <Typography fontSize={24}>{tipo.icon}</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={800} fontSize={14} color={tipo.cor}>{tipo.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{tipo.descricao}</Typography>
                          </Box>
                          {tipoAuditoria === tipo.id && <CheckCircleIcon sx={{ color: tipo.cor }} />}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <TextField
                label="Identificação (Lote / Setor / Amostra) *"
                fullWidth value={identificacao} onChange={e => setIdentificacao(e.target.value)}
                placeholder="Ex: Lote 402 - Sala A" sx={{ mb: 4 }}
              />

              <Button
                variant="contained" fullWidth size="large"
                disabled={!identificacao.trim() || !clinicaData}
                onClick={() => setEtapa("auditoria")}
                sx={{ bgcolor: "#1b4332", py: 2, borderRadius: 3, fontWeight: 800 }}
              >
                Começar Inspeção
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            {clinicaData && (
              <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: "#f9fdfa" }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={800} color="#1b4332">Estabelecimento Selecionado</Typography>
                  <Typography variant="h6" fontWeight={900} sx={{ mt: 1 }}>{clinicaData.nomeFantasia}</Typography>
                  <Typography variant="caption" color="text.secondary">{LABEL_TIPO[clinicaData.tipo]}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" fontWeight={700} color="text.secondary">SMART ID: {smartId}</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {etapa === "auditoria" && (
        <Box>
          {tipoAuditoria === "trilha_cfmv" ? (
            <TrilhaGuiada 
              area={clinicaData?.areaAtuacao || "pequenos_animais"} 
              respostas={respostas} 
              setRespostas={setRespostas}
              planosNC={planosNC}
              setPlanosNC={setPlanosNC}
              triggerGerarPlanoNC={triggerGerarPlanoNC}
              clinicaData={clinicaData}
              parecerRT={parecerRT}
              setParecerRT={setParecerRT}
              evidencias={evidencias}
              setEvidencias={setEvidencias}
              smartId={smartId}
              onConcluir={concluir}
              salvando={salvando}
              onVoltar={() => setEtapa("inicio")}
            />
          ) : (
            <AuditoriaPadrao 
              tipo={tipoAuditoria}
              clinica={clinicaData}
              respostas={respostas}
              setRespostas={setRespostas}
              planosNC={planosNC}
              setPlanosNC={setPlanosNC}
              triggerGerarPlanoNC={triggerGerarPlanoNC}
              parecerRT={parecerRT}
              setParecerRT={setParecerRT}
              evidencias={evidencias}
              setEvidencias={setEvidencias}
              onConcluir={concluir}
              salvando={salvando}
              onVoltar={() => setEtapa("inicio")}
            />
          )}
        </Box>
      )}

      {etapa === "concluido" && (() => {
        const hist = gamData?.historico_scores ?? [];
        const oldScore = hist[0] ?? 0;
        const oldShield = getNivel(oldScore).escudo_pct;
        const newShield = getNivel(scoreFinal).escudo_pct;
        const delta = newShield - oldShield;

        // Transformar historico simples de score em formato esperado pelo calcularEscudo
        const auditoriasFormatadas = [{ score: scoreFinal }, ...hist.map(score => ({ score }))];
        
        const areaAtual = clinicaData?.areaAtuacao || "pequenos_animais";
        const { MISSOES, BADGES } = getGamificacaoPorArea(areaAtual);
        const proximaMissao = proximoPassoMaisImpactante(MISSOES, gamData?.missoes_concluidas ?? []);

        // Obter os objetos badges completos para os badges que foram recém desbloqueados
        const badgesObjetos = BADGES.filter(b => badgesDesbloqueados.includes(b.id));

        return (
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: "1.5px solid #e8f5e9", bgcolor: "#ffffff" }}>
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 72, color: "#1a7f4b", mb: 1.5 }} />
              <Typography variant="h4" fontWeight={900} color="#1b4332">Auditoria Concluída!</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
                Score Técnico Atingido: <span style={{ color: scoreFinal >= 75 ? "#1a7f4b" : "#c62828", fontWeight: 900 }}>{scoreFinal}%</span>
              </Typography>
              
              <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
                {xpGanho > 0 && (
                  <Chip icon={<Star sx={{ fontSize: 14 }} />} label={`+${xpGanho} XP Ganhos`} sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 800 }} />
                )}
                {scoreFinal >= 95 && (
                  <Chip label="Selo Excelência Verde 🏅" color="success" sx={{ fontWeight: 800 }} />
                )}
              </Stack>
            </Box>

            <Divider sx={{ my: 3.5 }} />

            {/* Parecer Técnico */}
            <Box sx={{ mb: 4, p: 2.5, bgcolor: "#f9fdfa", borderRadius: 3, border: "1.5px solid #e8f5e9" }}>
              <Typography variant="subtitle2" fontWeight={850} color="#1b4332" mb={1}>✍️ Parecer Técnico Registrado (Rastreabilidade RT):</Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary", lineHeight: 1.5 }}>"{parecerRT}"</Typography>
            </Box>

            {/* Escudo de Conformidade */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" fontWeight={850} color="#1b4332" mb={2}>
                🛡️ ATUALIZAÇÃO DO SEU ESCUDO DE CONFORMIDADE:
              </Typography>
              <EscudoConformidade 
                auditorias={auditoriasFormatadas} 
                userData={clinicaData} 
                compact={false} 
              />
              
              {delta > 0 && (
                <Alert severity="success" sx={{ mt: 2, borderRadius: 3 }}>
                  📈 <strong>Parabéns! Seu escudo de proteção cresceu em +{delta}%!</strong> O estabelecimento reduziu a exposição regulatória residual.
                </Alert>
              )}
            </Box>

            {/* Badges recém desbloqueados */}
            {badgesObjetos.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" fontWeight={850} color="#1b4332" mb={2}>
                  🏅 NOVAS CONQUISTAS & PROTEÇÃO LEGAL ATIVADA:
                </Typography>
                <Grid container spacing={2}>
                  {badgesObjetos.map(b => (
                    <Grid item xs={12} sm={6} key={b.id}>
                      <Card sx={{ p: 2, border: `2px solid ${b.cor}`, borderRadius: 3, bgcolor: "#f7fdf9" }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                          <Typography fontSize={24}>🏅</Typography>
                          <Box sx={{ flex: 1 }}>
                            <Typography fontSize={13} fontWeight={900} color="#1b4332">{b.nome}</Typography>
                            <Typography fontSize={11} color="text.secondary">{b.descricao}</Typography>
                          </Box>
                        </Stack>
                        {b.protecao && (
                          <Box sx={{ p: 1.5, bgcolor: "#fff", border: "1.5px dashed #2e7d3220", borderRadius: 2 }}>
                            <Typography variant="caption" display="block" fontWeight={900} color="#2e7d32" mb={0.5}>
                              Ativo: {b.protecao.orgao} Risco {b.protecao.risco_sem}% → {b.protecao.risco_com}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4 }}>
                              {b.protecao.consequencia_com}
                            </Typography>
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Recomendação Próximo Passo */}
            {proximaMissao && (
              <Card sx={{ mb: 4, border: "2px dashed #ff9800", borderRadius: 3, bgcolor: "#fff8e120" }}>
                <CardContent sx={{ p: "16px !important" }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#ff9800", color: "#fff", width: 40, height: 40 }}>🚀</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" fontWeight={900} color="#b26a00" sx={{ textTransform: "uppercase" }}>
                        Próxima Ação Mais Recomendada para Blindagem:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={850} color="#1b4332" sx={{ mt: 0.5 }}>
                        {proximaMissao.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ao concluir esta missão você aumenta seu Escudo de Conformidade em <strong>+{proximaMissao.escudo_incremento}%</strong>.
                      </Typography>
                    </Box>
                    <Button variant="contained" color="warning" size="small" onClick={() => setAba(3)} sx={{ fontWeight: 800 }}>
                      Ver Missão
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Button variant="outlined" size="large" onClick={() => window.location.reload()} sx={{ borderRadius: 3, px: 3 }}>
                Nova Inspeção
              </Button>
              <Button variant="contained" size="large" onClick={() => navigate("/central-rt")} sx={{ borderRadius: 3, px: 4, bgcolor: "#1b4332", "&:hover": { bgcolor: "#143628" } }}>
                Voltar à Central
              </Button>
            </Stack>
          </Paper>
        );
      })()}
    </Box>
  );
}

// ── COMPONENTE DE UPLOAD DE FOTO ──────────────────────────────────────
function FotoEvidencia({ itemId, evidencias, setEvidencias, auditoriaId }) {
  const [uploading, setUploading] = useState(false);

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `auditorias/${auditoriaId}/${itemId}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEvidencias(prev => ({ ...prev, [itemId]: url }));
    } catch (err) {
      console.error("Erro no upload da foto:", err);
      alert("Erro ao enviar foto. Verifique sua conexão.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <input
        accept="image/*"
        id={`icon-button-file-${itemId}`}
        type="file"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleCapture}
      />
      <label htmlFor={`icon-button-file-${itemId}`}>
        <IconButton 
          color="primary" 
          aria-label="upload picture" 
          component="span" 
          disabled={uploading}
          sx={{ bgcolor: evidencias[itemId] ? "#e8f5e9" : "#f5f5f5" }}
        >
          {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCameraIcon />}
        </IconButton>
      </label>
      {evidencias[itemId] && (
        <Box 
          component="img" 
          src={evidencias[itemId]} 
          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover", border: "1px solid #ddd" }} 
        />
      )}
    </Box>
  );
}

// ── COMPONENTE: DETALHAMENTO DO PLANO DE AÇÃO NC 5W2H ──────────────────
function PlanoAcaoNCItem({ itemId, itemText, itemClass, planosNC, setPlanosNC, clinicaData }) {
  const plano = planosNC[itemId];
  
  if (!plano) return null;
  
  if (plano.loading) {
    return (
      <Box sx={{ mt: 1.5, p: 2, bgcolor: "#fafafa", borderRadius: 3, border: "1px dashed #ccc", width: "100%" }}>
        <Stack spacing={1} direction="row" alignItems="center">
          <CircularProgress size={16} sx={{ color: "#1b4332" }} />
          <Typography variant="caption" color="text.secondary">
            Inteligência regulatória Vertos estruturando plano 5W2H...
          </Typography>
        </Stack>
      </Box>
    );
  }
  
  const handleFieldChange = (field, val) => {
    setPlanosNC(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: val
      }
    }));
  };
  
  const handleRegenerate = async () => {
    setPlanosNC(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], loading: true }
    }));
    
    try {
      const gravidades = {
        "CRÍTICO": "Grave",
        "MAIOR": "Moderada",
        "MENOR": "Leve"
      };
      const gravidade = gravidades[itemClass] || "Moderada";
      const estado = clinicaData?.estado || clinicaData?.uf || "MS";
      
      const novoPlano = await gerarPlanoAcaoNC(
        itemText,
        clinicaData?.tipo || "Clínica Veterinária",
        estado,
        gravidade
      );
      
      setPlanosNC(prev => ({
        ...prev,
        [itemId]: { ...novoPlano, loading: false }
      }));
    } catch (err) {
      console.error(err);
      setPlanosNC(prev => ({
        ...prev,
        [itemId]: { ...plano, loading: false }
      }));
    }
  };

  return (
    <Accordion sx={{ mt: 1.5, borderRadius: 2, border: "1px solid #ff980030", bgcolor: "#fffdf9", width: "100%" }} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesomeIcon sx={{ color: "#ff9800", fontSize: 18 }} />
          <Typography variant="caption" fontWeight={900} color="#e65100">
            PLANO DE AÇÃO CORRETIVA 5W2H SUGERIDO (EDITÁVEL)
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="WHAT (O que fazer)"
              fullWidth size="small"
              value={plano.what || ""}
              onChange={e => handleFieldChange("what", e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
            <TextField
              label="WHY (Justificativa e base legal)"
              fullWidth size="small" multiline rows={3}
              value={plano.why || ""}
              onChange={e => handleFieldChange("why", e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
            <TextField
              label="WHO (Responsável)"
              fullWidth size="small"
              value={plano.who || ""}
              onChange={e => handleFieldChange("who", e.target.value)}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="WHERE (Onde)"
              fullWidth size="small"
              value={plano.where || ""}
              onChange={e => handleFieldChange("where", e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
            <TextField
              label="WHEN (Prazo)"
              fullWidth size="small"
              value={plano.when || ""}
              onChange={e => handleFieldChange("when", e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
            <TextField
              label="HOW (Como executar)"
              fullWidth size="small" multiline rows={2}
              value={plano.how || ""}
              onChange={e => handleFieldChange("how", e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
            <TextField
              label="HOW MUCH (Custo estimado)"
              fullWidth size="small"
              value={plano.howMuch || ""}
              onChange={e => handleFieldChange("howMuch", e.target.value)}
              InputProps={{ style: { borderRadius: 8, fontSize: 12 } }}
            />
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<AutoAwesomeIcon />}
              onClick={handleRegenerate}
              sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
            >
              Regenerar com IA
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

// ── SUBCOMPONENTE: TRILHA GUIADA (GAMIFICADA) ──────────────────────────
function TrilhaGuiada({ area, respostas, setRespostas, planosNC, setPlanosNC, triggerGerarPlanoNC, clinicaData, parecerRT, setParecerRT, evidencias, setEvidencias, smartId, onConcluir, salvando, onVoltar }) {
  const { SECOES_TRILHA } = getGamificacaoPorArea(area);
  const [secaoIdx, setSecaoIdx] = useState(0);
  const secao = SECOES_TRILHA[secaoIdx];

  const handleResposta = (itemId, val, itemText, itemClass) => {
    setRespostas(prev => ({ ...prev, [itemId]: val }));
    if (val === "nao_conforme") {
      triggerGerarPlanoNC(itemId, itemText, itemClass);
    }
  };

  const isUltima = secaoIdx === SECOES_TRILHA.length - 1;

  const iconMap = {
    Gavel: <Gavel />, Label: <Label />, Factory: <Factory />,
    FactCheck: <CheckCircleIcon />, Groups: <Groups />, Nature: <Nature />,
    LocalShipping: <LocalShipping />,
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar sx={{ bgcolor: secao.cor }}>{iconMap[secao.icon] || <ChecklistIcon />}</Avatar>
        <Box>
          <Typography variant="h6" fontWeight={800} color={secao.cor}>
            {secao.letra}. {secao.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">{secao.referencia}</Typography>
        </Box>
      </Box>

      {/* TAREFA 8: Barra de Alerta de Risco da Seção */}
      {secao.risco_secao && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 3, 
            bgcolor: "#fff3e0", 
            border: "1.5px solid #ffe0b2",
            display: "flex", 
            alignItems: "flex-start", 
            gap: 1.5 
          }}
        >
          <WarningAmberIcon sx={{ color: "#e65100", mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="#e65100" mb={0.5}>
              ⚠️ EXPOSIÇÃO DE RISCO NESTE SETOR:
            </Typography>
            <Typography variant="body2" sx={{ color: "#5c3e09", fontSize: 12, lineHeight: 1.4, fontWeight: 500 }}>
              {secao.risco_secao}
            </Typography>
          </Box>
        </Box>
      )}

      <Stack spacing={2} mb={5}>
        {secao.itens.map(item => (
          <Paper key={item.id} sx={{ p: 3, borderRadius: 3, border: "1.5px solid", borderColor: respostas[item.id] ? secao.cor : "#f3e5f5" }}>
            <Stack direction="row" spacing={1} mb={2} alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Chip label={item.class} size="small" sx={{ fontSize: 10, fontWeight: 700, mb: 1 }} />
                <Typography variant="body1" fontWeight={700}>{item.desc}</Typography>
              </Box>
              
              {/* Câmera para evidência */}
              <FotoEvidencia 
                itemId={item.id} 
                evidencias={evidencias} 
                setEvidencias={setEvidencias} 
                auditoriaId={smartId} 
              />
            </Stack>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
              <RadioGroup 
                row value={respostas[item.id] || ""} 
                onChange={(e) => handleResposta(item.id, e.target.value, item.desc, item.class)}
                sx={{ gap: 2 }}
              >
                <FormControlLabel value="conforme" control={<Radio color="success" />} label="✅ Conforme" />
                <FormControlLabel value="nao_conforme" control={<Radio color="error" />} label="❌ NC" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
            </Box>

            <PlanoAcaoNCItem
              itemId={item.id}
              itemText={item.desc}
              itemClass={item.class}
              planosNC={planosNC}
              setPlanosNC={setPlanosNC}
              clinicaData={clinicaData}
            />
          </Paper>
        ))}
      </Stack>

      {isUltima && (
        <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3, border: "1.5px solid #e8f5e9", bgcolor: "#f1f8f6" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#1b4332">
              Parecer Técnico do RT (Observações Finais)
            </Typography>
            <Button 
              size="small" 
              variant="outlined" 
              startIcon={<AutoAwesomeIcon />}
              onClick={async () => {
                const resCalculado = calcularScoreTrilha(respostas, SECOES_TRILHA);
                const ncs = Object.entries(respostas).filter(([id, v]) => v === "nao_conforme");
                const parecer = await gerarParecerAuditoria({
                  score: resCalculado.score,
                  tipo: area,
                  criticosNC: ncs.length,
                  maioresNC: 0,
                  secoesCriticas: [secao.nome]
                });
                setParecerRT(parecer.parecer_tecnico);
              }}
              sx={{ borderRadius: 2, textTransform: "none", fontSize: 11 }}
            >
              Sugerir com IA
            </Button>
          </Box>
          <TextField
            multiline rows={4} fullWidth
            placeholder="Descreva aqui as não conformidades observadas, recomendações técnicas e prazos para adequação..."
            value={parecerRT || ""}
            onChange={(e) => setParecerRT(e.target.value)}
          />
        </Paper>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", position: "sticky", bottom: 20, bgcolor: "rgba(255,255,255,0.9)", p: 2, borderRadius: 3, backdropFilter: "blur(4px)", border: "1px solid #eee" }}>
        <Button startIcon={<NavigateBefore />} onClick={() => secaoIdx === 0 ? onVoltar() : setSecaoIdx(s => s - 1)}>
          {secaoIdx === 0 ? "Setup" : "Anterior"}
        </Button>
        {isUltima ? (
          <Button 
            variant="contained" color="secondary" 
            disabled={salvando || !parecerRT?.trim()}
            onClick={() => onConcluir(calcularScoreTrilha(respostas, SECOES_TRILHA))}
            sx={{ px: 4, fontWeight: 900 }}
          >
            {salvando ? <CircularProgress size={24} color="inherit" /> : "Finalizar Trilha ⭐"}
          </Button>
        ) : (
          <Button variant="contained" color="secondary" endIcon={<NavigateNext />} onClick={() => setSecaoIdx(s => s + 1)}>
            Próxima Seção
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── SUBCOMPONENTE: AUDITORIA PADRÃO (ROTINA / COMPLETA) ──────────────────
function AuditoriaPadrao({ tipo, clinica, respostas, setRespostas, planosNC, setPlanosNC, triggerGerarPlanoNC, parecerRT, setParecerRT, evidencias, setEvidencias, onConcluir, salvando, onVoltar }) {
  const ids = CHECKLISTS_POR_TIPO[clinica?.tipo] || [];
  const checklists = ids.map(id => CHECKLISTS[id]).filter(Boolean);

  const handleConcluir = () => {
    // Cálculo de score
    const todosItens = checklists.flatMap(c => c.itens);
    const pesoMap = { "CRÍTICO": 10, "MAIOR": 5, "MENOR": 1 };
    let total = 0, obtido = 0;
    
    todosItens.forEach(i => {
      const resp = respostas[i.id];
      if (!resp || resp === "na") return;
      const p = pesoMap[i.class] || 1;
      total += p;
      if (resp === "conforme") obtido += p;
    });

    const score = total === 0 ? 0 : Math.round((obtido / total) * 100);
    onConcluir({ score });
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h6" fontWeight={800} mb={1}>
        Inspeção Técnica: {tipo === 'rotina' ? 'Rotina RT' : 'Auditoria Completa'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Roteiro dinâmico para: {LABEL_TIPO[clinica?.tipo]}
      </Typography>

      {checklists.map(ck => (
        <Accordion key={ck.id} defaultExpanded sx={{ mb: 2, borderRadius: 3, "&:before": { display: "none" }, border: "1.5px solid #eee" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography fontWeight={800}>{ck.nome}</Typography>
              <Typography variant="caption" color="text.secondary">{ck.legislacao}</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f9fbf9" }}>
                  <TableRow sx={{ background: "#f9fbf9" }}>
                    <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 80 }}>Foto</TableCell>
                    <TableCell sx={{ fontWeight: 800, width: 160 }}>Resultado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ck.itens.map(item => (
                    <React.Fragment key={item.id}>
                      <TableRow>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{item.desc}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.class}</Typography>
                        </TableCell>
                        <TableCell>
                          <FotoEvidencia 
                            itemId={item.id} 
                            evidencias={evidencias} 
                            setEvidencias={setEvidencias} 
                            auditoriaId={clinica?.id || "temp"} 
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            size="small" fullWidth 
                            value={respostas[item.id] || ""} 
                            onChange={e => {
                              const val = e.target.value;
                              setRespostas(p => ({...p, [item.id]: val}));
                              if (val === "nao_conforme") {
                                triggerGerarPlanoNC(item.id, item.desc, item.class);
                              }
                            }}
                          >
                            <MenuItem value="conforme">✅ C</MenuItem>
                            <MenuItem value="nao_conforme">❌ NC</MenuItem>
                            <MenuItem value="na">N/A</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                      {respostas[item.id] === "nao_conforme" && (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ py: 0, borderBottom: "none" }}>
                            <PlanoAcaoNCItem
                              itemId={item.id}
                              itemText={item.desc}
                              itemClass={item.class}
                              planosNC={planosNC}
                              setPlanosNC={setPlanosNC}
                              clinicaData={clinica}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Resumo de Não Conformidades */}
      {Object.values(respostas).includes("nao_conforme") && (
        <Alert severity="warning" sx={{ mt: 4, borderRadius: 3, border: "1px solid #ff980040" }}>
          <Typography variant="subtitle2" fontWeight={800}>Atenção: Itens Críticos Encontrados</Typography>
          <Typography variant="caption">Foram identificadas não conformidades que precisam de plano de ação imediato.</Typography>
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 4, border: "1.5px solid #e8f5e9", bgcolor: "#f9fdfa" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={800} color="#1b4332">
            Parecer Técnico do RT (Observações Finais)
          </Typography>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<AutoAwesomeIcon />}
            onClick={async () => {
              const ncs = Object.entries(respostas).filter(([, v]) => v === "nao_conforme");
              const parecer = await gerarParecerAuditoria({
                score: 50, // Temporário para teste
                tipo: clinica?.tipo,
                criticosNC: ncs.length,
                maioresNC: 0,
                secoesCriticas: checklists.map(c => c.nome)
              });
              setParecerRT(parecer.parecer_tecnico);
            }}
            sx={{ borderRadius: 2, textTransform: "none", fontSize: 11 }}
          >
            Sugerir com IA
          </Button>
        </Box>
        <TextField
          multiline rows={4} fullWidth
          placeholder="Descreva aqui as não conformidades observadas, recomendações técnicas e prazos para adequação..."
          value={parecerRT || ""}
          onChange={(e) => setParecerRT(e.target.value)}
        />
      </Paper>

      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={onVoltar} sx={{ flex: 1 }}>Voltar</Button>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleConcluir} 
          disabled={salvando || !parecerRT?.trim()} 
          sx={{ flex: 2, bgcolor: "#1b4332", "&:hover": { bgcolor: "#2d6a4f" } }}
        >
          {salvando ? <CircularProgress size={24} color="inherit" /> : "Concluir e Salvar Relatório"}
        </Button>
      </Box>
    </Box>
  );
}
