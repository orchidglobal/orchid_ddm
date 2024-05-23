class OrchidAccountDropdownElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.profiles = JSON.parse(localStorage.getItem('orchidaccount.profiles')) || [];

    const dom = `
      <div class="container">
        <figure class="profile-figure"></figure>
        <div class="profile-content"></div>
        <div class="profile-content"></div>
      </div>
    `;

    this.handleServicesLoad();
    window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
  }

  async handleServicesLoad() {
    if (await _os.isLoggedIn()) {
      this.figure.style.display = '';
      _os.auth.getLiveAvatar(null, (data) => {
        this.avatar.src = data;
      });
      _os.auth.getUsername().then((data) => {
        this.username.textContent = data;
      });
      _os.auth.getFollowers().then((data) => {
        this.followers.dataset.l10nArgs = JSON.stringify({ count: data.length });
      });
      _os.auth.getFriends().then((data) => {
        this.friends.dataset.l10nArgs = JSON.stringify({ count: data.length });
      });
      _os.auth.getPoints().then((data) => {
        this.points.dataset.l10nId = '-orchid-account-points';
        this.points.dataset.l10nArgs = JSON.stringify({ count: data });
      });
    } else {
      this.figure.style.display = 'none';
    }

    this.populateLogins();
    window.removeEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
  }

  async populateLogins() {
    this.accountsList.innerHTML = '';

    if (this.profiles.length === 0) {
      this.accountsList.style.display = 'none';
      return;
    }

    for (let index = 0; index < this.profiles.length; index++) {
      const profile = this.profiles[index];

      if (profile === await _os.userID()) {
        continue;
      }

      const element = document.createElement('div');
      element.classList.add('item', 'hbox');
      // element.addEventListener('click', () => this.handleLoginClick(profile));
      this.accountsList.appendChild(element);

      const avatarHolder = document.createElement('div');
      avatarHolder.classList.add('avatar');
      element.appendChild(avatarHolder);

      const avatar = document.createElement('img');
      avatarHolder.appendChild(avatar);

      const avatarActivity = document.createElement('div');
      avatarActivity.classList.add('activity');
      avatarHolder.appendChild(avatarActivity);

      const textHolder = document.createElement('div');
      textHolder.classList.add('vbox');
      element.appendChild(textHolder);

      const username = document.createElement('p');
      textHolder.appendChild(username);

      const email = document.createElement('p');
      textHolder.appendChild(email);

      _os.auth.getAvatar(profile).then((data) => {
        avatar.src = data;
      });
      _os.auth.getUsername(profile).then((data) => {
        username.textContent = data;
      });
      _os.auth.getEmail(profile).then((data) => {
        email.textContent = data;
      });
      _os.auth.getLiveStatus(profile, (data) => {
        if (!data && !data.text) {
          status.style.display = 'none';
          return;
        }
        status.textContent = data.text;
        status.style.display = 'block';
      });
      _os.auth.getLiveState(profile, (data) => {
        avatarActivity.classList.add(data);
      });
    }
  }
}

customElements.define('orchid-account-dropdown', OrchidAccountDropdownElement);
