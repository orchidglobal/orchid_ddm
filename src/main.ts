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
dotenv.config();

export const Main = {
  DEBUG: process.env.ORCHID_ENVIRONMENT === 'development',

  profilePath: undefined as string | undefined,
  webappsPath: undefined as string | undefined,
  webappsConfigPath: undefined as string | undefined,
  storagePath: undefined as string | undefined,

  isRunningAsRoot: undefined as boolean | undefined,
  launchOptions: {} as any,

  /**
   * Initializes the application and sets up event listeners.
   */
  init: function () {
    /**
     * Whether the user is running the app with administrative privileges.
     * @type {boolean}
     */
    this.isRunningAsRoot = process.geteuid && process.geteuid() === 0;

    // Parses the launch options from the command line.
    this.parseLaunchOptions();

    // Sets up the command line interface.
    this.setupCommandLine();

    // Prepares paths for the profile, webapps, webapps config and storage.
    if (!this.DEBUG) {
      this.prepareProfilePaths();
      this.prepareWebappsPaths();
      this.prepareWebappsConfigPaths();
      this.prepareStoragePaths();
    } else {
      /**
       * The path to the profile directory.
       * @type {string}
       */
      this.profilePath = process.env.ORCHID_PROFILE;

      /**
       * The path to the webapps directory.
       * @type {string}
       */
      this.webappsPath = process.env.ORCHID_WEBAPPS;

      /**
       * The path to the webapps config directory.
       * @type {string}
       */
      this.webappsConfigPath = process.env.ORCHID_WEBAPPS_CONF;

      /**
       * The path to the storage directory.
       * @type {string}
       */
      this.storagePath = process.env.ORCHID_STORAGE;
    }

    // Registers an event listener for uncaught exceptions.
    process.on('uncaughtException', (error) => {
      console.error(`${colors.red}Uncaught exception: ${error}${colors.reset}`);
    });

    // Registers an event listener for unhandled promise rejections.
    process.on('unhandledRejection', (reason, promise) => {
      console.error(`${colors.red}Unhandled promise rejection: ${reason}${colors.reset}`);
    });

    /**
     * If a profile directory was specified, make sure it exists and
     * check for default files.
     */
    if (this.profilePath) {
      fs.mkdirSync(this.profilePath, {
        recursive: true
      });
      checkDefaultFiles();
    }

    /**
     * Overrides the dialogs to prevent the app from crashing when the
     * user cancels a file dialog.
     */
    this.overrideDialogs();

    // Sets up the profile and webapps locations.
    this.setupProfileLocations();

    // Registers custom protocols.
    this.registerProtocols();

    // Waits for the app to be ready before continuing.
    app.whenReady().then(this.whenReady.bind(this));

    /**
     * Registers event listeners for when all windows are closed and when
     * the app is activated (e.g. the user clicks on the dock icon).
     */
    app.on('window-all-closed', this.allWindowsClosed.bind(this));
    app.on('activate', this.activateApp.bind(this));
  },

  /**
   * Event handler for when all windows are closed. On macOS, we don't quit
   * the app when all windows are closed because it is common for apps and their
   * menu bar to stay active until the user quits explicitly with Cmd + Q.
   */
  allWindowsClosed: function () {
    if (process.platform !== 'darwin') {
      // Quit when all windows are closed, except on macOS. There, it's common
      // for applications and their menu bar to stay active until the user quits
      // explicitly with Cmd + Q.
      app.quit();
    }
  },

  /**
   * Event handler for when the app is activated (e.g. the user clicks on the
   * dock icon). If there are no open windows, this method will launch a
   * new instance of the app.
   */
  activateApp: function () {
    // If there are no open windows, launch a new instance of the app.
    if (BrowserWindow.getAllWindows().length === 0) {
      Main.relaunch();
    }
  },

  /**
   * Relaunches the app. This is typically called from the dock or taskbar
   * on macOS or Linux when the user clicks on the app's icon.
   */
  relaunch: function () {
    // Relaunch the app. This will create a new instance of the app and
    // close the current instance.
    OrchidUI.init();
  },

  /**
   * This function is called when the app is ready. It is responsible for
   * starting the protocol routing, initializing the webapps, and launching
   * the app's UI.
   */
  whenReady: function () {
    this.startProtocolRouting();

    webapps(app);
    OrchidUI.init();
  },

  /**
   * Parses the launch options from the command line.
   *
   * The launch options are in the format of `--key value` or `-k value`.
   * This function extracts the key and value and stores it in
   * `this.launchOptions`.
   */
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

  /**
   * Set up the command line arguments for the app.
   *
   * The following arguments are currently supported:
   *
   *   --enable-features=<feature_name>
   *
   * This is used to enable Chromium features that are not enabled by default.
   *
   * The available features are documented in the Chromium source code:
   *
   *   https://cs.chromium.org/chromium/src/chrome/common/features.cc
   */
  setupCommandLine: function () {
    app.commandLine.appendSwitch('enable-features', 'MemorySavings');
    app.commandLine.appendSwitch('enable-features', 'AutomaticTabDiscarding');
  },

  /**
   * Set up the paths for the app's user data directory.
   *
   * The following paths are set:
   *
   *   appData
   *   userData
   *   sessionData
   *   temp
   *   desktop
   *   documents
   *   downloads
   *   music
   *   pictures
   *   videos
   *   logs
   *   cache
   *   crashDumps
   *
   * These are used by Electron to store user data and other application
   * data. See the following documentation for more information:
   *
   *   https://www.electronjs.org/docs/api/app#appsetpathname-path
   */
  setupProfileLocations: function () {
    if (!this.profilePath || !this.storagePath) {
      throw new Error('Unspecified profile path');
    }

    /**
     * The directory where the application's configuration files are stored.
     *
     * On macOS this is `~/Library/Application Support/<app name>`.
     * On Windows this is `%APPDATA%/<app name>`.
     * On Linux this is `~/.config/<app name>`.
     */
    app.setPath('appData', path.resolve(this.profilePath));
    app.setPath('userData', path.resolve(this.profilePath));
    /**
     * The directory where the app's session data will be stored.
     *
     * This directory is DELETED when the app is closed.
     */
    app.setPath('sessionData', path.resolve(this.profilePath));
    // The directory where temporary files are stored.
    app.setPath('temp', path.join(path.resolve(this.profilePath), 'temp'));
    // The directory where the app's desktop files are stored.
    app.setPath('desktop', path.join(path.resolve(this.storagePath), 'Desktop'));
    // The directory where the app's documents are stored.
    app.setPath('documents', path.join(path.resolve(this.storagePath), 'Documents'));
    // The directory where the app's downloads are stored.
    app.setPath('downloads', path.join(path.resolve(this.storagePath), 'Downloads'));
    // The directory where the app's music is stored.
    app.setPath('music', path.join(path.resolve(this.storagePath), 'Music'));
    // The directory where the app's pictures are stored.
    app.setPath('pictures', path.join(path.resolve(this.storagePath), 'Pictures'));
    // The directory where the app's videos are stored.
    app.setPath('videos', path.join(path.resolve(this.storagePath), 'Videos'));
    // The directory where the app's logs are stored.
    app.setPath('logs', path.join(path.resolve(this.profilePath), 'logs'));
    /**
     * The directory where the app's caches are stored.
     *
     * This directory is DELETED when the app is updated.
     */
    app.setPath('cache', path.join(path.resolve(this.profilePath), 'cache'));
    /**
     * The directory where the app's crash dumps are stored.
     *
     * This directory is DELETED when the app is uninstalled.
     */
    app.setPath('crashDumps', path.join(path.resolve(this.profilePath), 'crash-dumps'));
  },

  /**
   * Prepares the path to the user's Orchid profile directory.
   *
   * This directory is used to store persistent application data
   * (such as the app's configuration and cache).
   *
   * The default path is:
   *
   * - On Windows: `%APPDATA%\Orchid\OrchidUI`
   * - On macOS: `${os.homedir()}/Library/Application Support/OrchidUI`
   * - On Linux and other unix-like systems: `${os.homedir()}/.orchid`
   *
   * If the `ORCHID_PROFILE` environment variable is set, its value is used as
   * the profile path.
   */
  prepareProfilePaths: function () {
    switch (process.platform) {
      case 'win32':
        this.profilePath = '%APPDATA%\\Orchid\\OrchidUI'; // %APPDATA% resolves to C:\Users\<username>\AppData\Roaming
        break;

      case 'darwin':
        this.profilePath = `${os.homedir()}/Library/Application Support/OrchidUI`; // macOS
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        this.profilePath = `${os.homedir()}/.orchid`; // Linux, FreeBSD, Android
        break;

      default:
        this.profilePath = process.env.ORCHID_PROFILE;
        break;
    }
  },

  /**
   * Prepares the path to the user's Orchid webapps directory.
   *
   * This directory is used to store installed webapps.
   *
   * The default path is:
   *
   * - On Windows: `%APPDATA%\Orchid\Orchid Apps`
   * - On macOS: `${os.homedir()}/Library/Application Support/Orchid Apps`
   * - On Linux and other unix-like systems:
   *   - If the user is running as root: `/usr/local/webapps`
   *   - Otherwise: `${os.homedir()}/.webapps`
   *
   * If the `ORCHID_WEBAPPS` environment variable is set, its value is used as
   * the webapps path.
   */
  prepareWebappsPaths: function () {
    switch (process.platform) {
      case 'win32':
        this.webappsPath = '%APPDATA%\\Orchid\\Orchid Apps'; // %APPDATA% resolves to C:\Users\<username>\AppData\Roaming
        break;

      case 'darwin':
        this.webappsPath = `${os.homedir()}/Library/Application Support/Orchid Apps`; // macOS
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        if (this.isRunningAsRoot) {
          this.webappsPath = '/usr/local/webapps'; // Linux, FreeBSD, Android, root
        } else {
          this.webappsPath = `${os.homedir()}/.webapps`; // Linux, FreeBSD, Android, not root
        }
        break;

      default:
        this.webappsPath = process.env.ORCHID_WEBAPPS;
        break;
    }
  },

  /**
   * Prepares the path to the user's Orchid webapps configuration file.
   *
   * This file is used to store information about the user's installed webapps.
   *
   * The default path is:
   *
   * - On Windows: `%APPDATA%\Orchid\OrchidInstalledApps.json`
   * - On macOS: `${os.homedir()}/Library/Application Support/OrchidInstalledApps.json`
   * - On Linux and other unix-like systems:
   *   - If the user is running as root: `/usr/local/webapps.metadata`
   *   - Otherwise: `${os.homedir()}/.installed_webapps`
   *
   * If the `ORCHID_WEBAPPS` environment variable is set, its value is used as
   * the webapps path.
   */
  prepareWebappsConfigPaths: function () {
    // eslint-disable-line func-names
    switch (process.platform) {
      case 'win32':
        this.webappsConfigPath = '%APPDATA%\\Orchid\\OrchidInstalledApps.json'; // %APPDATA% resolves to C:\Users\<username>\AppData\Roaming
        break;

      case 'darwin':
        this.webappsConfigPath = `${os.homedir()}/Library/Application Support/OrchidInstalledApps.json`; // macOS
        break;

      case 'linux':
      case 'freebsd':
      case 'android':
        if (this.isRunningAsRoot) {
          this.webappsConfigPath = '/usr/local/webapps.metadata'; // Linux, FreeBSD, Android, root
        } else {
          this.webappsConfigPath = `${os.homedir()}/.installed_webapps`; // Linux, FreeBSD, Android, not root
        }
        break;

      default:
        this.webappsConfigPath = process.env.ORCHID_WEBAPPS;
        break;
    }
  },

  /**
   * Prepares the path to the user's Orchid storage directory.
   *
   * This directory is used to store user data and Orchid webapps.
   *
   * The default path is:
   *
   * - On Windows: `%USERPROFILE%\Documents`
   * - On macOS and other unix-like systems: `$HOME`
   *
   * If the `ORCHID_STORAGE` environment variable is set, its value is used as
   * the storage path.
   */
  prepareStoragePaths: function () {
    switch (process.platform) {
      case 'win32':
        this.storagePath = `${os.homedir()}/Documents`; // %USERPROFILE% resolves to C:\Users\<username>
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

  /**
   * Overrides the Electron dialog.showErrorBox function to use console.error
   * instead of a native dialog.
   *
   * The reason for doing this is that native dialogs are not possible in
   * Electron on some platforms, and it's better to use a fallback that
   * doesn't block the user from using the app.
   *
   * This function replaces the dialog.showErrorBox function with one that
   * outputs the error to the console (using console.error) instead of
   * displaying a dialog.
   */
  overrideDialogs: function () {
    /**
     * Logs an error message to the console.
     *
     * @param title The title of the error dialog.
     * @param content The content of the error dialog.
     */
    dialog.showErrorBox = function (title: string, content: string) {
      /**
       * Logs an error message to the console.
       *
       * @param message The message to log.
       */
      function logError(message: string) {
        console.error(message);
      }

      logError(`${title}\n${content}`);
    };
  },

  /**
   * Registers the 'orchid' and 'orchid-reader' protocols.
   *
   * The 'orchid' protocol is the protocol used to launch an Orchid activity from
   * another application. The 'orchid-reader' protocol is used to open a file in
   * the Orchid reader.
   *
   * The `privileges` option is used to specify that the app can handle both
   * secure and unsecured requests, and that the app can use the `fetch` API to
   * handle the requests.
   */
  registerProtocols: function () {
    app.setAsDefaultProtocolClient('orchid-activity');
    protocol.registerSchemesAsPrivileged([
      {
        scheme: 'orchid',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: true
        }
      },
      {
        scheme: 'orchid-reader',
        privileges: {
          standard: true,
          secure: true,
          supportFetchAPI: false
        }
      }
    ]);
  },

  /**
   * Starts the protocol routing for the 'orchid' and 'orchid-reader' protocols.
   *
   * The 'orchid' protocol is used to handle requests for files in the Orchid
   * internal folder. The 'orchid-reader' protocol is used to open a file in
   * the Orchid reader.
   */
  startProtocolRouting: function () {
    protocol.registerFileProtocol('orchid', this.handleOrchidProtocol.bind(this));
    protocol.handle('orchid-reader', this.handleOrchidReaderProtocol.bind(this));
  },

  /**
   * Handles 'orchid' protocol requests.
   *
   * This function is called by Electron when a request is made to the
   * 'orchid' protocol. It checks if the requested URL is a directory and
   * appends 'index.html' if it is. It then returns the file path to the
   * Electron callback function.
   *
   * @param request The request that was made to the 'orchid' protocol.
   * @param callback The callback function to call with the file path.
   */
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

  /**
   * Handles 'orchid-reader' protocol requests.
   *
   * This function is called by Electron when a request is made to the
   * 'orchid-reader' protocol. It returns a promise that resolves to the file
   * contents of the internal 'readermode.html' file.
   *
   * @param request The request that was made to the 'orchid-reader' protocol.
   * @returns A promise that resolves to the file contents of
   *          'readermode.html'.
   */
  handleOrchidReaderProtocol: function (request: Request) {
    const filePath = path.join(__dirname, '..', '..', 'internal', 'readermode.html');
    return net.fetch(`file://${pathToFileURL(filePath).toString()}`);
  }
};

Main.init();

export default Main;
