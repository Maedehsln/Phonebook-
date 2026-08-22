const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// مسیر فایل داده
const dataPath = path.join(app.getPath('userData'), 'contacts.json')

// خوندن داده‌ها
ipcMain.handle('load-contacts', () => {
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
  }
  return []
})

// ذخیره داده‌ها
ipcMain.handle('save-contacts', (event, contacts) => {
  fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2))
  return true
})
function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    resizable: false,
    icon: path.join(__dirname, "build", "icon1.ico"),
    webPreferences: {
      preload:path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

