import { webContents } from 'electron';

const WebManager = {
  clearHistory: function (webContentsId: number) {
    webContents.fromId(webContentsId)?.clearHistory();
  },

  forcefullyCrashRenderer: function (webContentsId: number) {
    webContents.fromId(webContentsId)?.forcefullyCrashRenderer();
  },

  getAllSharedWorkers: function (webContentsId: number) {
    webContents.fromId(webContentsId)?.getAllSharedWorkers();
  },

  getThrottle: function (webContentsId: number) {
    return webContents.fromId(webContentsId)?.getBackgroundThrottling();
  },

  setThrottle: function (webContentsId: number, enabled: boolean) {
    webContents.fromId(webContentsId)?.setBackgroundThrottling(enabled);
  }
};

export default WebManager;
