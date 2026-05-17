// src/components/Planos/BannerPassExpirando.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../ProtectedRoute';
import { isPass, diasRestantesPass } from '../../utils/plano';

export function BannerPassExpirando() {
  const userData = useUserData();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('vertos_banner_dismissed') === new Date().toDateString();
  });

  if (!isPass(userData)) return null;

  const dias = diasRestantesPass(userData);
  if (dias > 7) return null;
  if (dismissed) return null;

  const urgente = dias <= 3;

  const handleDismiss = () => {
    localStorage.setItem('vertos_banner_dismissed', new Date().toDateString());
    setDismissed(true);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 20px',
      background: urgente ? '#FCEBEB' : '#FAEEDA',
      borderBottom: `1px solid ${urgente ? '#F7C1C1' : '#FAC775'}`,
      zIndex: 1100,
      position: 'relative'
    }}>
      <span style={{ fontSize: 14, color: urgente ? '#791F1F' : '#633806', display: 'flex', alignItems: 'center', gap: 6 }}>
        {urgente ? '⚠️' : '⏰'}
        {' '}Seu acesso VERTOS Pass vence em{' '}
        <strong>{dias === 0 ? 'menos de 1 dia' : `${dias} dia${dias > 1 ? 's' : ''}`}</strong>
        {' '}— seus dados ficam salvos.
      </span>
      <button
        onClick={() => navigate('/renovar')}
        style={{
          marginLeft: 'auto',
          fontSize: 12,
          fontWeight: 700,
          padding: '5px 14px',
          background: urgente ? '#A32D2D' : '#854F0B',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Ver planos →
      </button>
      <button
        onClick={handleDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: urgente ? '#791F1F' : '#633806', fontSize: 18, flexShrink: 0, fontWeight: 'bold' }}
        aria-label="Fechar banner"
      >
        ×
      </button>
    </div>
  );
}
