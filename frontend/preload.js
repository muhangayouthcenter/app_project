const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendToMain: (data) => ipcRenderer.send('message-from-react', data),
  onFromMain: (callback) => ipcRenderer.on('message-from-main', (event, data) => callback(data)),
  quit: () => ipcRenderer.send('app-quit')
});

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
});

