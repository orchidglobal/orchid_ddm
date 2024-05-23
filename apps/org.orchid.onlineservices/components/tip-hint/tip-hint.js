class HTMLTipHintElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="tour">
        <div class="focus"></div>
        <div class="character">
          <div class="character-speech"></div>
        </div>
      </div>
      <link rel="stylesheet" href="/components/tip-hint/tip-hint.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.speechBubble = shadow.querySelector('.character-speech');

    this.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    this.classList.remove('visible');
  }

  showMessage(message) {
    this.speechBubble.textContent = message;

    this.classList.add('visible');
    this.classList.add('no-focus');
  }

  showMessageTargetted(message, x, y, rad) {

  }
}

customElements.define('tip-hint', HTMLTipHintElement);
