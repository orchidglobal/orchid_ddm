!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),

    init: async function () {
      if (await _os.isLoggedIn()) {
        _os.auth.getLiveAvatar(null, (data) => {
          this.accountButtonAvatar.src = data;
        });
        _os.auth.getUsername().then((data) => {
          this.accountButton.title = data;
        });
      }
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Root.init();
  });
})(window);
