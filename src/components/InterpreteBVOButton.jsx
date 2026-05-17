import React from 'react';
import './InterpreteBVOButton.css';

/**
 * Botão pulsante para o Intérprete BVO (IA).
 * Substitui o ícone discreto por um banner verde com animação de pulso,
 * tornando a funcionalidade de IA muito mais visível para o usuário.
 *
 * @param {function} onClick - Callback chamado ao clicar no botão
 * @param {boolean}  disabled - Desabilita o botão enquanto carrega
 * @param {string}   label - Texto principal (default: "Intérprete BVO (IA)")
 * @param {string}   sublabel - Texto secundário (default: "Analise esta clínica agora")
 */
export function InterpreteBVOButton({
  onClick,
  disabled = false,
  label = 'Intérprete de documentos emitidos durante vistorias e fiscalizações',
  sublabel = 'Analise esta clínica agora',
}) {
  return (
    <div className="bvo-pulse-wrap">
      {/* Anel de pulso animado — chama atenção passivamente */}
      <div className="bvo-pulse-ring" aria-hidden="true" />

      <button
        className="bvo-pulse-btn"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        type="button"
      >
        {/* Indicador de IA piscante */}
        <span className="bvo-ai-dot" aria-hidden="true" />

        <div className="bvo-pulse-text">
          <span className="bvo-pulse-title">{label}</span>
          <span className="bvo-pulse-sub">{sublabel}</span>
        </div>

        {/* Seta de ação */}
        <svg
          className="bvo-pulse-arrow"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
