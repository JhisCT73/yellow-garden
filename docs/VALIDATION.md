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

## 0.12.0 — Follaje del ramo

- Tipos sin errores ni advertencias, lint correcto, 18 pruebas correctas y build correcto. Persiste el aviso de tamaño del chunk de Three.
- Recorrido manual desde recarga: plantar, jardín, reunión, desatar mediante el atajo, tarjeta, viento y celebración. Sin errores nuevos de consola.
- Ramo completo y controles despejados en 1013 × 761 y 390 × 844. Tarjeta libre de follaje delantero y desaparición del conjunto comprobadas en móvil emulado.
- Evidencia: `foliage-bouquet-desktop.png`, `foliage-bouquet-mobile.png`, `foliage-comparison.png`.
- No se repitió la suite E2E completa ni se midió rendimiento físico o movimiento reducido en navegador.

## 0.12.1 — Materiales dorados

- Tipos sin errores/advertencias, lint, 18 pruebas y build correctos; permanece el aviso de tamaño de Three.
- Recarga y recorrido manual de plantar a jardín y ramo. Capturas de escritorio 1013 × 761 y móvil emulado 390 × 844; sin errores nuevos en consola.
- Evidencia: `golden-bouquet-desktop.png`, `golden-bouquet-mobile.png`, `golden-comparison.png`.
- No se repitieron los finales ni la suite E2E completa. El material físico añade coste de sombreado; no se ha medido rendimiento en dispositivo físico.

## 0.13.0 — Composición del ramo

- Tipos sin errores ni advertencias, lint correcto, 18 pruebas correctas y build correcto; permanece el aviso de tamaño de Three.
- Recarga y recorrido manual: plantar, jardín, reunión del ramo, desatar por atajo y tarjeta. Sin errores nuevos de consola.
- Ramo completo en escritorio 1013 × 761 y móvil emulado 390 × 844. Tarjeta visible y controles despejados en móvil.
- Capturas: `arrangement-desktop.png`, `arrangement-mobile.png`, `arrangement-comparison.png`. No se repitieron finales, suite E2E completa ni mediciones en teléfono físico.

## 0.14.0 — Corazón

- Tipos sin errores ni advertencias, lint, 19 pruebas y build correctos. Persiste el aviso de tamaño del chunk Three.
- Nueva prueba de regresión: proporción de partículas del eje central y equilibrio izquierda/derecha sobre 6000 muestras reproducibles; siguen pasando límites y profundidad.
- Navegador: jardín, viento por atajo, corazón y transformación en mensaje. Corazón revisado en 1013 × 761 y móvil emulado 390 × 844; mensaje legible en móvil. Sin errores nuevos de consola.
- Capturas `heart-cloud-desktop.png`, `heart-cloud-mobile.png` y `heart-cloud-comparison.png`. No se ejecutó la suite E2E completa ni se midió rendimiento físico.

## 0.14.1 — Halo

- Tipos sin errores/advertencias, lint correcto, 19 pruebas y build correctos. Persiste aviso de tamaño del chunk Three.
- Navegador: recorrido desde semilla a jardín, viento por atajo, corazón y mensaje. Corazón revisado en escritorio 1013 × 761 y móvil emulado 390 × 844; mensaje móvil legible y sin errores nuevos de consola.
- Capturas `heart-halo-desktop.png`, `heart-halo-mobile.png`, `heart-halo-comparison.png`. No se repitió toda la suite E2E ni se midió rendimiento físico.

## 0.14.2 — Contorno

- Tipos sin errores/advertencias, lint, 19 pruebas y build correctos. Persiste aviso de tamaño de Three.
- Se mantienen pruebas de reproducibilidad, límites, profundidad, equilibrio bilateral y ausencia de concentración central.
- Recorrido manual semilla, jardín, viento por atajo, corazón y mensaje. Corazón completo en escritorio 1013 × 761 y móvil emulado 390 × 844; mensaje móvil legible. Sin errores nuevos de consola.
- Evidencia: `heart-contour-desktop.png`, `heart-contour-mobile.png`, `heart-contour-comparison.png`. Suite E2E completa y rendimiento en dispositivo físico no repetidos.

