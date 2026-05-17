import React, { useState, useEffect, createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, writeBatch, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Box, CircularProgress } from "@mui/material";

async function processarPagamentoPendente(uid, email) {
  if (!uid || !email) return;
  try {
    const snap = await getDocs(
      query(collection(db, "pagamentosPendentes"), where("email", "==", email.toLowerCase()))
    );
    if (snap.empty) return;

    const pagamento = snap.docs[0];
    const { plano, duracaoDias, pedidoId } = pagamento.data();

    const agora = new Date();
    const expira = new Date(agora);
    if (duracaoDias) expira.setDate(expira.getDate() + duracaoDias);

    const updatePayload = {
      plano,
      planoAtivadoEm: Timestamp.fromDate(agora),
      planoExpiraEm: duracaoDias ? Timestamp.fromDate(expira) : null,
      hotmartPedidoId: pedidoId,
      passConvertido: false,
      plan: plano,
    };

    const batch = writeBatch(db);
    batch.set(doc(db, "users", uid), updatePayload, { merge: true });
    batch.set(doc(db, "usuarios", uid), updatePayload, { merge: true });
    batch.delete(pagamento.ref);
    await batch.commit();
    console.warn(`[Pending Payment] Processed payment for ${email} and updated profile for ${uid}`);
  } catch (err) {
    console.error("🔥 ERRO AO PROCESSAR PAGAMENTO PENDENTE NO LOGIN:", err);
  }
}

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
        // Process pending payments first (e.g. user bought prepaid PASS before creating account)
        await processarPagamentoPendente(user.uid, user.email);

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
