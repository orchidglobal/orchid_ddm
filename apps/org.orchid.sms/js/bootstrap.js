!(function (exports) {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }

  window.addEventListener('orchid-services-ready', () => {
    LazyLoader.load('js/friends.js');
    LazyLoader.load('js/notifications.js');
    LazyLoader.load('js/account_init.js');
    LazyLoader.load('js/account.js');
    LazyLoader.load('js/modal_dialog.js');

    LazyLoader.load('js/pages/chat/main.js');
    LazyLoader.load('js/pages/chat/emojis.js');
    LazyLoader.load('js/pages/add_friend/main.js');
    LazyLoader.load('js/pages/media_viewer/main.js');
  });

  document.addEventListener('DOMContentLoaded', function () {
    SpatialNavigation.init();
    SpatialNavigation.add({
      selector: '.tablist a, .tablist button, .tablist .lists ul li, .visible a, .visible button, .visible .lists ul li, .visible .lists ul li input'
    });
    SpatialNavigation.makeFocusable();
    SpatialNavigation.focus();
  });
})(window);
