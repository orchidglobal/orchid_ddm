!(function (exports) {
  'use strict';

  class StatusbarMuteIcon extends StatusbarIcon {
    constructor (parent) {
      super('mute', parent);
    }

    initialize () {
      this.element.dataset.icon = 'bell-off';
      this.element.classList.add('hidden');

      OrchidJS.Settings.getValue('audio.mute.enabled').then(this.handleMute.bind(this));
      OrchidJS.Settings.addObserver('audio.mute.enabled', this.handleMute.bind(this));
    }

    handleMute (value) {
      this.element.classList.toggle('hidden', !value);
    }
  }

  exports.StatusbarMuteIcon = StatusbarMuteIcon;
})(window);
