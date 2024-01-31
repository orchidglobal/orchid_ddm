import { ipcRenderer, IpcRendererEvent } from 'electron';

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
  }
};

export default DisplayManager;
