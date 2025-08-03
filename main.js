const { app, BrowserWindow } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'ycalendar.ico');
  
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 500,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: iconPath,
    show: false, // Don't show until ready-to-show
    autoHideMenuBar: true
  });

  // Set icon again after window creation (Windows-specific reinforcement)
  if (process.platform === 'win32') {
    mainWindow.setIcon(iconPath);
  }

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Set icon one more time after window is shown (sometimes needed)
    if (process.platform === 'win32') {
      setTimeout(() => {
        mainWindow.setIcon(iconPath);
      }, 100);
    }
  });

  // Open DevTools for debugging (remove in production)
  // mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Set App User Model ID for Windows taskbar grouping - make it very unique
if (process.platform === 'win32') {
  app.setAppUserModelId('ycalendar.desktop.app.2024.unique');
}

// App event listeners
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

// Additional Windows-specific icon handling
if (process.platform === 'win32') {
  app.on('ready', () => {
    // Force set the app icon if available
    const iconPath = path.join(__dirname, 'ycalendar.ico');
    try {
      if (app.setIcon) {
        app.setIcon(iconPath);
      }
    } catch (error) {
      console.log('Could not set app icon:', error);
    }
  });
}