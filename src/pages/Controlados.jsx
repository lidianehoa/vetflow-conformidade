import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Tabs, Tab, Button, Stack, Paper,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, CircularProgress, Alert,
  InputAdornment, LinearProgress,
} from "@mui/material";
import AddIcon          from "@mui/icons-material/Add";
import PrintIcon        from "@mui/icons-material/Print";
import WarningIcon      from "@mui/icons-material/Warning";
import SearchIcon       from "@mui/icons-material/Search";
import ScienceIcon      from "@mui/icons-material/Science";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FileUploadIcon   from "@mui/icons-material/FileUpload";
import InventoryIcon    from "@mui/icons-material/Inventory";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import {
  collection, addDoc, getDocs, query, where,
  orderBy, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useUserData } from "../components/ProtectedRoute";
import { gerarSmartId } from "../data/checklistsRT";
import { gerarHash } from "../data/tcleModels";

const COR    = "#1b4332";
const COR2   = "#2d6a4f";
const ACENTO = "#52b788";

// ── Substâncias controladas comuns em veterinária ─────────────
const SUBSTANCIAS = [
  "Ketamina 10%",
  "Midazolam 5mg/mL",
  "Acepromazina 1%",
  "Tramadol 50mg/mL",
  "Morfina 10mg/mL",
  "Metadona 10mg/mL",
  "Fentanil 0,05mg/mL",
  "Propofol 10mg/mL",
  "Tiopental",
  "Diazepam 5mg/mL",
  "Fenobarbital 100mg/mL",
  "Outra (especificar)",
];

const PROCEDIMENTOS = [
  "Anestesia geral — cirurgia eletiva",
  "Anestesia geral — emergência",
  "Sedação para exame diagnóstico",
  "Sedação para curativo/procedimento",
  "MPA (Medicação pré-anestésica)",
  "Analgesia pós-operatória",
  "Controle de convulsão",
  "Eutanásia humanitária",
  "Outro",
];

// ════════════════════════════════════════════════════════════════
// ABA 1 — MOVIMENTAÇÕES
// ════════════════════════════════════════════════════════════════

