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

Antes de plantar puedes elegir **Luz**, **Agua** o **Música**. Luz refuerza la iluminación cálida; Agua añade gotas y una luz azul suave; Música añade un ritmo visual lento y armoniza los sonidos de las interacciones. Elegir Música no activa el sonido: usa el control **Activar sonido** si quieres escucharlo. Con movimiento reducido, las gotas quedan quietas y la luz no pulsa. La elección se conserva al reiniciar el recorrido y vuelve a Luz al recargar la página.

El botón **Ajustes del jardín**, junto al sonido, permite elegir calidad **Automática**, **Ligera** o **Alta** sin perder el avance. Automática parte de una estimación según núcleos del dispositivo y reduce progresivamente la calidad si detecta lentitud sostenida; no vuelve a subirla por sí sola. Ligera reduce resolución, hierba, luces ambientales en forma de partículas y gotas. Se conservan todas las flores y los puntos del mensaje para mantener su legibilidad. La elección dura hasta recargar la página.

Después de florecer, pulsa **Crear mi ramo**. Arrastra la cinta dorada o el control **Tira de la cinta** hacia la derecha. Un gesto corto vuelve a la posición inicial; un gesto completo revela la tarjeta. También puedes usar **Desatar sin arrastrar** o enfocar el control de cinta y pulsar Enter/Espacio. Toca la tarjeta o pulsa **Leer mi carta** para leerla; Escape cierra la nota y devuelve el foco al control. La dedicatoria sigue disponible directamente desde el jardín, sin obligar a completar el gesto.

**Un último deseo** inicia el viento desde el jardín o desde la tarjeta. Mantén pulsado y suelta, con dedo, ratón, Espacio o Enter. **Continuar sin mantener pulsado** ofrece una alternativa de un solo paso. Escape, la cancelación del puntero o salir de la pestaña cancelan la pulsación. Las partículas se dispersan y forman un corazón con profundidad; después puedes quedarte explorando el jardín, repetir el deseo o empezar de nuevo. Con movimiento reducido, el corazón aparece estático sin ráfaga ni pulso.

Desde el corazón, **Un mensaje entre las luces** transforma los puntos en **FELIZ PRIMAVERA** y la fecha configurada. Se conserva una versión HTML legible para tecnologías de asistencia. El jardín combina girasoles, margaritas amarillas y pequeñas flores en copa; el girasol principal siempre se mantiene.

El símbolo dorado junto al título esconde una pequeña terminal de juguete. Se abre al tocarlo, mantenerlo pulsado o activarlo por teclado; no ejecuta comandos reales ni altera la historia. Puedes desactivarlo con `secrets: false`. Todos estos descubrimientos son opcionales.

## Alcance de esta versión

La versión 0.8 inicia la adaptación al tablero de escenas del usuario: **semilla → crecimiento → primera flor** ocupa la pantalla completa, con cámara cercana y texto inferior. Los dos fondos/texturas generados viven en `public/textures/`; los protagonistas siguen siendo geometría 3D animada. El jardín panorámico, ramo, carta y finales aún esperan su propia pasada de dirección artística. Esta primera aproximación no reproduce el realismo ni todas las escenas del tablero.

La profundidad de campo se aplica solo durante la apertura en calidad media/alta y se omite en Ligera. Los movimientos de cámara se omiten con movimiento reducido. La floración dura cinco segundos para dar espacio al nuevo plano.

Implementado: jardín nocturno, semilla, tallos y hojas, tres tipos de flores procedurales, floración, jardín reproducible, mensajes, formación animada del ramo, cinta 3D arrastrable, tarjeta tridimensional con textura local, lectura accesible, viento interactivo, corazón y texto de partículas, exploración posterior al final, secreto opcional, reinicio, audio opcional y ajuste básico de calidad.

Después de volver al jardín desde el corazón o el mensaje, **¿Una última sorpresa?** convierte el girasol principal en una flor gigante con un breve destello de polen. **Volver a mi primavera** recupera la composición original. Con movimiento reducido aparece directamente, sin destello ni transición; `secrets: false` también oculta esta sorpresa.

Pendiente del plan maestro: secretos adicionales (mariposa y estrellas), reflejos de agua más elaborados, capas musicales continuas y un pase de calidad/rendimiento en hardware real. La tarjeta se revela en 3D y el texto completo se lee en un diálogo HTML accesible. No se presenta como la implementación completa de las 15 fases.

## Publicar en GitHub Pages

El proyecto está listo para un repositorio llamado `yellow-garden`. Configura **Settings → Pages → Source → GitHub Actions** y publica la rama `main`. El workflow `deploy.yml` genera y publica `dist`. Las rutas relativas permiten servirlo bajo `/yellow-garden/`.

La publicación requiere una sesión válida en GitHub y un repositorio remoto. No se incluyen secretos. La CI valida tipos, lint, pruebas unitarias, build y recorrido en Chromium de escritorio y móvil emulado. Es necesario comprobar Safari/iPhone y Android reales antes de afirmar compatibilidad completa.

## Diseño técnico

Svelte 5 + TypeScript + Vite; Three.js dentro de Threlte; XState para el recorrido; GSAP para crecimiento y floración. Consulta `ARCHITECTURE.md`.

Licencia MIT. Consulta `ATTRIBUTIONS.md` para las dependencias y recursos.

### Jardín y ramo (0.9)

La dirección visual se extiende a las escenas de jardín y ramo. Un paisaje nocturno generado se combina con las flores 3D animadas: estas se desplazan hacia los lados del sendero y después se reúnen. El fondo lejano sigue siendo una imagen sobre un plano; las flores interactivas, cinta y tarjeta son geometría. La composición se aproxima al tablero de referencia, aunque los modelos florales mantienen un acabado estilizado. Tarjeta y finales todavía requieren su propia adaptación visual.
