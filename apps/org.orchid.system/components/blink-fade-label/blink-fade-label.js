class HTMLBlinkFadeLabelElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="text-holder">
        <div class="old-text"></div>
        <div class="new-text"></div>
      </div>
      <link rel="stylesheet" href="/components/blink-fade-label/blink-fade-label.css">
    `;

    this.textHolder = shadow.querySelector('.text-holder');
    this.oldText = shadow.querySelector('.old-text');
    this.newText = shadow.querySelector('.new-text');
  }

  setText(text) {
    // if (this.newText.textContent !== text) {
      this.oldText.textContent = this.newText.textContent;
      this.newText.textContent = text;

      this.newText.classList.add('hidden');
      this.oldText.classList.add('fade-out');
      this.oldText.addEventListener('animationend', () => {
        this.oldText.classList.remove('fade-out');

        this.newText.classList.remove('hidden');
        this.newText.classList.add('fade-in');
        this.newText.addEventListener('animationend', () => {
          this.newText.classList.remove('fade-in');
        });
      });

      this.textHolder.style.width = this.newText.scrollWidth + 'px';
    // }
  }
}

customElements.define('blink-fade-label', HTMLBlinkFadeLabelElement);
