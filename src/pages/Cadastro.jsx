import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  InputAdornment, IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvarUsuario = async (uid, emailVal, displayName) => {
    await setDoc(doc(db, "users", uid), {
      email: emailVal,
      displayName,
      plan: "pending",
      createdAt: serverTimestamp(),
    });
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) { setErro("A senha deve ter ao menos 6 caracteres."); return; }
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, senha);
      await updateProfile(result.user, { displayName: nome });
      await salvarUsuario(result.user.uid, email, nome);
      navigate("/pagamento");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setErro("Este e-mail já está cadastrado.");
      else setErro("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErro("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await salvarUsuario(result.user.uid, result.user.email, result.user.displayName);
      navigate("/pagamento");
    } catch (err) {
      setErro("Erro ao cadastrar com Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #52b788 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 420, borderRadius: 4, p: { xs: 3, md: 5 } }}>
        <Box textAlign="center" mb={4}>
          <img 
            src="/logo-verde.png" 
            alt="VERTOS Logo" 
            style={{ width: "200px", height: "auto" }} 
          />
          <Typography variant="body2" color="text.secondary" fontWeight={600} mt={1} sx={{ opacity: 0.8 }}>
            Crie sua conta no VERTOS OS
          </Typography>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>}

        <form onSubmit={handleCadastro}>
          <TextField
            id="cadastro-nome"
            label="Nome completo"
            fullWidth value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#90a4ae" }} /></InputAdornment> }}
          />
          <TextField
            id="cadastro-email"
            label="E-mail"
            type="email"
            fullWidth value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#90a4ae" }} /></InputAdornment> }}
          />
          <TextField
            id="cadastro-senha"
            label="Senha (mín. 6 caracteres)"
            type={showSenha ? "text" : "password"}
            fullWidth value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#90a4ae" }} /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowSenha(!showSenha)} edge="end">
                    {showSenha ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            id="btn-cadastrar"
            type="submit"
            variant="contained"
            fullWidth size="large"
            disabled={loading}
            sx={{ background: "#1b4332", color: "#fff", borderRadius: 3, py: 1.5, fontWeight: 700, mb: 2, "&:hover": { background: "#2d6a4f" } }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Criar Conta"}
          </Button>
        </form>

        <Button
          id="btn-google-cadastro"
          variant="outlined"
          fullWidth size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogle}
          disabled={loading}
          sx={{ borderColor: "#ddd", color: "#555", borderRadius: 3, py: 1.3, fontWeight: 600, mb: 3, "&:hover": { borderColor: "#1b4332", color: "#1b4332" } }}
        >
          Continuar com Google
        </Button>

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "#1b4332", fontWeight: 700, textDecoration: "none" }}>Entrar</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
