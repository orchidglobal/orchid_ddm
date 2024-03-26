!(function (exports) {
  'use strict';

  class StereoAudio extends Audio {
    constructor(src) {
      super(src);

      this.init();
    }

    init() {
      // Check if stereo is supported
      if (!this.stereoSupported()) {
        console.warn('Stereo audio is not supported in this environment.');
        return;
      }

      // Create an audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create pan nodes for left and right channels
      this.panNodeLeft = this.audioContext.createStereoPanner();
      this.panNodeRight = this.audioContext.createStereoPanner();

      // Connect pan nodes to audio context
      this.panNodeLeft.connect(this.audioContext.destination);
      this.panNodeRight.connect(this.audioContext.destination);

      // Connect left channel to left pan node, right channel to right pan node
      this.source.connect(this.panNodeLeft, 0, 0);
      this.source.connect(this.panNodeRight, 0, 1);
    }

    playAt(x, y) {
      // Normalize x and y values to be in the range [-1, 1]
      const normalizedX = Math.max(-1, Math.min(1, x));
      const normalizedY = Math.max(-1, Math.min(1, y));

      // Set pan values based on normalized x and y
      this.panNodeLeft.pan.value = -normalizedX; // Left channel
      this.panNodeRight.pan.value = normalizedX; // Right channel

      // Start playing the audio
      this.source.start();
    }

    stereoSupported() {
      return ('AudioContext' in window) && window.AudioContext.prototype.createStereoPanner;
    }
  }

  exports.StereoAudio = StereoAudio;
})(window);
