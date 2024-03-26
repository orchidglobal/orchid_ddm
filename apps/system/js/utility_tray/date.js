!(function (exports) {
  'use strict';

  const LockscreenDate = {
    motionElement: document.getElementById('utility-tray-motion'),
    dateElement: document.getElementById('control-center-date'),

    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format
    intervalID: null,

    init: function () {
      this.intervalID = setInterval(this.update.bind(this), 1000);
    },

    update: function () {
      if (!this.motionElement.classList.contains('visible')) {
        return;
      }

      const currentTime = new Date();
      const langCode = OrchidJS.L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

      this.dateElement.innerText = currentTime.toLocaleDateString(langCode, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  LockscreenDate.init();
})(window);
