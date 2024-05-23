!(function (exports) {
  'use strict';

  const Assistant = {
    _id: 0,

    screen: document.getElementById('screen'),
    assistantContainer: document.getElementById('assistants'),

    DEFAULT_ASSISTANT:
      { manifestUrl: OrchidJS.getManifestUrl('org.orchid.onlineservices'), entryId: 'assistant' },

    init: function () {
      this.create(this.DEFAULT_ASSISTANT);
    },

    show: function () {
      this.screen.classList.add('assistant-visible');
      this.assistantContainer.style.setProperty('--assistant-progress', 1);
      this.assistantContainer.classList.remove('motion-visible');
      this.assistantContainer.classList.add('visible');
    },

    showGradually: function (value) {
      this.screen.classList.add('assistant-visible');
      value = Math.min(1, Math.max(0, value));

      this.assistantContainer.classList.add('motion-visible');
      this.assistantContainer.style.setProperty('--assistant-progress', value);
    },

    hide: function () {
      this.screen.classList.remove('assistant-visible');
      this.assistantContainer.classList.remove('visible', 'motion-visible');
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

      const speechWindow = document.createElement('div');
      speechWindow.id = windowId;
      speechWindow.classList.add('speechframe');
      this.assistantContainer.appendChild(speechWindow);

      const browser = document.createElement('webview');
      browser.id = webviewId;
      browser.classList.add('browser');
      const url = new URL(app.manifestUrl);
      setTimeout(() => {
        browser.src = url.origin + manifest.launch_path;
      }, 300);
      speechWindow.appendChild(browser);
    }
  };

  Assistant.init();

  exports.Assistant = Assistant;
})(window);
