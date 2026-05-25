const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args)),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    createFile: (filename, parentPath) => ipcRenderer.invoke('create-file', filename, parentPath),
    createFolder: (foldername, parentPath) => ipcRenderer.invoke('create-folder', foldername, parentPath),
    renameItem: (oldPath, newName) => ipcRenderer.invoke('rename-item', oldPath, newName),
    deleteItem: (relPath) => ipcRenderer.invoke('delete-item', relPath)
  }
});
