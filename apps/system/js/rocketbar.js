!(function (exports) {
  'use strict';

  const Rocketbar = {
    overlay: document.getElementById('rocketbar'),
    toggleButton: document.getElementById('software-search-button'),

    isVisible: false,

    init: function () {
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
    },

    handleToggleButton: function () {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    },

    show: function () {
      this.isVisible = true;
      this.overlay.classList.add('visible');
      this.toggleButton.classList.add('active');
    },

    hide: function () {
      this.isVisible = false;
      this.overlay.classList.remove('visible');
      this.toggleButton.classList.remove('active');
    }
  };

  Rocketbar.init();

  exports.Rocketbar = Rocketbar;
})(window);
