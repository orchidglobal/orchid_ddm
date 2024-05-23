!(function (exports) {
  'use strict';

  const WallpaperManager = {
    screen: document.getElementById('screen'),
    wallpaperImage: document.getElementById('wallpaper-image'),
    wallpaperMotion: document.getElementById('wallpaper-motion'),

    init: function () {
      OrchidJS.Settings.getValue('video.wallpaper.url').then(this.handleWallpaper.bind(this));
      OrchidJS.Settings.addObserver('video.wallpaper.url', this.handleWallpaper.bind(this));
    },

    handleWallpaper: function (value) {
      this.wallpaperImage.src = value;
    },

    handleMotionWallpaper: function (value) {
      this.wallpaperMotion.set(value);
    }
  };

  WallpaperManager.init();

  exports.WallpaperManager = WallpaperManager;
})(window);
