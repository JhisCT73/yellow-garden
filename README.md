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

El sonido comienza desactivado y se genera con Web Audio en el dispositivo. El botón de descubrimiento ofrece una alternativa de teclado a tocar las flores. El movimiento reducido acorta crecimiento, floración, formación del ramo y revelado de la carta, y elimina el movimiento ambiental. Sin WebGL2, se muestra el mensaje del regalo y la opción de reintentar.

Después de florecer, pulsa **Crear mi ramo**. Arrastra la cinta dorada o el control **Tira de la cinta** hacia la derecha. Un gesto corto vuelve a la posición inicial; un gesto completo revela la tarjeta. También puedes usar **Desatar sin arrastrar** o enfocar el control de cinta y pulsar Enter/Espacio. Toca la tarjeta o pulsa **Leer mi carta** para leerla; Escape cierra la nota y devuelve el foco al control. La dedicatoria sigue disponible directamente desde el jardín, sin obligar a completar el gesto.

**Un último deseo** inicia el viento desde el jardín o desde la tarjeta. Mantén pulsado y suelta, con dedo, ratón, Espacio o Enter. **Continuar sin mantener pulsado** ofrece una alternativa de un solo paso. Escape, la cancelación del puntero o salir de la pestaña cancelan la pulsación. Las partículas se dispersan y forman un corazón con profundidad; después puedes quedarte explorando el jardín, repetir el deseo o empezar de nuevo. Con movimiento reducido, el corazón aparece estático sin ráfaga ni pulso.

Desde el corazón, **Un mensaje entre las luces** transforma los puntos en **FELIZ PRIMAVERA** y la fecha configurada. Se conserva una versión HTML legible para tecnologías de asistencia. El jardín combina girasoles, margaritas amarillas y pequeñas flores en copa; el girasol principal siempre se mantiene.

El símbolo dorado junto al título esconde una pequeña terminal de juguete. Se abre al tocarlo, mantenerlo pulsado o activarlo por teclado; no ejecuta comandos reales ni altera la historia. Puedes desactivarlo con `secrets: false`. Todos estos descubrimientos son opcionales.

## Alcance de esta versión

Implementado: jardín nocturno, semilla, tallos y hojas, tres tipos de flores procedurales, floración, jardín reproducible, mensajes, formación animada del ramo, cinta 3D arrastrable, tarjeta tridimensional con textura local, lectura accesible, viento interactivo, corazón y texto de partículas, exploración posterior al final, secreto opcional, reinicio, audio opcional y ajuste básico de calidad.

Pendiente del plan maestro: secretos adicionales (mariposa, estrellas y flor gigante), variantes de luz/agua/música y un pase de calidad/rendimiento en hardware real. La tarjeta se revela en 3D y el texto completo se lee en un diálogo HTML accesible. No se presenta como la implementación completa de las 15 fases.

## Publicar en GitHub Pages

El proyecto está listo para un repositorio llamado `yellow-garden`. Configura **Settings → Pages → Source → GitHub Actions** y publica la rama `main`. El workflow `deploy.yml` genera y publica `dist`. Las rutas relativas permiten servirlo bajo `/yellow-garden/`.

La publicación requiere una sesión válida en GitHub y un repositorio remoto. No se incluyen secretos. La CI valida tipos, lint, pruebas unitarias, build y recorrido en Chromium de escritorio y móvil emulado. Es necesario comprobar Safari/iPhone y Android reales antes de afirmar compatibilidad completa.

## Diseño técnico

Svelte 5 + TypeScript + Vite; Three.js dentro de Threlte; XState para el recorrido; GSAP para crecimiento y floración. Consulta `ARCHITECTURE.md`.

Licencia MIT. Consulta `ATTRIBUTIONS.md` para las dependencias y recursos.
