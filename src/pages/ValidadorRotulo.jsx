import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Chip, Divider, Switch, FormControlLabel,
  Stepper, Step, StepLabel
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";

const COR = "#1b4332";

const passos = ["Dados Gerais", "Alérgenos e Avisos", "Tabela Nutricional", "Validação FOP"];

export default function ValidadorRotulo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();
  
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    nomeProduto: "",
    marca: "",
    categoria: "",
    estadoFisico: "Solido", // "Solido" ou "Liquido"
    status: "Rascunho",
    
    // Alergênicos / Alertas
    contemGluten: false,
    contemLactose: false,
    alergenicos: "",
    
    // Nutricional por 100g/ml
    valorEnergetico: 0,
    carboidratos: 0,
    acucaresTotais: 0,
    acucaresAdicionados: 0,
    proteinas: 0,
    gordurasTotais: 0,
    gordurasSaturadas: 0,
    gordurasTrans: 0,
    fibras: 0,
    sodio: 0,
  });

  // Lógica de FOP (Lupa Frontal)
  const [lupas, setLupas] = useState([]);

  useEffect(() => {
    if (id) carregarRotulo();
  }, [id]);

  useEffect(() => {
    // Calcular Lupa Frontal dinamicamente sempre que os dados nutricionais mudarem
    calcularLupas();
  }, [formData.acucaresAdicionados, formData.gordurasSaturadas, formData.sodio, formData.estadoFisico]);

  const carregarRotulo = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "rotulos", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setFormData({ ...formData, ...snap.data() });
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularLupas = () => {
    const novasLupas = [];
    const isSolido = formData.estadoFisico === "Solido";
    
    // Limites ANVISA
    const limiteAcucar = isSolido ? 15 : 7.5; // g/100g ou 100ml
    const limiteGordura = isSolido ? 6 : 3;   // g/100g ou 100ml
    const limiteSodio = isSolido ? 600 : 300; // mg/100g ou 100ml

    if (parseFloat(formData.acucaresAdicionados) >= limiteAcucar) novasLupas.push("ALTO EM AÇÚCAR ADICIONADO");
    if (parseFloat(formData.gordurasSaturadas) >= limiteGordura) novasLupas.push("ALTO EM GORDURA SATURADA");
    if (parseFloat(formData.sodio) >= limiteSodio) novasLupas.push("ALTO EM SÓDIO");

    setLupas(novasLupas);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSalvar = async () => {
    if (!userData?.uid) return;
    try {
      setSalvando(true);
      const docId = id || crypto.randomUUID();
      const ref = doc(db, "rotulos", docId);
      
      const statusFinal = lupas.length > 0 ? "Requer Lupa" : "Aprovado";

      await setDoc(ref, {
        ...formData,
        lupas,
        status: formData.status === "Rascunho" ? statusFinal : formData.status,
        userId: userData.uid,
        atualizadoEm: serverTimestamp(),
      }, { merge: true });

      navigate("/rotulos");
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <Box sx={{ p: 4, textAlign: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/rotulos")} sx={{ color: COR }}>
          Voltar
        </Button>
      </Box>

      <Typography variant="h5" fontWeight={900} color={COR} mb={1}>
        {id ? "Editar Rótulo / Produto" : "Validar Novo Rótulo"}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Preencha os dados por 100g ou 100ml. O sistema validará a RDC 429/2020 e a RDC 727/2022 automaticamente.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {passos.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, borderRadius: 4, border: "1px solid #e8f5e9" }} elevation={0}>
        
        {/* Passo 0: Dados Gerais */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nome do Produto / Denominação de Venda" name="nomeProduto" value={formData.nomeProduto} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Marca" name="marca" value={formData.marca} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Categoria (ex: Laticínio, Cárneo)" name="categoria" value={formData.categoria} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado Físico do Produto</InputLabel>
                <Select name="estadoFisico" value={formData.estadoFisico} onChange={handleChange} label="Estado Físico do Produto">
                  <MenuItem value="Solido">Sólido / Semissólido (Cálculo por 100g)</MenuItem>
                  <MenuItem value="Liquido">Líquido (Cálculo por 100ml)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}

        {/* Passo 1: Alérgenos */}
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Atenção RDC 727/2022:</strong> Alergênicos devem estar em caixa alta e negrito no painel principal ou logo após a lista de ingredientes.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel 
                control={<Switch checked={formData.contemGluten} onChange={handleChange} name="contemGluten" />}
                label="O Produto CONTÉM GLÚTEN?"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel 
                control={<Switch checked={formData.contemLactose} onChange={handleChange} name="contemLactose" />}
                label="O Produto CONTÉM LACTOSE? (> 100mg/100g)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                multiline 
                rows={2} 
                label="Declaração de Alergênicos (ALÉRGICOS: CONTÉM...)" 
                name="alergenicos" 
                value={formData.alergenicos} 
                onChange={handleChange} 
                placeholder="Ex: ALÉRGICOS: CONTÉM LEITE E DERIVADOS DE SOJA."
              />
            </Grid>
          </Grid>
        )}

        {/* Passo 2: Nutricional */}
        {activeStep === 2 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Insira os valores exatamente por <strong>100{formData.estadoFisico === "Solido" ? "g" : "ml"}</strong> do produto pronto para consumo.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Valor Energético (kcal)" name="valorEnergetico" value={formData.valorEnergetico} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Carboidratos (g)" name="carboidratos" value={formData.carboidratos} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Açúcares Totais (g)" name="acucaresTotais" value={formData.acucaresTotais} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Açúcares Adicionados (g)" name="acucaresAdicionados" value={formData.acucaresAdicionados} onChange={handleChange} sx={{ bgcolor: "#fff3e0" }} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Proteínas (g)" name="proteinas" value={formData.proteinas} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Gorduras Totais (g)" name="gordurasTotais" value={formData.gordurasTotais} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Gorduras Saturadas (g)" name="gordurasSaturadas" value={formData.gordurasSaturadas} onChange={handleChange} sx={{ bgcolor: "#fff3e0" }} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Gorduras Trans (g)" name="gordurasTrans" value={formData.gordurasTrans} onChange={handleChange} />
              </Grid>
              <Grid item xs={6} md={4}>
                <TextField fullWidth type="number" label="Fibras (g)" name="fibras" value={formData.fibras} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Sódio (mg)" name="sodio" value={formData.sodio} onChange={handleChange} sx={{ bgcolor: "#fff3e0" }} />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Passo 3: Validação Final */}
        {activeStep === 3 && (
          <Box textAlign="center" py={4}>
            {lupas.length > 0 ? (
              <Box>
                <WarningAmberIcon sx={{ fontSize: 64, color: "#d32f2f", mb: 2 }} />
                <Typography variant="h5" fontWeight={900} color="#d32f2f" mb={2}>
                  RÓTULO EXIGE LUPA FRONTAL (FOP)
                </Typography>
                <Typography variant="body1" mb={3}>
                  Os limites regulatórios da ANVISA foram ultrapassados. O painel principal da sua embalagem DEVE exibir o selo de advertência para:
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap", mb: 4 }}>
                  {lupas.map((lupa, i) => (
                    <Chip key={i} label={lupa} sx={{ bgcolor: "#000", color: "#fff", fontWeight: 900, fontSize: "1rem", py: 2 }} />
                  ))}
                </Box>
                <Typography variant="caption" color="error" display="block">
                  Atenção: É proibido usar alegações nutricionais (claims) como "Rico em..." ou "Zero..." para os nutrientes que receberam a lupa.
                </Typography>
              </Box>
            ) : (
              <Box>
                <CheckCircleIcon sx={{ fontSize: 64, color: "#2e7d32", mb: 2 }} />
                <Typography variant="h5" fontWeight={900} color="#2e7d32" mb={2}>
                  LUPA FRONTAL NÃO EXIGIDA!
                </Typography>
                <Typography variant="body1">
                  Parabéns! A formulação deste produto não ultrapassa os limiares de Sódio, Gorduras Saturadas ou Açúcares Adicionados estabelecidos pela RDC 429/2020.
                </Typography>
              </Box>
            )}
          </Box>
        )}

      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button 
          disabled={activeStep === 0} 
          onClick={() => setActiveStep(prev => prev - 1)}
          sx={{ fontWeight: 700 }}
        >
          Voltar Passo
        </Button>
        
        {activeStep < 3 ? (
          <Button 
            variant="contained" 
            onClick={() => setActiveStep(prev => prev + 1)}
            sx={{ bgcolor: COR, borderRadius: 2, fontWeight: 700 }}
          >
            Próximo Passo
          </Button>
        ) : (
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSalvar}
            disabled={salvando}
            sx={{ bgcolor: "#2e7d32", borderRadius: 2, fontWeight: 900 }}
          >
            {salvando ? "Salvando..." : "Finalizar Rótulo"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
