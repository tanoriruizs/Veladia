import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Welcome } from './Welcome';
import { initTheme } from '../shared/theme';
import './welcome.css';

initTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode><Welcome /></StrictMode>,
);
