import fs, { PathLike } from 'fs';
import path from 'path';
import mime from 'mime';
import { ipcMain } from 'electron';
import Main from './main';

import dotenv from 'dotenv';
dotenv.config();

const SecurityChecker = {
  interval: 300,
  intervalId: null as any | null,

  checkManifestFile: function (filePath: PathLike): boolean {
    try {
      const manifestData = JSON.parse(fs.readFileSync(filePath).toString());

      if (
        !manifestData.name ||
        manifestData.name.trim() === '' ||
        (manifestData.developer &&
          (manifestData.developer.name.trim() === '' ||
            manifestData.developer.url.trim() === ''))
      ) {
        return true;
      }

      return false;
    } catch (error) {
      return false; // Ignore files with invalid JSON or missing 'manifest.json'
    }
  },

  findManifestFiles: function (dir: PathLike): string[] {
    let results: string[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir.toString(), file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const webappManifestFiles = this.findManifestFiles(filePath);
        results = [...results, ...webappManifestFiles];
      } else {
        if (mime.getType(filePath) === 'text/json') {
          results.push(filePath);
        }
      }
    }

    return results;
  },

  checkManifestSecurity: function () {
    const manifestFiles = this.findManifestFiles(path.resolve(Main.webappsPath as string));

    if (manifestFiles.length === 0) {
      console.log('No manifest.json files found in the webapps folder.');
      // Send an event to the Electron main process for security threat
      ipcMain.emit('security-threat', { filePath: '', type: 'malware' });
    } else {
      console.log(
        'Checking manifest.json files for blank names or developers:'
      );
      manifestFiles.forEach((filePath, index) => {
        if (this.checkManifestFile(filePath)) {
          console.log(
            `File ${index + 1}: ${filePath} has a blank name or developer.`
          );
          // Send an event to the Electron main process for security threat
          ipcMain.emit('security-threat', { filePath, type: 'unauthenticity' });
        }
      });
    }
  },

  start: function () {
    this.checkManifestSecurity();
    this.intervalId = setInterval(() => {
      this.checkManifestSecurity();
    }, this.interval * 1000);
  },

  stop: function () {
    clearInterval(this.intervalId);
  },

  changeInterval: function (newInterval: number) {
    if (newInterval > 30) {
      this.stop(); // Stop the current interval
      this.interval = newInterval; // Update the interval duration
      this.start(); // Start with the new interval
    }
  }
};

// Start the periodic check with the default interval
SecurityChecker.start();

// Example usage to change the interval to 2 minutes (120 seconds)
// securityChecker.changeInterval(120);

module.exports = SecurityChecker;
