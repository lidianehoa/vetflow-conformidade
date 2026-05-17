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
import VisualizadorAuditoria from "./pages/VisualizadorAuditoria";
import Auditorias from "./pages/Auditorias";
import Onboarding from "./pages/Onboarding";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";

// Layout & guards
import Layout         from "./components/Layout";
import ProtectedRoute, { UserProvider, useUserData } from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

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

/**
 * Componente que verifica se o onboarding foi concluído
 * Redireciona para /onboarding se faltarem dados básicos
 */
function RequireOnboarding({ children }) {
  const userData = useUserData();
  
  if (!userData) return null; // ainda carregando ou não logado
  
  if (userData.role !== "admin" && !userData.onboardingCompleto) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Routes>
              {/* ... rotas ... */}
              <Route path="/login"    element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/privacidade" element={<Privacidade />} />

              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pagamento"
                element={
                  <ProtectedRoute>
                    <Pagamento />
                  </ProtectedRoute>
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <RequireOnboarding>
                      <Layout />
                    </RequireOnboarding>
                  </ProtectedRoute>
                }
              >
                <Route index element={<CentralRT />} />
                <Route path="/central-rt"      element={<CentralRT />} />
                <Route path="/clinicas"        element={<CentralRT />} />
                <Route path="/clinicas/nova"   element={<NovaClinica />} />
                <Route path="/dashboard"       element={<Dashboard />} />
                
                <Route path="/auditorias"      element={<Auditorias />} />
                <Route path="/auditorias/nova" element={<NovaAuditoria />} />
                <Route path="/auditorias/visualizar/:id" element={<VisualizadorAuditoria />} />
                <Route path="/documentacao"    element={<HubDocumentacao />} />

                <Route path="/documentos/gerar/:id"      element={<GerarDocumento />} />
                <Route path="/planilhas/editar/:id"      element={<EditarPlanilha />} />
                <Route path="/laudos/emitir/:tipoId"     element={<GerarLaudo />} />
                <Route path="/laudos/gerar/:id"          element={<GerarLaudo />} />
                <Route path="/relatorios-crmv/gerar/:id" element={<GeradorRelatorioCRMV />} />

                <Route path="/trilha-auditoria"  element={<Navigate to="/auditorias" replace />} />
                <Route path="/conquistas"        element={<Navigate to="/perfil" state={{ aba: 2 }} replace />} />
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

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}
