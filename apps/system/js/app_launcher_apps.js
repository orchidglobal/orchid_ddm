!(function (exports) {
  'use strict';

  const AppLauncherApps = {
    gridElement: document.getElementById('launcher-grid'),
    paginationBar: document.getElementById('launcher-paginationBar'),

    gridColumns: 6,
    gridRows: 4,

    DEFAULT_PAGE_INDEX: 0,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],

    init: function () {
      if (window.deviceType !== 'desktop') {
        return;
      }
      this.gridElement.style.setProperty('--grid-columns', this.gridColumns);
      this.gridElement.style.setProperty('--grid-rows', this.gridRows);

      const apps = AppsManager.getAll();
      apps
        .then((result) => {
          const appsList = this.filterAppsApart(result);

          for (let index = 0, length = appsList.length; index < length; index++) {
            const app = appsList[index];

            this.gridElement.innerHTML = '';
            this.createAppPages(appsList);
          }
        })
        .catch((error) => {
          console.error(error);
          this.handleListFailure();
        });
    },

    filterAppsApart: function (appsList) {
      for (let index = 0, length = appsList.length; index < length; index++) {
        const obj = appsList[index];

        if (!(obj.manifest && obj.manifest?.entry_points)) {
          continue;
        }
        const entryPoints = Object.entries(obj.manifest?.entry_points) || [];

        if (!(entryPoints && entryPoints.length > 0)) {
          continue;
        }
        for (let index1 = 0, length1 = entryPoints.length; index1 < length1; index1++) {
          const newObj = {
            entry_id: entryPoints[index1][0],
            manifest: entryPoints[index1][1]
          };
          const baseObj = { ...obj };
          const merge = Object.assign(baseObj, newObj);
          appsList.push(merge);
        }
      }
      console.log(appsList);
      appsList = appsList.filter((obj) => this.HIDDEN_ROLES.indexOf(obj.manifest.role || 'webapp') === -1);
      return appsList;
    },

    createAppPages: function (apps) {
      const pages = this.splitArray(apps, this.gridColumns * this.gridRows);
      const fragment = document.createDocumentFragment();

      for (let index = 0, length = pages.length; index < length; index++) {
        const page = pages[index];
        const rtl = document.dir === 'rtl';

        const pageElement = document.createElement('ul');
        pageElement.id = `page${index}`;
        pageElement.classList.add('page');
        pageElement.style.transform = rtl ? `translateX(-${index * 100}%)` : `translateX(${index * 100}%)`;
        if (this.DEFAULT_PAGE_INDEX === index) {
          pageElement.scrollIntoView();
        }
        fragment.appendChild(pageElement);

        for (let index = 0, length = page.length; index < length; index++) {
          const app = page[index];

          this.createAppIcon(pageElement, app);
        }
      }

      this.gridElement.appendChild(fragment);
    },

    splitArray: function (array, chunkSize) {
      const result = [];
      for (let index = 0, length = array.length; index < length; index += chunkSize) {
        result.push(array.slice(index, index + chunkSize));
      }
      return result;
    },

    createAppIcon: function (pageElement, app) {
      if (app.manifestUrl[L10n.currentLanguage]) {
        const icon = new Icon(pageElement, app.manifestUrl[L10n.currentLanguage], app.manifest, app.entryId);
      } else {
        const icon = new Icon(pageElement, app.manifestUrl['en-US'], app.manifest, app.entryId);
      }
    },

    handleListFailure: function () {}
  };

  AppLauncherApps.init();
})(window);
