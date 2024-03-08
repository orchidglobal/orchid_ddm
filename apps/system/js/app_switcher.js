!(function (exports) {
  'use strict';

  const AppSwitcher = {
    overlay: document.getElementById('app-switcher'),
    appsContainer: document.getElementById('app-switcher-list'),

    isVisible: false,
    activeWindowIndex: 0,

    APP_ICON_SIZE: 30 * window.devicePixelRatio,

    init: function () {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    },

    handleKeyDown: function (event) {
      if ((event.altKey || event.ctrlKey) && event.key === 'Tab') {
        if (!this.isVisible) {
          this.show();
        }
        this.cycleFocus();
      } else {
        if (!event.shiftKey) {
          this.hide();
        }
      }
    },

    handleKeyUp: function (event) {
      if (!event.altKey && !event.ctrlKey) {
        if (!event.shiftKey) {
          this.hide();
        }
      }
    },

    show: function () {
      this.activeWindowIndex = 0;
      this.isVisible = true;
      this.overlay.classList.add('visible');

      this.populateWindows();
    },

    cycleFocus: function () {
      let selected = this.appsContainer.querySelector('.app.selected');
      const firstElement = this.appsContainer.childNodes[0];
      if (!selected) {
        firstElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(firstElement.dataset.manifestUrl).focus();
        return;
      }

      selected.classList.remove('selected');
      let nextElement = selected.nextElementSibling;
      if (!nextElement) {
        firstElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(firstElement.dataset.manifestUrl).focus();
      } else {
        nextElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(nextElement.dataset.manifestUrl).focus();
      }
    },

    hide: function () {
      this.isVisible = false;
      this.overlay.classList.remove('visible');
    },

    populateWindows: function () {
      const runningWebapps = Webapps.runningWebapps;
      this.appsContainer.innerHTML = '';
      const fragment = document.createDocumentFragment();

      if (runningWebapps.length === 0) {
        this.element.classList.add('visible');
        this.screen.classList.add('cards-view-visible');
      }

      for (let index = 0, length = runningWebapps.length; index < length; index++) {
        const runningWebapp = runningWebapps[index];
        if (runningWebapp.instanceID === 'homescreen') {
          continue;
        }
        this.createWindow(runningWebapp, index - 1, fragment);
      }
      this.appsContainer.appendChild(fragment);
    },

    createWindow: async function (runningWebapp, index, parentElement = this.cardsContainer) {
      const card = document.createElement('div');
      card.classList.add('app');
      card.dataset.manifestUrl = runningWebapp.manifestUrl;
      card.addEventListener('pointerup', (event) => {
        if (this.isMovingPointer) {
          return;
        }
        event.stopPropagation();
        Webapps.getWindowById(runningWebapp.appWindow.instanceID).focus();
        this.hide();
      });
      parentElement.appendChild(card);

      const focusedWindow = new AppWindow().getFocusedWindow();
      if (focusedWindow === runningWebapp.appWindow) {
        card.scrollIntoView();
      }

      let manifest;
      await fetch(runningWebapp.manifestUrl)
        .then((response) => response.json())
        .then(function (data) {
          manifest = data;
          // You can perform further operations with the 'manifest' variable here
        })
        .catch(function (error) {
          console.error('Error fetching manifest:', error);
        });

      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      card.appendChild(titlebar);

      const icon = document.createElement('img');
      icon.crossOrigin = 'anonymous';
      icon.onerror = () => {
        icon.src = '/style/images/default.svg';
      };
      titlebar.appendChild(icon);

      const entries = Object.entries(manifest.icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] >= this.APP_ICON_SIZE) {
          continue;
        }
        const url = new URL(runningWebapp.manifestUrl);
        icon.src = url.origin + entry[1];
      }

      const titles = document.createElement('div');
      titles.classList.add('titles');
      titlebar.appendChild(titles);

      const name = document.createElement('div');
      name.classList.add('name');
      name.textContent = manifest.name;
      titles.appendChild(name);

      const preview = document.createElement('img');
      preview.classList.add('preview');
      card.appendChild(preview);

      if (runningWebapp.manifestUrl === focusedWindow.manifestUrl) {
        this.targetPreviewElement = preview;
      }

      const webview = runningWebapp.appWindow.element.querySelector('.browser-container .browser-view.active > .browser');
      DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
        preview.src = data;
      });

      if (index === 0) {
        this.element.classList.add('visible');
        this.screen.classList.add('cards-view-visible');
        if ('Transitions' in window && focusedWindow.element && this.targetPreviewElement) {
          Transitions.scale(focusedWindow.element, this.targetPreviewElement, true);
        }
      }
    }
  };

  AppSwitcher.init();
})(window);
