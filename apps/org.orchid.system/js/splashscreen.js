!(function (exports) {
  'use strict';

  const Splashscreen = {
    splashElement: document.getElementById('splashscreen'),
    videoElement: document.getElementById('splashscreen-video'),
    videoSource: document.getElementById('splashscreen-video-source'),

    VIDEO_BOOT_START: '/resources/videos/splashscreen.mp4',
    VIDEO_BOOT_LOADING: '/resources/videos/splashscreen_loop.mp4',

    isBooting: true,
    isL10nReady: false,
    isFirstTime: false,
    audioTimeoutID: null,

    init: function () {
      if (this.videoElement) {
        this.videoElement.src = this.VIDEO_BOOT_START;

        this.videoElement.onended = () => {
          this.videoElement.src = this.VIDEO_BOOT_LOADING;
          this.videoElement.load();
          setTimeout(() => {
            this.videoElement.play();
            this.videoElement.loop = true;
          }, 1000);
        };
      }

      document.addEventListener('localized', () => {
        if (this.isL10nReady) {
          return;
        }
        this.isL10nReady = true;

        this.splashElement.classList.add('safety-warning');
        setTimeout(() => {
          this.splashElement.classList.remove('safety-warning');
          this.splashElement.classList.add('logo');

          setTimeout(() => {
            if (this.videoElement) {
              this.videoElement.play();
            }
          }, 300);
        }, 3000);
      });
    },

    hide: function () {
      if (this.videoElement) {
        this.videoElement.pause();
      }

      if (this.isFirstTime) {
        this.splashElement.classList.add('reveal');
        this.splashElement.addEventListener('transitionend', () => {
          this.splashElement.classList.remove('reveal');
          this.splashElement.classList.add('hidden');
        });
      } else {
        this.splashElement.classList.add('hidden');
      }

      this.audioTimeoutID = setTimeout(() => {
        this.isBooting = false;
      }, 2000);
    }
  };

  document.addEventListener('DOMContentLoaded', () => Splashscreen.init());

  exports.Splashscreen = Splashscreen;
})(window);
