# Arquitectura

- `App.svelte` mantiene la interfaz semántica, accesibilidad, preferencias y actor XState.
- `machines/garden.machine.ts` permite INTRO → GROWING → BLOOMING → GARDEN → GATHERING → BOUQUET → UNWRAPPING → CARD_READY ↔ FINALE. También admite GARDEN ↔ FINALE para leer la dedicatoria directamente. El contexto conserva el origen de la nota para volver a la escena correcta. RESTART vuelve a INTRO. Las animaciones envían eventos de finalización; no se usan temporizadores narrativos duplicados.
- `world/GardenScene.svelte` se ejecuta dentro de Canvas de Threlte: configura escena, iluminación, cámara, picking, atmósfera y ciclo de render. Desmontar libera geometrías/materiales y cancela animaciones y eventos.
- `world/botany.ts` construye girasoles con tallos curvos, hojas, pétalos curvados y discos con filotaxis. Pétalos, semillas y hierba usan instancias. El crecimiento inicial escala la planta; una revelación continua del tallo queda como mejora futura.
- `objects/flowerSpecies.ts` conserva el primer girasol y distribuye tres perfiles botánicos. Los pétalos usan formas, cantidades y materiales diferentes. Después de abrirse, sus matrices no se vuelven a subir a GPU hasta que cambie la apertura; el tallo conserva el movimiento ambiental.
- `utils/random.ts` produce una composición determinista limitada a 24 flores para evitar sobrecarga por configuración.
- `systems/PerformanceManager.ts` define tres perfiles: DPR máximo 1/1.5/1.75, partículas ambientales 120/240/360 y hierba 250/450/700. Automática parte del número de núcleos y, después de 3 segundos de calentamiento, reduce un nivel tras dos ventanas consecutivas de 2 segundos con tiempo medio de frame superior a 40 ms. Descarta pausas superiores a 250 ms y tiempo en segundo plano. No aumenta automáticamente la calidad para evitar oscilaciones. Ligera/Alta omiten el monitor.
- `systems/AudioEngine.ts` sintetiza ambiente y notas sin archivos externos; se activa por gesto explícito y se silencia al ocultar la pestaña.
- `systems/BouquetLayout.ts` define posiciones reproducibles con un girasol principal y tallos reunidos. `BouquetSystem.ts` interpola posición, orientación y escala; compensa el tamaño de las cabezas y reduce el follaje para despejar el lazo.
- `objects/BotanicalGift.ts` crea la cinta con bandas curvas, la tarjeta y su portada CanvasTexture local. La textura se libera al desmontar.
- `interactions/RibbonInteraction.svelte` captura el puntero, aplica un umbral de arrastre y ofrece activación semántica por teclado. La cinta 3D también admite picking y arrastre. La captura/cancelación y el reinicio evitan conservar un gesto interrumpido.
- `interactions/WindInteraction.svelte` controla una pulsación por puntero o teclado. Cancelar, perder el foco o esconder la pestaña no envía el evento de soltar. La alternativa de un solo paso no exige duración ni precisión motora.
- `systems/WindSystem.ts` amortigua la fuerza, inclina plantas y hojas, y deforma la hierba por shader. El sonido de viento se sintetiza localmente y pasa por el mismo control de silencio.
- `particles/heart.ts` genera un volumen de corazón determinista. `HeartFormation.ts` interpola en GPU entre origen, dispersión, corazón y texto, con 1800 puntos en todos los perfiles para conservar legibilidad en las letras. Los buffers se crean una vez y se liberan con la escena.
- `particles/TextFormation.ts` rasteriza las letras con una fuente del sistema en un canvas local, recoge muestras por línea y distribuye una cuota explícita a la fecha. No descarga fuentes. La posición Z conserva una profundidad ligera.
- `interactions/GardenSecret.svelte` contiene un diálogo opcional con comandos ficticios, activación táctil y teclado, cierre por Escape y restauración de foco. No evalúa código ni envía eventos narrativos.
- `content/` y `config/` separan el texto y los parámetros de la escena.

## Decisiones

