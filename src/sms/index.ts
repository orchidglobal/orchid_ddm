const SmsManager = {
  portName: '/dev/ttyUSB0',
  baudRate: 9600,
  serialPort: null,
  parser: null,

  sendSMS: function (phoneNumber: string, message: string) {},

  receiveSMS: function (callback: Function) {}
};

export default SmsManager;
