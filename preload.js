const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('bridge', {
  call: (name, ...args) => ipcRenderer.invoke(name, ...args),
  on: (channel, cb) => ipcRenderer.on(channel, (e, ...args) => cb(...args)),
  pathOf: file => webUtils.getPathForFile(file),
});
