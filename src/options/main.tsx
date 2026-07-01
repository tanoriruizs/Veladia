import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Options } from './Options';
import { initTheme } from '../shared/theme';
import './options.css';

initTheme();
createRoot(document.getElementById('root')!).render(
  <StrictMode><Options /></StrictMode>,
);
