!(function (exports) {
  'use strict';

  const CreatePost = {
    postButton: document.getElementById('post-button'),

    dialog: document.getElementById('create-post'),
    dialogPanel: document.getElementById('create-post-panel'),
    dialogAudience: document.getElementById('create-post-audience'),
    dialogInput: document.getElementById('create-post-input'),
    closeButton: document.getElementById('create-post-close-button'),
    submitButton: document.getElementById('create-post-submit-button'),

    init: function () {
      this.postButton.addEventListener('click', this.handlePostButtonClick.bind(this));

      this.dialog.addEventListener('submit', this.handleSubmit.bind(this));
      this.closeButton.addEventListener('click', this.handleCloseButtonClick.bind(this));
      this.submitButton.addEventListener('click', this.handleSubmitButtonClick.bind(this));
    },

    handleSubmit: function (event) {
      event.preventDefault();
    },

    handlePostButtonClick: function (event) {
      this.dialog.classList.add('visible');
      this.dialogPanel.classList.add('visible');
    },

    handleCloseButtonClick: function (event) {
      this.dialog.classList.remove('visible');
      this.dialogPanel.classList.remove('visible');
    },

    handleSubmitButtonClick: function (event) {
      _os.articles.post(this.dialogAudience.value, this.convertToEscapes(this.dialogInput.value));
      this.dialog.classList.remove('visible');
      this.dialogPanel.classList.remove('visible');
    },

    convertToEscapes: function (inputStr) {
      let result = '';
      for (let i = 0; i < inputStr.length; i++) {
        const charCode = inputStr.charCodeAt(i);
        if (charCode > 255) {
          result += `\\u${charCode.toString(16).padStart(4, '0')}`;
        } else {
          result += inputStr[i];
        }
      }
      return result;
    },

    convertFromEscapes: function (inputStr) {
      return inputStr.replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => {
        const codePoint = parseInt(hex, 16);
        return codePoint <= 0xffff ? String.fromCharCode(codePoint) : String.fromCodePoint(codePoint);
      });
    }
  };

  CreatePost.init();
})(window);
