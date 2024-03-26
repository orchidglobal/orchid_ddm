!(function (exports) {
  'use strict';

  const Dock = {
    dock: document.getElementById('dock'),

    DEFAULT_PINNED_APPS: [
      { manifestUrl: 'http://browser.localhost:8081/manifest.webapp', entryID: null },
      { manifestUrl: 'http://sms.localhost:8081/manifest.webapp', entryID: null },
      { manifestUrl: 'http://files.localhost:8081/manifest.webapp', entryID: null },
      { manifestUrl: 'http://music.localhost:8081/manifest.webapp', entryID: null }
    ],

    init: function () {
      this.DEFAULT_PINNED_APPS.forEach(app => {
        const icon = new DockIcon(this.dock, app.manifestUrl, app.entryID);
        icon.isPinned = true;
      });
    }
  };

  Dock.init();

  exports.Dock = Dock;
})(window);
