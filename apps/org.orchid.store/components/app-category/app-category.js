class HTMLAppCategoryElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="category">
        <div class="header">
          <h3 class="name"></h3>
          <nav>
            <a href="#" class="learn-more-button"></a>
          </nav>
        </div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
      <link rel="stylesheet" href="/shared/style/icons/icons.css">
      <link rel="stylesheet" href="/components/app-category/app-category.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.name = shadow.querySelector('.name');

    this.learnMoreButton = shadow.querySelector('.learn-more-button');
    this.learnMoreButton.textContent = OrchidJS.L10n.get('seeMore');
  }
}

customElements.define('app-category', HTMLAppCategoryElement);
