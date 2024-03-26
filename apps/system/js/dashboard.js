!(function (exports) {
  'use strict';

  const Dashboard = {
    element: document.getElementById('dashboard'),
    overlay: document.getElementById('dashboard-motion'),
    toggleButton: document.getElementById('software-dashboard-button'),

    /**
     * Initializes the dashboard.
     *
     * Registers the click event handler for the dashboard toggle button.
     */
    init: function () {
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
    },

    /**
     * Toggles the visibility of the dashboard and updates the toggle button
     * state according to the new visibility.
     */
    handleToggleButton: function () {
      this.overlay.classList.toggle('visible'); // Toggle the visibility of the dashboard
      this.toggleButton.classList.toggle('active'); // Update the toggle button's state
    },
  };

  Dashboard.init();

  exports.Dashboard = Dashboard;
})(window);
