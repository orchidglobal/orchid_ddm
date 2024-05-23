class AppWindow {
  containerElement = document.getElementById('windows');
  bottomPanel = document.getElementById('bottom-panel');

  constructor(manifestUrl, configuration) {
    if (manifestUrl) {
      this.manifestUrl = manifestUrl;
      this.configuration = configuration;
      this.create();
    }
  }

  async create() {
    this.instanceID = OrchidJS.UUID.v4();

    this.manifest = await this.fetchManifest(this.manifestUrl);
    if (this.configuration?.entryId) {
      this.manifest = this.manifest?.entry_points[this.configuration?.entryId];
    }

    if (this.manifest?.role === 'homescreen') {
      this.instanceID = 'homescreen';
    }

    const activity = this.configuration?.activity;
    const existingUrl = new URL(this.manifestUrl);

    let existingWindow;
    if (typeof activity === 'string') {
      existingWindow = this.containerElement.querySelector(
        `[data-manifest-url^="${existingUrl.origin}"][data-activity="${this.activity}"]`
      );
    } else {
      existingWindow = this.containerElement.querySelector(
        `[data-manifest-url^="${existingUrl.origin}"]:not([data-activity])`
      );
    }

    this.element = this.createAppWindow();
    this.element.startAnimation(HTMLAppFrameElement.ANIMATION_HOMESCREEN_OPEN, null);

    if (this.configuration.motion_settings) {
      // Update transform origin if animation variables are provided
      this.updateMotionSettings(this.element, this.configuration.motion_settings);
    }

    this.focus();
  }

  fetchManifest(manifestUrl) {
    return fetch(manifestUrl)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      })
      .catch((error) => {
        console.error('Error fetching manifest:', error);
        throw error;
      });
  }

  createAppWindow() {
    const frame = new HTMLAppFrameElement();

    frame.loadApp(this.manifestUrl, this.manifest, this.configuration);
    frame.dataset.id = this.instanceID;
    frame.dataset.manifestUrl = this.manifestUrl;

    if (this.configuration?.activity) {
      frame.dataset.activity = this.configuration?.activity;
    }

    if (this.manifest?.orientation && this.manifest?.orientation !== 'auto') {
      this.containerElement.classList.add(this.manifest?.orientation);
      this.orientation = this.manifest?.orientation;
    } else {
      this.containerElement.classList.add('auto', 'portrait');
      this.orientation = 'auto';
    }

    this.containerElement.appendChild(frame);

    Webapps.append({
      appWindow: this,
      instanceID: this.instanceID,
      manifestUrl: this.manifestUrl,
      configuration: this.configuration,
      frame: frame,
      chrome: frame.chrome
    });

    return frame;
  }

  updateMotionSettings(element, options) {
    element.style.transformOrigin = `${options.xPos}px ${options.yPos}px`;
    element.style.setProperty('--icon-pos-x', options.iconXPos + 'px');
    element.style.setProperty('--icon-pos-y', options.iconYPos + 'px');
    element.style.setProperty('--icon-scale-x', options.iconXScale);
    element.style.setProperty('--icon-scale-y', options.iconYScale);
  }

  static getFocusedWindow() {
    return AppWindow.focusedWindow;
  }

  focus() {
    const frames = document.querySelectorAll('app-frame');
    frames.forEach(frame => {
      frame.classList.remove('active');
    });

    this.element.classList.add('active');
    this.element.classList.remove('minimized');
    AppWindow.focusedWindow = this;

    if (this.instanceID === 'homescreen') {
      this.bottomPanel.classList.add('homescreen');
    } else {
      this.bottomPanel.classList.remove('homescreen');
    }
  }

  minimize() {
    this.element.classList.remove('active');
    this.element.classList.add('minimized');

    if (OrchidJS.deviceType !== 'desktop') {
      if ('HomescreenLauncher' in window) {
        HomescreenLauncher.homescreenWindow.focus();
      }
    }
  }
}
