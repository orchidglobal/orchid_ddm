import { exec } from "child_process";

const PowerManager = {
  shutdown: () => {
    exec('shutdown now', (error, stdout, stderr) => {
      if (error) {
        console.error('Error occurred during shutdown:', error);
      } else {
        console.log(stdout);
      }
    });
  },

  restart: () => {
    exec('reboot', (error, stdout, stderr) => {
      if (error) {
        console.error('Error occurred during restart:', error);
      } else {
        console.log(stdout);
      }
    });
  },

  sleep: () => {
    exec('poweroff', (error, stdout, stderr) => {
      if (error) {
        console.error('Error occurred during sleep:', error);
      } else {
        console.log(stdout);
      }
    });
  }
};

export default PowerManager;
