!(function (exports) {
  'use strict';

  class StatusbarDataIcon extends StatusbarIcon {
    constructor (parent) {
      super('data', parent);
    }

    initialize () {
      if (window.deviceType !== 'mobile') {
        this.element.classList.add('hidden');
        return;
      }

      this.element.dataset.icon = 'data';
      this.update();
    }

    update () {
      WifiManager.getCurrentConnections().then((networks) => {
        this.networks = networks;

        const signalStrength = Math.min(100, this.networks[0].quality);

        if (signalStrength >= 50) {
          this.element.classList.remove('hidden');
        } else {
          this.element.classList.add('hidden');
        }

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      }).catch((error) => {
        console.error(error);

        this.element.classList.remove('hidden');

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      });
    }
  }

  exports.StatusbarDataIcon = StatusbarDataIcon;
})(window);
