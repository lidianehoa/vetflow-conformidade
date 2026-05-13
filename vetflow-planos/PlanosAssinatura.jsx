// ============================================================
// PlanosAssinatura.jsx  —  substitui o componente de pagamento
//
// Planos:
//   Freemium (grátis)  → Só POPs da Fábrica de Documentos
//   RT Solo  (R$97)    → Checklist + TCLE + 5W2H + Manual + Docs
//   Clínica Pro (R$197)→ Tudo + Dashboard + SimplesVet + múlt. usuários
//
// Após pagamento, uma Cloud Function deve atualizar no Firestore:
//   users/{uid}.plan = "rt_solo"     ou "clinica_pro"
//
// USO — na rota /pagamento (onde antes estava o componente antigo):
//   import PlanosAssinatura from "./components/PlanosAssinatura";
//   <PlanosAssinatura
//     onSair={() => auth.signOut()}
//     onFreemium={async () => {
//       await updateDoc(doc(db, "users", uid), { plan: "freemium" });
//       navigate("/");
//     }}
//   />
// ============================================================

import React from "react";
import { Box, Typography, Button, Stack, Chip, Divider } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import LockIcon from "@mui/icons-material/Lock";

// ============================================================
// 🔧 EDITE AQUI: Cole os links do PagSeguro após criar os produtos
// ============================================================
const LINKS = {
  rtSolo:     "https://pag.ae/SEU_LINK_RT_SOLO",       // Assinatura mensal R$ 97
  clinicaPro: "https://pag.ae/SEU_LINK_CLINICA_PRO",   // Assinatura mensal R$ 197
};
// ============================================================

const COR = "#1b4332";
const COR2 = "#2d6a4f";
const ACENTO = "#52b788";
const FUNDO = "#f0fdf4";

const PLANOS = [
  {
    id: "freemium",
    tag: "Grátis para começar",
    tagVerde: false,
    nome: "Freemium",
    preco: "Grátis",
    periodo: "",
    subtitulo: "Sem cartão de crédito",
    descricao:
      "Comece sem compromisso. Acesse as POPs essenciais e conheça o VetFlow antes de assinar.",
    incluido: [
      "Fábrica de Documentos — somente POPs",
      "Visualização das exigências CFMV",
      "Cadastro da clínica",
      "Acesso ao perfil e configurações",
    ],
    bloqueado: [
      "Checklist Mensal (85 itens)",
      "Gerador de TCLE blindado",
      "Plano de ação 5W2H",
      "Manual de Boas Práticas",
      "Dashboard / VET.FLOW Cockpit",
    ],
    destaque: false,
    isFreemium: true,
    botao: "Continuar grátis",
  },
  {
    id: "rt_solo",
    tag: "Mais popular",
    tagVerde: true,
    nome: "RT Solo",
    preco: "R$ 97",
    periodo: "/mês",
    subtitulo: "Veterinário autônomo · 1 unidade",
    descricao:
      "Compliance completo para o RT. Tudo que você precisa para se blindar antes de uma fiscalização.",
    incluido: [
      "Tudo do Freemium",
      "Checklist Mensal completo (85 itens)",
      "Inspeção 360° — Setores A a E",
      "Gerador de TCLE blindado juridicamente",
      "Plano de ação 5W2H",
      "Manual de Boas Práticas CFMV",
      "Fábrica de Documentos completa",
      "Suporte técnico especializado",
    ],
    bloqueado: [
      "Dashboard / VET.FLOW Cockpit",
      "Múltiplos usuários",
      "Integração SimplesVet",
    ],
    destaque: true,
    isFreemium: false,
    botao: "ASSINAR RT SOLO",
    link: LINKS.rtSolo,
  },
  {
    id: "clinica_pro",
    tag: "Completo",
    tagVerde: false,
    nome: "Clínica Pro",
    preco: "R$ 197",
    periodo: "/mês",
    subtitulo: "Estabelecimento + RT",
    descricao:
      "Para clínicas que precisam de gestão completa de conformidade com toda a equipe.",
    incluido: [
      "Tudo do RT Solo",
      "VET.FLOW Cockpit (Dashboard completo)",
      "Radar de Vencimentos e Riscos",
      "Múltiplos usuários com permissões",
      "Integração SimplesVet",
      "Exportação de auditoria em PDF para CRMV",
    ],
    bloqueado: [],
    destaque: false,
    isFreemium: false,
    botao: "ASSINAR CLÍNICA PRO",
    link: LINKS.clinicaPro,
  },
];

function ItemLista({ texto, ok }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      {ok ? (
        <CheckCircleOutlineIcon
          sx={{ fontSize: 15, color: ACENTO, mt: 0.4, flexShrink: 0 }}
        />
      ) : (
        <RemoveCircleOutlineIcon
          sx={{ fontSize: 15, color: "#ddd", mt: 0.4, flexShrink: 0 }}
        />
      )}
      <Typography
        sx={{
          fontSize: "0.81rem",
          color: ok ? "#333" : "#c0c0c0",
          lineHeight: 1.5,
        }}
      >
        {texto}
      </Typography>
    </Stack>
  );
}

