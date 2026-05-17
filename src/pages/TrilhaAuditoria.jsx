// src/pages/TrilhaAuditoria.jsx
// Rota: /trilha-auditoria
import React, { useState, useEffect } from "react";
import {
  Box, Typography, LinearProgress, Chip, Button, Stepper, Step,
  StepLabel, Card, CardContent, Radio, RadioGroup, FormControlLabel,
  Alert, Divider, Avatar, Stack, Tooltip, CircularProgress, Grid
} from "@mui/material";
import {
  Gavel, Label, Factory, FactCheck, Groups, LocalShipping,
  EmojiEvents, CheckCircle, Cancel, RemoveCircle, Star,
  NavigateNext, NavigateBefore, FlightTakeoff, Celebration, WarningAmber, Shield
} from "@mui/icons-material";
import Nature from "@mui/icons-material/Nature";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  NIVEIS, getNivel, getGamificacaoPorArea,
  calcularScoreTrilha, calcularXPAuditoria, proximoPassoMaisImpactante
} from "../data/gamificacao";
import { useUserData } from "../components/ProtectedRoute";
import EscudoConformidade from "../components/gamificacao/EscudoConformidade";

const ICON_MAP = {
  Gavel: <Gavel />, Label: <Label />, Factory: <Factory />,
  FactCheck: <FactCheck />, Groups: <Groups />, Nature: <Nature />,
  LocalShipping: <LocalShipping />,
};

