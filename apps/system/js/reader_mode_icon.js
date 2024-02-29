!(function (exports) {
  'use strict';

  class StatusbarReaderModeIcon extends StatusbarIcon {
    constructor (parent) {
      super('reader-mode', parent);
    }

    initialize () {
      this.element.dataset.icon = 'reader-mode';
      this.element.classList.add('hidden');

      Settings.getValue('video.reader_mode.enabled').then(this.handleReaderMode.bind(this));
      Settings.addObserver('video.reader_mode.enabled', this.handleReaderMode.bind(this));
    }

    handleReaderMode (value) {
      this.element.classList.toggle('hidden', !value);
    }
  }

  exports.StatusbarReaderModeIcon = StatusbarReaderModeIcon;
})(window);
