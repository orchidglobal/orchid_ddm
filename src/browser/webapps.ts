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
    const subdomain = dir.split('.')[0];

    const localServer = http.createServer((req: IncomingMessage, res: any) => {
      if (!Main.webappsPath || !req.url) {
        throw new Error('Webapps path or request URL not found');
      }

      // Check if the request is meant for the Express app
      if (req.url?.startsWith('/api/data')) {
        expressServer(req, res);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        const host = req.headers.host || '';
        const subdomain = host.split('.')[0];

        function sendRequest(data: any, contentType: string) {
          res.setHeader('Content-Type', contentType); // Set the content type header
          res.writeHead(200);
          console.log(
            `[openorchid-localhost] ${colors.green}GET${colors.reset} http://${subdomain}.localhost:8081${req.url} 200`
          );
          res.end(data);
        }

        let filePath: string;
        if (!subdomain && req.url) {
          filePath = path.join(internalDir, req.url);

          fs.readFile(filePath, (error: NodeJS.ErrnoException | null, data: Buffer) => {
            if (error) {
              res.writeHead(404);
              res.end('File not found');
              console.log(
                `[openorchid-localhost] ${colors.red}FAILED${colors.reset} http://${subdomain}.localhost:8081${req.url} 404`
              );
              return;
            }
            const contentType = mime.getType(path.extname(filePath));
            sendRequest(data, contentType as string); // Pass the content type to sendRequest
          });

          return;
        }

        if (process.env.NODE_ENV === 'production') {
          const zipFilePath = path.join(Main.webappsPath, subdomain, 'webapp.zip');
          const zip = new AdmZip(zipFilePath);

          const requestPath = req.url === '/' ? '/index.html' : req.url;
          const zipEntry = zip.getEntry(requestPath.substring(1)); // Use the correct request path

          if (!zipEntry) {
            res.writeHead(404);
            res.end('File not found');
            console.log(
              `[openorchid-localhost] ${colors.red}FAILED${colors.reset} http://${subdomain}.localhost:8081${req.url} 404`
            );
            return;
          }

          const data = zipEntry.getData();
          const contentType = mime.getType(path.extname(zipEntry.entryName));
          sendRequest(data, contentType as string); // Pass the content type to sendRequest
        } else {
          filePath = path.join(Main.webappsPath, subdomain, req.url);

          fs.readFile(filePath, (err, data) => {
            if (err) {
              res.writeHead(404);
              res.end('File not found');
              console.log(
                `[openorchid-localhost] ${colors.red}FAILED${colors.reset} http://${subdomain}.localhost:8081${req.url} 404`
              );
              return;
            }
            const contentType = mime.getType(path.extname(filePath));
            sendRequest(data, contentType as string); // Pass the content type to sendRequest
          });
        }
      }
    });

    localServer.listen(8081, 'localhost', () => {
      console.log('Server running at http:\/\/*.localhost:8081');
    });

    app.on('will-quit', () => {
      localServer.close(() => {
        console.log(`Ending webapp runtime server for ${subdomain}...`);
      });
    });
  });
};

// Bluetooth
expressServer.get('/api/data/bluetooth/enable', (req: Request | any, res: Response | any) => {
  Bluetooth2.enable();
});
expressServer.get('/api/data/bluetooth/disable', (req: Request | any, res: Response | any) => {
  Bluetooth2.disable();
});
expressServer.get('/api/data/bluetooth/scan', async (req: Request | any, res: Response | any) => {
  res.send(await Bluetooth2.scan(req.query.duration));
});
expressServer.get('/api/data/bluetooth/connect', (req: Request | any, res: Response | any) => {
  Bluetooth2.connect(req.query.id);
});
expressServer.get('/api/data/bluetooth/disconnect', (req: Request | any, res: Response | any) => {
  Bluetooth2.disconnect(req.query.id);
});

// Child Process
expressServer.get('/api/data/child_process/exec', (req: Request | any, res: Response | any) => {
  ChildProcess.exec(req.query.cli, req.query.args);
});
expressServer.get('/api/data/child_process/spawn', (req: Request | any, res: Response | any) => {
  ChildProcess.spawn(req.query.cli, req.query.args);
});

