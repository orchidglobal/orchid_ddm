!(function (exports) {
  'use strict';

  const LazyLoader = {
    loadedFiles: new Set(),

    load: function (assets, callback = null) {
      const promises = [];

      const loadAsset = (asset) => {
        const extension = asset.split('.').pop().toLowerCase();

        if (!LazyLoader.loadedFiles.has(asset)) {
          const promise = new Promise((resolve) => {
            if (extension === 'css') {
              const stylesLink = document.createElement('link');
              stylesLink.rel = 'stylesheet';
              stylesLink.href = asset;
              document.head.appendChild(stylesLink);
              stylesLink.onload = () => {
                LazyLoader.loadedFiles.add(asset);
                resolve();
              };
            } else if (extension === 'js') {
              const script = document.createElement('script');
              script.src = asset;
              script.async = true;
              document.body.appendChild(script);
              script.onload = () => {
                LazyLoader.loadedFiles.add(asset);
                resolve();
              };
            }
          });
          promises.push(promise);
        }
      };

      if (Array.isArray(assets)) {
        assets.forEach((asset) => {
          loadAsset(asset);
        });
      } else {
        loadAsset(assets);
      }

      Promise.all(promises).then(() => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    },
  };

  exports.LazyLoader = LazyLoader;
})(window);
