# Política de privacidad — Veladia

_Última actualización: junio de 2026_

Veladia se diseñó con la privacidad como principio central.

## Qué datos recopila Veladia

**Ninguno.** Veladia no recopila, transmite ni vende ningún dato personal o de navegación.

## Cómo funciona

Todo el análisis de seguridad ocurre **localmente en tu navegador**:

- La URL y el contenido de la página que visitas se analizan en tu dispositivo mediante reglas heurísticas.
- Los resultados se guardan temporalmente en el almacenamiento local del navegador (`chrome.storage`) solo para mostrar el estado de la pestaña actual.
- Tus listas de sitios de confianza o bloqueados se guardan únicamente en tu navegador.

Veladia **no realiza ninguna petición de red a servidores externos**. No hay analítica, ni telemetría, ni rastreadores.

## Permisos y por qué se usan

- `storage`: guardar tus ajustes y resultados temporales en el navegador.
- `tabs`: conocer la URL de la pestaña activa para analizarla.
- `scripting` / acceso a páginas (`http`/`https`): inspeccionar el contenido de la página visitada para detectar señales de phishing.

Estos permisos se usan exclusivamente para el análisis local descrito. Ningún dato sale de tu equipo.

## Contacto

Para dudas sobre privacidad, abre una incidencia en el repositorio del proyecto.
