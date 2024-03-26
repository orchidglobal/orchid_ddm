!(function (exports) {
  'use strict';

  const Battery = {
    batteryPercentageSwitch: document.getElementById('battery-percentage-switch'),

    init: function () {
      this.batteryPercentageSwitch.addEventListener('change', this.handleBatteryPercentageSwitch.bind(this));
      Settings.getValue('battery.percentage.visible').then((data) => {
        this.batteryPercentageSwitch.checked = data;
      });
    },

    handleBatteryPercentageSwitch: function () {
      const value = this.batteryPercentageSwitch.checked;
      Settings.setValue('battery.percentage.visible', value);
    }
  };

  SettingsApp.Battery = Battery;
})(window);
