import { ipcRenderer } from 'electron';
import sqlite3 from 'sqlite3';
import path from 'path';
import Renderer from '../renderer';

// Initialize SQLite database
const dbPath = path.join(Renderer.profilePath as string, 'user_data.db');
const db = new sqlite3.Database(dbPath);

const DataStorage = {
  getValue: function (name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get("SELECT value FROM data WHERE name = ?", [name], (err, row: Record<string, any>) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          const value = row ? JSON.parse(row.value) : null;
          resolve(value);
        }
      });
    });
  },

  setValue: function (name: string, value: any) {
    const serializedValue = JSON.stringify(value);
    db.run("INSERT OR REPLACE INTO data (name, value) VALUES (?, ?)", [name, serializedValue], (err) => {
      if (err) {
        console.error(err);
      } else {
        ipcRenderer.emit('data-storage-updated', { name, [name]: value });
        ipcRenderer.send('data-storage-updated', { name, [name]: value });
      }
    });
  },

  addObserver: function (name: string, callback: Function) {
    ipcRenderer.on('data-storage-updated', (event, data) => {
      DataStorage.getValue(name).then((data) => {
        callback(data);
      });
    });
  }
};

// Create data table if it doesn't exist
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS data (name TEXT PRIMARY KEY, value TEXT)");
});

// Listen for beforeunload event on window to save data before window is unloaded
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    db.close();
  });
}

export default DataStorage;
