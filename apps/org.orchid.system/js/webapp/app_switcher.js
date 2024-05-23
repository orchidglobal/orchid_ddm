!(function (exports) {
  'use strict';

  const AppSwitcher = {
    overlay: document.getElementById('app-switcher'),
    appsContainer: document.getElementById('app-switcher-list'),

    isVisible: false,
    activeWindowIndex: 0,

    APP_ICON_SIZE: 30 * window.devicePixelRatio,

    /**
     * Initialize the app switcher.
     *
     * Registers the event listeners for handling the key events.
     */
    init: function () {
      /*
       * Handle keydown events for the app switcher.
       *
       * @listens keydown
       */
      document.addEventListener('keydown', this.handleKeyDown.bind(this));

      /*
       * Handle keyup events for the app switcher.
       *
       * @listens keyup
       */
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    },


    /**
     * Handle keydown events for the app switcher.
     *
     * If the Alt or Ctrl key and the Tab key are pressed, show the app
     * switcher if it's not already visible and move the focus to the next
     * app in the list.
     *
     * @listens keydown
     *
     * @param {KeyboardEvent} event
     */
    handleKeyDown: function (event) {
      if ((event.altKey || event.ctrlKey) && event.key === 'Tab') {
        if (!this.isVisible) {
          this.show(); // Show the app switcher if it's not already visible
        }
        this.cycleFocus(); // Move the focus to the next app in the list
      } else {
        if (!event.shiftKey) {
          this.hide(); // Hide the app switcher if the user presses a non-modifier key
        }
      }
    },

    /**
     * Handle keyup events for the app switcher.
     *
     * If the Alt or Ctrl key is released, hide the app switcher if the shift
     * key is not pressed. This is to prevent accidental hiding of the app
     * switcher when the user is trying to type a message that starts with one
     * of those keys.
     *
     * @listens keyup
     *
     * @param {KeyboardEvent} event
     */
    handleKeyUp: function (event) {
      if (!event.altKey && !event.ctrlKey) {
        if (!event.shiftKey) {
          this.hide(); // Hide the app switcher if the user releases the modifier key
        }
      }
    },

    /**
     * Show the app switcher overlay.
     * Adds the "visible" class from the overlay to hide the app switcher.
     */
    show: function () {
      this.activeWindowIndex = 0;
      this.isVisible = true;
      this.overlay.classList.add('visible'); // Add the "visible" class from the overlay

      this.populateWindows();
    },

    /**
     * Cycles focus through the apps in the app switcher.
     * If no app is currently selected, the first app in the list will be selected.
     */
    cycleFocus: function () {
      const selected = this.appsContainer.querySelector('.app.selected');
      const firstElement = this.appsContainer.childNodes[0];

      // No app is currently selected, select the first app in the list
      if (!selected) {
        firstElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(firstElement.dataset.manifestUrl).focus();
        return;
      }

      selected.classList.remove('selected');
      const nextElement = selected.nextElementSibling;

      // If the selected app is the last app in the list, select the first app
      if (!nextElement) {
        firstElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(firstElement.dataset.manifestUrl).focus();
      } else {
        // Select the next app in the list
        nextElement.classList.add('selected');
        Webapps.getWindowByManifestUrl(nextElement.dataset.manifestUrl).focus();
      }
    },

    /**
     * Hides the app switcher.
     * Removes the "visible" class from the overlay to hide the app switcher.
     */
    hide: function () {
      this.isVisible = false;
      this.overlay.classList.remove('visible'); // Remove the "visible" class from the overlay
    },

    /**
     * Populates the app switcher with all running webapps.
     * Removes any existing app windows from the app switcher and re-adds them to the
     * end of the list.
     */
    populateWindows: function () {
      const runningWebapps = Webapps.runningWebapps;
      this.appsContainer.innerHTML = '';
      const fragment = document.createDocumentFragment();

      // If there are no running webapps, set the app switcher to visible
      if (runningWebapps.length === 0) {
        this.element.classList.add('visible');
        this.screen.classList.add('cards-view-visible');
      }

      // Loop through all running webapps and create a new app window for each one
      for (let index = 0, length = runningWebapps.length; index < length; index++) {
        const runningWebapp = runningWebapps[index];
        if (runningWebapp.instanceID === 'homescreen') {
          continue;
        }
        this.createWindow(runningWebapp, index - 1, fragment);
      }

      // Add all new app windows to the app switcher
      this.appsContainer.appendChild(fragment);
    },

    /**
     * Create a window element for the given running webapp and append it to the
     * given parent element.
     *
     * @param {RunningWebapp} runningWebapp - The running webapp
     * @param {number} index - The index of the running webapp in the array of
     *        running webapps
     * @param {Element} [parentElement=this.cardsContainer] - The parent element
     *        to append the new window element to
     * @returns {Promise} A promise that resolves when the window element has
     *          been created and appended to the DOM
     */
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

      // Focus the new window if it's the currently focused one
      const focusedWindow = AppWindow.getFocusedWindow();
      if (focusedWindow === runningWebapp.appWindow) {
        card.scrollIntoView();
      }

      let manifest;
      try {
        manifest = await (await fetch(runningWebapp.manifestUrl)).json();
      } catch (error) {
        console.error('Error fetching manifest:', error);
        return;
      }

      /**
       * Titlebar element for the new window
       * @type {Element}
       */
      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      card.appendChild(titlebar);

      /**
       * Icon element for the new window
       * @type {Element}
       */
      const icon = document.createElement('img');
      icon.crossOrigin = 'anonymous';
      icon.onerror = () => {
        icon.src = '/images/default.svg';
      };
      titlebar.appendChild(icon);

      // Set icon.src to the URL of the icon with the smallest size >= APP_ICON_SIZE
      const entries = Object.entries(manifest.icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] >= this.APP_ICON_SIZE) {
          continue;
        }
        const url = new URL(runningWebapp.manifestUrl);
        icon.src = url.origin + entry[1];
      }

      /**
       * Titles element for the new window
       */
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
