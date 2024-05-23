!(function (exports) {
  'use strict';

  const MusicController = {
    audio: null,

    volume: 0,
    isFadedIn: false,

    init: function () {
      this.audio = new Audio();

      this.update();
    },

    play: function (src, loop = false) {
      this.audio = new Audio();
      this.audio.src = src;
      this.audio.loop = loop;
      this.audio.volume = this.volume;
      this.audio.play();
    },

    fadeInCurrentMusic: function (duration = 1) {
      this.audio.volume = this.volume;
    },

    fadeOutCurrentMusic: function (duration = 1) {
      this.audio.volume = 0;
    },

    stopCurrentMusic: function () {
      this.audio.pause();
      this.audio.src = null;
    },

    pauseCurrentMusic: function () {
      this.audio.pause();
    },

    setVolume: function (volume, duration = 1) {
      this.volume = volume;
      this.audio.volume = this.volume;
    },

    update: function () {
      requestAnimationFrame(this.update.bind(this));
    }
  };

  MusicController.init();

  exports.MusicController = MusicController;
})(window);
