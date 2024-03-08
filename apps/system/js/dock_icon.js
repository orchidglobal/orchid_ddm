!(function (exports) {
  'use strict';

  class DockIcon {
    constructor (parentElement, manifestUrl, entryId) {
      this.parentElement = parentElement;
      this.manifestUrl = manifestUrl;
      this.entryId = entryId;
      this.isPinned = false;

      this.DOCK_ICON_SIZE = 40 * window.devicePixelRatio;

      this.init();
    }

    async init () {
      this.element = this.createDockIcon();
      this.element.dataset.manifestUrl = this.manifestUrl;
      this.element.innerHTML = '';

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

        if (entry[0] >= this.DOCK_ICON_SIZE) {
          continue;
        }
        const url = new URL(this.manifestUrl);
        this.icon.src = url.origin + entry[1];
      }
    }

    createDockIcon () {
      const url = new URL(this.manifestUrl);
      const icon = this.parentElement.querySelector(`.icon[data-manifest-url^="${url.origin}"]`);
      if (icon) {
        this.isPinned = icon.dataset.pinned;
        return icon;
      } else {
        const newIcon = document.createElement('div');
        newIcon.classList.add('icon');
        newIcon.addEventListener('click', this.handleClick.bind(this));
        newIcon.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        newIcon.dataset.pinned = this.isPinned;
        this.parentElement.appendChild(newIcon);

        return newIcon;
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

    handleContextMenu () {
      const existingAppWindow = Webapps.getWindowByManifestUrl(this.manifestUrl);
      if (existingAppWindow) {
        existingAppWindow.dockIcon = this;
        existingAppWindow.focus();
        console.log(existingAppWindow);
      } else {
        const appWindow = new AppWindow(this.manifestUrl, { entryId: this.entryId, dockIcon: this });
        console.log(appWindow);
      }

      const menu = [
        {
          hidden: !existingAppWindow,
          l10nId: 'dockMenu-close'
        },
        {
          hidden: existingAppWindow,
          l10nId: 'dockMenu-open'
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      requestAnimationFrame(() => {
        ContextMenu.show(x, y, menu);
      });
    }
  }

  exports.DockIcon = DockIcon;
})(window);
