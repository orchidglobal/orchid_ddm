import { ipcMain, app, webContents, autoUpdater } from 'electron';
import Settings from '../settings';
import colors from './terminal_colors';
import OrchidUI from './orchidui';

const DEBUG = false;

export default (function () {
  if (!OrchidUI.window) {
    throw new Error('Window not found');
  }

  OrchidUI.window.webContents.on('render-process-gone', () => {
    console.log('renderer process crashed'); // this will be called
  });

  OrchidUI.window.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.resourceType === 'mainFrame') {
      Settings.getValue('privacy.do_not_track.enabled').then((value) => {
        if (details.requestHeaders.DNT !== value) {
          details.requestHeaders.DNT = value;
        }
      });
    }

    const data = { cancel: false, requestHeaders: details.requestHeaders };
    callback(data);
  });

  // Intercept download requests using the webContents' session
  OrchidUI.window.webContents.session.on('will-download', (event, item, webContents) => {
    // Send an event to the renderer process to get download path and decision
    OrchidUI.window?.webContents.send('downloadrequest', {
      url: item.getURL(),
      suggestedFilename: item.getFilename(),
      lastModified: item.getLastModifiedTime(),
      size: item.getTotalBytes(),
      mime: item.getMimeType()
    });

    // Listen for the response from the renderer process
    ipcMain.once('download-response', (event, downloadData) => {
      if (downloadData.shouldDownload) {
        // Set the download path and start the download
        item.setSavePath(downloadData.path);
      } else {
        // Cancel the download
        item.cancel();
      }
    });

    // Listen for download progress events
    item.on('updated', (event, state) => {
      const progress = item.getReceivedBytes() / item.getTotalBytes();
      OrchidUI.window?.webContents.send('downloadprogress', {
        url: item.getURL(),
        suggestedFilename: item.getFilename(),
        lastModified: item.getLastModifiedTime(),
        size: item.getTotalBytes(),
        mime: item.getMimeType(),
        progress,
        state
      });
    });
  });

  OrchidUI.window.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    OrchidUI.window?.webContents.send('permissionrequest', {
      type: permission,
      origin: webContents.getURL(),
      title: webContents.getTitle()
    });
    ipcMain.once('permission-request', (event, data) => {
      callback(data.decision);
    });
  });

  // window.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
  //   const object = { video: request.frame };
  //   callback(object);
  // });

  autoUpdater
    .on('update-available', () => {
      if (DEBUG) {
        console.log(`[openorchid-update] ${colors.blue}Found a update available...`);
      }
      OrchidUI.window?.webContents.send('update-available');
    });
  autoUpdater.on('update-downloaded', () => {
    if (DEBUG) {
      console.log(`[openorchid-update] ${colors.blue}Update downloaded...`);
    }
    OrchidUI.window?.webContents.send('update-downloaded');
  });

  setInterval(() => {
    if (DEBUG) {
      console.log(`[openorchid-update] ${colors.blue}Checking updates...${colors.reset}`);
    }
    autoUpdater.checkForUpdates();
  }, 60 * 1000);
  ipcMain.on('request-update-status', (event) => {
    if (DEBUG) {
      console.log(`[openorchid-update] ${colors.blue}Checking updates...${colors.reset}`);
    }
    event.sender.send('update-status', autoUpdater.checkForUpdates());
  });

  ipcMain.on('close', (event, data) => {
    OrchidUI.window?.close();
  });
  ipcMain.on('maximize', (event, data) => {
    if (OrchidUI.window?.isMaximized()) {
      OrchidUI.window?.unmaximize();
    } else {
      OrchidUI.window?.maximize();
    }
  });
  ipcMain.on('minimize', (event, data) => {
    if (OrchidUI.window?.isMinimized()) {
      OrchidUI.window?.restore();
    } else {
      OrchidUI.window?.minimize();
    }
  });

  OrchidUI.window.on('maximize', () => {
    OrchidUI.window?.webContents.send('maximized');
  });
  OrchidUI.window.on('unmaximize', () => {
    OrchidUI.window?.webContents.send('unmaximized');
  });

  ipcMain.on('message', (event, data) => {
    if (DEBUG) {
      console.log(
        `[openorchid-events] ${colors.magenta}message${colors.reset} ${colors.yellow}${JSON.stringify(data)}${
          colors.reset
        }`
      );
    }
    OrchidUI.window?.webContents.send('message', data);
  });
  ipcMain.on('messagebox', (event, data) => {
    if (DEBUG) {
      console.log(
        `[openorchid-events] ${colors.magenta}messagebox${colors.reset} ${colors.yellow}${JSON.stringify(data)}${
          colors.reset
        }`
      );
    }
    OrchidUI.window?.webContents.send('messagebox', data);
  });
  ipcMain.on('openfile', (event, data) => {
    OrchidUI.window?.webContents.send('openfile', data);
  });
  ipcMain.on('savefile', (event, data) => {
    OrchidUI.window?.webContents.send('savefile', data);
  });
  ipcMain.on('shutdown', (event, data) => {
    app.quit();
  });
  ipcMain.on('restart', (event, data) => {
    app.relaunch();
    app.quit();
  });
  ipcMain.on('powerstart', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}powerstart${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('powerstart', data);
  });
  ipcMain.on('powerend', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}powerend${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('powerend', data);
  });
  ipcMain.on('volumeup', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}volumeup${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('volumeup', data);
  });
  ipcMain.on('volumedown', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}volumedown${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('volumedown', data);
  });
  ipcMain.on('shortcut', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}shortcut${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('shortcut', data);
  });
  ipcMain.on('input', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}input${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.sendInputEvent(data);
  });
  ipcMain.on('rotate', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}rotate${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('rotate', data);
  });
  ipcMain.on('mediaplay', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}mediaplay${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('mediaplay', data);
  });
  ipcMain.on('mediapause', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}mediapause${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('mediapause', data);
  });
  ipcMain.on('webdrag', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}webdrag${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('webdrag', data);
  });
  ipcMain.on('webdrop', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}webdrop${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('webdrop', data);
  });
  ipcMain.on('devicepickup', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}devicepickup${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('devicepickup', data);
  });
  ipcMain.on('deviceputdown', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}deviceputdown${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('deviceputdown', data);
  });
  ipcMain.on('settingschange', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}settingschange${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('settingschange', data);
  });
  ipcMain.on('mediadevicechange', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}mediadevicechange${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('mediadevicechange', data);
  });
  ipcMain.on('narrate', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}narrate${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('narrate', data);
  });
  ipcMain.on('screenshot', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}screenshot${colors.reset} ${JSON.stringify(data)}`);
    }
    if (data.webContentsId) {
      const wc = webContents.fromId(data.webContentsId);
      wc?.capturePage().then((image) => {
        event.sender.send('screenshotted', {
          webContentsId: data.webContentsId,
          imageDataURL: image.toDataURL()
        });
      });
    } else {
      OrchidUI.window?.webContents.capturePage().then((image) => {
        event.sender.send('screenshotted', {
          webContentsId: data.webContentsId,
          imageDataURL: image.toDataURL()
        });
      });
    }
  });

  ipcMain.on('requestlogin', (event, data) => {
    if (DEBUG) {
      console.log(`[openorchid-events] ${colors.magenta}requestlogin${colors.reset} ${JSON.stringify(data)}`);
    }
    OrchidUI.window?.webContents.send('requestlogin', data);
  });
});
