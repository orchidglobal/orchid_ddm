import fs from 'fs';
import path from 'path';
import mime from 'mime';
import mv from 'mv';
import copy from 'copy';
import APIPermissions from '../permissions';
import Renderer from '../renderer';

const SDCardManager = {
  bufferFrom: Buffer.from,

  meetsPermissions: function (filePath: string): boolean {
    const accessMap: any = {
      audio: APIPermissions.checkPermission('device-storage:audio'),
      books: APIPermissions.checkPermission('device-storage:books'),
      downloads: APIPermissions.checkPermission('device-storage:downloads'),
      movies: APIPermissions.checkPermission('device-storage:movies'),
      music: APIPermissions.checkPermission('device-storage:music'),
      others: APIPermissions.checkPermission('device-storage:others'),
      photos: APIPermissions.checkPermission('device-storage:photos')
    };

    const entries = Object.entries(accessMap);
    for (let index = 0; index < entries.length; index++) {
      const [ objectId, objectData ] = entries[index];

      if (objectData && (filePath.startsWith(objectId) || filePath.startsWith(`/${objectId}`))) {
        return true;
      }
    }
    return true;
  },

  read: function (filePath: string, options: Record<string, any> = { encoding: 'utf8' }) {
    return new Promise((resolve, reject) => {
      if (!this.meetsPermissions(filePath)) {
        return;
      }

      fs.readFile(path.join(Renderer.storagePath as string, filePath), options, (error, result) => {
        if (error) {
          reject(error);
          console.log(error);
          return;
        }
        resolve(result);
      });
    });
  },

  write: function (filePath: string, content: any) {
    if (!this.meetsPermissions(filePath)) {
      return;
    }

    const fileData = fs.writeFileSync(path.join(Renderer.storagePath as string, filePath), content, 'utf8');
    console.log('File content:', fileData);
  },

  delete: function (filePath: string) {
    if (!this.meetsPermissions(filePath)) {
      return;
    }

    import('del').then((value: any) => {
      value.deleteAsync(path.join(Renderer.storagePath as string));
    });
  },

  copy: function (fromPath: string, toPath: string) {
    return new Promise((resolve, reject) => {
      if (!this.meetsPermissions(fromPath) || !this.meetsPermissions(toPath)) {
        return;
      }

      copy(path.join(Renderer.storagePath as string, fromPath), path.join(Renderer.storagePath as string, toPath), (error: Error) => {
        if (error) {
          reject(error);
          console.error(error);
          return;
        }
        resolve(null);
      });
    });
  },

  move: function (fromPath: string, toPath: string) {
    return new Promise((resolve, reject) => {
      if (!this.meetsPermissions(fromPath) || !this.meetsPermissions(toPath)) {
        return;
      }

      mv(path.join(Renderer.storagePath as string, fromPath), path.join(Renderer.storagePath as string, toPath), (error) => {
        if (error) {
          reject(error);
          console.error(error);
          return;
        }
        resolve(null);
      });
    });
  },

  list: function (dirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      if (!this.meetsPermissions(dirPath)) {
        return;
      }

      fs.readdir(path.join(Renderer.storagePath as string, dirPath), (error, files) => {
        if (error) {
          reject(error);
          console.log(error);
          return;
        }
        resolve(files);
      });
    });
  },

  getStats: function (filePath: string) {
    if (!this.meetsPermissions(filePath)) {
      return;
    }

    let stats = fs.statSync(path.join(Renderer.storagePath as string, filePath));
    stats = Object.assign(stats, {
      is_directory: stats.isDirectory(),
      is_block_device: stats.isBlockDevice(),
      is_char_device: stats.isCharacterDevice(),
      is_symlink: stats.isSymbolicLink(),
      is_socket: stats.isSocket()
    });
    return stats;
  },

  getMime: function (filePath: string) {
    if (!this.meetsPermissions(filePath)) {
      return;
    }

    const mimeType = mime.getType(filePath);
    return mimeType;
  },

  exists: function (filePath: string) {
    return fs.existsSync(path.join(Renderer.storagePath as string, filePath));
  },

  mkdir: function (dirPath: string, options: Record<string, any> = {}) {
    fs.mkdirSync(path.join(Renderer.storagePath as string, dirPath), options);
  },

  rmdir: function (dirPath: string, options: Record<string, any> = {}) {
    fs.rmdirSync(path.join(Renderer.storagePath as string, dirPath), options);
  },

  symlink: function (fromPath: string, toPath: string) {
    fs.symlinkSync(path.join(Renderer.storagePath as string, fromPath), path.join(Renderer.storagePath as string, toPath));
  },

  chmod: function (filePath: string, mode: fs.Mode) {
    fs.chmodSync(path.join(Renderer.storagePath as string, filePath), mode);
  }
};

export default SDCardManager;
