# Yellow Garden 🌻 · ZyXer Labs

Un jardín nocturno 3D para regalar un momento bonito. Planta una semilla, observa cómo florece, forma un ramo, descubre una carta y recorre un final entre luces.

**Un solo repositorio, tres formas de disfrutarlo:** web, aplicación de Windows y código para aprender o desarrollar.

| Quiero…                    | Qué necesito            | Dónde empezar                                                  |
| -------------------------- | ----------------------- | -------------------------------------------------------------- |
| Ver el jardín sin instalar | Un navegador con WebGL2 | La web de GitHub Pages indicada en About del repositorio       |
| Guardarlo como programa    | Windows 10/11 x64       | [Releases](../../releases): descargar el instalador `.exe`     |
| Modificarlo o aprender     | Node.js 22.12+ y npm    | [Desarrollo](#desarrollo) y [CONTRIBUTING.md](CONTRIBUTING.md) |

> La publicación la realiza el propietario. Si todavía no hay una web o una Release publicada, esas opciones aún no están disponibles. No hay que descargar el código fuente para usar el instalador.

## Qué puedes hacer

- Elegir **Ver la historia**, que avanza automáticamente, o **Explorar a mi ritmo**.
- Recorrer 12 etapas: semilla, crecimiento, primera flor, jardín, ramo, cinta, carta, viento, corazón, mensaje, gran flor y banco.
- Pausar, volver a una etapa visitada y reiniciar desde el mapa. Pulsa **ZyXer Labs**, arriba a la izquierda, para abrirlo.
- Elegir Luz, Agua o Música para tu semilla; activar sonido opcional.
- Crear el ramo, arrastrar la cinta y leer la dedicatoria. La historia espera mientras lees la carta.
- Descubrir mensajes en flores y el secreto del símbolo de marca.
- Usar teclado y alternativas a arrastrar o mantener pulsado. Escape cierra los diálogos.
- Ajustar calidad Automática, Ligera o Alta. Se respeta la preferencia de movimiento reducido del sistema.

El entorno incluye terreno, flores, montañas, luna y objetos 3D, nubes animadas y luciérnagas. Es una interpretación estilizada, no una imagen fotográfica. Los recursos son locales, sin cuentas, backend ni servicios externos durante el recorrido. Los enlaces a GitHub sí necesitan internet.

## Usar en el navegador

Abre la dirección de GitHub Pages que el propietario coloque en **About → Website**. Funciona sin instalar Node.js ni descargar el ejecutable. En **Ajustes del jardín → Acerca del proyecto** encontrarás las descargas y el código cuando se haya configurado el repositorio.

La web necesita conexión para su primera carga; no se ha implementado instalación PWA ni caché offline garantizada. Si no hay WebGL2, ofrece una alternativa de texto. Safari/iPhone y Android físicos todavía requieren comprobación; emular un móvil no certifica esos dispositivos.

## Usar como programa en Windows

1. Entra en [Releases](../../releases).
2. En **Assets**, descarga `YellowGarden-Setup-0.19.1-x64.exe` (el número cambia en nuevas versiones).
3. Abre el instalador, elige la carpeta y termina la instalación.
4. Abre **Yellow Garden — ZyXer Labs** desde el escritorio o menú Inicio.

No necesitas Node.js, terminal, navegador abierto ni conexión para disfrutar del jardín instalado. Puedes usar **Vista → Pantalla completa**. Para desinstalar, usa **Configuración de Windows → Aplicaciones**.

La primera edición está preparada para **Windows 10/11 x64**. No se ofrecen instaladores de macOS, Linux ni ARM64. No hay actualizaciones automáticas: descarga el nuevo instalador desde Releases. El recorrido y los ajustes se reinician al cerrar/recargar; no se guardan partidas.

**Firma del instalador:** esta edición no tiene certificado de firma de código. Windows puede mostrar un aviso de editor desconocido. Descarga únicamente desde el repositorio de confianza; no desactives las protecciones del equipo. Cada compilación de GitHub incluye `SHA256SUMS.txt` para comprobar la integridad con `Get-FileHash archivo.exe -Algorithm SHA256`. Un hash no acredita la identidad del editor.

## Desarrollo

Requisitos: **Node.js 22.12 o posterior**, npm y Git si vas a clonar. Para generar el instalador utiliza Windows x64. La primera instalación de dependencias y el primer empaquetado necesitan internet.

Clona tu copia del repositorio o descarga el código y abre una terminal en su carpeta:

```sh
npm ci
npm run dev
```

Abre la dirección que indique Vite. No abras `index.html` directamente desde el explorador de archivos.

| Comando                                       | Resultado                                                         |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                                 | Web con recarga durante desarrollo                                |
| `npm run build`                               | Web lista para servir en `dist/`                                  |
| `npm run preview`                             | Revisar la web compilada                                          |
| `npm run desktop`                             | Compilar la web y abrirla con Electron                            |
| `npm run desktop:pack`                        | Programa sin instalador en `release/win-unpacked/`                |
| `npm run desktop:dist`                        | Instalador Windows x64 en `release/`                              |
| `npm run test:desktop`                        | Comprobación de arranque de Electron con el `dist/` existente     |
| `npm run check` / `npm run lint` / `npm test` | Tipos, análisis estático y pruebas unitarias                      |
| `npm run test:e2e`                            | Pruebas del navegador; requiere `npx playwright install chromium` |

Para probar el programa empaquetado en PowerShell:

```powershell
$env:DESKTOP_EXECUTABLE = 'release/win-unpacked/Yellow Garden.exe'
npm run test:desktop
Remove-Item Env:DESKTOP_EXECUTABLE
```

La carpeta `win-unpacked` se usa completa; su `.exe` solo no es un programa portable. Para usuarios, distribuye el instalador de la raíz de `release/`.

### Personalizar

- `src/config/garden.config.ts`: fecha, opciones del jardín, cantidad de flores y duraciones.
- `src/content/messages.ts`: mensajes y dedicatoria.
- `src/theme/`: colores y tipografía.
- `public/branding/zyxer-mark.png`: símbolo visual e icono del programa.
- `electron-builder.json`: nombre, identificador y opciones de instalación.
- `?seed=ana` en la web: composición reproducible.

Para activar enlaces al repositorio en builds locales, copia `.env.example` a `.env.local` y cambia `VITE_REPOSITORY_URL` por la URL real. GitHub Actions la configura automáticamente. La variable es pública: no introduzcas tokens ni secretos. Si falta, se muestra una explicación sin enlaces inventados.

## Publicar todo desde este repositorio

No se publica nada al ejecutar los comandos locales de empaquetado: utilizan `--publish never`.

### Web: GitHub Pages

1. Sube el repositorio cuando quieras publicarlo.
2. En **Settings → Pages → Source**, selecciona **GitHub Actions**.
3. Publica cambios en `main` o ejecuta **Actions → GitHub Pages → Run workflow**.
4. Copia la URL indicada por el despliegue a **About → Website** del repositorio.

`deploy.yml` valida y publica `dist/`. Las rutas relativas admiten servir la web bajo el nombre de tu repositorio.

### Windows: instalador y Releases

**Para probar sin publicar:** ejecuta **Actions → Windows application → Run workflow**. Al terminar, descarga el artefacto `yellow-garden-windows-x64`; contiene el instalador y los hashes. El artefacto `yellow-garden-web` contiene la web compilada. Los artefactos de Actions pueden caducar; no sustituyen una Release pública.

**Para preparar una versión:** actualiza la versión con `npm version patch` (o `minor`/`major`) sobre un árbol limpio, y sube el commit y el tag que crea. El tag debe ser exactamente `v` seguido de la versión de `package.json`. Por ejemplo, la versión actual corresponde a `v0.19.1`.

El workflow `desktop.yml` compila, comprueba la aplicación empaquetada y crea una **Release en borrador** con el instalador y sus hashes. Revisa los archivos y las notas en GitHub; solo cuando pulses **Publish release** serán una descarga pública. El código fuente lo adjunta GitHub como ZIP/TAR de esa versión.

Para distribuir con una identidad de editor verificada, será necesario contratar/configurar firma de código en una etapa posterior; este repositorio no contiene certificados ni credenciales.

## Estructura y tecnología

```text
src/                  Experiencia compartida Svelte + TypeScript + Three.js
public/               Recursos locales y marca
electron/             Ventana y seguridad de Electron (sin backend)
scripts/              Herramientas y prueba de escritorio
.github/workflows/    Validación, Pages y compilación Windows
docs/                 Guías y evidencia de validación
dist/                 Web compilada (no se versiona)
release/              Ejecutable e instalador (no se versionan)
```

Electron carga el mismo `dist/` mediante un protocolo local; no inicia Vite ni expone Node.js a la interfaz. Se bloquean navegación externa y permisos del dispositivo; únicamente los enlaces HTTPS a GitHub pueden abrirse en el navegador del sistema.

Consulta [ARCHITECTURE.md](ARCHITECTURE.md), [docs/VALIDATION.md](docs/VALIDATION.md), [CHANGELOG.md](CHANGELOG.md) y [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia y créditos

El proyecto conserva su [licencia MIT](LICENSE): puedes estudiar, modificar y redistribuir el código respetando sus condiciones y avisos. Consulta [ATTRIBUTIONS.md](ATTRIBUTIONS.md) para recursos y dependencias. La marca que aparece en esta edición es **ZyXer Labs**.

## Música de esta edición local

La pista es **Dandelions — Ruth B.**, a partir del MP3 aportado por el propietario, guardado en `public/audio/dandelions.mp3`. Se carga al activar Sonido, con volumen moderado y repetición. Silenciar pausa la canción; volver a activar continúa desde ese punto. Al ocultar la pestaña se silencia y requiere reactivación explícita. La pausa de la historia y el control de sonido siguen siendo independientes. Los efectos de interacción se mantienen a menor volumen; se eliminó el acorde ambiental continuo anterior.

La grabación es un recurso de terceros y no forma parte de la licencia MIT del código. Esta incorporación es local; no se ha publicado el audio en GitHub. Su redistribución pública debe tratarse por separado antes de publicar la versión.
