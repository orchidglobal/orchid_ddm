import { BrowserWindow, screen } from "electron";
import path from "path";
import Settings from "../settings";

const OrchidUIDock = {
  window: null as BrowserWindow | null,

  init: function () {
    this.createWindow();
  },

  createWindow: function () {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;

    this.window = new BrowserWindow({
      x: 15,
      y: height - 48 - 10,
      width: width - 30,
      height: 48,
      autoHideMenuBar: true,
      focusable: false,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInSubFrames: true,
        webviewTag: true,
        defaultFontSize: 16,
        defaultMonospaceFontSize: 14,
        defaultFontFamily: {
          standard: '-orchid-standard-font',
          serif: 'Times New Roman',
          sansSerif: '-orchid-standard-font',
          monospace: '-orchid-monospace-font',
          cursive: 'Times New Roman',
          fantasy: 'Jali Arabic Black',
          math: 'Jali Arabic'
        },
        disableDialogs: true,
        defaultEncoding: 'utf-8',
        preload: path.join(__dirname, '..', 'browser', 'internal', 'preload.js'),
        devTools: true
      }
    });

    Settings.getValue('system.shell_mode.dock.url', 'internal.json').then((value) => {
      if (!this.window) {
        throw new Error('Window not found');
      }

      this.window.webContents.loadURL(value);
    });
  }
};

export default OrchidUIDock;
