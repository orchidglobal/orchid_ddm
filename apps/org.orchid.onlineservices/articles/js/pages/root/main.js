!(function (exports) {
  'use strict';

  const Root = {
    accountButton: document.getElementById('account-button'),
    accountButtonAvatar: document.getElementById('account-button-avatar'),
    accountButtonUsername: document.getElementById('account-button-username'),
    accountButtonContact: document.getElementById('account-button-contact'),

    postButtonHolder: document.getElementById('post-button-holder'),
    postActionButtonHolder: document.getElementById('post-action-button-holder'),
    notificationsButton: document.getElementById('notifications-list-item'),
    bookmarksButton: document.getElementById('bookmarks-list-item'),

    init: async function () {
      if (await _os.isLoggedIn()) {
        this.accountButton.style.display = '';
        this.postButtonHolder.style.display = '';
        this.postActionButtonHolder.style.display = '';
        this.notificationsButton.style.display = '';
        this.bookmarksButton.style.display = '';
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
        this.accountButton.style.display = 'none';
        this.postButtonHolder.style.display = 'none';
        this.postActionButtonHolder.style.display = 'none';
        this.notificationsButton.style.display = 'none';
        this.bookmarksButton.style.display = 'none';
      }
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Root.init();
  });
})(window);
