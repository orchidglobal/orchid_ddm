class HTMLTrayButtonElement extends HTMLElement {
  currentState = 'empty';

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
      <link rel="stylesheet" href="/components/tray-button/tray-button.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('tray-button', HTMLTrayButtonElement);
