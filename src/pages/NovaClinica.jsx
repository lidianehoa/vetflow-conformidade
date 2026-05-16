import React, { useState } from "react";
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
  Grid, MenuItem, FormControlLabel, Checkbox, Stack, Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { LABEL_TIPO } from "../data/checklistsRT";
import { AREAS_ATUACAO } from "../data/rtTypes";

export default function NovaClinica() {
  const navigate = useNavigate();
  const userData = useUserData();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    tipo: "clinica",
    areaAtuacao: "pequenos_animais",
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    cidade: "",
    estado: "",
    endereco: "",
    rtNome: "",
    crmv: "",
    cargaHorariaSemanal: 40,
    vencCrmv: "",
    vencArt: "",
    vencCertificado: "",
    vencRegistroPJ: "",
    vencMapa: "",
    vencReceitas: "",
    vencSipeagro: "",
    vencManualBP: "",
    vencPgrss: "",
    vencPop: "",
    // Açougue
    vencSim: "",
    vencLicAmbiental: "",
    tipoAcougue: "A",
    produzLinguica: false,
    produzDefumados: false,
    produzMoidos: false,
    // Laboratório
    vencAEQ: "",
    vencCIQ: "",
    servicos: [],
    // Creche / Hotel
    capacidadeMaxima: "",
    horarioFuncionamento: "",
    vencBombeiros: "",
    vencDezinfest: "",
    possuiCameras: false,
    possuiIsolamento: false,
    // Bovinos
    vencPncebt: "",
    vencSisbov: "",
    possuiConfinamento: false,
    possuiOrdenhaMecanica: false,
    // Indústria POA
    vencPoa: "",
    tipoInspecao: "municipal",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleServicosChange = (servico) => {
    setFormData((prev) => {
      const novosServicos = prev.servicos.includes(servico)
        ? prev.servicos.filter((s) => s !== servico)
        : [...prev.servicos, servico];
      return { ...prev, servicos: novosServicos };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) return;
    setLoading(true);
    setErro("");
    try {
      const novaClinica = {
        ...formData,
        userId: userData.uid,
        rtId: userData.uid,
        tenantId: userData.uid, // Garante multi-tenant
        rtNome: userData.rtNome || userData.displayName || formData.rtNome || "Responsável Técnico",
        rtCrmv: userData.crmv || formData.crmv || "",
        criadoEm: serverTimestamp(),
      };
      await addDoc(collection(db, "clinicas"), {
        ...novaClinica,
        atualizadoEm: serverTimestamp(),
      });
      navigate("/central-rt");
    } catch (err) {
      console.error(err);
      setErro("Erro ao cadastrar estabelecimento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: "auto", pb: 10 }}>
      <Typography variant="h5" fontWeight={900} color="#1b4332" mb={1}>
        Novo Estabelecimento
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cadastre uma nova unidade sob sua responsabilidade técnica
      </Typography>

      {erro && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{erro}</Alert>}

      <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Tipo de Estabelecimento"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                fullWidth
                required
              >
                {Object.entries(LABEL_TIPO).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Área de Atuação (Especialidade RT)"
                name="areaAtuacao"
                value={formData.areaAtuacao}
                onChange={handleChange}
                fullWidth
                required
              >
                {AREAS_ATUACAO.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.emoji} {area.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="CNPJ"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Dados Cadastrais</Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Razão Social"
                name="razaoSocial"
                value={formData.razaoSocial}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome Fantasia"
                name="nomeFantasia"
                value={formData.nomeFantasia}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Responsável Técnico</Divider>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nome do RT"
                name="rtNome"
                value={formData.rtNome}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="CRMV"
                name="crmv"
                value={formData.crmv}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Carga Horária Semanal"
                name="cargaHorariaSemanal"
                type="number"
                value={formData.cargaHorariaSemanal}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Licenças e Documentos RT</Divider>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento Alvará Sanitário"
                name="vencAlvara"
                type="date"
                value={formData.vencAlvara}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento CRMV (Certificado)"
                name="vencCrmv"
                type="date"
                value={formData.vencCrmv}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento Cadastro SIPEAGRO"
                name="vencSipeagro"
                type="date"
                value={formData.vencSipeagro}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento Manual Boas Práticas"
                name="vencManualBP"
                type="date"
                value={formData.vencManualBP}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento PGRSS"
                name="vencPgrss"
                type="date"
                value={formData.vencPgrss}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Data p/ Atualização de POPs"
                name="vencPop"
                type="date"
                value={formData.vencPop}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Vencimento A.R.T. (Específica PJ)"
                name="vencArt"
                type="date"
                value={formData.vencArt}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Certificado de Regularidade (PJ)"
                name="vencCertificado"
                type="date"
                value={formData.vencCertificado}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Registro da Empresa (PJ)"
                name="vencRegistroPJ"
                type="date"
                value={formData.vencRegistroPJ}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Cadastro no MAPA"
                name="vencMapa"
                type="date"
                value={formData.vencMapa}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Lote de Receitas (Validade)"
                name="vencReceitas"
                type="date"
                value={formData.vencReceitas}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Limpeza Caixa d'Água"
                name="vencCaixaAgua"
                type="date"
                value={formData.vencCaixaAgua}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>Configurações da Unidade</Divider>
            </Grid>

            {/* Campos Específicos: Açougue */}
            {formData.tipo === "acougue" && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Venc. SIM/SIE/SIF"
                    name="vencSim"
                    type="date"
                    value={formData.vencSim}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Licença Ambiental"
                    name="vencLicAmbiental"
                    type="date"
                    value={formData.vencLicAmbiental}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    label="Tipo de Açougue"
                    name="tipoAcougue"
                    value={formData.tipoAcougue}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="A">Tipo A (Varejo)</MenuItem>
                    <MenuItem value="B">Tipo B (Beneficiamento)</MenuItem>
                    <MenuItem value="C">Tipo C (Abate)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={3}>
                    <FormControlLabel
                      control={<Checkbox name="produzLinguica" checked={formData.produzLinguica} onChange={handleChange} />}
                      label="Produz Linguiça?"
                    />
                    <FormControlLabel
                      control={<Checkbox name="produzDefumados" checked={formData.produzDefumados} onChange={handleChange} />}
                      label="Produz Defumados?"
                    />
                    <FormControlLabel
                      control={<Checkbox name="produzMoidos" checked={formData.produzMoidos} onChange={handleChange} />}
                      label="Produz Moídos?"
                    />
                  </Stack>
                </Grid>
              </>
            )}

            {/* Campos Específicos: Laboratório */}
            {formData.tipo === "laboratorio" && (
              <>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Venc. AEQ"
                    name="vencAEQ"
                    type="date"
                    value={formData.vencAEQ}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Revisão CIQ"
                    name="vencCIQ"
                    type="date"
                    value={formData.vencCIQ}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Licença Ambiental"
                    name="vencLicAmbiental"
                    type="date"
                    value={formData.vencLicAmbiental}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" mb={1}>Serviços Prestados:</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {["Hematologia", "Bioquímica", "Microbiologia", "Parasitologia", "Patologia", "Coleta"].map((s) => (
                      <FormControlLabel
                        key={s}
                        control={
                          <Checkbox
                            checked={formData.servicos.includes(s)}
                            onChange={() => handleServicosChange(s)}
                          />
                        }
                        label={s}
                      />
                    ))}
                  </Stack>
                </Grid>
              </>
            )}

            {/* Campos Específicos: Creche / Hotel */}
            {formData.tipo === "creche_hotel" && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Capacidade máxima (nº de animais)"
                    name="capacidadeMaxima"
                    type="number"
                    value={formData.capacidadeMaxima}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Horário de funcionamento"
                    name="horarioFuncionamento"
                    value={formData.horarioFuncionamento}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vencimento Laudo Bombeiros"
                    name="vencBombeiros"
                    type="date"
                    value={formData.vencBombeiros}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vencimento Cert. Controle de Pragas"
                    name="vencDezinfest"
                    type="date"
                    value={formData.vencDezinfest}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" flexWrap="wrap" gap={3}>
                    <FormControlLabel
                      control={<Checkbox name="possuiCameras" checked={formData.possuiCameras} onChange={handleChange} />}
                      label="Possui sistema de câmeras nas áreas dos animais"
                    />
                    <FormControlLabel
                      control={<Checkbox name="possuiIsolamento" checked={formData.possuiIsolamento} onChange={handleChange} />}
                      label="Possui área de isolamento exclusiva"
                    />
                  </Stack>
                </Grid>
              </>
            )}

            {/* Campos Específicos: Bovinocultura */}
            {(formData.tipo === "bovinocultura_corte" || formData.tipo === "bovinocultura_leite") && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vencimento PNCEBT (Próximo Teste)"
                    name="vencPncebt"
                    type="date"
                    value={formData.vencPncebt}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vencimento SISBOV / Certificadora"
                    name="vencSisbov"
                    type="date"
                    value={formData.vencSisbov}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={3}>
                    <FormControlLabel
                      control={<Checkbox name="possuiConfinamento" checked={formData.possuiConfinamento} onChange={handleChange} />}
                      label="Possui Confinamento?"
                    />
                    {formData.tipo === "bovinocultura_leite" && (
                      <FormControlLabel
                        control={<Checkbox name="possuiOrdenhaMecanica" checked={formData.possuiOrdenhaMecanica} onChange={handleChange} />}
                        label="Ordenha Mecânica?"
                      />
                    )}
                  </Stack>
                </Grid>
              </>
            )}

            {/* Campos Específicos: Indústria POA */}
            {formData.tipo === "industria_poa" && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Vencimento Registro POA (SIF/SIE/SIM)"
                    name="vencPoa"
                    type="date"
                    value={formData.vencPoa}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Nível de Inspeção"
                    name="tipoInspecao"
                    value={formData.tipoInspecao}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="federal">Federal (SIF)</MenuItem>
                    <MenuItem value="estadual">Estadual (SIE/SISP)</MenuItem>
                    <MenuItem value="municipal">Municipal (SIM)</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}


            <Grid item xs={12} mt={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  bgcolor: "#1b4332",
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#2d6a4f" },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Salvar Estabelecimento"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
