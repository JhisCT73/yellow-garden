# Entrega local · Yellow Garden 0.16

La publicación queda a cargo del usuario. No se creó repositorio remoto ni se subió contenido.

## Archivos de producción

Ejecuta `npm ci` y `npm run build`. El resultado está en `dist/`. `npm run preview` permite revisar exactamente esa compilación. Todos los assets viven junto al sitio; no necesita backend ni secretos. `base: './'` admite un subdirectorio como `/yellow-garden/`.

Para GitHub Pages, crea tu repositorio y configura Settings → Pages → Source → GitHub Actions. Los workflows existentes validan el código y publican `dist/` al enviar la rama `main`. Antes de hacerlo, revisa los textos en `src/content/messages.ts` y la fecha/título en `src/config/garden.config.ts`.

## Validación que requiere dispositivos físicos

No se dispone de un iPhone o Android conectado en esta sesión. La emulación Chromium no certifica Safari, consumo de batería, temperatura, altavoces, vibración o estabilidad de GPU en esos dispositivos.

En Safari/iPhone y Chrome/Android comprueba: apertura sin errores; un recorrido completo; gesto corto/largo de cinta; viento con toque y su cancelación al cambiar de app; diálogo de lectura y cierre; giro de pantalla; modo Ligera; preferencia de movimiento reducido; audio tras interacción; reinicio desde banco. Observa fluidez y temperatura durante varios minutos. Si hay lentitud, conserva Ligera y recoge modelo de teléfono, navegador y escena.

## Dirección visual

Se trata de una interpretación 3D animada del tablero, con paisaje lejano raster. Los modelos conservan un acabado estilizado: no se certifica réplica fotográfica. `docs/complete-scenes-comparison.png` muestra libro, terminal y banco junto a sus referencias; `design-qa.md` documenta diferencias y validación.

La entrega actual incluye `test-results/yellow-garden-0.16.0.zip` con el contenido de `dist/`. Cópialo a tu carpeta de entregas si deseas conservarlo: nuevas pruebas pueden limpiar `test-results/`. El sitio necesita un servidor HTTP; no abrir index.html directamente como archivo local.
