!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const AppsManagerAPI = {
    getAllApps: function () {
      return new Promise(async (resolve, reject) => {
        if ('AppsManager' in window) {
          // Backward compatibility
          resolve(await AppsManager.getAll());
        } else {
          const appsList = await fetch('http://localhost:9920/api/data/webapps/getall').then((response) =>
            response.json()
          );

          let currentLanguage;
          if ('OrchidJS' in window && 'Settings' in OrchidJS) {
            currentLanguage = await OrchidJS.Settings.getValue('general.lang.code');
          }

          for (let index = 0; index < appsList.length; index++) {
            const app = appsList[index];

            let langCode;
            try {
              langCode = currentLanguage || 'en-US';
            } catch (error) {
              // If an error occurs, set a default value for langCode
              langCode = 'en-US';
            }

            let manifestUrl;
            if (app.manifestUrl[langCode]) {
              manifestUrl = app.manifestUrl[langCode];
            } else {
              manifestUrl = app.manifestUrl['en-US'];
            }

            let manifest;
            const xhr = new XMLHttpRequest();
            xhr.open('GET', manifestUrl, true);
            xhr.onreadystatechange = () => {
              if (xhr.readyState == 4 && xhr.status == 200) {
                manifest = JSON.parse(xhr.responseText);

                if (!manifest.role) {
                  manifest.role = 'webapp';
                }
                app.manifest = manifest;
                app.size = 0;

                if (index === appsList.length - 1) {
                  setTimeout(() => {
                    resolve(appsList);
                  }, 16);
                }
              }
            };
            xhr.send();
          }
        }
      });
    },

    installPackage: async function name(path) {
      if ('AppsManager' in window) {
        // Backward compatibility
        return await AppsManager.installPackage();
      } else {
        return await fetch('http://localhost:9920/api/data/webapps/install?path=' + path).then((response) =>
          response.json()
        );
      }
    },

    uninstall: async function name(appId) {
      if ('AppsManager' in window) {
        // Backward compatibility
        return await AppsManager.uninstall();
      } else {
        return await fetch('http://localhost:9920/api/data/webapps/uninstall?id=' + appId).then((response) =>
          response.json()
        );
      }
    }
  };

  OrchidJS.AppsManager = AppsManagerAPI;
})(window);
