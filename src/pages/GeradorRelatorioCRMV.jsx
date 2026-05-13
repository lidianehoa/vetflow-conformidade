import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, TextField, Alert, Stack
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedIcon from "@mui/icons-material/Verified";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { usePlano } from "../hooks/usePlano";
import BloqueioRecurso from "../components/BloqueioRecurso";
import { gerarSmartId } from "../data/checklistsRT";
import { gerarHash } from "../data/tcleModels";

export default function GeradorRelatorioCRMV() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useUserData();
  const { pode, planoMinimo } = usePlano(userData);

  const [loading, setLoading] = useState(true);
  const [unidade, setUnidade] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  
  // States para seletores
  const [auditSelecionada, setAuditSelecionada] = useState("");
  const [semestre, setSemestre] = useState("2026-1");
  const [parecerEditavel, setParecerEditavel] = useState("Atesto que o estabelecimento vem cumprindo satisfatoriamente com as normas higiênico-sanitárias vigentes, bem como mantendo as licenças regulatórias em dia. As não conformidades menores detectadas nas auditorias internas foram alvo de ações corretivas imediatas.");

  useEffect(() => {
    if (!userData?.uid || !userData?.selectedClinicaId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // Carregar dados da clínica selecionada
        const snapUnidade = await getDoc(doc(db, "clinicas", userData.selectedClinicaId));
        if (snapUnidade.exists()) {
          setUnidade({ id: snapUnidade.id, ...snapUnidade.data() });
        }

        // Carregar auditorias filtradas por clinicaId
        const q = query(
          collection(db, "auditorias"),
          where("userId", "==", userData.uid),
          where("clinicaId", "==", userData.selectedClinicaId),
          orderBy("criadoEm", "desc")
        );
        const snapAud = await getDocs(q);
        setAuditorias(snapAud.docs.map((d) => ({ id: d.id, ...d.data() })));

      } catch (err) {
        console.error("Erro ao carregar dados no gerador:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userData?.uid, userData?.selectedClinicaId]);

  const handlePrint = () => {
    window.print();
  };

  // Helper para formatar data
  const formatarData = (timestamp) => {
    if (!timestamp) return "—";
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return data.toLocaleDateString("pt-BR");
  };

  if (!pode("gerarDocumento")) {
    return <BloqueioRecurso recurso="Relatórios Oficiais CRMV" planoMinimo={planoMinimo("gerarDocumento")} />;
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#1b4332" }} />
      </Box>
    );
  }

  const clinicaAtual = unidade;
  const auditoriasFiltradas = auditorias;

  const renderFiltros = () => {
    return (
      <Box sx={{ mb: 3 }} className="no-print">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Alert severity="info" sx={{ py: 0.5, borderRadius: 2 }}>
              Gerando relatório para: <strong>{clinicaAtual?.nomeFantasia || clinicaAtual?.razaoSocial || "..."}</strong>
            </Alert>
          </Grid>
          
          {id === "constatacao" && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Selecione a Auditoria Crítica</InputLabel>
                <Select
                  value={auditSelecionada}
                  label="Selecione a Auditoria Crítica"
                  onChange={(e) => setAuditSelecionada(e.target.value)}
                >
                  {auditoriasFiltradas.filter(a => a.score < 80).map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {formatarData(a.criadoEm)} — {a.nomeProntuario || a.smartId} (Score: {a.score}%)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {id === "atividades" && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Período de Apuração</InputLabel>
                <Select
                  value={semestre}
                  label="Período de Apuração"
                  onChange={(e) => setSemestre(e.target.value)}
                >
                  <MenuItem value="1º Semestre de 2026">1º Semestre de 2026</MenuItem>
                  <MenuItem value="2º Semestre de 2026">2º Semestre de 2026</MenuItem>
                  <MenuItem value="2º Semestre de 2025">2º Semestre de 2025</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        {(id === "atividades" || id === "constatacao") && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Editar Parecer Técnico / Observações"
              fullWidth
              multiline
              rows={3}
              value={parecerEditavel}
              onChange={(e) => setParecerEditavel(e.target.value)}
              size="small"
            />
          </Box>
        )}
      </Box>
    );
  };

  const renderDocumento = () => {
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    const nomeRT = userData?.rtNome || userData?.displayName || "Responsável Técnico";
    const crmvRT = userData?.rtCrmv || "CRMV/XX Nº 00000";
    const nomeEmpresa = clinicaAtual?.razaoSocial || "Razão Social Não Informada";
    const cnpjEmpresa = clinicaAtual?.cnpj || "00.000.000/0000-00";
    const sId = gerarSmartId(userData?.uid);

    if (id === "atividades") {
      return (
        <Box>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            RELATÓRIO DE ATIVIDADES DO RESPONSÁVEL TÉCNICO
          </Typography>
          <Typography variant="body1" align="center" mb={1}>
            Período: {semestre}
          </Typography>
          <Typography variant="caption" display="block" align="center" color="text.secondary" mb={4}>
            ID DE RASTREABILIDADE: {sId}
          </Typography>

          <Typography variant="h6" fontWeight="bold" mt={3} mb={1}>1. DADOS DA EMPRESA</Typography>
          <Typography variant="body1"><strong>Razão Social:</strong> {nomeEmpresa}</Typography>
          <Typography variant="body1"><strong>CNPJ:</strong> {cnpjEmpresa}</Typography>
          <Typography variant="body1"><strong>Endereço:</strong> {clinicaAtual?.endereco || "—"}</Typography>

          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>2. FREQUÊNCIA DE VISITAS TÉCNICAS</Typography>
          <Typography variant="body1" mb={2}>
            Durante o período supramencionado, foram realizadas as seguintes visitas técnicas de auditoria:
          </Typography>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left" }}>Data da Visita</th>
                <th style={{ border: "1px solid #000", padding: "8px", textAlign: "left" }}>Área/Objeto Auditado</th>
                <th style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>Score Obtido</th>
              </tr>
            </thead>
            <tbody>
              {auditoriasFiltradas.map(a => (
                <tr key={a.id}>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>{formatarData(a.criadoEm)}</td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>{a.nomeProntuario || "Auditoria Geral"}</td>
                  <td style={{ border: "1px solid #000", padding: "8px", textAlign: "center" }}>{a.score}%</td>
                </tr>
              ))}
              {auditoriasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ border: "1px solid #000", padding: "16px", textAlign: "center" }}>
                    Nenhuma auditoria registrada para este estabelecimento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>3. PARECER TÉCNICO GERAL</Typography>
          <Typography variant="body1" mb={4} sx={{ textAlign: "justify", whiteSpace: "pre-wrap" }}>
            {parecerEditavel}
          </Typography>

          <Box mt={8} textAlign="center">
            <Typography variant="body1">___________________________________________________</Typography>
            <Typography variant="body1" fontWeight="bold">{nomeRT}</Typography>
            <Typography variant="body1">{crmvRT}</Typography>
            <Typography variant="body2">{clinicaAtual?.cidade || "Cidade"} - {clinicaAtual?.uf || "UF"}, {dataAtual}</Typography>
            <Typography variant="caption" sx={{ mt: 2, display: "block", color: "#666" }}>
              Autenticado via VERTOS OS | Hash: {gerarHash(sId + cnpjEmpresa + dataAtual)}
            </Typography>
          </Box>
        </Box>
      );
    }

    if (id === "constatacao") {
      const aud = auditoriasFiltradas.find(a => a.id === auditSelecionada);
      
      if (!aud) {
        return <Alert severity="warning" className="no-print">Selecione uma auditoria no campo acima para gerar o termo.</Alert>;
      }

      return (
        <Box>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            TERMO DE CONSTATAÇÃO E NOTIFICAÇÃO
          </Typography>
          
          <Typography variant="body1" mt={4} sx={{ textAlign: "justify", lineHeight: 1.8 }}>
            Na condição de Médico Veterinário Responsável Técnico (RT), <strong>{nomeRT}</strong>, 
            inscrito(a) sob o <strong>{crmvRT}</strong>, formalizo através deste documento a constatação de não conformidades 
            críticas no estabelecimento <strong>{nomeEmpresa}</strong>, CNPJ <strong>{cnpjEmpresa}</strong>.
          </Typography>

          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>1. OCORRÊNCIA</Typography>
          <Typography variant="body1" sx={{ textAlign: "justify" }}>
            Durante a auditoria técnica realizada em <strong>{formatarData(aud.criadoEm)}</strong> (ID de Rastreabilidade: {aud.smartId}), 
            foi verificado o seguinte cenário:
          </Typography>
          
          <Paper elevation={0} sx={{ border: "1px solid #000", p: 2, mt: 2, mb: 3, background: "#fafafa" }}>
            <Typography variant="body2" sx={{ fontStyle: "italic", whiteSpace: "pre-wrap" }}>
              "{parecerEditavel}"
            </Typography>
          </Paper>

          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>2. NOTIFICAÇÃO E PRAZOS</Typography>
          <Typography variant="body1" sx={{ textAlign: "justify", lineHeight: 1.8 }}>
            Considerando as exigências da Resolução CFMV vigente e o potencial risco sanitário, 
            notifico a administração da empresa para que proceda com a adequação imediata num prazo 
            improrrogável de 15 dias. A recusa no atendimento desta notificação ensejará o 
            encaminhamento deste termo ao Conselho Regional de Medicina Veterinária (CRMV), bem como 
            aos órgãos de vigilância competentes.
          </Typography>

          <Box mt={8} textAlign="center">
            <Typography variant="body1">___________________________________________________</Typography>
            <Typography variant="body1" fontWeight="bold">{nomeRT}</Typography>
            <Typography variant="body1">Responsável Técnico</Typography>
          </Box>
          <Box mt={6} textAlign="center">
            <Typography variant="body1">___________________________________________________</Typography>
            <Typography variant="body1" fontWeight="bold">Representante Legal da Empresa</Typography>
            <Typography variant="body1">Ciente em: ____/____/________</Typography>
          </Box>
        </Box>
      );
    }

    if (id === "plano_trabalho") {
      return (
        <Box>
          <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
            PLANO DE TRABALHO DO RESPONSÁVEL TÉCNICO
          </Typography>
          
          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>1. OBJETIVO</Typography>
          <Typography variant="body1" sx={{ textAlign: "justify" }}>
            Estabelecer as diretrizes operacionais, sanitárias e éticas para o exercício da Responsabilidade 
            Técnica no estabelecimento <strong>{nomeEmpresa}</strong>, CNPJ <strong>{cnpjEmpresa}</strong>.
          </Typography>

          <Typography variant="h6" fontWeight="bold" mt={4} mb={1}>2. ROTINA DE INSPEÇÃO</Typography>
          <Typography variant="body1" sx={{ textAlign: "justify" }}>
            As visitas ocorrerão conforme carga horária estabelecida em contrato (Anotação de Responsabilidade Técnica), 
            visando a inspeção das instalações, monitoramento da cadeia de frio (vacinas), descarte de resíduos (PGRSS) 
            e verificação rigorosa do Livro de Psicotrópicos (Port. 344/98).
          </Typography>

          <Box mt={8} textAlign="center">
            <Typography variant="body1">___________________________________________________</Typography>
            <Typography variant="body1" fontWeight="bold">{nomeRT}</Typography>
            <Typography variant="body1">{crmvRT}</Typography>
          </Box>
        </Box>
      );
    }

    if (id === "livro_visitas") {
      return (
        <Box>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom sx={{ mt: 10 }}>
            LIVRO DE REGISTRO DE VISITAS TÉCNICAS
          </Typography>
          
          <Box mt={10} textAlign="center" p={4} sx={{ border: "2px solid #000" }}>
            <Typography variant="h6" fontWeight="bold">ESTABELECIMENTO</Typography>
            <Typography variant="body1" mt={1}>{nomeEmpresa}</Typography>
            <Typography variant="body1">CNPJ: {cnpjEmpresa}</Typography>
            
            <Typography variant="h6" fontWeight="bold" mt={4}>RESPONSÁVEL TÉCNICO</Typography>
            <Typography variant="body1" mt={1}>{nomeRT}</Typography>
            <Typography variant="body1">{crmvRT}</Typography>
          </Box>

          <Typography variant="caption" display="block" align="center" mt={4}>
            Este livro é de caráter oficial. Deve permanecer no estabelecimento à disposição da fiscalização do CRMV e Vigilância Sanitária.
          </Typography>
        </Box>
      );
    }

    return <Typography>Tipo de relatório não encontrado.</Typography>;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: "auto" }}>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 2cm; }
            .no-print { display: none !important; }
            @page { margin: 0; }
          }
        `}
      </style>

      {/* Ações superiores - Não aparecem na impressão */}
      <Box className="no-print" sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/relatorios-crmv")}
          sx={{ color: "#1b4332", fontWeight: 700 }}
        >
          Voltar
        </Button>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ background: "#1b4332", color: "#fff", borderRadius: 2, fontWeight: 700 }}
        >
          Imprimir / Salvar PDF
        </Button>
      </Box>

      {renderFiltros()}

      {/* Área do Documento - Formato A4 */}
      <Paper 
        className="print-area"
        elevation={3} 
        sx={{ 
          p: { xs: 4, md: 8 }, 
          background: "#fff", 
          minHeight: "297mm", 
          width: "210mm", 
          mx: "auto",
          color: "#000",
          "& *": { fontFamily: "'Times New Roman', serif" } 
        }}
      >
        {renderDocumento()}
      </Paper>
    </Box>
  );
}
