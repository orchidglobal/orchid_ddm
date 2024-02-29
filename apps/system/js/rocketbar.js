!(function (exports) {
  'use strict';

  const Rocketbar = {
    overlay: document.getElementById('rocketbar'),
    toggleButton: document.getElementById('software-search-button'),
    appLauncher: document.getElementById('app-launcher'),
    dashboard: document.getElementById('dashboard'),

    isVisible: false,

    init: function () {
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
    },

    handleToggleButton: function () {
      this.overlay.classList.toggle('visible');
      this.toggleButton.classList.toggle('active');

      this.appLauncher.classList.remove('visible');
      this.dashboard.classList.remove('visible');
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
