'use strict';

class Vividus2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = this.canvas?.getContext('2d');
    this.guiInstance = this;

    this.init();
    this.initializeGui();
    this.drawScreen();
    this.update();
  }

  init() {
    if (!this.canvas) {
      return;
    }
    this.canvas.width = window.innerWidth * devicePixelRatio;
    this.canvas.height = window.innerHeight * devicePixelRatio;
    this.context?.scale(devicePixelRatio, devicePixelRatio);
  }

  setInstance(instance) {
    this.guiInstance = instance;
    this.guiInstance.initializeGui();
    this.guiInstance.drawScreen();
  }

  drawRect(fillStyle, x, y, width, height) {
    if (!this.context) {
      return;
    }
    this.context.fillStyle = fillStyle;
    this.context.fillRect(x, y, width, height);
  }

  drawImageRect(imageUrl, height) {
    if (!this.context) {
      return;
    }
    const image = new Image();
    image.src = imageUrl;
    this.context.drawImage(image, x, y, width, height);
  }

  drawString(text, fillStyle, fontStyle, x, y, width) {
    if (!this.context) {
      return;
    }
    this.context.fillStyle = fillStyle;
    if (typeof fontStyle === 'string') {
      this.context.font = fontStyle;
    } else {
      this.context.font = `${fontStyle}px`;
    }
    this.context.textBaseline = 'top';
    this.context.fillText(text, x, y, width);
    this.context.font = '16px system-ui';
  }

  drawStringWithShadow(text, fillStyle, fontStyle, x, y, width) {
    if (!this.context) {
      return;
    }
    if (typeof fontStyle === 'string') {
      this.context.font = fontStyle;
    } else {
      this.context.font = `${fontStyle}px`;
    }
    this.context.textBaseline = 'top';

    this.context.fillStyle = fillStyle;
    this.context.fillText(text, x + 1, y + 1, width);
    this.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.context.fillText(text, x + 1, y + 1, width);
    this.context.fillStyle = fillStyle;
    this.context.fillText(text, x, y, width);
    this.context.font = '16px system-ui';
  }

  translate(x, y) {
    this.context?.translate(x, y);
  }

  rotate(deg) {
    this.context?.rotate(deg);
  }

  setAlpha(alpha) {
    if (!this.context) {
      return;
    }
    this.context.globalAlpha = alpha;
  }

  initialize() {
    // Overridable function
    return;
  }

  drawScreen() {
    // Overridable function
    return;
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    if (!this.context) {
      return;
    }
    this.context.translate(0, 0);
    this.context.globalAlpha = 1;
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.guiInstance.drawScreen();
  }
}
