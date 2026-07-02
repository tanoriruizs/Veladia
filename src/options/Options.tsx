import { useEffect, useState } from 'react';
import { useSettings } from './useSettings';
import { applyTheme } from '../shared/theme';
import { Logo } from '../popup/Logo';
import type { Sensitivity, ThemeMode } from '../engine/types';

const SENSITIVITY: { value: Sensitivity; label: string; hint: string }[] = [
  { value: 'relaxed', label: 'Relajada', hint: 'Solo riesgos altos' },
  { value: 'normal', label: 'Normal', hint: 'Equilibrio recomendado' },
  { value: 'strict', label: 'Estricta', hint: 'Máxima sensibilidad' },
];

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Automático' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export function Options() {
  const { settings, update, saved } = useSettings();
  const activeHint = SENSITIVITY.find((s) => s.value === settings.sensitivity)?.hint;

  useEffect(() => { applyTheme(settings.theme); }, [settings.theme]);

  return (
    <div className="page">
      <main className="opt">
        <header className="opt__head">
          <Logo size={48} />
        </header>

        <section className="card">
          <div className="card__head"><h2>Apariencia</h2><p>Elige el tema de la extensión.</p></div>
          <div className="segmented" role="radiogroup" aria-label="Tema">
            {THEMES.map((t) => (
              <button key={t.value} type="button" role="radio" aria-checked={settings.theme === t.value}
                className={`seg ${settings.theme === t.value ? 'is-active' : ''}`}
                onClick={() => update({ theme: t.value })}>
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card__head"><h2>Sensibilidad</h2><p>{activeHint}</p></div>
          <div className="segmented" role="radiogroup" aria-label="Sensibilidad">
            {SENSITIVITY.map((opt) => (
              <button key={opt.value} type="button" role="radio" aria-checked={settings.sensitivity === opt.value}
                className={`seg ${settings.sensitivity === opt.value ? 'is-active' : ''}`}
                onClick={() => update({ sensitivity: opt.value })}>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="row">
            <div className="card__head"><h2>Banner de advertencia</h2><p>Muestra una alerta visible en sitios peligrosos.</p></div>
            <button type="button" role="switch" aria-checked={settings.showBanner}
              className={`switch ${settings.showBanner ? 'is-on' : ''}`}
              onClick={() => update({ showBanner: !settings.showBanner })}>
              <span className="switch__knob" />
            </button>
          </div>
        </section>

        <DomainList title="Sitios de confianza" hint="Estos dominios se tratarán siempre como seguros."
          placeholder="ejemplo.com" items={settings.userAllowlist} tone="trust"
          onChange={(userAllowlist) => update({ userAllowlist })} />

        <DomainList title="Sitios bloqueados" hint="Estos dominios se marcarán siempre como peligrosos."
          placeholder="malicioso.tk" items={settings.userBlocklist} tone="block"
          onChange={(userBlocklist) => update({ userBlocklist })} />

        <footer className="opt__foot">
          <p className="opt__foot-msg">Análisis 100% local. Ningún dato de navegación sale de tu equipo.</p>
          <p className="opt__foot-meta">Veladia v1.1.0 · <a href="https://github.com/tanoriruizs/Veladia" target="_blank" rel="noopener noreferrer">github.com/tanoriruizs/Veladia</a></p>
        </footer>
      </main>

      <span className={`toast ${saved ? 'is-show' : ''}`}>Cambios guardados</span>
    </div>
  );
}

interface ListProps {
  title: string; hint: string; placeholder: string;
  items: string[]; tone: 'trust' | 'block'; onChange: (items: string[]) => void;
}

function DomainList({ title, hint, placeholder, items, tone, onChange }: ListProps) {
  const [value, setValue] = useState('');
  const add = () => {
    const domain = value.trim().toLowerCase();
    if (!domain || items.includes(domain)) return;
    onChange([...items, domain]);
    setValue('');
  };
  return (
    <section className="card">
      <div className="card__head"><h2>{title}</h2><p>{hint}</p></div>
      <div className="add">
        <input type="text" value={value} placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button type="button" className="btn" onClick={add}>Añadir</button>
      </div>
      {items.length > 0 ? (
        <ul className="chips">
          {items.map((d) => (
            <li key={d} className={`chip chip--${tone}`}>
              {d}
              <button type="button" aria-label={`Quitar ${d}`} onClick={() => onChange(items.filter((x) => x !== d))}>✕</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-hint">Aún no has añadido ningún dominio.</p>
      )}
    </section>
  );
}
