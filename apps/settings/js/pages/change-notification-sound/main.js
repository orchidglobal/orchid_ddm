!(function (exports) {
  'use strict';

  const ChangeNotificationSound = {
    notificationSoundList: document.getElementById('change-notification-sound-list'),

    init: function () {
      fetch(`http://shared.localhost:8081/resources/notifications/list.json`)
        .then(response => response.json())
        .then((data) => {
          data.forEach(item => {
            const notificationSound = document.createElement('li');
            notificationSound.addEventListener('click', () => this.changeNotificationSound(item.namespace));
            this.notificationSoundList.appendChild(notificationSound);

            const label = document.createElement('p');
            label.dataset.l10nId = item.namespace;
            notificationSound.appendChild(label);
          });
        });
    },

    changeNotificationSound: function (notificationSound) {
      window.Settings.setValue('audio.notification', notificationSound);
    }
  };

  SettingsApp.ChangeNotificationSound = ChangeNotificationSound;
})(window);
