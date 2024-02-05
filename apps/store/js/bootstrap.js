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

  document.addEventListener('DOMContentLoaded', function () {
    LazyLoader.load('js/webapps.js');
    LazyLoader.load('js/slideshow.js');

    LazyLoader.load('js/pages/root/main.js');
    LazyLoader.load('js/pages/publish/main.js');
  });
})(window);
