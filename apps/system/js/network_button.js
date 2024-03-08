!(function (exports) {
  'use strict';

  const NetworkButton = {
    wifiButton: document.getElementById('quick-settings-wifi'),

    init: function () {
      this.update();
    },

    update: function () {
      WifiManager.getCurrentConnections().then((networks) => {
        this.networks = networks;

        const signalStrength = Math.min(100, this.networks[0].quality);

        this.wifiButton.classList.add('enabled');
        this.wifiButton.children[0].dataset.icon = `wifi-${Math.round(signalStrength / 25)}`;
        this.wifiButton.children[1].dataset.l10nId = null;
        this.wifiButton.children[1].textContent = this.networks[0].ssid;

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(this.update.bind(this), 1000);
      }).catch((error) => {
        console.error(error);
        this.wifiButton.classList.remove('enabled');
        this.wifiButton.children[0].dataset.icon = 'wifi';
        this.wifiButton.children[1].dataset.l10nId = 'quickSettings-wifi';
      });
    }
  };

  NetworkButton.init();
})(window);
