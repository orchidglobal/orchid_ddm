!(function (exports) {
  'use strict';

  const LockscreenNotifications = {
    motionElement: document.getElementById('lockscreen'),
    notifications: document.getElementById('lockscreen-notifications'),
    notificationsBadge: document.getElementById('lockscreen-notifications-badge'),

    init: function () {
      this.notificationsBadge.addEventListener('click', this.handleNotificationsBadgeClick.bind(this));
    },

    handleNotificationsBadgeClick: function (event) {
      this.motionElement.classList.add('notifications-visible');
      this.notifications.classList.add('visible');
      this.notificationsBadge.classList.add('hidden');
    }
  };

  LockscreenNotifications.init();
})(window);
