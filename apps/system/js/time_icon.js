!(function (exports) {
  'use strict';

  class StatusbarTimeIcon extends StatusbarIcon {
    constructor(parent) {
      super('timedate', parent);

      this.is12HourFormat = true;
    }

    initialize() {
      this.element.classList.add('timedate');

      this.timeLabel = document.createElement('div');
      this.timeLabel.classList.add('statusbar-time');
      this.element.appendChild(this.timeLabel);

      this.dateLabel = document.createElement('div');
      this.dateLabel.classList.add('statusbar-date');
      this.element.appendChild(this.dateLabel);

      Settings.getValue('timedate.12_hour.enabled').then(this.handle12HourClock.bind(this));
      Settings.addObserver('timedate.12_hour.enabled', this.handle12HourClock.bind(this));

      this.update();
    }

    handle12HourClock(value) {
      this.is12HourFormat = value;
    }

    update() {
      const currentTime = new Date();
      const langCode = OrchidJS.L10n.currentLanguage === 'ar' ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

      this.timeLabel.innerText = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: 'numeric',
          minute: '2-digit'
        })
        .split(' ')[0];

      this.dateLabel.innerText = currentTime.toLocaleDateString(langCode, {
        day: 'numeric',
        month: 'short'
      });
      this.dateLabel.style.setProperty('--hide-margin', `-${this.dateLabel.offsetWidth / 2}px`);

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);
    }
  }

  exports.StatusbarTimeIcon = StatusbarTimeIcon;
})(window);
