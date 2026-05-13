// src/contexts/AuthContext.jsx
// ================================================================
// Contexto de autenticação — fornece user, userData (com plan)
// para todo o app. Substitui o contexto existente.
// ================================================================
import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(undefined); // undefined = carregando
  const [userData, setUserData] = useState(null);       // doc users/{uid}

  useEffect(() => {
    // Observa mudanças de autenticação
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setUserData(null);
        return;
      }

      // Observa o documento do usuário em tempo real
      // → qualquer mudança no campo "plan" (ex: webhook PagSeguro) reflete instantaneamente
      const unsubDoc = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (snap) => {
          if (snap.exists()) {
            setUserData(snap.data());
          } else {
            setUserData({ plan: "pending" });
          }
        },
        (error) => {
          console.error("Erro ao ouvir userData:", error);
          setUserData({ plan: "pending" });
        }
      );

      return () => unsubDoc();
    });

    return () => unsubAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData }}>
      {children}
    </AuthContext.Provider>
  );
}
