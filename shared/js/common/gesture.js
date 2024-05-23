!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  class Gesture {
    constructor(element, direction = [0, 1], range) {
      this.element = element;
      this.direction = direction;
      this.range = range;

      this.onStart = null;
      this.onProgress = null;
      this.onEnd = null;

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
        startX: event.clientX * this.direction[0],
        startY: event.clientY * this.direction[1],
        currentX: event.clientX * this.direction[0],
        currentY: event.clientY * this.direction[1],
        distance: 0,
      });
      event.target.setPointerCapture(event.pointerId);

      if (typeof this.onStart === 'function') {
        this.onStart(event);
      }
    }

    onPointerMove(event) {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer) {
        return;
      }
      pointer.currentX = event.clientX * this.direction[0];
      pointer.currentY = event.clientY * this.direction[1];
      pointer.distance = (pointer.currentX - pointer.startX) + (pointer.currentY - pointer.startY);
      const progress = Math.max(-1, Math.min(1, pointer.distance / this.range));
      const overflowProgress = Math.max(1, pointer.distance / this.range) - 1;

      if (typeof this.onProgress === 'function') {
        this.onProgress(event, progress, overflowProgress);
      }
    }

    onPointerUp(event) {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer) {
        return;
      }
      const progress = Math.max(-1, Math.min(1, pointer.distance / this.range));
      const overflowProgress = Math.max(1, pointer.distance / this.range) - 1;
      this.pointers.delete(event.pointerId);
      event.target.releasePointerCapture(event.pointerId);

      if (typeof this.onEnd === 'function') {
        this.onEnd(event, progress, overflowProgress);
      }
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
