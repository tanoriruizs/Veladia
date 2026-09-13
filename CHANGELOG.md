# Changelog

Todas las novedades relevantes de Veladia se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/) y versionado semántico.

## [1.3.0] — 2026-09-13

### Detección
- Nuevas señales de suplantación: nombre de marca con otro TLD (`paypal.net`),
  marca combinada con palabras (`paypal-login.com`) y marca como subdominio de
  un dominio ajeno (`paypal.com-secure.top`).
- El typosquatting por distancia de edición ahora compara solo el nombre (sin
  TLD) y con un umbral proporcional al largo: se acaban los falsos positivos
  con marcas cortas (`abc.com` ~ `hsbc.com`, `room.us` ~ `zoom.us`…).
- Homoglyphs de pares de letras (`rnicrosoft` -> `microsoft`, `vv` -> `w`).

### Seguridad
- La pantalla de bloqueo ahora es una página propia de la extensión: el service
  worker redirige la pestaña en cuanto detecta la blocklist (antes de que la
  página cargue) y el kit de phishing ya no puede ocultar ni borrar el aviso.
- El banner de advertencia se monta en un Shadow DOM cerrado para resistir
  manipulación desde la página.

### Corregido
- El soporte de SPAs no funcionaba: el parche de `history.pushState` vivía en
  el *isolated world* del content script y la página nunca lo ejecutaba. Ahora
  el service worker detecta el cambio de URL (`tabs.onUpdated`) y avisa al
  content script.
- El popup podía aceptar el resultado de otra pestaña si llegaba antes de
  resolver la pestaña activa.
- Dos análisis simultáneos podían perder entradas del historial (escrituras
  serializadas).

### Infraestructura
- `dist/` deja de versionarse; la extensión compilada se publica como zip en
  GitHub Releases (nuevo workflow al crear un tag `v*`).
- Las listas generadas ya no incluyen timestamp: el workflow diario solo
  commitea cuando los datos realmente cambian, y solo `src/data/allowlist.ts`.

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

