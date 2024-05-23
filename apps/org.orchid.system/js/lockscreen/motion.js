!(function (exports) {
  'use strict';

  const LockscreenMotion = {
    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    wallpaperMotion: document.getElementById('wallpaper-motion'),
    windowsContainer: document.getElementById('windows'),
    motionElement: document.getElementById('lockscreen'),
    lockscreenCard: document.getElementById('lockscreen-card'),
    bottomPanel: document.getElementById('bottom-panel'),

    isPINLocked: false,
    timeoutID: null,

    settings: ['lockscreen.type'],

    SWIPE_THRESHOLD: 0.25,
    SOUND_LOCK: new Audio('/resources/sounds/lock.wav'),
    SOUND_UNLOCK: new Audio('/resources/sounds/unlock.wav'),

    SETTINGS_LOCKSCREEN_TYPE: 0,

    init: function () {
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_LOCKSCREEN_TYPE]).then((value) => {
        if (value === 'pin') {
          this.isPINLocked = true;
        } else {
          this.isPINLocked = false;
        }
      });
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_LOCKSCREEN_TYPE], (value) => {
        if (value === 'pin') {
          this.isPINLocked = true;
        } else {
          this.isPINLocked = false;
        }
      });

      document.addEventListener('keyup', this.onKeyPress.bind(this));

      this.motionElement.addEventListener('dblclick', this.onDoubleTap.bind(this));

      const gestureUnlock = new OrchidJS.Gesture(this.motionElement, [0, -1], 300);
      gestureUnlock.onStart = this.handleGestureStart.bind(this);
      gestureUnlock.onProgress = this.handleGestureProgress.bind(this);
      gestureUnlock.onEnd = this.handleGestureEnd.bind(this);

      this.cameraButton.addEventListener('click', this.handleCameraButton.bind(this));
      DirectionalScale.init(this.cameraButton);
      DirectionalScale.init(this.flashlightButton);

      this.show();
    },

    handleGestureStart: function(event) {
      if (this.isPINLocked) {
        this.motionElement.classList.add('pin-lock');
      } else {
        this.motionElement.classList.remove('pin-lock');
      }

      this.screen.classList.add('lockscreen-visible'); // Add the CSS class to the screen
      this.motionElement.classList.add('visible'); // Add the CSS class to the motionElement
    },

    handleGestureProgress: function(event, progress, overscroll) {
      const motionProgress = 1 - Math.max(0, Math.min(1, progress));

      this.currentProgress = motionProgress;

      this.motionElement.style.setProperty('--motion-progress', motionProgress);
      this.bottomPanel.style.setProperty('--motion-progress', motionProgress);
    },

    handleGestureEnd: function(event, progress, overscroll) {
      const motionProgress = 1 - Math.max(0, Math.min(1, progress));

      this.motionElement.classList.add('transitioning');
      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
      }, 500);

      if (motionProgress >= this.SWIPE_THRESHOLD) {
        if (this.isPINLocked) {
          this.showPIN();
        } else {
          this.show();
        }
      } else {
        this.hide();
      }
    },

    onKeyPress: function (event) {
      switch (event.code) {
        case 'End':
          this.show();
          this.isDragging = false;
          break;

        default:
          break;
      }
    },

    onDoubleTap: function () {
      this.motionElement.classList.toggle('always-on-display');
      this.lockscreenCard.classList.toggle('always-on-display');
      this.wallpapersContainer.classList.toggle('always-on-display');
      this.bottomPanel.classList.toggle('always-on-display');

      this.wallpaperMotion.isAlwaysOnDisplay = !this.wallpaperMotion.isAlwaysOnDisplay;
    },

    hide: function () {
      if (this.isDragging) {
        this.SOUND_UNLOCK.currentTime = 0;
        this.SOUND_UNLOCK.play();
      }

      this.screen.classList.remove('lockscreen-visible');
      this.motionElement.classList.add('transitioning');
      this.motionElement.classList.remove('visible');
      this.motionElement.classList.remove('pin-lock-visible');
      this.bottomPanel.classList.add('transitioning');

      this.motionElement.style.setProperty('--motion-progress', 0);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.bottomPanel.style.setProperty('--motion-progress', 0);
      this.bottomPanel.style.setProperty('--overscroll-progress', 0);

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
        this.bottomPanel.classList.remove('transitioning');
      }, 500);

      this.windowsContainer.classList.remove('hidden');

      if ('OrchidJS' in window && 'IPC' in OrchidJS) {
        IPC.send('message', {
          type: 'lockscreen',
          action: 'unlock'
        });
      }

      this.wallpaperMotion.isUnlocked = true;
    },

    showPIN: function () {
      this.motionElement.classList.add('transitioning');
      this.motionElement.classList.add('pin-lock-visible');
      this.bottomPanel.classList.add('transitioning');

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(() => {
        this.motionElement.classList.remove('transitioning');
        this.bottomPanel.classList.remove('transitioning');
      }, 500);

      this.motionElement.style.setProperty('--motion-progress', 1);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.bottomPanel.style.setProperty('--motion-progress', 1);
      this.bottomPanel.style.setProperty('--overscroll-progress', 0);
    },

    show: function () {
      if (!this.isDragging) {
        if (!this.motionElement.classList.contains('visible')) {
          this.SOUND_LOCK.currentTime = 0;
          this.SOUND_LOCK.play();
        }
      }

      this.motionElement.classList.remove('notifications-visible');
      this.lockscreenCard.notifications?.classList.remove('visible');
      this.lockscreenCard.notificationsBadge?.classList.remove('active');

      this.screen.classList.add('lockscreen-visible');
      this.motionElement.classList.add('visible');
      this.motionElement.classList.remove('transitioning');

      this.motionElement.style.setProperty('--motion-progress', 1);
      this.motionElement.style.setProperty('--overscroll-progress', 0);
      this.bottomPanel.style.setProperty('--motion-progress', 1);
      this.bottomPanel.style.setProperty('--overscroll-progress', 0);

      this.windowsContainer.classList.add('hidden');

      if ('OrchidJS' in window && 'IPC' in OrchidJS) {
        IPC.send('message', {
          type: 'lockscreen',
          action: 'lock'
        });
      }

      this.wallpaperMotion.isUnlocked = false;
    },

    handleCameraButton: function () {
      const appWindow = new AppWindow('http://camera.localhost:9920/manifest.webapp', {});
      if (!this.isPINLocked) {
        this.hide();
      } else {
        this.showPIN();
      }
    }
  };

  LockscreenMotion.init();

  exports.LockscreenMotion = LockscreenMotion;
})(window);
