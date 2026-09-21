# Atribuciones

La geometría, shaders, composición, estilos y síntesis de audio de esta versión se crearon para Yellow Garden. Las fuentes son las disponibles en el sistema.

`public/textures/soil.jpg` y `public/textures/night-garden.jpg` son imágenes generadas con la herramienta integrada de generación de imágenes de OpenAI para este proyecto: textura de tierra y entorno nocturno desenfocado. Se incluyen localmente y no requieren APIs durante la ejecución. El entorno lejano es una imagen sobre un plano; la semilla, el brote, las flores, las piedras y las interacciones son tridimensionales. La referencia de dirección artística fue proporcionada por el usuario; las comparaciones en `docs/` no son assets del sitio.

Dependencias principales: Svelte (MIT), Three.js (MIT), Threlte (MIT), XState (MIT), Vite (MIT). GSAP se distribuye bajo su licencia propia; consultar la licencia incluida en la versión instalada. La licencia MIT de este repositorio no sustituye las licencias de sus dependencias.

Referencias de API: https://threlte.xyz/docs/ y https://svelte.dev/docs/ . El algoritmo de disposición radial usa el ángulo áureo. La paleta y el concepto provienen del plan maestro de Yellow Garden aportado por el usuario.

- `public/textures/garden-path.jpg`: paisaje nocturno generado para este proyecto mediante ImageGen (1536 × 1024, JPEG, aproximadamente 427 KB). Se usa como fondo lejano, con protagonistas 3D animados delante; no se carga una API de imágenes durante la visita.

- `public/textures/botanical-paper.jpg`: papel marfil botánico generado mediante ImageGen para este proyecto, 1536 × 1024, aproximadamente 225 KiB. Sin texto en el asset; las palabras se dibujan en la CanvasTexture de la portada y el contenido de lectura permanece como HTML seleccionable.

Desde 0.19, Electron (MIT) aporta el runtime de escritorio y electron-builder (MIT) genera el instalador. Electron incluye los avisos de Chromium y otros componentes en su distribución. El empaquetado conserva LICENSE, ATTRIBUTIONS.md y los archivos de licencias del runtime. No se incluye un certificado de firma de código.
