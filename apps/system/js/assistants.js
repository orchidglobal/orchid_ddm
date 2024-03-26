!(function (exports) {
  'use strict';

  const Assistant = {
    _id: 0,

    screen: document.getElementById('screen'),
    assistantContainer: document.getElementById('assistants'),

    DEFAULT_ASSISTANT:
      { manifestUrl: 'http://orchidservices.localhost:8081/manifest.webapp', entryId: 'assistant' },

    init: function () {
      this.create(this.DEFAULT_ASSISTANT);
    },

    show: function () {
      this.screen.classList.add('assistant-visible');
      this.assistantContainer.classList.add('visible');
    },

    hide: function () {
      this.screen.classList.remove('assistant-visible');
      this.assistantContainer.classList.remove('visible');
    },

    toggle: function () {
      this.screen.classList.toggle('assistant-visible');
      this.assistantContainer.classList.toggle('visible');
    },

    create: async function (app) {
      const windowId = `speechframe${Assistant._id}`;
      const webviewId = `speechbrowser${Assistant._id}`;
      Assistant._id++;

      let manifest;
      await fetch(app.manifestUrl)
        .then((response) => response.json())
        .then(function (data) {
          manifest = data;
          // You can perform further operations with the 'manifest' variable here
        })
        .catch(function (error) {
          console.error('Error fetching manifest:', error);
        });

      if (manifest && manifest.entry_points && manifest.entry_points[app.entryId]) {
        manifest = manifest.entry_points[app.entryId];
      }

      const keyboard = document.createElement('div');
      keyboard.id = windowId;
      keyboard.classList.add('speechframe');
      this.keyboardContainer.appendChild(keyboard);

      const browser = document.createElement('webview');
      browser.id = webviewId;
      browser.classList.add('browser');
      const url = new URL(manifestUrl);
      setTimeout(() => {
        browser.src = url.origin + manifest.launch_path;
      }, 300);
      keyboard.appendChild(browser);
    }
  };

  Assistant.init();

  exports.Assistant = Assistant;
})(window);