La experiencia crece por etapas: semilla y jardín, seguidos del ramo y su carta. El regalo tiene una nota final accesible sin depender de encontrar un secreto. Se evitan física y modelos descargados para reducir coste móvil. Toda la geometría se genera localmente. La apertura incorpora texturas de suelo y entorno, y desenfoque en perfiles medio/alto. La portada decorativa usa una CanvasTexture; el contenido íntegro permanece en HTML para facilitar lectura, teclado y ampliación.

## Verificación

El cierre añade WIND → BURST → HEART → CELEBRATION → FREE_EXPLORE. Se puede llegar desde GARDEN o CARD_READY; los secretos siguen siendo opcionales. FINALE conserva su significado previo de lectura de la nota. Las transiciones GSAP se cancelan al reiniciar y los eventos tardíos no son válidos fuera de su estado. Al explorar se restauran materiales, disposición y visibilidad de las flores. El modo de movimiento reducido omite dispersión, viento y pulso; muestra un corazón estático y la misma felicitación accesible.

CELEBRATION también permite TEXT_FORMING → TEXT_READY → FREE_EXPLORE. El mensaje es opcional y se muestra sin transición con movimiento reducido. Las visitas por teclado a flores priorizan índices aún no descubiertos, incluso después de explorar con el puntero.

Vitest comprueba determinismo, límites, disposición del ramo y transiciones. Playwright prueba el recorrido completo, nota/modal, foco, reinicio, movimiento reducido, fallback sin WebGL, arrastre parcial/completo, entrada táctil y cancelación de una formación en curso. Las capturas se guardan en `test-results/`. La emulación móvil no sustituye pruebas en hardware real.

La sorpresa opcional añade FREE_EXPLORE → SECRET_BLOOM → SECRET_READY → FREE_EXPLORE. `SecretBloomSystem.ts` reutiliza la flor protagonista y aplica las escalas después de las actualizaciones de botánica, ramo y viento. Estas restauran sus valores base en cada frame, evitando acumulación al repetir. Un buffer de 120 puntos reproduce el destello en GPU; no se muestra con movimiento reducido y se libera con el resto de la escena. GSAP cancela la transición al salir del estado.

`interactions/CareChoice.svelte` ofrece radios nativos para la elección local de cuidado. No modifica el recorrido XState. `systems/GardenCare.ts` mantiene un buffer de 150 gotas, oculta el agua durante el final de partículas y aplica una variante a la luz existente, sin luces adicionales. Su tiempo queda fijo con movimiento reducido. `AudioEngine.setCare` selecciona armonías para los chimes sin crear ni activar un AudioContext; todas las notas pasan por el mismo volumen maestro.

Los cambios de calidad modifican el drawing buffer, `InstancedMesh.count`, rangos de dibujo y uniforms de tamaño de puntos. Los buffers se reservan para el perfil alto y se reutilizan: baja el trabajo de dibujo, no la memoria de geometría reservada. `GraphicsSettings.svelte` permite elegir el modo mediante un diálogo nativo sin desmontar Canvas. Elegir Automática reinicia la evaluación desde el perfil del dispositivo. La escena sigue animándose detrás del diálogo.

## Apertura cinematográfica

La apertura usa `cinematics/OpeningCamera.ts` para definir planos de semilla, crecimiento y floración. `world/Seedbed.ts` añade piedras instanciadas y polvo luminoso; un brote verde reemplaza temporalmente la cabeza de la flor durante el crecimiento. `cinematic.css` cambia únicamente la composición de estas escenas. El entorno lejano usa una textura generada sobre un plano; no es geometría de bosque navegable.

En la apertura, EffectComposer combina RenderPass, BokehPass y OutputPass a DPR 1 en perfiles medio/alto. El foco se calcula en espacio de cámara sobre la semilla o cabeza real. Threlte delega el render a una tarea propia de renderStage; el perfil ligero y el resto de escenas usan render directo. Al desmontar se liberan texturas, pases y render targets. Este cambio aumenta el coste de GPU en la apertura y requiere perfilado en hardware real.

Validar en teléfonos reales, perfilar GPU/memoria y revisar accesibilidad con ampliación de texto. Los secretos adicionales, reflejos y capas musicales continuas quedan para ampliaciones posteriores.

