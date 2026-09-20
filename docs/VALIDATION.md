# Validación de las entregas

## Octava entrega — 0.8.0

- Tipos y lint correctos; 16 pruebas unitarias aprobadas; build correcto. JavaScript aproximado: 268 kB gzip más unos 642 kB de imágenes locales. Permanece la advertencia del chunk de Three.js.
- Revisión visual e interacción mediante el navegador integrado en 1294×856 y 390×844: semilla, crecimiento, floración, paso al jardín, nota y reinicio. No se repitió la batería completa de Playwright en esta entrega.
- Se corrigieron obstrucción de la semilla, escala de piedras, foco de profundidad de campo y corte del entorno en móvil. Capturas y comparación conjunta en `docs/cinematic-*.png`; alcance y límites detallados en `design-qa.md`.
- Los protagonistas siguen siendo 3D; el entorno lejano es una imagen local generada sobre un plano. La primera pasada no reproduce el realismo de las referencias ni modifica toda la secuencia.
- Pendientes mediciones físicas, orientación horizontal y refinamiento de materiales. DOF desactivado en calidad ligera; el movimiento reducido conserva su ruta existente, pero no se volvió a ejecutar su prueba de navegador en esta pasada.

## Séptima entrega — 0.7.0

- TypeScript/Svelte sin errores ni advertencias; lint y compilación de producción correctos.
- 15 pruebas unitarias aprobadas. El monitor se comprueba con frames rápidos, lentitud sostenida, pausas aisladas, segundo plano, reinicio y límite inferior; solo reduce calidad tras dos ventanas lentas consecutivas después del calentamiento.
- 34 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. Los ajustes cambian la resolución real del canvas sin sustituirlo ni perder estado, mantienen la calidad al reiniciar y devuelven el foco al cerrar con Escape.
- Capturas `quality-mobile.png` y `quality-text-mobile.png` revisadas: controles utilizables y texto legible en perfil ligero.
- JavaScript: aproximadamente 263 kB gzip; permanece la advertencia de tamaño de Three.js. En pantallas con DPR suficiente, Ligera limita el dibujo a DPR 1 frente a 1.75 de Alta. Reduce hierba y partículas ambientales; los buffers máximos permanecen reservados y no se afirma ahorro de memoria de geometría.
- La política adaptativa se valida con tiempos simulados en pruebas unitarias. Pendientes las mediciones de FPS, temperatura, batería y memoria en teléfonos reales; no se afirma una mejora de rendimiento medida en hardware físico.

## Sexta entrega — 0.6.0

- TypeScript/Svelte sin errores ni advertencias; lint y compilación de producción correctos.
- 12 pruebas unitarias aprobadas. La nueva prueba verifica gotas estáticas con movimiento reducido, ocultación en el final y cambios de luz sin conservar el efecto anterior.
- 32 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. La elección se verifica con flechas del teclado y puntero, persistencia al reiniciar, activación explícita y silencio del audio, sin errores de consola o ejecución.
- Corregidos el solapamiento del pie con el selector de escritorio y los eventos táctiles que interceptaba la escena móvil. Capturas revisadas: `care-intro-desktop.png`, `care-intro-mobile.png`, `care-water-mobile.png`.
- JavaScript de producción: aproximadamente 262 kB gzip. Permanece la advertencia de tamaño de Three.js. Las gotas usan un solo buffer de 150 puntos; no se añadieron dependencias ni recursos externos.
- Pendientes pruebas físicas, medición sostenida de rendimiento y revisión auditiva manual; las pruebas de audio verifican controles y ejecución, no calidad perceptual.

## Quinta entrega — 0.5.0

