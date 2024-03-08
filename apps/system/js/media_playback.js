!(function (exports) {
  'use strict';

  const MediaPlayback = {
    element: document.getElementById('media-playback'),
    title: document.getElementById('media-playback-title'),
    artist: document.getElementById('media-playback-artist'),
    playPauseButton: document.getElementById('media-playback-playpause'),
    previousButton: document.getElementById('media-playback-previous'),
    nextButton: document.getElementById('media-playback-next'),

    infoSection: document.getElementById('media-playback-info'),
    inactiveSection: document.getElementById('media-playback-inactive'),

    iconElement: document.getElementById('statusbar-playing'),

    init: function () {
      window.addEventListener('mediaplay', this.handleMediaPlay.bind(this));
      window.addEventListener('mediapause', this.handleMediaPause.bind(this));

      this.infoSection.classList.add('hidden');
      this.inactiveSection.classList.remove('hidden');
    },

    handleMediaPlay: function (event) {
      this.title.textContent = event.detail.title;
      this.artist.textContent = event.detail.artist;

      this.iconElement.classList.remove('hidden');
      this.playPauseButton.dataset.icon = 'pause-alt';
      this.infoSection.classList.remove('hidden');
      this.inactiveSection.classList.add('hidden');
    },

    handleMediaPause: function (event) {
      this.iconElement.classList.add('hidden');
      this.playPauseButton.dataset.icon = 'play-alt';
      this.infoSection.classList.add('hidden');
      this.inactiveSection.classList.remove('hidden');
    }
  };

  MediaPlayback.init();
})(window);
