import { ipcRenderer, IpcRendererEvent } from 'electron';
import brightness from 'node-brightness';
import Settings from '../settings';

const DisplayManager = {
  screenshot: function (id: number) {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('screenshot', { webContentsId: id });
      ipcRenderer.on('screenshotted', (event: IpcRendererEvent, data: any) => {
        if (data.webContentsId === id) {
          resolve(data.imageDataURL);
        }
      });
    });
  },

  getBrightness: async function () {
    return await Settings.getValue('video.brightness');
  },

  setBrightness: function (value: number) {
    brightness(value);
  }
};

export default DisplayManager;
