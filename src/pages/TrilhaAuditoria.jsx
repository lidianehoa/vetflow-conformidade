// src/pages/TrilhaAuditoria.jsx
// Rota: /trilha-auditoria
import React, { useState, useEffect } from "react";
import {
  Box, Typography, LinearProgress, Chip, Button, Stepper, Step,
  StepLabel, Card, CardContent, Radio, RadioGroup, FormControlLabel,
  Alert, Divider, Avatar, Stack, Tooltip, CircularProgress,
} from "@mui/material";
import {
  Gavel, Label, Factory, FactCheck, Groups, LocalShipping,
  EmojiEvents, CheckCircle, Cancel, RemoveCircle, Star,
  NavigateNext, NavigateBefore, FlightTakeoff, Celebration,
} from "@mui/icons-material";
import Nature from "@mui/icons-material/Nature";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  NIVEIS, getNivel, getGamificacaoPorArea,
  calcularScoreTrilha, calcularXPAuditoria,
} from "../data/gamificacao";
import { useUserData } from "../components/ProtectedRoute";

const ICON_MAP = {
  Gavel: <Gavel />, Label: <Label />, Factory: <Factory />,
  FactCheck: <FactCheck />, Groups: <Groups />, Nature: <Nature />,
  LocalShipping: <LocalShipping />,
};

