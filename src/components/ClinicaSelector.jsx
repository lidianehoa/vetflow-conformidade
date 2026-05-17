import React, { useContext, useState } from "react";
import { 
  MenuItem, Select, Box, Typography, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Stack, CircularProgress, Divider 
} from "@mui/material";
import { doc, updateDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { UserContext } from "./ProtectedRoute";
import { CHECKLISTS_POR_TIPO } from "../data/checklistsRT";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

export default function ClinicaSelector() {
  const { userData, setUserData } = useContext(UserContext);
  const [openModal, setOpenModal] = useState(false);
  const [tempId, setTempId] = useState("");
  const [selectedClinica, setSelectedClinica] = useState(null);
  const [pendingAudits, setPendingAudits] = useState(0);
  const [loadingStats, setLoadingStats] = useState(false);

  if (!userData?.clinicas?.length) return null;

  const handleSelectChange = async (novoId) => {
    if (novoId === userData.selectedClinicaId) return;

    const clinica = userData.clinicas.find(c => c.id === novoId);
    if (!clinica) return;

    setTempId(novoId);
    setSelectedClinica(clinica);
    setOpenModal(true);
    setLoadingStats(true);

    try {
      // Calcular auditorias pendentes para o modal de confirmação
      const checklistsObrigatorios = CHECKLISTS_POR_TIPO[clinica.tipo] || [];
      
      const q = query(
        collection(db, "auditorias"),
        where("clinicaId", "==", novoId)
      );
      const snap = await getDocs(q);
      
      const checklistIdsAuditados = snap.docs.map(d => d.data().checklistId || d.data().smartId || "");
      const pendentesCount = checklistsObrigatorios.filter(id => !checklistIdsAuditados.includes(id)).length;
      
      setPendingAudits(pendentesCount);
    } catch (err) {
      console.error("Erro ao calcular auditorias pendentes:", err);
      setPendingAudits(0);
    } finally {
      setLoadingStats(false);
    }
  };

  const confirmarTroca = async () => {
    try {
      setLoadingStats(true);
      // Persiste a escolha no perfil do RT para futuras sessões
      await updateDoc(doc(db, "users", userData.uid), {
        selectedClinicaId: tempId
      });

      await updateDoc(doc(db, "usuarios", userData.uid), {
        selectedClinicaId: tempId
      });
      
      const clinicaData = userData.clinicas.find(c => c.id === tempId);
      
      // Atualiza o estado global para disparar o re-fetch de dados em todos os componentes
      if (setUserData) {
        setUserData(prev => ({ 
          ...prev, 
          selectedClinicaId: tempId, 
          clinicaData 
        }));
      }
      setOpenModal(false);
    } catch (err) {
      console.error("Erro ao trocar de unidade:", err);
    } finally {
      setLoadingStats(false);
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
        onChange={(e) => handleSelectChange(e.target.value)}
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
                color="success" 
                size="small" 
                sx={{ ml: 1, height: 16, fontSize: 9, fontWeight: 900, bgcolor: "#1b4332", color: "#fff" }} 
              />
            )}
          </MenuItem>
        ))}
      </Select>

      {/* Modal de Confirmação e Mudança de Contexto Multi-Tenant */}
      <Dialog 
        open={openModal} 
        onClose={() => !loadingStats && setOpenModal(false)}
        PaperProps={{
          style: {
            borderRadius: 16,
            padding: 8,
            maxWidth: 480
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
          <SwapHorizIcon sx={{ color: "#1b4332", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={900} color="#1b4332">
            Mudar de Estabelecimento?
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Você está prestes a alterar seu contexto de Responsabilidade Técnica. Isso atualizará todo o seu Cockpit e relatórios em tempo real.
          </Typography>

          {selectedClinica && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: "#f9fdfa", borderColor: "#e8f5e9" }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>NOME FANTASIA</Typography>
                  <Typography variant="body2" fontWeight={800} color="#1b4332">
                    {selectedClinica.nomeFantasia || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>RAZÃO SOCIAL</Typography>
                  <Typography variant="body2" fontWeight={700} color="#333">
                    {selectedClinica.razaoSocial || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>CNPJ</Typography>
                  <Typography variant="body2" fontWeight={700} color="#333">
                    {selectedClinica.cnpj || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>LOCALIZAÇÃO</Typography>
                  <Typography variant="body2" fontWeight={700} color="#333">
                    {selectedClinica.cidade || "—"} - {selectedClinica.estado || selectedClinica.uf || "—"}
                  </Typography>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssignmentIcon sx={{ color: pendingAudits > 0 ? "#e65100" : "#1b4332", fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>AUDITORIAS RECOMENDADAS PENDENTES</Typography>
                    {loadingStats ? (
                      <CircularProgress size={12} sx={{ display: "block", mt: 0.5 }} />
                    ) : (
                      <Typography variant="body2" fontWeight={900} color={pendingAudits > 0 ? "#e65100" : "#1b4332"}>
                        {pendingAudits} checklist(s) pendente(s) nesta unidade
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenModal(false)} 
            disabled={loadingStats}
            sx={{ textTransform: "none", fontWeight: 700, color: "#888" }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmarTroca} 
            disabled={loadingStats}
            variant="contained"
            sx={{ 
              textTransform: "none", 
              fontWeight: 800, 
              bgcolor: "#1b4332",
              borderRadius: 2,
              "&:hover": { bgcolor: "#2d6a4f" }
            }}
          >
            {loadingStats ? <CircularProgress size={18} color="inherit" /> : "Sim, mudar de estabelecimento"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
