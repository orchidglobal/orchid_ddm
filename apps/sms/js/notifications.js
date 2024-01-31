!(function (exports) {
  'use strict';

  const Notifications = {
    isLoaded: false,

    SOUND_MSG_SENT: new Audio('/resources/sounds/msg_sent.wav'),

    init: async function () {
      this.isLoaded = false;

      const userId = await OrchidServices.userId();
      OrchidServices.getWithUpdate(`profile/${userId}`, (data) => {
        const friends = data.friends;
        for (let index = 0, length = friends.length; index < length; index++) {
          const friend = friends[index];
          OrchidServices.getWithUpdate(`messages/${friend.token}`, (data) => {
            if (this.isLoaded) {
              const message = data.messages[data.messages.length - 1];
              if (document.visibilityState === 'hidden' || document.orchidVisibilityState === 'hidden') {
                this.sendNotification(message);
              }
            }
            this.isLoaded = true;
          });
        }
      });
    },

    sendNotification: function (message) {
      if (!('Notification' in window)) {
        console.error('This browser does not support desktop notifications.');
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission !== 'granted') {
            return;
          }
          OrchidServices.getWithUpdate(`profile/${message.publisher_id}`, (data) => {
            this.SOUND_MSG_SENT.currentTime = 0;
            this.SOUND_MSG_SENT.play();
            const notification = new Notification(data.username, {
              body: message.content,
              icon: data.profile_picture,
              badge: '/style/icons/sms_64.png',
              silent: true
            });

            notification.onclick = function () {
              window.focus();
              notification.close();
            };
          });
        });
      }
    }
  };

  Notifications.init();
})(window);
