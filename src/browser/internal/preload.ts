'use strict';

import { ipcRenderer, contextBridge, IpcRendererEvent } from 'electron';
import permissions from '../../permissions';
import WifiManager from '../../wifi';
import Bluetooth2 from '../../bluetooth';
import SDCardManager from '../../storage';
import TimeManager from '../../time';
import Settings from '../../settings';
import AppsManager from '../../webapps';
import ChildProcess from '../../child-process';
import VirtualManager from '../../virtual';
import PowerManager from '../../power';
import RtlsdrReciever from '../../rtlsdr';
import UsersManager from '../../users';
import TelephonyManager from '../../telephony';
import DisplayManager from '../../display';
import SmsManager from '../../sms';
import WebManager from '../../web';
import DeviceInformation from '../../misc/device_info';
import UpdateManager from '../../update';
// import Translator from '../../misc/translator.mjs';
import appConfig from '../../../package.json';

import dotenv from 'dotenv';
dotenv.config();

// import initPrivacyIndicators from './modules/privacy_indicators';
// import initInputs from './modules/seekbars_and_switches';
// import initVideos from './modules/videoplayer';
// import initPIP from './modules/picture_in_picture';
// import initVisibility from './modules/visibility_state';
import OrchidNotification from './vanilla/notifications';
import ModalDialogs from './vanilla/modal_dialogs';
import Narrator from './modules/narrator';
import SettingsHandler from './modules/settings_handler';
import MediaPlayback from './modules/media_playback';
import WebviewHandler from './modules/webview_handler';
import Keybinds from './modules/keybinds';
import Keyboard from './modules/keyboard';

const Environment = {
  type: process.env.ORCHID_ENVIRONMENT,
  debugPort: process.debugPort,
  currentDir: process.cwd(),
  dirName: () => __dirname,
  version: appConfig.version,
  engineVersion: process.versions.chrome,
  argv: process.argv,
  argv0: process.argv0,
  platform: process.platform,
  arch: process.arch,
  execArgv: process.execArgv,
  execPath: process.execPath
};

const IPC = {
  send: ipcRenderer.send,
  sendToHost: ipcRenderer.sendToHost,
  sendSync: ipcRenderer.sendSync
};

