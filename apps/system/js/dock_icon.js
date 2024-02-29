!(function (exports) {
  'use strict';

  class DockIcon {
    constructor (parentElement, manifestUrl, entryId) {
      this.parentElement = parentElement;
      this.manifestUrl = manifestUrl;
      this.entryId = entryId;
      this.isPinned = false;

      this.DOCK_ICON_SIZE = 40;

      this.init();
    }

    async init () {
      this.element = document.createElement('div');
      this.element.classList.add('icon');
      this.element.addEventListener('click', this.handleClick.bind(this));
      this.parentElement.appendChild(this.element);

      const response = await fetch(this.manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      }
      let manifest = await response.json();
      if (this.entryId) {
        manifest = manifest.entry_points[this.entryId];
      }

      this.icon = document.createElement('img');
      this.element.appendChild(this.icon);

      this.icon.crossOrigin = 'anonymous';
      this.icon.onerror = () => {
        this.icon.src = '/style/images/default.svg';
      };

      const entries = Object.entries(manifest.icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] <= this.DOCK_ICON_SIZE) {
          continue;
        }
        const url = new URL(this.manifestUrl);
        this.icon.src = url.origin + entry[1];
      }
    }

    handleClick () {
      const existingAppWindow = Webapps.getWindowByManifestUrl(this.manifestUrl);
      if (existingAppWindow) {
        existingAppWindow.dockIcon = this;
        existingAppWindow.focus();
        console.log(existingAppWindow);
      } else {
        const appWindow = new AppWindow(this.manifestUrl, { entryId: this.entryId, dockIcon: this });
        console.log(appWindow);
      }
    }
  }

  exports.DockIcon = DockIcon;
})(window);
