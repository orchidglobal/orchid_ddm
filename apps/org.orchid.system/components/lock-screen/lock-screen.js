class HTMLLockscreenElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="lockscreen">
        <div class="lockscreen-rows">
          <div class="row">
            <div class="icon-container">
              <span class="icon"></span>
            </div>
          </div>

          <div class="row always-on-display">
            <blink-fade-label class="label charging"></blink-fade-label>
            <blink-fade-label class="label carrier-name" data-l10n-id="emergency-only"></blink-fade-label>
          </div>

          <div class="row content always-on-display">
            <slot></slot>
          </div>

          <div class="row always-on-display">
            <status-bar class="aod-statusbar status-only"></status-bar>
          </div>

          <div class="row fit">
            <notifications-container class="notifications"></notifications-container>
            <div class="notifications-badge" data-icon="chevron-down"
              data-l10n-id="lockscreenNotificationsCount" data-l10n-args='{"count":0}'></div>
          </div>

          <div class="row">
            <menu class="toolbar">
              <button id="lockscreen-flashlight-button" class="opaque" data-icon="flashlight"></button>
              <button id="lockscreen-camera-button" class="opaque" data-icon="camera"></button>
            </menu>
          </div>
        </div>
      </div>
      <link rel="stylesheet" href="/shared/style/common/icons/icons.css">
      <link rel="stylesheet" href="/components/lock-screen/lock-screen.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.lockscreen = shadow.querySelector('.lockscreen');
    this.carrierName = shadow.querySelector('.carrier-name');
    this.notifications = shadow.querySelector('.notifications');

    var bool = false;
    setInterval(() => {
      if (bool) {
        this.carrierName.setText(this.getGreeting());
      } else {
        this.carrierName.setText('Developer Beta');
      }
      bool = !bool;
    }, 3000);
  }

  getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return "Good morning!";
    } else if (hour >= 12 && hour < 18) {
        return "Good afternoon!";
    } else if (hour >= 18 && hour < 22) {
        return "Good evening!";
    } else {
        return "Hello!";
    }
  }
}

customElements.define('lock-screen', HTMLLockscreenElement);
