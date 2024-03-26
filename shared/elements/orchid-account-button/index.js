class HTMLOrchidAccountButtonElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const fragment = document.createDocumentFragment();

    this.optionsButton = document.createElement('a');
    this.optionsButton.dataset.icon = 'options';
    fragment.appendChild(this.optionsButton);

    this.accountButton = document.createElement('a');
    this.accountButton.classList.add('avatar');
    fragment.appendChild(this.accountButton);

    this.accountButtonAvatar = document.createElement('img');
    this.accountButton.appendChild(this.accountButtonAvatar);

    this.appendChild(fragment);

    window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
  }

  async handleServicesLoad() {
    if (await _os.isLoggedIn()) {
      this.optionsButton.style.display = 'none';
      this.accountButton.style.display = '';
      _os.auth.getLiveAvatar(null, (data) => {
        this.accountButtonAvatar.src = data;
      });
      _os.auth.getUsername().then((data) => {
        _os.auth.getPoints().then((data1) => {
          let points = '';
          if ('OrchidJS' in window) {
            points = OrchidJS.L10n.get('-orchid-account-points', { count: data1 });
          }

          this.accountButton.title = `${data}\n${points}`;
        });
      });
    } else {
      this.optionsButton.style.display = '';
      this.accountButton.style.display = 'none';
    }

    window.removeEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
  }
}

customElements.define('orchid-account-button', HTMLOrchidAccountButtonElement);
