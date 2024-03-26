class HTMLOrchidCastButtonElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const fragment = document.createDocumentFragment();

    this.castButton = document.createElement('a');
    this.castButton.dataset.icon = 'cast';
    fragment.appendChild(this.castButton);

    this.appendChild(fragment);
  }
}

customElements.define('orchid-cast-button', HTMLOrchidCastButtonElement);
