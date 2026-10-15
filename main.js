const { app, BrowserWindow, ipcMain, dialog, nativeTheme, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const statePath = path.join(app.getPath('userData'), 'state.json');
const mdFiles = argv => argv.filter(a => /\.(md|markdown)$/i.test(a) && fs.existsSync(a)).map(a => path.resolve(a));
let win;

// Everything the UI can call. New feature = new function here, then call('name', ...) in app.js.
const api = {
  loadState: () => { try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { return {}; } },
  saveState: state => fs.writeFileSync(statePath, JSON.stringify(state)),
  read: file => fs.readFileSync(file, 'utf8'),
  pick: async () => (await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }, { name: 'Vše', extensions: ['*'] }],
  })).filePaths,
  setTheme: theme => { nativeTheme.themeSource = theme; },
  openExternal: url => shell.openExternal(url),
  argFiles: () => mdFiles(process.argv),
};
for (const [name, fn] of Object.entries(api)) ipcMain.handle(name, (e, ...args) => fn(...args));

// One window only: opening another .md (e.g. double-click in Explorer) adds a tab to the running app.
if (!app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', (e, argv) => {
  win.webContents.send('open', mdFiles(argv));
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  nativeTheme.themeSource = api.loadState().theme === 'dark' ? 'dark' : 'light';
  win = new BrowserWindow({
    width: 1100, height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1e2e' : '#ffffff',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
});

app.on('window-all-closed', () => app.quit());
