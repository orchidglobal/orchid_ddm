!(function (exports) {
  'use strict';

  const Viewer = {
    element: document.getElementById('viewer'),
    backButton: document.getElementById('viewer-back-button'),
    name: document.getElementById('viewer-name'),

    audioElement: new Audio(),

    init: function () {
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));
    },

    show: function () {
      this.element.classList.add('visible');
    },

    load: function (dataUrl, images, title) {
      this.show();

      this.name.textContent = title;
    },

    hide: function () {
      this.element.classList.remove('visible');
    },

    handleTrackSlider: function (event) {
      this.audioElement.currentTime = this.trackSlider.currentTime;
    },

    convertSeconds: function (seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      if (hours > 0) {
        return `${Math.round(hours).toString().padStart(2, '0')}:${Math.round(minutes).toString().padStart(2, '0')}:${Math.round(remainingSeconds).toString().padStart(2, '0')}`;
      } else {
        return `${Math.round(minutes).toString().padStart(2, '0')}:${Math.round(remainingSeconds).toString().padStart(2, '0')}`;
      }
    },

    onProgress: function (event) {
      this.trackSlider.min = 0;
      this.trackSlider.max = this.audioElement.duration;
      this.trackSlider.value = this.audioElement.currentTime;

      this.trackDuration.textContent = this.convertSeconds(this.audioElement.duration);
      this.trackCurrentTime.textContent = this.convertSeconds(this.audioElement.currentTime);
    },

    onPlay: function (event) {
      this.playPauseButton.dataset.icon = 'pause-alt';
    },

    onPause: function (event) {
      this.playPauseButton.dataset.icon = 'play-alt';
    },

    handleBackButton: function (event) {
      const currentPanel = document.querySelector('section[role="panel"]:not(#player).visible');
      const currentHeader = currentPanel.children[0];
      OrchidJS.Transitions.scale(this.element, currentHeader);
      this.hide();
    },

    handleShowButton: function (event) {
      const currentPanel = document.querySelector('section[role="panel"]:not(#player).visible');
      const currentHeader = currentPanel.children[0];
      OrchidJS.Transitions.scale(currentHeader, this.element);
      this.show();
    }
  };

  Viewer.init();

  exports.Viewer = Viewer;
})(window);
