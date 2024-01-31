import path from 'path';
import { BrowserView, BrowserWindow } from 'electron';

function setupControls(mainWindow: BrowserWindow) {
  // Browser view renderer
  const webview = new BrowserView({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  const { width, height } = mainWindow.getContentBounds();
  webview.setBounds({
    x: width - 50,
    y: 0,
    width: 50,
    height
  });
  mainWindow.addBrowserView(webview);
  webview.webContents.loadFile(path.join(__dirname, '..', '..', '..', 'internal', 'simulator', 'controls.html'));
  mainWindow.on('resized', () => {
    const { width, height } = mainWindow.getContentBounds();
    webview.setBounds({
      x: width - 50,
      y: 0,
      width: 50,
      height
    });
  });
  mainWindow.on('maximize', () => {
    const { width, height } = mainWindow.getContentBounds();
    webview.setBounds({
      x: width - 50,
      y: 0,
      width: 50,
      height
    });
  });
  mainWindow.on('restore', () => {
    const { width, height } = mainWindow.getContentBounds();
    webview.setBounds({
      x: width - 50,
      y: 0,
      width: 50,
      height
    });
  });
}

export default setupControls;