## Jardín y ramo (0.9)

`gardenFrame` interpola el plano amplio y el ramo usando el progreso de reunión. `BouquetSystem` combina la posición inicial, los laterales del sendero y el destino del ramo; no asigna vectores nuevos dentro del bucle de animación. `gardenReveal` anima la aparición del paisaje y reduce la opacidad del suelo de macro. El tamaño del plano lejano varía con el viewport y la reunión para cubrir el encuadre. El desenfoque también se aplica al ramo, desatado y tarjeta en perfiles medio/alto, con menor apertura que en el macro.

## Tarjeta y cierre (0.10)

`BotanicalGift` pinta una ilustración local en su CanvasTexture al cargar y conserva una portada tipográfica de respaldo. `dispose()` desconecta la devolución de carga y libera la textura. El mismo JPG se usa como fondo de la lectura HTML. La tarjeta vuelve al ramo al entrar en WIND.

`finaleFrame` centra corazón y mensaje, separa más la cámara móvil para el texto y alinea cámara/foco con la flor final para evitar ver el borde del fondo. `WindTrails` anima 280 puntos en shader (100 en Ligera); se libera con el resto de geometrías de la escena y respeta movimiento reducido.

El único consumidor de GSAP de la aplicación desactiva lag smoothing durante el montaje y restablece 500/33 al desmontar. Se evita así extender indefinidamente la duración de una fase cuando hay pausas de render. Al volver de una pestaña detenida, la fase en curso puede terminar en el siguiente frame; no se garantiza reproducir cada frame que no se dibujó. La interpolación de cámara también usa tiempo transcurrido; el movimiento ambiental mantiene su delta limitado.

## Superficies botánicas (0.11)

`BotanicalGeometry` genera superficies curvas con colores por vértice: pétalos de 16 × 8 segmentos y hojas de 24 × 12. Se comparten entre las flores; no se regeneran por frame. Los centros usan 320 semillas instanciadas con escala y color deterministas. Las matrices de pétalos solo cambian durante la apertura. La liberación continúa mediante el recorrido de recursos compartidos de la escena.

## Follaje de acompañamiento (0.12)

`BouquetFoliage` añade diez ramitas con geometrías compartidas para 200 pétalos, 40 centros y 50 hojas instanciados. Las matrices se calculan al crear la escena. Solo el grupo se escala y balancea durante la animación; el movimiento reducido detiene el balanceo. Es hijo de `flowers.root` antes de recopilar materiales, por lo que participa en el desvanecimiento y la liberación de recursos existentes.

## Materiales florales (0.12.1)

Los pétalos usan MeshPhysicalMaterial con rugosidad 0.78, sheen 0.25 y emisión reducida. El gradiente de girasol sigue horneado por vértice; las margaritas desactivan vertexColors para preservar el crema. No se cambia la exposición global, conservando la iluminación de tarjeta y fondo. No se añaden geometrías ni texturas en esta pasada.

## Composición del ramo (0.13)

`BouquetLayout` fija cuatro posiciones focales de girasol y conserva la distribución determinista de acompañamiento. `BouquetSystem` interpola hacia tamaños finales de cabeza independientes del tamaño original de jardín y compensa la escala del tallo. El tamaño de los dos protagonistas converge a 0.68, el de los girasoles secundarios a 0.46; las inclinaciones varían sin añadir geometrías ni trabajo de asignación por frame.

## Distribución del corazón (0.14)

`heartCloud` construye una silueta poligonal de 128 puntos y usa muestreo uniforme por rechazo en su interior. Este trabajo se realiza al crear la escena, no por frame. La profundidad conserva valores aleatorios reproducibles. El shader varía el tamaño del destello a partir de su destino y converge al tamaño del texto durante lettering. Se conserva la cantidad de 1800 partículas.

## Halo de partículas (0.14.1)

