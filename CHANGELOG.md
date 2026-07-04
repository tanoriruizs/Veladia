# Changelog

Todas las novedades relevantes de Veladia se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/) y versionado semántico.

## [1.2.0] — 2026-07-03

### Añadido
- Pantalla de bloqueo a página completa en sitios de phishing confirmado
  (blocklist), con "volver atrás" y "continuar bajo mi riesgo".
- Historial de detecciones en Ajustes (solo local, máx. 50 sitios, con borrado).
- Exportar e importar las listas del usuario en JSON desde Ajustes.

## [1.1.1] — 2026-07-03

### Corregido
- Falso positivo de suplantación de marca entre marcas del mismo dueño
  (p. ej. "Gmail" en `google.com`, "Office" en `microsoft.com`): se añaden
  familias de marcas.
- En dominios de confianza ya no se muestran señales de "imita a una marca"
  (typosquatting, favicon o marca ajena): se filtran por reputación.

## [1.1.0] — 2026-07-01

### Detección
- Detección de homoglyphs: dominios que imitan una marca con caracteres
  parecidos (`g00gle`, `micros0ft`, cirílicos/griegos) vía normalización de esqueleto.
- Lista de marcas ampliada (~110): banca, cripto, envíos, telecom y comercio (global + LatAm).
- El content script reanaliza contenido inyectado tras la carga (MutationObserver
  debounced, guiado por firma de contenido).
- Nueva señal: nombre de marca sobre hosting gratuito (p. ej. `paypal-login.github.io`).
- `registrableDomain` reconoce sufijos multi-inquilino (github.io, netlify.app, vercel.app…).
- Corregido falso positivo del símbolo `@` (solo cuenta credenciales, no `@` en la query).
- Corregido conteo de subdominios en ccTLDs (`www.google.co.uk` ya no se marca).
- La detección de marca en el título exige palabra completa y descarta palabras comunes.

### Datos
- Listas de reputación generadas desde feeds reales: Tranco (allowlist) y OpenPhish
  (blocklist), vía `npm run update-lists`.

### Infraestructura
- ESLint (flat config) y script `npm run lint`.
- Integración continua en GitHub Actions (lint + type check + tests + build + artefacto).
- Smoke test end-to-end con Playwright: carga la extensión real y verifica los iconos.
- Refresco automático diario de las listas de reputación (workflow programado que commitea).
- `dist/` deja de versionarse; se genera con `npm run build` o se descarga desde CI.
- Eliminado el permiso `scripting` (no se usaba).
- El popup se actualiza en vivo cuando termina el análisis de contenido.

## [1.0.0] — 2026-06-30

### Primera versión pública

- Motor de heurísticas local: reglas de URL, contenido y reputación.
- Detección de typosquatting (distancia de Levenshtein contra marcas conocidas).
- Detección de favicon de marca en dominios ajenos.
- Puntuación de riesgo 0–100 con niveles seguro / sospechoso / peligroso.
- Badge dinámico por pestaña y banner de advertencia en sitios peligrosos.
- Popup con desglose de señales (React 19).
- Página de ajustes: sensibilidad, banner y listas de confianza/bloqueo del usuario.
- Tour de bienvenida en la primera instalación.
- Soporte de navegación en SPAs (History API).
- Modo oscuro automático en todas las pantallas.
- Análisis 100% local, sin peticiones de red.
- Selector de tema: Automático / Claro / Oscuro (elegible por el usuario).
- Rediseño del popup: iconos por categoría de señal, barra de acento por nivel,
  estado seguro mejorado y subtítulo contextual.

