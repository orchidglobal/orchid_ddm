!(function (exports) {
  'use strict';

  class StatusbarWifiIcon extends StatusbarIcon {
    constructor (parent) {
      super('wifi', parent);
    }

    initialize () {
      this.element.dataset.icon = `web`;

      this.update();
    }

    update () {
      WifiManager.getCurrentConnections().then((networks) => {
        this.networks = networks;

        if (!networks || !this.networks[0]) {
          return;
        }

        const signalStrength = Math.min(100, this.networks[0].quality);

        this.element.classList.remove('hidden');
        this.element.dataset.icon = `wifi-${Math.round(signalStrength / 25)}`;

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      }).catch((error) => {
        console.error(error);

        if (window.deviceType === 'desktop') {
          this.element.dataset.icon = 'ethernet';
        } else {
          this.element.classList.add('hidden');
        }

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      });
    }
  }

  exports.StatusbarWifiIcon = StatusbarWifiIcon;
})(window);
