!(function (exports) {
  'use strict';

  const Battery = {
    batteryPercentage: document.getElementById('battery-percentage'),
    batteryChargeStage: document.getElementById('battery-charge-state'),
    batteryPercentageSwitch: document.getElementById('battery-percentage-switch'),

    init: function () {
      this.batteryPercentageSwitch.addEventListener('change', this.handleBatteryPercentageSwitch.bind(this));
      Settings.getValue('battery.percentage.visible').then((data) => {
        this.batteryPercentageSwitch.checked = data;
      });

      this.intervalID = setInterval(this.update.bind(this), 1000);
    },

    handleBatteryPercentageSwitch: function () {
      const value = this.batteryPercentageSwitch.checked;
      Settings.setValue('battery.percentage.visible', value);
    },

    update: function () {

      navigator.getBattery().then((battery) => {
        this.battery = battery;

        let level = battery.level;
        let charging = battery.charging;

        this.batteryPercentage.dataset.l10nArgs = JSON.stringify({
          n: Math.round(level * 100)
        });

        if (charging) {
          this.batteryChargeStage.dataset.l10nId = 'battery-charging';
        } else {
          this.batteryChargeStage.dataset.l10nId = 'battery-discharging';
        }

        ['chargingchange', 'levelchange'].forEach((event) => {
          battery.addEventListener(event, () => {
            level = battery.level;
            charging = battery.charging;

            this.batteryPercentage.dataset.l10nArgs = JSON.stringify({
              n: Math.round(level * 100)
            });

            if (charging) {
              this.batteryChargeStage.dataset.l10nId = 'battery-charging';
            } else {
              this.batteryChargeStage.dataset.l10nId = 'battery-discharging';
            }
          });
        });
      });
    }
  };

  SettingsApp.Battery = Battery;
})(window);
