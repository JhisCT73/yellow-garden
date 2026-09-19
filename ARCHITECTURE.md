# Arquitectura

- `App.svelte` mantiene la interfaz semántica, accesibilidad, preferencias y actor XState.
- `machines/garden.machine.ts` permite INTRO → GROWING → BLOOMING → GARDEN → GATHERING → BOUQUET → UNWRAPPING → CARD_READY ↔ FINALE. También admite GARDEN ↔ FINALE para leer la dedicatoria directamente. El contexto conserva el origen de la nota para volver a la escena correcta. RESTART vuelve a INTRO. Las animaciones envían eventos de finalización; no se usan temporizadores narrativos duplicados.
- `world/GardenScene.svelte` se ejecuta dentro de Canvas de Threlte: configura escena, iluminación, cámara, picking, atmósfera y ciclo de render. Desmontar libera geometrías/materiales y cancela animaciones y eventos.
- `world/botany.ts` construye girasoles con tallos curvos, hojas, pétalos curvados y discos con filotaxis. Pétalos, semillas y hierba usan instancias. El crecimiento inicial escala la planta; una revelación continua del tallo queda como mejora futura.
- `utils/random.ts` produce una composición determinista limitada a 24 flores para evitar sobrecarga por configuración.
- `systems/PerformanceManager.ts` elige DPR y cantidades según capacidad básica; no es aún un controlador adaptativo por FPS.
- `systems/AudioEngine.ts` sintetiza ambiente y notas sin archivos externos; se activa por gesto explícito y se silencia al ocultar la pestaña.
- `systems/BouquetLayout.ts` define posiciones reproducibles con un girasol principal y tallos reunidos. `BouquetSystem.ts` interpola posición, orientación y escala; compensa el tamaño de las cabezas y reduce el follaje para despejar el lazo.
- `objects/BotanicalGift.ts` crea la cinta con bandas curvas, la tarjeta y su portada CanvasTexture local. La textura se libera al desmontar.
- `interactions/RibbonInteraction.svelte` captura el puntero, aplica un umbral de arrastre y ofrece activación semántica por teclado. La cinta 3D también admite picking y arrastre. La captura/cancelación y el reinicio evitan conservar un gesto interrumpido.
- `content/` y `config/` separan el texto y los parámetros de la escena.

## Decisiones

La experiencia crece por etapas: semilla y jardín, seguidos del ramo y su carta. El regalo tiene una nota final accesible sin depender de encontrar un secreto. Se evitan física, postprocesado y modelos descargados para reducir coste móvil. Toda la geometría se genera localmente. Solo la portada decorativa usa una textura; el contenido íntegro permanece en HTML para facilitar lectura, teclado y ampliación.

## Verificación

Vitest comprueba determinismo, límites, disposición del ramo y transiciones. Playwright prueba el recorrido completo, nota/modal, foco, reinicio, movimiento reducido, fallback sin WebGL, arrastre parcial/completo, entrada táctil y cancelación de una formación en curso. Las capturas se guardan en `test-results/`. La emulación móvil no sustituye pruebas en hardware real.

## Siguiente incremento

Validar en teléfonos reales y desarrollar el viento por pulsación seguido del final de partículas, manteniendo una alternativa de teclado y movimiento reducido.
