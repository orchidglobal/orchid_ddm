import * as fs from 'fs';
import * as path from 'path';
import Renderer from '../renderer';

const checkDefaultFiles = () => {
  if (!Renderer.profilePath) {
    throw new Error('Profile path not found');
  }

  const defaultsDir = path.join(process.cwd(), 'defaults');
  fs.mkdirSync(Renderer.profilePath, {
    recursive: true
  });
  fs.readdir(defaultsDir, (error, files) => {
    if (error) {
      return;
    }
    files.forEach((file) => {
      if (!Renderer.profilePath) {
        throw new Error('Profile path not found');
      }

      if (fs.existsSync(path.join(Renderer.profilePath, file))) {
        return;
      }
      fs.copyFile(path.join(defaultsDir, file), path.join(Renderer.profilePath, file), function (error: any) {
        if (error) {
          console.error(error);
        }
      });
    });
  });
};

export default checkDefaultFiles;
