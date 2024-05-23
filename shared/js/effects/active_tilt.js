!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  class ActiveTilt {
    constructor(element) {
      this.element = element;
      this.isPressed = {
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false
      };

      this.init();
    }

    init() {
      this.element.addEventListener('pointerdown', this.onPointerDown.bind(this));
      document.addEventListener('pointerup', this.onPointerUp.bind(this));
    }

    onPointerDown(event) {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;

      if (distanceX > 0 && distanceY > 0) {
        this.isPressed.topRight = true;
      } else if (distanceX < 0 && distanceY > 0) {
        this.isPressed.topLeft = true;
      } else if (distanceX > 0 && distanceY < 0) {
        this.isPressed.bottomRight = true;
      } else {
        this.isPressed.bottomLeft = true;
      }

      this.element.classList.toggle('tilt-top-right', this.isPressed?.topRight);
      this.element.classList.toggle('tilt-top-left', this.isPressed?.topLeft);
      this.element.classList.toggle('tilt-bottom-right', this.isPressed?.bottomRight);
      this.element.classList.toggle('tilt-bottom-left', this.isPressed?.bottomLeft);
    }

    onPointerUp(event) {
      Object.keys(this.isPressed).forEach((corner) => {
        this.isPressed[corner] = false;
      });

      this.element.classList.toggle('tilt-top-right', this.isPressed?.topRight);
      this.element.classList.toggle('tilt-top-left', this.isPressed?.topLeft);
      this.element.classList.toggle('tilt-bottom-right', this.isPressed?.bottomRight);
      this.element.classList.toggle('tilt-bottom-left', this.isPressed?.bottomLeft);
    }
  }

  OrchidJS.ActiveTilt = ActiveTilt;
})(window);
