!(function (exports) {
  'use strict';

  const SimulatorApp = {
    titlebar: document.getElementById('titlebar'),

    closeButton: document.getElementById('titlebar-close-button'),
    maximizeButton: document.getElementById('titlebar-maximize-button'),
    minimizeButton: document.getElementById('titlebar-minimize-button'),
    optionsButton: document.getElementById('titlebar-options-button'),

    init: function () {
      this.closeButton.addEventListener('click', this.handleCloseButton.bind(this));
      this.maximizeButton.addEventListener('click', this.handleMaximizeButton.bind(this));
      this.minimizeButton.addEventListener('click', this.handleMinimizeButton.bind(this));
      this.optionsButton.addEventListener('click', this.handleOptionsButton.bind(this));
    },

    handleCloseButton: function () {
      IPC.send('close');
    },

    handleMaximizeButton: function () {
      IPC.send('maximize');
    },

    handleMinimizeButton: function () {
      IPC.send('minimize');
    },

    handleOptionsButton: function () {
      IPC.send('simulator-options');
    }
  };

  SimulatorApp.init();
})(window);
