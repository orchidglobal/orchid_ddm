!(function (exports) {
  'use strict';

  class StatusbarAudioIcon extends StatusbarIcon {
    constructor (parent) {
      super('audio', parent);
    }

    initialize () {
      this.element.dataset.icon = 'audio-max';

      if (window.deviceType !== 'desktop') {
        this.element.classList.add('hidden');
      }
    }
  }

  exports.StatusbarAudioIcon = StatusbarAudioIcon;
})(window);
