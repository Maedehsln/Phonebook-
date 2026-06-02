const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  screen,
} = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;
let monitorWidth;
let monitorHeight;
const windowWidth = 900;
const windowHeight = 650;

// مسیر فایل داده
const dataPath = path.join(app.getPath("userData"), "contacts.json");

// خوندن داده‌ها
ipcMain.handle("load-contacts", () => {
  if (fs.existsSync(dataPath)) {
    return JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  }
  return [];
});

// ذخیره داده‌ها
ipcMain.handle("save-contacts", (event, contacts) => {
  fs.writeFileSync(dataPath, JSON.stringify(contacts, null, 2));
  return true;
});

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  ({ width: monitorWidth } = primaryDisplay.workAreaSize);

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: monitorWidth - windowWidth - 10,
    y: 10,
    resizable: false,
    skipTaskbar: false,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow = win;
  win.loadFile("index.html");

  screen.on("display-metrics-changed", () => {
    const newBounds = screen.getPrimaryDisplay().workAreaSize;
    win.setPosition(newBounds.width - windowWidth - 10, 10);
  });
}

function registerGlobalShortcuts() {
  // const shortcut = "CommandOrControl+Shift+Space";
  const shortcut = "CommandOrControl+Space";
  const wasRegistered = globalShortcut.register(shortcut, () => {
    console.log("Global shortcut was pressed!");

    // --- Callback Logic for global hotkey ---
    if (mainWindow) {
      // mainWindow.setAlwaysOnTop(true, "screen-saver"); // the most top layer is this
      mainWindow.setAlwaysOnTop(true);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setPosition(monitorWidth - windowWidth - 10, 10);
      mainWindow.width = windowWidth;
      mainWindow.height = windowHeight;
      mainWindow.webContents.send(
        "focusOnSearchBar",
        "focus on search bar event."
      );
      mainWindow.show();
      mainWindow.focus();
    }
    // ----------------------------------------
  });

  if (!wasRegistered) {
    console.error(
      `Registration failed for ${shortcut}. It might be taken by another application.`
    );
  } else {
    console.log(`Global shortcut ${shortcut} registered successfully.`);
  }
}

app.whenReady().then(() => {
  createWindow();
  registerGlobalShortcuts();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