const InternalPreload = {
  isMouseDown: false,
  isEventPending: false,

  init: function () {
    this.setupEventListeners();
    this.setupJavascriptAPIs();

    ipcRenderer.send('mediadevicechange', {});

    this.createOverrideAPIs();

    document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this));

    ['pointerup', 'keydown', 'wheel'].forEach((eventType) => {
      document.addEventListener(eventType, () => {
        this.updateTextSelection();
      });
    });
  },

  setupEventListeners: function () {
    let eventRegistery = new Map();

    eventRegistery.set('message', 'ipc-message');
    eventRegistery.set('shutdown', 'shutdown');
    eventRegistery.set('restart', 'restart');
    eventRegistery.set('powerstart', 'powerstart');
    eventRegistery.set('powerend', 'powerend');
    eventRegistery.set('volumeup', 'volumeup');
    eventRegistery.set('volumedown', 'volumedown');
    eventRegistery.set('shortcut', 'shortcut');
    eventRegistery.set('mediaplay', 'mediaplay');
    eventRegistery.set('mediapause', 'mediapause');
    eventRegistery.set('mediadevicechange', 'mediadevicechange');
    eventRegistery.set('downloadrequest', 'downloadrequest');
    eventRegistery.set('downloadprogress', 'downloadprogress');
    eventRegistery.set('permissionrequest', 'permissionrequest');
    eventRegistery.set('screenshotted', 'screenshotted');
    eventRegistery.set('narrate', 'narrate');
    eventRegistery.set('update-available', 'update-available');
    eventRegistery.set('update-download-progress', 'update-download-progress');
    eventRegistery.set('update-downloaded', 'update-downloaded');

    for (const [key, value] of eventRegistery) {
      this.registerEvent(key, value);
    }
    eventRegistery.clear();
  },

  registerEvent: function (ipcName: string, windowName: string) {
    ipcRenderer.on(ipcName, (event: IpcRendererEvent, data: any) => {
      const customEvent = new CustomEvent(windowName, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(customEvent);
    });
  },

  setupJavascriptAPIs: function () {
    let apiRegistery = {} as any;

    apiRegistery.environment = ['Environment', Environment];
    apiRegistery.ipc = ['IPC', IPC];
    apiRegistery['device-info'] = ['DeviceInformation', DeviceInformation];
    apiRegistery['wifi-manage'] = ['WifiManager', WifiManager];
    apiRegistery.bluetooth = ['Bluetooth2', Bluetooth2];
    apiRegistery.settings = ['Settings', Settings];
    apiRegistery.storage = ['SDCardManager', SDCardManager];
    apiRegistery['webapps-manage'] = ['AppsManager', AppsManager];
    apiRegistery.time = ['TimeManager', TimeManager];
    apiRegistery.virtualization = ['VirtualManager', VirtualManager];
    apiRegistery['child-process'] = ['ChildProcess', ChildProcess];
    apiRegistery.power = ['PowerManager', PowerManager];
    apiRegistery['fm-radio'] = ['RtlsdrReciever', RtlsdrReciever];
    apiRegistery.users = ['UsersManager', UsersManager];
    apiRegistery.telephony = ['TelephonyManager', TelephonyManager];
    apiRegistery.display = ['DisplayManager', DisplayManager];
    apiRegistery.sms = ['SmsManager', SmsManager];
    apiRegistery['tasks-manage'] = ['WebManager', WebManager];
    apiRegistery.update = ['UpdateManager', UpdateManager];
    // apiRegistery.translate = ['Translator', Translator];

    let apiEntries = Object.entries(apiRegistery);
    for (let i = 0, length = apiEntries.length; i < length; i++) {
      const [key, value] = apiEntries[i];
      this.verifyAccess(key, value as any);
    }
    apiEntries = [];
    apiRegistery = {};
  },

  verifyAccess: function (permission: string, value: [string, any]) {
    const result = permissions.checkPermission(permission);
    if (result) {
      contextBridge.exposeInMainWorld(value[0], value[1]);
    }
  },

  createOverrideAPIs: function () {
    const getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    contextBridge.exposeInMainWorld('sessionOverride', {
      open: (url: string, options: Record<string, any>) => {
        ipcRenderer.send('message', {
          type: 'window',
          origin: location.origin,
          url,
          options
        });
      },

      Notification: OrchidNotification,

      alert: ModalDialogs.alert,
      confirm: ModalDialogs.confirm,
      prompt: ModalDialogs.prompt,

      getUserMedia: async function (constraints: any) {
        ipcRenderer.send('mediadevicechange', constraints);
        const stream = await getUserMedia(constraints);

        stream.addEventListener('inactive', () => {
          ipcRenderer.send('mediadevicechange', {});
        });

        return stream;
      }
    });
  },

  handleDOMContentLoaded: function () {
    Narrator.init();
    SettingsHandler.init();
    MediaPlayback.init();
    WebviewHandler.init();
    Keybinds.init();
    Keyboard.init();

    const scrollingElement = document.scrollingElement;
    document.addEventListener('scroll', () => {
      ipcRenderer.sendToHost('scroll', {
        left: scrollingElement?.scrollLeft,
        top: scrollingElement?.scrollTop
      });
    });
  },

  updateTextSelection: function () {
    const selectedText = window.getSelection()?.toString();

    if (selectedText && selectedText.length > 0) {
      const selectedRange = window.getSelection()?.getRangeAt(0);
      const boundingRect = selectedRange?.getBoundingClientRect();

      const position = {
        top: boundingRect?.top,
        left: boundingRect?.left
      };

      const size = {
        width: boundingRect?.width,
        height: boundingRect?.height
      };

      // Call your function with the provided arguments
      ipcRenderer.send('message', {
        type: 'textselection',
        action: 'show',
        position,
        size,
        selectedText
      });
    } else {
      ipcRenderer.send('message', {
        type: 'textselection',
        action: 'hide'
      });
    }
  },

  onMouseDown: function () {
    this.isMouseDown = true;
  },

  onMouseOver: function (event: MouseEvent) {
    if (deviceType && deviceType !== 'desktop') {
      return;
    }
    const targetElement = event.target as HTMLElement;

    if (targetElement && targetElement.nodeName !== 'WEBVIEW' && targetElement.getAttribute('title')) {
      if (!this.isMouseDown && !this.isEventPending) {
        this.isEventPending = true;

        ipcRenderer.send('message', {
          type: 'title',
          action: 'show',
          originType: location.origin.includes(`system.localhost:${location.port}`) ? 'system' : 'webapp',
          position: {
            left: event.clientX,
            top: event.clientY
          },
          title: targetElement.getAttribute('title') || ''
        });

        requestAnimationFrame(() => {
          this.isEventPending = false;
        });
      }
    } else {
      ipcRenderer.send('message', {
        type: 'title',
        action: 'hide'
      });
    }
  },

  onMouseUp: function () {
    this.isMouseDown = false;
  }
};

InternalPreload.init();
