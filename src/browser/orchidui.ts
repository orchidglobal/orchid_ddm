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
    desktop: {
      id: 'desktop',
      simulator_width: 1024,
      simulator_height: 640,
      agent_type: 'Desktop'
    },
    mobile: {
      id: 'mobile',
      simulator_width: 320,
      simulator_height: 640,
      agent_type: 'Mobile'
    },
    smart_tv: {
      id: 'smart_tv',
      simulator_width: 1280,
      simulator_height: 720,
      agent_type: 'Smart TV'
    }
  } as SimulatorConfig,

  window: null as BrowserWindow | null,

  DEFAULT_PRINT_SETTINGS: {
    silent: false,
    color: true,
    margin: {
      marginType: 1
    }
  },

  /**
   * Initializes the OrchidUI module.
   *
   * This function is called when the Electron application is ready. It
   * first determines which edition is being used and then creates the
   * main window and loads the system.
   */
  init: function () {
    this.defineEdition()
      .then(() => {
        /**
         * Create the main window and load the system.
         *
         * This includes loading the system.json file as well as the
         * preload.js script.
         */
        this.createWindow();
        this.loadSystem();
      });

    // /**
    //  * Set the application menu to null to hide the menu bar.
    //  */
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
      icon: path.join(__dirname, '..', '..', 'apps', 'browser', 'style', 'icons', 'browser_128.png'),
      title: `OrchidUI ${app.getVersion()} ${this.editionConfig[this.edition].agent_type}`,
      minWidth: 320,
      minHeight: 480,
      width:
        process.platform !== 'win32'
          ? this.editionConfig[this.edition].simulator_width
          : this.editionConfig[this.edition].simulator_width + 14,
      height:
        process.platform !== 'win32'
          ? this.editionConfig[this.edition].simulator_height
          : this.editionConfig[this.edition].simulator_height + 37,
      autoHideMenuBar: true,
      backgroundColor: '#000000',
      frame: false,
      tabbingIdentifier: 'openorchid',
      kiosk: !Main.DEBUG,
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

    this.window.webContents.on('dom-ready', this.handleDOMReady.bind(this));
    Settings.getValue('video.dark_mode.enabled').then(this.handleDarkMode.bind(this));

    ipcMain.on('change-theme', this.handleThemeChange.bind(this));
    ipcMain.on('print', (event, data: Record<string, any>) => {
      data = Object.assign(this.DEFAULT_PRINT_SETTINGS, data);
      this.window?.webContents.print(data);
    });

    registerEvents();
  },

  handleDOMReady() {
    const webviewScriptPath = path.join(__dirname, '..', '..', '..', 'internal', 'webview', 'webview.js');
    console.log(webviewScriptPath);
    this.window?.webContents.executeJavaScript(fs.readFileSync(webviewScriptPath, 'utf8'));
    fs.readdir(path.join(__dirname, '..', '..', '..', 'internal', 'preloads'), (error, files) => {
      if (error) {
        console.error(error);
        return;
      }
      files.forEach((file) => {
        const filepath = path.join(__dirname, '..', '..', '..', 'internal', 'preloads', file);
        console.log(filepath);
        if (file.endsWith('.js')) {
          this.window?.webContents.executeJavaScript(fs.readFileSync(filepath, 'utf8'));
        } else if (file.endsWith('.css')) {
          this.window?.webContents.insertCSS(fs.readFileSync(filepath, 'utf8'));
        }
      });
    });
  },

  handleDarkMode: function (result: boolean) {
    nativeTheme.themeSource = result ? 'dark' : 'light';
  },

  handleThemeChange: function (event: IpcMainEvent, result: 'system' | 'light' | 'dark') {
    nativeTheme.themeSource = result;
  },

  loadSystem: function () {
    if (!this.editionConfig[this.edition]) {
      throw new Error('Missing edition config');
    }

    const userAgentProduct = `Mozilla/5.0`;
    const userAgentVersion = `OrchidOS ${app.getVersion()}; Linux`;
    const userAgentComment = `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${process.versions.chrome} Safari/537.36 OrchidChr/${app.getVersion()} ${this.editionConfig[this.edition].agent_type}/${systemJson.device_model_name}`;
    const userAgent = `${userAgentProduct} (${userAgentVersion}) ${userAgentComment}`;

    // and load the index.html of the app.
    Settings.getValue('system.main.url', 'internal.json').then((value) => {
      if (!this.window) {
        throw new Error('Window not found');
      }

      this.window?.webContents.loadURL(value, { userAgent });
    });
  }
};

export default OrchidUI;
