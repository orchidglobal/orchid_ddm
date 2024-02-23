import { app, BrowserWindow, dialog, protocol, net, ProtocolRequest } from 'electron';
import { pathToFileURL } from 'url';
import os from 'os';
import fs from 'fs';
import path from 'path';
import colors from './browser/terminal_colors';
import OrchidUI from './browser/orchidui';
import webapps from './browser/webapps';

import dotenv from 'dotenv';
import checkDefaultFiles from './browser/default_presets';
import OrchidUIDock from './shell_mode/dock';
import OrchidUIDesktop from './shell_mode/desktop';
dotenv.config();

export const Main = {
  DEBUG: (process.env.ORCHID_ENVIRONMENT === 'development'),

  profilePath: undefined as string | undefined,
  webappsPath: undefined as string | undefined,
  webappsConfigPath: undefined as string | undefined,
  storagePath: undefined as string | undefined,

  isRunningAsRoot: undefined as boolean | undefined,
  launchOptions: {} as any,

  init: function () {
    this.isRunningAsRoot = process.geteuid && process.geteuid() === 0;

    this.parseLaunchOptions();
    this.setupCommandLine();
    if (!this.DEBUG) {
      this.prepareProfilePaths();
      this.prepareWebappsPaths();
      this.prepareWebappsConfigPaths();
      this.prepareStoragePaths();
    } else {
      this.profilePath = process.env.ORCHID_PROFILE;
      this.webappsPath = process.env.ORCHID_WEBAPPS;
      this.webappsConfigPath = process.env.ORCHID_WEBAPPS_CONF;
      this.storagePath = process.env.ORCHID_STORAGE;
    }

    process.on('uncaughtException', (error) => {
      console.error(`${colors.red}Uncaught exception: ${error}${colors.reset}`);
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error(`${colors.red}Unhandled promise rejection: ${reason}${colors.reset}`);
    });

    if (this.profilePath) {
      fs.mkdirSync(this.profilePath, {
        recursive: true
      });
      checkDefaultFiles();
    }

    this.overrideDialogs();
    this.setupProfileLocations();
    this.registerProtocols();

    app.whenReady().then(this.whenReady.bind(this));

    app.on('window-all-closed', this.allWindowsClosed.bind(this));
    app.on('activate', this.activateApp.bind(this));
  },

  allWindowsClosed: function () {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  },

  activateApp: function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      Main.relaunch();
    }
  },

  relaunch: function () {
    OrchidUI.init();
  },

  whenReady: function () {
    this.startProtocolRouting();

    webapps(app);
    OrchidUI.init();

    // OrchidUIDesktop.init();
    // OrchidUIDock.init();
  },

  parseLaunchOptions: function () {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i += 2) {
      const arg = args[i];
      const value = args[i + 1];

      if (arg.startsWith('--')) {
        this.launchOptions[arg.slice(2)] = value;
      } else if (arg.startsWith('-')) {
        this.launchOptions[arg.slice(1)] = value;
      }
    }
  },

  setupCommandLine: function () {
    app.commandLine.appendSwitch('enable-features', 'MemorySavings');
    app.commandLine.appendSwitch('enable-features', 'AutomaticTabDiscarding');
  },

  setupProfileLocations: function () {
    if (!this.profilePath || !this.storagePath) {
      throw new Error('Unspecified profile path');
    }

    app.setPath('appData', path.resolve(this.profilePath));
    app.setPath('userData', path.resolve(this.profilePath));
    app.setPath('sessionData', path.resolve(this.profilePath));
    app.setPath('temp', path.join(path.resolve(this.profilePath), 'temp'));
    app.setPath('desktop', path.join(path.resolve(this.storagePath), 'Desktop'));
    app.setPath('documents', path.join(path.resolve(this.storagePath), 'Documents'));
    app.setPath('downloads', path.join(path.resolve(this.storagePath), 'Downloads'));
    app.setPath('music', path.join(path.resolve(this.storagePath), 'Music'));
    app.setPath('pictures', path.join(path.resolve(this.storagePath), 'Pictures'));
    app.setPath('videos', path.join(path.resolve(this.storagePath), 'Videos'));
    app.setPath('logs', path.join(path.resolve(this.profilePath), 'logs'));
    app.setPath('cache', path.join(path.resolve(this.profilePath), 'cache'));
    app.setPath('crashDumps', path.join(path.resolve(this.profilePath), 'crash-dumps'));
  },

  prepareProfilePaths: function () {
    switch (process.platform) {
      case 'win32':
        this.profilePath = '%APPDATA%\\Orchid\\OrchidUI';
        break;

      case 'darwin':
        this.profilePath = `${os.homedir()}/Library/Application Support/OrchidUI`;
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        this.profilePath = `${os.homedir()}/.orchid`;
        break;

      default:
        this.profilePath = process.env.ORCHID_PROFILE;
        break;
    }
  },

  prepareWebappsPaths: function () {
    switch (process.platform) {
      case 'win32':
        this.webappsPath = '%APPDATA%\\Orchid\\Orchid Apps';
        break;

      case 'darwin':
        this.webappsPath = `${os.homedir()}/Library/Application Support/Orchid Apps`;
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        if (this.isRunningAsRoot) {
          this.webappsPath = '/usr/local/webapps';
        } else {
          this.webappsPath = `${os.homedir()}/.webapps`;
        }
        break;

      default:
        this.webappsPath = process.env.ORCHID_WEBAPPS;
        break;
    }
  },

  prepareWebappsConfigPaths: function () {
    switch (process.platform) {
      case 'win32':
        this.webappsConfigPath = '%APPDATA%\\Orchid\\OrchidInstalledApps.json';
        break;

      case 'darwin':
        this.webappsConfigPath = `${os.homedir()}/Library/Application Support/OrchidInstalledApps.json`;
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        if (this.isRunningAsRoot) {
          this.webappsConfigPath = '/usr/local/webapps.json';
        } else {
          this.webappsConfigPath = `${os.homedir()}/.installed_webapps`;
        }
        break;

      default:
        this.webappsConfigPath = process.env.ORCHID_WEBAPPS;
        break;
    }
  },

  prepareStoragePaths: function () {
    switch (process.platform) {
      case 'win32':
        this.storagePath = `${os.homedir()}/Documents`;
        break;

      case 'darwin':
      case 'linux':
      case 'freebsd':
      case 'android':
        this.storagePath = os.homedir();
        break;

      default:
        this.storagePath = process.env.ORCHID_STORAGE;
        break;
    }
  },

  overrideDialogs: function () {
    dialog.showErrorBox = function (title: string, content: string) {
      console.error(`${title}\n${content}`);
    };
  },

  registerProtocols: function () {
    app.setAsDefaultProtocolClient('orchid-activity');
    protocol.registerSchemesAsPrivileged([
      { scheme: 'orchid', privileges: { standard: true, secure: true, supportFetchAPI: true } },
      { scheme: 'orchid-reader', privileges: { standard: true, secure: true, supportFetchAPI: false } }
    ]);
  },

  startProtocolRouting: function () {
    protocol.registerFileProtocol('orchid', this.handleOrchidProtocol.bind(this));
    protocol.handle('orchid-reader', this.handleOrchidReaderProtocol.bind(this));
  },

  handleOrchidProtocol: function (request: ProtocolRequest, callback: Function) {
    let url = request.url.substring('orchid://'.length); // Remove 'orchid://'
    if (!url.startsWith('/')) url = '/' + url; // Add leading slash if missing

    let filePath = path.join(__dirname, '..', '..', 'internal', url);

    // Check if it's a directory
    if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
      if (!url.endsWith('/')) {
        url += '/'; // Add trailing slash if missing
        filePath = path.join(__dirname, '..', '..', 'internal', url, 'index.html');
      } else {
        filePath = path.join(__dirname, '..', '..', 'internal', url, 'index.html');
      }
    }

    const object = { path: filePath };
    callback(object);
  },

  handleOrchidReaderProtocol: function (request: Request) {
    const filePath = path.join(__dirname, '..', '..', 'internal', 'readermode.html');
    return net.fetch(`file://${pathToFileURL(filePath).toString()}`);
  }
};

Main.init();

export default Main;
