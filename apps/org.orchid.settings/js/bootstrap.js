!(function (exports) {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

  const SettingsApp = {};

  class Bootstrap extends OrchidJS.Framework {
    constructor() {
      super();
    }

    whenReady() {
      LazyLoader.load('js/pages/root/main.js');
      LazyLoader.load('js/pages/account/main.js');
      LazyLoader.load('js/pages/devices/main.js');
      LazyLoader.load('js/pages/wifi/main.js');
      LazyLoader.load('js/pages/bluetooth/main.js');
      LazyLoader.load('js/pages/general/main.js');
      LazyLoader.load('js/pages/webapps/main.js');
      LazyLoader.load('js/pages/languages/main.js');
      LazyLoader.load('js/pages/audio/main.js');
      LazyLoader.load('js/pages/change-ringtone/main.js');
      LazyLoader.load('js/pages/change-notification-sound/main.js');
      LazyLoader.load('js/pages/display/main.js');
      LazyLoader.load('js/pages/display/accent_color.js');
      LazyLoader.load('js/pages/display/font_settings.js');
      LazyLoader.load('js/pages/homescreen/main.js');
      LazyLoader.load('js/pages/homescreen/change.js');
      LazyLoader.load('js/pages/date-and-time/main.js');
      LazyLoader.load('js/pages/battery/main.js');
      LazyLoader.load('js/pages/battery/battery_icon.js');
      LazyLoader.load('js/pages/storage/main.js');
      LazyLoader.load('js/pages/accessibility/main.js');
      LazyLoader.load('js/pages/update/main.js');
      LazyLoader.load('js/pages/about/main.js');
    }
  }

  OrchidJS.setInstance(new Bootstrap());

  exports.SettingsApp = SettingsApp;
})(window);
