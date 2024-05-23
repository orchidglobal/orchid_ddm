import fs from 'fs';
import path from 'path';
import http, { IncomingMessage } from 'http';
import AdmZip from 'adm-zip';
import express from 'express';
import mime from 'mime';
import os from 'os';
import { App } from 'electron';
import Main from '../main';

import WifiManager from '../wifi';
import Bluetooth2 from '../bluetooth';
import StorageManager from '../storage';
import TimeManager from '../time';
import Settings from '../settings';
import AppsManager from '../webapps';
import ChildProcess from '../child-process';
import VirtualManager from '../virtual';
import PowerManager from '../power';
import RtlsdrReciever from '../rtlsdr';
import UsersManager from '../users';
import TelephonyManager from '../telephony';
import SmsManager from '../sms';
import DeviceInformation from '../misc/device_info';

import colors from './terminal_colors';

const expressServer = express();

import dotenv from 'dotenv';
dotenv.config();

export default function (app: App) {
  if (!Main.webappsPath) {
    throw new Error('Webapps path not found');
  }

  const internalDir = path.join(__dirname, '..', '..', '..', 'internal');
  const files = fs.readdirSync(path.resolve(Main.webappsPath as string));

  files.forEach((dir: string) => {
    const localServer = http.createServer((req: IncomingMessage, res: any) => {
      if (!Main.webappsPath || !req.url) {
        throw new Error('Webapps path or request URL not found');
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      function sendRequest(data: any, contentType: string) {
        res.setHeader('Content-Type', contentType);
        res.writeHead(200);
        res.end(data);
      }

      const handleError = (error: NodeJS.ErrnoException | null) => {
        if (error) {
          res.writeHead(404);
          res.end('File not found');
          return;
        }
      };

      const host = req.headers.host || '';
      const subdomain = host.split('.')[0].replaceAll('__', '.');
      const cleanUrl = req.url.split('?')[0];
      let filePath: string;

      // Check if the request is meant for the shared directory
      if (cleanUrl.startsWith('/api/data')) {
        expressServer(req, res);
        return;
      } else if (cleanUrl.startsWith('/shared')) {
        if (Main.DEBUG) {
          filePath = path.join(process.cwd(), 'shared', cleanUrl.slice(8));
        } else {
          filePath = path.join(Main.webappsPath, 'shared', cleanUrl.slice(8));
        }

        fs.readFile(filePath, (err, data) => {
          const contentType = mime.getType(path.extname(filePath)) || '';
          handleError(err);
          sendRequest(data, contentType);
        });

        return;
      }

      // Handle internal requests
      if (!subdomain && cleanUrl) {
        filePath = path.join(internalDir, cleanUrl);

        fs.readFile(filePath, (error, data) => {
          const contentType = mime.getType(path.extname(filePath)) || '';
          handleError(error);
          sendRequest(data, contentType);
        });

        return;
      }

      // Handle webapp requests
      if (Main.DEBUG && subdomain === 'shared') {
        filePath = path.join(process.cwd(), subdomain, cleanUrl);
      } else {
        filePath = path.join(Main.webappsPath, subdomain, cleanUrl);
      }

      fs.readFile(filePath, (error, data) => {
        const contentType = mime.getType(path.extname(filePath)) || '';
        handleError(error);
        sendRequest(data, contentType);
      });
    });

    localServer.listen(9920, 'localhost', () => {
      console.log('Server running at http:\/\/*.localhost:9920');
    });

    app.on('will-quit', () => {
      localServer.close(() => {
        console.log(`Ending webapp runtime server for ${dir}...`);
      });
    });
  });
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Bluetooth
expressServer.get('/api/data/bluetooth/enable', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Bluetooth2.enable();
});
expressServer.get('/api/data/bluetooth/disable', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Bluetooth2.disable();
});
expressServer.get('/api/data/bluetooth/scan', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await Bluetooth2.scan(req.query.duration));
});
expressServer.get('/api/data/bluetooth/connect', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Bluetooth2.connect(req.query.id);
});
expressServer.get('/api/data/bluetooth/disconnect', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Bluetooth2.disconnect(req.query.id);
});

