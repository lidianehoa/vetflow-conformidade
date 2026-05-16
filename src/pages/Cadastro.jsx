import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Checkbox,
  FormControlLabel, Alert, CircularProgress, Divider, Link
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleCadastro = async () => {
    if (!termos) return setErro("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
    if (!form.email || !form.senha) return setErro("Preencha e-mail e senha.");
    setErro("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      
      // Salva consentimento com timestamp e metadados (LGPD Art. 7 e 9)
      await setDoc(doc(db, "users", cred.user.uid), {
        email: form.email,
        plan: "free",
        role: "owner",
        onboardingCompleto: false,
        lgpd: {
          termosAceitos: true,
          aceitoEm: serverTimestamp(),
          versaoTermos: "1.0",
          versaoPrivacidade: "1.0",
          userAgent: navigator.userAgent,
        },
        criadoEm: serverTimestamp(),
      });
      
      navigate("/onboarding");
    } catch (err) {
      const msgs = {
        "auth/email-already-in-use": "Este e-mail já está cadastrado.",
        "auth/weak-password": "Senha muito fraca. Use ao menos 6 caracteres.",
        "auth/invalid-email": "E-mail inválido.",
      };
      setErro(msgs[err.code] || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(160deg, #f0fdf4 0%, #e8f5e9 100%)",
      p: 3 
    }}>
      <Box sx={{ 
        maxWidth: 420, 
        width: "100%", 
        bgcolor: "#fff", 
        p: 4, 
        borderRadius: 4, 
        boxShadow: "0 10px 40px rgba(27,67,50,0.08)" 
      }}>
        <Typography variant="h5" fontWeight={900} color="#1b4332" mb={1}>
          Criar conta no VERTOS OS
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Inicie sua jornada de compliance veterinário
        </Typography>

        {erro && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="E-mail profissional" type="email" fullWidth
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <TextField
            label="Senha" type="password" fullWidth
            value={form.senha}
            onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
          />

          <Divider sx={{ my: 1 }} />

          {/* Aceite LGPD */}
          <FormControlLabel
            control={
              <Checkbox
                checked={termos}
                onChange={e => setTermos(e.target.checked)}
                sx={{ color: "#1b4332", "&.Mui-checked": { color: "#1b4332" } }}
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                Li e aceito os{" "}
                <Link href="/termos" target="_blank" color="#1b4332" fontWeight={700}>
                  Termos de Uso
                </Link>
                {" "}e a{" "}
                <Link href="/privacidade" target="_blank" color="#1b4332" fontWeight={700}>
                  Política de Privacidade
                </Link>
                , incluindo o tratamento de dados para fins de compliance sanitário
                veterinário conforme a LGPD (Lei 13.709/2018).
              </Typography>
            }
            sx={{ alignItems: "flex-start", mt: 1 }}
          />

          <Button
            variant="contained" fullWidth size="large"
            onClick={handleCadastro} disabled={loading || !termos}
            sx={{ bgcolor: "#1b4332", borderRadius: 3, fontWeight: 800, mt: 1, height: 48 }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Criar conta e Iniciar"}
          </Button>

          <Button 
            variant="text" 
            fullWidth 
            onClick={() => navigate("/login")}
            sx={{ color: "#1b4332", fontSize: 13, fontWeight: 600 }}
          >
            Já tem uma conta? Entrar
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
