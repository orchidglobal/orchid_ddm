!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Sprite {
    constructor(imagePath, width, height) {
      this.image = new Image();
      this.image.src = imagePath;
      this.imageUrl = imagePath;

      this.lightmapImage = new Image();
      this.lightmapImage.src = imagePath.replace('.png', '@lightmap.png');
      this.lightmapImageUrl = imagePath.replace('.png', '@lightmap.png');
      this.isLightingAffected = true;

      this.width = width;
      this.height = height;

      this.pivotX = width / 2;
      this.pivotY = height / 2;

      this.x = 0;
      this.y = 0;
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;

      this.children = [];
      this.parent = null;
      this.userData = {};

      // We only need to add the Sprite to the children array if it has children
      if (this.children.length) {
        OrchidJS.Vividus2D.children.push(this);
      }
    }

    addChild(child) {
      this.children.push(child);
      child.parent = this;

      const index = OrchidJS.Vividus2D.children.indexOf(child);
      OrchidJS.Vividus2D.children.splice(index, 1);
    }

    draw(context) {
      if (!this.parent && !this.isVisible()) {
        return;
      }
      context.save();

      // Translate to the sprite's position
      context.translate(this.x + this.pivotX, this.y + this.pivotY);
      context.rotate(this.rotation);
      context.translate(-this.pivotX + this.pivotX * (1 - this.scaleX), -this.pivotY + this.pivotY * (1 - this.scaleY));
      context.scale(this.scaleX, this.scaleY);

      // Draw the image
      if (this.isLightingAffected) {
        context.filter = `brightness(${OrchidJS.Vividus2D.worldBrightness})`;
      }
      context.drawImage(this.image, 0, 0, this.width, this.height);
      context.filter = 'none';

      try {
        context.globalAlpha = 1 - OrchidJS.Vividus2D.worldBrightness;
        context.drawImage(this.lightmapImage, 0, 0, this.width, this.height);
        context.globalAlpha = 1;
      } catch (error) {}

      // Draw children
      for (const child of this.children) {
        child.draw(context);
      }

      context.restore();
    }

    isVisible() {
      // If the sprite's bounding box isn't intersecting the screen area, it's not visible
      const bbox = this.getBoundingBox();
      const viewportBox = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
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
  }

  OrchidJS.Vividus2D.Sprite = Sprite;
})(window);
