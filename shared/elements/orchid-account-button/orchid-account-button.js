class HTMLOrchidAccountButtonElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const fragment = document.createDocumentFragment();

    this.optionsButton = document.createElement('a');
    this.optionsButton.dataset.icon = 'options';
    this.optionsButton.addEventListener('click', this.handleClick.bind(this));
    fragment.appendChild(this.optionsButton);

    this.accountButton = document.createElement('a');
    this.accountButton.classList.add('avatar', 'alert');
    this.accountButton.addEventListener('click', this.handleClick.bind(this));
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

  handleClick(event) {
    if (!this.dropdown) {
      this.dropdown = new OrchidAccountDropdownElement();
    }

    const x = this.getBoundingClientRect().left;
    this.dropdown.style.setProperty('--x-offset', `${x}px`);

    if (x > window.innerWidth / 2) {
      this.dropdown.classList.add('right');
    }

    document.body.appendChild(this.dropdown);

    requestAnimationFrame(() => {
      this.toggleTheme();
      this.dropdown.classList.add('visible');
      OrchidJS.Transitions.scale(this.accountButtonAvatar, this.dropdown.querySelector('.avatar'));

      const handleDocumentClick = () => {
        this.toggleTheme();
        this.dropdown.classList.remove('visible');
        document.removeEventListener('click', handleDocumentClick.bind(this));
      };
      document.addEventListener('click', handleDocumentClick.bind(this));
    });
  }

  toggleTheme() {
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');

    if (!window.matchMedia('(min-width: 768px)').matches) {
      themeColorMetaTag.content = themeColorMetaTag.dataset.originalColor || '';
      return;
    }

    if (themeColorMetaTag.content === 'black') {
      themeColorMetaTag.content = themeColorMetaTag.dataset.originalColor || '';
    } else {
      themeColorMetaTag.dataset.originalColor = themeColorMetaTag.content;
      themeColorMetaTag.content = 'black';
    }
  }
}

customElements.define('orchid-account-button', HTMLOrchidAccountButtonElement);
