import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import Renderer from '../renderer';

const memorySettings = {} as any;
let writeInterval: NodeJS.Timeout | null = null;
const WRITE_INTERVAL = 300000; // 5 minutes in milliseconds

const Settings = {
  getValue: function (name: string, settingsFile: string = 'settings.json'): Promise<any> {
    if (memorySettings[settingsFile] && memorySettings[settingsFile][name]) {
      return Promise.resolve(memorySettings[settingsFile] && memorySettings[settingsFile][name]);
    }
    return new Promise((resolve, reject) => {
      if (!Renderer.profilePath) {
        throw new Error('Unspecified profile path');
      }

      fs.readFile(path.join(Renderer.profilePath, settingsFile), (error: NodeJS.ErrnoException | null, data: Buffer) => {
        if (error) {
          console.error(error);
          reject(error);
          return;
        }
        try {
          const settings = JSON.parse(data.toString());
          resolve(settings[name]);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  },

  setValue: function (name: string, value: any, settingsFile: string = 'settings.json') {
    if (!Renderer.profilePath) {
      throw new Error('Unspecified profile path');
    }

    if (!memorySettings[settingsFile]) {
      memorySettings[settingsFile] = {};
    }
    memorySettings[settingsFile][name] = value;

    if (!writeInterval) {
      writeInterval = setInterval(() => {
        saveSettingsToFile(settingsFile);
      }, WRITE_INTERVAL);
    }

    ipcRenderer.emit('settings-updated', { name, [name]: value });
    ipcRenderer.send('settings-updated', { name, [name]: value });
  },

  addObserver: function (name: string, callback: Function, settingsFile: string = 'settings.json') {
    ipcRenderer.on('settings-updated', (event, data) => {
      if (data && data[name]) {
        callback(data[name]);

        if (!memorySettings[settingsFile]) {
          memorySettings[settingsFile] = {};
        }
        memorySettings[settingsFile][name] = data[name];
      } else {
        Settings.getValue(name).then((data) => {
          callback(data);

          if (!memorySettings[settingsFile]) {
            memorySettings[settingsFile] = {};
          }
          memorySettings[settingsFile][name] = data;
        });
      }
    });
  }
};

function saveSettingsToFile(settingsFile: string) {
  fs.readFile(path.join(Renderer.profilePath as string, settingsFile), (error: NodeJS.ErrnoException | null, data: Buffer) => {
    if (error) {
      console.error(error);
      return;
    }

    const settings = JSON.parse(data.toString());
    const settingsFilePath = path.join(Renderer.profilePath as string, settingsFile);
    fs.writeFile(settingsFilePath, JSON.stringify(Object.assign(settings, memorySettings[settingsFile] || {}), null, 2), (writeError: NodeJS.ErrnoException | null) => {
      if (writeError) {
        console.error(writeError);
      }
    });
  });
}

// Listen for beforeunload event on window to save settings before window is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (writeInterval) {
      clearInterval(writeInterval);
      writeInterval = null;
      saveSettingsToFile('settings.json');
    }
  });
}

export default Settings;
