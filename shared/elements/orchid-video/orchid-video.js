class HTMLOrchidVideoElement extends HTMLElement {
  constructor() {
    super();

    this.paused = true;
    this.skipping = false;

    this.init();
    this.update();
  }

  init() {
    const fragment = document.createDocumentFragment();

    this.video = document.createElement('video');
    this.video.classList.add('video');
    this.video.src = this.getAttribute('src');
    this.video.preservesPitch = false;
    this.video.addEventListener('loadedmetadata', this.handleMetadata.bind(this));
    this.video.addEventListener('timeupdate', this.handleTimeUpdate.bind(this));
    fragment.appendChild(this.video);

    this.skipBackOverlay = document.createElement('div');
    this.skipBackOverlay.classList.add('skip-overlay', 'back');
    fragment.appendChild(this.skipBackOverlay);

    this.skipBackIcon = document.createElement('div');
    this.skipBackIcon.classList.add('icon');
    this.skipBackIcon.dataset.icon = 'seek-back-seconds';
    this.skipBackIcon.textContent = '5';
    this.skipBackOverlay.appendChild(this.skipBackIcon);

    this.skipForwardOverlay = document.createElement('div');
    this.skipForwardOverlay.classList.add('skip-overlay', 'forward');
    fragment.appendChild(this.skipForwardOverlay);

    this.skipForwardIcon = document.createElement('div');
    this.skipForwardIcon.classList.add('icon');
    this.skipForwardIcon.dataset.icon = 'seek-forward-seconds';
    this.skipForwardIcon.textContent = '5';
    this.skipForwardOverlay.appendChild(this.skipForwardIcon);

    this.overlay = document.createElement('div');
    this.overlay.classList.add('overlay');
    fragment.appendChild(this.overlay);

    this.controls = document.createElement('div');
    this.controls.classList.add('controls');
    this.overlay.appendChild(this.controls);

    this.seekBackSecondsButton = document.createElement('button');
    this.seekBackSecondsButton.dataset.icon = 'seek-back-seconds';
    this.seekBackSecondsButton.addEventListener('click', this.handleSeekBackButton.bind(this));
    this.controls.appendChild(this.seekBackSecondsButton);

    this.skipBackButton = document.createElement('button');
    this.skipBackButton.dataset.icon = 'skip-back-alt';
    this.skipBackButton.addEventListener('click', this.handleSkipBackButton.bind(this));
    this.controls.appendChild(this.skipBackButton);

    this.playPauseButton = document.createElement('button');
    this.playPauseButton.classList.add('playpause-button');
    this.playPauseButton.addEventListener('click', this.handlePlayPauseButton.bind(this));
    this.controls.appendChild(this.playPauseButton);

    this.playPauseButtonSpinner = document.createElement('div');
    this.playPauseButtonSpinner.classList.add('spinner');
    this.playPauseButton.appendChild(this.playPauseButtonSpinner);

    this.playPauseButtonIcon = document.createElement('span');
    this.playPauseButtonIcon.classList.add('icon');
    this.playPauseButtonIcon.dataset.icon = 'play-alt';
    this.playPauseButton.appendChild(this.playPauseButtonIcon);

    this.skipForwardButton = document.createElement('button');
    this.skipForwardButton.dataset.icon = 'skip-forward-alt';
    this.skipForwardButton.addEventListener('click', this.handleSkipForwardButton.bind(this));
    this.controls.appendChild(this.skipForwardButton);

    this.seekForwardSecondsButton = document.createElement('button');
    this.seekForwardSecondsButton.dataset.icon = 'seek-forward-seconds';
    this.seekForwardSecondsButton.addEventListener('click', this.handleSeekForwardButton.bind(this));
    this.controls.appendChild(this.seekForwardSecondsButton);

    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('toolbar');
    this.overlay.appendChild(this.toolbar);

    this.scrubber = document.createElement('div');
    this.scrubber.classList.add('scrubber');
    this.toolbar.appendChild(this.scrubber);

    this.time = document.createElement('div');
    this.time.classList.add('time');
    this.scrubber.appendChild(this.time);

    this.currentTime = document.createElement('div');
    this.currentTime.classList.add('current-time');
    this.time.appendChild(this.currentTime);

    this.separator = document.createElement('div');
    this.separator.classList.add('separator');
    this.time.appendChild(this.separator);

    this.duration = document.createElement('div');
    this.duration.classList.add('duration');
    this.time.appendChild(this.duration);

    this.appendChild(fragment);
  }

  play() {
    this.playPauseButtonIcon.dataset.icon = 'pause-alt';
    // this.video.play();
    this.paused = false;
  }

  pause() {
    this.playPauseButtonIcon.dataset.icon = 'play-alt';
    // this.video.pause();
    this.paused = true;
  }

  handlePlayPauseButton() {
    if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  handleSeekBackButton() {
    this.skipBackOverlay.classList.add('visible');

    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => {
      this.skipBackOverlay.classList.remove('visible');
    }, 1000);


    const lastCurrentTime = this.video.currentTime;
    const animate = () => {
      if (this.video.currentTime >= (lastCurrentTime - 5)) {
        requestAnimationFrame(animate.bind(this));

        this.video.currentTime += ((lastCurrentTime - 5) - this.video.currentTime) * 0.3;
      }
    };
    animate();
  }

  handleSeekForwardButton() {
    this.skipForwardOverlay.classList.add('visible');

    clearTimeout(this.timeoutID);
    this.timeoutID = setTimeout(() => {
      this.skipForwardOverlay.classList.remove('visible');
    }, 1000);

    const lastCurrentTime = this.video.currentTime;
    const animate = () => {
      if (this.video.currentTime <= (lastCurrentTime + 5)) {
        requestAnimationFrame(animate.bind(this));

        this.skipping = true;
      } else {
        this.skipping = false;
      }
    };
    animate();
  }

  handleSkipBackButton() {

  }

  handleSkipForwardButton() {

  }

  handleMetadata() {
    this.duration.textContent = this.formatTime(this.video.duration);
    this.currentTime.textContent = this.formatTime(this.video.currentTime);
  }

  handleTimeUpdate() {
    this.currentTime.textContent = this.formatTime(this.video.currentTime);
    this.playPauseButtonSpinner.style.transform = `rotate(${360 * (this.video.currentTime / this.video.duration)}deg)`;
  }

  formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    if (this.paused && !this.skipping) {
      if (this.video.playbackRate <= 0.1) {
        this.video.pause();
      } else {
        this.video.playbackRate += (0 - this.video.playbackRate) * 0.1;
        this.video.volume += (0 - this.video.volume) * 0.1;
      }
    } else if (this.skipping) {
      this.video.playbackRate += (16 - this.video.playbackRate) * 0.3;
      this.video.volume += (0.5 - this.video.volume) * 0.3;
      try {
        this.video.play();
      } catch (error) {
        // ...
      }
    } else {
      this.video.playbackRate += (1 - this.video.playbackRate) * 0.3;
      this.video.volume += (1 - this.video.volume) * 0.3;
      try {
        this.video.play();
      } catch (error) {
        // ...
      }
    }
  }
}

customElements.define('orchid-video', HTMLOrchidVideoElement);