function AbaMovimentacoes({ uid, unidade, userData }) {
  const [movs,    setMovs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog,  setDialog]  = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [mesRef,  setMesRef]  = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const emptyForm = {
    tipo: "saida", substancia: "", concentracao: "",
    quantidade: "", unidade: "mL", numeroLote: "",
    nomeAnimal: "", especie: "", responsavelAnimal: "",
    procedimento: "", medicoResponsavel: unidade?.rtNome || "",
    crmvMedico: unidade?.crmv || "", receitaNumero: "",
    dataHora: new Date().toISOString().slice(0, 16), observacoes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const carregar = async () => {
    setLoading(true);
    try {
      const [ano, mes] = mesRef.split("-");
      const inicio = new Date(ano, mes - 1, 1);
      const fim    = new Date(ano, mes, 1);
      const q = query(
        collection(db, "controlados", uid, "movimentacoes"),
        where("criadoEm", ">=", inicio),
        where("criadoEm", "<",  fim),
        orderBy("criadoEm", "desc")
      );
      const snap = await getDocs(q);
      setMovs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, [mesRef]);

  const salvar = async () => {
    if (!form.substancia || !form.quantidade || !form.nomeAnimal) {
      alert("Preencha substância, quantidade e nome do animal."); return;
    }
    setSaving(true);
    try {
      // Se for PRO e for SAÍDA, tenta abater do estoque automaticamente
      if (userData?.plan === "pro" && form.tipo === "saida") {
        const estoqueRef = collection(db, "controlados", uid, "estoque");
        const qE = query(estoqueRef, where("substancia", "==", form.substancia), where("numeroLote", "==", form.numeroLote));
        const snapE = await getDocs(qE);
        
        if (!snapE.empty) {
          const frascoDoc = snapE.docs[0];
          const frascoData = frascoDoc.data();
          const novoVolume = Math.max(0, (frascoData.volumeRestante || 0) - parseFloat(form.quantidade));
          await updateDoc(doc(db, "controlados", uid, "estoque", frascoDoc.id), {
            volumeRestante: novoVolume,
            status: novoVolume <= 0 ? "zerado" : frascoData.status
          });
        }
      }

      await addDoc(collection(db, "controlados", uid, "movimentacoes"), {
        ...form,
        quantidade: parseFloat(form.quantidade),
        dataHora:   new Date(form.dataHora),
        criadoEm:   serverTimestamp(),
        userId:     uid,
      });
      setDialog(false);
      setForm(emptyForm);
      carregar();
    } catch (e) { console.error(e); alert("Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const imprimir = () => {
    const [ano, mes] = mesRef.split("-");
    const nomeMes = new Date(ano, mes - 1).toLocaleString("pt-BR", { month: "long", year: "numeric" });
    const linhas = movs.map((m, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${m.dataHora?.toDate ? m.dataHora.toDate().toLocaleDateString("pt-BR") : m.dataHora}</td>
        <td>${m.tipo === "entrada" ? "ENTRADA" : "SAÍDA"}</td>
        <td>${m.substancia}</td>
        <td>${m.quantidade} ${m.unidade}</td>
        <td>${m.numeroLote || "—"}</td>
        <td>${m.nomeAnimal} (${m.especie})</td>
        <td>${m.responsavelAnimal}</td>
        <td>${m.procedimento}</td>
        <td>${m.medicoResponsavel} — ${m.crmvMedico}</td>
        <td>${m.receitaNumero || "—"}</td>
      </tr>`).join("");

    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>Relatório de Controlados — ${nomeMes}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 10pt; margin: 20px; }
  h2 { color: #1b4332; font-size: 14pt; margin-bottom: 4px; text-transform: uppercase; }
  .smart-id { font-size: 7pt; color: #666; margin-bottom: 12px; }
  h4 { color: #444; font-size: 10pt; margin: 2px 0 16px; font-weight: normal; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th { background: #1b4332; color: white; padding: 6px 4px; font-size: 8pt; text-align: left; }
  td { padding: 5px 4px; font-size: 8pt; border-bottom: 0.5px solid #ddd; vertical-align: top; }
  tr:nth-child(even) td { background: #f9fdf9; }
  .footer { margin-top: 40px; font-size: 8pt; color: #888; }
  .assinatura { margin-top: 60px; text-align: right; }
  .linha { border-top: 1px solid #000; width: 280px; display: inline-block; margin-bottom: 4px; }
  @media print { body { margin: 10px; } }
</style></head><body>
<h2>RELATÓRIO DE MOVIMENTAÇÃO DE MEDICAMENTOS CONTROLADOS</h2>
<div class="smart-id">ID DE RASTREABILIDADE: ${gerarSmartId(userData.uid)}</div>
<h4>${unidade?.razaoSocial || "Estabelecimento"} &nbsp;|&nbsp; Reg. SIPEAGRO: ${unidade?.numSipeagro || "—"} &nbsp;|&nbsp; Período: ${nomeMes}</h4>
<table>
<thead><tr>
  <th>#</th><th>Data</th><th>Tipo</th><th>Substância</th><th>Qtd</th>
  <th>Lote</th><th>Animal/Espécie</th><th>Responsável</th><th>Procedimento</th>
  <th>Médico/CRMV</th><th>Receita</th>
</tr></thead>
<tbody>${linhas}</tbody>
</table>
<div class="footer">
  Ref.: Portaria SVS/MS 344/1998 · IN MAPA 35/2015 · IN MAPA 55/2022<br>
  Documento gerado pelo VERTOS — Veterinary RT OS · ${new Date().toLocaleDateString("pt-BR")}<br>
  <span style="font-size: 7pt; color: #888;">Hash Autenticidade: ${gerarHash(gerarSmartId(userData.uid) + (unidade?.cnpj || "") + nomeMes)}</span>
</div>
<div class="assinatura">
  <div class="linha"></div><br>
  ${unidade?.rtNome || "Médico(a) Veterinário(a)"}<br>
  CRMV: ${unidade?.crmv || "—"}<br>
  Responsável Técnico(a)
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`);
    w.document.close();
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Mês de referência"
          type="month"
          size="small"
          value={mesRef}
          onChange={e => setMesRef(e.target.value)}
          sx={{ width: 200 }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={imprimir}
            disabled={movs.length === 0}
            sx={{ borderColor: COR, color: COR, borderRadius: "10px",
                  textTransform: "none", fontWeight: 700 }}
          >
            Exportar Relatório MAPA
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialog(true)}
            sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: COR2 } }}
          >
            Nova Movimentação
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: ACENTO }} />
        </Box>
      ) : movs.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: "16px",
                                        borderStyle: "dashed" }}>
          <ScienceIcon sx={{ fontSize: 48, color: "#e0e0e0", mb: 1 }} />
          <Typography sx={{ color: "#aaa" }}>
            Nenhuma movimentação registrada neste mês.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined"
          sx={{ borderRadius: "16px", fontSize: "0.82rem" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                {["Data/Hora","Tipo","Substância","Qtd","Lote",
                  "Animal","Procedimento","Médico","Receita"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", color: COR }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {movs.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                    {m.dataHora?.toDate
                      ? m.dataHora.toDate().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                      : m.dataHora}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={m.tipo === "entrada" ? "Entrada" : "Saída"}
                      size="small"
                      sx={{
                        bgcolor: m.tipo === "entrada" ? "#e3f2fd" : "#fff3e0",
                        color:   m.tipo === "entrada" ? "#0d47a1" : "#e65100",
                        fontWeight: 700, fontSize: "0.65rem", height: 20,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                    {m.substancia}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {m.quantidade} {m.unidade}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#888" }}>
                    {m.numeroLote || "—"}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {m.nomeAnimal}
                    </Typography>
                    <Typography sx={{ fontSize: "0.68rem", color: "#888" }}>
                      {m.especie} · {m.responsavelAnimal}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>{m.procedimento}</TableCell>
                  <TableCell sx={{ fontSize: "0.75rem" }}>
                    {m.medicoResponsavel}<br/>
                    <span style={{ color: "#888", fontSize: "0.68rem" }}>{m.crmvMedico}</span>
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.75rem", color: "#888" }}>
                    {m.receitaNumero || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Dialog nova movimentação ── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 900, color: COR }}>
          Nova Movimentação de Controlado
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {/* Tipo */}
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo de movimentação</InputLabel>
              <Select label="Tipo de movimentação" value={form.tipo}
                onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <MenuItem value="entrada">Entrada (compra/recebimento)</MenuItem>
                <MenuItem value="saida">Saída (uso em procedimento)</MenuItem>
              </Select>
            </FormControl>

            {/* Substância + concentração */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl size="small" sx={{ flex: 2 }}>
                <InputLabel>Substância controlada *</InputLabel>
                <Select label="Substância controlada *" value={form.substancia}
                  onChange={e => setForm({ ...form, substancia: e.target.value })}>
                  {SUBSTANCIAS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Concentração" sx={{ flex: 1 }}
                value={form.concentracao}
                onChange={e => setForm({ ...form, concentracao: e.target.value })}
                placeholder="ex: 10mg/mL" />
            </Stack>

            {/* Quantidade + unidade + lote */}
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Quantidade *" type="number"
                sx={{ flex: 1 }} value={form.quantidade}
                onChange={e => setForm({ ...form, quantidade: e.target.value })} />
              <FormControl size="small" sx={{ width: 140 }}>
                <InputLabel>Unidade</InputLabel>
                <Select label="Unidade" value={form.unidade}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}>
                  <MenuItem value="mL">mL</MenuItem>
                  <MenuItem value="comprimido">Comprimido</MenuItem>
                  <MenuItem value="ampola">Ampola</MenuItem>
                  <MenuItem value="frasco">Frasco</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" label="Nº do Lote" sx={{ flex: 1 }}
                value={form.numeroLote}
                onChange={e => setForm({ ...form, numeroLote: e.target.value })} />
            </Stack>

            {/* Animal */}
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: COR, mt: 1 }}>
              Identificação do Paciente
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Nome do animal *" sx={{ flex: 2 }}
                value={form.nomeAnimal}
                onChange={e => setForm({ ...form, nomeAnimal: e.target.value })} />
              <TextField size="small" label="Espécie" sx={{ flex: 1 }}
                value={form.especie}
                onChange={e => setForm({ ...form, especie: e.target.value })} />
              <TextField size="small" label="Responsável pelo animal" sx={{ flex: 2 }}
                value={form.responsavelAnimal}
                onChange={e => setForm({ ...form, responsavelAnimal: e.target.value })} />
            </Stack>

            {/* Procedimento */}
            <FormControl size="small" fullWidth>
              <InputLabel>Procedimento realizado</InputLabel>
              <Select label="Procedimento realizado" value={form.procedimento}
                onChange={e => setForm({ ...form, procedimento: e.target.value })}>
                {PROCEDIMENTOS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Médico + CRMV + data + receita */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Médico responsável" sx={{ flex: 2 }}
                value={form.medicoResponsavel}
                onChange={e => setForm({ ...form, medicoResponsavel: e.target.value })} />
              <TextField size="small" label="CRMV" sx={{ flex: 1 }}
                value={form.crmvMedico}
                onChange={e => setForm({ ...form, crmvMedico: e.target.value })} />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField size="small" label="Data e hora *" type="datetime-local"
                sx={{ flex: 1 }} value={form.dataHora}
                InputLabelProps={{ shrink: true }}
                onChange={e => setForm({ ...form, dataHora: e.target.value })} />
              <TextField size="small" label="Nº da receita veterinária" sx={{ flex: 1 }}
                value={form.receitaNumero}
                onChange={e => setForm({ ...form, receitaNumero: e.target.value })} />
            </Stack>

            <TextField size="small" label="Observações" multiline rows={2} fullWidth
              value={form.observacoes}
              onChange={e => setForm({ ...form, observacoes: e.target.value })} />

            <Alert severity="info" sx={{ borderRadius: "10px" }}>
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                Ref.: Portaria SVS/MS 344/1998 · IN MAPA 35/2015 · IN MAPA 55/2022<br />
                Este lançamento compõe o Livro de Registro de Psicotrópicos e deve ser
                enviado ao SIPEAGRO mensalmente.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: "#888", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar} disabled={saving}
            sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: COR2 } }}>
            {saving ? "Salvando..." : "Registrar Movimentação"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════
// ABA 2 — ESTOQUE DE CONTROLADOS
// ════════════════════════════════════════════════════════════════

function AbaEstoque({ uid }) {
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog,  setDialog]  = useState(false);
  const [saving,  setSaving]  = useState(false);

  const emptyForm = {
    substancia: "", concentracao: "", fabricante: "",
    numeroLote: "", dataValidade: "", dataAbertura: "",
    volumeTotal: "", volumeRestante: "", unidade: "mL",
    localArmazenamento: "Armário de controlados",
  };
  const [form, setForm] = useState(emptyForm);

  const handleImportXML = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Busca produtos (det) que contenham tag <med> (medicamentos)
        const produtos = xmlDoc.getElementsByTagName("det");
        const novosItens = [];

        for (let i = 0; i < produtos.length; i++) {
          const prod = produtos[i].getElementsByTagName("prod")[0];
          const med = produtos[i].getElementsByTagName("med")[0];
          
          if (med) {
            const nome = prod.getElementsByTagName("xProd")[0]?.textContent;
            const lote = med.getElementsByTagName("nLote")[0]?.textContent;
            const validade = med.getElementsByTagName("dVal")[0]?.textContent;
            const qtd = prod.getElementsByTagName("qCom")[0]?.textContent;
            const unidade = prod.getElementsByTagName("uCom")[0]?.textContent;

            novosItens.push({
              substancia: nome || "Medicamento Importado",
              numeroLote: lote || "",
              dataValidade: validade || "",
              volumeTotal: parseFloat(qtd) || 0,
              volumeRestante: parseFloat(qtd) || 0,
              unidade: unidade || "mL",
              fabricante: xmlDoc.getElementsByTagName("xNome")[0]?.textContent || "", // Nome do emitente
              localArmazenamento: "Armário de controlados",
              status: "ativo",
              criadoEm: new Date(),
              userId: uid
            });
          }
        }

        if (novosItens.length === 0) {
          alert("Nenhum medicamento com tag <med> encontrado no XML.");
          return;
        }

        if (window.confirm(`Deseja importar ${novosItens.length} medicamentos encontrados na NFe?`)) {
          setLoading(true);
          for (const item of novosItens) {
            await addDoc(collection(db, "controlados", uid, "estoque"), {
              ...item,
              criadoEm: serverTimestamp()
            });
          }
          alert("Importação concluída!");
          carregar();
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao processar o XML da NFe.");
      }
    };
    reader.readAsText(file);
  };

  const carregar = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "controlados", uid, "estoque"), orderBy("criadoEm", "desc"))
      );
      setEstoque(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.substancia || !form.numeroLote || !form.dataValidade) {
      alert("Preencha substância, lote e validade."); return;
    }
    setSaving(true);
    try {
      const agora = new Date();
      const validade = new Date(form.dataValidade);
      const status = validade < agora ? "vencido"
        : parseFloat(form.volumeRestante) <= 0 ? "zerado" : "ativo";
      await addDoc(collection(db, "controlados", uid, "estoque"), {
        ...form,
        volumeTotal:     parseFloat(form.volumeTotal) || 0,
        volumeRestante:  parseFloat(form.volumeRestante || form.volumeTotal) || 0,
        status,
        criadoEm:        serverTimestamp(),
        userId:          uid,
      });
      setDialog(false);
      setForm(emptyForm);
      carregar();
    } catch (e) { console.error(e); alert("Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const hoje = new Date();
  const getStatus = (item) => {
    const validade = new Date(item.dataValidade);
    if (validade < hoje) return { label: "Vencido", cor: "error" };
    const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
    if (diff <= 30) return { label: `Vence em ${Math.ceil(diff)}d`, cor: "warning" };
    if ((item.volumeRestante / item.volumeTotal) <= 0.1)
      return { label: "Estoque crítico", cor: "warning" };
    return { label: "Em estoque", cor: "success" };
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontSize: "0.88rem", color: "#888" }}>
          {estoque.filter(e => e.status === "ativo").length} item(s) ativo(s) em estoque
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            component="label" 
            startIcon={<FileUploadIcon />}
            sx={{ borderColor: COR, color: COR, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            Importar NFe (XML)
            <input type="file" accept=".xml" hidden onChange={handleImportXML} />
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}
            sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: COR2 } }}>
            Registrar Frasco/Embalagem
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: ACENTO }} />
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {estoque.map(item => {
            const st = getStatus(item);
            const pct = item.volumeTotal > 0
              ? Math.round((item.volumeRestante / item.volumeTotal) * 100) : 0;
            return (
              <Paper key={item.id} variant="outlined"
                sx={{ p: 2, borderRadius: "14px",
                      borderColor: st.cor === "error" ? "#f7c1c1" : "#e0e0e0" }}>
                <Stack direction="row" justifyContent="space-between"
                       alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: COR }}>
                      {item.substancia}
                      {item.concentracao && (
                        <span style={{ color: "#888", fontWeight: 400,
                                       fontSize: "0.8rem", marginLeft: 6 }}>
                          {item.concentracao}
                        </span>
                      )}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#888" }}>
                      Lote: {item.numeroLote} · Validade: {
                        new Date(item.dataValidade).toLocaleDateString("pt-BR")
                      } · {item.localArmazenamento}
                    </Typography>
                  </Box>
                  <Chip label={st.label} color={st.cor} size="small"
                    sx={{ fontWeight: 700, fontSize: "0.68rem", height: 20 }} />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LinearProgress variant="determinate" value={pct}
                    sx={{
                      flex: 1, height: 6, borderRadius: 3,
                      bgcolor: "#f0f0f0",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: pct > 30 ? ACENTO : pct > 10 ? "#f59e0b" : "#d32f2f",
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700,
                                    color: COR, minWidth: 120, textAlign: "right" }}>
                    {item.volumeRestante} / {item.volumeTotal} {item.unidade}
                  </Typography>
                </Stack>
              </Paper>
            );
          })}
          {estoque.length === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center",
                                            borderRadius: "16px", borderStyle: "dashed" }}>
              <InventoryIcon sx={{ fontSize: 48, color: "#e0e0e0", mb: 1 }} />
              <Typography sx={{ color: "#aaa" }}>
                Nenhum frasco cadastrado. Adicione o estoque de controlados.
              </Typography>
            </Paper>
          )}
        </Stack>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 900, color: COR }}>
          Registrar Frasco / Embalagem
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Substância *</InputLabel>
              <Select label="Substância *" value={form.substancia}
                onChange={e => setForm({ ...form, substancia: e.target.value })}>
                {SUBSTANCIAS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Concentração" sx={{ flex: 1 }}
                value={form.concentracao}
                onChange={e => setForm({ ...form, concentracao: e.target.value })} />
              <TextField size="small" label="Fabricante" sx={{ flex: 1 }}
                value={form.fabricante}
                onChange={e => setForm({ ...form, fabricante: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Nº do Lote *" sx={{ flex: 1 }}
                value={form.numeroLote}
                onChange={e => setForm({ ...form, numeroLote: e.target.value })} />
              <TextField size="small" label="Data de validade *" type="date"
                sx={{ flex: 1 }} InputLabelProps={{ shrink: true }}
                value={form.dataValidade}
                onChange={e => setForm({ ...form, dataValidade: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Data de abertura" type="date"
                sx={{ flex: 1 }} InputLabelProps={{ shrink: true }}
                value={form.dataAbertura}
                onChange={e => setForm({ ...form, dataAbertura: e.target.value })} />
              <TextField size="small" label="Volume total *" type="number"
                sx={{ flex: 1 }} value={form.volumeTotal}
                onChange={e => setForm({
                  ...form, volumeTotal: e.target.value,
                  volumeRestante: e.target.value
                })} />
              <FormControl size="small" sx={{ width: 110 }}>
                <InputLabel>Unidade</InputLabel>
                <Select label="Unidade" value={form.unidade}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}>
                  <MenuItem value="mL">mL</MenuItem>
                  <MenuItem value="comprimido">Comprimido</MenuItem>
                  <MenuItem value="ampola">Ampola</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField size="small" label="Local de armazenamento" fullWidth
              value={form.localArmazenamento}
              onChange={e => setForm({ ...form, localArmazenamento: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: "#888", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar} disabled={saving}
            sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: COR2 } }}>
            {saving ? "Salvando..." : "Registrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════
// ABA 3 — GTA (Guia de Trânsito Animal)
// ════════════════════════════════════════════════════════════════

function AbaGTA({ uid }) {
  const [gtas,    setGtas]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog,  setDialog]  = useState(false);
  const [saving,  setSaving]  = useState(false);

  const emptyForm = {
    numeroGTA: "", dataEmissao: "", dataValidade: "",
    municipioOrigem: "", ufOrigem: "", municipioDestino: "",
    ufDestino: "", nomeAnimal: "", especie: "", raca: "",
    sexo: "M", idade: "", identificacao: "",
    responsavelAnimal: "",
    finalidade: "Atendimento veterinário",
    observacoes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const carregar = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, "gtas", uid, "registros"), orderBy("criadoEm", "desc"))
      );
      setGtas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async () => {
    if (!form.numeroGTA || !form.nomeAnimal || !form.dataValidade) {
      alert("Preencha número da GTA, nome do animal e validade."); return;
    }
    setSaving(true);
    try {
      const agora   = new Date();
      const validade = new Date(form.dataValidade);
      const status  = validade < agora ? "vencida" : "vigente";
      await addDoc(collection(db, "gtas", uid, "registros"), {
        ...form, status, criadoEm: serverTimestamp(), userId: uid,
      });
      setDialog(false);
      setForm(emptyForm);
      carregar();
    } catch (e) { console.error(e); alert("Erro ao salvar."); }
    finally { setSaving(false); }
  };

  const hoje = new Date();
  const getStatusGTA = (item) => {
    const val = new Date(item.dataValidade);
    if (val < hoje) return { label: "Vencida", cor: "error" };
    const diff = (val - hoje) / (1000 * 60 * 60 * 24);
    if (diff <= 5) return { label: `Vence em ${Math.ceil(diff)}d`, cor: "warning" };
    return { label: "Vigente", cor: "success" };
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2, borderRadius: "10px" }}>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
          A GTA é obrigatória para animais oriundos de outro município ou estado.
          Ref.: IN MAPA 35/2015 · Decreto 5.741/2006 · Legislação estadual vigente.
        </Typography>
      </Alert>

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}
          sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                fontWeight: 700, "&:hover": { bgcolor: COR2 } }}>
          Registrar GTA
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: ACENTO }} />
        </Box>
      ) : gtas.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center",
                                        borderRadius: "16px", borderStyle: "dashed" }}>
          <LocalShippingIcon sx={{ fontSize: 48, color: "#e0e0e0", mb: 1 }} />
          <Typography sx={{ color: "#aaa" }}>
            Nenhuma GTA registrada. Registre as guias dos animais recebidos de outros estados.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined"
          sx={{ borderRadius: "16px" }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f5f5f5" }}>
              <TableRow>
                {["Nº GTA","Validade","Animal","Origem","Destino","Responsável","Status"].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.75rem", color: COR }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {gtas.map(g => {
                const st = getStatusGTA(g);
                return (
                  <TableRow key={g.id} hover>
                    <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {g.numeroGTA}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      {new Date(g.dataValidade).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                        {g.nomeAnimal}
                      </Typography>
                      <Typography sx={{ fontSize: "0.68rem", color: "#888" }}>
                        {g.especie} {g.raca && `· ${g.raca}`}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      {g.municipioOrigem}/{g.ufOrigem}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>
                      {g.municipioDestino}/{g.ufDestino}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem" }}>{g.responsavelAnimal}</TableCell>
                    <TableCell>
                      <Chip label={st.label} color={st.cor} size="small"
                        sx={{ fontWeight: 700, fontSize: "0.65rem", height: 20 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 900, color: COR }}>Registrar GTA</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Nº da GTA *" sx={{ flex: 2 }}
                value={form.numeroGTA}
                onChange={e => setForm({ ...form, numeroGTA: e.target.value })} />
              <TextField size="small" label="Data de emissão" type="date"
                sx={{ flex: 1 }} InputLabelProps={{ shrink: true }}
                value={form.dataEmissao}
                onChange={e => setForm({ ...form, dataEmissao: e.target.value })} />
              <TextField size="small" label="Validade *" type="date"
                sx={{ flex: 1 }} InputLabelProps={{ shrink: true }}
                value={form.dataValidade}
                onChange={e => setForm({ ...form, dataValidade: e.target.value })} />
            </Stack>

            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: COR }}>
              Origem → Destino
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Município de origem" sx={{ flex: 2 }}
                value={form.municipioOrigem}
                onChange={e => setForm({ ...form, municipioOrigem: e.target.value })} />
              <TextField size="small" label="UF" sx={{ width: 70 }}
                inputProps={{ maxLength: 2 }}
                value={form.ufOrigem}
                onChange={e => setForm({ ...form, ufOrigem: e.target.value.toUpperCase() })} />
              <TextField size="small" label="Município destino" sx={{ flex: 2 }}
                value={form.municipioDestino}
                onChange={e => setForm({ ...form, municipioDestino: e.target.value })} />
              <TextField size="small" label="UF" sx={{ width: 70 }}
                inputProps={{ maxLength: 2 }}
                value={form.ufDestino}
                onChange={e => setForm({ ...form, ufDestino: e.target.value.toUpperCase() })} />
            </Stack>

            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: COR }}>
              Identificação do Animal
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField size="small" label="Nome do animal *" sx={{ flex: 2 }}
                value={form.nomeAnimal}
                onChange={e => setForm({ ...form, nomeAnimal: e.target.value })} />
              <TextField size="small" label="Espécie" sx={{ flex: 1 }}
                value={form.especie}
                onChange={e => setForm({ ...form, especie: e.target.value })} />
              <TextField size="small" label="Raça" sx={{ flex: 1 }}
                value={form.raca}
                onChange={e => setForm({ ...form, raca: e.target.value })} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ width: 100 }}>
                <InputLabel>Sexo</InputLabel>
                <Select label="Sexo" value={form.sexo}
                  onChange={e => setForm({ ...form, sexo: e.target.value })}>
                  <MenuItem value="M">Macho</MenuItem>
                  <MenuItem value="F">Fêmea</MenuItem>
                </Select>
              </FormControl>
              <TextField size="small" label="Idade" sx={{ flex: 1 }}
                value={form.idade}
                onChange={e => setForm({ ...form, idade: e.target.value })} />
              <TextField size="small" label="Identificação (chip/brinco/tatuagem)"
                sx={{ flex: 2 }} value={form.identificacao}
                onChange={e => setForm({ ...form, identificacao: e.target.value })} />
              <TextField size="small" label="Responsável pelo Animal" sx={{ flex: 2 }}
                value={form.responsavelAnimal}
                onChange={e => setForm({ ...form, responsavelAnimal: e.target.value })} />
            </Stack>

            <TextField size="small" label="Finalidade do trânsito" fullWidth
              value={form.finalidade}
              onChange={e => setForm({ ...form, finalidade: e.target.value })} />
            <TextField size="small" label="Observações" multiline rows={2} fullWidth
              value={form.observacoes}
              onChange={e => setForm({ ...form, observacoes: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ color: "#888", textTransform: "none" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={salvar} disabled={saving}
            sx={{ bgcolor: COR, borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, "&:hover": { bgcolor: COR2 } }}>
            {saving ? "Salvando..." : "Registrar GTA"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ════════════════════════════════════════════════════════════════

export default function Controlados() {
  const [aba, setAba] = useState(0);
  const userData = useUserData();
  const uid = userData?.uid;

  if (!userData) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: 10 }}>
      {/* Cabeçalho */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: COR }}>
            SIPEAGRO — Controle de Controlados
          </Typography>
          <Typography sx={{ color: "#888", fontSize: "0.88rem" }}>
            Portaria 344/98 · IN MAPA 55/2022 · IN MAPA 35/2015
          </Typography>
        </Box>
        {userData?.numSipeagro && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={`Reg. SIPEAGRO: ${userData.numSipeagro}`}
            sx={{ bgcolor: "#f0fdf4", color: COR, fontWeight: 700, border: `1px solid ${ACENTO}` }}
          />
        )}
      </Stack>

      {/* Abas */}
      <Tabs
        value={aba}
        onChange={(_, v) => setAba(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": { bgcolor: COR, height: 3 },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.88rem" },
          "& .Mui-selected": { color: `${COR} !important` },
        }}
      >
        <Tab icon={<ScienceIcon sx={{ fontSize: 18 }} />} iconPosition="start"
          label="Movimentações" />
        <Tab icon={<InventoryIcon sx={{ fontSize: 18 }} />} iconPosition="start"
          label="Estoque de Frascos" />
        <Tab icon={<LocalShippingIcon sx={{ fontSize: 18 }} />} iconPosition="start"
          label="GTA" />
      </Tabs>

      {aba === 0 && <AbaMovimentacoes uid={uid} unidade={userData} userData={userData} />}
      {aba === 1 && <AbaEstoque       uid={uid} />}
      {aba === 2 && <AbaGTA           uid={uid} />}
    </Box>
  );
}
