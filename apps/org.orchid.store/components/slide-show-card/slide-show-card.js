class HTMLSlideshowCardElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="slideshow-card">
        <div class="container">
          <slot></slot>
        </div>
      </div>
      <link rel="stylesheet" href="/components/slide-show-card/slide-show-card.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('slide-show-card', HTMLSlideshowCardElement);
