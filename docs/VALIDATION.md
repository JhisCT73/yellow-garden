# Validación de la primera entrega

Comprobado en Windows el 19 de septiembre de 2026:

- TypeScript/Svelte: sin errores ni advertencias.
- Vitest: 3 pruebas de generación y máquina narrativa aprobadas.
- Playwright/Chromium: 6 pruebas aprobadas en escritorio y móvil emulado; recorrido, mensajes, nota, foco, reinicio, movimiento reducido y alternativa sin WebGL.
- Capturas de escritorio y móvil inspeccionadas; se ajustaron cámara, vegetación y títulos tras la revisión.
- Compilación estática generada. Three.js produce una advertencia de tamaño de chunk (aprox. 704 kB minificado, 181 kB gzip); el conjunto JS es aproximadamente 251 kB gzip. No hay recursos externos de ejecución.
- Auditoría npm tras actualizar Vitest: 0 vulnerabilidades reportadas.

Pendientes: hardware Android/iPhone real, Safari, Firefox y Edge. No se ha medido todavía un presupuesto de FPS sostenido ni consumo de batería en teléfonos. La versión móvil permite desplazamiento en pantallas cortas.

GitHub Pages está preparado mediante workflow, pero no se publicó: la sesión local de GitHub reporta un token inválido. No se creó un repositorio remoto.