## 0.14.3 — Destellos exteriores

- Tipos sin errores/advertencias, lint, 19 pruebas y build correctos. Persiste aviso de tamaño de Three.
- Recorrido manual semilla, jardín, viento por atajo, corazón y mensaje. Escritorio 1013 × 761 y móvil emulado 390 × 844; silueta completa y mensaje legible. Sin errores nuevos de consola.
- Evidencia `heart-drift-desktop.png`, `heart-drift-mobile.png`, `heart-drift-comparison.png`. Movimiento reducido conservado por código, no repetido en navegador; suite E2E completa y rendimiento físico pendientes de nueva ejecución.

## 0.15.0 — Luz de apertura

- Tipos sin errores/advertencias, lint, 19 pruebas y build correctos; persiste aviso del chunk Three.
- Recarga y recorrido de apertura: semilla y crecimiento en escritorio 1013 × 761 y móvil emulado 390 × 844. Retirada de haces al llegar al jardín comprobada en escritorio. Sin errores nuevos de consola.
- Capturas `light-{seed,growth}-{desktop,mobile}.png` y `opening-light-comparison.png`. El crecimiento se capturó en instantes distintos en cada tamaño.
- No se repitieron finales, suite E2E completa ni movimiento reducido en navegador. No se midió rendimiento físico.

## 0.15.1 — Semilla

- Tipos sin errores/advertencias, lint, 19 pruebas y build correctos; persiste aviso del chunk Three.
- Forma final revisada en escritorio 1013 × 761 y móvil emulado 390 × 844. Plantar por botón y transición hasta jardín comprobados en móvil. Sin errores nuevos de consola.
- Capturas `seed-shell-desktop.png`, `seed-shell-mobile.png`, `seed-shell-comparison.png`. No se repitió suite E2E completa, selección directa 3D ni rendimiento físico.

## Entrega integrada (0.16.0)

- 36/36 pruebas E2E aprobadas en Chromium: 18 escritorio y 18 móvil emulado, un worker, 10,1 minutos. Incluyen recorrido, cinta, libro, secretos, banco, cancelaciones, teclado, movimiento reducido, calidad y alternativa sin WebGL.
- 20/20 pruebas unitarias; tipos sin errores ni advertencias; lint correcto; build de producción correcto. Three conserva un chunk de 704,05 kB (181,38 kB gzip), advertido por Vite.
- Revisión visual del libro, terminal y banco en 1013 × 761 y 390 × 844. En 320 × 568 el cierre permite desplazamiento vertical hasta ambos botones. Comparación conjunta abierta: complete-scenes-comparison.png.
- Rendimiento reproducible: scripts/measure-performance.mjs, resultados en performance-local.json. Cuatro muestras de seis segundos en GARDEN: escritorio Ligera 10,0 FPS / Alta 9,5; móvil emulado Ligera 15,8 / Alta 10,5. Renderer SwiftShader por software, no GPU física. No demuestra 60 FPS ni certifica teléfonos; la calidad ligera reduce la carga pero esta máquina sigue limitada.
- Los 50 tallos de relleno se fusionan en una malla, ahorrando 49 llamadas de dibujo por pase cuando son visibles. No se atribuye una mejora de FPS sin comparación antes/después.
- Pendiente externo: Safari/iPhone y Android físicos, audio, temperatura y fluidez sostenida. Publicación excluida por indicación del usuario.
- Se corrigieron metadatos de dos dependencias en package-lock.json para coincidir con sus paquetes instalados y URLs resueltas: rapier3d-compat 0.12.0 y @humanfs/types 0.15.0. No cambia su código ni integridad.
- Tras conectar el sello del libro a gardenConfig.date, se repitieron las dos pruebas completas de ramo/cinta/libro (escritorio y móvil): 2/2 aprobadas. Paquete dist comprimido en test-results/yellow-garden-0.16.0.zip; esa carpeta es temporal y una futura prueba puede limpiarla.

## 0.17.0 — Historia automática y recorrido guiado

