class HTMLQuickSettingsButtonElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="button">
        <slot></slot>
      </div>
      <link rel="stylesheet" href="/components/quick-settings-button/quick-settings-button.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.button = shadow.querySelector('.button');
    new OrchidJS.ActiveTilt(this.button);
  }
}

customElements.define('quick-settings-button', HTMLQuickSettingsButtonElement);
