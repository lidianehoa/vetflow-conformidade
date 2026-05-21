import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Stepper, Step, StepLabel, Button, TextField,
  MenuItem, CircularProgress, Alert, Paper, Grid, Divider, Card,
  CardContent, Stack, Fade, Chip, List, ListItem, ListItemIcon, ListItemText
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ShieldIcon from "@mui/icons-material/Shield";
import DescriptionIcon from "@mui/icons-material/Description";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import { UserContext } from "../ProtectedRoute";
import { AREAS_ATUACAO } from "../../data/rtTypes";

const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", 
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
  "SP", "SE", "TO"
];

const TIPOS_ESTABELECIMENTO = [
  { id: "clinica", label: "Clínica Veterinária", area: "pequenos_animais" },
  { id: "hospital", label: "Hospital Veterinário", area: "pequenos_animais" },
  { id: "consultorio", label: "Consultório Veterinário", area: "pequenos_animais" },
  { id: "pet_shop", label: "Pet Shop", area: "pequenos_animais" },
  { id: "banho_tosa", label: "Banho e Tosa", area: "pequenos_animais" },
  { id: "hotel_caes", label: "Hotel para Cães", area: "creche_hotel" },
  { id: "creche_caes", label: "Creche para Cães", area: "creche_hotel" },
  { id: "diagnostico", label: "Centro de Diagnóstico Veterinário", area: "areas_especiais" },
  { id: "laboratorio", label: "Laboratório Clínico Veterinário", area: "areas_especiais" },
  { id: "acougue", label: "Açougue / Casa de Carnes", area: "industria_alimenticia" },
  { id: "laticinio", label: "Laticínio / Queijaria", area: "laticinios" },
  { id: "industria_poa", label: "Fábrica / Indústria de Origem Animal (POA)", area: "industria_poa" },
  { id: "frigorifico", label: "Frigorífico / Abatedouro", area: "industria_poa" },
  { id: "entreposto_carne", label: "Entreposto de Carnes e Derivados", area: "industria_poa" },
  { id: "entreposto_pescado", label: "Entreposto de Pescado e Mel", area: "industria_poa" },
  { id: "fabrica_racao", label: "Fábrica de Ração / Suplementos", area: "comercio_agronegocio" },
  { id: "agropecuaria", label: "Loja Agropecuária / Insumos", area: "comercio_agronegocio" },
  { id: "comercio_medicamentos", label: "Comércio de Medicamentos Veterinários", area: "comercio_agronegocio" },
  { id: "bovinocultura_corte", label: "Fazenda de Gado de Corte", area: "bovinocultura_corte" },
  { id: "bovinocultura_leite", label: "Fazenda de Gado de Leite", area: "bovinocultura_leite" },
  { id: "granja_avicola", label: "Granja Avícola / Produção de Ovos", area: "producao_rural" },
  { id: "suinocultura", label: "Suinocultura / Criação de Suínos", area: "producao_rural" },
  { id: "distribuidora", label: "Distribuidora de Produtos Veterinários", area: "comercio_agronegocio" },
  { id: "pesquisa_animal", label: "Centro de Pesquisa / Ensino Animal", area: "areas_especiais" }
];

