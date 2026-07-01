import { useState } from 'react';
import { STEPS } from './steps';

export function Welcome() {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const finish = () => { chrome.runtime.openOptionsPage?.(); window.close(); };
  const next = () => (isLast ? finish() : setStep((s) => s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="wl">
      <div className="wl__card">
        <header className="wl__brand">
          <button type="button" className="wl__skip" onClick={finish}>Saltar</button>
        </header>

        <div className="wl__art" key={step}>{current.art}</div>
        <div className="wl__text"><h1>{current.title}</h1><p>{current.body}</p></div>

        <div className="wl__dots" role="tablist" aria-label="Progreso">
          {STEPS.map((_, i) => <span key={i} className={`wl__dot ${i === step ? 'is-active' : ''}`} />)}
        </div>

        <div className="wl__nav">
          <button type="button" className="btn-ghost" onClick={back} disabled={step === 0}>Atrás</button>
          <button type="button" className="btn-primary" onClick={next}>{isLast ? 'Abrir ajustes' : 'Siguiente'}</button>
        </div>
      </div>
    </div>
  );
}
