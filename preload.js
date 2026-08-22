const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadContacts: () => ipcRenderer.invoke("load-contacts"),

  saveContacts: (contacts) =>
    ipcRenderer.invoke("save-contacts", contacts),
});