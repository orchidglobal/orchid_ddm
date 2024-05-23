!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Sprite {
    constructor(renderer, imagePath, width, height) {
      this.renderer = renderer;

      this.image = new Image();
      this.image.src = imagePath;
      this.imageUrl = imagePath;

      // this.lightmapImage = new Image();
      // this.lightmapImage.src = imagePath.replace('.png', '@lightmap.png');
      // this.lightmapImageUrl = imagePath.replace('.png', '@lightmap.png');

      this.isContainer = false;
      this.isLightingAffected = true;
      this.isAlwaysShown = false;

      this.width = width;
      this.height = height;

      this.pivotX = width / 2;
      this.pivotY = height / 2;

      this.x = 0;
      this.y = 0;
      this.translateX = 0;
      this.translateY = 0;
      this.rotation = 0;
      this.rotationY = 180;
      this.scaleX = 1;
      this.scaleY = 1;

      this.renderX = this.x;
      this.renderY = this.y;
      this.renderScaleX = this.scaleX;
      this.renderScaleY = this.scaleY;

      this.children = [];
      this.childrenPre = [];
      this.parent = null;
      this.userData = {};

      OrchidJS.Vividus2D.children.push(this);
    }

    addPreChild(child) {
      this.childrenPre.push(child);
      child.parent = this;

      const index = OrchidJS.Vividus2D.children.indexOf(child);
      OrchidJS.Vividus2D.children.splice(index, 1);
    }

    addChild(child) {
      this.children.push(child);
      child.parent = this;

      const index = OrchidJS.Vividus2D.children.indexOf(child);
      OrchidJS.Vividus2D.children.splice(index, 1);
    }

    draw() {
      if (!this.parent && !this.isAlwaysShown && !this.isVisible()) {
        return;
      }

      if (!this.parent) {
        this.renderX = this.x + this.translateX;
        this.renderY = this.y + this.translateY;
        this.renderScaleX = this.scaleX;
        this.renderScaleY = this.scaleY;
      }

      const scale = this.degToScale(this.rotationY);
      this.renderer.context.save();

      // this.rotationY += 10;
      if (this.rotationY < -180) {
        this.rotationY = 180;
      }
      if (this.rotationY > 180) {
        this.rotationY = -180;
      }

      // Translate to the sprite's position
      this.renderer.context.translate(this.renderX + this.pivotX, this.renderY + this.pivotY);
      this.renderer.context.rotate((this.rotation / 360) * Math.PI);
      this.renderer.context.translate(
        -this.pivotX + this.pivotX * (1 - this.renderScaleX),
        -this.pivotY + this.pivotY * (1 - this.renderScaleY)
      );
      this.renderer.context.scale(this.renderScaleX, this.renderScaleY);

      // Draw pre-children
      if (scale < 0) {
        for (const child of this.children) {
          this.drawChild(child);
        }
      } else {
        for (const child of this.childrenPre) {
          this.drawChild(child);
        }
      }

      // Draw the image
      if (this.isLightingAffected) {
        this.renderer.context.drawImage(this.image, 0, 0, this.width, this.height);
        // this.renderer.context.filter = 'none';
      } else {
        this.renderer.context.drawImage(this.image, 0, 0, this.width, this.height);
      }

      // try {
      //   this.renderer.context.globalAlpha = 1 - OrchidJS.Vividus2D.worldBrightness;
      //   this.renderer.context.drawImage(this.lightmapImage, 0, 0, this.width, this.height);
      //   this.renderer.context.globalAlpha = 1;
      // } catch (error) {}

      // Draw children
      if (scale >= 0) {
        for (const child of this.children) {
          this.drawChild(child);
        }
      } else {
        for (const child of this.childrenPre) {
          this.drawChild(child);
        }
      }

      this.renderer.context.restore();
    }

    isVisible() {
      // If the sprite's bounding box isn't intersecting the screen area, it's not visible
      const bbox = this.getBoundingBox();
      const viewportBox = { x: 0, y: 0, width: this.renderer.viewWidth, height: this.renderer.viewHeight };
      if (!OrchidJS.Vividus2D.areaIntersects(bbox, viewportBox)) {
        return false;
      }

      return true;
    }

    getBoundingBox() {
      const x = this.x - this.width;
      const y = this.y - this.height;
      const width = this.width * this.scaleX;
      const height = this.height * this.scaleY;

      return { x, y, width, height };
    }

    degToScale(degrees) {
      degrees = Math.abs(degrees);

      // Handle values outside the 0-180 range
      if (degrees > 180) {
        return -1;
      }

      // Normalize the value to 0-180 (optional)
      degrees = degrees % 360; // This handles values beyond 360 (e.g., 360 becomes 0)

      // Convert to the desired range (-1 to 1)
      const range = (degrees / 180) * 2 - 1;
      return range;
    }

    degToOffset(degrees) {
      // Clamp the degrees to the valid range
      degrees = Math.max(-90, Math.min(degrees, 90));

      // Normalize the value to -1 to 1 range
      const normalizedValue = degrees / 90;

      return normalizedValue;
    }

    drawChild(child) {
      if (child.isContainer) {
        child.renderX = child.x + child.translateX;
        child.renderY = child.y + child.translateY;
        child.renderScaleX = child.scaleX;
        child.renderScaleY = child.scaleY;
        child.draw();
        return;
      }

      const scale = this.degToScale(this.rotationY);
      const offset = this.degToOffset(this.rotationY);

      child.renderX = child.x + child.translateX;
      child.renderY = child.y + child.translateY;
      child.renderScaleX = child.scaleX * scale;
      child.renderScaleY = child.scaleY;
      child.draw();
    }
  }

  OrchidJS.Vividus2D.Sprite = Sprite;
})(window);
