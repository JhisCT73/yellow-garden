# Entrega local · Yellow Garden 0.19

Todo vive en un repositorio: código fuente, web y configuración de la aplicación Windows. No se publicó en GitHub ni se creó un remoto.

## Archivos

- `release/YellowGarden-Setup-0.19.1-x64.exe`: instalador Windows x64 (aproximadamente 120 MB decimales).
- `release/SHA256SUMS.txt`: hash del instalador.
- `release/win-unpacked/`: programa empaquetado para pruebas; conservar la carpeta completa.
- `dist/`: web compilada, lista para servidor HTTP o GitHub Pages.
- `README.md`: uso para visitantes, instalación, desarrollo, personalización y publicación.
- `docs/RELEASE-NOTES.md`: plantilla de notas para GitHub Releases.

`release/` y `dist/` no se versionan; los workflows los generan y el instalador se adjunta a Releases. Los comandos locales usan `--publish never`.

## Estado

Compilación y empaquetado NSIS completados. Probado el ejecutable empaquetado con red desactivada: carga del logo, jardín WebGL, mapa de etapas y Acerca del proyecto. Renderer sin acceso a Node.js, sandbox/aislamiento/seguridad web activos. Captura en `docs/desktop-app.png`.

El instalador se generó, pero no se ejecutó la instalación/desinstalación en el perfil personal del usuario. Los accesos directos están configurados en NSIS; falta comprobar la experiencia de instalación en un equipo limpio. No hay certificado de firma digital ni autoactualizaciones. La interfaz puede mostrar un aviso de editor desconocido al abrir el instalador.

Los workflows se prepararon y revisaron localmente; no se ejecutaron en GitHub porque la publicación sigue a cargo del usuario. GitHub Pages y las descargas públicas aparecerán después de subir el repositorio, activar Pages y publicar una Release. La ejecución manual de Windows solo crea artefactos; un tag de versión crea una Release en borrador.

## Validación externa pendiente

Windows 10 en equipo limpio, instalación/desinstalación y accesos directos; Safari/iPhone y Android físicos; audio, temperatura y fluidez sostenida. No se certifican 60 FPS. Electron conserva el coste del jardín 3D, no lo elimina. El README explica calidad Ligera y los límites de compatibilidad.
