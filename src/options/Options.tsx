import { useEffect, useRef, useState } from 'react';
import { useSettings } from './useSettings';
import { useHistory } from './useHistory';
import { applyTheme } from '../shared/theme';
import { serializeBackup, parseBackup, mergeUnique } from '../shared/lists';
import { Logo } from '../popup/Logo';
import type { Sensitivity, Settings, ThemeMode } from '../engine/types';

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

        <BackupCard settings={settings} update={update} />

        <HistoryCard />

        <footer className="opt__foot">
          <p className="opt__foot-msg">Análisis 100% local. Ningún dato de navegación sale de tu equipo.</p>
          <p className="opt__foot-meta">Veladia v1.2.0 · <a href="https://github.com/tanoriruizs/Veladia" target="_blank" rel="noopener noreferrer">github.com/tanoriruizs/Veladia</a></p>
        </footer>
      </main>

      <span className={`toast ${saved ? 'is-show' : ''}`}>Cambios guardados</span>
    </div>
  );
}

const LEVEL_TEXT: Record<string, string> = { suspicious: 'Sospechoso', dangerous: 'Peligroso' };

function HistoryCard() {
  const { history, clear } = useHistory();
  return (
    <section className="card">
      <div className="row">
        <div className="card__head">
          <h2>Historial de detecciones</h2>
          <p>Sitios marcados como sospechosos o peligrosos. Se guarda solo en tu equipo.</p>
        </div>
        {history.length > 0 && (
          <button type="button" className="btn-subtle" onClick={clear}>Borrar</button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="empty-hint">Sin detecciones registradas por ahora.</p>
      ) : (
        <ul className="hist">
          {history.map((e) => (
            <li key={`${e.hostname}-${e.at}`}>
              <span className={`hist__dot hist__dot--${e.level}`} title={LEVEL_TEXT[e.level] ?? e.level} />
              <span className="hist__host" title={e.hostname}>{e.hostname}</span>
              <span className="hist__score">{e.score}/100</span>
              <span className="hist__date">{new Date(e.at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BackupCard({ settings, update }: { settings: Settings; update: (patch: Partial<Settings>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  const exportLists = () => {
    const json = serializeBackup({ userAllowlist: settings.userAllowlist, userBlocklist: settings.userBlocklist });
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'veladia-listas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (file: File) => {
    void file.text().then((text) => {
      const backup = parseBackup(text);
      if (!backup) { setError(true); return; }
      setError(false);
      update({
        userAllowlist: mergeUnique(settings.userAllowlist, backup.userAllowlist),
        userBlocklist: mergeUnique(settings.userBlocklist, backup.userBlocklist),
      });
    });
  };

  return (
    <section className="card">
      <div className="card__head">
        <h2>Copia de seguridad</h2>
        <p>Exporta tus listas a un archivo JSON o impórtalas desde otro equipo.</p>
      </div>
      <div className="backup">
        <button type="button" className="btn" onClick={exportLists}>Exportar listas</button>
        <button type="button" className="btn btn--ghost" onClick={() => fileRef.current?.click()}>Importar listas</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importFile(file);
            e.target.value = '';
          }} />
      </div>
      {error && <p className="backup__error">El archivo no es una copia válida de Veladia.</p>}
    </section>
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
