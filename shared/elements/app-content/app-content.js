class HTMLAppContentElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="content">
        <slot></slot>
      </div>
      <link rel="stylesheet" href="/shared/elements/app-content/app-content.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.content = shadow.querySelector('.content');

    this.content.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll() {
    const scrollPosition = this.content.scrollTop;
    const progress = Math.min(1, scrollPosition / 100);

    const totalScrollHeight = this.content.scrollHeight - this.content.clientHeight;
    // Calculate how far the user has scrolled from the bottom
    const scrolledFromBottom = scrollPosition - totalScrollHeight;
    // Calculate the progress within the last 100 pixels scrolled from the bottom
    const progressTabs = Math.max(0, Math.min(1, (scrolledFromBottom / 100) * -1));

    this.parentElement.style.setProperty('--header-progress', progress);
    this.parentElement.style.setProperty('--tablist-progress', progressTabs);
  }
}

customElements.define('app-content', HTMLAppContentElement);