El shader aumenta el área del sprite hasta 2.6 veces durante la formación del corazón, compensando el radio del núcleo para conservar su tamaño. Una caída exponencial con borde suavizado añade el halo. La intensidad depende de formation y de 1 - lettering. Se conservan 1800 partículas y una sola llamada de dibujo; aumenta el área de fragmentos sombreados y su coste no se ha medido en móvil físico.

## Densidad del contorno (0.14.2)

El muestreo por área pondera la aceptación según la distancia mínima a los segmentos del contorno. Una caída exponencial produce una franja suave; una densidad base conserva partículas interiores. El cálculo ocurre al crear la nube, sin añadir operaciones por frame ni usar el muestreo radial que causaba la franja central.

## Destellos exteriores (0.14.3)

Un hash espacial selecciona aproximadamente el 14 % de las partículas para expandirse desde su posición de corazón, con oscilaciones lentas y menor brillo. Se aplica antes de mezclar hacia el mensaje, por lo que lettering elimina el desplazamiento. Las oscilaciones usan el uniforme motion; no se añaden partículas, geometrías ni llamadas de dibujo.

## Luz de apertura (0.15)

`OpeningLight` crea tres planos que comparten geometría y material aditivo. El shader suaviza bordes y extremos, y modula la intensidad con el crecimiento. Es una aproximación atmosférica mediante planos, no iluminación volumétrica física ni rayos con oclusión. Su grupo se añade al recorrido de liberación existente y solo se muestra en INTRO, GROWING y BLOOMING; no requiere texturas ni otro pase de postprocesado.

## Semilla (0.15.1)

`SeedGeometry` deforma una esfera de 48 × 32 segmentos con estrechamiento longitudinal, depresión suave y variación fina de superficie. Calcula colores y normales una vez al crear la escena. El Mesh conserva las transformaciones, interacción y retirada al crecer existentes; su geometría y material se liberan con la escena.

## Integración y cierre (0.16)

`BENCH` es un estado explícito alcanzable con REST desde FREE_EXPLORE o SECRET_READY. EXPLORE vuelve al jardín y RESTART cancela el recorrido como en los demás estados. `GardenBench` usa geometría de listones y estructura metálica con luz cálida; permanece oculto en las otras escenas. La cámara de cierre tiene un encuadre específico y el follaje protagonista se oculta para despejar el banco. El botón de entrada limpia mensajes transitorios y coloca el foco en el regreso.

`BotanicalGift` conserva el grupo interactivo `card`, pero contiene una página derecha y una izquierda con bisagra. La bisagra se despliega según el revelado de la cinta. Cada página usa una CanvasTexture; ambas se liberan explícitamente. La lectura HTML y la intersección de rayos siguen funcionando con el mismo grupo.

`SoilGeometry` usa una retícula de 64 × 64 segmentos con ondulaciones atenuadas cerca de la semilla y el borde; conserva UV, transparencia radial y textura existentes. Las piedras siguen siendo instancias. Los segmentos de ramas de `BouquetFoliage` se fusionan con mergeGeometries al crear la escena; se liberan las geometrías temporales y la resultante participa en la limpieza de recursos.

Las pruebas E2E se ejecutan en un worker para evitar competencia entre contextos WebGL. El tiempo máximo por recorrido es 60 segundos; se conservan las verificaciones de estados, arrastre, teclado y cancelación. `scripts/measure-performance.mjs` mide tiempos RAF locales, registra el renderer y el buffer en cada calidad y viewport; no representa rendimiento de teléfonos físicos.

## Recorrido (0.17)

`content/journey.ts` define las 12 etapas y agrupa estados transitorios bajo la misma etapa visible. El evento tipado `NAVIGATE` permite revisitar inicios de capítulo. App mantiene el máximo visitado, modo, pausa y revisión de navegación; el timer automático se destruye al cambiar de estado, modo, pausa o visibilidad.

GardenScene restaura las variables de crecimiento, ramo, carta y partículas al cambiar la revisión de navegación, antes de iniciar las animaciones del destino. Mata sus propios tweens y conserva el canvas. La pausa actúa solo sobre tweens de los objetos de esta escena y sobre el bucle de actualización, sin pausar globalmente GSAP. El mapa usa un dialog modal nativo y devuelve el foco al disparador.
