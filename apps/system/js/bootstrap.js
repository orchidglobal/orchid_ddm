!(function (exports) {
  'use strict';

  const Bootstrap = {
    screen: null,
    inactivityScreen: null,
    statusbar: null,

    settings: [
      'audio.volume.music',
      'battery.percentage.visibility',
      'ftu.enabled',
      'general.lang.code',
      'general.software_buttons.enabled',
      'video.brightness',
      'video.dark_mode.enabled',
      'video.reader_mode.enabled',
      'video.warm_colors.enabled'
    ],
    SETTINGS_AUDIO_VOLUME_MUSIC: 0,
    SETTINGS_BATTERY_PERCENTAGE_VISIBILITY: 1,
    SETTINGS_FTU_ENABLED: 2,
    SETTINGS_GENERAL_LANG_CODE: 3,
    SETTINGS_GENERAL_SOFTWARE_BUTTONS: 4,
    SETTINGS_VIDEO_BRIGHTNESS: 5,
    SETTINGS_VIDEO_DARK_MODE: 6,
    SETTINGS_VIDEO_READER_MODE: 7,
    SETTINGS_VIDEO_WARM_COLORS: 8,

    /**
     * Initializes various settings and event listeners for the application.
     */
    init: function () {
      this.screen = document.getElementById('screen');
      this.inactivityScreen = document.getElementById('inactivity-screen');

      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_BATTERY_PERCENTAGE_VISIBILITY]).then(this.handleBatteryPercentageVisibility.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_GENERAL_LANG_CODE]).then(this.handleLanguage.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS]).then(
        this.handleSoftwareButtons.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_VIDEO_BRIGHTNESS]).then(this.handleBrightness.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_VIDEO_WARM_COLORS]).then(this.handleWarmColors.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_VIDEO_READER_MODE]).then(this.handleReaderMode.bind(this));

      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC], this.handleMusicVolume.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_BATTERY_PERCENTAGE_VISIBILITY], this.handleBatteryPercentageVisibility.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_GENERAL_LANG_CODE], this.handleLanguageChange.bind(this));
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_GENERAL_SOFTWARE_BUTTONS],
        this.handleSoftwareButtons.bind(this)
      );
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_VIDEO_BRIGHTNESS], this.handleBrightness.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_VIDEO_DARK_MODE], this.handleColorScheme.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_VIDEO_WARM_COLORS], this.handleWarmColors.bind(this));
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_VIDEO_READER_MODE], this.handleReaderMode.bind(this));

      document.addEventListener('visibilitychange', this.handleWindowBlur.bind(this));
      window.addEventListener('focus', this.handleWindowFocus.bind(this));

      LazyLoader.load('js/simulator.js');
      LazyLoader.load('js/music_controller.js', () => {
        MusicController.play('/resources/music/theme_music.wav', false);
        OrchidJS.Settings.getValue(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC]).then(this.handleMusicVolume.bind(this));
        OrchidJS.Settings.getValue(this.settings[this.SETTINGS_FTU_ENABLED]).then(this.handleFirstLaunch.bind(this));
        MusicController.audio.onended = () => {
          MusicController.play('/resources/music/theme_music_loop.wav', true);
          OrchidJS.Settings.getValue(this.settings[this.SETTINGS_AUDIO_VOLUME_MUSIC]).then(this.handleMusicVolume.bind(this));
        }
      });

      // Load with AppsManager to ensure existing webapps.json and correct
      // load time that isnt too early and is low with loading overhead
      OrchidJS.AppsManager.getAllApps().then(() => {
        if (window.deviceType === 'desktop') {
          this.statusbar = document.getElementById('software-buttons-statusbar');
        } else {
          this.statusbar = document.getElementById('statusbar');
          this.statusbar.classList.add('statusbar');
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

        LazyLoader.load('js/statusbar_icon.js', () => {
          LazyLoader.load(
            [
              'js/statusbar_icon.js',
              'js/time_icon.js',
              'js/battery_icon.js',
              'js/cellular_data_icon.js',
              'js/audio_icon.js',
              'js/wifi_icon.js',
              'js/data_icon.js',
              'js/warm_colors_icon.js',
              'js/reader_mode_icon.js'
            ],
            () => {
              LazyLoader.load('js/statusbar.js', () => {
                new Statusbar(this.statusbar);
              });
            }
          );
        });

        LazyLoader.load('js/alarms_handler.js');
        LazyLoader.load('js/dock_icon.js', () => {
          LazyLoader.load('js/dock.js');
        });
        LazyLoader.load('js/dynamic_area.js');
        LazyLoader.load('js/keybinds.js');
        LazyLoader.load('js/message_handler.js');
        LazyLoader.load('js/platform_classifier.js');
        LazyLoader.load('js/rocketbar.js');
        LazyLoader.load('js/utility_tray.js', () => {
          LazyLoader.load('js/utility_tray_motion.js');
          LazyLoader.load('js/network_button.js');
        });
        LazyLoader.load('js/utility_tray/clock.js');
        LazyLoader.load('js/utility_tray/date.js');
        LazyLoader.load('js/wallpaper_manager.js');
        LazyLoader.load('js/webapps.js');

        if (window.deviceType === 'desktop') {
          LazyLoader.load('js/app_switcher.js');
          LazyLoader.load('js/app_launcher.js');
          LazyLoader.load('js/icon.js', () => {
            LazyLoader.load('js/app_launcher_pagination_dots.js', () => {
              LazyLoader.load('js/app_launcher_apps.js');
            });
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
            OrchidJS.notify('Development Environment', {
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
            });
          });
        }
      });

      window.addEventListener('orchid-services-ready', this.onServicesLoad.bind(this));
    },

    /**
     * Set the music volume based on the value passed by OrchidJS.Settings.
     *
     * @param {number} value
     * Volume level as an integer in the range of 0-100.
     */
    handleMusicVolume: function (value) {
      // Set the volume of the music player to the passed value
      // from the Settings API as a percentage of maximum volume.
      MusicController.setVolume(value / 100, 1); // max = 1
    },

    /**
     * Toggle the visibility of the battery percentage based on the value
     * passed by OrchidJS.Settings.
     *
     * @param {boolean} value
     * True if the battery percentage should be visible, false otherwise.
     */
    handleBatteryPercentageVisibility: function (value) {
      this.screen.classList.toggle('battery-percentage-visible', value);
    },

    /**
     * Handle language change event from OrchidJS.Settings.
     *
     * @param {string} value
     * Language code as a string. See
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
     */
    handleLanguage: function (value) {
      OrchidJS.L10n.currentLanguage = value;
    },

    /**
     * Handle language change event from OrchidJS.Settings.
     *
     * @param {string} value
     * Language code as a string. See
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#Locale_identification_and_negotiation
     */
    handleLanguageChange: function (value) {
      if (OrchidJS.L10n.currentLanguage === value) {
        return;
      }

      LoadingScreen.show();
      // Show loading message
      LoadingScreen.element.textContent = OrchidJS.L10n.get('changingLanguage');
      // Listen for the end of the loading animation
      LoadingScreen.element.addEventListener('transitionend', () => {
        // Set the new language
        OrchidJS.L10n.currentLanguage = value;
        // Show another loading message
        LoadingScreen.element.textContent = OrchidJS.L10n.get('changingLanguage');
        // Hide the loading screen
        LoadingScreen.hide();
      });
    },

    /**
     * Handle brightness change event from OrchidJS.Settings.
     *
     * @param {number} value
     * Brightness value between 0 and 1 as a float number.
     */
    handleBrightness: function (value) {
      DisplayManager.setBrightness(value);
    },

    /**
     * Handle color scheme change event from OrchidJS.Settings.
     *
     * @param {boolean} value
     * If true, apply 'dark' theme. If false, apply 'light' theme.
     */
    handleColorScheme: function (value) {
      const targetTheme = value ? 'dark' : 'light';
      IPC.send('change-theme', targetTheme); // Notify the main process to change the theme. See: src/main.js
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
        const appWindow = new AppWindow('http://ftu.localhost:8081/manifest.webapp', {});
      } else {
        LazyLoader.load('js/homescreen_launcher.js');
      }
    },

    /**
     * Callback function for when Orchid Services have fully loaded.
     *
     * Shows a notification to the user indicating that the system is
     * ready to use.
     */
    onServicesLoad: function () {
      _os.devices.ensureDevice(); // Ensure device is created
      LazyLoader.load(['js/syncing_data.js', 'js/notification_toaster.js'], function () {
        OrchidJS.notify(
          'Orchid is ready to use!', // Notification title
          {
            // Notification options
            body: 'Orchid Services have loaded successfully.', // Notification body
            source: 'System', // Source of the notification
            icon: '/style/icons/orchidsuite_64.png', // Icon to display
            actions: [
              // Actions to display as buttons
              { label: 'Okay', recommend: true }, // Recommended action
              { label: 'Learn More' } // Secondary action
            ]
          }
        );
      });
    }
  };

  window.addEventListener('load', () => Bootstrap.init());
})(window);