export default function TrilhaAuditoria() {
  const navigate = useNavigate();
  const { userData, clinicaData } = useUserData();

  // State
  const [etapa, setEtapa] = useState("intro");       // intro | auditando | resultado | conquistas
  const [secaoAtual, setSecaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});     // { itemId: "conforme"|"nao_conforme"|"na" }
  const [resultado, setResultado] = useState(null);
  const [xpGanho, setXpGanho] = useState(0);
  const [badgesDesbloqueados, setBadgesDesbloqueados] = useState([]);
  const [missoesAtualizadas, setMissoesAtualizadas] = useState([]);
  const [progressoMissoes, setProgressoMissoes] = useState({});
  const [gamData, setGamData] = useState(null);       // gamificacao do user no Firestore
  const [saving, setSaving] = useState(false);

  // Filtrar seções pelo subtipo do estabelecimento
  const areaAtual = clinicaData?.areaAtuacao ?? "pequenos_animais";
  const { SECOES_TRILHA, BADGES, MISSOES } = getGamificacaoPorArea(areaAtual);

  const subtipo = clinicaData?.tipo ?? "acougue";
  const secoesFiltradas = SECOES_TRILHA.filter(s =>
    !s.subtipo_only || s.subtipo_only.includes(subtipo)
  );

  // Carregar dados de gamificação do usuário
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    getDoc(doc(db, "users", uid)).then(snap => {
      if (snap.exists()) {
        setGamData(snap.data()?.gamificacao ?? {
          xp: 0, level: 1, badges: [], missoes_concluidas: [],
          missoes_progresso: {}, historico_scores: [],
        });
      }
    });
  }, []);

  // Calcular progresso das missões com base nas respostas atuais
  const calcularProgressoMissao = (missao) => {
    const concluidos = missao.passos.filter(passo => {
      if (passo.itemAuditoria) return respostas[passo.itemAuditoria] === "conforme";
      if (passo.campo && userData) return !!userData[passo.campo];
      if (passo.streakIndex !== undefined && gamData) {
        const hist = gamData.historico_scores ?? [];
        return hist.length > passo.streakIndex && hist[passo.streakIndex] >= 85;
      }
      return false;
    });
    return { total: missao.passos.length, concluidos: concluidos.length };
  };

  const secaoCorrente = secoesFiltradas[secaoAtual];
  const totalItens = secoesFiltradas.reduce((acc, s) => acc + s.itens.length, 0);
  const respondidos = Object.keys(respostas).length;
  const progresso = totalItens > 0 ? Math.round((respondidos / totalItens) * 100) : 0;

  function responder(itemId, valor) {
    setRespostas(prev => ({ ...prev, [itemId]: valor }));
  }

  function avancarSecao() {
    if (secaoAtual < secoesFiltradas.length - 1) {
      setSecaoAtual(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      concluirAuditoria();
    }
  }

  async function concluirAuditoria() {
    setSaving(true);
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    // Calcular resultado
    const res = calcularScoreTrilha(respostas, SECOES_TRILHA);
    const nivel = getNivel(res.score);

    // Calcular XP ganho
    const hist = gamData?.historico_scores ?? [];
    const xp = calcularXPAuditoria(res, hist);

    // Verificar badges desbloqueados
    const auditorias_locais = [{ ...res, respostas, itensConformes: Object.entries(respostas)
      .filter(([,v]) => v === "conforme").map(([id]) => ({ id })) }];
    const badges_novos = BADGES.filter(b => {
      const ja_tem = gamData?.badges?.includes(b.id);
      if (ja_tem) return false;
      try { return b.criterio(userData, auditorias_locais); } catch { return false; }
    });

    // Verificar missões concluídas
    const missoes_novas = MISSOES.filter(m => {
      const ja_concluiu = gamData?.missoes_concluidas?.includes(m.id);
      if (ja_concluiu) return false;
      const prog = calcularProgressoMissao(m);
      return prog.concluidos === prog.total;
    });

    // Salvar auditoria na collection auditorias
    await addDoc(collection(db, "auditorias"), {
      userId: uid,
      clinicaId: userData?.selectedClinicaId ?? "",
      tipo: "trilha_diretrizes_cfmv",
      secaoId: "TRILHA_CFMV_2023",
      score: res.score,
      criticasNC: res.criticos_nc,
      maioresNC: res.maiores_nc,
      nivelConformidade: nivel.nome,
      respostas,
      xpGanho: xp,
      badgesDesbloqueados: badges_novos.map(b => b.id),
      criadoEm: serverTimestamp(),
    });

    // Atualizar gamificação no users/{uid}
    const novoXP = (gamData?.xp ?? 0) + xp + badges_novos.reduce((acc, b) => acc + b.xp, 0);
    const novo_hist = [res.score, ...(gamData?.historico_scores ?? [])].slice(0, 12);

    await setDoc(doc(db, "users", uid), {
      gamificacao: {
        xp: novoXP,
        level: getNivel(res.score).level,
        badges: [...(gamData?.badges ?? []), ...badges_novos.map(b => b.id)],
        missoes_concluidas: [...(gamData?.missoes_concluidas ?? []), ...missoes_novas.map(m => m.id)],
        historico_scores: novo_hist,
        ultima_auditoria: serverTimestamp(),
      }
    }, { merge: true });

    setResultado({ ...res, nivel, novoXP });
    setXpGanho(xp + badges_novos.reduce((acc, b) => acc + b.xp, 0));
    setBadgesDesbloqueados(badges_novos);
    setMissoesAtualizadas(missoes_novas);
    setSaving(false);
    setEtapa("resultado");
  }

  // ── RENDERIZAÇÃO ──────────────────────────────────────────────

  // INTRO
  if (etapa === "intro") return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        🎯 Trilha de Auditoria — Diretrizes CFMV/CRMVs 2023
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Uma auditoria gamificada baseada nas resoluções e legislações vigentes do CRMV.
        Responda {totalItens} itens em {secoesFiltradas.length} seções e descubra seu nível de conformidade.
      </Typography>

      {/* Preview de seções */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {secoesFiltradas.map((s, i) => (
          <Box key={s.id} sx={{
            display: "flex", alignItems: "center", gap: 2, p: 1.5,
            border: "0.5px solid", borderColor: "divider", borderRadius: 2,
          }}>
            <Avatar sx={{ bgcolor: s.cor, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
              {s.letra}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={13} fontWeight={600}>{s.nome}</Typography>
              <Typography fontSize={11} color="text.secondary">{s.descricao}</Typography>
            </Box>
            <Chip label={`${s.itens.length} itens`} size="small"
              sx={{ bgcolor: s.corBg, color: s.cor, fontWeight: 600, fontSize: 11 }} />
          </Box>
        ))}
      </Stack>

      {/* Níveis */}
      <Typography fontSize={13} fontWeight={600} sx={{ mb: 1 }}>Seus Níveis de Conquista</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        {NIVEIS.map(n => (
          <Chip key={n.level} label={`${n.emoji} ${n.nome}`} size="small"
            sx={{ fontSize: 11, borderColor: n.cor, color: n.cor,
              bgcolor: `${n.cor}11`, fontWeight: 600 }} variant="outlined" />
        ))}
      </Stack>

      <Button variant="contained" size="large" endIcon={<FlightTakeoff />}
        onClick={() => setEtapa("auditando")}
        sx={{ borderRadius: 3, fontWeight: 700, px: 4 }}>
        Iniciar Trilha
      </Button>
    </Box>
  );

  // AUDITANDO
  if (etapa === "auditando") return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Header progresso */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography fontSize={13} color="text.secondary">
            Seção {secaoAtual + 1} de {secoesFiltradas.length}
          </Typography>
          <Typography fontSize={13} fontWeight={600} color="primary">
            {progresso}% respondido
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progresso}
          sx={{ height: 6, borderRadius: 3 }} />

        {/* Stepper de seções */}
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }}>
          {secoesFiltradas.map((s, i) => (
            <Tooltip key={s.id} title={s.nome}>
              <Box onClick={() => setSecaoAtual(i)} sx={{
                flex: 1, height: 4, borderRadius: 2, cursor: "pointer",
                bgcolor: i < secaoAtual ? s.cor : i === secaoAtual ? s.cor : "divider",
                opacity: i === secaoAtual ? 1 : i < secaoAtual ? 0.8 : 0.3,
              }} />
            </Tooltip>
          ))}
        </Stack>
      </Box>

      {/* Cabeçalho da seção */}
      <Card sx={{ mb: 2, border: `2px solid ${secaoCorrente.cor}20`,
        bgcolor: secaoCorrente.corBg }}>
        <CardContent sx={{ py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: secaoCorrente.cor }}>
              {ICON_MAP[secaoCorrente.icon]}
            </Avatar>
            <Box>
              <Typography fontWeight={700} fontSize={15}>
                {secaoCorrente.letra} — {secaoCorrente.nome}
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                {secaoCorrente.referencia}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Itens da seção */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {secaoCorrente.itens.map((item, idx) => {
          const resp = respostas[item.id];
          const borderColor = resp === "conforme" ? "#2e7d32"
            : resp === "nao_conforme" ? "#c62828"
            : resp === "na" ? "#9e9e9e" : "divider";

          return (
            <Card key={item.id} sx={{
              border: `1.5px solid ${borderColor}`,
              transition: "border-color .2s",
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                  <Chip
                    label={item.class}
                    size="small"
                    sx={{
                      fontSize: 9, fontWeight: 700,
                      bgcolor: item.class === "CRÍTICO" ? "#c6282815" : item.class === "MAIOR" ? "#e6510015" : "#9e9e9e15",
                      color: item.class === "CRÍTICO" ? "#c62828" : item.class === "MAIOR" ? "#e65100" : "#616161",
                    }}
                  />
                  <Typography fontSize={12} sx={{ flex: 1 }}>{item.desc}</Typography>
                </Stack>
                <Typography fontSize={10} color="text.secondary" sx={{ mb: 1.5 }}>
                  Ref.: {item.ref}
                </Typography>

                <RadioGroup row value={resp ?? ""} onChange={e => responder(item.id, e.target.value)}>
                  {[
                    { v: "conforme",      label: "✅ Conforme",      color: "#2e7d32" },
                    { v: "nao_conforme",  label: "❌ Não Conforme",   color: "#c62828" },
                    { v: "na",            label: "N/A",              color: "#757575" },
                  ].map(opt => (
                    <FormControlLabel key={opt.v} value={opt.v}
                      control={<Radio size="small" sx={{ color: opt.color,
                        "&.Mui-checked": { color: opt.color } }} />}
                      label={<Typography fontSize={12} color={resp === opt.v ? opt.color : "text.secondary"}>
                        {opt.label}
                      </Typography>}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Navegação */}
      <Stack direction="row" justifyContent="space-between">
        <Button startIcon={<NavigateBefore />} onClick={() => setSecaoAtual(p => Math.max(0, p - 1))}
          disabled={secaoAtual === 0} sx={{ borderRadius: 2 }}>
          Anterior
        </Button>
        <Button variant="contained" endIcon={
          secaoAtual < secoesFiltradas.length - 1 ? <NavigateNext /> : <CheckCircle />
        }
          onClick={avancarSecao}
          disabled={saving}
          sx={{ borderRadius: 2, fontWeight: 700,
            bgcolor: secaoAtual < secoesFiltradas.length - 1 ? "primary.main" : "#2e7d32" }}>
          {saving ? <CircularProgress size={20} />
            : secaoAtual < secoesFiltradas.length - 1 ? "Próxima Seção" : "Concluir Trilha"}
        </Button>
      </Stack>
    </Box>
  );

  // RESULTADO
  if (etapa === "resultado" && resultado) {
    const nivel = resultado.nivel;
    const todasBadges = [...(gamData?.badges ?? []), ...badgesDesbloqueados.map(b => b.id)];

    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        {/* Score card principal */}
        <Card sx={{ mb: 3, border: `3px solid ${nivel.cor}`,
          background: `linear-gradient(135deg, ${nivel.cor}08, ${nivel.cor}15)` }}>
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <Typography fontSize={60} lineHeight={1}>{nivel.emoji}</Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: nivel.cor, mt: 1 }}>
              {nivel.nome}
            </Typography>
            <Typography variant="h3" fontWeight={900} sx={{ mt: 1 }}>
              {resultado.score}%
            </Typography>
            <Typography color="text.secondary" fontSize={13}>{nivel.descricao}</Typography>

            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
              <Chip icon={<Star sx={{ fontSize: 16 }} />}
                label={`+${xpGanho} XP ganhos`}
                sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 700 }} />
              {resultado.criticos_nc === 0 && (
                <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />}
                  label="Sem itens críticos NC!" color="success" />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Scores por seção */}
        <Typography fontWeight={700} sx={{ mb: 1.5 }}>Resultado por Seção</Typography>
        <Stack spacing={1} sx={{ mb: 3 }}>
          {secoesFiltradas.map(secao => {
            const itens_secao = secao.itens;
            const conformes = itens_secao.filter(i => respostas[i.id] === "conforme").length;
            const ncs = itens_secao.filter(i => respostas[i.id] === "nao_conforme").length;
            const respondidos_s = itens_secao.filter(i => respostas[i.id] && respostas[i.id] !== "na").length;
            const pct = respondidos_s > 0 ? Math.round((conformes / respondidos_s) * 100) : 0;

            return (
              <Box key={secao.id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: secao.cor, width: 28, height: 28, fontSize: 12 }}>
                  {secao.letra}
                </Avatar>
                <Typography fontSize={12} sx={{ width: 180 }} noWrap>{secao.nome}</Typography>
                <LinearProgress variant="determinate" value={pct}
                  sx={{ flex: 1, height: 8, borderRadius: 4,
                    "& .MuiLinearProgress-bar": { bgcolor: pct >= 80 ? "#2e7d32" : pct >= 60 ? "#f57f17" : "#c62828" } }} />
                <Typography fontSize={12} fontWeight={700}
                  sx={{ color: pct >= 80 ? "#2e7d32" : pct >= 60 ? "#f57f17" : "#c62828", minWidth: 36 }}>
                  {pct}%
                </Typography>
                {ncs > 0 && (
                  <Chip label={`${ncs} NC`} size="small"
                    sx={{ fontSize: 10, bgcolor: "#ffebee", color: "#c62828" }} />
                )}
              </Box>
            );
          })}
        </Stack>

        {/* Badges desbloqueados */}
        {badgesDesbloqueados.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Celebration sx={{ color: "#f57f17" }} />
              <Typography fontWeight={700}>
                {badgesDesbloqueados.length === 1 ? "Conquista Desbloqueada!" : `${badgesDesbloqueados.length} Conquistas Desbloqueadas!`}
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {badgesDesbloqueados.map(b => (
                <Card key={b.id} sx={{ p: 1.5, border: `2px solid ${b.cor}`, minWidth: 140, textAlign: "center" }}>
                  <Typography fontSize={24}>🏅</Typography>
                  <Typography fontSize={12} fontWeight={700} sx={{ color: b.cor }}>{b.nome}</Typography>
                  <Typography fontSize={10} color="text.secondary">{b.descricao}</Typography>
                  <Chip label={`+${b.xp} XP`} size="small"
                    sx={{ mt: 0.5, bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 700, fontSize: 10 }} />
                </Card>
              ))}
            </Stack>
          </Box>
        )}

        {/* Missões concluídas */}
        {missoesAtualizadas.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>🎯 Missões Concluídas!</Typography>
            <Stack spacing={1}>
              {missoesAtualizadas.map(m => (
                <Alert key={m.id} severity="success" icon={<span>{m.emoji}</span>}>
                  <strong>{m.nome}</strong> — +{m.recompensaXP} XP
                </Alert>
              ))}
            </Stack>
          </Box>
        )}

        {/* ICs identificadas */}
        {resultado.criticos_nc > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <strong>{resultado.criticos_nc} item(ns) CRÍTICO(s) não conforme(s)</strong> identificado(s).
            Priorize a correção imediata — esses itens têm penalidade de -15 pts cada no score.
          </Alert>
        )}

        {/* Ações */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="outlined" onClick={() => navigate("/central-rt")} sx={{ borderRadius: 2 }}>
            Voltar ao Cockpit
          </Button>
          <Button variant="contained" onClick={() => navigate("/conquistas")}
            endIcon={<EmojiEvents />} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Ver Todas as Conquistas
          </Button>
          <Button onClick={() => { setEtapa("intro"); setSecaoAtual(0); setRespostas({}); setResultado(null); }}
            sx={{ borderRadius: 2, color: "text.secondary" }}>
            Nova Auditoria
          </Button>
        </Stack>
      </Box>
    );
  }

  return null;
}
