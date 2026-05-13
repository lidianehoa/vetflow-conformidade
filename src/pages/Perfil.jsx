import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box, Typography, Paper, Button, TextField, Grid, Avatar,
  FormControlLabel, Checkbox, Divider, Alert, CircularProgress,
  Chip, MenuItem, Select, FormControl, InputLabel, Card, CardContent, InputAdornment,
  IconButton, Tooltip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import { AREAS_ATUACAO, TIPOS_FORMALIZACAO, getAreaById } from "../data/rtTypes";
import { gerarHashSHA256, gerarSmartID } from "../utils/security";
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AddModeratorIcon from '@mui/icons-material/AddModerator';

const CAMPOS_VENCIMENTO = [
  { key: "vencSipeagro",  label: "SIPEAGRO (MAPA)" },
  { key: "vencAlvara",    label: "Alvará Sanitário" },
  { key: "vencCaixaAgua", label: "Caixa d'água" },
  { key: "vencCrmv",      label: "CRMV (PJ)" },
  { key: "vencVacinas",   label: "Cadeia de Vacinas" },
  { key: "vencArt",       label: "Validade da ART" },
];

const CHECKBOXES = [
  { key: "realizaCirurgia",   label: "Realiza Cirurgia" },
  { key: "possuiInternacao",  label: "Possui Internação" },
  { key: "atendimento24h",    label: "Atendimento 24h" },
  { key: "postoColeta",       label: "Posto de Coleta" },
  { key: "fazTelemedicina",   label: "Faz Telemedicina" },
];