function CardPlano({ plano, onFreemium }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: "100%", sm: 230 },
        maxWidth: { xs: "100%", sm: 310 },
        border: plano.destaque ? `2px solid ${COR}` : "1.5px solid #e8e8e8",
        borderRadius: "20px",
        p: 3,
        bgcolor: plano.destaque ? FUNDO : "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        boxShadow: plano.destaque
          ? "0 8px 32px rgba(27,67,50,0.12)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 12px 36px rgba(27,67,50,0.13)" },
      }}
    >
      {/* Tag */}
      <Chip
        label={plano.tag}
        size="small"
        sx={{
          alignSelf: "flex-start",
          bgcolor: plano.tagVerde ? COR : "#f2f2f2",
          color: plano.tagVerde ? "#d8f3dc" : "#777",
          fontWeight: 700,
          fontSize: "0.68rem",
          borderRadius: "8px",
          height: 22,
        }}
      />

      {/* Nome */}
      <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", color: COR }}>
        {plano.nome}
      </Typography>

      {/* Preço */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.9rem", color: COR, lineHeight: 1 }}>
            {plano.preco}
          </Typography>
          {plano.periodo && (
            <Typography sx={{ fontSize: "0.9rem", color: "#aaa", fontWeight: 500 }}>
              {plano.periodo}
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: "0.75rem", color: "#aaa", mt: 0.3 }}>
          {plano.subtitulo}
        </Typography>
      </Box>

      {/* Descrição */}
      <Typography sx={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.6 }}>
        {plano.descricao}
      </Typography>

      <Divider sx={{ borderColor: "#f0f0f0" }} />

      {/* Itens */}
      <Stack spacing={0.6}>
        {plano.incluido.map((i) => (
          <ItemLista key={i} texto={i} ok={true} />
        ))}
        {plano.bloqueado.map((i) => (
          <ItemLista key={i} texto={i} ok={false} />
        ))}
      </Stack>

      {/* Botão */}
      <Box sx={{ mt: "auto", pt: 2 }}>
        {plano.isFreemium ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={onFreemium}
            sx={{
              borderColor: "#ddd",
              color: "#999",
              fontWeight: 700,
              borderRadius: "12px",
              py: 1.3,
              textTransform: "none",
              fontSize: "0.88rem",
              "&:hover": { borderColor: COR, color: COR },
            }}
          >
            {plano.botao}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            href={plano.link}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: COR,
              borderRadius: "12px",
              py: 1.5,
              fontWeight: 900,
              textTransform: "none",
              fontSize: "0.88rem",
              boxShadow: "0 6px 18px rgba(27,67,50,0.2)",
              "&:hover": { bgcolor: COR2, transform: "translateY(-1px)" },
              transition: "all 0.2s",
            }}
          >
            {plano.botao}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default function PlanosAssinatura({ onSair, onFreemium }) {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#fff", minHeight: "100vh" }}>

      {/* Cabeçalho */}
      <Typography variant="h5" sx={{ fontWeight: 900, color: COR, mb: 0.5 }}>
        Escolha seu plano
      </Typography>
      <Typography sx={{ color: "#888", mb: 4, fontSize: "0.92rem" }}>
        Comece grátis com as POPs ou assine para acesso completo de compliance.
      </Typography>

      {/* Cards */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2.5}
        alignItems={{ xs: "stretch", md: "flex-start" }}
        justifyContent="center"
        sx={{ mb: 5 }}
      >
        {PLANOS.map((p) => (
          <CardPlano key={p.id} plano={p} onFreemium={onFreemium} />
        ))}
      </Stack>

      {/* Nota freemium */}
      <Box
        sx={{
          bgcolor: "#fffde7",
          border: "1px solid #ffe082",
          borderRadius: "14px",
          p: 2.5,
          mb: 4,
        }}
      >
        <Typography sx={{ fontSize: "0.82rem", color: "#6d5200", lineHeight: 1.7 }}>
          <strong>💡 Por que o freemium existe:</strong> O veterinário descobre o
          app pesquisando "manual de boas práticas CFMV" ou "como cadastrar no
          SIPEAGRO" — entra grátis, usa as POPs, e converte naturalmente quando o
          checklist aponta que a clínica está a 40% de compliance e a fiscalização
          se aproxima. A dor é o gatilho.
        </Typography>
      </Box>

      {/* Segurança */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <LockIcon sx={{ color: ACENTO, fontSize: 14 }} />
        <Typography variant="caption" sx={{ color: "#bbb", fontWeight: 700 }}>
          PAGAMENTO SEGURO VIA PAGSEGURO — CARTÃO OU PIX
        </Typography>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "center",
          color: "#ccc",
          fontSize: "0.68rem",
          mb: 3,
        }}
      >
        Acesso liberado automaticamente após confirmação do pagamento.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="text"
        onClick={onSair}
        sx={{
          display: "block",
          mx: "auto",
          color: "#bbb",
          fontWeight: 700,
          textTransform: "none",
          fontSize: "0.8rem",
        }}
      >
        Sair e entrar com outra conta
      </Button>
    </Box>
  );
}
