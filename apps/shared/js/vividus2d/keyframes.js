class Keyframes {
  constructor(frames, duration) {
    this.frames = frames;
    this.currentFrameIndex = 0;
    this.duration = duration / (frames.length - 1) || 1000; // default duration in milliseconds
    this.startTime = performance.now();
    this.looped = false;
    this.initializeValues();
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

  cubicEaseInOut(t) {
    return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  update() {
    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const t = elapsed / this.duration;

    for (const property in this.values) {
      this[property] = this.lerp(
        this.frames[this.currentFrameIndex][property],
        this.frames[(this.currentFrameIndex + 1) % this.frames.length][property],
        this.cubicEaseInOut(t)
      );
    }

    if (t >= 1) {
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
      this.startTime = currentTime;
      this.initializeValues();
    }
  }

  play() {
    this.currentFrameIndex = 0;
    this.startTime = performance.now();
    this.initializeValues();
  }
}

Vividus2D.Keyframes = Keyframes;
