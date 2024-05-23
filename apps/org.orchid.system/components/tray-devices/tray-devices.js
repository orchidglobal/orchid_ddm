class HTMLTrayDevicesElement extends HTMLElement {
  currentState = 'empty';

  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="devices">
        <section class="current-devices">
          <div class="device-list grid"></div>
        </section>

        <section class="empty-devices">
          <div class="dummy-device-list grid">
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
            <div class="item" disabled="true"></div>
          </div>

          <div class="empty-message">
            <p class="label"></p>
          </div>
        </section>

        <section class="offline-server">
          <div class="offline-message">
            <p class="label">Unable to connect to Orchid</p>
          </div>
        </section>
      </div>
      <link rel="stylesheet" href="/components/tray-devices/tray-devices.css">
    `;

    this.container = shadow.querySelector('.devices');
    this.devicesSection = shadow.querySelector('.current-devices');
    this.emptySection = shadow.querySelector('.empty-devices');
    this.offlineSection = shadow.querySelector('.offline-server');

    this.updateState();
    this.render();
  }

  updateState() {
    if (!navigator.onLine || !('_os' in window)) {
      this.emptySection.classList.remove('visible');
      this.offlineSection.classList.add('visible');
    } else {
      this.emptySection.classList.add('visible');
      this.offlineSection.classList.remove('visible');
    }
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    const targetSection = this.container.querySelector('.visible');
    if (targetSection) {
      this.container.style.height = targetSection.getBoundingClientRect().height + 'px';
    }
  }
}

customElements.define('tray-devices', HTMLTrayDevicesElement);
