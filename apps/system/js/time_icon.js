!(function (exports) {
  'use strict';

  class StatusbarTimeIcon extends StatusbarIcon {
    constructor (parent) {
      super('timedate', parent);
    }

    initialize () {
      this.element.classList.add('timedate');

      this.timeLabel = document.createElement('div');
      this.timeLabel.classList.add('statusbar-time');
      this.element.appendChild(this.timeLabel);

      this.dateLabel = document.createElement('div');
      this.dateLabel.classList.add('statusbar-date');
      this.element.appendChild(this.dateLabel);

      this.update();
    }

    update () {
      const currentTime = new Date();
      const langCode =
        L10n.currentLanguage === 'ar'
          ? 'ar-SA'
          : L10n.currentLanguage;

      this.timeLabel.innerText = currentTime
        .toLocaleTimeString(langCode, {
          hour12: this.is12HourFormat,
          hour: 'numeric',
          minute: '2-digit'
        })
        .split(' ')[0];

      this.dateLabel.innerText = currentTime
        .toLocaleDateString(langCode, {
          day: 'numeric',
          month: 'short'
        });
      this.dateLabel.style.setProperty(
        '--hide-margin',
        `-${this.dateLabel.offsetWidth / 2}px`
      );

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.update.bind(this), 1000);
    }
  }

  exports.StatusbarTimeIcon = StatusbarTimeIcon;
})(window);
