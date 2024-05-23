class HTMLTrendingAdElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="ad-card">
        <div class="badge">Ad</div>
        <div class="container">
          <div class="decoration"></div>
          <div class="text-holder">
            <div class="logo">Orchid</div>
            <div class="title">Decorate Your Personality</div>
            <div class="summary">Collect the new profile decorations!</div>
            <div class="buttons">
              <button class="visit-button">Check Out!</button>
            </div>
          </div>
        </div>
      </div>
      <link rel="stylesheet" href="/components/trending-ad/trending-ad.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('trending-ad', HTMLTrendingAdElement);
