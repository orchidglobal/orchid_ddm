!(function (exports) {
  'use strict';

  class StatusbarCarrierLabel extends StatusbarIcon {
    constructor(parent) {
      super('carrier-label', parent);
    }

    initialize() {
      this.intervalID = setInterval(this.update.bind(this), 1000);
    }

    update() {
      this.element.textContent = OrchidJS.L10n.get('emergency-only');
      this.element.style.setProperty('--hide-margin', `-${this.element.offsetWidth / 2}px`);
    }
  }

  exports.StatusbarCarrierLabel = StatusbarCarrierLabel;
})(window);
