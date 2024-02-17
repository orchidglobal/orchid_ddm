!(function (exports) {
  'use strict';

  const AddFriend = {
    confirmButton: document.getElementById('add-friend-confirm-button'),

    form: document.getElementById('add-friend-form'),
    formInput: document.getElementById('add-friend-form-input'),
    notice: document.getElementById('add-friend-notice'),

    init: async function () {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      this.confirmButton.addEventListener('click', this.handleConfirmButton.bind(this));
    },

    handleConfirmButton: async function () {
      if (this.formInput.value === '') {
        return;
      }
      const user = await _os.auth.getUserByHandle(this.formInput.value);
      if (user) {
        this.formInput.value = '';
        _os.messages.addFriend(user.token);

        this.notice.dataset.l10nId = 'addFriendAdded';
        this.notice.dataset.l10nArgs = JSON.stringify({
          username: user.username
        });
        this.notice.classList.add('visible', 'alert');

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
          this.notice.dataset.l10nId = '';
          this.notice.classList.remove('visible', 'alert', 'error');
        }, 3000);
      } else {
        this.notice.dataset.l10nId = 'addFriendNotFound';
        this.notice.dataset.l10nArgs = JSON.stringify({
          username: this.formInput.value
        });
        this.notice.classList.add('visible', 'error');

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
          this.notice.dataset.l10nId = '';
          this.notice.classList.remove('visible', 'alert', 'error');
        }, 3000);
      }
    },

    handleSubmit: async function (event) {
      event.preventDefault();
      if (this.formInput.value === '') {
        return;
      }
      const user = await _os.auth.getUserByHandle(this.formInput.value);
      if (user) {
        this.formInput.value = '';
        _os.messages.addFriend(user.token);
      }
    }
  };

  AddFriend.init();

  exports.AddFriend = AddFriend;
})(window);
