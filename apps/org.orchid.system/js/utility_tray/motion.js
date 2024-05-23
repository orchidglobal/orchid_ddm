!(function (exports) {
  'use strict';

  const UtilityTrayMotion = {
    screen: document.getElementById('screen'),
    windowContainer: document.getElementById('windows'),
    topPanel: document.getElementById('top-panel'),
    dockStatusbar: document.getElementById('software-buttons-statusbar'),
    motionElement: document.getElementById('utility-tray-motion'),
    controlCenter: document.getElementById('control-center'),
    controlCenterStatusbar: document.getElementById('control-center-statusbar'),
    notifications: document.getElementById('notifications'),

    lastProgress: 0,
    currentProgress: 0,
    isVisible: false,

    SWIPE_THRESHOLD: 0.25,

    /**
     * Initialize the utility tray motion module
     */
    init: function () {
      const gestureTopPanel = new OrchidJS.Gesture(this.topPanel, [0, 1], 150);
      gestureTopPanel.onStart = this.handleGestureStart.bind(this);
      gestureTopPanel.onProgress = this.handleGestureProgress.bind(this);
      gestureTopPanel.onEnd = this.handleGestureEnd.bind(this);

      const gestureMotionElement = new OrchidJS.Gesture(this.motionElement, [0, 1], 150);
      gestureMotionElement.onStart = this.handleGestureStart.bind(this);
      gestureMotionElement.onProgress = this.handleGestureProgress.bind(this);
      gestureMotionElement.onEnd = this.handleGestureEnd.bind(this);

      // If the device is a desktop, listen for click events on the docked statusbar
      if (window.deviceType === 'desktop') {
        this.dockStatusbar.addEventListener('click', this.handleStatusbarClick.bind(this));
      }

      // Get all the row elements in the control center and set their transition order
      this.rowElements = this.controlCenter.querySelectorAll('.control-center-row');
      for (let index = 0, length = this.rowElements.length; index < length; index++) {
        const element = this.rowElements[index];
        element.style.setProperty('--transition-order', index);
      }
    },

    handleGestureStart: function(event) {
      const rtl = (document.dir === 'rtl');

      if (event.clientY <= (this.topPanel.getBoundingClientRect().top + 20)) {
        if ((!rtl && event.clientX < window.innerWidth / 2) || (rtl && event.clientX > window.innerWidth / 2)) {
          this.controlCenter.classList.add('hidden');
          this.notifications.classList.remove('hidden');

          const windowFrame = AppWindow.getFocusedWindow().element;
          const statusbar = windowFrame.statusbar;
          statusbar.classList.remove('right-hidden');
        } else {
          this.controlCenter.classList.remove('hidden');
          this.notifications.classList.add('hidden');

          const windowFrame = AppWindow.getFocusedWindow().element;
          const statusbar = windowFrame.statusbar;
          statusbar.classList.add('right-hidden');
        }
      }

      this.screen.classList.add('utility-tray-visible'); // Add the CSS class to the screen
      this.windowContainer.classList.add('utility-tray-motion'); // Add the CSS class to the windowContainer
      this.motionElement.classList.add('visible'); // Add the CSS class to the motionElement
    },

    handleGestureProgress: function(event, progress, overscroll) {
      const motionProgress = Math.max(0, Math.min(1, this.lastProgress + progress));
      const overflowProgress = Math.max(1, this.lastProgress + (overscroll / 2)) - 1;

      this.currentProgress = motionProgress;

      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.motionElement.style.setProperty('--overscroll-progress', overflowProgress);
      this.windowContainer.style.setProperty('--motion-progress', motionProgress);

      if (motionProgress >= 0.9) {
        this.motionElement.classList.add('buttons-visible');
        this.controlCenterStatusbar.classList.remove('left-hidden');
      } else {
        this.motionElement.classList.remove('buttons-visible');
        this.controlCenterStatusbar.classList.add('left-hidden');
      }
    },

    handleGestureEnd: function(event, progress, overscroll) {
      const motionProgress = Math.max(0, Math.min(1, this.lastProgress + progress));

      if (motionProgress >= this.SWIPE_THRESHOLD) {
        this.show();

        const windowFrame = AppWindow.getFocusedWindow().element;
        const statusbar = windowFrame.statusbar;
        statusbar.classList.add('right-hidden');
      } else {
        this.hide();
      }
    },

    /**
     * Handle click event on the statusbar
     *
     * Toggles the visibility of the utility tray when the user
     * clicks on the statusbar.
     */
    handleStatusbarClick: function () {
      // Toggle the visibility of the utility tray
      this.dockStatusbar.classList.toggle('tray-open', !this.isVisible);

      // If the utility tray is not visible, show it
      if (!this.isVisible) {
        this.show();
      } else {
        // Hide the utility tray
        this.hide();
      }
    },

    /**
     * Hide the motion element.
     *
     * This function is used to hide the motion element when the
     * overscroll effect is about to end, or when the user is
     * not dragging the utility tray anymore.
     */
    hide: function () {
      this.lastProgress = 0; // Set the last progress to 0
      this.isVisible = false; // Set the visibility to false

      this.screen.classList.remove('utility-tray-visible'); // Remove the CSS class from the screen
      this.windowContainer.classList.remove('utility-tray-motion'); // Remove the CSS class from the windowContainer
      this.motionElement.classList.remove('visible'); // Remove the CSS class from the motionElement

      this.motionElement.style.setProperty('--motion-progress', 0);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 0);

      this.motionElement.classList.remove('buttons-visible');
      this.controlCenterStatusbar.classList.add('left-hidden');

      this.timeoutID = setTimeout(() => {
        const windowFrame = AppWindow.getFocusedWindow().element;
        const statusbar = windowFrame.statusbar;
        statusbar.classList.remove('right-hidden');
      }, 300);
    },

    /**
     * Show the motion element.
     *
     * This function is used to show the motion element when the
     * overscroll effect is completed, or when the user is dragging
     * the utility tray.
     */
    show: function () {
      this.lastProgress = 1; // Set the last progress to 1
      this.isVisible = true; // Set the visibility to true

      this.screen.classList.add('utility-tray-visible'); // Add the CSS class to the screen
      this.windowContainer.classList.add('utility-tray-motion'); // Add the CSS class to the windowContainer
      this.motionElement.classList.add('visible'); // Add the CSS class to the motionElement

      if (this.isDragging) { // If the user is dragging the utility tray, return
        return;
      }
      this.motionElement.style.setProperty('--motion-progress', 1);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 1);

      this.motionElement.classList.add('buttons-visible');
      this.controlCenterStatusbar.classList.remove('left-hidden');

      const windowFrame = AppWindow.getFocusedWindow().element;
      const statusbar = windowFrame.statusbar;
      statusbar.classList.add('right-hidden');
    }
  }

  UtilityTrayMotion.init();

  exports.UtilityTrayMotion = UtilityTrayMotion;
})(window);
