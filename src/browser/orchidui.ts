import { BrowserWindow, nativeTheme, Menu, ipcMain, BrowserView, app, IpcMainEvent } from 'electron';
import os from 'os';
import fs from 'fs';
import path from 'path';
import registerEvents from './events';
import registerControls from './controls';
import systemJson from '../system.json';
import Settings from '../settings';
import Main from '../main';

type SimulatorConfig = {
  [key: string]: {
    id: string;
    simulator_width: number;
    simulator_height: number;
    agent_type: string;
  };
};

const OrchidUI = {
  edition: 'desktop',
  editionConfig: {
    'desktop': {
      id: 'desktop',
      simulator_width: 1024,
      simulator_height: 640,
      agent_type: 'Desktop'
    },
    'mobile': {
      id: 'mobile',
      simulator_width: 320,
      simulator_height: 640,
      agent_type: 'Mobile'
    },
    'smart_tv': {
      id: 'smart_tv',
      simulator_width: 1280,
      simulator_height: 720,
      agent_type: 'Smart TV'
    }
  } as SimulatorConfig,

  window: null as BrowserWindow | null,
  webview: null as BrowserView | null,

  DEFAULT_PRINT_SETTINGS: {
    silent: false,
    color: true,
    margin: {
      marginType: 1
    }
  },

  init: function () {
    this.defineEdition().then(() => {
      this.createWindow();
      this.createWebview();
      this.loadSystem();
    });

    // Menu.setApplicationMenu(null);
  },

  defineEdition: async function () {
    if (Main.launchOptions.type) {
      this.edition = Main.launchOptions.type.trim().toLowerCase();
    } else {
      this.edition = await Settings.getValue('system.edition', 'internal.json');
    }
  },

  createWindow: function () {
    this.window = new BrowserWindow({
      icon: path.join(__dirname, '..', '..', 'internal', 'branding', 'openorchid', 'openorchid_128.png'),
      title: `OrchidUI ${app.getVersion()} ${this.editionConfig[this.edition].agent_type}`,
      width:
        process.platform !== 'win32'
          ? this.editionConfig[this.edition].simulator_width + (Main.DEBUG ? 50 : 0)
          : this.editionConfig[this.edition].simulator_width + (Main.DEBUG ? 50 : 0) + 14,
      height:
        process.platform !== 'win32'
          ? this.editionConfig[this.edition].simulator_height
          : this.editionConfig[this.edition].simulator_height + 37,
      autoHideMenuBar: true,
      backgroundColor: '#000000',
      tabbingIdentifier: 'openorchid',
      kiosk: !Main.DEBUG
    });
  },

  createWebview: function () {
    if (!this.window) {
      throw new Error('Window not found');
    }

    this.webview = new BrowserView({
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
        preload: path.join(__dirname, 'internal', 'preload.js'),
        devTools: Main.DEBUG
      }
    });

    this.webview.setAutoResize({
      width: true,
      height: true
    });

    this.window.addBrowserView(this.webview);

    const { width, height } = this.window.getContentBounds();
    if (Main.DEBUG) {
      this.webview.setBounds({ x: 0, y: 0, width: width - 50, height });
    } else {
      this.webview.setBounds({ x: 0, y: 0, width, height });
    }

    this.webview.webContents.on('dom-ready', this.handleDOMReady.bind(this));
    Settings.getValue('video.dark_mode.enabled').then(this.handleDarkMode.bind(this));

    ipcMain.on('change-theme', this.handleThemeChange.bind(this));
    ipcMain.on('print', (event, data: Record<string, any>) => {
      data = Object.assign(this.DEFAULT_PRINT_SETTINGS, data);
      this.webview?.webContents.print(data);
    });

    registerEvents();
    if (Main.DEBUG) {
      this.webview.webContents.openDevTools();
      registerControls(this.window);
    }
  },

  handleDOMReady() {
    const webviewScriptPath = path.join(__dirname, '..', '..', '..', 'internal', 'webview', 'webview.js');
    console.log(webviewScriptPath);
    this.webview?.webContents.executeJavaScript(fs.readFileSync(webviewScriptPath, 'utf8'));
    fs.readdir(path.join(__dirname, '..', '..', '..', 'internal', 'preloads'), (error, files) => {
      if (error) {
        console.error(error);
        return;
      }
      files.forEach((file) => {
        const filepath = path.join(__dirname, '..', '..', '..', 'internal', 'preloads', file);
        console.log(filepath);
        if (file.endsWith('.js')) {
          this.webview?.webContents.executeJavaScript(fs.readFileSync(filepath, 'utf8'));
        } else if (file.endsWith('.css')) {
          this.webview?.webContents.insertCSS(fs.readFileSync(filepath, 'utf8'));
        }
      });
    });
  },

  handleDarkMode: function (result: boolean) {
    nativeTheme.themeSource = result ? 'dark' : 'light';
  },

  handleThemeChange: function (event: IpcMainEvent, result: "system" | "light" | "dark") {
    nativeTheme.themeSource = result;
  },

  loadSystem: function () {
    if (!this.editionConfig[this.edition]) {
      throw new Error('Missing edition config');
    }

    const userAgent = `Mozilla/5.0 (OrchidOS ${app.getVersion()} ${
      this.editionConfig[this.edition].agent_type
    }; Linux ${os.arch()}; ${systemJson.manufacturer} ${systemJson.device_model_name}; ${
      systemJson.service_pack_name
    }) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} OrchidBrowser/${app.getVersion()}${
      this.editionConfig[this.edition].agent_type === 'Mobile' ? ' ' + this.editionConfig[this.edition].agent_type : ''
    } Safari/537.36`;

    // and load the index.html of the app.
    Settings.getValue('system.main.url', 'internal.json').then((value) => {
      if (!this.webview) {
        throw new Error('Window not found');
      }

      this.webview.webContents.loadURL(value, { userAgent });
    });
  }
};

export default OrchidUI;
