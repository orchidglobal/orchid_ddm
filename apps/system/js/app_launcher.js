!(function (exports) {
  'use strict';

  const AppLauncher = {
    element: document.getElementById('launcher'),
    toggleButton: document.getElementById('software-launcher-button'),
    maximizeButton: document.getElementById('launcher-maximize-button'),
    powerButton: document.getElementById('launcher-power-button'),
    settingsButton: document.getElementById('launcher-settings-button'),
    filesButton: document.getElementById('launcher-files-button'),

    accountButton: document.getElementById('launcher-account-button'),
    accountButtonAvatar: document.getElementById('launcher-account-avatar'),
    accountButtonUsername: document.getElementById('launcher-account-username'),

    windowsContainer: document.getElementById('windows'),

    isVisible: false,

    init: function () {
      if (window.deviceType !== 'desktop') {
        return;
      }
      this.windowsContainer.addEventListener('click', this.handleClickOff.bind(this));
      this.toggleButton.addEventListener('click', this.handleToggleButton.bind(this));
      this.powerButton.addEventListener('click', this.handleLauncherPowerButtonClick.bind(this));
      this.settingsButton.addEventListener('click', this.handleLauncherSettingsButtonClick.bind(this));
      this.filesButton.addEventListener('click', this.handleLauncherFilesButtonClick.bind(this));

      window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
    },

    handleClickOff: function () {
      if (this.isVisible) {
        this.hide();
      }
    },

    handleToggleButton: function () {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    },

    show: function () {
      this.isVisible = true;
      this.element.classList.add('visible');
      this.toggleButton.classList.add('active');
    },

    hide: function () {
      this.isVisible = false;
      this.element.classList.remove('visible');
      this.toggleButton.classList.remove('active');
    },

    handleServicesLoad: async function () {
      if (await _os.isLoggedIn()) {
        this.accountButton.style.display = '';
        _os.auth.getAvatar().then((data) => {
          this.accountButtonAvatar.src = data;
        });
        _os.auth.getUsername().then((data) => {
          this.accountButtonUsername.textContent = data;
        });
      } else {
        this.accountButton.style.display = 'none';
      }
      window.removeEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
    },

    handleLauncherMaximizeButtonClick: function (event) {
      this.element.classList.toggle('maximized');
    },

    handleLauncherPowerButtonClick: function (event) {
      PowerScreen.show();
    },

    handleLauncherSettingsButtonClick: function (event) {
      const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
    },

    handleLauncherFilesButtonClick: function (event) {
      const appWindow = new AppWindow('http://files.localhost:8081/manifest.json', {});
    }
  };

  AppLauncher.init();

  exports.AppLauncher = AppLauncher;
})(window);
