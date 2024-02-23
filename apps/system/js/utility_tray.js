!(function (exports) {
  'use strict';

  const UtilityTray = {
    element: document.getElementById('utility-tray'),

    mediaPlaybackPanel: document.getElementById('utility-tray-media-playback'),
    wifiPanel: document.getElementById('utility-tray-wifi'),
    bluetoothPanel: document.getElementById('utility-tray-bluetooth'),
    audioPanel: document.getElementById('utility-tray-audio'),

    mediaPlaybackBackButton: document.getElementById('utility-tray-media-playback-back-button'),
    wifiBackButton: document.getElementById('utility-tray-wifi-back-button'),
    bluetoothBackButton: document.getElementById('utility-tray-bluetooth-back-button'),
    audioBackButton: document.getElementById('utility-tray-audio-back-button'),

    titlebar: document.querySelector('#utility-tray .titlebar'),
    grippyBar: document.querySelector('#utility-tray .grippy-bar'),
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

    brightnessSlider: document.getElementById('brightness-slider'),

    AUDIO_PROFILES: [
      { id: 'ringing', icon: 'bell' },
      { id: 'vibrate', icon: 'vibrate' },
      { id: 'muted', icon: 'bell-off' }
    ],
    SOUND_NOTIFIER: new Audio('http://shared.localhost:8081/resources/notifications/notifier_orchid2.wav'),

    audioIndex: 0,
    isCollapsed: false,
    isDragging: false,
    startY: null,
    currentY: null,

    init: function () {
      this.controlCenter.addEventListener('scroll', this.handleScroll.bind(this));
      this.notifications.addEventListener('scroll', this.handleScroll.bind(this));

      this.quickSettings.addEventListener('mousedown', this.onPointerDown.bind(this));
      document.addEventListener('mousemove', this.onPointerMove.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));
      this.grippyBar.addEventListener('click', this.handleGrippyBar.bind(this));

      this.wifiButton.addEventListener('click', this.handleWifiButton.bind(this));
      this.bluetoothButton.addEventListener('click', this.handleBluetoothButton.bind(this));
      this.cellularDataButton.addEventListener('click', this.handleCellularDataButton.bind(this));
      this.airplaneButton.addEventListener('click', this.handleAirplaneButton.bind(this));
      this.audioButton.addEventListener('click', this.handleAudioButton.bind(this));
      this.screenCaptureButton.addEventListener('click', this.handleScreenCaptureButton.bind(this));
      this.flashlightButton.addEventListener('click', this.handleFlashlightButton.bind(this));

      this.mediaPlayback.addEventListener('contextmenu', this.handleMediaPlaybackHold.bind(this));
      this.wifiButton.addEventListener('contextmenu', this.handleWifiButtonHold.bind(this));
      this.bluetoothButton.addEventListener('contextmenu', this.handleBluetoothButtonHold.bind(this));
      this.audioButton.addEventListener('contextmenu', this.handleAudioButtonHold.bind(this));

      this.mediaPlaybackBackButton.addEventListener('click', this.handleMediaPlaybackBackButton.bind(this));
      this.wifiBackButton.addEventListener('click', this.handleWifiBackButton.bind(this));
      this.bluetoothBackButton.addEventListener('click', this.handleBluetoothBackButton.bind(this));
      this.audioBackButton.addEventListener('click', this.handleAudioBackButton.bind(this));

      this.brightnessSlider.addEventListener('pointerdown', this.handleBrightnessSliderDown.bind(this));
      this.brightnessSlider.addEventListener('pointerup', this.handleBrightnessSliderUp.bind(this));

      this.wifiButton.parentElement.classList.toggle('enabled', WifiManager.isEnabled);

      this.audioButton.classList.remove('ringing', 'vibrate', 'muted');
      Settings.getValue('audio.profile_type').then(this.handleAudioProfile.bind(this));
      Settings.addObserver('audio.profile_type', this.handleAudioProfile.bind(this));

      this.quickSettings.classList.add('collapsed');
    },

    handleAudioProfile: function (value) {
      this.audioButton.classList.add(this.AUDIO_PROFILES[value].id);
      this.audioButton.children[1].dataset.l10nId = 'quickSettings-audio-' + this.AUDIO_PROFILES[value].id;
    },

    handleScroll: function (event) {
      const scrollPosition = event.target.scrollTop;
      let progress = scrollPosition / 80;
      if (progress >= 1) {
        progress = 1;
      }

      this.titlebar.style.setProperty('--scroll-progress', progress);
    },

    onPointerDown: function (event) {
      this.isDragging = true;
      this.startY = event.clientY || event.touches[0].clientY;
      this.quickSettings.classList.add('dragging');
    },

    onPointerMove: function (event) {
      this.isDragging = true;
      this.currentY = event.clientY || event.touches[0].clientY;

      const movementY = this.currentY - this.startY;
      const progress = Math.min(1, Math.max(0, (movementY / window.innerHeight) * 5));

      this.quickSettings.style.setProperty('--quick-settings-motion-progress', progress);
    },

    onPointerUp: function (event) {
      this.isDragging = false;
      this.currentY = event.clientY || event.touches[0].clientY;

      const movementY = this.currentY - this.startY;
      const progress = Math.min(1, Math.max(0, (movementY / window.innerHeight) * 5));
      this.quickSettings.classList.remove('dragging');
    },

    handleGrippyBar: function () {
      this.quickSettings.classList.toggle('collapsed');
      this.isCollapsed = !this.isCollapsed;
      if (!this.isCollapsed) {
        const height = `${this.quickSettingsGrid.scrollHeight}px`;
        this.quickSettings.style.setProperty('--quick-settings-grid-height', height);
      }
    },

    handleMediaPlaybackHold: function () {
      Transitions.scale(this.mediaPlayback, this.mediaPlaybackPanel);
      this.element.classList.add('panel-open');
      this.mediaPlaybackPanel.classList.add('visible');
    },

    handleMediaPlaybackBackButton: function () {
      Transitions.scale(this.mediaPlaybackPanel, this.mediaPlayback);
      this.element.classList.remove('panel-open');
      this.mediaPlaybackPanel.classList.remove('visible');
    },

    handleWifiButton: function () {
      this.wifiButton.parentElement.classList.toggle('enabled');

      if (WifiManager.isEnabled) {
        WifiManager.disable();
      } else {
        WifiManager.enable();
      }
    },

    handleWifiButtonHold: function () {
      Transitions.scale(this.wifiButton.parentElement, this.wifiPanel);
      this.element.classList.add('panel-open');
      this.wifiPanel.classList.add('visible');
    },

    handleWifiBackButton: function () {
      Transitions.scale(this.wifiPanel, this.wifiButton.parentElement);
      this.element.classList.remove('panel-open');
      this.wifiPanel.classList.remove('visible');
    },

    handleBluetoothButton: function () {
      this.bluetoothButton.parentElement.classList.toggle('enabled');
    },

    handleBluetoothButtonHold: function () {
      Transitions.scale(this.bluetoothButton.parentElement, this.bluetoothPanel);
      this.element.classList.add('panel-open');
      this.bluetoothPanel.classList.add('visible');
    },

    handleBluetoothBackButton: function () {
      Transitions.scale(this.bluetoothPanel, this.bluetoothButton.parentElement);
      this.element.classList.remove('panel-open');
      this.bluetoothPanel.classList.remove('visible');
    },

    handleCellularDataButton: function () {
      this.cellularDataButton.parentElement.classList.toggle('enabled');
    },

    handleAirplaneButton: function () {
      this.airplaneButton.parentElement.classList.toggle('enabled');
    },

    handleAudioButton: function () {
      this.audioIndex = (this.audioIndex - 1 + this.AUDIO_PROFILES.length) % this.AUDIO_PROFILES.length;
      this.audioButton.classList.remove('ringing', 'vibrate', 'muted');
      this.audioButton.classList.add(this.AUDIO_PROFILES[this.audioIndex].id);

      if (this.AUDIO_PROFILES[this.audioIndex].id !== 'muted') {
        this.audioButton.parentElement.classList.add('enabled');
      } else {
        this.audioButton.parentElement.classList.remove('enabled');
      }
      this.audioButton.children[1].dataset.l10nId = 'quickSettings-audio-' + this.AUDIO_PROFILES[this.audioIndex].id;

      Settings.setValue('audio.profile_type', this.audioIndex);

      switch (this.AUDIO_PROFILES[this.audioIndex].id) {
        case 'ringing':
          this.SOUND_NOTIFIER.currentTime = 0;
          this.SOUND_NOTIFIER.play();

          Settings.setValue('audio.vibrate.enabled', true);
          Settings.setValue('audio.mute.enabled', false);
          break;

        case 'vibrate':
          navigator.vibrate(500);

          Settings.setValue('audio.vibrate.enabled', true);
          Settings.setValue('audio.mute.enabled', true);
          break;

        case 'muted':
          navigator.vibrate(500);

          Settings.setValue('audio.vibrate.enabled', false);
          Settings.setValue('audio.mute.enabled', true);
          break;

        default:
          break;
      }
    },

    handleAudioButtonHold: function () {
      Transitions.scale(this.audioButton.parentElement, this.audioPanel);
      this.element.classList.add('panel-open');
      this.audioPanel.classList.add('visible');
    },

    handleAudioBackButton: function () {
      Transitions.scale(this.audioPanel, this.audioButton.parentElement);
      this.element.classList.remove('panel-open');
      this.audioPanel.classList.remove('visible');
    },

    handleScreenCaptureButton: function () {
      this.screenCaptureButton.parentElement.classList.toggle('enabled');
    },

    handleFlashlightButton: function () {
      this.flashlightButton.parentElement.classList.toggle('enabled');
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
