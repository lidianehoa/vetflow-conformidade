import React, { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, TextField, Button, Stack,
  Divider, Alert, CircularProgress, IconButton, Tooltip,
  Card, CardContent, FormControlLabel, Checkbox, Chip,
} from "@mui/material";
import {
  DeviceThermostat as ThermostatIcon,
  MenuBook as MenuBookIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { TIPO_PARA_AREA } from "../data/checklistsRT";
import { gerarHashSHA256, gerarSmartID } from "../utils/security";

const COR = "#1b4332";
const ACENTO = "#52b788";

export default function RotinaDiaria() {
  const userData = useUserData();
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [unidade, setUnidade] = useState(null);

  const [form, setForm] = useState({
    temps: ["", ""], // Array dinâmico de temperaturas
    tempAmbiente: "",
    ocorrencias: "",
    limpezaConcluida: false,
    conferenciaValidade: false,
    checkEquipamentos: false,
    // Laticínios / Leite
    testeAlizarol: "",
    testeDensidade: "",
    higieneOrdenhaCIP: false,
    // Clínica
    armarioControladosTrancado: false,
    // Comércio
    balancoMedicamentos: false,
    conferenciaReceitas: false,
    // Rural / Corte
    vacinacaoDia: false,
    bemEstarCheck: false,
    limpezaCochos: false,
    // Creche e Hotel
    triagemAdmissao: false,
    limpezaBaias: false,
    // POA
    liberacaoPPHO: false,
    monitoramentoPCC: false,
    // Laboratório
    controleQualidade: false,
    calibracaoDiaria: false,
    // Blindagem 360°
    checkEpiDigital: false,
    vazaoPressaoAgua: false,
    rodizioSaudeMental: false,
    hashIntegridade: "",
    smartId: "",
  });

  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) return;
    fetchUnidade();
    fetchHistorico();
  }, [userData?.uid, userData?.selectedClinicaId]);

  const fetchUnidade = async () => {
    const snap = await getDoc(doc(db, "clinicas", userData.selectedClinicaId));
    if (snap.exists()) setUnidade(snap.data());
  };

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "rotinas_diarias"),
        where("clinicaId", "==", userData.selectedClinicaId),
        orderBy("criadoEm", "desc"),
        limit(5)
      );
      const snap = await getDocs(q);
      setHistorico(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTempChange = (idx, val) => {
    const newTemps = [...form.temps];
    newTemps[idx] = val;
    setForm({ ...form, temps: newTemps });
  };

  const addGeladeira = () => setForm({ ...form, temps: [...form.temps, ""] });
  const remGeladeira = () => {
    if (form.temps.length > 1) {
      const newTemps = [...form.temps];
      newTemps.pop();
      setForm({ ...form, temps: newTemps });
    }
  };

  const handleSalvar = async () => {
    if (!userData?.selectedClinicaId) return;
    setSalvando(true);
    try {
      const dataStr = JSON.stringify(form) + userData.uid + new Date().toISOString();
      const hash = await gerarHashSHA256(dataStr);

      await addDoc(collection(db, "rotinas_diarias"), {
        ...form,
        userId: userData.uid,
        clinicaId: userData.selectedClinicaId,
        userName: userData.displayName || userData.rtNome,
        areaAtuacao: unidade?.areaAtuacao || "N/A",
        criadoEm: serverTimestamp(),
        dataRef: new Date().toLocaleDateString("pt-BR"),
        hashIntegridade: hash,
        smartId: gerarSmartID("DAILY"),
      });
      setSucesso(true);
      setForm({
        temps: form.temps.map(() => ""),
        tempAmbiente: "",
        ocorrencias: "",
        limpezaConcluida: false,
        conferenciaValidade: false,
        checkEquipamentos: false,
        testeAlizarol: "",
        testeDensidade: "",
        higieneOrdenhaCIP: false,
        armarioControladosTrancado: false,
        balancoMedicamentos: false,
        conferenciaReceitas: false,
        vacinacaoDia: false,
        bemEstarCheck: false,
        limpezaCochos: false,
        triagemAdmissao: false,
        limpezaBaias: false,
        liberacaoPPHO: false,
        monitoramentoPCC: false,
        controleQualidade: false,
        calibracaoDiaria: false,
        checkEpiDigital: false,
        vazaoPressaoAgua: false,
        rodizioSaudeMental: false,
      });
      fetchHistorico();
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar rotina:", err);
    } finally {
      setSalvando(false);
    }
  };

  const areaStr = unidade ? (TIPO_PARA_AREA[unidade.tipo] || unidade.areaAtuacao) : null;
  const isPequenosAnimais = areaStr === "pequenos_animais";
  const isPOA = areaStr === "producao_origem_animal" || areaStr === "industria_alimentos";
  const isRural = areaStr === "producao_rural";
  const isLeite = unidade?.tipo === "bovinocultura_leite" || unidade?.tipo === "laticinio";
  const isCorte = unidade?.tipo === "bovinocultura_corte" || unidade?.tipo === "producao_rural";
  const isComercio = areaStr === "comercio_agronegocio";
  const isCreche = areaStr === "creche_hotel";
  const isLab = areaStr === "areas_especiais";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto", pb: 10 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={900} color={COR}>
            Rotina Diária do RT
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unidade?.nomeFantasia} — Unidade de {unidade?.tipo?.toUpperCase()}
          </Typography>
        </Box>
        <Chip label={new Date().toLocaleDateString("pt-BR")} sx={{ fontWeight: 700, bgcolor: COR, color: "#fff" }} />
      </Stack>

      {sucesso && <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>Registro diário salvo com sucesso! ✅</Alert>}

      <Grid container spacing={3}>
        {/* Formulário de Registro */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4 }}>
            <Stack spacing={3}>
              {/* Temperaturas Dinâmicas */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" fontWeight={800} color={COR} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ThermostatIcon fontSize="small" /> Controle de Frio (°C)
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={remGeladeira} sx={{ color: "#d32f2f" }} disabled={form.temps.length <= 1}><RemoveCircleOutlineIcon /></IconButton>
                    <Typography variant="caption" fontWeight={700}>{form.temps.length} Equip.</Typography>
                    <IconButton size="small" onClick={addGeladeira} sx={{ color: ACENTO }}><AddCircleOutlineIcon /></IconButton>
                  </Stack>
                </Stack>
                
                <Grid container spacing={2}>
                  {form.temps.map((t, i) => (
                    <Grid item xs={6} sm={4} key={i}>
                      <TextField
                        label={`Geladeira ${i + 1}`}
                        type="number"
                        size="small"
                        fullWidth
                        value={t}
                        onChange={(e) => handleTempChange(i, e.target.value)}
                        placeholder="2 a 8"
                      />
                    </Grid>
                  ))}
                  <Grid item xs={6} sm={4}>
                    <TextField
                      label="Ambiente"
                      type="number"
                      size="small"
                      fullWidth
                      value={form.tempAmbiente}
                      onChange={(e) => setForm({ ...form, tempAmbiente: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* ESPECIALIDADE: LABORATÓRIO / ÁREAS ESPECIAIS */}
              {isLab && (
                <Box sx={{ p: 2, bgcolor: "#f3e5f5", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#6a1b9a" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🔬 Fase Analítica e Qualidade
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.controleQualidade} onChange={(e) => setForm({ ...form, controleQualidade: e.target.checked })} />}
                    label={<Typography variant="body2">Amostras de Controle Interno (CIQ) processadas e aprovadas</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.calibracaoDiaria} onChange={(e) => setForm({ ...form, calibracaoDiaria: e.target.checked })} />}
                    label={<Typography variant="body2">Verificação diária de equipamentos (Balanças, Pipetas, Estufas)</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: POA / INDÚSTRIA ALIMENTOS */}
              {isPOA && (
                <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#1565c0" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🏭 Indústria de Origem Animal / Alimentos
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.liberacaoPPHO} onChange={(e) => setForm({ ...form, liberacaoPPHO: e.target.checked })} />}
                    label={<Typography variant="body2">Liberação Pré-Operacional (PPHO) realizada com sucesso</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.monitoramentoPCC} onChange={(e) => setForm({ ...form, monitoramentoPCC: e.target.checked })} />}
                    label={<Typography variant="body2">Planilhas de monitoramento dos PCCs preenchidas em tempo real</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: LEITE / LATICÍNIO */}
              {isLeite && (
                <Box sx={{ p: 2, bgcolor: "#e1f5fe", borderRadius: 3, mt: isPOA ? 2 : 0 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#0277bd" mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🥛 Testes e Higiene (Leite)
                  </Typography>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Teste Alizarol (%)"
                        size="small"
                        fullWidth
                        value={form.testeAlizarol}
                        onChange={(e) => setForm({ ...form, testeAlizarol: e.target.value })}
                        placeholder="ex: 72%"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Densidade (g/ml)"
                        size="small"
                        fullWidth
                        value={form.testeDensidade}
                        onChange={(e) => setForm({ ...form, testeDensidade: e.target.value })}
                        placeholder="ex: 1.030"
                      />
                    </Grid>
                  </Grid>
                  <FormControlLabel
                    control={<Checkbox checked={form.higieneOrdenhaCIP} onChange={(e) => setForm({ ...form, higieneOrdenhaCIP: e.target.checked })} />}
                    label={<Typography variant="body2">Limpeza CIP (Equipamentos/Ordenha) concluída com sanitizante</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: CLÍNICA / PEQUENOS */}
              {isPequenosAnimais && (
                <Box sx={{ p: 2, bgcolor: "#f1f8f6", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#1b4332" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🔐 Controle de Psicotrópicos
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.armarioControladosTrancado} onChange={(e) => setForm({ ...form, armarioControladosTrancado: e.target.checked })} />}
                    label={<Typography variant="body2" fontWeight={600}>Armário de substâncias controladas conferido e TRANCADO</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: CRECHE / HOTEL */}
              {isCreche && (
                <Box sx={{ p: 2, bgcolor: "#fce4ec", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#c2185b" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🐕 Rotina de Hospedagem
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.triagemAdmissao} onChange={(e) => setForm({ ...form, triagemAdmissao: e.target.checked })} />}
                    label={<Typography variant="body2">Triagem sanitária rigorosa na admissão de novos hóspedes</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.limpezaBaias} onChange={(e) => setForm({ ...form, limpezaBaias: e.target.checked })} />}
                    label={<Typography variant="body2">Limpeza das baias/alojamentos com produto virucida</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: COMÉRCIO / AGRO */}
              {isComercio && (
                <Box sx={{ p: 2, bgcolor: "#fff3e0", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#e65100" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    💊 Gestão de Estoque e Receitas
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.balancoMedicamentos} onChange={(e) => setForm({ ...form, balancoMedicamentos: e.target.checked })} />}
                    label={<Typography variant="body2">Balanço de entrada/saída de medicamentos realizado</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.conferenciaReceitas} onChange={(e) => setForm({ ...form, conferenciaReceitas: e.target.checked })} />}
                    label={<Typography variant="body2">Conferência de retenção de receitas e carimbos</Typography>}
                  />
                </Box>
              )}

              {/* ESPECIALIDADE: PRODUÇÃO RURAL / CORTE */}
              {isRural && (
                <Box sx={{ p: 2, bgcolor: "#f1f8e9", borderRadius: 3 }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#558b2f" mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    🐄 Manejo e Sanidade Animal (Campo)
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.vacinacaoDia} onChange={(e) => setForm({ ...form, vacinacaoDia: e.target.checked })} />}
                    label={<Typography variant="body2">Aplicação de vacinas/medicamentos do dia registrada no caderno</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.bemEstarCheck} onChange={(e) => setForm({ ...form, bemEstarCheck: e.target.checked })} />}
                    label={<Typography variant="body2">Verificação de disponibilidade de água e sombra (Bem-estar)</Typography>}
                  />
                  {isCorte && (
                    <FormControlLabel
                      control={<Checkbox checked={form.limpezaCochos} onChange={(e) => setForm({ ...form, limpezaCochos: e.target.checked })} />}
                      label={<Typography variant="body2">Limpeza e abastecimento de cochos/bebedouros confirmados</Typography>}
                    />
                  )}
                </Box>
              )}

              {/* Checklist Geral */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color={COR} mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineIcon fontSize="small" /> Checklist de Conformidade
                </Typography>
                <Stack>
                  <FormControlLabel
                    control={<Checkbox checked={form.limpezaConcluida} onChange={(e) => setForm({ ...form, limpezaConcluida: e.target.checked })} />}
                    label={<Typography variant="body2">Limpeza e desinfecção de áreas críticas concluída</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.conferenciaValidade} onChange={(e) => setForm({ ...form, conferenciaValidade: e.target.checked })} />}
                    label={<Typography variant="body2">Conferência de validade de insumos e perecíveis</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.checkEquipamentos} onChange={(e) => setForm({ ...form, checkEquipamentos: e.target.checked })} />}
                    label={<Typography variant="body2">Verificação de equipamentos (Autoclave/Monitores)</Typography>}
                  />
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="overline" color="primary" fontWeight={800}>🛡️ Blindagem 360°</Typography>
                  <FormControlLabel
                    control={<Checkbox checked={form.checkEpiDigital} onChange={(e) => setForm({ ...form, checkEpiDigital: e.target.checked })} />}
                    label={<Typography variant="body2" fontWeight={600}>Confirmação de Uso/Entrega de EPIs (Log Digital)</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.vazaoPressaoAgua} onChange={(e) => setForm({ ...form, vazaoPressaoAgua: e.target.checked })} />}
                    label={<Typography variant="body2">Monitoramento de vazão/pressão da água (Higienização)</Typography>}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.rodizioSaudeMental} onChange={(e) => setForm({ ...form, rodizioSaudeMental: e.target.checked })} />}
                    label={<Typography variant="body2">Validação de Escala de Rodízio (Saúde Mental)</Typography>}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Livro de Ocorrências */}
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color={COR} mb={1} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MenuBookIcon fontSize="small" /> Livro de Ocorrências e Orientações
                </Typography>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  placeholder="Registre aqui intercorrências, orientações à equipe..."
                  value={form.ocorrencias}
                  onChange={(e) => setForm({ ...form, ocorrencias: e.target.value })}
                  sx={{ bgcolor: "#f9fdfa" }}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={salvando ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSalvar}
                disabled={salvando}
                sx={{ bgcolor: COR, py: 1.5, borderRadius: 3, fontWeight: 800 }}
              >
                {salvando ? "Salvando..." : "Finalizar Registro Diário"}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Histórico Recente */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle1" fontWeight={800} color={COR} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HistoryIcon /> Histórico de Registros
          </Typography>
          {loading ? (
            <CircularProgress size={24} sx={{ color: ACENTO }} />
          ) : (
            <Stack spacing={2}>
              {historico.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Nenhum registro encontrado.</Typography>
              ) : (
                historico.map((log) => (
                  <Card key={log.id} variant="outlined" sx={{ borderRadius: 3, borderLeft: `4px solid ${COR}` }}>
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="caption" fontWeight={800} color={COR}>{log.dataRef}</Typography>
                        <Chip label={log.areaAtuacao} size="small" sx={{ height: 16, fontSize: 9, fontWeight: 800 }} />
                      </Stack>
                      <Stack direction="row" spacing={2} mb={1} flexWrap="wrap">
                        {log.temps?.map((t, i) => (
                          <Box key={i}>
                            <Typography variant="caption" color="text.secondary" display="block">G{i+1}</Typography>
                            <Typography variant="body2" fontWeight={700}>{t || "—"}°</Typography>
                          </Box>
                        ))}
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Amb</Typography>
                          <Typography variant="body2" fontWeight={700}>{log.tempAmbiente || "—"}°</Typography>
                        </Box>
                      </Stack>
                      {log.testeAlizarol && (
                        <Typography variant="caption" sx={{ display: "block", color: "#0277bd", fontWeight: 700 }}>
                          🥛 Alizarol: {log.testeAlizarol} | Dens: {log.testeDensidade}
                        </Typography>
                      )}
                      {log.higieneOrdenhaCIP && (
                        <Typography variant="caption" sx={{ display: "block", color: "#0277bd", fontWeight: 700 }}>
                          🧼 CIP/Higiene Concluída
                        </Typography>
                      )}
                      {log.liberacaoPPHO && (
                        <Typography variant="caption" sx={{ display: "block", color: "#1565c0", fontWeight: 700 }}>
                          🏭 PPHO Liberado | PCCs OK: {log.monitoramentoPCC ? 'Sim' : 'Não'}
                        </Typography>
                      )}
                      {log.triagemAdmissao && (
                        <Typography variant="caption" sx={{ display: "block", color: "#c2185b", fontWeight: 700 }}>
                          🐕 Triagem & Baias OK
                        </Typography>
                      )}
                      {log.controleQualidade && (
                        <Typography variant="caption" sx={{ display: "block", color: "#6a1b9a", fontWeight: 700 }}>
                          🔬 CIQ e Calibração OK
                        </Typography>
                      )}
                      {log.armarioControladosTrancado && (
                        <Typography variant="caption" sx={{ display: "block", color: "#1b4332", fontWeight: 700 }}>
                          🔐 Armário de Controlados: TRANCADO
                        </Typography>
                      )}
                      {log.conferenciaReceitas && (
                        <Typography variant="caption" sx={{ display: "block", color: "#e65100", fontWeight: 700 }}>
                          💊 Receitas Conferidas
                        </Typography>
                      )}
                      {log.vacinacaoDia && (
                        <Typography variant="caption" sx={{ display: "block", color: "#558b2f", fontWeight: 700 }}>
                          🐄 Sanidade/Vacinação OK
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
          )}
          
          <Box sx={{ mt: 4, p: 2, bgcolor: "#fff8e1", borderRadius: 3, border: "1px solid #ffe082" }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <WarningAmberIcon sx={{ color: "#f57c00", fontSize: 20 }} />
              <Typography variant="caption" color="#5d4037">
                <strong>Nota do Antigravity:</strong> Este registro diário constitui prova material de que o RT está exercendo sua função de vigilância, protegendo você contra alegações de negligência.
              </Typography>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
