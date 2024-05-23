!(function (exports) {
  'use strict';

  const TrayDevices = {
    devicesContainer: document.getElementById('devices-list'),
    reloadButton: document.getElementById('devices-reload-button'),

    timeoutID: null,

    init: function () {
      this.loadDevices();

      this.reloadButton.addEventListener('click', this.loadDevices.bind(this));
    },

    loadDevices: async function () {
      if (await _os.isLoggedIn()) {
        this.createSkeletonPolymer();

        clearTimeout(this.timeoutID);
        this.timeoutID = setTimeout(() => {
          _os.auth.getDevices().then(this.handleDevices.bind(this));
        }, 1000);
      } else {
        // this.createSkeletonPolymer();
      }
    },

    createSkeletonPolymer: async function () {
      this.devicesContainer.innerHTML = '';

      const fragment = document.createDocumentFragment();

      for (let index = 0; index < 5; index++) {
        const element = document.createElement('li');
        element.classList.add('device');
        element.classList.add('pack-skeleton');
        fragment.appendChild(element);

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        element.appendChild(textHolder);

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = 'Skeleton Polymer';
        textHolder.appendChild(name);

        const type = document.createElement('div');
        type.classList.add('type');
        type.textContent = 'Skeleton Polymer';
        textHolder.appendChild(type);

        const statusbar = document.createElement('div');
        statusbar.classList.add('statusbar');
        element.appendChild(statusbar);

        const battery = document.createElement('div');
        battery.classList.add('battery');
        battery.dataset.icon = ' ';
        statusbar.appendChild(battery);

        const wifi = document.createElement('div');
        wifi.classList.add('wifi');
        wifi.dataset.icon = ' ';
        statusbar.appendChild(wifi);
      }

      this.devicesContainer.appendChild(fragment);
    },

    handleDevices: async function (data) {
      this.devicesContainer.innerHTML = '';

      const fragment = document.createDocumentFragment();

      const devices = data;
      for (let index = 0; index < devices.length; index++) {
        const device = devices[index];
        const deviceID = device.token;

        if (await _os.devices.deviceId() == deviceID) {
          continue;
        }
        let firstName;
        let deviceType;

        const username = await _os.auth.getUsername();
        if (username.includes(' ')) {
          return username.split(' ')[0];
        } else {
          // If username is in camelCase, extract the first word
          const camelCaseMatch = username.match(/[A-Z]?[a-z]+/g);
          if (camelCaseMatch) {
            firstName = camelCaseMatch[0];
          } else {
            firstName = username; // Return the username if no spaces or camelCase found
          }
        }

        const userAgent = await _os.devices.getUserAgent(deviceID);
        if (userAgent.includes('Mobile')) {
          deviceType = 'phone';
        } else if (userAgent.includes('Smart TV')) {
          deviceType = 'smartTV';
        } else if (userAgent.includes('VR')) {
          deviceType = 'VR';
        } else if (userAgent.includes('Homepad')) {
          deviceType = 'homeTablet';
        } else if (userAgent.includes('Wear')) {
          deviceType = 'watch';
        } else {
          deviceType = 'desktop';
        }

        const element = document.createElement('li');
        element.classList.add('device');
        fragment.appendChild(element);

        const textHolder = document.createElement('div');
        textHolder.classList.add('text-holder');
        element.appendChild(textHolder);

        const name = document.createElement('div');
        name.classList.add('name');
        name.textContent = L10n.get(`deviceName-${deviceType}`, {
          username: firstName
        });
        textHolder.appendChild(name);

        const type = document.createElement('div');
        type.classList.add('type');
        type.textContent = L10n.get(`deviceType-${deviceType}`, {
          username: firstName
        });
        textHolder.appendChild(type);

        const statusbar = document.createElement('div');
        statusbar.classList.add('statusbar');
        element.appendChild(statusbar);

        const battery = document.createElement('div');
        battery.classList.add('battery');
        statusbar.appendChild(battery);

        const wifi = document.createElement('div');
        wifi.classList.add('wifi');
        statusbar.appendChild(wifi);

        _os.devices.getLiveDevice(deviceID, (data) => {
          name.textContent = data.device_name || L10n.get(`deviceName-${deviceType}`, {
            username: firstName
          });

          battery.dataset.icon =
            data.battery_state === 'charging'
              ? `battery-charging-${Math.round(data.battery_level * 10) * 10}`
              : `battery-${Math.round(data.battery_level * 10) * 10}`;
          wifi.dataset.icon = `wifi-${Math.round(data.wifi_level / 4) * 4}`;
        });
      }

      this.devicesContainer.appendChild(fragment);
    }
  };

  TrayDevices.init();
})(window);
