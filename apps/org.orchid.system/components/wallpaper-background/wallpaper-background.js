class HTMLWallpaperBackgroundElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="container">
        <div class="background"></div>
        <div class="backdrop"></div>
      </div>
      <link rel="stylesheet" href="/components/wallpaper-background/wallpaper-background.css">
    `;

    this.background = shadow.querySelector('.background');

    OrchidJS.Settings.getValue('video.wallpaper.url').then(this.handleWallpaper.bind(this));
    OrchidJS.Settings.addObserver('video.wallpaper.url', this.handleWallpaper.bind(this));
  }

  handleWallpaper(value) {
    this.background.style.backgroundImage = `url(${value})`;
  }
}

customElements.define('wallpaper-background', HTMLWallpaperBackgroundElement);
