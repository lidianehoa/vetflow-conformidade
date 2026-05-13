import React, { useState, useRef } from "react";
import {
  Box, Typography, Paper, Grid, Button, TextField, Divider, Chip,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import { useReactToPrint } from "react-to-print";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { TCLE_MODELOS, gerarHash } from "../data/tcleModels";
import { gerarSmartId } from "../data/checklistsRT";

const ICONES = { Cirurgia: "🔬", Anestesia: "💉", Internação: "🏥", Eutanásia: "🕊️" };

function substituir(texto, vars) {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v || `{{${k}}}`), texto);
}

export default function Termos() {
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);
  const printRef = useRef();

  if (!pode("termos")) {
    return <BloqueioRecurso recurso="Gerador de TCLE" planoMinimo={planoMinimo("termos")} />;
  }

  const [etapa, setEtapa] = useState("selecao"); // selecao | preenchimento
  const [modeloSelecionado, setModeloSelecionado] = useState(null);
  const [smartId] = useState(() => gerarSmartId(userData?.uid));

  const [form, setForm] = useState({
    NOME_ANIMAL: "",
    ESPECIE_RACA_IDADE: "",
    RESPONSAVEL: "",
    CPF_RESPONSAVEL: "",
  });

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const agora = new Date();
  const dataAtual = agora.toLocaleDateString("pt-BR");
  const horaAtual = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const vars = {
    SMART_ID: smartId,
    DATA_ATUAL: dataAtual,
    HORA_ATUAL: horaAtual,
    NOME_CLINICA: userData?.razaoSocial || "{{NOME_CLINICA}}",
    CNPJ: userData?.cnpj || "{{CNPJ}}",
    RT_NOME: userData?.rtNome || "{{RT_NOME}}",
    RT_CRMV: userData?.crmv || "{{RT_CRMV}}",
    HASH: gerarHash(smartId + (form.RESPONSAVEL || "") + dataAtual),
    ...form,
  };

  const textoFinal = modeloSelecionado ? substituir(modeloSelecionado.conteudo, vars) : "";

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      <Typography variant="h5" fontWeight={800} color="#1b4332" mb={1}>
        Gerador de TCLE
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Smart ID: <strong style={{ color: "#1b4332", fontFamily: "monospace" }}>{smartId}</strong>
        {" "}· Ref.: Res. CFMV 1653/2025
      </Typography>

      {/* Seleção de modelo */}
      {etapa === "selecao" && (
        <Grid container spacing={2}>
          {TCLE_MODELOS.map((modelo) => (
            <Grid item xs={12} sm={6} md={3} key={modelo.id}>
              <Paper
                elevation={0}
                onClick={() => { setModeloSelecionado(modelo); setEtapa("preenchimento"); }}
                sx={{
                  border: "1.5px solid #e8f5e9",
                  borderRadius: 4,
                  p: 3,
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#1b4332",
                    background: "#f0fdf4",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 20px rgba(27,67,50,0.10)",
                  },
                }}
              >
                <Typography variant="h2" mb={1}>{ICONES[modelo.categoria]}</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="#1b4332" gutterBottom>
                  {modelo.titulo}
                </Typography>
                <Chip label={modelo.categoria} size="small"
                  sx={{ background: "#e8f5e9", color: "#1b4332", fontWeight: 600, fontSize: 11 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Preenchimento */}
      {etapa === "preenchimento" && modeloSelecionado && (
        <Grid container spacing={3}>
          {/* Formulário */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ border: "1.5px solid #e8f5e9", borderRadius: 4, p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#1b4332" mb={2}>
                Dados do Paciente
              </Typography>
              {[
                { key: "NOME_ANIMAL", label: "Nome do Animal *" },
                { key: "ESPECIE_RACA_IDADE", label: "Espécie / Raça / Idade *" },
                { key: "RESPONSAVEL", label: "Responsável pelo Animal *" },
                { key: "CPF_RESPONSAVEL", label: "CPF ou RG *" },
              ].map(({ key, label }) => (
                <TextField
                  key={key}
                  id={`tcle-${key.toLowerCase()}`}
                  label={label}
                  fullWidth
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  sx={{ mb: 2 }}
                  size="small"
                />
              ))}

              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                Dados da clínica são lidos automaticamente do seu Perfil.
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={() => setEtapa("selecao")}
                  sx={{ borderColor: "#1b4332", color: "#1b4332", borderRadius: 3, flex: 1 }}
                >
                  Trocar Modelo
                </Button>
                <Button
                  id="btn-imprimir-tcle"
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  sx={{ background: "#1b4332", color: "#fff", borderRadius: 3, flex: 1 }}
                >
                  Imprimir
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Preview do TCLE */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                border: "1.5px solid #e8f5e9",
                borderRadius: 4,
                p: 4,
                minHeight: 500,
                background: "#fafffe",
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" mb={2} fontWeight={600}>
                📄 Preview — {modeloSelecionado.titulo}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {/* Área de impressão */}
              <Box ref={printRef} sx={{ fontFamily: "monospace, serif", fontSize: 12, lineHeight: 1.8, color: "#1a1a1a", whiteSpace: "pre-wrap" }}>
                {textoFinal}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
