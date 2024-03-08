class Sprite {
  constructor(imagePath, width, height) {
    this.image = new Image();
    this.image.src = imagePath;
    this.imageUrl = imagePath;

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

    Vividus2D.children.push(this);
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;

    const index = Vividus2D.children.indexOf(child);
    Vividus2D.children.splice(index, 1);
  }

  draw(context) {
    context.save();

    // Translate to the sprite's position
    context.translate(this.x, this.y);

    // Apply rotation around the pivot
    context.translate(this.pivotX, this.pivotY);
    context.rotate(this.rotation);
    context.translate(-this.pivotX, -this.pivotY);

    // Apply scaling
    context.translate(this.pivotX * (1 - this.scaleX), this.pivotY * (1 - this.scaleY));
    context.scale(this.scaleX, this.scaleY);

    // Draw the image
    context.drawImage(this.image, 0, 0, this.width, this.height);

    // Draw children
    for (const child of this.children) {
      child.draw(context);
    }

    context.restore();
  }
}

Vividus2D.Sprite = Sprite;
