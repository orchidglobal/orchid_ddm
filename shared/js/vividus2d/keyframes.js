!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Keyframes {
    constructor(frames, duration, cubicBezier, looped = false) {
      this.frames = frames;
      this.currentFrameIndex = 0;
      this.duration = duration / frames.length || 1000; // default duration in milliseconds
      this.startTime = performance.now();
      this.looped = looped;
      this.cubicBezier = cubicBezier || [0, 0, 1, 1];
      this.initializeValues();
      this.onFinish = null;
    }

    initializeValues() {
      this.values = {};
      for (const property in this.frames[0]) {
        this.values[property] = this.frames[0][property];
      }
    }

    lerp(start, end, t) {
      return start + t * (end - start);
    }

    easing(t) {
      const [p1x, p1y, p2x, p2y] = this.cubicBezier;

      const cx = 3 * p1x;
      const bx = 3 * (p2x - p1x) - cx;
      const ax = 1 - cx - bx;

      const cy = 3 * p1y;
      const by = 3 * (p2y - p1y) - cy;
      const ay = 1 - cy - by;

      const t2 = t * t;
      const t3 = t2 * t;

      return ay * t3 + by * t2 + cy * t + p1y;
    }

    update() {
      const currentTime = performance.now();
      const elapsed = currentTime - this.startTime;
      const t = elapsed / this.duration;

      for (const property in this.values) {
        this[property] = this.lerp(
          this.frames[this.currentFrameIndex][property],
          this.frames[(this.currentFrameIndex + 1) % this.frames.length][property],
          this.easing(t)
        );
      }

      if (t >= 1) {
        if (typeof this.onFinish === 'function') {
          this.onFinish();
        }
        this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
        this.startTime = currentTime;
        this.initializeValues();
      }
    }

    play(looped = false) {
      this.looped = looped;
      this.currentFrameIndex = 0;
      this.startTime = performance.now();
      this.initializeValues();
    }
  }

  OrchidJS.Vividus2D.Keyframes = Keyframes;
})(window);
