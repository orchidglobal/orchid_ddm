!(function (exports) {
  'use strict';

  class StatusbarCellularDataIcon extends StatusbarIcon {
    constructor (parent) {
      super('cellular', parent);
    }

    initialize () {
      if (OrchidJS.deviceType !== 'mobile') {
        this.element.classList.add('hidden');
        return;
      }

      this.element.dataset.icon = 'signal-error';
      this.update();
    }

    update () {
      if ('Telephony' in window) {
        this.element.dataset.icon = 'signal-searching';
      } else {
        if ('Environment' in window && Environment.type === 'development') {
          this.element.dataset.icon = 'signal-3';
        } else {
          this.element.dataset.icon = 'signal-error';
        }
      }
    }
  }

  exports.StatusbarCellularDataIcon = StatusbarCellularDataIcon;
})(window);
