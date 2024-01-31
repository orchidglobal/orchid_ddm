import { exec } from 'child_process';

const UsersManager = {
  addUser: function (username: string, callback: Function) {
    exec(`sudo useradd ${username}`, (error, stdout, stderr) => {
      if (error) {
        callback(error.message);
      } else {
        callback(null, `User ${username} added successfully.`);
      }
    });
  },

  deleteUser: function (username: string, callback: Function) {
    exec(`sudo userdel ${username}`, (error, stdout, stderr) => {
      if (error) {
        callback(error.message);
      } else {
        callback(null, `User ${username} deleted successfully.`);
      }
    });
  },

  modifyUser: function (username: string, options: Record<string, any>, callback: Function) {
    const optionsString = Object.entries(options)
      .map(([key, value]) => `--${key} ${value}`)
      .join(' ');

    exec(
      `sudo usermod ${optionsString} ${username}`,
      (error, stdout, stderr) => {
        if (error) {
          callback(error.message);
        } else {
          callback(null, `User ${username} modified successfully.`);
        }
      }
    );
  },

  listUsers: (callback: Function) => {
    exec('cat /etc/passwd | cut -d: -f1', (error, stdout, stderr) => {
      if (error) {
        callback(error.message);
      } else {
        const users = stdout.trim().split('\n');
        callback(null, users);
      }
    });
  }
};

export default UsersManager;
