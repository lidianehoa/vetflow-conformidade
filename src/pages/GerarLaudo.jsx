import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Paper, Button, Grid, TextField, MenuItem, 
  CircularProgress, Alert, Divider, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { getLaudoById, gerarNumeroLaudo } from "../data/laudoTypes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PrintIcon from "@mui/icons-material/Print";
import { useReactToPrint } from "react-to-print";
import { gerarSmartId } from "../data/checklistsRT";
import { gerarHash } from "../data/tcleModels";
import { useWebPKI } from "../hooks/useWebPKI";

const COR = "#1b4332";

export default function GerarLaudo() {
  const { tipoId, id } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();
  const printRef = useRef();

  const [tipo, setTipo] = useState(null);
  const [laudo, setLaudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [etapa, setEtapa] = useState(0); // 0: Form, 1: Revisão, 2: Assinatura
  const [dialogAssinatura, setDialogAssinatura] = useState(false);
  const [validando, setValidando] = useState(false);
  const [statusAssinatura, setStatusAssinatura] = useState("idle"); // idle, validando, concluido
  const { isReady, certificates, loadingCertificates, refreshCertificates, signHash, error: pkiError } = useWebPKI();
  const [selectedCert, setSelectedCert] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const snap = await getDoc(doc(db, "laudos", id));
          if (snap.exists()) {
            const data = snap.data();
            setLaudo({ id: snap.id, ...data });
            setTipo(getLaudoById(data.tipoId));
            setForm(data.conteudo || {});
          }
        } else if (tipoId) {
          setTipo(getLaudoById(tipoId));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tipoId, id]);

  const handleSave = async (novoStatus = "rascunho") => {
    if (!userData?.uid) return;
    setSaving(true);
    try {
      const data = {
        userId: userData.uid,
        clinicaId: userData.selectedClinicaId || "",
        tipoId: tipo.id,
        nomeTemplate: tipo.nome,
        prefixo: tipo.prefixo,
        status: novoStatus,
        conteudo: form,
        resumo: form.nome_animal || form.periodo_referencia || form.identificacao_animal || "",
        atualizadoEm: serverTimestamp(),
        // Metadados de retenção legal (5 anos)
        dataExpiracaoRetencao: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
        imutavel: novoStatus === "assinado"
      };

      if (id || laudo?.id) {
        await updateDoc(doc(db, "laudos", id || laudo.id), data);
      } else {
        // Gerar número sequencial (simulado - em prod usar transaction)
        const numero = gerarNumeroLaudo(tipo.prefixo, Math.floor(Math.random() * 1000));
        data.numeroLaudo = numero;
        data.criadoEm = serverTimestamp();
        const docRef = await addDoc(collection(db, "laudos"), data);
        setLaudo({ id: docRef.id, ...data });
      }
      return true;
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar laudo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAssinarReal = async () => {
    if (!selectedCert) return alert("Selecione um certificado.");
    setValidando(true);
    setStatusAssinatura("validando");
    
    try {
      const cert = certificates.find(c => c.thumbprint === selectedCert);
      const smartId = gerarSmartId(userData.uid);
      const hashParaAssinar = gerarHash(JSON.stringify(form) + smartId);
      
      // Chamada real para o Token/A1 via Web PKI
      const signature = await signHash(selectedCert, hashParaAssinar);
      
      const ok = await handleSave("assinado");
      if (ok) {
        await updateDoc(doc(db, "laudos", id || laudo.id), {
          status: "assinado",
          smartId,
          hashAutenticidade: hashParaAssinar,
          assinaturaDigital: {
            tipo: "ICP-Brasil (Web PKI)",
            titular: cert.subjectName,
            emissor: cert.issuerName,
            thumbprint: cert.thumbprint,
            signature: signature,
            timestamp: new Date().toISOString()
          },
          assinadoEm: serverTimestamp(),
        });
        setStatusAssinatura("concluido");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na assinatura digital: " + (err.message || err));
      setStatusAssinatura("idle");
    } finally {
      setValidando(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  if (loading) return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress sx={{ color: COR }} /></Box>;
  if (!tipo) return <Alert severity="error">Tipo de laudo não encontrado.</Alert>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/laudos")} sx={{ color: COR }}>
          Voltar para Central
        </Button>
        <Stack direction="row" spacing={1}>
          {laudo?.status === "assinado" ? (
            <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ bgcolor: COR }}>
              Imprimir Laudo
            </Button>
          ) : (
            <>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => handleSave("rascunho")} disabled={saving} sx={{ color: COR, borderColor: COR }}>
                Salvar Rascunho
              </Button>
              <Button variant="contained" startIcon={<VerifiedUserIcon />} onClick={() => setDialogAssinatura(true)} sx={{ bgcolor: COR }}>
                Assinar Digitalmente
              </Button>
            </>
          )}
        </Stack>
      </Box>

      <Paper sx={{ p: 4, borderRadius: "20px", border: "1px solid #e8f5e9" }} elevation={0}>
        <Typography variant="h6" fontWeight={900} color={COR} gutterBottom>
          {tipo.nome}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={4}>
          {tipo.legislacao} • {laudo?.numeroLaudo || "Novo Documento"}
        </Typography>

        <Grid container spacing={3}>
          {tipo.campos_conteudo.map((c) => (
            <Grid item xs={12} md={c.tipo === "textarea" ? 12 : 6} key={c.campo}>
              {c.tipo === "select" ? (
                <TextField
                  select fullWidth size="small" label={c.label} required={c.obrigatorio}
                  value={form[c.campo] || ""}
                  onChange={(e) => setForm({ ...form, [c.campo]: e.target.value })}
                  disabled={laudo?.status === "assinado"}
                >
                  {c.opcoes.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </TextField>
              ) : (
                <TextField
                  fullWidth size="small" label={c.label} required={c.obrigatorio}
                  type={c.tipo} multiline={c.tipo === "textarea"} rows={c.tipo === "textarea" ? 4 : 1}
                  value={form[c.campo] || ""}
                  onChange={(e) => setForm({ ...form, [c.campo]: e.target.value })}
                  disabled={laudo?.status === "assinado"}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ─── MODAL DE ASSINATURA ─── */}
      <Dialog open={dialogAssinatura} onClose={() => !validando && setDialogAssinatura(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", fontWeight: 900, color: COR }}>
          {statusAssinatura === "concluido" ? "Laudo Assinado!" : "Assinatura Digital"}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 3 }}>
          {statusAssinatura === "idle" && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Selecione o seu certificado ICP-Brasil (A1 ou A3) para assinar este laudo com validade jurídica.
              </Typography>
              <Button variant="outlined" size="small" onClick={refreshCertificates} sx={{ color: COR }}>
                Detectar Certificados
              </Button>
              {loadingCertificates ? <CircularProgress size={20} /> : (
                <TextField
                  select fullWidth label="Certificado Disponível"
                  value={selectedCert}
                  onChange={e => setSelectedCert(e.target.value)}
                  size="small"
                >
                  {certificates.map(c => (
                    <MenuItem key={c.thumbprint} value={c.thumbprint}>
                      {c.subjectName} (venc. {new Date(c.validityEnd).toLocaleDateString()})
                    </MenuItem>
                  ))}
                  {certificates.length === 0 && <MenuItem disabled>Nenhum certificado encontrado</MenuItem>}
                </TextField>
              )}
              {pkiError && <Alert severity="warning" sx={{ fontSize: "0.7rem" }}>{pkiError}</Alert>}
            </Stack>
          )}
          {statusAssinatura === "validando" && (
            <Stack alignItems="center" spacing={2}>
              <CircularProgress sx={{ color: COR }} />
              <Typography variant="caption" fontWeight={700}>
                Aguardando resposta do Token/Certificado...
              </Typography>
            </Stack>
          )}
          {statusAssinatura === "concluido" && (
            <Stack alignItems="center" spacing={1}>
              <VerifiedUserIcon sx={{ fontSize: 60, color: "#2e7d32" }} />
              <Typography variant="body2" fontWeight={700}>Documento assinado com sucesso.</Typography>
              <Typography variant="caption">Hash: {laudo?.hashAutenticidade?.substring(0, 20)}...</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", p: 3 }}>
          {statusAssinatura === "idle" ? (
            <>
              <Button onClick={() => setDialogAssinatura(false)} sx={{ color: "#888" }}>Cancelar</Button>
              <Button variant="contained" onClick={handleAssinarReal} disabled={!selectedCert || !isReady} sx={{ bgcolor: COR }}>Assinar Agora</Button>
            </>
          ) : statusAssinatura === "concluido" ? (
            <Button variant="contained" fullWidth onClick={() => setDialogAssinatura(false)} sx={{ bgcolor: COR }}>Fechar</Button>
          ) : null}
        </DialogActions>
      </Dialog>

      {/* ─── PREVIEW PARA IMPRESSÃO (ESCONDIDO) ─── */}
      <Box sx={{ display: "none" }}>
        <Box ref={printRef} sx={{ p: 4, fontFamily: "serif" }}>
          <Box sx={{ textAlign: "center", mb: 4, borderBottom: "2px solid #000", pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
              {tipo.nome}
            </Typography>
            <Typography variant="subtitle1">Nº {laudo?.numeroLaudo}</Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>DADOS TÉCNICOS</Typography>
            {tipo.campos_conteudo.map(c => (
              <Box key={c.campo} sx={{ mb: 1, display: "flex", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{c.label}:</Typography>
                <Typography variant="body2">{form[c.campo] || "—"}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 10, textAlign: "center" }}>
            <Divider sx={{ mb: 1, width: "300px", mx: "auto", borderColor: "#000" }} />
            <Typography variant="body1" fontWeight="bold">{userData?.displayName}</Typography>
            <Typography variant="body2">Médico Veterinário Responsável Técnico</Typography>
            <Typography variant="body2">CRMV: {userData?.crmv || "—"}</Typography>
            
            {laudo?.status === "assinado" && (
              <Box sx={{ mt: 4, p: 2, border: "1px solid #ddd", borderRadius: "8px", bgcolor: "#f9f9f9" }}>
                <Typography variant="caption" sx={{ display: "block", color: "#666" }}>
                  Documento assinado digitalmente em {new Date(laudo.assinadoEm?.toDate()).toLocaleString("pt-BR")}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#666", fontSize: "8px" }}>
                  HASH SHA-256: {laudo.hashAutenticidade}
                </Typography>
                <Typography variant="caption" sx={{ display: "block", color: "#666", mt: 1 }}>
                  ID de Rastreabilidade: {laudo.smartId}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
