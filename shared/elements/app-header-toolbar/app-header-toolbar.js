class HTMLAppHeaderToolbarElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="toolbar">
        <slot></slot>
      </div>
      <link rel="stylesheet" href="/shared/elements/app-header-toolbar/app-header-toolbar.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('app-header-toolbar', HTMLAppHeaderToolbarElement);
