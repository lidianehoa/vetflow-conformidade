import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, Button, Divider,
  InputAdornment, IconButton, Alert, CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleEmail = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/");
    } catch (err) {
      setErro("E-mail ou senha incorretos.");
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
      const uid = result.user.uid;
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists() || !snap.data().plan) {
        await setDoc(doc(db, "users", uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          plan: "pending",
          createdAt: serverTimestamp(),
        }, { merge: true });
        navigate("/pagamento");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErro("Erro ao entrar com Google.");
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
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          background: "#fff",
        }}
      >
        <Box textAlign="center" mb={4}>
          <img 
            src="/logo-verde.png" 
            alt="VERTOS Logo" 
            style={{ width: "220px", height: "auto" }} 
          />
          <Typography variant="body2" color="text.secondary" fontWeight={600} mt={1} sx={{ opacity: 0.8 }}>
            Veterinary RT Operating System
          </Typography>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>}

        <form onSubmit={handleEmail}>
          <TextField
            id="login-email"
            label="E-mail"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#90a4ae" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            id="login-senha"
            label="Senha"
            type={showSenha ? "text" : "password"}
            fullWidth
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#90a4ae" }} />
                </InputAdornment>
              ),
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
            id="btn-entrar"
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              background: "#1b4332",
              color: "#fff",
              borderRadius: 3,
              py: 1.5,
              fontWeight: 700,
              mb: 2,
              "&:hover": { background: "#2d6a4f" },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Entrar"}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">ou</Typography>
        </Divider>

        <Button
          id="btn-google"
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogle}
          disabled={loading}
          sx={{
            borderColor: "#ddd",
            color: "#555",
            borderRadius: 3,
            py: 1.3,
            fontWeight: 600,
            mb: 3,
            "&:hover": { borderColor: "#1b4332", color: "#1b4332" },
          }}
        >
          Entrar com Google
        </Button>

        <Typography variant="body2" textAlign="center" color="text.secondary">
          Não tem conta?{" "}
          <Link to="/cadastro" style={{ color: "#1b4332", fontWeight: 700, textDecoration: "none" }}>
            Cadastre-se
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
