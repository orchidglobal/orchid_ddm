class HTMLAppHeaderElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="header">
        <div class="background"></div>

        <div class="safezone">
          <div class="heading">
            <slot></slot>
          </div>
          <div class="extended">
            <h1 class="title"></h1>
          </div>
        </div>
      </div>
      <link rel="stylesheet" href="/shared/elements/app-header/app-header.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.headingTitle = this.querySelector('h1');
    this.extendedTitle = shadow.querySelector('.extended .title');

    if (this.headingTitle) {
      // Create a MutationObserver instance and define the callback function
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'characterData') {
            this.extendedTitle.textContent = mutation.target.data;
          } else if (mutation.type === 'childList') {
            this.extendedTitle.innerHTML = mutation.target.innerHTML;
          }
        }
      });

      // Configuration of the observer
      const config = { characterData: true, subtree: true, childList: true };

      // Start observing the target element with the specified configuration
      observer.observe(this.headingTitle, config);
    }
  }
}

customElements.define('app-header', HTMLAppHeaderElement);
