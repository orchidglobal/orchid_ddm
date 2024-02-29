import AdmZip from 'adm-zip';
import fs, { PathLike } from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import Settings from '../settings';
import Renderer from '../renderer';
import download from 'download';

type ManifestUrls = {
  [key: string]: string;
};

const AppsManager = {
  getAll: function (): Promise<Record<string, any>[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let appListData = fs.readFileSync(path.resolve(Renderer.webappsConfigPath as string), 'utf8');
        let appListJson = JSON.parse(appListData);
        const currentLanguage = await Settings.getValue('general.lang.code');

        for (let index = 0, length = appListJson.length; index < length; index++) {
          const app = appListJson[index];
          let langCode;
          try {
            langCode = currentLanguage || 'en-US';
          } catch (error) {
            // If an error occurs, set a default value for langCode
            langCode = 'en-US';
          }

          let manifestUrl;
          if (app.manifestUrl[langCode]) {
            manifestUrl = app.manifestUrl[langCode];
          } else {
            manifestUrl = app.manifestUrl['en-US'];
          }

          let manifest;
          const xhr = new XMLHttpRequest();
          xhr.open("GET", manifestUrl, true);
          xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
              manifest = JSON.parse(xhr.responseText);

              if (!manifest.role) {
                manifest.role = 'webapp';
              }
              app.manifest = manifest;
              app.size = AppsManager.getFolderSize(path.join(path.resolve(Renderer.webappsPath as string), app.appId));

              if (index === appListJson.length - 1) {
                setTimeout(() => {
                  resolve(appListJson);
                }, 16);
              }
            }
          };
          xhr.send();
        }
      } catch (error) {
        console.error('Error reading app list:', error);
        console.log('Creating a new webapps configuration file.');

        const handleReaddir = (file: string) => {
          const appId = file || v4();
          const installedAt = new Date().toISOString();
          const manifestUrl = {
            'en-US': `http://${appId}.localhost:${location.port}/manifest.json`
          } as ManifestUrls;

          let webappAssets = fs.readdirSync(path.join(path.resolve(Renderer.webappsPath as string), file));
          for (let index = 0, length = webappAssets.length; index < length; index++) {
            const manifest = webappAssets[index];
            if (!manifest.startsWith('manifest.')) {
              continue;
            }
            if (manifest === 'manifest.json') {
              continue;
            }
            const langCode = manifest.split('.')[1];
            manifestUrl[langCode] = `http://${appId}.localhost:${location.port}/manifest.${langCode}.json`;
          }

          return { appId, installedAt, manifestUrl };
        };
        let appList = fs.readdirSync(path.resolve(Renderer.webappsPath as string)).map(handleReaddir.bind(this));

        AppsManager.writeAppList(appList);
        console.log(appList);
        setTimeout(() => {
          resolve(appList);
        }, 16);
      }
    });
  },

  writeAppList: function (appList: Record<string, any>[]) {
    try {
      let appListData = JSON.stringify(appList, null, 2);
      fs.writeFileSync(path.resolve(Renderer.webappsConfigPath as string), appListData, 'utf8');
    } catch (error) {
      console.error('Error writing app list:', error);
    }
  },

  installPackage: function (zipFilePath: string) {
    return new Promise((resolve, reject) => {
      const appId = v4();
      const appDir = path.join(path.resolve(Renderer.webappsPath as string), `{${appId}}`);

      AppsManager.getAll().then((appList: any) => {
        fs.mkdirSync(appDir, { recursive: true });

        try {
          const zip = new AdmZip(path.join(path.resolve(Renderer.storagePath as string), zipFilePath));
          zip.extractAllTo(appDir, true);

          const appEntry = {
            appId: `{${appId}}`,
            installedAt: new Date().toISOString(),
            manifestUrl: `http://{${appId}}.localhost:8081/manifest.json`
          };

          appList.push(appEntry);
          AppsManager.writeAppList(appList);

          resolve(appId);
        } catch (error) {
          console.error('Error extracting app:', error);
          reject(error);
        }
      });
    });
  },

  installPWA: function (manifestUrl: string) {
    return new Promise(async (resolve, reject) => {
      const appId = v4();
      const appDir = path.join(path.resolve(Renderer.webappsPath as string), `{${appId}}`);

      fs.mkdirSync(appDir, { recursive: true });
      await download(manifestUrl, appDir);

      const manifestData = fs.readFileSync(path.join(appDir, path.basename(manifestUrl)), { encoding: 'utf-8' });
      const manifestJson = JSON.parse(manifestData);

      if (typeof manifestJson.icons === 'object') {
        const entries = Object.entries(manifestJson.icons);
        for (let index = 0, length = entries.length; index < length; index++) {
          const entry = entries[index] as [string, string];

          const url = new URL(manifestUrl);
          const targetDir = path.dirname(path.join(appDir, entry[1]));
          fs.mkdirSync(targetDir, { recursive: true });
          await download(url.origin + entry[1], targetDir);
        }
      } else {
        for (let index = 0, length = manifestJson.icons.length; index < length; index++) {
          const icon = manifestJson.icons[index] as Record<string, any>;

          const url = new URL(manifestUrl);
          const targetDir = path.dirname(path.join(appDir, icon.src));
          fs.mkdirSync(targetDir, { recursive: true });
          await download((url.origin + '/' + icon.src).replaceAll('//', '/'), targetDir);
        }
      }

      AppsManager.getAll().then(async (appList: any) => {
        const url = new URL(manifestUrl);
        const appEntry = {
          appId: `{${appId}}`,
          installedAt: new Date().toISOString(),
          manifestUrl: `http://{${appId}}.localhost:8081/manifest.json`,
          origin: url.origin
        };

        appList.push(appEntry);
        AppsManager.writeAppList(appList);

        resolve(appId);
      });
    });
  },

  uninstall: async function (appId: string) {
    const appDir = path.join(path.resolve(Renderer.webappsPath as string), appId);
    const appList = await AppsManager.getAll();

    const updatedAppList = appList.filter((item) => item.appId !== appId);
    AppsManager.writeAppList(updatedAppList);

    fs.rmdirSync(appDir, { recursive: true });
  },

  getFolderSize: function (folderPath: string) {
    let totalSize = 0;

    function calculateSize(filePath: string) {
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        const nestedFiles = fs.readdirSync(filePath);

        nestedFiles.forEach((file) => {
          const nestedFilePath = path.join(filePath, file);
          calculateSize(nestedFilePath);
        });
      }
    }

    calculateSize(folderPath);

    // Convert the total size to a human-readable format (e.g., KB, MB, GB)
    const sizeInBytes = totalSize;
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size > 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    size = Math.round(size * 100) / 100; // Round to two decimal places

    return `${size} ${units[unitIndex]}`;
  }
};

export default AppsManager;
