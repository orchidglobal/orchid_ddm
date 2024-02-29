!(function (exports) {
  'use strict';

  class StatusbarWarmColorsIcon extends StatusbarIcon {
    constructor (parent) {
      super('warm-colors', parent);
    }

    initialize () {
      this.element.dataset.icon = 'eye';
      this.element.classList.add('hidden');

      Settings.getValue('video.warm_colors.enabled').then(this.handleWarmColors.bind(this));
      Settings.addObserver('video.warm_colors.enabled', this.handleWarmColors.bind(this));
    }

    handleWarmColors (value) {
      this.element.classList.toggle('hidden', !value);
    }
  }

  exports.StatusbarWarmColorsIcon = StatusbarWarmColorsIcon;
})(window);