export default function TrilhaAuditoria() {
  const navigate = useNavigate();
  const { uid, plan, clinicaData } = useUserData();
  const userData = { uid, plan }; // Compatibilidade local

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
      tenantId: uid, // Isolamento multi-tenant
      clinicaId: clinicaData?.id ?? "",
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
      <Typography variant="h5" fontWeight={900} gutterBottom color="#1b4332">
        🎯 Trilha de Auditoria — Diretrizes CFMV/CRMVs 2023
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
        Uma auditoria gamificada baseada nas resoluções e legislações vigentes do CRMV.
        Responda {totalItens} itens em {secoesFiltradas.length} seções e descubra seu nível de conformidade.
      </Typography>

      {/* Preview de seções */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {secoesFiltradas.map((s, i) => (
          <Box key={s.id} sx={{
            display: "flex", alignItems: "center", gap: 2, p: 1.5,
            border: "0.5px solid", borderColor: "divider", borderRadius: 3,
            bgcolor: "#fff"
          }}>
            <Avatar sx={{ bgcolor: s.cor, width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
              {s.letra}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography fontSize={13} fontWeight={700} color="#1b4332">{s.nome}</Typography>
              <Typography fontSize={11} color="text.secondary">{s.descricao}</Typography>
            </Box>
            <Chip label={`${s.itens.length} itens`} size="small"
              sx={{ bgcolor: s.corBg, color: s.cor, fontWeight: 600, fontSize: 11 }} />
          </Box>
        ))}
      </Stack>

      {/* Níveis */}
      <Typography fontSize={13} fontWeight={800} sx={{ mb: 1, color: "#1b4332" }}>Seus Níveis de Conquista</Typography>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        {NIVEIS.map(n => (
          <Chip key={n.level} label={`${n.emoji} ${n.nome}`} size="small"
            sx={{ fontSize: 11, borderColor: n.cor, color: n.cor,
              bgcolor: `${n.cor}11`, fontWeight: 600 }} variant="outlined" />
        ))}
      </Stack>

      <Button variant="contained" size="large" endIcon={<FlightTakeoff />}
        onClick={() => setEtapa("auditando")}
        sx={{ borderRadius: 3, fontWeight: 800, px: 4, bgcolor: "#1b4332", "&:hover": { bgcolor: "#143628" } }}>
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
              {ICON_MAP[secaoCorrente.icon] || <FactCheck />}
            </Avatar>
            <Box>
              <Typography fontWeight={800} fontSize={15} color="#1b4332">
                {secaoCorrente.letra} — {secaoCorrente.nome}
              </Typography>
              <Typography fontSize={11} color="text.secondary">
                {secaoCorrente.referencia}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* TAREFA 8: Alerta de risco da Seção */}
      {secaoCorrente.risco_secao && (
        <Box 
          sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 3, 
            bgcolor: "#fff3e0", 
            border: "1px solid #ffe0b2",
            display: "flex", 
            alignItems: "flex-start", 
            gap: 1.5 
          }}
        >
          <WarningAmber sx={{ color: "#e65100", mt: 0.2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={900} color="#e65100" mb={0.5}>
              ⚠️ IMPACTO DA NEGLIGÊNCIA NESTE SETOR:
            </Typography>
            <Typography variant="body2" sx={{ color: "#5c3e09", fontSize: 12, lineHeight: 1.4, fontWeight: 500 }}>
              {secaoCorrente.risco_secao}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Itens da seção */}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {secaoCorrente.itens.map((item, idx) => {
          const resp = respostas[item.id];
          const borderColor = resp === "conforme" ? "#1a7f4b"
            : resp === "nao_conforme" ? "#c62828"
            : resp === "na" ? "#9e9e9e" : "divider";

          return (
            <Card key={item.id} sx={{
              border: `1.5px solid ${borderColor}`,
              transition: "border-color .2s",
              borderRadius: 3
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
                  <Typography fontSize={12} fontWeight={700} sx={{ flex: 1 }}>{item.desc}</Typography>
                </Stack>
                <Typography fontSize={10} color="text.secondary" sx={{ mb: 1.5 }}>
                  Ref.: {item.ref}
                </Typography>

                <RadioGroup row value={resp ?? ""} onChange={e => responder(item.id, e.target.value)}>
                  {[
                    { v: "conforme",      label: "✅ Conforme",      color: "#1a7f4b" },
                    { v: "nao_conforme",  label: "❌ Não Conforme",   color: "#c62828" },
                    { v: "na",            label: "N/A",              color: "#757575" },
                  ].map(opt => (
                    <FormControlLabel key={opt.v} value={opt.v}
                       control={<Radio size="small" sx={{ color: opt.color,
                        "&.Mui-checked": { color: opt.color } }} />}
                      label={<Typography fontSize={12} fontWeight={600} color={resp === opt.v ? opt.color : "text.secondary"}>
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
            bgcolor: secaoAtual < secoesFiltradas.length - 1 ? "primary.main" : "#1a7f4b" }}>
          {saving ? <CircularProgress size={20} />
            : secaoAtual < secoesFiltradas.length - 1 ? "Próxima Seção" : "Concluir Trilha"}
        </Button>
      </Stack>
    </Box>
  );

  // RESULTADO (TAREFA 6)
  if (etapa === "resultado" && resultado) {
    const nivel = resultado.nivel;
    const hist = gamData?.historico_scores ?? [];
    
    // Calcular delta do escudo
    const oldScore = hist[0] ?? 0;
    const oldShield = getNivel(oldScore).escudo_pct;
    const newShield = nivel.escudo_pct;
    const delta = newShield - oldShield;

    const auditoriasFormatadas = [{ score: resultado.score }, ...hist.map(score => ({ score }))];
    const proximaMissao = proximoPassoMaisImpactante(MISSOES, gamData?.missoes_concluidas ?? []);

    return (
      <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 3 } }}>
        <Card sx={{ mb: 4, border: `3px solid ${nivel.cor}`,
          background: `linear-gradient(135deg, ${nivel.cor}08, ${nivel.cor}15)`, borderRadius: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography fontSize={64} lineHeight={1}>{nivel.emoji}</Typography>
            <Typography variant="h5" fontWeight={900} sx={{ color: nivel.cor, mt: 1 }}>
              {nivel.nome}
            </Typography>
            <Typography variant="h3" fontWeight={900} color="#1b4332" sx={{ mt: 1 }}>
              Score Conquistado: {resultado.score}%
            </Typography>
            <Typography color="text.secondary" fontSize={13} sx={{ mt: 1 }}>{nivel.descricao}</Typography>

            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
              <Chip icon={<Star sx={{ fontSize: 16 }} />}
                label={`+${xpGanho} XP Ganhos!`}
                sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 800 }} />
              {resultado.criticos_nc === 0 && (
                <Chip icon={<CheckCircle sx={{ fontSize: 16 }} />}
                  label="Zero Itens Críticos NC! 🛡️" color="success" sx={{ fontWeight: 800 }} />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Exibidor Completo do Escudo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight={850} color="#1b4332" mb={2}>
            📊 NOVO ESCUDO DE CONFORMIDADE ATIVO
          </Typography>
          <EscudoConformidade 
            auditorias={auditoriasFormatadas} 
            userData={clinicaData} 
            compact={false} 
          />

          {delta > 0 && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 3 }}>
              📈 <strong>Seu Escudo cresceu em +{delta}%!</strong> O estabelecimento está mais blindado contra riscos do MAPA, Vigilância e CRMV.
            </Alert>
          )}
        </Box>

        {/* Badges desbloqueados */}
        {badgesDesbloqueados.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Celebration sx={{ color: "#ffa000" }} />
              <Typography variant="subtitle1" fontWeight={850} color="#1b4332">
                🏅 CONQUISTAS DESBLOQUEADAS HOJE!
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {badgesDesbloqueados.map(b => (
                <Grid item xs={12} sm={6} key={b.id}>
                  <Card sx={{ p: 2, border: `2px solid ${b.cor}`, borderRadius: 3, bgcolor: "#f9fdfa" }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                      <Typography fontSize={32}>🏅</Typography>
                      <Box>
                        <Typography fontSize={13} fontWeight={900} color="#1b4332">{b.nome}</Typography>
                        <Typography fontSize={11} color="text.secondary">{b.descricao}</Typography>
                      </Box>
                    </Stack>
                    {b.protecao && (
                      <Box sx={{ p: 1.5, bgcolor: "#fff", border: "1.5px dashed #1a7f4b30", borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Chip label={b.protecao.orgao} size="small" color="success" sx={{ fontSize: 9, fontWeight: 900, height: 16 }} />
                          <Typography variant="caption" fontWeight={800} color="#1a7f4b">
                            Risco: {b.protecao.risco_sem}% → {b.protecao.risco_com}%
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4 }}>
                          🛡️ <strong>Blindagem:</strong> {b.protecao.consequencia_com}
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Missões concluídas */}
        {missoesAtualizadas.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={850} color="#1b4332" mb={2}>🎯 MISSÕES BLINDADAS!</Typography>
            <Stack spacing={1.5}>
              {missoesAtualizadas.map(m => (
                <Alert key={m.id} severity="success" icon={<span>{m.emoji}</span>} sx={{ borderRadius: 3 }}>
                  <strong>{m.nome}</strong> — Missão concluída com sucesso! Proteção ativada e +{m.recompensaXP} XP adicionados.
                </Alert>
              ))}
            </Stack>
          </Box>
        )}

        {/* PRÓXIMO PASSO MAIS IMPACTANTE */}
        {proximaMissao && (
          <Card sx={{ mb: 4, border: "2px dashed #ffa000", borderRadius: 4, bgcolor: "#fffde750" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "#ffa000", color: "#fff", width: 44, height: 44, fontSize: 22 }}>🚀</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" fontWeight={900} color="#b26a00" sx={{ textTransform: "uppercase", tracking: 0.5 }}>
                    Recomendação de Próximo Passo Mais Impactante:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={900} color="#1b4332" sx={{ mt: 0.5 }}>
                    {proximaMissao.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                    Ao concluir essa missão, você ganha <strong>+{proximaMissao.escudo_incremento}% de Escudo de Conformidade</strong> e elimina riscos severos de fiscalização.
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => navigate("/perfil")}
                  sx={{ bgcolor: "#ffa000", fontWeight: 800, "&:hover": { bgcolor: "#e65100" } }}
                >
                  Ver Detalhes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* ICs identificadas */}
        {resultado.criticos_nc > 0 && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            <strong>{resultado.criticos_nc} item(ns) CRÍTICO(s) não conforme(s)</strong> identificado(s).
            A negligência de itens críticos acarreta multas pesadas do MAPA/CRMV e riscos éticos-sanitários gravíssimos. Corrija imediatamente!
          </Alert>
        )}

        {/* Ações */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="outlined" onClick={() => navigate("/central-rt")} sx={{ borderRadius: 2, flex: 1 }}>
            Voltar ao Cockpit
          </Button>
          <Button variant="contained" onClick={() => navigate("/perfil", { state: { aba: 2 } })}
            endIcon={<EmojiEvents />} sx={{ borderRadius: 2, fontWeight: 800, flex: 1, bgcolor: "#1b4332", "&:hover": { bgcolor: "#143628" } }}>
            Ver Minhas Conquistas
          </Button>
          <Button onClick={() => { setEtapa("intro"); setSecaoAtual(0); setRespostas({}); setResultado(null); }}
            sx={{ borderRadius: 2, color: "text.secondary", flex: 0.8 }}>
            Nova Auditoria
          </Button>
        </Stack>
      </Box>
    );
  }

  return null;
}
