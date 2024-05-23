class HTMLOrchidSnackbarElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.label = document.createElement('div');
    this.label.classList.add('label');
    this.appendChild(this.label);

    this.span = document.createElement('span');
    this.label.appendChild(this.span);
  }

  set innerText(text) {
    this.span.innerText = text;
  }
}

customElements.define('orchid-snack-bar', HTMLOrchidSnackbarElement);