- TypeScript/Svelte sin errores ni advertencias; lint y compilación de producción correctos.
- 11 pruebas unitarias aprobadas: incluye restauración de escalas después de la sorpresa, acceso solo desde exploración y rechazo de una finalización cancelada.
- 30 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. La nueva sorpresa se comprueba con animación, movimiento reducido, teclado, repetición, retorno al jardín y reinicio durante la transición. Sin errores de consola o ejecución en este recorrido.
- Capturas `surprise-desktop.png` y `surprise-mobile.png` inspeccionadas visualmente. Se conserva el girasol en la zona de escena sin tapar los controles.
- JavaScript de producción: aproximadamente 261 kB gzip. Permanece la advertencia de tamaño del chunk de Three.js; no se añadieron dependencias ni servicios externos.
- Continúan pendientes teléfonos físicos, otros motores de navegador y mediciones de FPS/memoria sostenidos.

## Cuarta entrega — 0.4.0

- TypeScript/Svelte sin errores ni advertencias; lint y compilación de producción correctos.
- 9 pruebas unitarias aprobadas, incluyendo variedad de especies, reutilización de matrices de pétalos y transición opcional del corazón al mensaje.
- 26 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. Incluyen formación del texto, perfil móvil de menor calidad, movimiento reducido, cancelación durante la transición y secreto accesible por teclado con retorno del foco.
- Mensaje y flores revisados visualmente; capturas conservadas en `text-desktop.png`, `text-mobile.png` y `flowers-mobile.png`. Se corrigió la superposición del pie sobre el botón del mensaje en escritorio y se reforzó la legibilidad de la fecha.
- Sin errores de consola o ejecución en las pruebas del mensaje. Compilación: aproximadamente 260 kB gzip de JavaScript; permanece la advertencia de tamaño de Three.js.
- Pendientes las pruebas en teléfonos físicos y otros motores de navegador, y las mediciones de rendimiento sostenido y audio perceptual.

## Tercera entrega — 0.3.0

- TypeScript/Svelte sin errores ni advertencias; lint y compilación de producción correctos.
- 7 pruebas unitarias aprobadas, incluyendo límites, profundidad y reproducción de la nube del corazón, y la ruta final sin secretos obligatorios.
- 20 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. Incluyen pulsación con ratón y tacto, teclado, Escape, cancelación del puntero, alternativa de un paso, movimiento reducido, final después de la carta, exploración posterior y reinicio durante dispersión.
- El test del final captura errores de consola y de página: sin errores de shaders ni de ejecución en el recorrido verificado.
- Corazón revisado visualmente en las capturas `heart-desktop.png` y `heart-mobile.png`. La versión reducida omite ráfaga, viento y pulso.
- Compilación: aproximadamente 258 kB gzip de JavaScript; permanece la advertencia del chunk de Three.js. No se añadieron dependencias ni servicios externos.
- Continúan pendientes pruebas físicas de Android/iPhone, Safari/Firefox/Edge y medición de rendimiento sostenido. Las pruebas automatizadas no verifican la calidad perceptual del audio.

## Segunda entrega — 0.2.0

- Tipos y lint sin errores; compilación de producción correcta.
- 5 pruebas unitarias aprobadas: incluye límites de composición del ramo y retorno de la carta a la escena de origen.
- 12 pruebas de navegador aprobadas en Chromium de escritorio y móvil emulado. Cubre gesto parcial, arrastre completo, eventos táctiles, alternativa de teclado, movimiento reducido y reinicio durante la formación.
- Se detectó un salto por hover en un botón bajo movimiento reducido; se corrigió la interfaz y se verificó el mismo recorrido sin forzar clics en las pruebas.
- Ramo y tarjeta revisados mediante capturas. El girasol principal queda al frente y el follaje se reduce para despejar el lazo.
- Se mantiene la advertencia de tamaño de Three.js; JS total aproximado de 255 kB gzip. No se incorporaron dependencias ni recursos remotos.

## Primera entrega — 0.1.0

Comprobado en Windows el 19 de septiembre de 2026:

