!(function (exports) {
  'use strict';

  const Bootstrap = {
    screen: null,
    inactivityScreen: null,
    statusbar: null,
    frimwareScreen: null,

    isFrimware: false,

    settings: [
      'audio.volume.music',
      'ftu.enabled',
      'general.lang.code',
      'general.software_buttons.enabled',
      'video.brightness',
      'video.dark_mode.enabled',
      'video.reader_mode.enabled',
      'video.warm_colors.enabled'
    ],
    SETTINGS_AUDIO_VOLUME_MUSIC: 0,
    SETTINGS_FTU_ENABLED: 1,
    SETTINGS_GENERAL_LANG_CODE: 2,
    SETTINGS_GENERAL_SOFTWARE_BUTTONS: 3,
    SETTINGS_VIDEO_BRIGHTNESS: 4,
    SETTINGS_VIDEO_DARK_MODE: 5,
    SETTINGS_VIDEO_READER_MODE: 6,
    SETTINGS_VIDEO_WARM_COLORS: 7,

    init: function () {
      // Handle Orchid frimware UI loading
      this.frimwareScreen = document.getElementById('frimware');
      if (this.isFrimware) {
        this.frimwareScreen.classList.add('visible');
        // Load up charging battery UI if device is off and charging
        // This only works on natively supported OpenOrchid
        LazyLoader.load('js/frimware/charging_battery_icon.js');
        LazyLoader.load('js/frimware/charging_battery_canvas.js');
        return;
      }

      this.screen = document.getElementById('screen');
      this.inactivityScreen = document.getElementById('inactivity-screen');

      Settings.getValue(this.settings[this.SETTINGS_GENERAL_LANG_CODE]).then(this.handleLanguage.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS]).then(this.handleSoftwareButtons.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_BRIGHTNESS]).then(this.handleBrightness.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_WARM_COLORS]).then(this.handleWarmColors.bind(this));
      Settings.getValue(this.settings[this.SETTINGS_VIDEO_READER_MODE]).then(this.handleReaderMode.bind(this));

      Settings.addObserver(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC], this.handleMusicVolume.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_LANG_CODE], this.handleLanguageChange.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS], this.handleSoftwareButtons.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_BRIGHTNESS], this.handleBrightness.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_DARK_MODE], this.handleColorScheme.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_WARM_COLORS], this.handleWarmColors.bind(this));
      Settings.addObserver(this.settings[this.SETTINGS_VIDEO_READER_MODE], this.handleReaderMode.bind(this));

      document.addEventListener('visibilitychange', this.handleWindowBlur.bind(this));
      window.addEventListener('focus', this.handleWindowFocus.bind(this));

      // Load with AppsManager to ensure existing webapps.json and correct
      // load time that isnt too early and is low with loading overhead
      AppsManager.getAll().then(() => {
        if (window.deviceType === 'desktop') {
          this.statusbar = document.getElementById('software-buttons-statusbar');
        } else {
          this.statusbar = document.getElementById('statusbar');
        }

        LazyLoader.load('js/lockscreen/lockscreen.js');
        LazyLoader.load('js/lockscreen/motion.js');
        LazyLoader.load('js/lockscreen/clock.js');
        LazyLoader.load('js/lockscreen/date.js');
        LazyLoader.load('js/lockscreen/notifications.js');
        LazyLoader.load('js/lockscreen/pin_lock.js');
        // TODO: Implement a multi-user system
        // LazyLoader.load('js/lockscreen/login.js');

        // TODO: Implement working achievements
        // LazyLoader.load('js/achievements.js');

        LazyLoader.load([
          'js/statusbar.js',
          'js/statusbar_icon.js',
          'js/time_icon.js',
          'js/battery_icon.js',
          'js/cellular_data_icon.js',
          'js/audio_icon.js',
          'js/wifi_icon.js',
          'js/data_icon.js',
          'js/warm_colors_icon.js',
          'js/reader_mode_icon.js'
        ], () => {
          new Statusbar(this.statusbar);
        });

        LazyLoader.load('js/alarms_handler.js');
        LazyLoader.load('js/dock_icon.js', () => {
          LazyLoader.load('js/dock.js');
        });
        LazyLoader.load('js/keybinds.js');
        LazyLoader.load('js/message_handler.js');
        LazyLoader.load('js/music_controller.js', () => {
          Settings.getValue(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC]).then(this.handleMusicVolume.bind(this));
          Settings.getValue(this.settings[this.SETTINGS_FTU_ENABLED]).then(this.handleFirstLaunch.bind(this));

          MusicController.play('/resources/music/bg.mp3', true);
        });
        LazyLoader.load('js/platform_classifier.js');
        LazyLoader.load('js/rocketbar.js');
        LazyLoader.load('js/utility_tray.js', () => {
          LazyLoader.load('js/utility_tray_motion.js');
          LazyLoader.load('js/network_button.js');
        });
        LazyLoader.load('js/webapps.js');

        if (window.deviceType === 'desktop') {
          LazyLoader.load('js/app_switcher.js');
          LazyLoader.load('js/app_launcher.js');
          LazyLoader.load('js/icon.js', () => {
            LazyLoader.load('js/app_launcher_apps.js');
          });
          LazyLoader.load('js/dashboard.js');
        }

        // Enable more complex visuals when specifications are met
        if (navigator.hardwareConcurrency > 2) {
          if (navigator.deviceMemory >= 2) {
            this.screen.classList.add('gpu-capable');
          }
          if (navigator.hardwareConcurrency > 4) {
            if (navigator.deviceMemory > 4) {
              this.screen.classList.add('gpu-fully-capable');
            }
          }
        }

        // Hide splash screen when everything is loaded and done
        Splashscreen.hide();

        if (Environment.type === 'development') {
          LazyLoader.load('js/notification_toaster.js', () => {
            NotificationToaster.showNotification('Development Environment', {
              body: 'OrchidOS has detected a active development environment so we wish you a happy straightforward development :D',
              source: 'System',
              badge: '/style/icons/system_64.png',
              icon: 'http://shared.localhost:8081/icons/shared_64.png',
              actions: [
                {
                  label: 'Thanks',
                  recommend: true
                },
                {
                  label: 'Orchid Docs'
                }
              ]
            })
          });
        }
      });

      window.addEventListener('orchid-services-ready', this.onServicesLoad.bind(this));
    },

    handleMusicVolume: function (value) {
      MusicController.setVolume(value / 100, 1);
    },

    handleLanguage: function (value) {
      L10n.currentLanguage = value;
    },

    handleLanguageChange: function (value) {
      if (L10n.currentLanguage === value) {
        return;
      }

      LoadingScreen.show();
      LoadingScreen.element.textContent = L10n.get('changingLanguage');
      LoadingScreen.element.addEventListener('transitionend', () => {
        L10n.currentLanguage = value;
        LoadingScreen.element.textContent = L10n.get('changingLanguage');
        LoadingScreen.hide();
      });
    },

    handleBrightness: function (value) {
      DisplayManager.setBrightness(value);
    },

    handleColorScheme: function (value) {
      const targetTheme = value ? 'dark' : 'light';
      IPC.send('change-theme', targetTheme);
    },

    handleSoftwareButtons: function (value) {
      this.screen.classList.toggle('software-buttons-enabled', value);
    },

    handleWarmColors: function (value) {
      this.screen.classList.toggle('warm-colors', value);
    },

    handleReaderMode: function (value) {
      this.screen.classList.toggle('reader-mode', value);
    },

    handleWindowFocus: function () {
      this.screen.classList.remove('hidden');
      this.inactivityScreen.classList.remove('visible');
    },

    handleWindowBlur: function () {
      if (document.visibilityState === 'hidden') {
        this.screen.classList.add('hidden');
        this.inactivityScreen.classList.add('visible');
      }
    },

    handleFirstLaunch: function (value) {
      if (value) {
        LockscreenMotion.hideMotionElement();
        const appWindow = new AppWindow('http://ftu.localhost:8081/manifest.json', {});
      } else {
        LazyLoader.load('js/homescreen_launcher.js');
      }
    },

    onServicesLoad: function () {
      // Ensuring your device is fingerprinted into your Orchid account
      _os.devices.ensureDevice();

      // TODO: Make this send and recieve files
      // It won't be added to load until that TODO is done
      // LazyLoader.load('js/remote/p2p.js');
      LazyLoader.load('js/syncing_data.js');
      LazyLoader.load('js/notification_toaster.js', () => {
        NotificationToaster.showNotification('Orchid is ready to use!', {
          body: 'Orchid Services have loaded successfully.',
          source: 'System',
          badge: '/style/icons/system_64.png',
          icon: 'http://orchidservices.localhost:8081/style/icons/orchidsuite_64.png',
          actions: [
            {
              label: 'Okay',
              recommend: true
            },
            {
              label: 'Learn More'
            }
          ]
        })
      });
    }
  };

  window.addEventListener('load', () => Bootstrap.init());
})(window);
