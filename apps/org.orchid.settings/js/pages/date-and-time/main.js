!(function (exports) {
  'use strict';

  const DateAndTime = {
    clock12HoursCheckbox: document.getElementById('date-and-time-12-hour-clock-checkbox'),

    init: function () {
      this.clock12HoursCheckbox.addEventListener('change', this.handle12HourClockSwitch.bind(this));
      Settings.getValue('timedate.12_hour.enabled').then((data) => {
        this.clock12HoursCheckbox.checked = data;
      });
    },

    handle12HourClockSwitch: function () {
      const value = this.clock12HoursCheckbox.checked;
      Settings.setValue('timedate.12_hour.enabled', value);
    }
  };

  SettingsApp.DateAndTime = DateAndTime;
})(window);
