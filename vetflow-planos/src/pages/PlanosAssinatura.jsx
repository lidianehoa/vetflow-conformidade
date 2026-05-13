// src/pages/PlanosAssinatura.jsx
// ================================================================
// Tela de escolha de planos — substitui o componente "mJ" do bundle.
// Referenciada na rota /pagamento.
//
// No App.jsx (roteamento), troque:
//   y.jsx(vs, { path:"/pagamento", element: y.jsx(ri,{children:y.jsx(mJ,{})}) })
// por:
//   <Route path="/pagamento" element={<PlanosAssinatura />} />
// ================================================================
import React, { useState } from "react";
import {
  Box, Typography, Button, Stack, Chip, Divider, CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { PLANOS } from "../config/planos";

const COR = "#1b4332";
const COR_FUNDO = "#f0fdf4";

// ── Dados de exibição dos 3 planos ───────────────────────────────
const CARDS = [
  {
    id: "freemium",
    tag: "Recomendado para começar",
    destaque: true,
    nome: "Freemium",
    precoLabel: "R$ 67,90",
    periodo: "/mês",
    subtitulo: "Pague apenas R$ 67,90 após os primeiros POPs",
    descricao: "Acesse os POPs veterinários básicos agora, sem barreiras. Quando o checklist apontar risco de fiscalização, o upgrade se paga sozinho.",
    beneficios: [
      { ok: true,  label: "POPs veterinários básicos" },
      { ok: true,  label: "Checklist de 20 itens" },
      { ok: true,  label: "Até 3 auditorias salvas" },
      { ok: false, label: "Gerador de TCLE" },
      { ok: false, label: "Manual de Boas Práticas CFMV" },
      { ok: false, label: "Fábrica de Documentos" },
      { ok: false, label: "Dashboard de Risco" },
    ],
    tipo: "freemium",
    botaoTexto: "Começar com POPs gratuitos",
    link: PLANOS.freemium.pagseguroLink,
  },
  {
    id: "rtSolo",
    tag: "Plano básico",
    destaque: false,
    nome: "RT Solo",
    precoLabel: "R$ 97",
    periodo: "/mês",
    subtitulo: "Veterinário autônomo · 1 unidade",
    descricao: "Checklist RT ilimitado, Gerador de TCLE, Manual de Boas Práticas e Fábrica de Documentos completa.",
    beneficios: [
      { ok: true,  label: "Tudo do Freemium" },
      { ok: true,  label: "Checklist RT ilimitado" },
      { ok: true,  label: "Gerador de TCLE Blindado" },
      { ok: true,  label: "Manual de Boas Práticas CFMV" },
      { ok: true,  label: "Fábrica de Documentos" },
      { ok: true,  label: "Plano de Voo 5W2H" },
      { ok: true,  label: "Dashboard de Risco em Tempo Real" },
    ],
    tipo: "pago",
    botaoTexto: "Assinar RT Solo — R$ 97/mês",
    link: PLANOS.rtSolo.pagseguroLink,
  },
  {
    id: "clinicaPro",
    tag: "Plano clínica",
    destaque: false,
    nome: "Clínica Pro",
    precoLabel: "R$ 197",
    periodo: "/mês",
    subtitulo: "Estabelecimento + RT",
    descricao: "Tudo do RT Solo + integração SimplesVet, múltiplos usuários e exportação de auditoria em PDF para o CRMV.",
    beneficios: [
      { ok: true,  label: "Tudo do RT Solo" },
      { ok: true,  label: "Integração SimplesVet" },
      { ok: true,  label: "Múltiplos usuários" },
      { ok: true,  label: "Exportação PDF para o CRMV" },
      { ok: true,  label: "Relatório de auditoria completo" },
    ],
    tipo: "pago",
    botaoTexto: "Assinar Clínica Pro — R$ 197/mês",
    link: PLANOS.clinicaPro.pagseguroLink,
  },
];

// ── Card individual ──────────────────────────────────────────────
function CardPlano({ card, onFreemium, carregando }) {
  return (
    <Box sx={{
      flex: 1,
      minWidth: { xs: "100%", sm: 240 },
      maxWidth: { xs: "100%", sm: 320 },
      border: card.destaque ? `2px solid ${COR}` : "1.5px solid #e0e0e0",
      borderRadius: "20px",
      p: 3,
      bgcolor: card.destaque ? COR_FUNDO : "#fff",
      display: "flex",
      flexDirection: "column",
      gap: 1.5,
      boxShadow: card.destaque
        ? "0 8px 32px rgba(27,67,50,0.13)"
        : "0 2px 8px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: "0 12px 36px rgba(27,67,50,0.18)", transform: "translateY(-2px)" },
    }}>
      {/* Tag */}
      <Chip label={card.tag} size="small" sx={{
        alignSelf: "flex-start",
        bgcolor: card.destaque ? COR : "#f0f0f0",
        color: card.destaque ? "#d8f3dc" : "#555",
        fontWeight: 700, fontSize: "0.7rem", borderRadius: "8px", height: 22,
      }} />

      {/* Nome */}
      <Typography sx={{ fontWeight: 800, color: COR, fontSize: "1.15rem", lineHeight: 1.2 }}>
        {card.nome}
      </Typography>

      {/* Preço */}
      <Box>
        <Typography component="span" sx={{ fontWeight: 900, fontSize: "2rem", color: COR }}>
          {card.precoLabel}
        </Typography>
        <Typography component="span" sx={{ fontSize: "0.95rem", color: "#888", ml: 0.5 }}>
          {card.periodo}
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "#888", mt: 0.3 }}>
          {card.subtitulo}
        </Typography>
      </Box>

      {/* Descrição */}
      <Typography sx={{ fontSize: "0.83rem", color: "#555", lineHeight: 1.6 }}>
        {card.descricao}
      </Typography>

      <Divider sx={{ borderColor: "#e8f5e9" }} />

      {/* Benefícios */}
      <Stack spacing={0.7}>
        {card.beneficios.map((b) => (
          <Typography key={b.label} sx={{
            fontSize: "0.8rem",
            color: b.ok ? "#333" : "#bbb",
            lineHeight: 1.5,
          }}>
            {b.ok ? "✅" : "🔒"} {b.label}
          </Typography>
        ))}
      </Stack>

      {/* Botão */}
      <Box sx={{ mt: "auto", pt: 2 }}>
        {card.tipo === "freemium" ? (
          <Button
            fullWidth variant="outlined"
            onClick={onFreemium}
            disabled={carregando}
            sx={{
              borderColor: COR, color: COR, fontWeight: 800,
              borderRadius: "12px", py: 1.4, textTransform: "none", fontSize: "0.88rem",
              "&:hover": { bgcolor: "#e8f5e9", borderColor: COR },
            }}
          >
            {carregando ? <CircularProgress size={20} color="inherit" /> : card.botaoTexto}
          </Button>
        ) : (
          <Button
            fullWidth variant="contained"
            href={card.link} target="_blank" rel="noopener noreferrer"
            sx={{
              bgcolor: COR, borderRadius: "12px", py: 1.4,
              fontWeight: 900, fontSize: "0.88rem", textTransform: "none",
              boxShadow: "0 6px 18px rgba(27,67,50,0.2)",
              "&:hover": { bgcolor: "#2d6a4f", transform: "translateY(-1px)" },
              transition: "all 0.2s",
            }}
          >
            {card.botaoTexto}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ── Página principal ────────────────────────────────────────────
export default function PlanosAssinatura({ onSair }) {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  // Ativa plano freemium — salva "freemium" no Firestore e redireciona
  const handleFreemium = async () => {
    setCarregando(true);
    setErro("");
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Usuário não autenticado");
      await updateDoc(doc(db, "users", uid), { plan: "freemium" });
      navigate("/");
    } catch (e) {
      console.error("Erro ao ativar freemium:", e);
      setErro("Não foi possível ativar o plano gratuito. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#fff", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: COR, mb: 1 }}>
          Libere o VetFlow Compliance
        </Typography>
        <Typography sx={{ color: "#666", fontSize: "0.95rem", maxWidth: 520, mx: "auto" }}>
          Sua conta está criada. Escolha como quer começar — os POPs básicos são gratuitos,
          e o acesso completo libera com um clique após o pagamento.
        </Typography>
      </Box>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems={{ xs: "center", md: "flex-start" }}
        justifyContent="center"
        sx={{ mb: 4 }}
      >
        {CARDS.map((card) => (
          <CardPlano key={card.id} card={card} onFreemium={handleFreemium} carregando={carregando} />
        ))}
      </Stack>

      {/* Erro */}
      {erro && (
        <Typography sx={{ color: "error.main", textAlign: "center", mb: 2, fontSize: "0.85rem" }}>
          {erro}
        </Typography>
      )}

      {/* Nota freemium */}
      <Box sx={{
        bgcolor: "#fffde7", border: "1px solid #ffe082",
        borderRadius: "14px", p: 2.5, mb: 4,
        maxWidth: 860, mx: "auto",
      }}>
        <Typography sx={{ fontSize: "0.82rem", color: "#7a6000", lineHeight: 1.75 }}>
          <strong>💡 Por que o Freemium funciona:</strong> o veterinário chega pelo Google
          pesquisando "manual de boas práticas CFMV" ou "como cadastrar no SIPEAGRO" —
          acessa os POPs gratuitamente, usa o checklist e, quando o sistema mostra que a clínica
          está abaixo de 60% de compliance com fiscalização próxima, o upgrade é a decisão óbvia.
          <strong> A dor é o gatilho.</strong>
        </Typography>
      </Box>

      {/* Segurança */}
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
        <LockIcon sx={{ color: "#52b788", fontSize: 15 }} />
        <Typography variant="caption" sx={{ color: "#888", fontWeight: 700 }}>
          AMBIENTE CRIPTOGRAFADO · PAGAMENTO SEGURO VIA PAGSEGURO
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "#bbb", fontSize: "0.7rem", mb: 3 }}>
        A liberação ocorre automaticamente após confirmação do PagSeguro (instantâneo para Cartão/PIX).
      </Typography>

      <Divider sx={{ my: 2, maxWidth: 400, mx: "auto" }} />

      {/* Botão sair */}
      <Button
        variant="text"
        onClick={onSair}
        sx={{ display: "block", mx: "auto", color: "#aaa", fontWeight: 700, textTransform: "none", fontSize: "0.8rem" }}
      >
        Sair e entrar com outra conta
      </Button>
    </Box>
  );
}
