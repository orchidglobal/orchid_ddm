!(function (exports) {
  'use strict';

  const AddFriend = {
    form: document.getElementById('add-friend-form'),
    formInput: document.getElementById('add-friend-form-input'),

    init: async function () {
      this.form.addEventListener('submit', this.handleSubmit.bind(this));
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
