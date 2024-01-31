// import noble from 'noble';

const Bluetooth2 = {
  devices: [] as Record<string, any>,

  scan: function (duration = 10) {
//     return new Promise((resolve, reject) => {
//       this.devices = [] as Record<string, any>;

//       noble.on('stateChange', (state: string) => {
//         if (state === 'poweredOn') {
//           noble.startScanning();
//           setTimeout(() => {
//             noble.stopScanning();
//             resolve(this.devices);
//           }, duration * 1000);
//         } else {
//           noble.stopScanning();
//           reject(new Error('Bluetooth is not powered on.'));
//         }
//       });

//       noble.on('discover', (peripheral: any) => {
//         const device = {
//           id: peripheral.id,
//           name: peripheral.advertisement.localName || 'Unknown Device',
//           rssi: peripheral.rssi,
//           address: peripheral.address,
//           advertisement: peripheral.advertisement
//         };
//         this.devices.push(device);
//       });
//     });
  },

  connect: function (deviceId: string) {
//     const noble = require('noble');

//     return new Promise((resolve, reject) => {
//       const device = this.devices.find((dev: any) => dev.id === deviceId);

//       if (!device) {
//         reject(new Error('Device not found.'));
//         return;
//       }

//       const peripheral = noble._peripherals[device.id];

//       if (!peripheral) {
//         reject(new Error('Peripheral not found.'));
//         return;
//       }

//       peripheral.connect((error: Error) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(device);
//         }
//       });
//     });
  },

  disconnect: function (deviceId: string) {
//     const noble = require('noble');

//     return new Promise((resolve, reject) => {
//       const device = this.devices.find((dev: any) => dev.id === deviceId);

//       if (!device) {
//         reject(new Error('Device not found.'));
//         return;
//       }

//       const peripheral = noble._peripherals[device.id];

//       if (!peripheral) {
//         reject(new Error('Peripheral not found.'));
//         return;
//       }

//       peripheral.disconnect((error: Error) => {
//         if (error) {
//           reject(error);
//         } else {
//           resolve(device);
//         }
//       });
//     });
  },

  enable: function () {
//     const noble = require('noble');

//     return new Promise((resolve, reject) => {
//       noble.on('stateChange', (state: string) => {
//         if (state === 'poweredOn') {
//           resolve(state);
//         } else {
//           reject(new Error('Bluetooth could not be enabled.'));
//         }
//       });

//       noble.state = 'poweredOn';
//     });
  },

  disable: function () {
//     const noble = require('noble');

//     return new Promise((resolve, reject) => {
//       noble.on('stateChange', (state: string) => {
//         if (state === 'poweredOff') {
//           resolve(state);
//         } else {
//           reject(new Error('Bluetooth could not be disabled.'));
//         }
//       });

//       noble.state = 'poweredOff';
//     });
  }
};

export default Bluetooth2;
