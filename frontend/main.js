import { app, BrowserWindow, Menu, screen, ipcMain } from "electron";
import path from "path";

function createWindow() {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  
  // Calculate 80% of screen dimensions
  const windowWidth = Math.floor(screenWidth * 0.8);
  const windowHeight = Math.floor(screenHeight * 0.8);
  
  // Build path to icon
  const iconPath = path.join(import.meta.dirname, 'public', 'favicon.png');
  // For production build structure, you might need:
  // const iconPath = path.join(__dirname, '..', 'public', 'favicon.png');
  // OR if your build folder structure is different:
  // const iconPath = path.join(__dirname, 'build', 'public', 'favicon.png'); 

  const win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    center: true,
    minHeight: windowHeight, 
    minWidth: windowWidth,
    backgroundColor: '#F8FAFD',
    
    frame: false,
    resizable: true,
    maximizable: true,
    minimizable: true,
    icon: iconPath, // Set the window icon
    webPreferences: {
      nodeIntegration: true,

      contextIsolation: true,
      preload: path.join(import.meta.dirname, 'preload.js')
    }
  });

  // Set app icon (for taskbar/dock)
  if (process.platform === 'win32') {
    app.setAppUserModelId('MYCDARS'); // Windows-specific
  }
  
  // Optional: Also set the dock icon for macOS.
  if (process.platform === 'darwin') {
    app.dock.setIcon(iconPath);
    
  }

  Menu.setApplicationMenu(null);

  

  win.loadURL(
    process.env.ELECTRON_START_URL || `file://${import.meta.dirname}/build/index.html`
  );
  win.webContents.openDevTools();

  // Handle window control events.
  ipcMain.on('window-minimize', () => {
    win.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
      win.webContents.send('is-unmaximized');
    } else {
      win.maximize();
      win.webContents.send('is-maximized');
    }
  });

  ipcMain.on('window-close', () => {
    win.close();
  });

  ipcMain.on('app-quit', () => {
    app.quit();
  });

  return win;
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


ipcMain.on('message-from-react', (event, data) => {
  console.log(data);
});