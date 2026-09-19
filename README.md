# Yellow Garden 🌻

Un regalo de primavera en un jardín nocturno 3D. Planta una semilla, observa el crecimiento de los girasoles y descubre un mensaje para ti.

## Ejecutar

Requiere Node.js 22.12 o posterior y npm.

```sh
npm install
npm run dev
```

```sh
npm run check
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run preview` sirve la compilación de producción. No necesita backend, credenciales, Blender, CDN ni recursos remotos durante su ejecución.

## Personalizar

- `src/config/garden.config.ts`: título, fecha, número de flores, audio y duración.
- `src/content/messages.ts`: mensajes de las flores y nota final.
- `src/theme/tokens.css`: colores, tipografía y estilos.
- `?seed=ana`: comparte una composición reproducible. Las seeds distinguen mayúsculas.

El sonido comienza desactivado y se genera con Web Audio en el dispositivo. El botón de descubrimiento ofrece una alternativa de teclado a tocar las flores. El movimiento reducido acorta el crecimiento y elimina el movimiento ambiental. Sin WebGL2, se muestra el mensaje del regalo y la opción de reintentar.

## Alcance de esta versión

Implementado: jardín nocturno, semilla, tallos y hojas, girasoles procedurales, floración, jardín reproducible, mensajes, nota accesible, reinicio, audio opcional y ajuste básico de calidad.

Pendiente del plan maestro: formación de ramo, carta tridimensional con cinta, viento por pulsación, corazón de partículas, otras especies y secretos. La nota actual es HTML accesible. No se presenta como la implementación completa de las 15 fases.

## Publicar en GitHub Pages

El proyecto está listo para un repositorio llamado `yellow-garden`. Configura **Settings → Pages → Source → GitHub Actions** y publica la rama `main`. El workflow `deploy.yml` genera y publica `dist`. Las rutas relativas permiten servirlo bajo `/yellow-garden/`.

La publicación requiere una sesión válida en GitHub y un repositorio remoto. No se incluyen secretos. La CI valida tipos, lint, pruebas unitarias, build y recorrido en Chromium de escritorio y móvil emulado. Es necesario comprobar Safari/iPhone y Android reales antes de afirmar compatibilidad completa.

## Diseño técnico

Svelte 5 + TypeScript + Vite; Three.js dentro de Threlte; XState para el recorrido; GSAP para crecimiento y floración. Consulta `ARCHITECTURE.md`.

Licencia MIT. Consulta `ATTRIBUTIONS.md` para las dependencias y recursos.
