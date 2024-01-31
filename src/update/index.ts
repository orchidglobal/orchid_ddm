import { ipcRenderer } from 'electron';

const UpdateManager = {
  checkForUpdates: function () {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('request-update-status');
      ipcRenderer.on('update-status', (event, data) => {
        resolve(data);
      });
    });
  }
};

export default UpdateManager;
