!(function (exports) {
  'use strict';

  const HomescreenChange = {
    webappsList: document.getElementById('homescreen-change-list'),

    currentHomescreen: '',

    APP_ICON_SIZE: 40,

    init: async function () {
      this.currentHomescreen = await SettingsApp.getValue(`homescreen.manifest_url.${OrchidJS.deviceType}`);

      this.webappsList.innerHTML = '';
      const fragment = document.createDocumentFragment();

      // Fetch available networks and populate the list
      const apps = OrchidJS.AppsManager.getAll();
      apps.then((data) => {
        for (let index = 0; index < data.length; index++) {
          const app = data[index];

          if (!app.manifest.role) {
            continue;
          }
          if (app.manifest.role !== 'homescreen') {
            continue;
          }

          const element = document.createElement('li');
          element.classList.add('hbox');
          // element.addEventListener('click', (event) => this.handleWebappInfo(app, element));
          fragment.appendChild(element);

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
          element.appendChild(icon);

          const pack = document.createElement('div');
          pack.classList.add('pack-radio');
          element.appendChild(pack);

          const label = document.createElement('label');
          label.for = app.appId;
          pack.appendChild(label);

          const textHolder = document.createElement('div');
          label.appendChild(textHolder);

          const name = document.createElement('p');
          name.textContent = app.manifest.name;
          textHolder.appendChild(name);

          const inputSpan = document.createElement('span');
          pack.appendChild(inputSpan);

          const radio = document.createElement('input');
          radio.id = app.appId;
          radio.name = 'change-homescreen-radio';
          radio.type = 'radio';
          inputSpan.appendChild(radio);

          if (app.manifestUrl['en-US'] === this.currentHomescreen) {
            radio.checked = true;
          }

          radio.addEventListener('pointerup', () => {
            if (radio.checked) {
              this.currentHomescreen = app.manifestUrl['en-US'];
              Settings.setValue(`homescreen.manifest_url.${window.deviceType}`, this.currentHomescreen);
            }
          });
        }

        this.webappsList.appendChild(fragment);
        PageController.init();
      });
    }
  };

  SettingsApp.HomescreenChange = HomescreenChange;
})(window);
