class OrchidAccountDropdownElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.profiles = JSON.parse(localStorage.getItem('orchidaccount.profiles')) || [];

    const fragment = document.createDocumentFragment();

    this.element = document.createElement('section');
    this.element.classList.add('container');
    fragment.appendChild(this.element);

    this.figure = document.createElement('figure');
    this.figure.classList.add('user-figure');
    this.element.appendChild(this.figure);

    this.avatar = document.createElement('img');
    this.avatar.classList.add('avatar');
    this.figure.appendChild(this.avatar);

    this.textHolder = document.createElement('div');
    this.textHolder.classList.add('text-holder');
    this.figure.appendChild(this.textHolder);

    this.username = document.createElement('div');
    this.username.classList.add('username');
    this.textHolder.appendChild(this.username);

    this.stats = document.createElement('div');
    this.stats.classList.add('stats');
    this.textHolder.appendChild(this.stats);

    this.followers = document.createElement('div');
    this.followers.classList.add('followers');
    this.followers.dataset.l10nId = '-orchid-account-followers';
    this.stats.appendChild(this.followers);

    this.separator = document.createElement('span');
    this.separator.classList.add('separator');
    this.stats.appendChild(this.separator);

    this.friends = document.createElement('div');
    this.friends.classList.add('friends');
    this.friends.dataset.l10nId = '-orchid-account-friends';
    this.stats.appendChild(this.friends);

    this.points = document.createElement('div');
    this.points.classList.add('points');
    this.textHolder.appendChild(this.points);

    this.profileLink = document.createElement('a');
    this.profileLink.classList.add('profile-link');
    this.profileLink.dataset.l10nId = '-orchid-account-profile';
    this.profileLink.href = '#';
    this.profileLink.target = '_blank';
    this.textHolder.appendChild(this.profileLink);

    this.accounts = document.createElement('div');
    this.accounts.classList.add('accounts');
    this.element.appendChild(this.accounts);

    this.accountsList = document.createElement('ul');
    this.accountsList.classList.add('accounts-list', 'list');
    this.accounts.appendChild(this.accountsList);

    this.addAccountHolder = document.createElement('ul');
    this.addAccountHolder.classList.add('list');
    this.accounts.appendChild(this.addAccountHolder);

    this.addAccountButton = document.createElement('div');
    this.addAccountButton.classList.add('item', 'add-button');
    this.addAccountButton.dataset.icon = 'user';
    this.addAccountHolder.appendChild(this.addAccountButton);

    this.addAccountButtonLabel = document.createElement('div');
    this.addAccountButtonLabel.classList.add('p');
    this.addAccountButtonLabel.dataset.l10nId = '-orchid-account-add-account';
    this.addAccountButton.appendChild(this.addAccountButtonLabel);

    this.links = document.createElement('nav');
    this.links.classList.add('links');
    this.element.appendChild(this.links);

    this.termsLink = document.createElement('a');
    this.termsLink.classList.add('link');
    this.termsLink.dataset.l10nId = '-orchid-account-terms';
    this.termsLink.href = '#';
    this.termsLink.target = '_blank';
    this.links.appendChild(this.termsLink);

    this.guidelinesLink = document.createElement('a');
    this.guidelinesLink.classList.add('link');
    this.guidelinesLink.dataset.l10nId = '-orchid-account-guidelines';
    this.guidelinesLink.href = '#';
    this.guidelinesLink.target = '_blank';
    this.links.appendChild(this.guidelinesLink);

    this.privacyLink = document.createElement('a');
    this.privacyLink.classList.add('link');
    this.privacyLink.dataset.l10nId = '-orchid-account-privacy';
    this.privacyLink.href = '#';
    this.privacyLink.target = '_blank';
    this.links.appendChild(this.privacyLink);

    this.appendChild(fragment);

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
