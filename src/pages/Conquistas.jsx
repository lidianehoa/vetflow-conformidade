// src/pages/Conquistas.jsx
// Rota: /conquistas
// Exibe: nível atual, XP, todos os badges (obtidos e bloqueados), missões e histórico

import React, { useState, useEffect } from "react";
import {
  Box, Typography, LinearProgress, Avatar, Chip, Card, CardContent,
  Stack, Tab, Tabs, Divider, Tooltip,
} from "@mui/material";
import {
  EmojiEvents, Lock, CheckCircle, TrendingUp, Flag,
} from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { NIVEIS, getNivel, getGamificacaoPorArea } from "../data/gamificacao";
import { useUserData } from "../components/ProtectedRoute";

export default function Conquistas() {
  const { clinicaData } = useUserData();
  const areaAtual = clinicaData?.areaAtuacao ?? "pequenos_animais";
  const { BADGES, MISSOES } = getGamificacaoPorArea(areaAtual);
  const [gamData, setGamData] = useState(null);
  const [aba, setAba] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, "users", uid)).then(snap => {
      if (snap.exists()) setGamData(snap.data()?.gamificacao ?? null);
    });
  }, []);

  if (!gamData) return <Box sx={{ p: 3 }}><Typography>Carregando...</Typography></Box>;

  const xp = gamData.xp ?? 0;
  const nivel = getNivel(gamData.historico_scores?.[0] ?? 0);
  const badges_obtidos = gamData.badges ?? [];
  const missoes_concluidas = gamData.missoes_concluidas ?? [];
  const historico = gamData.historico_scores ?? [];

  // XP para o próximo nível (baseado no nível de score)
  const proximo = NIVEIS[Math.min(nivel.level, NIVEIS.length - 1)];
  const xp_pct = Math.min(100, Math.round((xp % 1000) / 10));

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      {/* Header do perfil de gamificação */}
      <Card sx={{ mb: 3, border: `2px solid ${nivel.cor}20`,
        bgcolor: `${nivel.cor}08` }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: nivel.cor, width: 56, height: 56, fontSize: 28 }}>
              {nivel.emoji}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={800} fontSize={18}>{nivel.nome}</Typography>
              <Typography color="text.secondary" fontSize={12}>{nivel.descricao}</Typography>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={xp_pct}
                  sx={{ flex: 1, height: 8, borderRadius: 4,
                    "& .MuiLinearProgress-bar": { bgcolor: nivel.cor } }} />
                <Chip label={`${xp.toLocaleString("pt-BR")} XP`} size="small"
                  sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 700 }} />
              </Stack>
              <Typography fontSize={10} color="text.secondary" sx={{ mt: 0.5 }}>
                {badges_obtidos.length} conquistas · {missoes_concluidas.length} missões · {historico.length} auditorias
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab label="Conquistas" icon={<EmojiEvents />} iconPosition="start" />
        <Tab label="Missões" icon={<Flag />} iconPosition="start" />
        <Tab label="Histórico" icon={<TrendingUp />} iconPosition="start" />
      </Tabs>

      {/* ABA: CONQUISTAS */}
      {aba === 0 && (
        <Box>
          {["base_legal","normas","qualidade","ambiental","bea","pessoas","especial"].map(cat => {
            const badges_cat = BADGES.filter(b => b.categoria === cat);
            if (!badges_cat.length) return null;
            const label_map = {
              base_legal: "⚖️ Base Legal", normas: "🏷️ Registro e Normas",
              qualidade: "✅ Qualidade / PACs", ambiental: "🌿 Gestão Ambiental",
              bea: "🐾 Bem-Estar Animal", pessoas: "👥 Gestão de Pessoas",
              especial: "⭐ Especiais",
            };
            return (
              <Box key={cat} sx={{ mb: 3 }}>
                <Typography fontWeight={700} sx={{ mb: 1.5 }}>{label_map[cat]}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {badges_cat.map(b => {
                    const obtido = badges_obtidos.includes(b.id);
                    return (
                      <Tooltip key={b.id} title={b.descricao}>
                        <Card sx={{
                          width: 130, p: 1.5, textAlign: "center",
                          border: `1.5px solid ${obtido ? b.cor : "#e0e0e0"}`,
                          opacity: obtido ? 1 : 0.5,
                          transition: "all .2s",
                        }}>
                          <Typography fontSize={28}>{obtido ? "🏅" : "🔒"}</Typography>
                          <Typography fontSize={11} fontWeight={700}
                            sx={{ color: obtido ? b.cor : "text.secondary" }}>
                            {b.nome}
                          </Typography>
                          {obtido && (
                            <Chip label={`${b.xp} XP`} size="small"
                              sx={{ mt: 0.5, fontSize: 9, bgcolor: "#fff9c4", color: "#f57f17" }} />
                          )}
                        </Card>
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ABA: MISSÕES */}
      {aba === 1 && (
        <Stack spacing={2}>
          {MISSOES.map((m, idx) => {
            const concluida = missoes_concluidas.includes(m.id);
            const desbloqueada = !m.desbloqueiaApos ||
              missoes_concluidas.includes(m.desbloqueiaApos);

            return (
              <Card key={m.id} sx={{
                border: `1.5px solid ${concluida ? m.cor : desbloqueada ? `${m.cor}40` : "#e0e0e0"}`,
                opacity: !desbloqueada ? 0.5 : 1,
              }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography fontSize={24}>{m.emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={700} fontSize={14}>{m.nome}</Typography>
                        {concluida && <CheckCircle sx={{ color: "#2e7d32", fontSize: 16 }} />}
                        {!desbloqueada && <Lock sx={{ color: "#9e9e9e", fontSize: 16 }} />}
                      </Stack>
                      <Typography fontSize={12} color="text.secondary">{m.descricao}</Typography>
                      <Chip label={`+${m.recompensaXP} XP`} size="small"
                        sx={{ mt: 0.5, bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 700, fontSize: 10 }} />
                    </Box>
                    <Typography fontSize={11} color="text.secondary">
                      {m.passos.length} passos
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* ABA: HISTÓRICO */}
      {aba === 2 && (
        <Box>
          {historico.length === 0 ? (
            <Typography color="text.secondary" fontSize={13}>
              Nenhuma auditoria realizada ainda.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {historico.map((score, i) => {
                const n = getNivel(score);
                return (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2,
                    p: 1.5, border: "0.5px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography fontSize={20}>{n.emoji}</Typography>
                    <LinearProgress variant="determinate" value={score}
                      sx={{ flex: 1, height: 10, borderRadius: 5,
                        "& .MuiLinearProgress-bar": { bgcolor: n.cor } }} />
                    <Typography fontWeight={700} sx={{ color: n.cor, minWidth: 40 }}>
                      {score}%
                    </Typography>
                    <Typography fontSize={11} color="text.secondary">{n.nome}</Typography>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}
