# Contribuir

Instala las dependencias con `npm ci`. Mantén separados contenido, geometría y lógica narrativa. Antes de enviar cambios ejecuta `npm run check`, `npm run lint`, `npm test`, `npm run build` y las pruebas E2E. Comprueba teclado, movimiento reducido y un viewport móvil. No añadas dependencias de servicios externos al runtime. Usa commits descriptivos, preferiblemente Conventional Commits.

La web y Windows comparten `src/` y `dist/`; no dupliques escenas para escritorio. Electron vive en `electron/`. Mantén `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true` y la validación de destinos externos. No añadas un puente a Node.js sin una necesidad concreta y revisión de sus permisos.

Si cambias rutas, recursos, seguridad o la ventana, ejecuta `npm run desktop:pack` y prueba el ejecutable con `DESKTOP_EXECUTABLE` y `npm run test:desktop` (consulta README). Comprueba el recorrido, sonido tras interacción, cambio de tamaño, pantalla completa y salida. No subas `dist/`, `release/`, certificados ni claves. El instalador se adjunta a Releases mediante el workflow; no se guarda como binario en Git.

Los mantenedores actualizan Electron regularmente y generan una nueva Release: esta edición no instala actualizaciones automáticamente. Para publicar una versión usa un tag que coincida con `package.json` y revisa el borrador generado antes de hacerlo público.
