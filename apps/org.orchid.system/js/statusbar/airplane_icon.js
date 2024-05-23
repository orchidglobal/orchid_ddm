!(function (exports) {
  'use strict';

  class StatusbarAirplaneIcon extends StatusbarIcon {
    constructor(parent) {
      super('airplane', parent);
    }

    initialize() {
      this.element.dataset.icon = 'airplane';
      this.element.classList.add('hidden');

      OrchidJS.Settings.getValue('comms.airplane.enabled').then(this.handleAirplaneMode.bind(this));
      OrchidJS.Settings.addObserver('comms.airplane.enabled', this.handleAirplaneMode.bind(this));
    }

    handleAirplaneMode(value) {
      this.element.classList.toggle('hidden', !value);
    }
  }

  exports.StatusbarAirplaneIcon = StatusbarAirplaneIcon;
})(window);
