import React, { useContext } from "react";
import { MenuItem, Select, Box, Typography, Chip } from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { UserContext } from "./ProtectedRoute";

export default function ClinicaSelector() {
  const { userData, setUserData } = useContext(UserContext);
  
  if (!userData?.clinicas?.length) return null;

  const trocarClinica = async (novoId) => {
    try {
      // Persiste a escolha no perfil do RT para futuras sessões
      await updateDoc(doc(db, "users", userData.uid), {
        selectedClinicaId: novoId
      });
      
      const clinicaData = userData.clinicas.find(c => c.id === novoId);
      
      // Atualiza o estado global para disparar o re-fetch de dados em todos os componentes
      setUserData(prev => ({ 
        ...prev, 
        selectedClinicaId: novoId, 
        clinicaData 
      }));
    } catch (err) {
      console.error("Erro ao trocar de unidade:", err);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: { xs: "none", sm: "block" } }}>
        UNIDADE ATIVA:
      </Typography>
      <Select
        size="small"
        value={userData.selectedClinicaId || ""}
        onChange={(e) => trocarClinica(e.target.value)}
        sx={{ 
          fontSize: 12, 
          fontWeight: 700, 
          minWidth: 150,
          height: 32,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.03)",
          "& .MuiSelect-select": { py: 0.5 }
        }}
      >
        {userData.clinicas.map(c => (
          <MenuItem key={c.id} value={c.id} sx={{ fontSize: 13 }}>
            {c.nomeFantasia || c.nome || "Unidade sem Nome"}
            {c.id === userData.selectedClinicaId && (
              <Chip 
                label="ATIVA" 
                color="primary" 
                size="small" 
                sx={{ ml: 1, height: 16, fontSize: 9, fontWeight: 900 }} 
              />
            )}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
