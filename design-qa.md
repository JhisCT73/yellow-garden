# Revisión de la primera pasada cinematográfica

## Alcance

Semilla, crecimiento y primera flor, según la propuesta aceptada por el usuario. Se busca una aproximación animada en 3D, no una copia pixel a pixel del tablero ni la adaptación de sus quince escenas en esta entrega.

## Evidencia

- Fuente: `C:/Users/Zyxer/AppData/Local/Temp/codex-clipboard-fc8abb67-42f7-43e1-967c-0633406cefa6.png`, tablero de 1536 × 1024; viñetas 02/03/04.
- Navegador: Codex in-app browser, `http://127.0.0.1:5173/`.
- Escritorio: 1294 × 856 CSS/píxeles de captura. Móvil: 390 × 844 CSS/píxeles de captura mediante viewport, no teléfono físico.
- Capturas finales: `docs/cinematic-{seed,growth,bloom}-{desktop,mobile}.png`.
- Comparación conjunta: `docs/cinematic-comparison.png`. Conserva las capturas completas a 640 px de ancho; amplía las viñetas de referencia. Las proporciones de la viñeta y del viewport son distintas; no se infiere una coincidencia pixel a pixel.
- Estados capturados: INTRO, GROWING a aproximadamente 2.4 segundos y BLOOMING a aproximadamente 7 segundos desde plantar. La referencia es estática y no especifica tiempos.

## Iteraciones y correcciones

1. La composición anterior reservaba gran parte de la pantalla al texto. Se sustituyó solo en la apertura por escenario completo, título breve y controles en la zona inferior.
2. Hierba delante de la semilla y piedras demasiado grandes: se despejó la línea central y se redujeron las piedras.
3. Protagonista afectado por el desenfoque: el foco ahora se calcula sobre la posición tridimensional de la semilla/cabeza en espacio de cámara. Se redujo la apertura del efecto.
4. Fondo cortado en la floración móvil: se amplió el plano de entorno; las capturas móviles finales muestran continuidad hasta el borde superior.
5. Encuadre de flor demasiado lejano/frontal: se acercó y desplazó lateralmente la cámara y se inclinó la cabeza durante la floración.

## Superficies revisadas

- Tipografía: Georgia para frases, sans del sistema para controles. Mantiene el contraste serif/sans de la referencia sin afirmar que sean sus fuentes exactas. No se observaron cortes de texto en los tamaños capturados.
- Composición: protagonista central, interfaz inferior y vegetación de fondo. El encabezado y la elección de cuidado se conservan como diferencias funcionales intencionales respecto a las viñetas.
- Color: azul nocturno, tierra cálida, amarillo y dorado; luz localizada en la semilla. Menor realismo y variedad de materiales que la referencia, propios de esta primera pasada procedural.
- Assets: textura local de tierra y entorno generado. El fondo lejano es raster sobre un plano; los protagonistas, suelo, piedras y vegetación cercana siguen siendo 3D.
- Contenido: frases adaptadas a la interacción, conservando nombres accesibles de plantar, sonido y ajustes.

## Interacciones y límites

Se verificó en el navegador integrado plantar, crecimiento, floración, llegada al jardín, lectura/cierre de la carta y reinicio. No aparecieron errores nuevos después de la recarga final; el registro conservaba errores antiguos de hot reload, anteriores a esta revisión. Tipos y lint correctos; 16 pruebas unitarias y build correctos. No se volvió a ejecutar la batería Playwright completa en esta pasada.

Sin P0/P1/P2 de interacción, legibilidad o recorte en el alcance revisado. La semejanza es de dirección artística y composición; no se certifica equivalencia fotográfica ni fidelidad del resto de escenas.

## Refinamiento posterior

- Más irregularidad, nervaduras y translucidez en pétalos y hojas; el modelo todavía se ve estilizado.
- Refinar tierra, brillo de la semilla y luz volumétrica.
- Extender la dirección artística al paisaje nocturno, ramo, tarjeta y finales.
- Medir coste del desenfoque en hardware real y revisar orientación horizontal.

final result: passed
