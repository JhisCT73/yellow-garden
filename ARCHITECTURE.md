# Arquitectura

- `App.svelte` mantiene la interfaz semántica, accesibilidad, preferencias y actor XState.
- `machines/garden.machine.ts` permite INTRO → GROWING → BLOOMING → GARDEN ↔ FINALE. RESTART vuelve a INTRO. Las animaciones envían eventos de finalización; no se usan temporizadores narrativos duplicados.
- `world/GardenScene.svelte` se ejecuta dentro de Canvas de Threlte: configura escena, iluminación, cámara, picking, atmósfera y ciclo de render. Desmontar libera geometrías/materiales y cancela animaciones y eventos.
- `world/botany.ts` construye girasoles con tallos curvos, hojas, pétalos curvados y discos con filotaxis. Pétalos, semillas y hierba usan instancias. El crecimiento inicial escala la planta; una revelación continua del tallo queda como mejora futura.
- `utils/random.ts` produce una composición determinista limitada a 24 flores para evitar sobrecarga por configuración.
- `systems/PerformanceManager.ts` elige DPR y cantidades según capacidad básica; no es aún un controlador adaptativo por FPS.
- `systems/AudioEngine.ts` sintetiza ambiente y notas sin archivos externos; se activa por gesto explícito y se silencia al ocultar la pestaña.
- `content/` y `config/` separan el texto y los parámetros de la escena.

## Decisiones

Primera entrega enfocada en el ciclo completo de semilla y jardín. El regalo tiene una nota final accesible sin depender de encontrar un secreto. Se evitan física, postprocesado y modelos descargados para reducir coste móvil. Toda la geometría se genera localmente. Los textos permanecen en HTML, no en texturas, para facilitar lectura, teclado y ampliación.

## Verificación

Vitest comprueba determinismo, límites y transiciones. Playwright prueba el recorrido completo, nota/modal, foco, reinicio, movimiento reducido y fallback sin WebGL. Las capturas se guardan en `test-results/`. La emulación móvil no sustituye pruebas en hardware real.

## Siguiente incremento

Validar en teléfonos reales y ajustar encuadre/calidad; después diseñar BouquetSystem, sin introducir secretos obligatorios en el recorrido principal.
