import { useMemo } from 'react';
import { useAnalysis } from './useAnalysis';
import { ScoreRing } from './ScoreRing';
import { SignalIcon } from './SignalIcon';
import { Logo } from './Logo';
import type { RiskLevel, Signal } from '../engine/types';

const LEVEL_LABEL: Record<RiskLevel, string> = {
  safe: 'Sitio seguro',
  suspicious: 'Sitio sospechoso',
  dangerous: 'Sitio peligroso',
};

const LEVEL_SUB: Record<RiskLevel, string> = {
  safe: 'No se detectaron señales de riesgo relevantes.',
  suspicious: 'Revisa las señales antes de continuar.',
  dangerous: 'No introduzcas contraseñas ni datos personales.',
};

export function Popup() {
  const { loading, result } = useAnalysis();
  const signals = useMemo<Signal[]>(
    () => (result ? [...result.signals].sort((a, b) => b.weight - a.weight) : []),
    [result],
  );

  return (
    <main className={`pp ${result ? `pp--${result.level}` : ''}`}>

      <header className="pp__top">
        <span className="brand"><Logo /> Veladia</span>
        <button type="button" className="icon-btn" aria-label="Ajustes" title="Ajustes"
          onClick={() => chrome.runtime.openOptionsPage()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </button>
      </header>

      {loading && (
        <div className="state">
          <span className="state__icon state__icon--spin" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 12a9 9 0 1 1-6.2-8.6" />
            </svg>
          </span>
          <p className="state__text">Analizando la página…</p>
        </div>
      )}
      {!loading && !result && (
        <div className="state">
          <span className="state__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <p className="state__text">Abre una página web para ver su análisis de seguridad.</p>
        </div>
      )}

      {!loading && result && (
        <>
          <section className="hero">
            <ScoreRing score={result.score} level={result.level} />
            <div className="hero__meta">
              <span className="hero__level">{LEVEL_LABEL[result.level]}</span>
              <span className="hero__host" title={result.hostname}>{result.hostname || '—'}</span>
              <span className="hero__sub">{LEVEL_SUB[result.level]}</span>
            </div>
          </section>

          <section className="details">
            <div className="details__head"><span>Señales detectadas</span><span className="count">{signals.length}</span></div>
            {signals.length === 0 ? (
              <div className="safe-empty">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.4 2.4 4.6-4.8" />
                </svg>
                Sin indicadores de riesgo.
              </div>
            ) : (
              <ul className="signals">
                {signals.map((s) => (
                  <li key={s.id} className={s.weight < 0 ? 'is-trust' : 'is-risk'}>
                    <span className="signals__ic"><SignalIcon category={s.category} /></span>
                    <span className="signals__label">{s.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
