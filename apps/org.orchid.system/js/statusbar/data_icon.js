!(function (exports) {
  'use strict';

  class StatusbarDataIcon extends StatusbarIcon {
    constructor (parent) {
      super('data', parent);
    }

    initialize () {
      this.element.dataset.icon = 'data';
      this.element.classList.add('hidden');
    }
  }

  exports.StatusbarDataIcon = StatusbarDataIcon;
})(window);
