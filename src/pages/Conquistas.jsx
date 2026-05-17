// src/pages/Conquistas.jsx
// Rota: /conquistas
// Exibe: nível atual, XP, todos os badges (obtidos e bloqueados), missões e histórico

import React, { useState, useEffect } from "react";
import {
  Box, Typography, LinearProgress, Avatar, Chip, Card, CardContent,
  Stack, Tab, Tabs, Divider, Tooltip, Grid, Alert
} from "@mui/material";
import {
  EmojiEvents, Lock, CheckCircle, TrendingUp, Flag, Warning, Shield
} from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { NIVEIS, getNivel, getGamificacaoPorArea } from "../data/gamificacao";
import { useUserData } from "../components/ProtectedRoute";
import EscudoConformidade from "../components/gamificacao/EscudoConformidade";

export default function Conquistas() {
  const userData = useUserData() || {};
  const clinicaData = userData.clinicaData;
  const uid = userData.uid;
  const areaAtual = clinicaData?.areaAtuacao ?? "pequenos_animais";
  const { BADGES, MISSOES } = getGamificacaoPorArea(areaAtual);
  const [gamData, setGamData] = useState({});
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState(0);
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, "users", uid))
      .then(snap => {
        if (snap.exists() && snap.data()?.gamificacao) {
          setGamData(snap.data().gamificacao);
        }
      })
      .catch(err => {
        console.error("Erro ao carregar conquistas:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [uid]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" fontWeight={600}>
          Carregando suas conquistas...
        </Typography>
      </Box>
    );
  }

  const xp = typeof gamData.xp === "number" ? gamData.xp : 0;
  const historico = Array.isArray(gamData.historico_scores) ? gamData.historico_scores : [];
  const scoreParaNivel = historico[0] ?? 0;
  const nivel = getNivel(scoreParaNivel);
  const badges_obtidos = Array.isArray(gamData.badges) ? gamData.badges : [];
  const missoes_concluidas = Array.isArray(gamData.missoes_concluidas) ? gamData.missoes_concluidas : [];

  // XP para o próximo nível
  const xp_pct = Math.min(100, Math.round((xp % 1000) / 10));

  // Transformar historico simples de score em formato esperado pelo calcularEscudo
  const auditoriasFormatadas = historico.map(score => ({ score }));

  return (
    <Box sx={{ maxWidth: 850, mx: "auto", p: { xs: 2, md: 3 } }}>
      
      {/* TAREFA 7: Exibidor Principal - Escudo de Conformidade e Proteção Legal */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={900} color="#1b4332" mb={1}>
          🛡️ Compliance & Gamificação 2.0
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Suas conquistas técnicas e operacionais geram proteção legal quantificável para a sua clínica veterinária.
        </Typography>
        
        <EscudoConformidade 
          auditorias={auditoriasFormatadas} 
          userData={clinicaData || {}} 
          compact={false} 
        />
      </Box>

      {/* Jornada de XP Secundária */}
      <Card sx={{ mb: 4, border: "1px dashed #ccc", borderRadius: 4, p: 2, bgcolor: "#fafafa" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: nivel.cor, width: 44, height: 44, fontSize: 20 }}>
            {nivel.emoji}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={850} fontSize={14}>
                Jornada de Especialização: {nivel.nome}
              </Typography>
              <Chip label={`${xp.toLocaleString("pt-BR")} XP`} size="small"
                sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 700 }} />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <LinearProgress variant="determinate" value={xp_pct}
                sx={{ flex: 1, height: 6, borderRadius: 3,
                  "& .MuiLinearProgress-bar": { bgcolor: nivel.cor } }} />
            </Stack>
            <Typography fontSize={10} color="text.secondary" sx={{ mt: 0.5 }}>
              {badges_obtidos.length} conquistas ativas · {missoes_concluidas.length} missões blindadas · {historico.length} auditorias validadas
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Tabs */}
      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 3, borderBottom: "1px solid #eee" }}>
        <Tab label="Selos & Conquistas" icon={<EmojiEvents />} iconPosition="start" sx={{ fontWeight: 700 }} />
        <Tab label="Missões de Blindagem" icon={<Flag />} iconPosition="start" sx={{ fontWeight: 700 }} />
        <Tab label="Histórico de Auditoria" icon={<TrendingUp />} iconPosition="start" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* ABA: CONQUISTAS (BADGES) */}
      {aba === 0 && (
        <Box>
          {["base_legal","normas","qualidade","ambiental","bea","pessoas","especial"].map(cat => {
            const badges_cat = BADGES.filter(b => b.categoria === cat);
            if (!badges_cat.length) return null;
            
            const label_map = {
              base_legal: "⚖️ Base Legal & Contratos", 
              normas: "🏷️ Registro e Normas CRMV/MAPA",
              qualidade: "✅ Segurança de Alimentos & PACs", 
              ambiental: "🌿 PGRSS & Gestão Ambiental",
              bea: "🐾 Bem-Estar Animal", 
              pessoas: "👥 Gestão de Pessoas & Treinamentos",
              especial: "⭐ Selos Especiais de Blindagem",
            };

            return (
              <Box key={cat} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight={850} color="#1b4332" sx={{ mb: 2, pb: 0.5, borderBottom: "2px solid #e8f5e9" }}>
                  {label_map[cat]}
                </Typography>
                
                <Grid container spacing={2}>
                  {badges_cat.map(b => {
                    const obtido = badges_obtidos.includes(b.id);
                    const expandido = expandedBadgeId === b.id;
                    const protecao = b.protecao;

                    return (
                      <Grid item xs={12} sm={expandido ? 12 : 6} md={expandido ? 12 : 4} key={b.id}>
                        <Card 
                          onClick={() => setExpandedBadgeId(expandido ? null : b.id)}
                          sx={{
                            p: 2,
                            height: "100%",
                            cursor: "pointer",
                            borderRadius: 4,
                            border: `2px solid ${obtido ? "#1a7f4b30" : "#d32f2f18"}`,
                            background: obtido 
                              ? "linear-gradient(135deg, #ffffff 0%, #f7fdf9 100%)" 
                              : "linear-gradient(135deg, #ffffff 0%, #fffbfb 100%)",
                            boxShadow: expandido ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
                            transition: "all .2s ease-in-out",
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: "0 6px 18px rgba(0,0,0,0.04)"
                            }
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                            <Avatar sx={{ bgcolor: obtido ? b.cor : "#f5f5f5", color: obtido ? "#fff" : "#9e9e9e", width: 40, height: 40, fontSize: 20 }}>
                              {obtido ? "🏅" : "🔒"}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography fontSize={13} fontWeight={900} sx={{ color: obtido ? "#1b4332" : "text.secondary" }}>
                                {b.nome}
                              </Typography>
                              <Typography fontSize={11} color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {b.descricao}
                              </Typography>
                            </Box>
                          </Stack>

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Chip 
                              label={obtido ? "Ativo" : "Bloqueado"} 
                              size="small" 
                              sx={{ 
                                fontSize: 9, 
                                fontWeight: 800, 
                                height: 18,
                                bgcolor: obtido ? "#e8f5e9" : "#ffebee", 
                                color: obtido ? "#2e7d32" : "#c62828" 
                              }} 
                            />
                            <Chip 
                              label={`+${b.xp} XP`} 
                              size="small" 
                              sx={{ fontSize: 9, bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 800, height: 18 }} 
                            />
                          </Stack>

                          {/* TAREFA 3: Bloco Expansível de Proteção/Alerta Legal */}
                          {expandido && protecao && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: "1px dashed #e0e0e0" }}>
                              {obtido ? (
                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#f1f8f6", border: "1px solid #1a7f4b30" }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Chip label={protecao.orgao} size="small" sx={{ bgcolor: "#1a7f4b", color: "#fff", fontSize: 9, fontWeight: 900, height: 18 }} />
                                    <Typography variant="caption" fontWeight={900} color="#1a7f4b">
                                      🛡️ Risco Reduzido: {protecao.risco_sem}% → {protecao.risco_com}%
                                    </Typography>
                                  </Stack>
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10, fontWeight: 800, mb: 1 }}>
                                    Dispositivo Legal: {protecao.dispositivo}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4, mb: 1.5 }}>
                                    <strong>Impacto Real:</strong> {protecao.consequencia_com}
                                  </Typography>
                                  {protecao.impacto_financeiro && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <Typography variant="caption" fontWeight={900} color="#1b4332">
                                        💰 Prevenção Financeira Estimada: {protecao.impacto_financeiro}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: "#ffebee20", border: "1px solid #d32f2f30" }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Chip label={protecao.orgao} size="small" sx={{ bgcolor: "#d32f2f", color: "#fff", fontSize: 9, fontWeight: 900, height: 18 }} />
                                    <Typography variant="caption" fontWeight={900} color="#d32f2f">
                                      ⚠️ Risco de Omissão: {protecao.risco_sem}%
                                    </Typography>
                                  </Stack>
                                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10, fontWeight: 800, mb: 1 }}>
                                    Exposição Legal: {protecao.dispositivo}
                                  </Typography>
                                  <Typography variant="body2" color="#c62828" sx={{ fontSize: 11, lineHeight: 1.4, mb: 1, fontWeight: 700 }}>
                                    Consequência Jurídica: {protecao.consequencia_sem}
                                  </Typography>
                                  <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: 9, mt: 0.5, fontStyle: "italic" }}>
                                    Complete a auditoria de conformidade correspondente para adquirir esta proteção legal.
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                          {!expandido && (
                            <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 1, fontSize: 8, fontStyle: "italic" }}>
                              Clique para expandir blindagem jurídica
                            </Typography>
                          )}
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ABA: MISSÕES */}
      {aba === 1 && (
        <Stack spacing={2.5}>
          {MISSOES.map((m) => {
            const concluida = missoes_concluidas.includes(m.id);
            const desbloqueada = !m.desbloqueiaApos ||
              missoes_concluidas.includes(m.desbloqueiaApos);

            return (
              <Card key={m.id} sx={{
                borderRadius: 4,
                border: `1.5px solid ${concluida ? "#1a7f4b" : desbloqueada ? `${m.cor}30` : "#e0e0e0"}`,
                opacity: !desbloqueada ? 0.6 : 1,
                background: concluida 
                  ? "linear-gradient(135deg, #ffffff 0%, #f7fdf9 100%)" 
                  : "linear-gradient(135deg, #ffffff 0%, #fffdfd 100%)",
                boxShadow: "none"
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Avatar sx={{ bgcolor: concluida ? "#1a7f4b" : m.cor, color: "#fff", width: 48, height: 48, fontSize: 24 }}>
                      {concluida ? "🛡️" : m.emoji}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={900} fontSize={15} color="#1b4332">{m.nome}</Typography>
                        {concluida && <CheckCircle sx={{ color: "#1a7f4b", fontSize: 18 }} />}
                        {!desbloqueada && <Lock sx={{ color: "#9e9e9e", fontSize: 18 }} />}
                      </Stack>
                      <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5 }}>{m.descricao}</Typography>
                      
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={`+${m.recompensaXP} XP`} size="small"
                          sx={{ bgcolor: "#fff9c4", color: "#f57f17", fontWeight: 800, fontSize: 9, height: 18 }} />
                        <Chip label={`${m.passos.length} Passos`} size="small" variant="outlined"
                          sx={{ fontSize: 9, fontWeight: 700, height: 18 }} />
                      </Stack>

                      {/* TAREFA 4: Bloco de Impacto da Omissão Jurídica (Sempre Visível) */}
                      {m.impacto_vistoria && (
                        <Box 
                          sx={{ 
                            mt: 2, 
                            p: 2, 
                            borderRadius: 3, 
                            border: "1px solid", 
                            borderColor: concluida ? "#1a7f4b25" : "#ffa00025",
                            bgcolor: concluida ? "#f4faf6" : "#fff8e120"
                          }}
                        >
                          {!concluida ? (
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <Warning sx={{ color: "#ffa000", fontSize: 16 }} />
                                <Typography variant="caption" fontWeight={900} color="#b26a00">
                                  CONSEQUÊNCIA DA NÃO CONFORMIDADE EM FISCALIZAÇÃO:
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4, mb: 1 }}>
                                {m.impacto_vistoria.sem_missao}
                              </Typography>
                              {m.impacto_vistoria.custo_omissao && (
                                <Typography variant="caption" display="block" fontWeight={900} color="#d32f2f">
                                  💰 Prejuízo Estimado por Omissão: {m.impacto_vistoria.custo_omissao}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                <Shield sx={{ color: "#1a7f4b", fontSize: 16 }} />
                                <Typography variant="caption" fontWeight={900} color="#1a7f4b">
                                  COBERTURA E BLINDAGEM REGULATÓRIA ATIVA:
                                </Typography>
                              </Stack>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, lineHeight: 1.4 }}>
                                {m.impacto_vistoria.com_missao}
                              </Typography>
                            </Box>
                          )}

                          <Typography variant="caption" fontWeight={850} color="text.primary" sx={{ display: "block", mt: 1, fontSize: 10 }}>
                            📈 Incremento do Escudo: +{m.escudo_incremento}% de proteção garantida na nota final.
                          </Typography>
                        </Box>
                      )}
                    </Box>
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
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Nenhuma auditoria realizada ainda nesta unidade. Faça uma auditoria guiada para iniciar!
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {historico.map((score, i) => {
                const n = getNivel(score);
                return (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2,
                    p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "#fff" }}>
                    <Typography fontSize={24}>{n.emoji}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography fontWeight={800} fontSize={13}>{n.nome}</Typography>
                        <Typography fontWeight={900} sx={{ color: n.cor, fontSize: 13 }}>
                          {score}%
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={score}
                        sx={{ height: 8, borderRadius: 4,
                          bgcolor: "#eceff1",
                          "& .MuiLinearProgress-bar": { bgcolor: n.cor } }} />
                    </Box>
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
