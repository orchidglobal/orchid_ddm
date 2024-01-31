import { ipcRenderer } from 'electron';
import fs from 'fs';
import path from 'path';
import Renderer from '../renderer';

const memorySettings = {} as any;

const Settings = {
  getValue: function (name: string, settingsFile: string = 'settings.json'): Promise<any> {
    if (memorySettings[name]) {
      return Promise.resolve(memorySettings[name]);
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
          console.error(parseError);
          reject(parseError);
        }
      });
    });
  },

  setValue: function (name: string, value: any, settingsFile: string = 'settings.json') {
    if (!Renderer.profilePath) {
      throw new Error('Unspecified profile path');
    }

    memorySettings[name] = value;
    const settingsFilePath = path.join(Renderer.profilePath, settingsFile);
    fs.readFile(settingsFilePath, (error: NodeJS.ErrnoException | null, data: Buffer) => {
      if (error) {
        console.error(error);
        return;
      }
      try {
        const settings = JSON.parse(data.toString());
        settings[name] = value;
        const mergedSettings = Object.assign(settings, memorySettings);
        const updatedSettings = JSON.stringify(mergedSettings, null, 2);

        // Ensure the directory exists before writing the file
        const settingsDir = path.dirname(settingsFilePath);
        fs.mkdirSync(settingsDir, {
          recursive: true
        });
        fs.writeFile(settingsFilePath, updatedSettings, (writeError: NodeJS.ErrnoException | null) => {
          if (writeError) {
            console.error(writeError);
            return;
          }
          ipcRenderer.emit('settingschange', { name, [name]: value });
          ipcRenderer.send('settingschange', { name, [name]: value });
        });
      } catch (parseError) {
        console.error(parseError);
      }
    });
  },

  addObserver: function (name: string, callback: Function) {
    ipcRenderer.on('settingschange', (event, data) => {
      Settings.getValue(name).then((data) => {
        callback(data);
      });
      if (data && data[name]) {
        callback(data[name]);
      }
    });
  }
};

export default Settings;
