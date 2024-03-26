!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Button extends OrchidJS.Vividus2D.Sprite {
    constructor(renderer, imagePath, width, height) {
      super(renderer, imagePath, width, height);
      this.isClickable = true;
      this.isHovered = false;
      this.isPressed = false;
      this.clickHandler = null;

      this.init();
    }

    init(handler) {
      this.renderer.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
      this.renderer.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
      this.renderer.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
    }

    handlePointerDown(event) {
      if (!this.isClickable) {
        return;
      }

      if (event.clientX >= this.x && event.clientX <= this.x + this.width && event.clientY >= this.y && event.clientY <= this.y + this.height) {
        this.isPressed = true;
      }
    }

    handlePointerMove(event) {
      if (!this.isClickable) {
        return;
      }

      if (event.clientX >= this.x && event.clientX <= this.x + this.width && event.clientY >= this.y && event.clientY <= this.y + this.height) {
        this.isHovered = true;
      }
    }

    handlePointerUp(event) {
      if (!this.isClickable) {
        return;
      }

      if (event.clientX >= this.x && event.clientX <= this.x + this.width && event.clientY >= this.y && event.clientY <= this.y + this.height) {
        this.isPressed = false;

        if (this.clickHandler) {
          this.clickHandler();
        }
      }
    }

    onClick(handler) {
      this.clickHandler = handler;
    }
  }

  OrchidJS.Vividus2D.Button = Button;
})(window);
