!(function (exports) {
  'use strict';

  class Icon {
    constructor (parentElement, manifestUrl, manifest, entryId) {
      this.parentElement = parentElement;
      this.manifestUrl = manifestUrl;
      this.manifest = manifest;
      this.entryId = entryId;

      this.APP_ICON_SIZE = 54 * window.devicePixelRatio;

      this.init();
    }

    init () {
      this.element = this.createIcon();

      this.iconHolder = document.createElement('div');
      this.iconHolder.classList.add('icon-holder');
      this.element.appendChild(this.iconHolder);

      this.icon = document.createElement('img');
      this.iconHolder.appendChild(this.icon);

      this.icon.crossOrigin = 'anonymous';
      this.icon.onerror = () => {
        this.icon.src = '/images/default.svg';
      };

      const entries = Object.entries(this.manifest.icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] >= this.APP_ICON_SIZE) {
          continue;
        }
        const url = new URL(this.manifestUrl);
        this.icon.src = url.origin + entry[1];
      }

      this.textHolder = document.createElement('div');
      this.textHolder.classList.add('text-holder');
      this.element.appendChild(this.textHolder);

      this.name = document.createElement('p');
      this.name.classList.add('name');
      this.name.textContent = this.manifest.short_name || this.manifest.name;
      this.element.appendChild(this.name);
    }

    createIcon () {
      const icon = this.parentElement.querySelector(`.icon[data-manifest-url="${this.manifestUrl}"]`);
      if (icon) {
        return icon;
      } else {
        const newIcon = document.createElement('div');
        newIcon.classList.add('icon');
        newIcon.addEventListener('click', this.handleClick.bind(this));
        this.parentElement.appendChild(newIcon);

        return newIcon;
      }
    }

    handleClick () {
      const appWindow = new AppWindow(this.manifestUrl, { entryId: this.entryId });

      AppLauncher.hide();
      Dashboard.hide();
    }
  }

  exports.Icon = Icon;
})(window);
