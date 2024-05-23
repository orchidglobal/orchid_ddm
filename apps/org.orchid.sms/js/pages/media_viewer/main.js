!(function (exports) {
  'use strict';

  const MediaViewer = {
    element: document.getElementById('media-viewer'),
    backButton: document.getElementById('media-viewer-back-button'),
    carousel: document.getElementById('media-viewer-carousel'),

    targetElement: null,
    targetMediaElement: null,

    init: async function () {
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));
      this.carousel.addEventListener('scroll', this.handleCarouselSwipe.bind(this));
    },

    handleBackButton: function () {
      this.element.classList.remove('visible');
      Transitions.scale(this.targetMediaElement, this.targetElement);
    },

    handleCarouselSwipe: function () {
      // ...
    },

    load: async function (media, targetIndex, element = null) {
      this.carousel.innerHTML = '';
      this.element.classList.add('visible');

      for (let index = 0, length = media.length; index < length; index++) {
        const mediaData = media[index];
        const url = await _os.storage.get(`messages/${mediaData.path}.${mediaData.mime.split('/')[1]}`);

        if (mediaData.mime.startsWith('video/')) {
          const mediaVideo = document.createElement('video');
          mediaVideo.classList.add('video');
          mediaVideo.src = url;
          mediaVideo.controls = true;
          this.carousel.appendChild(mediaVideo);

          if (index === targetIndex) {
            mediaVideo.scrollIntoView();
            if (element) {
              Transitions.scale(element, mediaVideo);
              this.targetElement = element;
              this.targetMediaElement = mediaVideo;
            }
          }
        } else {
          const mediaImage = document.createElement('img');
          mediaImage.classList.add('image');
          mediaImage.src = url;
          this.carousel.appendChild(mediaImage);

          if (index === targetIndex) {
            mediaImage.scrollIntoView();
            if (element) {
              Transitions.scale(element, mediaImage);
              this.targetElement = element;
              this.targetMediaElement = mediaImage;
            }
          }
        }
      }
    }
  };

  MediaViewer.init();

  exports.MediaViewer = MediaViewer;
})(window);
