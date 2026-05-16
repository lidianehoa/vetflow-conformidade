import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Stepper, Step, StepLabel, Button,
  TextField, MenuItem, CircularProgress, Alert, Chip
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";

const TIPOS = [
  "Clínica Veterinária", "Hospital Veterinário", "Pet Shop",
  "Clínica e Pet Shop", "Banho e Tosa", "Consultório Veterinário"
];

const ESPECIALIDADES = [
  "Pequenos Animais", "Grandes Animais", "Exóticos",
  "Oncologia", "Dermatologia", "Cardiologia", "Cirurgia"
];

const STEPS = ["Seu perfil", "Primeira clínica", "Tudo pronto"];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [perfil, setPerfil] = useState({ nome: "", crmv: "" });
  const [clinica, setClinica] = useState({
    nomeFantasia: "", tipo: "", cidade: "", uf: "MS", especialidades: []
  });

  const toggleEspecialidade = (esp) => {
    setClinica(prev => ({
      ...prev,
      especialidades: prev.especialidades.includes(esp)
        ? prev.especialidades.filter(e => e !== esp)
        : [...prev.especialidades, esp]
    }));
  };

  const salvarPerfil = async () => {
    if (!perfil.nome.trim()) return setErro("Informe seu nome.");
    setErro("");
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        rtNome: perfil.nome,
        crmv: perfil.crmv,
        onboardingStep: 1,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setStep(1);
    } catch (err) { 
      console.error(err);
      setErro("Erro ao salvar. Tente novamente."); 
    }
    finally { setLoading(false); }
  };

  const salvarClinica = async () => {
    if (!clinica.nomeFantasia.trim() || !clinica.tipo) {
      return setErro("Preencha nome e tipo da clínica.");
    }
    setErro("");
    setLoading(true);
    try {
      // Cria a clínica com tenantId
      const ref = await addDoc(collection(db, "clinicas"), {
        ...clinica,
        tenantId: user.uid,       // ← chave do multi-tenant
        userId: user.uid,         // retrocompatibilidade
        rtNome: perfil.nome || "Responsável Técnico",
        rtCrmv: perfil.crmv || "",
        criadoEm: serverTimestamp(),
      });

      // Atualiza perfil do RT com a clínica criada e onboarding completo
      await setDoc(doc(db, "users", user.uid), {
        selectedClinicaId: ref.id,
        onboardingCompleto: true,
        onboardingStep: 2,
        especialidades: clinica.especialidades,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setStep(2);
    } catch (err) { 
      console.error(err);
      setErro("Erro ao salvar clínica. Tente novamente."); 
    }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #f0fdf4 0%, #e8f5e9 100%)", p: 3
    }}>
      <Box sx={{ maxWidth: 520, width: "100%" }}>

        {/* Logo / header */}
        <Box textAlign="center" mb={4}>
          <VerifiedUserIcon sx={{ fontSize: 48, color: "#1b4332" }} />
          <Typography variant="h5" fontWeight={900} color="#1b4332" mt={1}>
            Bem-vindo ao VERTOS OS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure sua conta em 2 minutos
          </Typography>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {erro && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>}

        {/* Step 0 — Perfil do RT */}
        {step === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332">
              Seus dados profissionais
            </Typography>
            <TextField
              label="Nome completo"
              value={perfil.nome}
              onChange={e => setPerfil(p => ({ ...p, nome: e.target.value }))}
              fullWidth required
            />
            <TextField
              label="CRMV (ex: MS-12345)"
              value={perfil.crmv}
              onChange={e => setPerfil(p => ({ ...p, crmv: e.target.value }))}
              fullWidth
              helperText="Opcional, mas recomendado para relatórios"
            />
            <Button
              variant="contained" fullWidth size="large"
              onClick={salvarPerfil} disabled={loading}
              sx={{ bgcolor: "#1b4332", borderRadius: 3, fontWeight: 800, mt: 1 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Continuar →"}
            </Button>
          </Box>
        )}

        {/* Step 1 — Primeira clínica */}
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332">
              Cadastre sua primeira unidade
            </Typography>
            <TextField
              label="Nome fantasia"
              value={clinica.nomeFantasia}
              onChange={e => setClinica(c => ({ ...c, nomeFantasia: e.target.value }))}
              fullWidth required
            />
            <TextField
              select label="Tipo de estabelecimento"
              value={clinica.tipo}
              onChange={e => setClinica(c => ({ ...c, tipo: e.target.value }))}
              fullWidth required
            >
              {TIPOS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Cidade" fullWidth
                value={clinica.cidade}
                onChange={e => setClinica(c => ({ ...c, cidade: e.target.value }))}
              />
              <TextField
                label="UF" sx={{ width: 100 }}
                value={clinica.uf}
                onChange={e => setClinica(c => ({ ...c, uf: e.target.value.toUpperCase().slice(0,2) }))}
              />
            </Box>

            <Typography variant="body2" fontWeight={700} color="#1b4332" mt={1}>
              Especialidades (opcional)
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {ESPECIALIDADES.map(esp => (
                <Chip
                  key={esp} label={esp} clickable
                  onClick={() => toggleEspecialidade(esp)}
                  color={clinica.especialidades.includes(esp) ? "success" : "default"}
                  sx={{ fontWeight: 700, fontSize: 12 }}
                />
              ))}
            </Box>

            <Button
              variant="contained" fullWidth size="large"
              onClick={salvarClinica} disabled={loading}
              sx={{ bgcolor: "#1b4332", borderRadius: 3, fontWeight: 800, mt: 1 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Finalizar configuração →"}
            </Button>
          </Box>
        )}

        {/* Step 2 — Concluído */}
        {step === 2 && (
          <Box textAlign="center">
            <Typography fontSize={64}>🎉</Typography>
            <Typography variant="h5" fontWeight={900} color="#1b4332" mt={2}>
              Tudo pronto!
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1} mb={4}>
              Sua conta e primeira unidade estão configuradas.
              Vamos ao painel de comando.
            </Typography>
            <Button
              variant="contained" fullWidth size="large"
              onClick={() => navigate("/dashboard")}
              sx={{ bgcolor: "#1b4332", borderRadius: 3, fontWeight: 800 }}
            >
              Entrar no VERTOS OS →
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
