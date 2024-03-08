!(function (exports) {
  'use strict';

  const Dashboard = {
    element: document.getElementById('dashboard'),
    overlay: document.getElementById('dashboard-motion'),
    toggleButton: document.getElementById('software-dashboard-button'),

    init: function () {
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
    },

    handleToggleButton: function () {
      this.overlay.classList.toggle('visible');
      this.toggleButton.classList.toggle('active');
    }
  };

  Dashboard.init();

  exports.Dashboard = Dashboard;
})(window);
