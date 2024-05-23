!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
    accountHandle: document.getElementById('account-handle'),
    accountFollowers: document.getElementById('account-followers'),
    accountFriends: document.getElementById('account-friends'),
    accountStatus: document.getElementById('account-status'),
    accountEmail: document.getElementById('account-email'),
    accountPhoneNumber: document.getElementById('account-phone-number'),

    avatarEditButton: document.getElementById('accountListItem-avatar'),
    bannerEditButton: document.getElementById('accountListItem-banner'),

    KB_SIZE_LIMIT: 300,

    init: async function () {
      this.avatarEditButton.addEventListener('click', this.handleAvatarEditButton.bind(this));
      this.bannerEditButton.addEventListener('click', this.handleBannerEditButton.bind(this));

      if (await _os.isLoggedIn()) {
        _os.auth.getEmail().then((data) => {
          this.accountEmail.textContent = data;
        });
        _os.auth.getPhoneNumber().then((data) => {
          this.accountPhoneNumber.textContent = data;
        });
      }
    },

    handleAvatarEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data, mime) => {
        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }
        const base64String = btoa(binaryString);
        const dataUrl = `data:${mime};base64,${base64String}`;

        compressImage(dataUrl, this.KB_SIZE_LIMIT, async (finalImage) => {
          _os.auth.setAvatar(finalImage);
        });
      });
    },

    handleBannerEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data, mime) => {
        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }
        const base64String = btoa(binaryString);
        const dataUrl = `data:${mime};base64,${base64String}`;

        compressImage(dataUrl, this.KB_SIZE_LIMIT, (finalImage) => {
          _os.auth.setBanner(finalImage);
        });
      });
    }
  };

  SettingsApp.Account = Account;
})(window);
