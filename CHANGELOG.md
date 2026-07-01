# Changelog

Todas las novedades relevantes de Veladia se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/) y versionado semántico.

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

