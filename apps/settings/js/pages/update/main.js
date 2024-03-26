!(function (exports) {
  'use strict';

  const SystemUpdate = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),

    currentUpdateCard: document.getElementById('current-update'),
    currentReleaseNumber: document.getElementById('current-update-release-number'),
    currentName: document.getElementById('current-update-name'),
    currentVersion: document.getElementById('current-update-version'),
    currentSize: document.getElementById('current-update-size'),
    currentUpdatedApps: document.getElementById('current-update-apps'),

    updatesList: document.getElementById('updates-list'),

    currentUpdate: null,
    availableUpdates: [],

    APP_ICON_SIZE: 48,

    init: async function () {
      const response = await fetch('/update.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest: ${response.status}`);
      }
      const data = await response.json();

      this.currentUpdate = data.find((item) => item.version === ('Environment' in window ? Environment.version : '1.0'));
      this.availableUpdates = data.filter((item) => this.isVersionNewer(item.version, ('Environment' in window ? Environment.version : '1.0')));

      this.prepareCurrentUpdate();
      this.populateUpdates();
    },

    isVersionNewer: function (version, referenceVersion) {
      const splitVersion = version.split('.').map(Number);
      const splitReferenceVersion = referenceVersion.split('.').map(Number);

      for (let i = 0; i < Math.max(splitVersion.length, splitReferenceVersion.length); i++) {
        const num = splitVersion[i] || 0;
        const referenceNum = splitReferenceVersion[i] || 0;

        if (num < referenceNum) {
          return false; // version is equal or lower
        } else if (num > referenceNum) {
          return true; // version is higher
        }
      }

      return false; // versions are equal
    },

    prepareCurrentUpdate: async function () {
      const version = this.currentUpdate.version;
      const major = version.split('.')[0];
      const minor = version.split('.')[1];

      this.currentReleaseNumber.textContent = `${major}.${minor}`;
      this.currentName.textContent = this.currentUpdate.name;
      this.currentVersion.textContent = version;

      this.currentUpdatedApps.innerHTML = '';

      for (let index = 0, length = this.currentUpdate.updated_webapps.length; index < length; index++) {
        const webapp = this.currentUpdate.updated_webapps[index];

        let manifest;
        const response = await fetch(webapp.manifest_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.status}`);
        }
        manifest = await response.json();

        if (webapp.entry_id) {
          manifest = manifest.entry_points[webapp.entry_id];
        }

        const icon = document.createElement('img');
        icon.crossOrigin = 'anonymous';
        if (manifest && manifest.icons) {
          Object.entries(manifest.icons).forEach((entry) => {
            if (entry[0] <= this.APP_ICON_SIZE) {
              return;
            }
            const url = new URL(webapp.manifest_url);
            icon.src = url.origin + entry[1];
          });
        } else {
          icon.src = '/images/default.svg';
        }
        icon.onerror = () => {
          icon.src = '/images/default.svg';
        };
        this.currentUpdatedApps.appendChild(icon);
      }
    },

    populateUpdates: async function () {
      this.updatesList.innerHTML = '';

      const fragment = document.createDocumentFragment();

      for (let index = 0, length = this.availableUpdates.length; index < length; index++) {
        const update = this.availableUpdates[index];

        const version = update.version;
        const major = version.split('.')[0];
        const minor = version.split('.')[1];

        const element = document.createElement('div');
        element.dataset.pageId = 'patch-logs';
        element.classList.add('update');

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        element.appendChild(textHolder);

        const releaseNumber = document.createElement('h1');
        releaseNumber.classList.add('release-number');
        releaseNumber.textContent = `${major}.${minor}`;
        textHolder.appendChild(releaseNumber);

        const name = document.createElement('p');
        name.classList.add('name');
        name.textContent = update.name;
        textHolder.appendChild(name);

        const stats = document.createElement('div');
        stats.classList.add('stats');
        textHolder.appendChild(stats);

        const versionString = document.createElement('span');
        versionString.classList.add('version');
        versionString.textContent = update.version;
        stats.appendChild(versionString);

        const updatedApps = document.createElement('div');
        updatedApps.classList.add('updated-apps');
        textHolder.appendChild(updatedApps);

        for (let index = 0, length = update.updated_webapps.length; index < length; index++) {
          const webapp = update.updated_webapps[index];

          let manifest;
          const response = await fetch(webapp.manifest_url);
          if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.status}`);
          }
          manifest = await response.json();

          if (webapp.entry_id) {
            manifest = manifest.entry_points[webapp.entry_id];
          }

          const icon = document.createElement('img');
          icon.crossOrigin = 'anonymous';
          if (manifest && manifest.icons) {
            Object.entries(manifest.icons).forEach((entry) => {
              if (entry[0] <= this.APP_ICON_SIZE) {
                return;
              }
              const url = new URL(webapp.manifest_url);
              icon.src = url.origin + entry[1];
            });
          } else {
            icon.src = '/images/default.svg';
          }
          icon.onerror = () => {
            icon.src = '/images/default.svg';
          };
          updatedApps.appendChild(icon);
        }

        fragment.appendChild(element);
      }

      this.updatesList.appendChild(fragment);
      OrchidJS.PageController.refresh();
    }
  };

  SettingsApp.SystemUpdate = SystemUpdate;
})(window);
