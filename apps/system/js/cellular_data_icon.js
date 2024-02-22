!(function (exports) {
  'use strict';

  class StatusbarCellularDataIcon extends StatusbarIcon {
    constructor (parent) {
      super('cellular', parent);
    }

    initialize () {
      if (window.deviceType !== 'mobile') {
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
        this.element.dataset.icon = 'signal-error';
      }
    }
  }

  exports.StatusbarCellularDataIcon = StatusbarCellularDataIcon;
})(window);
