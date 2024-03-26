!(function (exports) {
  'use strict';

  const Apps = {
    gridElement: document.getElementById('grid'),
    paginationBar: document.getElementById('paginationBar'),

    gridColumns: 6,
    gridRows: 4,

    DEFAULT_PAGE_INDEX: 0,
    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],

    /**
     * Initialize the app launcher apps.
     * Retrieve the apps list, filter it and display it in pages.
     */
    init: function () {
      if (window.deviceType !== 'desktop') {
        return;
      }

      const grid = this.gridElement;
      grid.style.setProperty('--grid-columns', this.gridColumns);
      grid.style.setProperty('--grid-rows', this.gridRows);

      AppsManager.getAll()
        .then(this.filterAppsApart.bind(this))  // Expand entry points and filter hidden roles
        .then(this.createAppPages.bind(this))    // Create pages and display apps
        .catch(this.handleListFailure.bind(this));  // Handle errors
    },

    /**
     * Filter the list of apps by expanding entry points and removing hidden roles
     *
     * @param {Array} appList - List of apps
     * @return {Array} - Filtered list of apps
     */
    filterAppsApart(appList) {
      const filteredAppList = appList.flatMap(app => {
        const { entry_points } = app.manifest || {};
        console.log(entry_points);

        return [app, ...Object.entries(entry_points || {}).map(([entryId, manifest]) => {
          console.log(entryId, manifest);
          return {
            manifest,
            entry_id: entryId,
            ...app,
          };
        })];
      });

      return filteredAppList.filter(({ manifest: { role } = {} }) =>  // Remove hidden roles
        !this.HIDDEN_ROLES.includes(role || 'webapp')
      );
    },

    /**
     * Create app pages based on the given apps array
     *
     * @param {Array} apps - Array of apps
     */
    createAppPages: function (apps) {
      // Split apps array into pages
      const pages = this.splitArray(apps, this.gridColumns * this.gridRows);

      // Create a document fragment to improve performance
      const fragment = document.createDocumentFragment();

      // Iterate over all pages
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];

        // Create an unordered list element for the page
        const pageElement = document.createElement('ul');

        // Set the page id
        pageElement.id = `page${pageIndex}`;

        // Add CSS class name for the page
        pageElement.classList.add('page');

        // Set the transform style based on the page index and RTL layout
        const isRtl = document.dir === 'rtl';
        pageElement.style.transform = isRtl ? `translateX(-${pageIndex * 100}%)` : `translateX(${pageIndex * 100}%)`;

        // If the page index is the default page index, scroll it into view
        if (pageIndex === this.DEFAULT_PAGE_INDEX) {
          pageElement.scrollIntoView();
        }

        // Add the page element to the fragment
        fragment.appendChild(pageElement);

        // Iterate over all apps in the page
        for (let appIndex = 0; appIndex < page.length; appIndex++) {
          const app = page[appIndex];

          // Create an icon element for the app
          this.createAppIcon(pageElement, app);
        }
      }

      // Add all pages to the grid
      this.gridElement.appendChild(fragment);
    },


    /**
     * Split array into chunks of given size
     *
     * @param {Array} array - Array to be split
     * @param {number} chunkSize - Size of chunks
     * @return {Array} - Array of chunks
     */
    splitArray: function (array, chunkSize) {
      const length = array.length;
      const result = new Array(Math.ceil(length / chunkSize));

      let index = 0;
      let resultIndex = 0;

      while (index < length) {
        result[resultIndex++] = array.slice(index, index += chunkSize);
      }

      return result;
    },

    /**
     * Create icon element for app
     *
     * @param {HTMLElement} pageElement - Page element to append icon element
     * @param {Object} app - App object
     */
    createAppIcon: function (pageElement, app) {
      /**
       * Icon element
       * @type {Icon}
       */
      let icon;

      // Check if manifest URL for current locale is available
      if (app.manifestUrl[OrchidJS.L10n.currentLanguage]) {
        // Create icon element with manifest URL in current locale
        icon = new Icon(pageElement, app.manifestUrl[OrchidJS.L10n.currentLanguage], app.manifest, app.entry_id);
      } else {
        // Create icon element with manifest URL in English locale as fallback
        icon = new Icon(pageElement, app.manifestUrl['en-US'], app.manifest, app.entry_id);
      }
    },

    /**
     * A function to handle list failure.
     *
     * @param {error} error - The error parameter
     * @return {undefined}
     */
    handleListFailure: function (error) {
      console.error(error);
    }
  };

  Apps.init();
})(window);
