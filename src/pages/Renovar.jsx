// src/pages/Renovar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Grid, Card, CardContent, Button, 
  Divider, Alert, AlertTitle, CircularProgress, Zoom, Fade, Stack
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import StarsIcon from '@mui/icons-material/Stars';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useUserData } from '../components/ProtectedRoute';
import { diasRestantesPass, isPass } from '../utils/plano';

const CHECKOUT_CORE_BASE = import.meta.env.VITE_HOTMART_CHECKOUT_CORE || 'https://pay.hotmart.com/W105785102R?off=fykjr5au';
const CHECKOUT_PRO_BASE  = import.meta.env.VITE_HOTMART_CHECKOUT_PRO  || 'https://pay.hotmart.com/W105785102R?off=x2rj5zam';

export function Renovar() {
  const userData = useUserData();
  const navigate = useNavigate();
  const [planoEscolhido, setPlanoEscolhido] = useState(null);
  const [naoAgora, setNaoAgora] = useState(false);

  const dias = isPass(userData) ? diasRestantesPass(userData) : 0;
  const venceu = dias === 0;
  const email = userData?.email || '';

  // Se já tem assinatura recorrente ativa, redirecionar
  useEffect(() => {
    if (userData?.plano === 'core' || userData?.plano === 'pro' || userData?.plan === 'core' || userData?.plan === 'pro') {
      navigate('/', { replace: true });
    }
  }, [userData, navigate]);

  function irParaCheckout(plano) {
    const baseUrl = plano === 'core' ? CHECKOUT_CORE_BASE : CHECKOUT_PRO_BASE;
    // Adiciona o e-mail pré-preenchido para o checkout Hotmart
    const connector = baseUrl.includes('?') ? '&' : '?';
    window.location.href = baseUrl + connector + 'email=' + encodeURIComponent(email);
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f0fdf4' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (naoAgora) {
    return (
      <Fade in={naoAgora}>
        <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
          <Card elevation={4} sx={{ borderRadius: 6, p: 4, bgcolor: '#ffffff', border: '1px solid #e8f5e9' }}>
            <Typography variant="h1" sx={{ fontSize: 64, mb: 2 }}>🔔</Typography>
            <Typography variant="h5" fontWeight={800} color="#1b4332" mb={1.5}>
              Tudo bem — sem pressa!
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: '400px', mx: 'auto', lineHeight: 1.6 }}>
              Seus dados, auditorias e relatórios continuarão blindados e salvos por 30 dias após o vencimento. Você pode retornar a qualquer momento.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setNaoAgora(false)}
              startIcon={<ArrowBackIcon />}
              sx={{ px: 4, py: 1.5, borderRadius: 3, fontWeight: 700 }}
            >
              Ver Planos Novamente
            </Button>
          </Card>
        </Container>
      </Fade>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      
      {/* Banner de status */}
      <Zoom in={true}>
        <Box sx={{ mb: 4 }}>
          {venceu ? (
            <Alert 
              severity="error" 
              icon={<LockIcon sx={{ fontSize: 24, color: '#c62828' }} />}
              sx={{ 
                borderRadius: 4, 
                bgcolor: '#ffebee', 
                border: '1px solid #ffcdd2',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <AlertTitle sx={{ fontWeight: 800, color: '#c62828' }}>Seu acesso VERTOS Pass expirou</AlertTitle>
              <Typography variant="body2" color="#b71c1c" fontWeight={500}>
                Seus dados e históricos de auditorias estão totalmente salvos. Escolha uma das assinaturas recorrentes abaixo para continuar usando a plataforma sem limites.
              </Typography>
            </Alert>
          ) : (
            <Alert 
              severity="warning" 
              icon={<WatchLaterIcon sx={{ fontSize: 24, color: '#e65100' }} />}
              sx={{ 
                borderRadius: 4, 
                bgcolor: '#fff3e0', 
                border: '1px solid #ffe0b2',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              <AlertTitle sx={{ fontWeight: 800, color: '#e65100' }}>Seu acesso VERTOS Pass expira em breve</AlertTitle>
              <Typography variant="body2" color="#e65100" fontWeight={500}>
                Resta(m) apenas <strong>{dias === 1 ? '1 dia' : `${dias} dias`}</strong> de acesso. Migre para um plano mensal recorrente e garanta a blindagem do seu estabelecimento sem interrupções!
              </Typography>
            </Alert>
          )}
        </Box>
      </Zoom>

      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" fontWeight={900} color="#1b4332" mb={1}>
          Escolha como quer continuar
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Sem taxas extras, fidelidade ou pegadinhas — cancele quando quiser em 1 clique
        </Typography>
      </Box>

      {/* Grid de planos */}
      <Grid container spacing={4} sx={{ mb: 4, alignItems: 'stretch' }}>
        
        {/* CORE */}
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => setPlanoEscolhido('core')}
            sx={{
              height: '100%',
              borderRadius: 6,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: planoEscolhido === 'core' ? '3px solid #52b788' : '1px solid #e0e0e0',
              boxShadow: planoEscolhido === 'core' ? '0 12px 30px rgba(82, 183, 136, 0.25)' : '0 4px 12px rgba(0, 0, 0, 0.05)',
              transform: planoEscolhido === 'core' ? 'scale(1.02)' : 'none',
              '&:hover': {
                border: planoEscolhido === 'core' ? '3px solid #52b788' : '1px solid #52b78880',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {planoEscolhido === 'core' && (
                <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#52b788', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight={950}>✓</Typography>
                </Box>
              )}
              
              <Typography variant="subtitle2" fontWeight={850} color="#52b788" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
                Plano Básico
              </Typography>
              <Typography variant="h5" fontWeight={900} color="#1b4332" mb={1}>
                VERTOS Core
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Ideal para Responsáveis Técnicos gerindo um único estabelecimento.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                <Typography variant="h3" fontWeight={900} color="#1b4332">R$ 49,90</Typography>
                <Typography variant="subtitle1" color="text.secondary" ml={1}>/mês</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2}>
                {[
                  '1 estabelecimento ativo',
                  'Auditorias ilimitadas',
                  'Escudo de Conformidade',
                  'Dossiê PDF + Carta-Resposta',
                  'Interpretador de BVO e notificações',
                  'Guia de Renovação por UF',
                ].map(f => (
                  <Box key={f} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#52b788', fontSize: 18 }} />
                    <Typography variant="body2" color="text.primary" fontWeight={500}>{f}</Typography>
                  </Box>
                ))}
                {['Cockpit 360° com KPIs', 'Múltiplos estabelecimentos', 'Relatórios CRMV avançados'].map(f => (
                  <Box key={f} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', opacity: 0.4 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>—</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>{f}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* PRO */}
        <Grid item xs={12} md={6}>
          <Card 
            onClick={() => setPlanoEscolhido('pro')}
            sx={{
              height: '100%',
              borderRadius: 6,
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: planoEscolhido === 'pro' ? '3px solid #52b788' : '2px solid #1b4332',
              boxShadow: planoEscolhido === 'pro' ? '0 12px 30px rgba(82, 183, 136, 0.25)' : '0 6px 20px rgba(27, 67, 50, 0.15)',
              transform: planoEscolhido === 'pro' ? 'scale(1.02)' : 'none',
              '&:hover': {
                border: planoEscolhido === 'pro' ? '3px solid #52b788' : '2px solid #52b788',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -1, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                bgcolor: '#1b4332', 
                color: '#fff', 
                fontSize: 11, 
                fontWeight: 800, 
                px: 3, 
                py: 0.6, 
                borderRadius: '0 0 12px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}
            >
              <StarsIcon sx={{ fontSize: 14, color: '#ffd700' }} />
              MAIS POPULAR
            </Box>

            <CardContent sx={{ p: 4, pt: 5 }}>
              {planoEscolhido === 'pro' && (
                <Box sx={{ position: 'absolute', top: 16, right: 16, bgcolor: '#52b788', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight={950}>✓</Typography>
                </Box>
              )}

              <Typography variant="subtitle2" fontWeight={850} color="#1b4332" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
                Plano Completo
              </Typography>
              <Typography variant="h5" fontWeight={900} color="#1b4332" mb={1}>
                VERTOS Pro
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Para RTs que gerenciam múltiplas clínicas e exigem relatórios regulatórios de alta fidelidade.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                <Typography variant="h3" fontWeight={900} color="#1b4332">R$ 87,90</Typography>
                <Typography variant="subtitle1" color="text.secondary" ml={1}>/mês</Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2}>
                {[
                  'Tudo do plano CORE',
                  'Estabelecimentos ilimitados',
                  'Cockpit 360° + KPIs Regulatórios',
                  'Diagnóstico proativo semanal',
                  'Gamificação + Escudo completo',
                  'Relatórios CRMV avançados (4 tipos)',
                  'Suporte e Onboarding Premium',
                ].map(f => (
                  <Box key={f} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <CheckCircleIcon sx={{ color: '#1b4332', fontSize: 18 }} />
                    <Typography variant="body2" color="text.primary" fontWeight={750}>{f}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resumo e botão final de checkout */}
      {planoEscolhido && (
        <Fade in={!!planoEscolhido}>
          <Card elevation={5} sx={{ borderRadius: 5, p: 3, mb: 3, border: '1px solid #e0e0e0', bgcolor: '#ffffff' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Plano Selecionado</Typography>
              <Typography variant="body2" fontWeight={800} color="#1b4332">
                VERTOS {planoEscolhido === 'core' ? 'Core' : 'Pro'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>Ciclo de Cobrança</Typography>
              <Typography variant="body2" color="#1b4332" fontWeight={500}>Mensal automático · cancele sem burocracia</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#1b4332">Total a ser cobrado</Typography>
              <Typography variant="h5" fontWeight={900} color="#1b4332">
                R$ {planoEscolhido === 'core' ? '49,90' : '87,90'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => irParaCheckout(planoEscolhido)}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                py: 2, 
                borderRadius: 3.5, 
                fontSize: 15, 
                fontWeight: 800, 
                bgcolor: '#1b4332',
                color: '#e1f5ee',
                '&:hover': {
                  bgcolor: '#2d6a4f'
                }
              }}
            >
              Assinar VERTOS {planoEscolhido === 'core' ? 'CORE' : 'PRO'} por R$ {planoEscolhido === 'core' ? '49,90' : '87,90'}/mês
            </Button>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2, color: 'text.secondary', fontSize: 11 }}>
              <LockIcon sx={{ fontSize: 13, color: '#52b788' }} />
              Pagamento 100% criptografado e seguro processado pela Hotmart
            </Box>
          </Card>
        </Fade>
      )}

      {/* Não agora link */}
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Button 
          variant="text" 
          onClick={() => setNaoAgora(true)}
          sx={{ color: '#999', fontSize: 12, fontWeight: 600, textTransform: 'none', '&:hover': { color: '#666' } }}
        >
          Não agora — me lembre em 24h
        </Button>
      </Box>

    </Container>
  );
}
export default Renovar;
