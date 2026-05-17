// src/hooks/usePlanoGuard.js

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useUserData } from '../components/ProtectedRoute';
import { planoAtivo, isPass, diasRestantesPass } from '../utils/plano';

// Rotas que nunca bloqueiam (sempre acessíveis)
const ROTAS_LIVRES = ['/login', '/cadastro', '/planos', '/renovar', '/pagamento'];

export function usePlanoGuard() {
  const { user } = useAuth();
  const userData = useUserData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !userData) return;
    if (ROTAS_LIVRES.some(r => location.pathname.startsWith(r))) return;

    const ativo = planoAtivo(userData);

    if (!ativo) {
      // Plano vencido → tela de renovação
      navigate('/renovar', { replace: true });
      return;
    }

    // PASS ativo mas vencendo em ≤7 dias → mostrar banner (não bloqueia)
    if (isPass(userData)) {
      const dias = diasRestantesPass(userData);
      if (dias <= 7) {
        // O banner é controlado pelo componente BannerPassExpirando
        // Apenas registrar no localStorage para o banner saber
        localStorage.setItem('vertos_pass_dias', dias.toString());
      }
    }
  }, [user, userData, location.pathname, navigate]);
}
