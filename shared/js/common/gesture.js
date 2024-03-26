!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  class Gesture {
    constructor(element, direction = [0, 1], range, callback) {
      this.element = element;
      this.direction = direction;
      this.range = range;
      this.callback = callback;

      this.pointers = new Map();

      this.init();
    }

    init() {
      this.element.addEventListener('pointerdown', this.onPointerDown.bind(this));
      this.element.addEventListener('pointermove', this.onPointerMove.bind(this));
      this.element.addEventListener('pointerup', this.onPointerUp.bind(this));
      this.element.addEventListener('pointercancel', this.onPointerCancel.bind(this));
      this.element.addEventListener('pointerout', this.onPointerOut.bind(this));
      this.element.addEventListener('pointerleave', this.onPointerLeave.bind(this));
      this.element.addEventListener('lostpointercapture', this.onLostPointerCapture.bind(this));
    }

    onPointerDown(event) {
      this.pointers.set(event.pointerId, {
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY,
        distance: 0,
      });
      event.target.setPointerCapture(event.pointerId);
    }

    onPointerMove(event) {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer) {
        return;
      }
      pointer.currentX = event.clientX;
      pointer.currentY = event.clientY;
      pointer.distance = Math.hypot(pointer.currentX - pointer.startX, pointer.currentY - pointer.startY);
      const progress = Math.min(1, pointer.distance / this.range);
      const overflowProgress = Math.max(1, pointer.distance / this.range) - 1;
      this.callback(progress, overflowProgress);
    }

    onPointerUp(event) {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer) {
        return;
      }
      this.pointers.delete(event.pointerId);
      event.target.releasePointerCapture(event.pointerId);
    }

    onPointerCancel(event) {
      this.pointers.delete(event.pointerId);
      event.target.releasePointerCapture(event.pointerId);
    }

    onPointerOut(event) {
      this.pointers.delete(event.pointerId);
      event.target.releasePointerCapture(event.pointerId);
    }

    onPointerLeave(event) {
      this.pointers.delete(event.pointerId);
      event.target.releasePointerCapture(event.pointerId);
    }

    onLostPointerCapture(event) {
      this.pointers.delete(event.pointerId);
    }
  }

  OrchidJS.Gesture = Gesture;
})(window);
