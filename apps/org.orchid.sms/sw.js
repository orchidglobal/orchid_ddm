const cacheName = 'your-app-cache';
const filesToCache = [
  '/',
  '/index.html',
  './style/icons/sms.svg',
  './default_theme/style/index.css',
  './shared/style/layout.css',
  './shared/style/icons/icons.css',
  './shared/style/panels.css',
  './shared/style/headers.css',
  './shared/style/tablists.css',
  './shared/style/activity_bars.css',
  './shared/style/buttons.css',
  './shared/style/lists.css',
  './shared/style/switches.css',
  './shared/style/checkboxes.css',
  './shared/style/seekbars.css',
  './shared/style/input_areas.css',
  './shared/style/transitions.css',
  'style/sms.css',
  'style/media.css',
  './shared/js/smooth-scrollbar.js',
  './shared/js/plugins/overscroll.js',
  './shared/js/panels.js',
  './shared/js/spatial_navigation.js',
  './shared/js/page_controller.js',
  './shared/js/file_picker.js',
  './shared/js/compress_image.js',
  './shared/js/transitions.js',
  './shared/js/l10n.js',
  'js/bootstrap.js',
  'js/friends.js',
  'js/pages/add_friend/main.js',
  'js/pages/chat/main.js',
  'js/pages/chat/emojis.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        return cache.addAll(filesToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
