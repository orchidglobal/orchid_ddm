!(function (exports) {
  'use strict';

  const Webapps = {
    search: document.getElementById('webapps-search'),
    searchInput: document.getElementById('webapps-search-input'),
    searchClearButton: document.getElementById('webapps-search-clear-button'),

    webappsList: document.getElementById('webapps-list'),
    editButton: document.getElementById('webapps-edit-button'),
    webappInfoHeaderIcon: document.getElementById('webapp-info-header-icon'),
    webappInfoHeaderName: document.getElementById('webapp-info-header-name'),
    webappInfoIcon: document.getElementById('webapp-info-icon'),
    webappInfoId: document.getElementById('webapp-info-id'),
    webappInfoName: document.getElementById('webapp-info-name'),
    webappInfoVersion: document.getElementById('webapp-info-version'),
    webappInfoAuthor: document.getElementById('webapp-info-author'),
    uninstallButton: document.getElementById('webapp-info-uninstall-button'),
    storeButton: document.getElementById('webapp-info-store-button'),
    webappInfoDescription: document.getElementById('webapp-info-description'),
    webappInfoEntryPoints: document.getElementById('webapp-info-entry-points'),

    APP_ICON_SIZE: 40,

    init: function () {
      this.editButton.addEventListener('click', this.handleEditButton.bind(this));
      this.search.addEventListener('input', this.handleSearch.bind(this));
      this.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
      this.searchClearButton.addEventListener('click', this.handleSearchClearButton.bind(this));

      const fragment = document.createDocumentFragment();

      // Fetch available networks and populate the list
      const apps = OrchidJS.AppsManager.getAllApps();
      apps.then((data) => {
        for (let index = 0; index < data.length; index++) {
          const app = data[index];

          const element = document.createElement('li');
          element.classList.add('page');
          fragment.appendChild(element);

          const pack = document.createElement('div');
          pack.classList.add('pack-checkbox');
          element.appendChild(pack);

          const inputSpan = document.createElement('span');
          pack.appendChild(inputSpan);

          const checkbox = document.createElement('input');
          checkbox.id = app.appId;
          checkbox.name = 'selected-webapps';
          checkbox.type = 'checkbox';
          inputSpan.appendChild(checkbox);

          const label = document.createElement('label');
          label.for = app.appId;
          label.dataset.pageId = 'webapp-info';
          label.addEventListener('click', (event) => this.handleWebappInfo(app));
          label.classList.add('hbox');
          pack.appendChild(label);

          const icon = document.createElement('img');
          icon.crossOrigin = 'anonymous';
          if (app.manifest.icons) {
            Object.entries(app.manifest.icons).forEach((entry) => {
              if (entry[0] <= this.APP_ICON_SIZE) {
                return;
              }
              const url = new URL(app.manifestUrl['en-US']);
              icon.src = url.origin + entry[1];
            });
          } else {
            icon.src = '/images/default.svg';
          }
          icon.onerror = () => {
            icon.src = '/images/default.svg';
          };
          label.appendChild(icon);

          const textHolder = document.createElement('div');
          textHolder.classList.add('text-holder');
          label.appendChild(textHolder);

          const name = document.createElement('p');
          name.textContent = app.manifest.name;
          textHolder.appendChild(name);

          const size = document.createElement('p');
          size.textContent = app.size;
          textHolder.appendChild(size);
        }

        this.webappsList.appendChild(fragment);
        OrchidJS.PageController.refresh();
      });
    },

    handleEditButton: function () {
      this.webappsList.classList.toggle('edit-mode-enabled');
    },

    handleSearch: function (event) {
      event.preventDefault();
    },

    handleSearchInput: function () {
      const items = this.webappsList.querySelectorAll('li');
      items.forEach(item => {
        const matches = item.innerText.toLowerCase().includes(this.searchInput.value.toLowerCase());
        item.classList.toggle('hidden', !matches);
      });
    },

    handleSearchClearButton: function () {
      const items = this.webappsList.querySelectorAll('li');
      items.forEach(item => {
        item.classList.remove('hidden');
      });
    },

    handleWebappInfo: async function (app) {
      const url = new URL(app.manifestUrl['en-US']);
      try {
        const response = await fetch(url.origin + '/metadata.json');
        const data = await response.json();

        if (data.protected) {
          this.uninstallButton.disabled = 'true';
        } else {
          this.uninstallButton.disabled = null;
        }

        if (data.store_id) {
          this.storeButton.disabled = null;
        } else {
          this.storeButton.disabled = 'true';
        }
      } catch (error) {
        this.uninstallButton.disabled = null;
        this.storeButton.disabled = 'true';
      }

      this.webappInfoIcon.crossOrigin = 'anonymous';
      this.webappInfoHeaderIcon.crossOrigin = 'anonymous';
      if (app.manifest.icons) {
        Object.entries(app.manifest.icons).forEach((entry) => {
          if (entry[0] <= this.APP_ICON_SIZE) {
            return;
          }
          const url = new URL(app.manifestUrl['en-US']);
          this.webappInfoIcon.src = url.origin + entry[1];
          this.webappInfoHeaderIcon.src = url.origin + entry[1];
        });
      } else {
        this.webappInfoIcon.src = '/images/default.svg';
        this.webappInfoHeaderIcon.src = '/images/default.svg';
      }
      this.webappInfoIcon.onerror = () => {
        this.webappInfoIcon.src = '/images/default.svg';
        this.webappInfoHeaderIcon.src = '/images/default.svg';
      };

      this.webappInfoId.textContent = app.manifest.id;
      this.webappInfoName.textContent = app.manifest.name;
      this.webappInfoHeaderName.textContent = app.manifest.short_name || app.manifest.name;
      this.webappInfoVersion.textContent = app.manifest.version.replaceAll('%system_version%', Environment.version);
      this.webappInfoDescription.textContent = app.manifest.description;
      if (app.manifest.developer) {
        this.webappInfoAuthor.textContent = app.manifest.developer.name;
        this.webappInfoAuthor.src = app.manifest.developer.url;
      }

      this.webappInfoEntryPoints.innerHTML = '';
      if (app.manifest && app.manifest.entry_points) {
        const fragment = document.createDocumentFragment();

        Object.entries(app.manifest.entry_points).forEach(([key, entryApp]) => {
          const element = document.createElement('li');
          // element.classList.add('page');
          fragment.appendChild(element);

          const icon = document.createElement('img');
          icon.crossOrigin = 'anonymous';
          if (entryApp.icons) {
            Object.entries(entryApp.icons).forEach((entry) => {
              if (entry[0] <= this.APP_ICON_SIZE) {
                return;
              }
              const url = new URL(app.manifestUrl['en-US']);
              icon.src = url.origin + entry[1];
            });
          } else {
            icon.src = '/images/default.svg';
          }
          icon.onerror = () => {
            icon.src = '/images/default.svg';
          };
          element.appendChild(icon);

          const textHolder = document.createElement('div');
          element.appendChild(textHolder);

          const name = document.createElement('p');
          name.textContent = entryApp.name;
          textHolder.appendChild(name);
        });

        this.webappInfoEntryPoints.appendChild(fragment);
      }
    }
  };

  SettingsApp.Webapps = Webapps;
})(window);
