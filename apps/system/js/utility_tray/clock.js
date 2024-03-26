!(function (exports) {
  'use strict';

  const UtilityTrayClock = {
    motionElement: document.getElementById('utility-tray-motion'),
    clockElement: document.getElementById('control-center-time'),

    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

    init: function () {
      Settings.getValue('timedate.12_hour.enabled').then(this.handle12HourClock.bind(this));
      Settings.addObserver('timedate.12_hour.enabled', this.handle12HourClock.bind(this));

      this.intervalID = setInterval(this.update.bind(this), 1000);
    },

    handle12HourClock: function (value) {
      this.is12HourFormat = value;
    },

    update: function () {
      if (!this.motionElement.classList.contains('visible')) {
        return;
      }

      const currentTime = new Date();
      const langCode = OrchidJS.L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

      this.clockElement.textContent = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: 'numeric',
          minute: 'numeric'
        })
        .split(' ')[0];
    }
  };

  UtilityTrayClock.init();

  exports.UtilityTrayClock = UtilityTrayClock;
})(window);
