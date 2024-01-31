const Telephony = {
  portName: '/dev/ttyUSB0',
  baudRate: 9600,
  serialPort: null,
  parser: null,
  isCallActive: false,

  init: function () {},

  call: function (number: string, callback: Function) {},

  recieveCalls: function (callback: Function) {},

  answerCall: function (callback: Function) {},

  startAudioStream: function (callback: Function) {},

  hangUp: function () {}
};

export default Telephony;
