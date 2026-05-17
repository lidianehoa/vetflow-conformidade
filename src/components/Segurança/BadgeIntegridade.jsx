import React, { useState, useEffect } from 'react';
import { verificarIntegridade } from '../../utils/security';

/**
 * Badge que verifica e exibe o status de integridade de um registro.
 * Calcular o hash é assíncrono — exibir loading durante o processo.
 *
 * Uso:
 *   <BadgeIntegridade registro={documentoDoFirestore} />
 */
export function BadgeIntegridade({ registro }) {
  const [status, setStatus] = useState('verificando'); // 'verificando' | 'integro' | 'adulterado' | 'sem_hash'

  useEffect(() => {
    if (!registro) return;

    verificarIntegridade(registro)
      .then(({ integro, motivo }) => {
        if (motivo?.includes('sem hash')) {
          setStatus('sem_hash');
        } else {
          setStatus(integro ? 'integro' : 'adulterado');
        }
      })
      .catch(() => setStatus('sem_hash'));
  }, [registro]);

  const config = {
    verificando: {
      label: 'Verificando...',
      bg: '#f1f5f9',
      color: '#64748b',
      icon: '⏳',
    },
    integro: {
      label: 'Registro verificado',
      bg: '#E1F5EE',
      color: '#085041',
      icon: '✓',
    },
    adulterado: {
      label: 'Atenção: hash divergente',
      bg: '#FCEBEB',
      color: '#791F1F',
      icon: '⚠',
    },
    sem_hash: {
      label: 'Sem verificação',
      bg: '#f1f5f9',
      color: '#64748b',
      icon: '–',
    },
  };

  const c = config[status] || config.sem_hash;

  return (
    <span
      title={
        status === 'integro'
          ? 'Hash SHA-256 verificado — este registro não foi alterado desde o salvamento'
          : status === 'adulterado'
          ? 'O hash recalculado não bate com o hash salvo — possível adulteração'
          : 'Este registro não possui verificação de integridade'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        cursor: status === 'adulterado' ? 'help' : 'default',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      {c.icon} {c.label}
    </span>
  );
}
