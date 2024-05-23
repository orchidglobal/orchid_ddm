!(function (exports) {
  'use strict';

  const NotificationToaster = {
    _index: 0,

    notificationsContainer: document.getElementById('notifications-container'),

    notificationElement: document.getElementById('notification-toaster'),
    titleElement: document.getElementById('notification-title'),
    detailElement: document.getElementById('notification-detail'),
    progressElement: document.getElementById('notification-progress'),
    badgeElement: document.getElementById('notification-badge'),
    sourceNameElement: document.getElementById('notification-source-name'),
    iconElement: document.getElementById('notification-icon'),
    mediaElement: document.getElementById('notification-media'),
    actionsElement: document.getElementById('notification-actions'),

    lockscreenCard: document.getElementById('lockscreen-card'),

    isDragging: false,
    timeoutID: null,
    startX: 0,
    currentX: 0,
    threshold: 0.5,

    SOUND_NOTIFIER: new Audio('http://shared.localhost:9920/resources/notifications/notifier_orchid2.wav'),

    showNotification: function (title, options) {
      const { source, tag } = options;

      const fragment = document.createDocumentFragment();

      const dom = `
        <div class="media"></div>
        <div class="titlebar">
          <img src="" class="badge" />
          <div class="source-name"></div>
        </div>
        <div class="content">
          <img src="" class="icon" />
          <div class="text-holder">
            <div class="title"></div>
            <div class="detail"></div>
            <div class="progress"></div>
          </div>
        </div>
        <div class="actions"></div>
      `;

      let notification;
      let lockscreenNotification;

      const taggedNotification = this.notificationsContainer.querySelector(`[data-tag="${tag}"]`);
      const taggedLockscreenNotification = this.lockscreenCard.notifications?.querySelector(`[data-tag="${tag}"]`);

      if (taggedNotification && taggedLockscreenNotification) {
        notification = taggedNotification;
        notification.setContent(title, options);

        lockscreenNotification = taggedLockscreenNotification;
        lockscreenNotification.setContent(title, options);
      } else {
        this._index++;
        // this.lockscreenNotificationBadge.dataset.l10nArgs = JSON.stringify({
        //   count: this._index
        // });

        notification = new HTMLNotificationToasterElement();
        notification.classList.add('notification');
        notification.setContent(title, options);
        if (tag) {
          notification.dataset.tag = tag;
        }
        this.notificationsContainer.appendToGroup(notification, source);

        lockscreenNotification = new HTMLNotificationToasterElement();
        lockscreenNotification.classList.add('notification');
        lockscreenNotification.setContent(title, options);
        if (tag) {
          lockscreenNotification.dataset.tag = tag;
        }
        this.lockscreenCard.notifications?.appendToGroup(lockscreenNotification, source);
      }

      if (!taggedNotification) {
        this.SOUND_NOTIFIER.currentTime = 0;
        this.SOUND_NOTIFIER.play();
      }

      this.notificationElement.classList.add('visible');

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(() => {
        this.notificationElement.classList.remove('visible');
      }, 3000);
    },

    hideNotification: function () {
      this.notificationElement.classList.remove('visible');
    },

    onPointerDown: function (event, notification) {
      this.startX = event.clientX;
      this.currentX = this.startX;
      this.isDragging = true;
      notification.classList.remove('transitioning');
    },

    onPointerMove: function (event, notification) {
      if (!this.isDragging) {
        return;
      }
      // event.preventDefault();
      event.stopPropagation();
      this.currentX = event.clientX;

      const distanceX = this.currentX - this.startX;
      notification.style.translate = `${distanceX}px 0`;
    },

    onPointerUp: function (event, notification) {
      if (!this.isDragging) {
        return;
      }
      const distanceX = this.currentX - this.startX;
      const thresholdX = this.threshold * notification.offsetWidth;

      if (distanceX >= thresholdX) {
        // Swipe right
        notification.style.translate = '100%';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', () => {
          notification.classList.remove('transitioning');
          notification.remove();

          this._index--;
          this.lockscreenNotificationBadge.textContent = this._index;
        });
      } else if (distanceX <= -thresholdX) {
        // Swipe left
        notification.style.translate = '-100%';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', () => {
          notification.classList.remove('transitioning');
          notification.remove();

          this._index--;
          this.lockscreenNotificationBadge.textContent = this._index;
        });
      } else {
        // Reset position
        notification.style.translate = '0';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', function () {
          notification.classList.remove('transitioning');
        });
      }
      this.isDragging = false;
    }
  };

  exports.NotificationToaster = NotificationToaster;
})(window);
