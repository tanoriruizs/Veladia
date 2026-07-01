import type { ReactNode } from 'react';
import { ScoreRing } from '../popup/ScoreRing';
import { Logo } from '../popup/Logo';

export interface Step { art: ReactNode; title: string; body: string; }

function MiniRings() {
  return (
    <div className="art-rings">
      <ScoreRing score={12} level="safe" />
      <ScoreRing score={48} level="suspicious" />
      <ScoreRing score={84} level="dangerous" />
    </div>
  );
}
function BadgeArt() {
  return (
    <div className="art-badge">
      <div className="art-badge__chip"><Logo size={40} /></div>
      <span className="art-badge__dot art-badge__dot--danger">✕</span>
    </div>
  );
}
function BannerArt() {
  return (
    <div className="art-banner">
      <div className="art-banner__bar"><span>⚠ Señales de phishing detectadas</span></div>
      <div className="art-banner__page" />
    </div>
  );
}
function ControlsArt() {
  return (
    <div className="art-controls">
      <div className="art-seg"><span>Relajada</span><span className="is-active">Normal</span><span>Estricta</span></div>
      <div className="art-switch"><span /></div>
    </div>
  );
}

export const STEPS: Step[] = [
  {
    art: (
      <div className="art-logo">
        <Logo size={76} />
      </div>
    ),
    title: 'Te damos la bienvenida a Veladia',
    body: 'Analiza cada sitio que visitas y te avisa si parece phishing. Todo el análisis ocurre en tu navegador: ningún dato sale de tu equipo.',
  },
  { art: <MiniRings />, title: 'Una puntuación de riesgo clara', body: 'Cada sitio recibe una puntuación de 0 a 100, con un veredicto a primera vista: seguro, sospechoso o peligroso.' },
  { art: <BadgeArt />, title: 'Vigila el icono de la barra', body: 'El icono cambia de color según el riesgo de la página actual. Haz clic para ver el detalle de las señales detectadas.' },
  { art: <BannerArt />, title: 'Alerta en sitios peligrosos', body: 'Si una página tiene señales claras de phishing, Veladia muestra un banner de advertencia para que no introduzcas tus datos.' },
  { art: <ControlsArt />, title: 'Tú tienes el control', body: 'Ajusta la sensibilidad y gestiona tus propias listas de sitios de confianza o bloqueados desde la página de ajustes.' },
];
