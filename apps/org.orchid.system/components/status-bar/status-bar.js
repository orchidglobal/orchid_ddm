class HTMLStatusbarElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="statusbar-container"></div>
      <link rel="stylesheet" href="/shared/style/common/icons/icons.css">
      <link rel="stylesheet" href="/style/statusbar.css">
      <link rel="stylesheet" href="/components/status-bar/status-bar.css">
    `;

    this.container = shadow.querySelector('.statusbar-container');

    LazyLoader.load('js/statusbar/statusbar_icon.js', () => {
      LazyLoader.load(
        [
          'js/statusbar/statusbar_icon.js',
          'js/statusbar/time_icon.js',
          'js/statusbar/battery_icon.js',
          'js/statusbar/carrier_label.js',
          'js/statusbar/cellular_data_icon.js',
          'js/statusbar/audio_icon.js',
          'js/statusbar/wifi_icon.js',
          'js/statusbar/data_icon.js',
          'js/statusbar/warm_colors_icon.js',
          'js/statusbar/reader_mode_icon.js',
          'js/statusbar/mute_icon.js',
          'js/statusbar/airplane_icon.js',
          'js/statusbar/focus_icon.js'
        ],
        () => {
          LazyLoader.load('js/statusbar/statusbar.js', () => {
            this.statusbarInstance = new Statusbar(this.container);
            this.element = this.statusbarInstance.element;
          });
        }
      );
    });
  }
}

customElements.define('status-bar', HTMLStatusbarElement);
