!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Button extends OrchidJS.Vividus2D.Sprite {
    constructor(renderer, imagePath, label, x, y, width, height) {
      super(renderer, imagePath, width, height);

      this.x = x;
      this.y = y;
      this.label = label;
      this.pivotX = width / 2;
      this.pivotY = height / 2;
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

    draw() {
      if (this.isPressed) {
        this.scaleX += (0.9 - this.scaleX) * 0.5;
        this.scaleY += (0.9 - this.scaleY) * 0.5;
      } else {
        this.scaleX += (1 - this.scaleX) * 0.5;
        this.scaleY += (1 - this.scaleY) * 0.5;
      }

      super.draw();

      this.renderer.context.textAlign = 'center';
      this.renderer.context.textBaseline = 'middle';
      this.renderer.context.font = `${20 * this.scaleY}px bold system-ui`;
      this.renderer.context.fillStyle = '#ffffff';
      this.renderer.context.fillText(this.label, this.x + this.width / 2, this.y + this.height / 2);
      this.renderer.context.textAlign = 'start';
    }
  }

  OrchidJS.Vividus2D.Button = Button;
})(window);