// Device Information
expressServer.get('/api/data/device_info/hwid', (req: Request | any, res: Response | any) => {
  res.send(DeviceInformation.getHardwareId());
});
expressServer.get('/api/data/device_info/cpus', (req: Request | any, res: Response | any) => {
  res.send(JSON.stringify(os.cpus()));
});
expressServer.get('/api/data/device_info/platform', (req: Request | any, res: Response | any) => {
  res.send(os.platform());
});
expressServer.get('/api/data/device_info/name', (req: Request | any, res: Response | any) => {
  res.send(os.version());
});
expressServer.get('/api/data/device_info/arch', (req: Request | any, res: Response | any) => {
  res.send(os.machine());
});
expressServer.get('/api/data/device_info/endianness', (req: Request | any, res: Response | any) => {
  res.send(os.endianness());
});
expressServer.get('/api/data/device_info/hostname', (req: Request | any, res: Response | any) => {
  res.send(os.hostname());
});
expressServer.get('/api/data/device_info/freemem', (req: Request | any, res: Response | any) => {
  res.send(os.freemem());
});
expressServer.get('/api/data/device_info/totalmem', (req: Request | any, res: Response | any) => {
  res.send(os.totalmem());
});
expressServer.get('/api/data/device_info/uptime', (req: Request | any, res: Response | any) => {
  res.send(os.uptime());
});
expressServer.get('/api/data/device_info/homedir', (req: Request | any, res: Response | any) => {
  res.send(os.homedir());
});
expressServer.get('/api/data/device_info/tempdir', (req: Request | any, res: Response | any) => {
  res.send(os.tmpdir());
});

// Power
expressServer.get('/api/data/power/shutdown', (req: Request | any, res: Response | any) => {
  PowerManager.shutdown();
});
expressServer.get('/api/data/power/restart', (req: Request | any, res: Response | any) => {
  PowerManager.restart();
});
expressServer.get('/api/data/power/sleep', (req: Request | any, res: Response | any) => {
  PowerManager.sleep();
});

// Settings
expressServer.get('/api/data/settings/get', async (req: Request | any, res: Response | any) => {
  res.send(await Settings.getValue(req.query.name));
});
expressServer.get('/api/data/settings/set', (req: Request | any, res: Response | any) => {
  Settings.setValue(req.query.name, req.query.value);
});
expressServer.get('/api/data/settings/observe', (req: Request | any, res: Response | any) => {
  Settings.addObserver(req.query.name, (data: any) => {
    res.send(JSON.stringify(data));
  });
});

// Storage
expressServer.get('/api/data/storage/read', async (req: Request | any, res: Response | any) => {
  res.send(await StorageManager.read(req.query.path));
});
expressServer.get('/api/data/storage/write', (req: Request | any, res: Response | any) => {
  StorageManager.write(req.query.path, req.query.data);
});
expressServer.get('/api/data/storage/list', async (req: Request | any, res: Response | any) => {
  res.send(await StorageManager.list(req.query.path));
});
expressServer.get('/api/data/storage/delete', (req: Request | any, res: Response | any) => {
  StorageManager.delete(req.query.path);
});
expressServer.get('/api/data/storage/copy', (req: Request | any, res: Response | any) => {
  StorageManager.copy(req.query.path, req.query.target);
});
expressServer.get('/api/data/storage/move', (req: Request | any, res: Response | any) => {
  StorageManager.move(req.query.path, req.query.target);
});
expressServer.get('/api/data/storage/stats', async (req: Request | any, res: Response | any) => {
  res.send(await StorageManager.getStats(req.query.path));
});
expressServer.get('/api/data/storage/mime', (req: Request | any, res: Response | any) => {
  res.send(StorageManager.getMime(req.query.path));
});

// Webapps
expressServer.get('/api/data/webapps/getall', async (req: Request | any, res: Response | any) => {
  res.send(await AppsManager.getAll());
});
expressServer.get('/api/data/webapps/install', (req: Request | any, res: Response | any) => {
  AppsManager.installPackage(req.query.path);
});
expressServer.get('/api/data/webapps/uninstall', (req: Request | any, res: Response | any) => {
  AppsManager.uninstall(req.query.id);
});

// Wifi
expressServer.get('/api/data/wifi/enable', (req: Request | any, res: Response | any) => {
  WifiManager.enable();
});
expressServer.get('/api/data/wifi/disable', (req: Request | any, res: Response | any) => {
  WifiManager.disable();
});
expressServer.get('/api/data/wifi/scan', async (req: Request | any, res: Response | any) => {
  res.json(await WifiManager.scan());
});
expressServer.get('/api/data/wifi/current_connections', async (req: Request | any, res: Response | any) => {
  res.json(await WifiManager.getCurrentConnections());
});
expressServer.get('/api/data/wifi/delete', (req: Request | any, res: Response | any) => {
  // WifiManager.delete(req.query.ssid);
});
