import * as fs from 'fs';
import * as path from 'path';
import Main from '../main';

const checkDefaultFiles = () => {
  if (!Main.profilePath) {
    throw new Error('Profile path not found');
  }

  const defaultsDir = path.join(process.cwd(), 'defaults');
  fs.mkdirSync(Main.profilePath, {
    recursive: true
  });
  fs.readdir(defaultsDir, (error, files) => {
    if (error) {
      return;
    }
    files.forEach((file) => {
      if (!Main.profilePath) {
        throw new Error('Profile path not found');
      }

      if (fs.existsSync(path.join(Main.profilePath, file))) {
        return;
      }
      fs.copyFile(path.join(defaultsDir, file), path.join(Main.profilePath, file), function (error: any) {
        if (error) {
          console.error(error);
        }
      });
    });
  });
};

export default checkDefaultFiles;
