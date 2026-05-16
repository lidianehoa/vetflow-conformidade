import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportIcon from "@mui/icons-material/BugReport";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Loga no console em desenvolvimento
    console.error("ErrorBoundary capturou:", error, errorInfo);

    // Monitoramento proativo: Envia o erro para o Firestore para análise da equipe técnica
    try {
      addDoc(collection(db, "erros_app"), {
        mensagem: error?.message || "Erro desconhecido",
        stack: error?.stack?.slice(0, 1000) || "",
        componentStack: errorInfo?.componentStack?.slice(0, 1000) || "",
        url: window.location.href,
        userAgent: navigator.userAgent,
        criadoEm: serverTimestamp(),
      }).catch((err) => console.error("Falha ao salvar log de erro:", err));
    } catch (e) {
      console.error("Erro ao tentar disparar log proativo:", e);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = import.meta.env.DEV;
    const mensagem = this.state.error?.message || "Erro inesperado";

    return (
      <Box sx={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(160deg, #f0fdf4 0%, #e8f5e9 100%)",
        p: 3,
      }}>
        <Paper elevation={0} sx={{
          maxWidth: 480, width: "100%",
          border: "1.5px solid #e0e0e0", borderRadius: 4, p: 5,
          textAlign: "center",
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 56, color: "#d32f2f", mb: 2 }} />

          <Typography variant="h5" fontWeight={900} color="#1b4332" gutterBottom>
            Algo deu errado
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4} lineHeight={1.8}>
            Ocorreu um erro inesperado no VERTOS OS. Seus dados estão seguros.
            Tente recarregar a página ou voltar ao painel de comando.
          </Typography>

          {/* Detalhes técnicos visíveis apenas em ambiente de desenvolvimento */}
          {isDev && (
            <Paper variant="outlined" sx={{
              p: 2, mb: 3, borderRadius: 2, bgcolor: "#fff8f1",
              borderColor: "#ffe0b2", textAlign: "left",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <BugReportIcon sx={{ fontSize: 16, color: "#e65100" }} />
                <Typography variant="caption" fontWeight={700} color="#e65100">
                  DEBUG INFO (Visível apenas em DEV)
                </Typography>
              </Box>
              <Typography variant="caption" sx={{
                fontFamily: "monospace", color: "#555",
                display: "block", wordBreak: "break-word",
              }}>
                {mensagem}
              </Typography>
            </Paper>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{ borderColor: "#1b4332", color: "#1b4332", borderRadius: 3, fontWeight: 700 }}
            >
              Recarregar
            </Button>
            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{ bgcolor: "#1b4332", borderRadius: 3, fontWeight: 700 }}
            >
              Voltar ao painel
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" mt={4}>
            Se o problema persistir, informe nossa equipe técnica:{" "}
            <a href="mailto:contato@vetflow.app.br" style={{ color: "#1b4332", fontWeight: 700 }}>
              contato@vetflow.app.br
            </a>
          </Typography>
        </Paper>
      </Box>
    );
  }
}

export default ErrorBoundary;
