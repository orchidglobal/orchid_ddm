!(function (exports) {
  'use strict';

  const GesturePanels = {
    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    windowContainer: document.getElementById('windows'),
    leftCorner: document.getElementById('action-corner-left'),
    rightCorner: document.getElementById('action-corner-right'),
    topPanel: document.getElementById('top-panel'),
    leftPanel: document.getElementById('left-panel'),
    rightPanel: document.getElementById('right-panel'),
    bottomPanel: document.getElementById('bottom-panel'),

    isDragging: false,
    isLeftCorner: false,
    isRightCorner: false,
    startY: false,

    init: function () {
      this.bottomPanel.addEventListener('pointerdown', this.handleBottomPanel.bind(this));
      document.addEventListener('pointermove', this.handlePointerMove.bind(this));
      document.addEventListener('pointerup', this.handlePointerUp.bind(this));

      document.addEventListener('click', () => {
        this.screen.classList.remove('close-reach');
      });
    },

    handleBottomPanel: function (event) {
      // event.preventDefault();
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.isDragging = true;
      this.windowContainer.classList.add('dragging');

      const focusedWindow = AppWindow.getFocusedWindow();
      if (focusedWindow.chrome) {
        focusedWindow.chrome.updatePreview();
      }

      this.isLeftCorner = false;
      this.isRightCorner = false;
      if (this.startX < (window.innerWidth / 3)) {
        this.isLeftCorner = true;
        this.leftCorner.classList.add('visible');
      }
      if (this.startX > ((window.innerWidth / 3) * 2)) {
        this.isRightCorner = true;
        this.rightCorner.classList.add('visible');
      }
    },

    handlePointerMove: function (event) {
      // event.preventDefault();
      if (!this.isDragging) {
        return;
      }
      const currentXPosition = event.clientX;
      const currentYPosition = event.clientY;
      const distanceX = currentXPosition - this.startX;
      const distanceY = currentYPosition - this.startY;

      const translateX = distanceX / 2;
      const translateY = Math.min(0, distanceY / 2);
      const cornerProgress = Math.min(1, distanceY / -100);

      if (this.isLeftCorner || this.isRightCorner) {
        Assistant.showGradually(1 - cornerProgress);
        return;
      }
      const focusedWindow = AppWindow.getFocusedWindow();
      const scale = Math.min(1, window.innerHeight / (window.innerHeight - distanceY));

      // Move the window along the Y-axis based on the dragging distance
      if (!focusedWindow.element.dataset.oldTransformOrigin) {
        focusedWindow.element.dataset.oldTransformOrigin = focusedWindow.element.style.transformOrigin;
      }
      if (focusedWindow.instanceID === 'homescreen') {
        focusedWindow.element.style.transformOrigin = 'center';
        this.wallpapersContainer.classList.add('homescreen-to-cards-view');
        this.wallpapersContainer.style.setProperty('--motion-progress', Math.min(1, (1 - scale) * 2));
        focusedWindow.element.style.transform = `scale(${0.75 + scale * 0.25})`;
        focusedWindow.element.style.setProperty('--offset-x', 0);
        focusedWindow.element.style.setProperty('--offset-y', 0);
        focusedWindow.element.style.setProperty('--scale', scale);
      } else {
        focusedWindow.element.style.transformOrigin = 'center bottom';
        focusedWindow.element.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        focusedWindow.element.style.setProperty('--offset-x', `${translateX}px`);
        focusedWindow.element.style.setProperty('--offset-y', `${translateY}px`);
        focusedWindow.element.style.setProperty('--scale', scale);
      }
    },

    handlePointerUp: function (event) {
      // event.preventDefault();
      if (!this.isDragging) {
        return;
      }
      const currentXPosition = event.clientX;
      const currentYPosition = event.clientY;
      const distanceX = currentXPosition - this.startX;
      const distanceY = currentYPosition - this.startY;
      const cornerProgress = Math.min(1, distanceY / -100);

      this.startX = null;
      this.startY = null;
      this.isDragging = false;

      if (this.isLeftCorner || this.isRightCorner) {
        this.leftCorner.classList.remove('visible');
        this.rightCorner.classList.remove('visible');

        if (cornerProgress >= 0.5) {
          Assistant.show();
        } else {
          Assistant.hide();
        }
        return;
      }
      const focusedWindow = AppWindow.getFocusedWindow();

      // Reset the window transform
      if (!focusedWindow.element.dataset.oldTransformOrigin) {
        focusedWindow.element.style.transformOrigin = focusedWindow.element.dataset.oldTransformOrigin;
      }

      this.windowContainer.classList.remove('dragging');
      if (distanceY <= -300) {
        CardsView.show();
      } else if (distanceY <= -50) {
        CardsView.hide();
        if (focusedWindow) {
          focusedWindow.minimize();
          focusedWindow.element.style.transform = '';
        } else {
          Webapps.getWindowById('homescreen').focus();
        }
      } else if (distanceY >= 5) {
        CardsView.hide();
        requestAnimationFrame(() => {
          this.screen.classList.add('close-reach');
        });
      } else {
        focusedWindow.element.classList.add('transitioning');
        focusedWindow.element.addEventListener('transitionend', () => {
          focusedWindow.element.classList.remove('transitioning');
        });
      }
      focusedWindow.element.style.transform = '';
    }
  };

  GesturePanels.init();
})(window);
