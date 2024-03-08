!(function (exports) {
  'use strict';

  const LoginBanner = {
    element: document.getElementById('login-banner'),
    cancelButton: document.getElementById('login-banner-cancel'),
    confirmButton: document.getElementById('login-banner-confirm'),

    init: function () {
      this.cancelButton.addEventListener('click', this.handleCancelButtonClick.bind(this));
      this.confirmButton.addEventListener('click', this.handleConfirmButtonClick.bind(this));
    },

    handleCancelButtonClick: function (event) {
      this.element.classList.remove('visible');
    },

    handleConfirmButtonClick: function (event) {
      this.element.classList.remove('visible');
    }
  };

  LoginBanner.init();
})(window);
