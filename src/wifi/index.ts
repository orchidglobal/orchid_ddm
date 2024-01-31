import wifi from 'node-wifi';

const WifiManager = {
  isEnabled: false,

  init: function () {
    wifi.init({ iface: 'wlan0' });
  },

  scan: function () {
    return new Promise((resolve, reject) => {
      // Code to check Wi-Fi status and return the result
      wifi.scan((error, networks) => {
        if (error) {
          console.error(error);
        }
        resolve(networks);
      });
    });
  },

  getCurrentConnections: function () {
    return new Promise((resolve, reject) => {
      // Code to check Wi-Fi status and return the result
      wifi.getCurrentConnections((error, currentConnections) => {
        if (error) {
          console.error(error);
        }
        resolve(currentConnections);
      });
    });
  },

  enable: function () {
    // Code to enable wifimanager
    this.isEnabled = true;
  },

  disable: function () {
    // Code to disable wifimanager
    this.isEnabled = false;
  },

  deleteConnection: function (ssid: string) {
    // Code to delete a network
    wifi.deleteConnection({ ssid }, (error) => {
      if (error) {
        console.error(error);
      }
    });
  }
};

WifiManager.init();

export default WifiManager;
