class HTMLLockscreenDateElement extends HTMLElement {
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
      <link rel="stylesheet" href="/components/lock-screen-date/lock-screen-date.css">
    `;

    this.text = shadow.querySelector('.text');

    this.intervalID = setInterval(this.update.bind(this), 1000);
  }

  update() {
    const currentTime = new Date();
    const langCode = OrchidJS.L10n.currentLanguage.startsWith('ar') ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

    this.text.textContent = currentTime.toLocaleDateString(langCode, {
      weekday: 'short',
      month: 'long',
      day: 'numeric'
    });
  }
}

customElements.define('lock-screen-date', HTMLLockscreenDateElement);
