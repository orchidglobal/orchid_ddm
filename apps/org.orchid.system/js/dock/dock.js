!(function (exports) {
  'use strict';

  const Dock = {
    dock: document.getElementById('dock'),

    DEFAULT_PINNED_APPS: [
      { manifestUrl: OrchidJS.getManifestUrl('org.orchid.browser'), entryID: null },
      { manifestUrl: OrchidJS.getManifestUrl('org.orchid.sms'), entryID: null },
      { manifestUrl: OrchidJS.getManifestUrl('org.orchid.files'), entryID: null },
      { manifestUrl: OrchidJS.getManifestUrl('org.orchid.music'), entryID: null }
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
