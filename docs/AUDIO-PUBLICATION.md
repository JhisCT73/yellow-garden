# Publicación sin música incluida

La versión 0.19.2 permite seleccionar música del equipo. El selector no sube archivos ni conserva la selección al cerrar. El instalador anterior 0.19.1 contiene una grabación comercial: no distribuirlo.

## Actualizar desde GitHub Desktop

Usa Push origin para subir el commit de retirada. Revisa Actions y confirma que el nuevo despliegue termina. Si despublicaste Pages, vuelve a ejecutar el workflow de Pages cuando quieras activar la versión nueva.

## Copias históricas

Un push normal NO elimina el MP3 del historial público. La eliminación completa requiere filtrar `public/audio/dandelions.mp3` de todas las ramas y etiquetas afectadas y actualizar el remoto reescribiendo su historial. Eso cambia identificadores de commits y requiere coordinar a otros colaboradores. No mezcles un historial antiguo después de la limpieza.

Retira también Releases, instaladores y artefactos antiguos que contengan la grabación. Las copias descargadas y clones ajenos no se pueden retirar desde este proyecto. Este cambio local no modifica automáticamente GitHub ni sus Releases.
