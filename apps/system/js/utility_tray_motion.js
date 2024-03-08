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

    init: function () {
      this.topPanel.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.motionElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
      document.addEventListener('pointermove', this.onPointerMove.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));
      document.addEventListener('pointercancel', this.onPointerCancel.bind(this));

      if (window.deviceType === 'desktop') {
        this.dockStatusbar.addEventListener('click', this.handleStatusbarClick.bind(this));
      }

      this.rowElements = this.controlCenter.querySelectorAll('.control-center-row');
      for (let index = 0, length = this.rowElements.length; index < length; index++) {
        const element = this.rowElements[index];
        element.style.setProperty('--transition-order', index);
      }
    },

    onPointerDown: function (event) {
      if (event.target.nodeName === 'A' || event.target.nodeName === 'BUTTON' || event.target.nodeName === 'INPUT') {
        return;
      }
      this.startY = event.clientY || event.touches[0].clientY;
      this.currentY = this.startY;
      this.isDragging = true;
      this.screen.classList.add('utility-tray-visible');
      this.statusbar.classList.add('utility-tray-motion');
      this.windowContainer.classList.add('utility-tray-motion');
    },

    onPointerMove: function (event) {
      if (!this.isDragging) {
        return;
      }
      if (window.deviceType === 'desktop') {
        return;
      }

      if (event.target === this.topPanel) {
        if ((event.clientX || event.touches[0].clientX) >= window.innerWidth / 2) {
          this.controlCenter.classList.add('hidden');
          this.notifications.classList.remove('hidden');
        } else {
          this.controlCenter.classList.remove('hidden');
          this.notifications.classList.add('hidden');
        }
      }

      this.currentY = event.clientY || event.touches[0].clientY;
      const offsetY = this.startY - this.currentY;
      const maxHeight = window.innerHeight * Math.abs(this.lastProgress - this.threshold);
      const progress = (offsetY / maxHeight) * -1;

      this.updateMotionProgress(progress); // Update motion element opacity
    },

    onPointerUp: function (event) {
      this.currentY = event.clientY || event.touches[0].clientY;
      const offsetY = this.startY - this.currentY;
      const maxHeight = window.innerHeight * Math.abs(this.lastProgress - this.threshold);
      let progress = ((offsetY / maxHeight) * -1) / 2;
      progress = this.lastProgress + progress;

      progress = Math.min(1, progress); // Limit progress between 0 and 1

      if (progress >= Math.abs(this.lastProgress - this.threshold)) {
        this.currentProgress = 1;
        this.lastProgress = this.currentProgress;
        this.statusbar.style.setProperty('--motion-progress', 1);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 1);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.windowContainer.style.setProperty('--motion-progress', 1);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');
        clearTimeout(this.timer);
        this.timeoutID = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      } else {
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

      this.isDragging = false;
    },

    onPointerCancel: function () {
      if (!this.isDragging) {
        return;
      }
      this.resetMotionElement();
      this.isDragging = false;
    },

    handleStatusbarClick: function () {
      this.dockStatusbar.classList.toggle('tray-open', !this.isVisible);
      if (!this.isVisible) {
        this.showMotionElement();
      } else {
        this.hideMotionElement();
      }
    },

    updateMotionProgress: function (progress) {
      progress = this.lastProgress + progress;
      const motionProgress = Math.max(0, Math.min(1, progress)); // Limit progress between 0 and 1;
      const overflowProgress = Math.max(1, progress) - 1;
      this.currentProgress = motionProgress;
      this.statusbar.style.setProperty('--motion-progress', motionProgress);
      this.statusbar.style.setProperty('--overscroll-progress', overflowProgress);
      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.motionElement.style.setProperty('--overscroll-progress', overflowProgress);
      this.windowContainer.style.setProperty('--motion-progress', motionProgress);

      if (progress >= 0.9) {
        this.motionElement.classList.add('buttons-visible');
      } else {
        this.motionElement.classList.remove('buttons-visible');
      }

      if (motionProgress <= Math.abs(this.lastProgress - this.threshold)) {
        this.motionElement.classList.add('fade-out');
        this.motionElement.classList.remove('fade-in');
      } else {
        this.showMotionElement();
        this.motionElement.classList.add('fade-in');
        this.motionElement.classList.remove('fade-out');
      }
    },

    hideMotionElement: function () {
      this.lastProgress = 0;
      this.isVisible = false;
      this.screen.classList.remove('utility-tray-visible');
      this.statusbar.classList.remove('utility-tray-motion');
      this.windowContainer.classList.remove('utility-tray-motion');
      this.motionElement.classList.remove('visible');
      this.statusbar.style.setProperty('--motion-progress', 0);
      this.statusbar.style.setProperty('--overscroll-progress', 0);
      this.motionElement.style.setProperty('--motion-progress', 0);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 0);

      this.motionElement.classList.remove('buttons-visible');
    },

    showMotionElement: function () {
      this.lastProgress = 1;
      this.isVisible = true;
      this.screen.classList.add('utility-tray-visible');
      this.statusbar.classList.add('utility-tray-motion');
      this.windowContainer.classList.add('utility-tray-motion');
      this.motionElement.classList.add('visible');

      if (this.isDragging) {
        return;
      }
      this.statusbar.style.setProperty('--motion-progress', 1);
      this.statusbar.style.setProperty('--overscroll-progress', 0);
      this.motionElement.style.setProperty('--motion-progress', 1);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.windowContainer.style.setProperty('--motion-progress', 1);

      this.motionElement.classList.add('buttons-visible');
    },

    resetMotionElement: function () {
      const offsetY = this.startY - this.currentY;
      const maxHeight = window.innerHeight * Math.abs(this.lastProgress - this.threshold);
      const progress = 1 - offsetY / maxHeight;

      if (progress >= Math.abs(this.lastProgress - this.threshold)) {
        this.currentProgress = 0;
        this.statusbar.style.setProperty('--motion-progress', 0);
        this.statusbar.style.setProperty('--overscroll-progress', 0);
        this.motionElement.style.setProperty('--motion-progress', 0);
        this.motionElement.style.setProperty('--overscroll-progress', 0);
        this.windowContainer.style.setProperty('--motion-progress', 0);
        this.statusbar.classList.add('transitioning');
        this.motionElement.classList.add('transitioning');

        this.motionElement.classList.add('buttons-visible');
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.statusbar.classList.remove('transitioning');
          this.motionElement.classList.remove('transitioning');
        }, 500);
      }
    }
  };

  UtilityTrayMotion.init();
})(window);