export default function Perfil() {
  const userData = useUserData();
  const { label: labelPlano } = usePlano(userData);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [form, setForm] = useState({
    displayName: "",
    rtNome: "", 
    crmv: "",
    uf: "MS",
    bio: "",
    especialidades: [],
    fotoUrl: "",
    telefone: "",
    vencArtPessoal: "",
    vencCertificadoPessoal: "",
    vencCarteiraCrmv: "",
    // Logs de Saúde Ocupacional
    vencAntirrabica: "",
    vencAntitetanica: "",
    vencSorologia: "",
    hashSaude: "",
    smartIdSaude: "",
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  useEffect(() => {
    if (!userData?.uid) return;
    getDoc(doc(db, "users", userData.uid))
      .then((snap) => {
        if (snap.exists()) {
          setForm((p) => ({ ...p, ...snap.data() }));
        }
      })
      .finally(() => setLoading(false));
  }, [userData?.uid]);

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const areaAtual = getAreaById(form.areaAtuacao);
  const tipoFormal = TIPOS_FORMALIZACAO.find((t) => t.id === form.tipoFormalizacao);

  const handleFotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userData?.uid) return;
    setUploadingFoto(true);
    try {
      const storageRef = ref(storage, `fotos_perfil/${userData.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setField("fotoUrl", url);
    } catch {
      setErro("Erro ao fazer upload da foto.");
    } finally {
      setUploadingFoto(false);
    }
  };

  const handleSalvar = async () => {
    if (!userData?.uid) return;
    setSalvando(true);
    setErro("");
    setSucesso(false);
    try {
      // Gera Hash de integridade para os dados de saúde
      const dadosSaudeStr = `${form.vencAntirrabica}-${form.vencAntitetanica}-${form.vencSorologia}`;
      const hash = await gerarHashSHA256(dadosSaudeStr);
      
      const payload = {
        ...form,
        hashSaude: hash,
        smartIdSaude: form.smartIdSaude || gerarSmartID("RT-HEALTH"),
        atualizadoEm: new Date(),
      };

      await setDoc(doc(db, "users", userData.uid), payload, { merge: true });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const handleTrocarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setAlterandoSenha(true);
    setErro("");
    try {
      await updatePassword(auth.currentUser, novaSenha);
      setSucesso(true);
      setNovaSenha("");
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/requires-recent-login") {
        setErro("Para trocar a senha, você precisa ter feito login recentemente. Por favor, saia e entre novamente.");
      } else {
        setErro("Erro ao trocar senha. Tente novamente.");
      }
    } finally {
      setAlterandoSenha(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress sx={{ color: "#1b4332" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="#1b4332">
            Meu Perfil Profissional
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <VerifiedUserIcon sx={{ fontSize: 16, color: "#52b788" }} />
            <Typography variant="body2" color="text.secondary">Responsável Técnico VERTOS OS</Typography>
            <Chip label={labelPlano} size="small"
              sx={{ background: "#1b4332", color: "#fff", fontWeight: 700, fontSize: 10, height: 18 }} />
          </Box>
        </Box>
        <Button
          id="btn-salvar-perfil"
          variant="contained"
          startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSalvar}
          disabled={salvando}
          sx={{ background: "#1b4332", color: "#fff", borderRadius: 3, fontWeight: 700 }}
        >
          {salvando ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </Box>

      {sucesso && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Perfil salvo com sucesso! ✅</Alert>}
      {erro && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{erro}</Alert>}

      <Grid container spacing={3}>
        {/* 1. Identidade Profissional */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={3}>
              1. Identidade Profissional & Foto
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
              <Avatar src={form.fotoUrl} sx={{ width: 100, height: 100, bgcolor: "#e8f5e9", border: "2px solid #c8e6c9" }}>
                {!form.fotoUrl && <PhotoCameraIcon sx={{ fontSize: 40, color: "#52b788" }} />}
              </Avatar>
              <Box>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoUpload} />
                <Button
                  variant="outlined"
                  startIcon={uploadingFoto ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingFoto}
                  sx={{ borderColor: "#1b4332", color: "#1b4332", borderRadius: 3 }}
                >
                  {uploadingFoto ? "Enviando..." : "Alterar Foto Profissional"}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>Recomendado: Foto de rosto com jaleco, max 2MB</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* 2. Documentação Legal & Saúde Ocupacional (Blindagem 360°) */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={3} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <VerifiedUserIcon color="primary" /> 2. Documentação Legal & Saúde (Res. CFMV 1562/23)
            </Typography>
            
            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: "block" }}>Documentos Profissionais</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <TextField label="Vencimento A.R.T. (Anual)" type="date" fullWidth value={form.vencArtPessoal || ""} onChange={(e) => setField("vencArtPessoal", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Vencimento Cert. Regularidade" type="date" fullWidth value={form.vencCertificadoPessoal || ""} onChange={(e) => setField("vencCertificadoPessoal", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Vencimento Cédula Profissional" type="date" fullWidth value={form.vencCarteiraCrmv || ""} onChange={(e) => setField("vencCarteiraCrmv", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ mb: 2, display: "block" }}>
              <HealthAndSafetyIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} /> Saúde e Segurança Ocupacional
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Validade Antirrábica" type="date" fullWidth value={form.vencAntirrabica || ""} onChange={(e) => setField("vencAntirrabica", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Validade Antitetânica" type="date" fullWidth value={form.vencAntitetanica || ""} onChange={(e) => setField("vencAntitetanica", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Próxima Sorologia" type="date" fullWidth value={form.vencSorologia || ""} onChange={(e) => setField("vencSorologia", e.target.value)} InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: "#f1f8f6", borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="#1b4332" fontWeight={600}>
                🛡️ Os logs de saúde geram rastreabilidade jurídica com Hash SHA-256 e Smart ID.
              </Typography>
              {form.smartIdSaude && (
                <Chip label={form.smartIdSaude} size="small" sx={{ fontWeight: 800, fontSize: '0.65rem', bgcolor: '#fff', border: '1px solid #1b4332' }} />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* 3. Dados de Contato e Bio */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={3}>
              3. Dados de Contato e Bio
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nome Completo" fullWidth
                  value={form.rtNome || form.displayName} onChange={(e) => setField("rtNome", e.target.value)} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField 
                  label="CRMV (Ex: 1234 MS)" 
                  fullWidth
                  value={form.crmv} 
                  onChange={(e) => setField("crmv", e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Validar no SISCAD (CFMV)">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              const [num, uf] = form.crmv.split(" ");
                              const url = `https://siscad.cfmv.gov.br/consultapublica/index`;
                              window.open(url, "_blank");
                            }}
                          >
                            <VerifiedUserIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Telefone" fullWidth
                  value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Bio Profissional / Resumo Curricular" multiline rows={3} fullWidth
                  value={form.bio} onChange={(e) => setField("bio", e.target.value)}
                  placeholder="Conte um pouco sobre sua trajetória como RT..." />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* 2. Áreas de Expertise */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
              2. Áreas de Especialização
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Selecione as áreas em que você possui maior experiência técnica para personalização de consultoria.
            </Typography>
            <Grid container spacing={1}>
              {["Pequenos Animais", "Grandes Animais", "Laticínios & Lácteos", "Inspeção POA", "Vigilância Sanitária", "Laboratórios", "Bem-estar Animal", "Gestão de Resíduos"].map(esp => (
                <Grid item key={esp}>
                  <Chip
                    label={esp}
                    onClick={() => {
                      const newEsp = form.especialidades?.includes(esp)
                        ? form.especialidades.filter(e => e !== esp)
                        : [...(form.especialidades || []), esp];
                      setField("especialidades", newEsp);
                    }}
                    variant={form.especialidades?.includes(esp) ? "filled" : "outlined"}
                    sx={{
                      bgcolor: form.especialidades?.includes(esp) ? "#1b4332" : "transparent",
                      color: form.especialidades?.includes(esp) ? "#fff" : "#1b4332",
                      borderColor: "#1b4332",
                      fontWeight: 700
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* 3. Meus Estabelecimentos (Atalho) */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ bgcolor: "#f1f8f6", borderRadius: 4, border: "1.5px dashed #b7e4c7" }}>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <BusinessCenterIcon sx={{ fontSize: 48, color: "#1b4332", mb: 1 }} />
              <Typography variant="h6" fontWeight={800} color="#1b4332">Gestão de Estabelecimentos</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
                Lembre-se: os dados de CNPJ, Logos de clínicas e Áreas de Atuação específicos de cada empresa agora são gerenciados individualmente na Central RT.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/central-rt")}
                sx={{ bgcolor: "#1b4332", borderRadius: 2, fontWeight: 700 }}
              >
                Gerenciar Meus Clientes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Segurança e Senha */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ border: "1.5px solid #ffebee", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} color="#c62828" mb={2}>
              4. Segurança da Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Deseja alterar sua senha de acesso? Escolha uma senha forte (mínimo 6 caracteres).
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <TextField 
                label="Nova Senha" 
                type="password" 
                size="small" 
                sx={{ flex: 1, minWidth: 200 }}
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
              />
              <Button
                variant="contained"
                color="error"
                disabled={alterandoSenha || !novaSenha}
                onClick={handleTrocarSenha}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                {alterandoSenha ? <CircularProgress size={16} color="inherit" /> : "Alterar Senha Agora"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Salvar rodapé */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button id="btn-salvar-perfil-bottom" variant="contained"
          startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSalvar} disabled={salvando}
          sx={{ background: "#1b4332", color: "#fff", borderRadius: 3, fontWeight: 700, px: 4 }}>
          {salvando ? "Salvando..." : "Salvar Perfil"}
        </Button>
      </Box>
    </Box>
  );
}
