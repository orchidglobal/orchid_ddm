!(function (exports) {
  'use strict';

  class StatusbarIcon {
    constructor (id, parent) {
      this.id = id;
      this.parent = parent;

      this.init();
    }

    init () {
      this.element = document.createElement('div');
      this.element.classList.add(`statusbar-${this.id}`);
      this.parent.appendChild(this.element);

      this.initialize();
      this.update();
    }

    initialize () {
      return;
    }

    update () {
      return;
    }
  }

  exports.StatusbarIcon = StatusbarIcon;
})(window);
