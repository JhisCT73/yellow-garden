# Changelog

## 0.8.0

Primera pasada cinematográfica de semilla, crecimiento y floración, guiada por el tablero visual del usuario. Encuadres de cámara independientes, apertura a pantalla completa con texto discreto, tierra con textura local y relieve, vegetación de fondo, brote verde previo a la flor y polen. Profundidad de campo con foco en el protagonista en perfiles medio/alto; el perfil ligero usa render directo. El resto de escenas conserva su composición anterior.

## 0.7.0

Calidad automática con reducción gradual ante lentitud sostenida y selección manual Ligera/Alta. Ajuste de resolución y cantidades visibles sin reconstruir la escena ni perder el avance. Diálogo accesible con retorno del foco y controles compactos en móvil. Texto de partículas conservado en todos los perfiles.

## 0.6.0

Elección opcional de luz, agua o música antes de plantar. Iluminación cálida, gotas procedurales o pulso visual con sonidos armonizados, respetando silencio y movimiento reducido. Selector accesible por teclado y tacto, conservado al reiniciar. Ajuste de espacio en la introducción para evitar solapamientos con el pie.

## 0.5.0

Final sorpresa opcional después de explorar: el girasol principal crece con un destello de partículas y permite regresar al jardín. Reutiliza la geometría existente, admite teclado y movimiento reducido, y cancela la animación al reiniciar.

## 0.4.0

El corazón se transforma opcionalmente en un mensaje de partículas con fecha. Tres perfiles de flores conservan el girasol protagonista y añaden variedad al jardín y al ramo. Secreto de terminal de juguete con soporte de teclado. Menos actualizaciones de pétalos tras la floración y descubrimiento secuencial sin atascarse después de tocar flores fuera de orden.

## 0.3.0

Viento por pulsación con ratón, tacto o teclado, síntesis sonora local, movimiento de hojas y hierba, dispersión y formación de corazón 3D con partículas. Cierre de primavera y retorno a exploración libre. Alternativa de un solo paso, cancelación de gestos y final estático para movimiento reducido.

## 0.2.0

Formación animada del ramo, composición reproducible, cinta tridimensional con arrastre y alternativa de teclado, tarjeta que emerge al desatar el lazo y retorno a la escena correcta tras leerla. Reinicio seguro durante las transiciones y corrección del salto del botón por hover con movimiento reducido.

## 0.1.0

Primera implementación del recorrido semilla → crecimiento → floración → jardín, con nota final, composición reproducible, accesibilidad, ambiente sintetizado y workflows de verificación y GitHub Pages.

## 0.9.0 — Jardín y ramo cinematográficos

- Paisaje nocturno con sendero central y flores 3D que se abren hacia sus lados antes de reunirse en el ramo.
- Encuadres continuos para jardín, reunión y regalo; adaptación a pantalla móvil.
- Variaciones en pétalos y orientación de las flores, cinta con material satinado y desenfoque suave del fondo del ramo en perfiles medio/alto.
- Controles inferiores compactos y cinta accesible por arrastre o teclado.

## 0.10.0 — Tarjeta y finales cinematográficos

- Tarjeta 3D con papel botánico generado, primer plano propio y lectura HTML con fondo ilustrado.
- Retirada de la tarjeta al iniciar el viento, estelas luminosas y encuadres centrales para corazón, mensaje y última flor.
- Partículas más cálidas y suaves sin aumentar su cantidad; controles centrados y reinicio visible en exploración libre.
- Duraciones narrativas basadas en tiempo transcurrido: se desactiva el descuento de pausas largas de GSAP mientras vive la escena. La cámara usa tiempo real para converger tras un frame lento.

## 0.11.0 — Relieve y detalle floral

- Pétalos curvos con bordes elevados, puntas inclinadas y variaciones de orientación.
- Hojas con nervadura central, ramificaciones de color y bordes sutilmente irregulares.
- Centros más oscuros con 320 semillas instanciadas de tamaño y tono variables.
- Evidencia visual del ramo en escritorio y móvil, comparada con el tablero original.
