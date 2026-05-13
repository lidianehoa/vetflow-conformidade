import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

// Pages
import Login         from "./pages/Login";
import Cadastro      from "./pages/Cadastro";
import Pagamento     from "./pages/Pagamento";
import CentralRT      from "./pages/CentralRT";
import NovaClinica    from "./pages/NovaClinica";
import DetalheClinica from "./pages/DetalheClinica";
import Dashboard     from "./pages/Dashboard";
import NovaAuditoria from "./pages/NovaAuditoria";
import RelatoriosCRMV  from "./pages/RelatoriosCRMV";
import GeradorRelatorioCRMV from "./pages/GeradorRelatorioCRMV";
import Documentos    from "./pages/Documentos";
import GerarDocumento from "./pages/GerarDocumento";
import Planilhas     from "./pages/Planilhas";
import EditarPlanilha from "./pages/EditarPlanilha";
import Perfil        from "./pages/Perfil";
import Controlados   from "./pages/Controlados";
import Laudos        from "./pages/Laudos";
import NovaLaudoSelecao from "./pages/NovaLaudoSelecao";
import GerarLaudo    from "./pages/GerarLaudo";
import RotinaDiaria  from "./pages/RotinaDiaria";
import TrilhaAuditoria from "./pages/TrilhaAuditoria";
import Conquistas from "./pages/Conquistas";

// Layout & guards
import Layout         from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const theme = createTheme({
  palette: {
    primary:   { main: "#1b4332" },
    secondary: { main: "#52b788" },
    background: { default: "#f0fdf4" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rota de pagamento — precisa de auth mas não de plano */}
          <Route
            path="/pagamento"
            element={
              <ProtectedRoute>
                <Pagamento />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas com layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CentralRT />} />
            <Route path="/central-rt"      element={<CentralRT />} />
            <Route path="/clinicas/nova"   element={<NovaClinica />} />
            <Route path="/clinicas/:clinicaId" element={<DetalheClinica />} />
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/trilha-auditoria" element={<TrilhaAuditoria />} />
            <Route path="/conquistas"       element={<Conquistas />} />
            <Route path="/auditorias/nova" element={<NovaAuditoria />} />
            <Route path="/relatorios-crmv" element={<RelatoriosCRMV />} />
            <Route path="/relatorios-crmv/gerar/:id" element={<GeradorRelatorioCRMV />} />
            <Route path="/documentos"      element={<Documentos />} />
            <Route path="/documentos/gerar/:id" element={<GerarDocumento />} />
            <Route path="/planilhas"       element={<Planilhas />} />
            <Route path="/planilhas/editar/:id" element={<EditarPlanilha />} />
            <Route path="/perfil"          element={<Perfil />} />
            <Route path="/controlados"     element={<Controlados />} />
            <Route path="/laudos"          element={<Laudos />} />
            <Route path="/laudos/novo"     element={<NovaLaudoSelecao />} />
            <Route path="/laudos/emitir/:tipoId" element={<GerarLaudo />} />
            <Route path="/laudos/gerar/:id" element={<GerarLaudo />} />
            <Route path="/rotina"          element={<RotinaDiaria />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
