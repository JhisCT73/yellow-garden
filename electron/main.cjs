const {
  app,
  BrowserWindow,
  Menu,
  net,
  protocol,
  session,
  shell,
} = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'garden',
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

function openExternal(url) {
  try {
    const parsed = new URL(url);
    // The renderer may open only project links on GitHub, never local files or commands.
    if (
      parsed.protocol === 'https:' &&
      parsed.hostname === 'github.com' &&
      !parsed.username &&
      !parsed.password
    )
      void shell.openExternal(parsed.href);
  } catch {
    /* Ignore malformed destinations. */
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 360,
    minHeight: 560,
    title: 'Yellow Garden — ZyXer Labs',
    backgroundColor: '#080c18',
    icon: path.join(__dirname, '../public/branding/zyxer-mark.png'),
    show: !process.argv.includes('--smoke-test'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    openExternal(url);
  });
  window.webContents.on('will-attach-webview', (event) =>
    event.preventDefault(),
  );
  void window.loadURL('garden://app/index.html');
  return window;
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      if (window.isMinimized()) window.restore();
      window.focus();
    }
  });
  app.whenReady().then(() => {
    app.setAppUserModelId('com.zyxerlabs.yellowgarden');
    const dist = path.resolve(__dirname, '../dist');
    protocol.handle('garden', async (request) => {
      try {
        const url = new URL(request.url);
        if (url.host !== 'app' || request.method !== 'GET')
          return new Response(null, { status: 403 });
        const file = path.resolve(dist, '.' + decodeURIComponent(url.pathname));
        const relative = path.relative(dist, file);
        if (relative.startsWith('..') || path.isAbsolute(relative))
          return new Response(null, { status: 403 });
        const response = await net.fetch(pathToFileURL(file).href);
        const headers = new Headers(response.headers);
        headers.set(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; media-src 'self' blob:; connect-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'",
        );
        return new Response(response.body, {
          status: response.status,
          headers,
        });
      } catch {
        return new Response(null, { status: 404 });
      }
    });
    session.defaultSession.setPermissionRequestHandler(
      (_contents, _permission, callback) => callback(false),
    );
    session.defaultSession.setPermissionCheckHandler(() => false);
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        { label: 'Yellow Garden', submenu: [{ label: 'Salir', role: 'quit' }] },
        {
          label: 'Vista',
          submenu: [
            { label: 'Pantalla completa', role: 'togglefullscreen' },
            { label: 'Recargar jardín', role: 'reload' },
          ],
        },
      ]),
    );
    createWindow();
    app.on('activate', () => {
      if (!BrowserWindow.getAllWindows().length) createWindow();
    });
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
