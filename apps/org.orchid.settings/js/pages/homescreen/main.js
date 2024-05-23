!(function (exports) {
  'use strict';

  const Homescreen = {
    wallpaper: document.getElementById('wallpaper'),
    wallpaperImage: document.getElementById('wallpaper-image'),
    softwareButtonsCheckbox: document.getElementById('homescreen-software-buttons-checkbox'),

    init: function () {
      window.Settings.getValue('video.wallpaper.url').then((data) => {
        this.wallpaperImage.src = data;
      });

      this.softwareButtonsCheckbox.addEventListener('change', this.handleSoftwareButtonsCheckbox.bind(this));
      window.Settings.getValue('general.software_buttons.enabled').then((value) => {
        this.softwareButtonsCheckbox.checked = value;
      });
    },

    handleSoftwareButtonsCheckbox: function () {
      window.Settings.setValue('general.software_buttons.enabled', this.softwareButtonsCheckbox.checked);
    }
  };

  SettingsApp.Homescreen = Homescreen;
})(window);
