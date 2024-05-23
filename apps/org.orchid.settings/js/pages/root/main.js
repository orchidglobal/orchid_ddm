!(function (exports) {
  'use strict';

  const Root = {
    content: document.getElementById('root-content'),

    search: document.getElementById('search'),
    searchInput: document.getElementById('search-input'),
    searchClearButton: document.getElementById('search-clear-button'),

    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),
    loginButton: document.getElementById('login-button'),

    init: async function () {
      this.search.addEventListener('input', this.handleSearch.bind(this));
      this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
      this.searchClearButton.addEventListener('click', this.handleSearchClearButton.bind(this));

      if (await _os.isLoggedIn()) {
        this.loginButton.style.display = 'none';
        this.accountButton.style.display = '';
        _os.auth.getLiveAvatar(null, (data) => {
          this.accountButtonAvatar.src = data;
        });
        _os.auth.getUsername().then((data) => {
          this.accountButtonUsername.textContent = data;
        });
        _os.auth.getHandleName().then((data) => {
          this.accountButtonContact.textContent = `@${data}`;
        });
      } else {
        this.loginButton.style.display = '';
        this.accountButton.style.display = 'none';
      }

      this.loginButton.addEventListener('click', this.handleLoginButton.bind(this));
    },

    handleSearch: function (event) {
      event.preventDefault();
    },

    handleSearchInput: function () {
      const items = this.content.querySelectorAll('ul:not(#online-options) li');
      items.forEach(item => {
        const matches = item.innerText.toLowerCase().includes(this.searchInput.value.toLowerCase());
        item.classList.toggle('hidden', !matches);
      });
    },

    handleSearchClearButton: function () {
      const items = this.content.querySelectorAll('ul:not(#online-options) li');
      items.forEach(item => {
        item.classList.remove('hidden');
      });
    },

    handleLoginButton: function (event) {
      IPC.send('requestlogin', {
        type: 'login'
      });
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Root.init();
  });
})(window);
