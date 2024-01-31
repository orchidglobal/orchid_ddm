!(function (exports) {
  'use strict';

  const LockscreenClock = {
    motionElement: document.getElementById('lockscreen'),
    clockElement: document.getElementById('lockscreen-clock'),
    clockHoursElement: document.getElementById('lockscreen-clock-hours'),
    clockMinsElement: document.getElementById('lockscreen-clock-mins'),

    is12HourFormat: true, // Set this flag to true for 12-hour format, or false for 24-hour format

    init: function () {
      this.intervalID = setInterval(this.updateTime.bind(this), 1000);
      this.update();
    },

    updateTime: function () {
      if (!this.motionElement.classList.contains('visible')) {
        return;
      }

      const currentTime = new Date();
      const langCode = L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : L10n.currentLanguage;

      this.clockHoursElement.textContent = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: '2-digit',
          minute: '2-digit'
        })
        .split(':')[0];
      this.clockMinsElement.textContent = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: '2-digit',
          minute: '2-digit'
        })
        .split(':')[1]
        .split(' ')[0];
    },

    update: function () {
      requestAnimationFrame(this.update.bind(this));

      if (!this.motionElement.classList.contains('visible')) {
        return;
      }
      let width = 0;

      width = Math.max(this.clockHoursElement.scrollWidth, this.clockMinsElement.scrollWidth);

      this.motionElement.style.setProperty('--lockscreen-clock-width', width + 'px');
      this.motionElement.style.setProperty('--lockscreen-clock-hours-width', this.clockHoursElement.scrollWidth + 'px');
      this.motionElement.style.setProperty('--lockscreen-clock-mins-width', this.clockMinsElement.scrollWidth + 'px');
    }
  };

  LockscreenClock.init();

  exports.LockscreenClock = LockscreenClock;
})(window);
