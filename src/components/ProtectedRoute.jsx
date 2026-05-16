import React, { useState, useEffect, createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Box, CircularProgress } from "@mui/material";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.warn("🌐 UserProvider montado. Status atual:", { loading, hasUser: !!userData });

  useEffect(() => {
    console.warn("🎬 Iniciando onAuthStateChanged...");
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      console.warn("🔐 Firebase Auth:", user ? user.email : "nenhum usuário");
      
      if (!user) { 
        setUserData(null); 
        setLoading(false); 
        return; 
      }

      // Se tem usuário, garante que o loading continue true até carregar o Firestore
      setLoading(true); 

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const profile = snap.data() || {};

        // Busca todas as clínicas do RT (tenant)
        const clinicasSnap = await getDocs(
          query(collection(db, "clinicas"), where("tenantId", "==", user.uid))
        );
        const clinicas = clinicasSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Clínica ativa: a salva no perfil ou a primeira disponível
        const selectedId = profile.selectedClinicaId || clinicas[0]?.id || null;
        const clinicaData = clinicas.find(c => c.id === selectedId) || null;

        if (isMounted) {
          setUserData({
            uid: user.uid,
            email: user.email,
            ...profile, // Inclui todos os campos do documento (rtNome, crmv, etc)
            role: profile.role || "rt",
            plan: profile.plan || "free",
            onboardingCompleto: profile.onboardingCompleto || false,
            especialidades: profile.especialidades || [],
            clinicas,
            selectedClinicaId: selectedId,
            clinicaData,
          });
          console.warn("✅ Dados sincronizados para:", user.email);
        }
      } catch (err) {
        console.error("🔥 ERRO NO USERPROVIDER:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    });
    
    // Timeout de segurança: se em 10 segundos nada acontecer, para o loading
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(prev => {
          if (prev) console.warn("⏳ Timeout de segurança atingido no UserProvider");
          return false;
        });
      }
    }, 10000);

    return () => { 
      isMounted = false; 
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  return (
    <UserContext.Provider value={{ userData, loading, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserContext);
  if (!context) return null;
  return context.userData;
}

export default function ProtectedRoute({ children }) {
  const context = useContext(UserContext);
  const location = useLocation();

  if (context?.loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!context?.userData) {
    console.warn("🚫 Sem userData, expulsando para /login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
