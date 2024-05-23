!(function (exports) {
  'use strict';

  class StatusbarWifiIcon extends StatusbarIcon {
    constructor(parent) {
      super('wifi', parent);
    }

    initialize() {
      this.element.dataset.icon = `web`;
      this.element.classList.add('hidden');

      this.update();
    }

    update() {
      if (Bootstrap.network.signalStrength) {
        this.element.classList.remove('hidden');
        this.element.dataset.icon = `wifi-${Math.round(Bootstrap.network.signalStrength / (100 / 3))}`;
      } else {
        if (OrchidJS.deviceType.includes('desktop')) {
          this.element.dataset.icon = 'ethernet';
          this.element.classList.remove('hidden');
        } else {
          this.element.classList.add('hidden');
        }
      }

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);
    }
  }

  exports.StatusbarWifiIcon = StatusbarWifiIcon;
})(window);