- TypeScript/Svelte: sin errores ni advertencias.
- Vitest: 3 pruebas de generación y máquina narrativa aprobadas.
- Playwright/Chromium: 6 pruebas aprobadas en escritorio y móvil emulado; recorrido, mensajes, nota, foco, reinicio, movimiento reducido y alternativa sin WebGL.
- Capturas de escritorio y móvil inspeccionadas; se ajustaron cámara, vegetación y títulos tras la revisión.
- Compilación estática generada. Three.js produce una advertencia de tamaño de chunk (aprox. 704 kB minificado, 181 kB gzip); el conjunto JS es aproximadamente 251 kB gzip. No hay recursos externos de ejecución.
- Auditoría npm tras actualizar Vitest: 0 vulnerabilidades reportadas.

Pendientes: hardware Android/iPhone real, Safari, Firefox y Edge. No se ha medido todavía un presupuesto de FPS sostenido ni consumo de batería en teléfonos. La versión móvil permite desplazamiento en pantallas cortas.

GitHub Pages está preparado mediante workflow, pero no se publicó: la sesión local de GitHub reporta un token inválido. No se creó un repositorio remoto.

## 0.9.0 — Jardín y ramo

- `npm run check`: 0 errores y 0 advertencias. Lint correcto; 17 pruebas unitarias correctas; compilación correcta.
- Verificación manual en navegador integrado: apertura desde recarga limpia, jardín, descubrimiento de mensaje, reunión del ramo, cinta con Enter en escritorio, arrastre de su control en móvil, lectura/cierre de carta y retorno del foco.
- Viewports: escritorio 1294 × 856 y móvil 390 × 844. Capturas `cinematic-garden-{desktop,mobile}.png` y `cinematic-bouquet-{desktop,mobile}.png`.
- Corregidos el recorte de la flor superior del ramo, el borde visible del fondo móvil y la superposición entre instrucciones de cinta y flor en escritorio.
- Sin errores de consola nuevos tras la recarga de validación. Las recargas durante desarrollo no se consideran evidencia final.
- No se ejecutó de nuevo la suite E2E completa. No se midió FPS en teléfono físico ni se repitió toda la secuencia final. El fondo lejano es raster; la fidelidad fotográfica del modelo floral sigue pendiente.

## 0.10.0 — Tarjeta, viento y finales

- Tipos: 0 errores/advertencias. Lint correcto. 18 pruebas unitarias correctas. Build correcto; persiste aviso de tamaño del chunk de Three.
- Navegador integrado: escritorio 1013 × 761 y viewport móvil 390 × 844. Ambos son capturas del navegador, no teléfono físico.
- Verificado: plantar, ramo, desatar, tarjeta, apertura/cierre de lectura con restitución del foco, entrada al viento desde tarjeta y desde jardín, continuación por teclado y atajo, corazón, mensaje, regreso a exploración, última flor y su encuadre en ambos tamaños.
- Corregida la prolongación de transiciones bajo pausas de render: tras el ajuste se completó la apertura en la ventana de observación de 14 segundos y el final en la de 7 segundos. Esto valida progreso funcional, no una medición de FPS ni duración exacta.
- Capturas nuevas: `cinematic-{card,letter,wind,heart,message,final-flower}-{desktop,mobile}.png`; comparación `cinematic-finale-comparison.png`.
- Sin errores nuevos en consola tras las recargas finales. No se volvió a ejecutar toda la suite E2E ni se verificó movimiento reducido en navegador esta pasada; el código conserva su rama de reducción de movimiento.
- Diferencias visuales pendientes: geometría floral estilizada, distribución más regular del corazón, iluminación menos volumétrica que el tablero y tarjeta cerrada en lugar de libro abierto.

## 0.11.0 — Detalle floral

- Tipos sin errores ni advertencias, lint correcto, 18 pruebas unitarias correctas y build correcto. Persiste el aviso de tamaño del chunk de Three.
- Recarga y recorrido manual: plantar, crecimiento, apertura y reunión del ramo. Ramo completo en escritorio 1013 × 761 y móvil emulado 390 × 844; consola sin errores nuevos.
- Capturas `botanical-bouquet-desktop.png`, `botanical-bouquet-mobile.png` y comparación `botanical-comparison.png`.
- No se repitió la suite E2E ni el recorrido completo de finales. No se midió rendimiento en teléfono físico. Las flores siguen siendo estilizadas.
