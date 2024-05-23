class HTMLLockscreenTimeElement extends HTMLElement {
  is12HourFormat = true;

  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="text-holder">
        <div class="text"></div>
      </div>
      <link rel="stylesheet" href="/components/lock-screen-time/lock-screen-time.css">
    `;

    this.text = shadow.querySelector('.text');

    Settings.getValue('timedate.12_hour.enabled').then(this.handle12HourClock.bind(this));
    Settings.addObserver('timedate.12_hour.enabled', this.handle12HourClock.bind(this));

    this.intervalID = setInterval(this.update.bind(this), 1000);
  }

  handle12HourClock(value) {
    this.is12HourFormat = value;
  }

  update() {
    const currentTime = new Date();
    const langCode = OrchidJS.L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

    this.text.textContent = currentTime.toLocaleTimeString(langCode, {
      hour12: this.is12HourFormat,
      hour: 'numeric',
      minute: 'numeric'
    })
    .split(' ')[0];
  }
}

customElements.define('lock-screen-time', HTMLLockscreenTimeElement);
