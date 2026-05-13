import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";

const UserDataContext = createContext(null);

export function useUserData() {
  return useContext(UserDataContext);
}

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedClinicaId, setSelectedClinicaId] = useState(() => localStorage.getItem("selectedClinicaId"));
  const location = useLocation();

  useEffect(() => {
    if (selectedClinicaId) {
      localStorage.setItem("selectedClinicaId", selectedClinicaId);
    } else {
      localStorage.removeItem("selectedClinicaId");
    }
  }, [selectedClinicaId]);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setUserData({ uid: user.uid, email: user.email, ...snap.data() });
        } else {
          setUserData({ uid: user.uid, email: user.email, plan: "pending" });
        }
      })
      .catch(() => {
        setUserData({ uid: user.uid, email: user.email, plan: "pending" });
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  if (authLoading || dataLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0fdf4" }}>
        <CircularProgress sx={{ color: "#1b4332" }} size={48} />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userData?.plan === "expired" && location.pathname !== "/pagamento") {
    return <Navigate to="/pagamento" replace />;
  }

  if (userData?.plan === "pending" && location.pathname !== "/perfil") {
    return <Navigate to="/perfil" replace />;
  }

  const contextValue = {
    ...userData,
    selectedClinicaId,
    setSelectedClinicaId
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}
