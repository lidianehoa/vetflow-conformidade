// ============================================================
// ProtectedRoute.jsx  (substitui o componente `ri` no App)
//
// O que mudou em relação ao original:
//  - Antes: só verificava plan === "pending" → /pagamento
//  - Agora: também passa `userData` e `planoInfo` via Context
//    para que qualquer filho possa chamar usePlano(userData)
//
// COMO INTEGRAR:
//   No arquivo principal do router (onde estão os <Route>),
//   substitua `ri` por `ProtectedRoute` e envolva com o
//   UserDataContext.Provider já incluído aqui.
//
//   Exemplo (suas rotas atuais usam `ri`):
//     y.jsx(vs, { path:"/checklist", element: y.jsx(ri, { children: ... }) })
//
//   Troque ri por ProtectedRoute:
//     <Route path="/checklist" element={<ProtectedRoute><Layout><ChecklistMensal /></Layout></ProtectedRoute>} />
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { Box } from "@mui/material";

// Importe suas instâncias existentes do Firebase
// Ajuste o caminho conforme sua estrutura de projeto:
import { db } from "../firebase";       // instância do Firestore
import { useAuth } from "../hooks/useAuth"; // seu hook de auth (exporta { user, loading })
import logoVetFlow from "../assets/logo.png"; // logo existente

// ─── Context ────────────────────────────────────────────────
// Permite que qualquer componente filho acesse userData sem prop drilling
export const UserDataContext = createContext(null);
export const useUserData = () => useContext(UserDataContext);

// ─── Loading ────────────────────────────────────────────────
function LoadingLogo() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        "@keyframes pulse": {
          "0%":   { transform: "scale(1)",   opacity: 0.7 },
          "50%":  { transform: "scale(1.1)", opacity: 1   },
          "100%": { transform: "scale(1)",   opacity: 0.7 },
        },
      }}
    >
      <img
        src={logoVetFlow}
        alt="VetFlow Logo"
        width={150}
        style={{ animation: "pulse 2s infinite" }}
      />
    </Box>
  );
}

// ─── ProtectedRoute ─────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [profileLoaded, setProfileLoaded] = useState(false);
  const [userData, setUserData]           = useState(null);

  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        const ref  = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfileLoaded(true);
          setUserData(snap.data());
        } else {
          setProfileLoaded(false);
        }
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setProfileLoaded(false);
      }
    })();
  }, [user, loading]);

  // Ainda carregando auth
  if (loading) return <LoadingLogo />;

  // Não autenticado
  if (!user) return <Navigate to="/login" replace />;

  // Aguardando perfil do Firestore
  if (!profileLoaded && userData === null) return <LoadingLogo />;

  // Perfil não encontrado (cadastro incompleto)
  if (!profileLoaded) return <Navigate to="/cadastro" replace />;

  const plan = userData?.plan ?? "freemium";

  // Sem plano → vai pagar
  if (plan === "pending" && location.pathname !== "/pagamento") {
    return <Navigate to="/pagamento" replace />;
  }

  // Já pagou → sai da tela de pagamento
  if (plan !== "pending" && location.pathname === "/pagamento") {
    return <Navigate to="/" replace />;
  }

  // Tudo ok → passa userData via context
  return (
    <UserDataContext.Provider value={userData}>
      {children}
    </UserDataContext.Provider>
  );
}
