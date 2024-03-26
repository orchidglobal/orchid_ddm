class HTMLOrchidAccountBannerElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const fragment = document.createDocumentFragment();

    this.bannerImage = document.createElement('img');
    this.bannerImage.classList.add('banner');
    this.bannerImage.src = 'https://orchid-f39a9.web.app/assets/defaultbanner.png';
    fragment.appendChild(this.bannerImage);

    this.container = document.createElement('div');
    this.container.classList.add('container');
    fragment.appendChild(this.container);

    this.avatarImage = document.createElement('img');
    this.avatarImage.classList.add('avatar');
    this.avatarImage.src = 'https://orchid-f39a9.web.app/assets/defaultuser.png';
    this.container.appendChild(this.avatarImage);

    this.content = document.createElement('div');
    this.content.classList.add('content');
    this.container.appendChild(this.content);

    this.columns = document.createElement('div');
    this.columns.classList.add('columns');
    this.content.appendChild(this.columns);

    this.infoColumn = document.createElement('div');
    this.infoColumn.classList.add('column', 'fit');
    this.columns.appendChild(this.infoColumn);

    this.textHolder = document.createElement('div');
    this.textHolder.classList.add('text-holder');
    this.infoColumn.appendChild(this.textHolder);

    this.username = document.createElement('div');
    this.username.classList.add('username');
    this.textHolder.appendChild(this.username);

    this.handleName = document.createElement('div');
    this.handleName.classList.add('handle-name');
    this.textHolder.appendChild(this.handleName);

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

    this.status = document.createElement('div');
    this.status.classList.add('status');
    this.textHolder.appendChild(this.status);

    this.buttonsColumn = document.createElement('div');
    this.buttonsColumn.classList.add('column');
    this.columns.appendChild(this.buttonsColumn);

    this.buttons = document.createElement('div');
    this.buttons.classList.add('buttons');
    this.buttonsColumn.appendChild(this.buttons);

    this.buttonsMenu = document.createElement('menu');
    this.buttons.appendChild(this.buttonsMenu);

    this.optionsButton = document.createElement('button');
    this.optionsButton.dataset.icon = 'options';
    this.optionsButton.dataset.l10nId = '-orchid-account-optionsButton';
    this.optionsButton.classList.add('options-button', 'icon');
    this.buttonsMenu.appendChild(this.optionsButton);

    this.description = document.createElement('div');
    this.description.classList.add('description');
    this.content.appendChild(this.description);

    this.bigButtonsMenu = document.createElement('menu');
    this.content.appendChild(this.bigButtonsMenu);

    this.followButton = document.createElement('button');
    this.followButton.dataset.l10nId = '-orchid-account-follow';
    this.followButton.classList.add('follow-button', 'recommend');
    this.bigButtonsMenu.appendChild(this.followButton);

    this.donateButton = document.createElement('button');
    this.donateButton.dataset.l10nId = '-orchid-account-donate';
    this.donateButton.classList.add('donate-button');
    this.bigButtonsMenu.appendChild(this.donateButton);

    this.appendChild(fragment);

    window.addEventListener('orchid-services-ready', this.setUser.bind(this, null));
  }

  async setUser(handleName) {
    const currentHandleName = await _os.auth.getHandleName();

    handleName = handleName || currentHandleName;

    _os.auth.getUserByHandle(handleName).then((data) => {
      this.bannerImage.src = data.banner || 'https://orchid-f39a9.web.app/assets/defaultbanner.png';
      this.avatarImage.src = data.profile_picture || 'https://orchid-f39a9.web.app/assets/defaultuser.png';
      this.username.textContent = data.username;
      if (data.handle_name === 'mortcodesweb') {
        this.username.classList.add('creator');
      } else {
        this.username.classList.remove('creator');
      }
      this.handleName.textContent = `@${data.handle_name}`;
      this.followers.dataset.l10nArgs = JSON.stringify({
        count: data.followers?.length || 0
      });
      this.friends.dataset.l10nArgs = JSON.stringify({
        count: data.friends?.length || 0
      });
      this.status.textContent = data.status?.text;
      if (data.is_verified) {
        this.username.classList.add('verified');
      } else {
        this.username.classList.remove('verified');
      }
      if (data.description) {
        this.description.style.display = 'block';
        this.description.textContent = data;
      } else {
        this.description.style.display = 'none';
      }
    });

    window.removeEventListener('orchid-services-ready', this.setUser.bind(this, null));
  }
}

customElements.define('orchid-account-banner', HTMLOrchidAccountBannerElement);