const STEPS = ["Perfil do RT", "Primeiro Estabelecimento", "Revisão & Ativação"];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { setUserData } = useContext(UserContext) || {};
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Formulário - Etapa 1: Perfil do RT
  const [perfil, setPerfil] = useState({
    nomeCompleto: "",
    numeroCRMV: "",
    ufCRMV: "",
    tipoEstabelecimentoPrincipal: "",
    areaAtuacaoPrincipal: ""
  });

  // Formulário - Etapa 2: Primeiro Estabelecimento
  const [estabelecimento, setEstabelecimento] = useState({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    cidade: "",
    uf: "",
    cargaHorariaSemanal: 40
  });

  // Validações locais de formulário
  const [perfilErros, setPerfilErros] = useState({});
  const [estabErros, setEstabErros] = useState({});

  // Auto-preenchimento da Área de Atuação com base no tipo selecionado
  useEffect(() => {
    if (perfil.tipoEstabelecimentoPrincipal) {
      const tipoObj = TIPOS_ESTABELECIMENTO.find(t => t.id === perfil.tipoEstabelecimentoPrincipal);
      if (tipoObj) {
        setPerfil(p => ({ ...p, areaAtuacaoPrincipal: tipoObj.area }));
      }
    }
  }, [perfil.tipoEstabelecimentoPrincipal]);

  // Formatação do CRMV (XXXXX-UF)
  const handleCrmvChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    // Se o usuário digitar números e depois a UF, tentamos organizar
    setPerfil(p => ({ ...p, numeroCRMV: value }));
  };

  // Máscara CNPJ (XX.XXX.XXX/XXXX-XX)
  const formatCNPJ = (value) => {
    let cnpj = value.replace(/\D/g, "");
    if (cnpj.length > 14) cnpj = cnpj.slice(0, 14);
    
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
  };

  const handleCnpjChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setEstabelecimento(es => ({ ...es, cnpj: formatted }));
  };

  // Validar Etapa 1
  const validarPerfil = () => {
    const erros = {};
    if (!perfil.nomeCompleto.trim()) erros.nomeCompleto = "Nome completo é obrigatório.";
    
    // Validar CRMV formato XXXXX-UF
    const crmvRegex = /^\d+-[A-Z]{2}$/;
    if (!perfil.numeroCRMV) {
      erros.numeroCRMV = "Número de CRMV é obrigatório.";
    } else if (!crmvRegex.test(perfil.numeroCRMV)) {
      erros.numeroCRMV = "Formato inválido. Use números seguidos de hífen e estado (Ex: 12345-MS).";
    }

    if (!perfil.ufCRMV) erros.ufCRMV = "UF do CRMV é obrigatória.";
    if (!perfil.tipoEstabelecimentoPrincipal) erros.tipoEstabelecimentoPrincipal = "Selecione o tipo de estabelecimento principal.";

    setPerfilErros(erros);
    return Object.keys(erros).length === 0;
  };

  // Validar Etapa 2
  const validarEstabelecimento = () => {
    const erros = {};
    if (!estabelecimento.razaoSocial.trim()) erros.razaoSocial = "Razão social é obrigatória.";
    if (!estabelecimento.nomeFantasia.trim()) erros.nomeFantasia = "Nome fantasia é obrigatório.";
    
    const cnpjLimpo = estabelecimento.cnpj.replace(/\D/g, "");
    if (!estabelecimento.cnpj) {
      erros.cnpj = "CNPJ é obrigatório.";
    } else if (cnpjLimpo.length !== 14) {
      erros.cnpj = "CNPJ deve conter 14 dígitos.";
    }

    if (!estabelecimento.cidade.trim()) erros.cidade = "Cidade é obrigatória.";
    if (!estabelecimento.uf) erros.uf = "UF é obrigatória.";
    
    const ch = Number(estabelecimento.cargaHorariaSemanal);
    if (!estabelecimento.cargaHorariaSemanal || isNaN(ch) || ch <= 0 || ch > 168) {
      erros.cargaHorariaSemanal = "Informe uma carga horária semanal válida (ex: 1 a 168 horas).";
    }

    setEstabErros(erros);
    return Object.keys(erros).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validarPerfil()) {
        setActiveStep(1);
        setErro("");
      } else {
        setErro("Por favor, preencha corretamente todos os campos obrigatórios do perfil.");
      }
    } else if (activeStep === 1) {
      if (validarEstabelecimento()) {
        setActiveStep(2);
        setErro("");
      } else {
        setErro("Por favor, preencha corretamente todos os campos do estabelecimento.");
      }
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setErro("");
  };

  // Finalizar Onboarding e Salvar
  const handleFinalizar = async () => {
    if (!user) return;
    setLoading(true);
    setErro("");
    try {
      // 1. Salvar perfil do RT em ambos "users" e "usuarios"
      const profileData = {
        rtNome: perfil.nomeCompleto,
        crmv: perfil.numeroCRMV,
        ufCRMV: perfil.ufCRMV,
        tipoEstabelecimentoPrincipal: perfil.tipoEstabelecimentoPrincipal,
        areaAtuacaoPrincipal: perfil.areaAtuacaoPrincipal,
        onboardingStep: 2,
        onboardingCompleto: true,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
      await setDoc(doc(db, "usuarios", user.uid), profileData, { merge: true });

      // 2. Salvar o primeiro estabelecimento em "clinicas" e na subcoleção "clinicas/{uid}/estabelecimentos"
      const establishmentData = {
        razaoSocial: estabelecimento.razaoSocial,
        nomeFantasia: estabelecimento.nomeFantasia,
        cnpj: estabelecimento.cnpj,
        cidade: estabelecimento.cidade,
        estado: estabelecimento.uf, // campo padrão no resto do código é estado
        uf: estabelecimento.uf,
        cargaHorariaSemanal: Number(estabelecimento.cargaHorariaSemanal),
        tipo: perfil.tipoEstabelecimentoPrincipal,
        areaAtuacao: perfil.areaAtuacaoPrincipal,
        userId: user.uid,
        rtId: user.uid,
        tenantId: user.uid,
        rtNome: perfil.nomeCompleto,
        rtCrmv: perfil.numeroCRMV,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      };

      // Grava na coleção principal
      const docRef = await addDoc(collection(db, "clinicas"), establishmentData);
      
      // Grava na subcoleção específica
      await setDoc(doc(db, "clinicas", user.uid, "estabelecimentos", docRef.id), {
        ...establishmentData,
        id: docRef.id
      });

      // 3. Atualizar o ID selecionado no perfil do usuário
      await setDoc(doc(db, "users", user.uid), {
        selectedClinicaId: docRef.id
      }, { merge: true });

      await setDoc(doc(db, "usuarios", user.uid), {
        selectedClinicaId: docRef.id
      }, { merge: true });

      // Atualiza o contexto do React se estiver disponível
      if (setUserData) {
        setUserData(prev => ({
          ...prev,
          ...profileData,
          selectedClinicaId: docRef.id,
          onboardingCompleto: true
        }));
      }

      // Redireciona para o cockpit principal
      navigate("/dashboard");

    } catch (err) {
      console.error("Erro ao salvar dados do onboarding:", err);
      setErro("Falha crítica ao salvar dados no Firestore. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Obter detalhes da regulamentação com base na área escolhida
  const getRegulamentacaoArea = () => {
    const areaObj = AREAS_ATUACAO.find(a => a.id === perfil.areaAtuacaoPrincipal);
    return areaObj || {
      label: "Geral / Consultório",
      emoji: "🐾",
      regulamentacoes: ["Res. CFMV 1275/2019", "RDC ANVISA 222/2018"],
      documentosObrigatorios: [
        { nome: "Manual de Boas Práticas (MBP)", critico: true },
        { nome: "PGRSS — Plano de Resíduos", critico: true },
        { nome: "POPs de Higienização de Ambientes", critico: true }
      ]
    };
  };

  const currentArea = getRegulamentacaoArea();

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1b4332 0%, #081c15 100%)", p: { xs: 2, md: 4 }
    }}>
      <Paper elevation={24} sx={{
        maxWidth: 760, width: "100%", borderRadius: 6, overflow: "hidden",
        background: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(20px)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}>
        {/* Header Superior */}
        <Box sx={{
          background: "linear-gradient(90deg, #2d6a4f 0%, #1b4332 100%)",
          p: { xs: 3, md: 4 }, color: "#fff", display: "flex", alignItems: "center", gap: 2
        }}>
          <ShieldIcon sx={{ fontSize: 44, color: "#52b788" }} />
          <Box>
            <Typography variant="h5" fontWeight={900} letterSpacing={-0.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              VERTOS OS <Chip label="PRO" size="small" sx={{ bgcolor: "#52b788", color: "#1b4332", fontWeight: 900, height: 18, fontSize: 10 }} />
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Configuração Inteligente de Compliance Sanitário (Versão 3.2)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 3, md: 4 } }}>
          {/* Stepper Visual */}
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, "& .MuiStepIcon-root.Mui-active": { color: "#2d6a4f" }, "& .MuiStepIcon-root.Mui-completed": { color: "#52b788" } }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel><Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography></StepLabel>
              </Step>
            ))}
          </Stepper>

          {erro && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 600 }}>
              {erro}
            </Alert>
          )}

          {/* ESTAPA 1: PERFIL DO RT */}
          {activeStep === 0 && (
            <Fade in={activeStep === 0}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#1b4332" mb={0.5}>
                    Identificação do Responsável Técnico (RT)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Insira seus dados profissionais para que o motor regulatório configure seu escopo.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Nome Completo do RT"
                      value={perfil.nomeCompleto}
                      onChange={e => setPerfil(p => ({ ...p, nomeCompleto: e.target.value }))}
                      fullWidth
                      required
                      error={!!perfilErros.nomeCompleto}
                      helperText={perfilErros.nomeCompleto || "Nome que constará nos relatórios técnicos"}
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Número CRMV (Ex: 12345-MS)"
                      value={perfil.numeroCRMV}
                      onChange={handleCrmvChange}
                      fullWidth
                      required
                      error={!!perfilErros.numeroCRMV}
                      helperText={perfilErros.numeroCRMV || "Formato: números, hífen e sigla do estado"}
                      placeholder="12345-MS"
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="UF de Emissão CRMV"
                      value={perfil.ufCRMV}
                      onChange={e => setPerfil(p => ({ ...p, ufCRMV: e.target.value }))}
                      fullWidth
                      required
                      error={!!perfilErros.ufCRMV}
                      helperText={perfilErros.ufCRMV || "Selecione o conselho regional"}
                      InputProps={{ style: { borderRadius: 12 } }}
                    >
                      {ESTADOS_BR.map(uf => (
                        <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Tipo de Estabelecimento Principal"
                      value={perfil.tipoEstabelecimentoPrincipal}
                      onChange={e => setPerfil(p => ({ ...p, tipoEstabelecimentoPrincipal: e.target.value }))}
                      fullWidth
                      required
                      error={!!perfilErros.tipoEstabelecimentoPrincipal}
                      helperText={perfilErros.tipoEstabelecimentoPrincipal || "Com base nesta escolha, criaremos suas obrigações legais"}
                      InputProps={{ style: { borderRadius: 12 } }}
                    >
                      {TIPOS_ESTABELECIMENTO.map(t => (
                        <MenuItem key={t.id} value={t.id}>{t.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {perfil.areaAtuacaoPrincipal && (
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: "rgba(82, 183, 136, 0.05)", border: "1px dashed #52b788" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography fontSize={24}>{currentArea.emoji}</Typography>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={800} color="#1b4332">
                              Área de Atuação Vinculada: {AREAS_ATUACAO.find(a => a.id === perfil.areaAtuacaoPrincipal)?.label || perfil.areaAtuacaoPrincipal}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Regulamentação mapeada automaticamente pelo motor inteligente Vetflow.
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Fade>
          )}

          {/* ETAPA 2: PRIMEIRA CLÍNICA / ESTABELECIMENTO */}
          {activeStep === 1 && (
            <Fade in={activeStep === 1}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#1b4332" mb={0.5}>
                    Dados do Estabelecimento Principal
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cadastre a unidade matriz que você gerenciará. Você poderá adicionar mais filiais posteriormente.
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Nome Fantasia"
                      value={estabelecimento.nomeFantasia}
                      onChange={e => setEstabelecimento(es => ({ ...es, nomeFantasia: e.target.value }))}
                      fullWidth
                      required
                      error={!!estabErros.nomeFantasia}
                      helperText={estabErros.nomeFantasia}
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Razão Social"
                      value={estabelecimento.razaoSocial}
                      onChange={e => setEstabelecimento(es => ({ ...es, razaoSocial: e.target.value }))}
                      fullWidth
                      required
                      error={!!estabErros.razaoSocial}
                      helperText={estabErros.razaoSocial}
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CNPJ"
                      value={estabelecimento.cnpj}
                      onChange={handleCnpjChange}
                      fullWidth
                      required
                      error={!!estabErros.cnpj}
                      helperText={estabErros.cnpj || "Formato: XX.XXX.XXX/XXXX-XX"}
                      placeholder="00.000.000/0000-00"
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Carga Horária Semanal de RT (Horas)"
                      type="number"
                      value={estabelecimento.cargaHorariaSemanal}
                      onChange={e => setEstabelecimento(es => ({ ...es, cargaHorariaSemanal: e.target.value }))}
                      fullWidth
                      required
                      error={!!estabErros.cargaHorariaSemanal}
                      helperText={estabErros.cargaHorariaSemanal || "Máximo recomendado: 40h/semana"}
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Cidade"
                      value={estabelecimento.cidade}
                      onChange={e => setEstabelecimento(es => ({ ...es, cidade: e.target.value }))}
                      fullWidth
                      required
                      error={!!estabErros.cidade}
                      helperText={estabErros.cidade}
                      InputProps={{ style: { borderRadius: 12 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="UF"
                      value={estabelecimento.uf}
                      onChange={e => setEstabelecimento(es => ({ ...es, uf: e.target.value }))}
                      fullWidth
                      required
                      error={!!estabErros.uf}
                      helperText={estabErros.uf}
                      InputProps={{ style: { borderRadius: 12 } }}
                    >
                      {ESTADOS_BR.map(uf => (
                        <MenuItem key={uf} value={uf}>{uf}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* ETAPA 3: REVISÃO, DOCUMENTAÇÃO AI & ATIVAÇÃO */}
          {activeStep === 2 && (
            <Fade in={activeStep === 2}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box align="center" sx={{ mb: 1 }}>
                  <CheckCircleIcon sx={{ fontSize: 60, color: "#52b788", mb: 1 }} />
                  <Typography variant="h5" fontWeight={900} color="#1b4332">
                    Pronto para a Conformidade!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revise seus dados e veja os documentos que a inteligência do Vertos já mapeou para você.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={800} color="#2d6a4f" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <VerifiedUserIcon fontSize="small" /> Resumo do RT
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Nome do Profissional</Typography>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">{perfil.nomeCompleto}</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">CRMV Vinculado</Typography>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">{perfil.numeroCRMV} ({perfil.ufCRMV})</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Tipo e Área Principal</Typography>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">
                              {TIPOS_ESTABELECIMENTO.find(t => t.id === perfil.tipoEstabelecimentoPrincipal)?.label} · {currentArea.label}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ borderRadius: 4, height: "100%" }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={800} color="#2d6a4f" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessIcon fontSize="small" /> Estabelecimento
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Razão Social / Fantasia</Typography>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">
                              {estabelecimento.razaoSocial} / {estabelecimento.nomeFantasia}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">CNPJ</Typography>
                            <Typography variant="body2" fontWeight={700} color="#1b4332">{estabelecimento.cnpj}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Localidade</Typography>
                              <Typography variant="body2" fontWeight={700} color="#1b4332">{estabelecimento.cidade} - {estabelecimento.uf}</Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="caption" color="text.secondary">Carga Horária</Typography>
                              <Typography variant="body2" fontWeight={700} color="#1b4332">{estabelecimento.cargaHorariaSemanal}h/semana</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: "rgba(45, 106, 79, 0.02)" }}>
                      <Typography variant="subtitle1" fontWeight={800} color="#1b4332" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AssignmentTurnedInIcon color="success" /> Obrigações Legais & Documentos Mapeados (IA Claude)
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Com base nas normas vigentes do CFMV, ANVISA e órgãos reguladores, o estabelecimento precisará conter:
                      </Typography>

                      <List dense disablePadding>
                        {currentArea.documentosObrigatorios?.map((doc, idx) => (
                          <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <DescriptionIcon sx={{ color: doc.critico ? "#d32f2f" : "#2d6a4f", fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="body2" fontWeight={700} color="#1b4332">
                                    {doc.nome}
                                  </Typography>
                                  {doc.critico && <Chip label="CRÍTICO" size="small" color="error" sx={{ height: 16, fontSize: 8, fontWeight: 900 }} />}
                                </Stack>
                              }
                              secondary={doc.ref ? `Referência: ${doc.ref}` : "Obrigatório para Auditorias Sanitárias"}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Box sx={{ mt: 2.5, p: 1.5, bgcolor: "#fff", borderRadius: 3, border: "1px solid #e0e0e0" }}>
                        <Typography variant="caption" fontWeight={700} color="#2d6a4f" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                          <ShieldIcon sx={{ fontSize: 14 }} /> Regulamentação Mapeada:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mt: 1 }}>
                          {currentArea.regulamentacoes?.map((reg, i) => (
                            <Chip key={i} label={reg} size="small" sx={{ bgcolor: "#e8f5e9", color: "#1b4332", fontWeight: 700, fontSize: 10 }} />
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* AÇÕES DOS BOTÕES */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              sx={{
                borderRadius: 3, textTransform: "none", fontWeight: 700, borderColor: "#1b4332", color: "#1b4332",
                "&:hover": { borderColor: "#2d6a4f", bgcolor: "rgba(27,67,50,0.05)" }
              }}
            >
              ← Voltar
            </Button>

            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{
                  borderRadius: 3, textTransform: "none", fontWeight: 700, bgcolor: "#1b4332",
                  "&:hover": { bgcolor: "#2d6a4f" }
                }}
              >
                Próximo passo →
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleFinalizar}
                disabled={loading}
                sx={{
                  borderRadius: 3, textTransform: "none", fontWeight: 700, bgcolor: "#2d6a4f",
                  "&:hover": { bgcolor: "#1b4332" }, px: 4
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Finalizar e Ativar Cockpit! 🚀"}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
