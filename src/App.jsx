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
import HubAuditoria from "./pages/HubAuditoria";
import HubDocumentacao from "./pages/HubDocumentacao";

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
            <Route path="/dashboard"       element={<Dashboard />} />
            
            {/* Hubs */}
            <Route path="/auditorias"      element={<HubAuditoria />} />
            <Route path="/auditorias/nova" element={<HubAuditoria />} />
            <Route path="/documentacao"    element={<HubDocumentacao />} />

            {/* Sub-páginas de formulários/edição (Full Screen) */}
            <Route path="/documentos/gerar/:id"      element={<GerarDocumento />} />
            <Route path="/planilhas/editar/:id"      element={<EditarPlanilha />} />
            <Route path="/laudos/emitir/:tipoId"     element={<GerarLaudo />} />
            <Route path="/laudos/gerar/:id"          element={<GerarLaudo />} />
            <Route path="/relatorios-crmv/gerar/:id" element={<GeradorRelatorioCRMV />} />

            {/* Redirects para compatibilidade */}
            <Route path="/trilha-auditoria"  element={<Navigate to="/auditorias" replace />} />
            <Route path="/conquistas"        element={<Navigate to="/perfil" replace />} />
            <Route path="/documentos"        element={<Navigate to="/documentacao" replace />} />
            <Route path="/planilhas"         element={<Navigate to="/documentacao" replace />} />
            <Route path="/laudos"            element={<Navigate to="/documentacao" replace />} />
            <Route path="/relatorios-crmv"   element={<Navigate to="/documentacao" replace />} />

            <Route path="/perfil"          element={<Perfil />} />
            <Route path="/controlados"     element={<Controlados />} />
            <Route path="/rotina"          element={<RotinaDiaria />} />
            <Route path="/clinicas/nova"   element={<NovaClinica />} />
            <Route path="/clinicas/:clinicaId" element={<DetalheClinica />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
