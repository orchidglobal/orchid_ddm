class HTMLAppFrameElement extends HTMLElement {
  statusbar = document.getElementById('statusbar');
  topPanel = document.getElementById('top-panel');

  static ANIMATION_OPEN = 'expand';
  static ANIMATION_CLOSE = 'shrink';
  static ANIMATION_HOMESCREEN_OPEN = 'expand-from-homescreen';
  static ANIMATION_HOMESCREEN_CLOSE = 'shrink-to-homescreen';
  static ANIMATION_FROM_LEFT = 'from-left';
  static ANIMATION_FROM_RIGHT = 'from-right';
  static ANIMATION_TO_LEFT = 'to-left';
  static ANIMATION_TO_RIGHT = 'to-right';
  static ANIMATION_ZOOM_IN = 'zoom-in';
  static ANIMATION_ZOOM_OUT = 'zoom-out';
  static ANIMATION_CARDS_VIEW_OPEN = 'add-from-cards-view';
  static ANIMATION_FROM_CARDS_VIEW = 'from-cards-view';
  static ANIMATION_TO_CARDS_VIEW = 'to-cards-view';

  static ORIENTATION_PORTRAIT = 'portrait';
  static ORIENTATION_LANDSCAPE = 'landscape';
  static ORIENTATION_PORTRAIT_ONLY = 'portrait-only';
  static ORIENTATION_LANDSCAPE_ONLY = 'landscape-only';

  static HIDDEN_ROLES = ['homescreen', 'keyboard', 'system', 'theme', 'addon'];

  static ICON_SIZE_SPLASH = 72;
  static ICON_SIZE_DOCK = 56;

  constructor() {
    super();

    this.init();
  }

  init() {
    this._internals = this.attachInternals();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <section class="panel">
        <div class="titlebar">
          <div class="titlebar-grippy"></div>
          <menu class="titlebar-buttons">
            <button class="close-button"></button>
            <button class="maximize-button"></button>
            <button class="minimize-button"></button>
          </menu>
        </div>

        <div class="resize-handles">
          <div class="handle n"></div>
          <div class="handle ne"></div>
          <div class="handle nw"></div>
          <div class="handle e"></div>
          <div class="handle w"></div>
          <div class="handle s"></div>
          <div class="handle se"></div>
          <div class="handle sw"></div>
        </div>

        <status-bar class="statusbar"></status-bar>

        <div class="splashscreen">
          <div class="icon"></div>
        </div>

        <div class="app-indicator">
          <div class="icon"></div>
        </div>

        <div class="privacy-mask">
          <div class="icon"></div>
        </div>

        <app-chrome></app-chrome>
      </section>
      <link rel="stylesheet" href="/components/app-frame/app-frame.css">
    `;

    this.classList.toggle('development', Environment.type === 'development');

    this.panel = shadow.querySelector('.panel');
    this.statusbar = shadow.querySelector('.statusbar');
    this.chrome = shadow.querySelector('app-chrome');

    this.chrome.statusbar = this.statusbar;

    this.update();
  }

  loadApp(manifestUrl, manifest, configuration = {}) {
    this.manifestUrl = manifestUrl;
    this.manifest = manifest;

    if (!manifestUrl || !manifest) {
      return;
    }

    if (manifest.display) {
      if (manifest.display) {
        this.classList.add(manifest.display);
        this.chrome.classList.add(manifest.display);
      } else {
        this.classList.add(manifest.display);
        this.chrome.classList.add(manifest.display);
      }
    }
    if (manifest.transparent) {
      this.classList.add('transparent');
      this.chrome.classList.add('transparent');
    }
    if (manifest.frameless) {
      this.classList.add('frameless');
      this.chrome.classList.add('frameless');
    }

    const url = new URL(manifestUrl);
    let targetUrl = (typeof this.manifest?.launch_path === 'string') ? url.origin + this.manifest?.launch_path : this.manifest?.start_url;
    // if (this.manifest?.chrome && this.manifest?.chrome.navigation) {
    //   if (configuration.url) {
    //     targetUrl = configuration.url;
    //   }
    // }

    this.prepareChrome(targetUrl, this.manifest.chrome?.navigation);
  }

  prepareChrome(startUrl, visible) {
    let targetUrl;
    if (typeof this.activity === 'string' && this.manifest && this.manifest.activities && this.manifest.activities[this.activity]) {
      const url = new URL(startUrl);

      const properties = this.manifest?.activities[this.activity].filters;
      Object.entries(properties).forEach(([key, value]) => {
        if (this.filters[key]) {
          url.searchParams.set(key, this.filters[key]);
        } else {
          if (value && value.required) {
            this.close();
          }
        }
      });

      targetUrl = startUrl + url.searchParams;
    } else {
      targetUrl = startUrl;
    }

    this.chrome.dataset.hidden = !visible;
    this.chrome.openNewTab(targetUrl, false);
  }

  startAnimation(name, callback) {
    this.panel.classList.add(name);
    this.panel.addEventListener('animationend', () => {
      this.panel.classList.remove(name);

      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  stopAnimation(name) {
    this.panel.classList.remove(name);
  }

  get maximized() {
    return this._internals.states.has('maximized');
  }

  set maximized(flag) {
    if (flag) {
      // Existence of identifier corresponds to "true"
      this._internals.states.add('maximized');
    } else {
      // Absence of identifier corresponds to "false"
      this._internals.states.delete('maximized');
    }
  }

  get active() {
    return this._internals.states.has('active');
  }

  set active(flag) {
    if (flag) {
      // Existence of identifier corresponds to "true"
      this._internals.states.add('active');
    } else {
      // Absence of identifier corresponds to "false"
      this._internals.states.delete('active');
    }
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    const statusbarOffsetY = this.topPanel.getBoundingClientRect().top + this.topPanel.offsetHeight;
    const flag = this.getBoundingClientRect().top >= statusbarOffsetY;
    this.statusbar.classList.toggle('app-open', !flag);
  }
}

customElements.define('app-frame', HTMLAppFrameElement);
