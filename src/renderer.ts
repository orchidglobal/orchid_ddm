import os from 'os';

import dotenv from 'dotenv';
dotenv.config();

export const Renderer = {
  DEBUG: (process.env.ORCHID_ENVIRONMENT === 'development'),

  profilePath: undefined as string | undefined,
  webappsPath: undefined as string | undefined,
  webappsConfigPath: undefined as string | undefined,
  storagePath: undefined as string | undefined,

  isRunningAsRoot: undefined as boolean | undefined,

  init: function () {
    this.isRunningAsRoot = process.geteuid && process.geteuid() === 0;

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
  }
};

Renderer.init();

export default Renderer;
