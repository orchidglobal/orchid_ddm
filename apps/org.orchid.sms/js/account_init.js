!(function (exports) {
  'use strict';

  const AccountInit = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),

    init: async function () {
      if (await _os.isLoggedIn()) {
        this.accountButton.style.display = '';
        _os.auth.getAvatar().then((data) => {
          this.accountButtonAvatar.src = data;
        });
      } else {
        this.accountButton.style.display = 'none';
      }
    }
  };

  AccountInit.init();
})(window);
