!(function (exports) {
  'use strict';

  const WifiButton = {
    wifiButton: document.getElementById('quick-settings-wifi'),

    init: function () {
      this.update();
    },

    update: function () {
      if (Bootstrap.network.signalStrength) {
        this.wifiButton.classList.add('enabled');
        this.wifiButton.children[0].dataset.icon = `wifi-${Math.round(Bootstrap.network.signalStrength / (100 / 3))}`;
        this.wifiButton.querySelector('.text-holder .detail').textContent = Bootstrap.network.ssid;
      } else {
        this.wifiButton.classList.remove('enabled');
        this.wifiButton.children[0].dataset.icon = 'wifi';
        this.wifiButton.querySelector('.text-holder .detail').textContent = '';
      }

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);
    }
  };

  WifiButton.init();
})(window);
