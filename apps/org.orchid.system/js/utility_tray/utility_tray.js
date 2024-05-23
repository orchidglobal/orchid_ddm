!(function (exports) {
  'use strict';

  const UtilityTray = {
    element: document.getElementById('utility-tray'),

    wifiPanel: document.getElementById('utility-tray-wifi'),
    wifiList: document.getElementById('utility-tray-wifi-list'),
    bluetoothPanel: document.getElementById('utility-tray-bluetooth'),

    wifiBackButton: document.getElementById('utility-tray-wifi-back-button'),
    bluetoothBackButton: document.getElementById('utility-tray-bluetooth-back-button'),

    controlCenter: document.getElementById('control-center'),
    quickSettings: document.getElementById('quick-settings'),
    quickSettingsGrid: document.getElementById('quick-settings-grid'),
    notifications: document.getElementById('notifications'),

    mediaPlayback: document.getElementById('media-playback'),

    wifiButton: document.getElementById('quick-settings-wifi'),
    bluetoothButton: document.getElementById('quick-settings-bluetooth'),
    cellularDataButton: document.getElementById('quick-settings-cellular-data'),
    airplaneButton: document.getElementById('quick-settings-airplane'),
    audioButton: document.getElementById('quick-settings-audio'),
    screenCaptureButton: document.getElementById('quick-settings-screen-capture'),
    flashlightButton: document.getElementById('quick-settings-flashlight'),
    darkModeButton: document.getElementById('quick-settings-dark-mode'),
    focusButton: document.getElementById('quick-settings-focus'),
    castButton: document.getElementById('quick-settings-cast'),
    lockButton: document.getElementById('quick-settings-lock'),

    audioSlider: document.getElementById('audio-slider'),
    brightnessSlider: document.getElementById('brightness-slider'),

    settings: [
      'comms.airplane.enabled',
      'audio.mute.enabled',
      'general.focus.enabled',
      'general.focus.mode',
      'general.focus.custom_modes',
      'video.dark_mode.enabled'
    ],
    SETTINGS_AIRPLANE_ENABLED: 0,
    SETTINGS_AUDIO_MUTE_ENABLED: 1,
    SETTINGS_FOCUS_ENABLED: 2,
    SETTINGS_FOCUS_MODE: 3,
    SETTINGS_FOCUS_CUSTOM_MODES: 4,
    SETTINGS_DARK_MODE_ENABLED: 5,

    SOUND_NOTIFIER: new Audio('http://shared.localhost:9920/resources/notifications/notifier_orchid2.wav'),

    init: function () {
      this.controlCenter.addEventListener('scroll', this.handleScroll.bind(this));
      this.notifications.addEventListener('scroll', this.handleScroll.bind(this));

      this.wifiButton.addEventListener('click', this.handleWifiButton.bind(this));
      this.bluetoothButton.addEventListener('click', this.handleBluetoothButton.bind(this));
      this.cellularDataButton.addEventListener('click', this.handleCellularDataButton.bind(this));
      this.airplaneButton.addEventListener('click', this.handleAirplaneButton.bind(this));
      this.audioButton.addEventListener('click', this.handleAudioButton.bind(this));
      this.screenCaptureButton.addEventListener('click', this.handleScreenCaptureButton.bind(this));
      this.flashlightButton.addEventListener('click', this.handleFlashlightButton.bind(this));
      this.darkModeButton.addEventListener('click', this.handleDarkModeButton.bind(this));
      this.focusButton.addEventListener('click', this.handleFocusButton.bind(this));
      this.lockButton.addEventListener('click', this.handleLockButton.bind(this));

      new OrchidJS.ForceTouch(this.wifiButton, this.handleWifiButtonHold.bind(this), 'hold');
      new OrchidJS.ForceTouch(this.bluetoothButton, this.handleBluetoothButtonHold.bind(this), 'hold');

      this.wifiBackButton.addEventListener('click', this.handleWifiBackButton.bind(this));
      this.bluetoothBackButton.addEventListener('click', this.handleBluetoothBackButton.bind(this));

      this.brightnessSlider.addEventListener('pointerdown', this.handleBrightnessSliderDown.bind(this));
      this.brightnessSlider.addEventListener('pointerup', this.handleBrightnessSliderUp.bind(this));

      this.wifiButton.button?.classList.toggle('enabled', WifiManager.isEnabled);

      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_AIRPLANE_ENABLED]).then(this.handleAirplaneMode.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_AUDIO_MUTE_ENABLED]).then(this.handleAudioMute.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_FOCUS_ENABLED]).then(this.handleFocusMode.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_FOCUS_MODE]).then(this.handleFocusSelectedMode.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_DARK_MODE_ENABLED]).then(this.handleDarkMode.bind(this));

      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_AIRPLANE_ENABLED], this.handleAirplaneMode.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_AUDIO_MUTE_ENABLED], this.handleAudioMute.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_FOCUS_ENABLED], this.handleFocusMode.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_FOCUS_MODE], this.handleFocusSelectedMode.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_DARK_MODE_ENABLED], this.handleDarkMode.bind(this));

      this.audioSlider.addEventListener('input', this.handleTraySlider.bind(this, this.audioSlider));
      this.brightnessSlider.addEventListener('input', this.handleTraySlider.bind(this, this.brightnessSlider));

      const rows = this.quickSettings.querySelectorAll('.row');
      rows.forEach((row, index) => {
        row.querySelectorAll('*').forEach((child) => {
          child.style.transitionDelay = (index * 50) + 'ms';
        });
      });
    },

    handleAirplaneMode: function (value) {
      this.airplaneButton.button?.classList.toggle('enabled', value);
    },

    handleAudioMute: function (value) {
      this.audioButton.button?.classList.toggle('enabled', !value);
      this.audioButton.classList.toggle('ringing', !value);
      this.audioButton.classList.toggle('muted', value);
    },

    handleFocusMode: function (value) {
      this.focusButton.button?.classList.toggle('enabled', value);
    },

    handleFocusSelectedMode: async function (value) {
      const selected = await OrchidJS.Settings.getValue(value, 'focus-mode.json');
      this.focusButton.querySelector('[data-icon]').dataset.icon = selected?.icon || 'focus';

      if (selected?.label) {
        this.focusButton.querySelector('.text-holder .detail').textContent = selected?.label;
      } else {
        this.focusButton.querySelector('.text-holder .detail').textContent = '';
      }

      if (selected?.l10n_id) {
        this.focusButton.querySelector('.text-holder .detail').dataset.l10nId = selected?.l10n_id;
      } else {
        this.focusButton.querySelector('.text-holder .detail').dataset.l10nId = '';
      }
    },

    handleDarkMode: function (value) {
      this.darkModeButton.button?.classList.toggle('enabled', value);
    },

    handleTraySlider: function (input) {
      input.style.setProperty('--slider-progress', input.value / input.max);
    },

    handleScroll: function (event) {
      const scrollPosition = event.target.scrollTop;
      let progress = scrollPosition / 100;
      if (progress >= 1) {
        progress = 1;
      }

      this.element.style.setProperty('--tray-scroll-progress', progress);
    },

    handleWifiButton: function () {
      this.wifiButton.button?.classList.toggle('enabled');

      if (WifiManager.isEnabled) {
        WifiManager.disable();
      } else {
        WifiManager.enable();
      }
    },

    handleWifiButtonHold: function () {
      OrchidJS.Transitions.scale(this.wifiButton, this.wifiPanel, true);
      this.element.classList.add('panel-open');
      this.wifiPanel.classList.add('visible');

      this.searchNetworks();
    },

    searchNetworks: async function () {
      try {
        const networks = await WifiManager.scan();
        const connectedNetworks = await WifiManager.getCurrentConnections();
        this.wifiList.innerHTML = '';
        const networksFiltered = networks.filter((item, index, self) =>
          index === self.findIndex(obj => obj.mac === item.mac)
        );
        networksFiltered.forEach((network) => {
          // Convert signal strength to percentage
          const signalStrengthPercentage = network.quality;

          const listItem = document.createElement('li');
          listItem.classList.add('page');
          listItem.dataset.icon = `wifi-${Math.round(
            signalStrengthPercentage / 25
          )}`;
          this.wifiList.appendChild(listItem);

          const listName = document.createElement('p');
          listName.textContent = network.ssid || OrchidJS.L10n.get('wifiHidden');
          listItem.appendChild(listName);

          const listSecurity = document.createElement('p');
          if (network.mac === connectedNetworks[0].mac) {
            listItem.classList.add('connected');
            listSecurity.textContent = OrchidJS.L10n.get('wifiConnected');
          } else {
            listSecurity.textContent = network.security;
          }
          listItem.appendChild(listSecurity);
        });
      } catch (error) {
        console.error('Error fetching available networks:', error);
      }
    },

    handleWifiBackButton: function () {
      OrchidJS.Transitions.scale(this.wifiPanel, this.wifiButton, true);
      this.element.classList.remove('panel-open');
      this.wifiPanel.classList.remove('visible');
    },

    handleBluetoothButton: function () {
      this.bluetoothButton.button?.classList.toggle('enabled');
    },

    handleBluetoothButtonHold: function () {
      OrchidJS.Transitions.scale(this.bluetoothButton, this.bluetoothPanel, true);
      this.element.classList.add('panel-open');
      this.bluetoothPanel.classList.add('visible');
    },

    handleBluetoothBackButton: function () {
      OrchidJS.Transitions.scale(this.bluetoothPanel, this.bluetoothButton, true);
      this.element.classList.remove('panel-open');
      this.bluetoothPanel.classList.remove('visible');
    },

    handleCellularDataButton: function () {
      this.cellularDataButton.button?.classList.toggle('enabled');
    },

    handleAirplaneButton: function () {
      Settings.getValue(this.settings[this.SETTINGS_AIRPLANE_ENABLED]).then((value) => {
        Settings.setValue(this.settings[this.SETTINGS_AIRPLANE_ENABLED], !value);
        this.airplaneButton.button?.classList.toggle('enabled', !value);
      });
    },

    handleAudioButton: function () {
      Settings.getValue(this.settings[this.SETTINGS_AUDIO_MUTE_ENABLED]).then((value) => {
        Settings.setValue(this.settings[this.SETTINGS_AUDIO_MUTE_ENABLED], !value);
        this.audioButton.button?.classList.toggle('enabled', !value);
        this.audioButton.classList.toggle('ringing', !value);
        this.audioButton.classList.toggle('muted', value);

        if (!value) {
          this.SOUND_NOTIFIER.currentTime = 0;
          this.SOUND_NOTIFIER.play();
        } else {
          this.SOUND_NOTIFIER.pause();
        }
      });
    },

    handleScreenCaptureButton: function () {
      this.screenCaptureButton.button?.classList.toggle('enabled');
    },

    handleFlashlightButton: function () {
      this.flashlightButton.button?.classList.toggle('enabled');
    },

    handleDarkModeButton: function () {
      Settings.getValue(this.settings[this.SETTINGS_DARK_MODE_ENABLED]).then((value) => {
        Settings.setValue(this.settings[this.SETTINGS_DARK_MODE_ENABLED], !value);
        this.darkModeButton.button?.classList.toggle('enabled', !value);
      });
    },

    handleFocusButton: function () {
      Settings.getValue(this.settings[this.SETTINGS_FOCUS_ENABLED]).then((value) => {
        Settings.setValue(this.settings[this.SETTINGS_FOCUS_ENABLED], !value);
        this.focusButton.button?.classList.toggle('enabled', !value);
      });
    },

    handleLockButton: function () {
      UtilityTrayMotion.hide();
      LockscreenMotion.show();
      LockscreenMotion.resetMotion();
    },

    handleBrightnessSliderDown: function () {
      this.element.classList.add('brightness-changing');
    },

    handleBrightnessSliderUp: function () {
      this.element.classList.remove('brightness-changing');
    }
  };

  UtilityTray.init();
})(window);
