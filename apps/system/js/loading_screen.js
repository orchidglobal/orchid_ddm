!(function (exports) {
  'use strict';

  const LoadingScreen = {
    element: document.getElementById('loading-screen'),
    text: document.getElementById('loading-screen-text'),

    show: function (text) {
      this.element.classList.add('visible');
      if (text) {
        this.text.textContext = text;
        this.element.classList.remove('icon');
      } else {
        this.element.classList.add('icon');
      }
    },

    hide: function () {
      this.element.classList.remove('visible', 'icon');
      this.element.addEventListener('transitionend', () => {
        this.text.textContent = '';
      });
    }
  };

  exports.LoadingScreen = LoadingScreen;
})(window);

