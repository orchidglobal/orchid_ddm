!(function (exports) {
  'use strict';

  const Lockscreen = {
    statusbar: document.getElementById('lockscreen-statusbar'),

    statusbarInstance: null,

    init: function () {
      LazyLoader.load([
        'js/statusbar.js',
        'js/statusbar_icon.js',
        'js/time_icon.js',
        'js/battery_icon.js',
        'js/wifi_icon.js'
      ], () => {
        this.statusbarInstance = new Statusbar(this.statusbar);
      });
    }
  };

  Lockscreen.init();
})(window);
