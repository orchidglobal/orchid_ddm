!(function (exports) {
  'use strict';

  const UtilityTrayMotion = {
    screen: document.getElementById('screen'),
    windowContainer: document.getElementById('windows'),
    topPanel: document.getElementById('top-panel'),
    dockStatusbar: document.getElementById('software-buttons-statusbar'),
    statusbar: document.getElementById('statusbar'),
    motionElement: document.getElementById('utility-tray-motion'),
    controlCenter: document.getElementById('control-center'),
    notifications: document.getElementById('notifications'),

    startY: 0,
    currentY: 0,
    isDragging: false,
    threshold: 0.25,
    lastProgress: 0,
    currentProgress: 0,
    isVisible: false,

    /**
     * Initialize the utility tray motion module
     */
    init: function () {
      // Listen for pointerdown events on the top panel and motion element
      this.topPanel.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.motionElement.addEventListener('pointerdown', this.onPointerDown.bind(this));

      // Listen for pointermove, pointerup, and pointercancel events on the document
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));
      document.addEventListener('pointercancel', this.onPointerCancel.bind(this));

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

    /**
     * Handle start of the gesture
     *
     * @param {Object} event - pointerdown event
     */
    onPointerDown: function (event) {
      // If the target of the event is not a link, button or input, we ignore the event
      if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON' || event.target.nodeName === 'INPUT') {
        return;
      }

      // Save the start position of the gesture
      this.startY = event.clientY;

      // Set the current position to the start position
      this.currentY = this.startY;

      // Set the flag that we are currently dragging
      this.isDragging = true;

      // Show the utility tray
      this.screen.classList.add('utility-tray-visible');

      // Add motion class to the statusbar and windowContainer
      this.statusbar.classList.add('utility-tray-motion');
      this.windowContainer.classList.add('utility-tray-motion');
    },

    /**
     * Handle movement of the gesture
     *
     * @param {Object} event - pointermove event
     */
    onPointerMove: function (event) {
      // If the user is not dragging or it's a desktop device, return
      if (!this.isDragging || window.deviceType === 'desktop') {
        return;
      }

      // If the target is the top panel, update its opacity based on the
      // position of the user's finger
      if (event.target === this.topPanel) {
        if (event.clientX >= window.innerWidth / 2) {
          this.controlCenter.classList.add('hidden');
          this.notifications.classList.remove('hidden');
        } else {
          this.controlCenter.classList.remove('hidden');
          this.notifications.classList.add('hidden');
        }
      }

      // Calculate the offset between the start and current position of the user's
      // finger
      this.currentY = event.clientY;
      const offsetY = this.startY - this.currentY;

      // Calculate the maximum height that can be scrolled based on the
      // progress of the previous gesture
      const maxHeight = window.innerHeight * Math.abs(this.lastProgress - this.threshold);

      // Calculate the progress based on the offset and maximum height
      const progress = (offsetY / maxHeight) * -1;

      this.updateMotionProgress(progress); // Update motion element opacity
    },

    /**
     * Handle end of the gesture
     *
     * @param {Object} event - pointerup event
     */
    onPointerUp: function (event) {
      // Update the currentY position
      this.currentY = event.clientY || event.touches[0].clientY;
      // Calculate the offset between startY and currentY
      const offsetY = this.startY - this.currentY;
      // Calculate the maxHeight based on the threshold
      const maxHeight = window.innerHeight * Math.abs(this.lastProgress - this.threshold);
      // Calculate the progress based on the offset and maxHeight
      let progress = ((offsetY / maxHeight) * -1) / 2;
      progress = this.lastProgress + progress;

      // Limit progress between 0 and 1
      progress = Math.min(1, progress);

      // If progress is above the threshold, show the statusbar
      if (progress >= Math.abs(this.lastProgress - this.threshold)) {
        this.currentProgress = 1;
        this.lastProgress = this.currentProgress;
        // Update styles and add transitioning classes
        this.statusbar.style.setProperty('--motion-progress', 1);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 1);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.windowContainer.style.setProperty('--motion-progress', 1);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        // Clear timer and set a new timeout to remove transitioning classes
        clearTimeout(this.timer);
        this.timeoutID = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      } else { // Otherwise, hide the statusbar
        this.currentProgress = 0;
        this.lastProgress = this.currentProgress;
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.windowContainer.style.setProperty('--motion-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timeoutID = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
        this.hideMotionElement();
      }

      // Reset isDragging flag
      this.isDragging = false;
    },

    /**
     * Handle cancellation of the gesture
     *
     * If the user cancels the gesture, we need to reset the
     * motion element, and clear the isDragging flag.
     */
    onPointerCancel: function () {
      if (!this.isDragging) {
        return;
      }

      this.resetMotionElement();

      // Reset isDragging flag
      this.isDragging = false;
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
        this.showMotionElement();
      } else {
        // Hide the utility tray
        this.hideMotionElement();
      }
    },

    /**
     * Updates the progress of the motion element
     *
     * @param {number} progress The progress of the overscroll gesture
     */
    updateMotionProgress: function (progress) {
      // Update the progress of the overscroll gesture between 0 and 1
      const motionProgress = Math.max(0, Math.min(1, this.lastProgress + progress));

      // Calculate the overflow progress
      const overflowProgress = Math.max(1, this.lastProgress + progress) - 1;

      // Store the current progress
      this.currentProgress = motionProgress;

      // Update the CSS variables
      this.statusbar.style.setProperty('--motion-progress', motionProgress);
      this.statusbar.style.setProperty('--overscroll-progress', overflowProgress);
      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.motionElement.style.setProperty('--overscroll-progress', overflowProgress);
      this.windowContainer.style.setProperty('--motion-progress', motionProgress);

      // Show/hide the utility tray buttons
      if (motionProgress >= 0.9) {
        this.motionElement.classList.add('buttons-visible');
      } else {
        this.motionElement.classList.remove('buttons-visible');
      }

      // Check if the motion element should be hidden/shown
      if (motionProgress <= Math.abs(this.lastProgress - this.threshold)) {
        // Hide the motion element
        this.motionElement.classList.add('fade-out');
        this.motionElement.classList.remove('fade-in');
      } else {
        // Show the motion element
        this.showMotionElement();
        this.motionElement.classList.add('fade-in');
        this.motionElement.classList.remove('fade-out');
      }
    },

    /**
     * Hide the motion element.
     *
     * This function is used to hide the motion element when the
     * overscroll effect is about to end, or when the user is
     * not dragging the utility tray anymore.
     */
    hideMotionElement: function () {
      this.lastProgress = 0; // Set the last progress to 0
      this.isVisible = false; // Set the visibility to false

      this.screen.classList.remove('utility-tray-visible'); // Remove the CSS class from the screen
      this.statusbar.classList.remove('utility-tray-motion'); // Remove the CSS class from the statusbar
      this.windowContainer.classList.remove('utility-tray-motion'); // Remove the CSS class from the windowContainer
      this.motionElement.classList.remove('visible'); // Remove the CSS class from the motionElement

      this.statusbar.style.setProperty('--motion-progress', 0); // Set the CSS variables to 0
      this.statusbar.style.setProperty('--overscroll-progress', 0);
      this.motionElement.style.setProperty('--motion-progress', 0);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 0);

      this.motionElement.classList.remove('buttons-visible'); // Remove the CSS class to hide the buttons
    },

    /**
     * Show the motion element.
     *
     * This function is used to show the motion element when the
     * overscroll effect is completed, or when the user is dragging
     * the utility tray.
     */
    showMotionElement: function () {
      this.lastProgress = 1; // Set the last progress to 1
      this.isVisible = true; // Set the visibility to true

      this.screen.classList.add('utility-tray-visible'); // Add the CSS class to the screen
      this.statusbar.classList.add('utility-tray-motion'); // Add the CSS class to the statusbar
      this.windowContainer.classList.add('utility-tray-motion'); // Add the CSS class to the windowContainer
      this.motionElement.classList.add('visible'); // Add the CSS class to the motionElement

      if (this.isDragging) { // If the user is dragging the utility tray, return
        return;
      }
      this.statusbar.style.setProperty('--motion-progress', 1); // Set the CSS variables to 1
      this.statusbar.style.setProperty('--overscroll-progress', 0);
      this.motionElement.style.setProperty('--motion-progress', 1);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 1);

      this.motionElement.classList.add('buttons-visible'); // Add the CSS class to show the buttons
    },

    /**
     * Reset the motion element to its initial state.
     *
     * This function is used to reset the motion element when the
     * overscroll effect is cancelled.
     */
    resetMotionElement: function() {
      this.currentProgress = 0; // Reset the progress to 0

      this.statusbar.style.setProperty('--motion-progress', 0); // Reset style
      this.statusbar.style.setProperty('--overscroll-progress', 0); // Reset style
      this.motionElement.style.setProperty('--motion-progress', 0); // Reset style
      this.motionElement.style.setProperty('--overscroll-progress', 0); // Reset style
      this.windowContainer.style.setProperty('--motion-progress', 0); // Reset style

      this.statusbar.classList.add('transitioning'); // Add transitioning class
      this.motionElement.classList.add('transitioning'); // Add transitioning class

      this.motionElement.classList.add('buttons-visible'); // Show the motion buttons

      clearTimeout(this.timer);
      this.timer = setTimeout(() => { // Remove transitioning class after the animation is finished
        this.statusbar.classList.remove('transitioning');
        this.motionElement.classList.remove('transitioning');
      }, 10);
    }
  }

  UtilityTrayMotion.init();
})(window);
