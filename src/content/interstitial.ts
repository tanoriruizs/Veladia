import type { AnalysisResult } from '../engine/types';

const OVERLAY_ID = 'veladia-interstitial';

export function removeInterstitial(): void {
  document.getElementById(OVERLAY_ID)?.remove();
  document.documentElement.style.removeProperty('overflow');
}

// pantalla completa para phishing confirmado (blocklist); bloquea la interacción
export function showInterstitial(result: AnalysisResult, onContinue: () => void): void {
  removeInterstitial();
  document.documentElement.style.setProperty('overflow', 'hidden');

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background: '#7f1d1d',
    color: '#fff',
    font: '15px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  });

  const card = document.createElement('div');
  Object.assign(card.style, { maxWidth: '520px', textAlign: 'center' });

  const icon = document.createElement('div');
  icon.textContent = '⚠';
  Object.assign(icon.style, { fontSize: '52px', lineHeight: '1', marginBottom: '18px' });

  const title = document.createElement('h1');
  title.textContent = 'Sitio de phishing conocido';
  Object.assign(title.style, { margin: '0 0 10px', fontSize: '26px', fontWeight: '700', letterSpacing: '-0.02em' });

  const host = document.createElement('p');
  host.textContent = result.hostname;
  Object.assign(host.style, {
    margin: '0 0 14px', fontFamily: 'ui-monospace, Consolas, monospace',
    fontSize: '15px', opacity: '0.9', wordBreak: 'break-all',
  });

  const body = document.createElement('p');
  body.textContent =
    'Este dominio está en una lista de phishing confirmado. ' +
    'No introduzcas contraseñas, datos bancarios ni información personal.';
  Object.assign(body.style, { margin: '0 0 26px', opacity: '0.92' });

  const back = document.createElement('button');
  back.type = 'button';
  back.textContent = 'Volver atrás (recomendado)';
  Object.assign(back.style, {
    display: 'block', width: '100%', cursor: 'pointer', border: 'none',
    background: '#fff', color: '#7f1d1d', padding: '13px 18px',
    borderRadius: '10px', font: 'inherit', fontWeight: '700', marginBottom: '10px',
  });
  back.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = 'about:blank';
  });

  const proceed = document.createElement('button');
  proceed.type = 'button';
  proceed.textContent = 'Continuar bajo mi propio riesgo';
  Object.assign(proceed.style, {
    display: 'block', width: '100%', cursor: 'pointer',
    border: '1px solid rgba(255,255,255,.4)', background: 'transparent',
    color: '#fff', padding: '11px 18px', borderRadius: '10px',
    font: 'inherit', fontWeight: '600', opacity: '0.85',
  });
  proceed.addEventListener('click', () => {
    removeInterstitial();
    onContinue();
  });

  card.append(icon, title, host, body, back, proceed);
  overlay.append(card);
  document.documentElement.appendChild(overlay);
  back.focus();
}