- Tipos: 0 errores y 0 advertencias; lint correcto; 23/23 pruebas unitarias; build correcto. Se mantiene la advertencia de tamaño del chunk Three.
- 14 escenarios E2E seleccionados entre escritorio y móvil emulado: ramo, cinta, banco, reinicio y tres nuevos escenarios de recorrido por dispositivo. La primera ejecución aprobó 11 y encontró 3 fallos móviles; tras separar la cinta de los controles y habilitar los eventos de puntero del selector de modo, las 3 repeticiones aprobaron. No se declara una repetición completa de toda la suite anterior.
- Verificado: avance automático hasta banco; espera de lectura superior a cinco segundos sin avanzar; regreso a carta; pausa durante crecimiento; pausa de espera automática; cambio a modo guiado que cancela avance pendiente; reinicio y cancelación de animaciones anteriores.
- Revisión visual real de bienvenida, mapa, controles, carta y cierre en escritorio y 390 × 844. Capturas journey-*.png. Publicación no realizada; dispositivos físicos y rendimiento real conservan las limitaciones anteriores.

## Controles laterales y tipografía

Build correcto; rutas de fuentes relativas comprobadas en dist. Dos pruebas de ramo, arrastre de cinta y carta aprobadas (escritorio y móvil emulado). Revisión visual en 1294 × 856 y 390 × 844. No se modificó la lógica de recorrido. Fuentes locales con licencias OFL; no requieren conexión durante la visita.

## Entorno 3D del cierre

- Tipos sin errores/advertencias, lint y build correctos; advertencia de tamaño de Three conservada.
- 4/4 pruebas del banco aprobadas: entrada/salida/reinicio y comparación de capturas del canvas durante pausa y tras reanudar, tanto en escritorio como móvil emulado. Consola sin errores de shaders durante esas pruebas.
- Ajuste posterior de encuadre de la luna para móvil verificado visualmente. Movimiento reducido usa el reloj inmóvil existente. Sin medición nueva en hardware físico: los nuevos objetos pueden aumentar el coste de renderizado.

## 0.18.0 — Jardín continuo en 3D y marca

El paisaje fotográfico del mundo se reemplazó por terreno con relieve, piedras, flores instanciadas y el cielo del cierre. Verificado el encuadre de jardín en 1294 × 856 y 390 × 844. Se retiró el desenfoque de crecimiento y floración.

La ejecución seleccionada de 12 pruebas (bench, garden y quality; escritorio y móvil Chromium) terminó con `.last-run.json` en estado passed. Las primeras ejecuciones con 60 s agotaron el tiempo en el recorrido del banco; se repitió con 120 s por prueba. Los dos escenarios de banco en escritorio tardaron aproximadamente 72 y 78 s. No se certifica fluidez ni rendimiento en GPU física. Se mantiene la limitación de dispositivos físicos documentada arriba.

Verificación final con marca: svelte-check sin errores ni advertencias, lint correcto, 23/23 pruebas unitarias y build correcto. Se mantiene la advertencia de tamaño de Three (704,09 kB). Revisión visual de marca transparente en escritorio y móvil, apertura/cierre del mapa y del secreto comprobados en navegador. No se repitió toda la suite E2E tras el cambio de marca.

## 0.19.0 — Windows

- svelte-check: 0 errores/advertencias; lint correcto; 23/23 pruebas unitarias; build Vite correcto (advertencia habitual de tamaño de Three).
- `npm run desktop:dist` completado usando Electron 44.4.3 y electron-builder 26.15.3. Instalador NSIS x64 de aproximadamente 115 MB. Authenticode: NotSigned.
- `npm run test:desktop` aprobado con Electron de desarrollo y con `release/win-unpacked/Yellow Garden.exe`. La última comprobación del empaquetado desactiva la red antes de recargar: logo cargado, jardín WebGL, mapa y Acerca del proyecto, sin errores JS/consola. Verifica nodeIntegration=false, contextIsolation=true, sandbox=true y webSecurity=true.
- No se instaló el producto en el perfil del usuario: instalación, desinstalación y accesos directos requieren revisión en equipo limpio. No hay publicación ni ejecución de workflows remotos. No se repitió la suite E2E completa del navegador para este cambio de distribución.
