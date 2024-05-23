class HTMLOrchidAdElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.frame = document.createElement('iframe');
    this.frame.src = 'https://www.example.com';
    this.appendChild(this.frame);
  }
}

customElements.define('orchid-ad', HTMLOrchidAdElement);
