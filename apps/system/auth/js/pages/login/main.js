!(function (exports) {
  'use strict';

  const Login = {
    emailInput: document.getElementById('login-email'),
    passwordInput: document.getElementById('login-password'),
    confirmButton: document.getElementById('login-confirm-button'),
    profilesList: document.getElementById('login-profiles'),

    profiles: [],

    init: async function () {
      this.confirmButton.addEventListener('click', this.handleConfirmButton.bind(this));
      this.profiles = JSON.parse(localStorage.getItem('orchidaccount.profiles')) || [];

      window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
    },

    handleConfirmButton: async function () {
      console.log(this.emailInput.value, this.passwordInput.value);
      if ('_os' in window) {
        await _os.auth.login(this.emailInput.value, this.passwordInput.value);

        const userID = await _os.userID();

        if (this.profiles.indexOf(userID) === -1) {
          this.profiles.push(userID);
          localStorage.setItem('orchidaccount.profiles', JSON.stringify(this.profiles));
        }

        const parentOpener = window.opener;
        if (parentOpener) {
          parentOpener.
        }
      }
    },

    handleServicesLoad: function () {
      this.populateLogins();
    },

    populateLogins: function () {
      this.profilesList.innerHTML = '';
      for (let index = 0; index < this.profiles.length; index++) {
        const profile = this.profiles[index];

        const element = document.createElement('li');
        element.classList.add('hbox');
        // element.addEventListener('click', () => this.handleLoginClick(profile));
        this.profilesList.appendChild(element);

        const avatarHolder = document.createElement('div');
        avatarHolder.classList.add('avatar');
        element.appendChild(avatarHolder);

        const avatar = document.createElement('img');
        avatarHolder.appendChild(avatar);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        textHolder.appendChild(username);

        const status = document.createElement('p');
        textHolder.appendChild(status);

        _os.auth.getAvatar(profile).then((data) => {
          avatar.src = data;
        });
        _os.auth.getUsername(profile).then((data) => {
          username.textContent = data;
        });
        _os.auth.getLiveStatus(profile, (data) => {
          if (!data.status && !data.text) {
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
  };

  Login.init();
})(window);
