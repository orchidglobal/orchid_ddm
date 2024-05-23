!(function (exports) {
  'use strict';

  class StatusbarFocusIcon extends StatusbarIcon {
    constructor(parent) {
      super('focus', parent);
    }

    initialize() {
      this.element.dataset.icon = 'focus';
      this.element.classList.add('hidden');

      OrchidJS.Settings.getValue('general.focus.enabled').then(this.handleFocusMode.bind(this));
      OrchidJS.Settings.addObserver('general.focus.enabled', this.handleFocusMode.bind(this));

      OrchidJS.Settings.getValue('general.focus.mode').then(this.handleFocusMode.bind(this));
      OrchidJS.Settings.addObserver('general.focus.mode', this.handleFocusMode.bind(this));
    }

    handleFocusMode(value) {
      this.element.classList.toggle('hidden', !value);
    }

    async handleFocusMode(value) {
      const selected = await OrchidJS.Settings.getValue(value, 'focus-mode.json');
      this.element.dataset.icon = selected?.icon || 'focus';
    }
  }

  exports.StatusbarFocusIcon = StatusbarFocusIcon;
})(window);