// Child Process
expressServer.get('/api/data/child_process/exec', (req: Request | any, res: Response | any) => {
  res.set(headers);
  ChildProcess.exec(req.query.cli, req.query.args);
});
expressServer.get('/api/data/child_process/spawn', (req: Request | any, res: Response | any) => {
  res.set(headers);
  ChildProcess.spawn(req.query.cli, req.query.args);
});

// Device Information
expressServer.get('/api/data/device_info/hwid', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(DeviceInformation.getHardwareId());
});
expressServer.get('/api/data/device_info/cpus', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(JSON.stringify(os.cpus()));
});
expressServer.get('/api/data/device_info/platform', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.platform());
});
expressServer.get('/api/data/device_info/name', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.version());
});
expressServer.get('/api/data/device_info/arch', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.machine());
});
expressServer.get('/api/data/device_info/endianness', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.endianness());
});
expressServer.get('/api/data/device_info/hostname', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.hostname());
});
expressServer.get('/api/data/device_info/freemem', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.freemem());
});
expressServer.get('/api/data/device_info/totalmem', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.totalmem());
});
expressServer.get('/api/data/device_info/uptime', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.uptime());
});
expressServer.get('/api/data/device_info/homedir', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.homedir());
});
expressServer.get('/api/data/device_info/tempdir', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(os.tmpdir());
});

// Power
expressServer.get('/api/data/power/shutdown', (req: Request | any, res: Response | any) => {
  res.set(headers);
  PowerManager.shutdown();
});
expressServer.get('/api/data/power/restart', (req: Request | any, res: Response | any) => {
  res.set(headers);
  PowerManager.restart();
});
expressServer.get('/api/data/power/sleep', (req: Request | any, res: Response | any) => {
  res.set(headers);
  PowerManager.sleep();
});

// Settings
expressServer.get('/api/data/settings/get', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await Settings.getValue(req.query.name));
});
expressServer.get('/api/data/settings/set', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Settings.setValue(req.query.name, req.query.value);
});
expressServer.get('/api/data/settings/observe', (req: Request | any, res: Response | any) => {
  res.set(headers);
  Settings.addObserver(req.query.name, (data: any) => {
    res.send(JSON.stringify(data));
  });
});

// Storage
expressServer.get('/api/data/storage/read', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await StorageManager.read(req.query.path));
});
expressServer.get('/api/data/storage/write', (req: Request | any, res: Response | any) => {
  res.set(headers);
  StorageManager.write(req.query.path, req.query.data);
});
expressServer.get('/api/data/storage/list', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await StorageManager.list(req.query.path));
});
expressServer.get('/api/data/storage/delete', (req: Request | any, res: Response | any) => {
  res.set(headers);
  StorageManager.delete(req.query.path);
});
expressServer.get('/api/data/storage/copy', (req: Request | any, res: Response | any) => {
  res.set(headers);
  StorageManager.copy(req.query.path, req.query.target);
});
expressServer.get('/api/data/storage/move', (req: Request | any, res: Response | any) => {
  res.set(headers);
  StorageManager.move(req.query.path, req.query.target);
});
expressServer.get('/api/data/storage/stats', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await StorageManager.getStats(req.query.path));
});
expressServer.get('/api/data/storage/mime', (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(StorageManager.getMime(req.query.path));
});

// Webapps
expressServer.get('/api/data/webapps/getall', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.send(await AppsManager.getAll());
});
expressServer.get('/api/data/webapps/install', (req: Request | any, res: Response | any) => {
  res.set(headers);
  AppsManager.installPackage(req.query.path);
});
expressServer.get('/api/data/webapps/uninstall', (req: Request | any, res: Response | any) => {
  res.set(headers);
  AppsManager.uninstall(req.query.id);
});

// Wifi
expressServer.get('/api/data/wifi/enable', (req: Request | any, res: Response | any) => {
  res.set(headers);
  WifiManager.enable();
});
expressServer.get('/api/data/wifi/disable', (req: Request | any, res: Response | any) => {
  res.set(headers);
  WifiManager.disable();
});
expressServer.get('/api/data/wifi/scan', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.json(await WifiManager.scan());
});
expressServer.get('/api/data/wifi/current_connections', async (req: Request | any, res: Response | any) => {
  res.set(headers);
  res.json(await WifiManager.getCurrentConnections());
});
expressServer.get('/api/data/wifi/delete', (req: Request | any, res: Response | any) => {
  res.set(headers);
  // WifiManager.delete(req.query.ssid);
});
