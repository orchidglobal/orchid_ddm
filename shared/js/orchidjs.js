!(function (exports) {
  'use strict';

  class OrchidFramework {
    /**
     * The constructor of the OrchidFramework class.
     *
     * This constructor initializes the framework by setting up event
     * listeners for the load, focus, blur, and DOMContentLoaded events.
     */
    constructor() {
      /**
       * The root element of the Orchid app.
       * @type {HTMLElement}
       */
      this.appElement = null;

      this.init();
      this.update();
    }

    /**
     * Initializes the framework by setting up event listeners
     * for load, focus, blur, and DOMContentLoaded events.
     */
    init() {
      // Listen for the load event, which is dispatched when the
      // user agent finishes loading the document.
      window.addEventListener('load', this.initialize.bind(this));

      // Listen for the focus event, which is dispatched when the
      // user gives an element focus.
      window.addEventListener('focus', this.handleFocus.bind(this));

      // Listen for the blur event, which is dispatched when the
      // user removes focus from an element.
      window.addEventListener('blur', this.handleBlur.bind(this));

      // Listen for the DOMContentLoaded event, which is dispatched
      // when the initial HTML document has been completely
      // loaded and parsed, without waiting for stylesheets, images,
      // and subframes to finish loading.
      document.addEventListener('DOMContentLoaded', this.whenReady.bind(this));
    }

    /**
     * initialize
     *
     * initialize is called when the document has finished loading
     * and the user agent has finished loading all of the required
     * resources and scripts. At this point, the DOM is ready to be
     * manipulated.
     *
     * This method is intended to be overridden by subclasses to
     * perform any initialization that should be done after the
     * document has finished loading.
     *
     * By default, this method does nothing.
     */
    initialize() {
      // Intentionally left blank. Override this in a subclass to
      // perform any actions that should be done after the document
      // has finished loading.
    }

    handleFocus() {}

    handleBlur() {}

    /**
     * whenReady
     *
     * whenReady is called when the document has finished loading
     * and the user agent has finished loading all of the required
     * resources and scripts. At this point, the DOM is ready to be
     * manipulated.
     */
    whenReady() {
      // Intentionally left blank. Override this in a subclass to
      // perform any actions that should be done when the page has
      // finished loading.
    }

    render() {
      return null;
    }

    /**
     * update
     *
     * update is the main entry point for the application update loop.
     * It is called once per frame and calls the updateLoop method
     * for the current application state.
     */
    update() {
      requestAnimationFrame(this.update.bind(this));

      /**
       * Update the application state.
       *
       * This method is called once per frame and is responsible for
       * updating the current state of the application. It will be
       * called after the application has been initialized and
       * the document has finished loading.
       */
      this.updateLoop();
    }

    /**
     * updateLoop
     *
     * updateLoop is the main entry point for the application update
     * loop. It is called once per frame and is responsible for
     * updating the current state of the application. It will be
     * called after the application has been initialized and
     * the document has finished loading.
     *
     * This method is intended to be overridden by subclasses to
     * perform any actions that should be done on each frame update.
     *
     * By default, this method does nothing.
     */
    updateLoop() {
      // Intentionally left blank. Override this in a subclass to
      // perform any actions that should be done on each frame update.
    }
  }

  class OrchidPage {}

  const OrchidJS = {
    instance: null,

    userAgent: 'Mozilla/5.0 (OrchidOS2 1.0; Desktop; OrchidJS_API 1.0) OrchidChr/1.0 (KHTML, like Gecko)',
    userAgentData: {
      brands: [
        { brand: 'Orchid Chrome', version: '1' },
        { brand: 'Not:A-Brand', version: '8' }
      ],
      mobile: false,
      platform: 'Linux'
    },
    apiUserAgent: 'Orchid/1.0 (OrchidJS_API 1.0; BrowserCompatible) OrchidOS2/20230702',

    isBrowser: false,
    isSupported: false,
    deviceType: '',
    wallpaperUrl: '',
    sharedUrl: '',
    defaultThemeUrl: '',
    pages: {},

    settings: [
      'accessibility.text.bold',
      'accessibility.text.contrast',
      'accessibility.text.scaling',
      'general.lang.code',
      'general.software_buttons.enabled',
      'homescreen.accent_color.rgb',
      'video.red_light_point.enabled',
      'video.wallpaper.url'
    ],
    SETTINGS_ACCESSIBILITY_TEXT_BOLD: 0,
    SETTINGS_ACCESSIBILITY_TEXT_CONTRAST: 1,
    SETTINGS_ACCESSIBILITY_TEXT_SCALING: 2,
    SETTINGS_LANGUAGE: 3,
    SETTINGS_SOFTWARE_BUTTONS: 4,
    SETTINGS_ACCENT_COLOR: 5,
    SETTINGS_RED_LIGHT_POINT: 6,
    SETTINGS_WALLPAPER_IMAGE: 7,

    Framework: OrchidFramework,
    Page: OrchidPage,

    /**
     * Sets the OrchidJS instance.
     *
     * @param {Framework} instance The OrchidJS instance to set.
     */
    setInstance: async function (instance) {
      /**
       * The OrchidJS instance.
       * @type {Framework}
       */
      this.instance = instance;
    },

    /**
     * Initializes OrchidJS.
     * This method sets up all necessary event listeners and retrieves
     * initial values for all settings and observers for them.
     */
    init: function () {
      this.sharedUrl = '/shared';
      this.defaultThemeUrl = this.getOriginUrl('org.orchid.default_theme');

      this.SOUND_CLICK = new Audio(this.sharedUrl + '/resources/sounds/click.wav');

      this.prepareDeviceType();

      // Set up event listeners.
      window.addEventListener('load', this.handleLoad.bind(this));
      window.addEventListener('focus', this.handleFocus.bind(this));
      window.addEventListener('blur', this.handleBlur.bind(this));
      document.addEventListener('DOMContentLoaded', this.handleDOMContentLoaded.bind(this));
      document.addEventListener('click', this.handleClick.bind(this));

      window.addEventListener('maximized', this.handleMaximized.bind(this));
      window.addEventListener('unmaximized', this.handleUnmaximized.bind(this));
    },

    /**
     * Determines the type of device the code is currently running on.
     *
     * @returns {string} The type of the device. Possible values include:
     * - "mobile" if the device is a mobile phone or tablet
     * - "smart-tv" if the device is a Smart TV
     * - "vr" if the device is a virtual reality headset
     * - "home" if the device is a smart home Hub or Assistant
     * - "watch" if the device is a smartwatch
     * - "desktop" if the device is a desktop or laptop computer
     * - "browser mobile" if the device is a mobile browser
     * - "browser generic" if the device is a generic web browser
     */
    prepareDeviceType: function () {
      const userAgent = navigator.userAgent;

      if (userAgent.includes('OrchidChr/1.')) {
        this.isBrowser = false;
        if (/Mobile|Phone|Tablet/i.test(userAgent)) {
          this.deviceType = 'mobile';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; Mobile; OrchidJS_API 1.0) OrchidChr/1.0';
        } else if (/TV/i.test(userAgent)) {
          this.deviceType = 'smart-tv';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; TV; OrchidJS_API 1.0) OrchidChr/1.0';
        } else if (/Headset|VR/i.test(userAgent)) {
          this.deviceType = 'vr';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; VR; OrchidJS_API 1.0) OrchidChr/1.0';
        } else if (/Home|Hub|Assistant/i.test(userAgent)) {
          this.deviceType = 'home';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; Home; OrchidJS_API 1.0) OrchidChr/1.0';
        } else if (/Watch|Wear/i.test(userAgent)) {
          this.deviceType = 'watch';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; Watch; OrchidJS_API 1.0) OrchidChr/1.0';
        } else {
          this.deviceType = 'desktop';
        }
      } else {
        this.isBrowser = true;
        if (/Mobile|Phone|Tablet/i.test(userAgent)) {
          this.deviceType = 'browser mobile';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; Browser Mobile; OrchidJS_API 1.0) OrchidChr/1.0';
        } else {
          this.deviceType = 'browser generic';
          this.userAgent = 'Orchid/5.0 (OrchidOS2 1.0; Browser; OrchidJS_API 1.0) OrchidChr/1.0';
        }
      }

      if (/Chrome|OrchidChr|OrchidBrowser/i.test(userAgent)) {
        this.isSupported = true;
      } else {
        this.isSupported = false;
      }
    },

    /**
     * Handles all settings-related tasks.
     * If Settings permission is not enabled, it logs an error message and returns.
     * Otherwise, it retrieves current settings values for all settings and
     * sets up observers for them.
     * Additionally, it sets up an observer for the language setting and retrieves
     * the initial value for it.
     */
    handleSettings: function () {
      if ((!'OrchidJS') in window || (!'Settings') in OrchidJS) {
        console.error('Settings permission is not enabled.');
        return;
      }

      // Retrieve current values for all settings and set up initial handling.
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_BOLD]).then(
        this.handleAccessibilityBoldText.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_CONTRAST]).then(
        this.handleAccessibilityContrastText.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_SCALING]).then(
        this.handleAccessibilityTextScaling.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_WALLPAPER_IMAGE]).then(
        this.handleWallpaperAccent.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_ACCENT_COLOR]).then(this.handleAccentColor.bind(this));
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_SOFTWARE_BUTTONS]).then(
        this.handleSoftwareButtons.bind(this)
      );
      OrchidJS.Settings.getValue(this.settings[this.SETTINGS_RED_LIGHT_POINT]).then(
        this.handleRedLightPoint.bind(this)
      );

      // Set up observers for all settings.
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_BOLD],
        this.handleAccessibilityBoldText.bind(this)
      );
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_CONTRAST],
        this.handleAccessibilityContrastText.bind(this)
      );
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_ACCESSIBILITY_TEXT_SCALING],
        this.handleAccessibilityTextScaling.bind(this)
      );
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_WALLPAPER_IMAGE],
        this.handleWallpaperAccent.bind(this)
      );
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_ACCENT_COLOR], this.handleAccentColor.bind(this));
      OrchidJS.Settings.addObserver(
        this.settings[this.SETTINGS_SOFTWARE_BUTTONS],
        this.handleSoftwareButtons.bind(this)
      );
      OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_RED_LIGHT_POINT], this.handleRedLightPoint.bind(this));

      // Set up an observer for the language setting and retrieve the initial value.
      window.addEventListener('localized', () => {
        OrchidJS.Settings.getValue(this.settings[this.SETTINGS_LANGUAGE]).then(this.handleLanguage.bind(this));
        OrchidJS.Settings.addObserver(this.settings[this.SETTINGS_LANGUAGE], this.handleLanguage.bind(this));
      });
    },

    handleAccessibilityBoldText: function (value) {
      document.documentElement.classList.toggle('bold-text', value);
    },

    handleAccessibilityContrastText: function (value) {
      document.documentElement.classList.toggle('contrast-text', value);
    },

    handleAccessibilityTextScaling: function (value) {
      document.documentElement.style.setProperty('--text-scaling', value || 1);
    },

    getImageDominantColor: function (url, options = {}) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const colors = [];

        useCanvas(canvas, url)
          .then(() => {
            const downsamplingFactor = options.downsampling || 1;
            const imageData = canvas
              .getContext('2d')
              ?.getImageData(
                0,
                0,
                Math.floor(canvas.width / downsamplingFactor),
                Math.floor(canvas.height / downsamplingFactor)
              ).data;

            if (imageData) {
              for (let i = 0; i < imageData.length; i += 4) {
                const brightness = options.brightness || 1;
                const r = imageData[i] + Math.round((255 - imageData[i]) * (brightness - 1));
                const g = imageData[i + 1] + Math.round((255 - imageData[i + 1]) * (brightness - 1));
                const b = imageData[i + 2] + Math.round((255 - imageData[i + 2]) * (brightness - 1));

                colors.push({ r, g, b });
              }

              if (options.linearGradient !== undefined) {
                resolve('linear-gradient(' + options.linearGradient + ', ' + colors.join(', ') + ')');
              } else {
                resolve(colors);
              }
            }
          })
          .catch(reject);
      });

      function useCanvas(element, imageUrl) {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.src = imageUrl;

          image.onload = () => {
            element.width = options.colors || 1;
            element.height = options.colors || 1;

            element.getContext('2d')?.drawImage(image, 0, 0, options.colors || 1, options.colors || 1);

            resolve(null);
          };

          image.onerror = reject;
        });
      }
    },

    /**
     * Handles language changes by notifying the L10n instance.
     *
     * @param {string} value
     *   The language locale to use.
     */
    handleLanguage: function (value) {
      // Check if L10n is present in the window object
      if ('OrchidJS' in window && 'L10n' in OrchidJS) {
        // Access 'L10n' from the window object
        const l10nInstance = OrchidJS.L10n;

        // Use the 'getLocale' method if it exists
        if (l10nInstance && typeof l10nInstance.getLocale === 'function') {
          // Notify the L10n instance of the new language
          l10nInstance.getLocale(value);
        } else {
          // Log an error if the L10n instance is not properly defined
          console.error('L10n is not properly defined.');
        }
      } else {
        // Log an error if L10n is not present in the window object
        console.error('L10n is not present in the window object.');
      }
    },

    simulateColorBlindness: function (rgb, type) {
      // Validate input type
      if (typeof rgb !== 'object' || !rgb.hasOwnProperty('r') || !rgb.hasOwnProperty('g') || !rgb.hasOwnProperty('b')) {
        throw new Error('Invalid input format. Please provide an object with r, g, and b properties.');
      }

      // Extract RGB values
      const { r, g, b } = rgb;

      switch (type) {
        case 'protanopia':
          // Simulate red-green blindness (protanopia)
          return { r: r * 0.567, g, b };

        case 'deuteranopia':
          // Simulate red-green blindness (deuteranopia)
          return { r: r * 0.625, g, b };

        case 'tritanopia':
          // Simulate blue-yellow blindness (tritanopia)
          return { r, g: g * 0.7, b: b * 0.7 };

        case 'achromatopsia':
          // Simulate complete color blindness (achromatopsia)
          const lum = (r + g + b) / 3;
          return { r: lum, g: lum, b: lum };

        default:
          // Return original color if type is unknown
          return rgb;
      }
    },

    handleWallpaperAccent: function (value) {
      const scrollingElement = document.scrollingElement;
      this.wallpaperUrl = value;

      this.getImageDominantColor(value, { colors: 2, brightness: 1 }).then(async (color) => {
        const colorBlindnessMode = await OrchidJS.Settings.getValue('accessibility.colorblindness');
        const filteredPrimaryColor = this.simulateColorBlindness(color[0], colorBlindnessMode);
        const filteredSecondaryColor = this.simulateColorBlindness(color[1], colorBlindnessMode);

        // Convert the color to RGB values
        let r1 = filteredPrimaryColor.r;
        let g1 = filteredPrimaryColor.g;
        let b1 = filteredPrimaryColor.b;
        let r2 = filteredSecondaryColor.r;
        let g2 = filteredSecondaryColor.g;
        let b2 = filteredSecondaryColor.b;

        if (location.hostname === 'system.localhost') {
          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-r', r1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-g', g1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-b', b1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-r', r2.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-g', g2.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-b', b2.toString());
        }

        // Calculate relative luminance
        const luminance1 = (0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1) / 255;
        const luminance2 = (0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2) / 255;

        // Store original values
        const originalR1 = r1;
        const originalG1 = g1;
        const originalB1 = b1;
        const originalR2 = r2;
        const originalG2 = g2;
        const originalB2 = b2;

        if (luminance1 < 0.1 && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Brighten the color
          r1 = r1 * 2;
          g1 = g1 * 2;
          b1 = b1 * 2;

          // Ensure color values are within the valid range (0 - 255)
          r1 = Math.max(0, Math.min(255, r1));
          g1 = Math.max(0, Math.min(255, g1));
          b1 = Math.max(0, Math.min(255, b1));
        }

        // Check if the resulting color is too bright, and if so, darken it
        if (luminance1 > 0.8 && window.matchMedia('(prefers-color-scheme: light)').matches) {
          const maxColorValue = Math.max(r1, g1, b1);
          if (maxColorValue > 200) {
            r1 = Math.round(originalR1 * 0.8);
            g1 = Math.round(originalG1 * 0.8);
            b1 = Math.round(originalB1 * 0.8);
          }
        }

        if (luminance2 < 0.1 && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          // Brighten the color
          r2 = r2 * 2;
          g2 = g2 * 2;
          b2 = b2 * 2;

          // Ensure color values are within the valid range (0 - 255)
          r2 = Math.max(0, Math.min(255, r2));
          g2 = Math.max(0, Math.min(255, g2));
          b2 = Math.max(0, Math.min(255, b2));
        }

        // Check if the resulting color is too bright, and if so, darken it
        if (luminance2 > 0.8 && window.matchMedia('(prefers-color-scheme: light)').matches) {
          const maxColorValue = Math.max(r2, g2, b2);
          if (maxColorValue > 200) {
            r2 = Math.round(originalR2 * 0.8);
            g2 = Math.round(originalG2 * 0.8);
            b2 = Math.round(originalB2 * 0.8);
          }
        }

        if (!(await OrchidJS.Settings.getValue(this.settings[this.SETTINGS_ACCENT_COLOR]))) {
          scrollingElement?.style.setProperty('--accent-color-primary-r', r1.toString());
          scrollingElement?.style.setProperty('--accent-color-primary-g', g1.toString());
          scrollingElement?.style.setProperty('--accent-color-primary-b', b1.toString());
          scrollingElement?.style.setProperty('--accent-color-secondary-r', r2.toString());
          scrollingElement?.style.setProperty('--accent-color-secondary-g', g2.toString());
          scrollingElement?.style.setProperty('--accent-color-secondary-b', b2.toString());

          OrchidJS.Settings.setValue(this.settings[this.SETTINGS_ACCENT_COLOR], {
            primary: { r: r1, g: g1, b: b1 },
            secondary: { r: r2, g: g2, b: b2 }
          });
        }

        // Calculate relative luminance
        const accentLuminance1 = (0.2126 * originalR1 + 0.7152 * originalG1 + 0.0722 * originalB1) / 255;

        if (accentLuminance1 > 0.5) {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        }
      });
    },

    handleAccentColor: async function (value) {
      if (!value) {
        return;
      }
      const scrollingElement = document.scrollingElement;

      if (this.wallpaperUrl && location.hostname === 'system.localhost') {
        this.getImageDominantColor(this.wallpaperUrl, { colors: 2, brightness: 1 }).then(async (color) => {
          const colorBlindnessMode = await OrchidJS.Settings.getValue('accessibility.colorblindness');
          const filteredPrimaryColor = this.simulateColorBlindness(color[0], colorBlindnessMode);
          const filteredSecondaryColor = this.simulateColorBlindness(color[1], colorBlindnessMode);

          let r1 = filteredPrimaryColor.r;
          let g1 = filteredPrimaryColor.g;
          let b1 = filteredPrimaryColor.b;
          let r2 = filteredSecondaryColor.r;
          let g2 = filteredSecondaryColor.g;
          let b2 = filteredSecondaryColor.b;

          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-r', r1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-g', g1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-primary-b', b1.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-r', r2.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-g', g2.toString());
          scrollingElement?.style.setProperty('--lockscreen-accent-color-secondary-b', b2.toString());
        });
      }

      const colorBlindnessMode = await OrchidJS.Settings.getValue('accessibility.colorblindness');
      const primaryColor = this.simulateColorBlindness(value.primary, colorBlindnessMode);
      const secondaryColor = this.simulateColorBlindness(value.secondary, colorBlindnessMode);

      scrollingElement?.style.setProperty('--accent-color-primary-r', primaryColor.r.toString());
      scrollingElement?.style.setProperty('--accent-color-primary-g', primaryColor.g.toString());
      scrollingElement?.style.setProperty('--accent-color-primary-b', primaryColor.b.toString());
      scrollingElement?.style.setProperty('--accent-color-secondary-r', secondaryColor.r.toString());
      scrollingElement?.style.setProperty('--accent-color-secondary-g', secondaryColor.g.toString());
      scrollingElement?.style.setProperty('--accent-color-secondary-b', secondaryColor.b.toString());

      // Convert the color to RGB values
      const r = primaryColor.r;
      const g = primaryColor.g;
      const b = primaryColor.b;

      // Calculate relative luminance
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      if (luminance > 0.5) {
        scrollingElement?.style.setProperty('--accent-text-color', 'rgba(0,0,0,0.75)');
        scrollingElement?.style.setProperty('--accent-color-plus', 'rgba(0,0,0,0.1)');
        scrollingElement?.style.setProperty('--accent-color-hover', 'rgba(0,0,0,0.1)');
        scrollingElement?.style.setProperty('--accent-color-active', 'rgba(0,0,0,0.2)');
      } else {
        scrollingElement?.style.setProperty('--accent-text-color', 'rgba(255,255,255,0.75)');
        scrollingElement?.style.setProperty('--accent-color-plus', 'rgba(255,255,255,0.1)');
        scrollingElement?.style.setProperty('--accent-color-hover', 'rgba(255,255,255,0.1)');
        scrollingElement?.style.setProperty('--accent-color-active', 'rgba(255,255,255,0.2)');
      }
    },

    handleSoftwareButtons: function (value) {
      if (location.protocol === 'orchid:') {
        return;
      }

      if (this.deviceType === 'desktop') {
        document.documentElement.style.setProperty('--statusbar-height', '3.6rem');
      } else {
        document.documentElement.style.setProperty('--statusbar-height', '4rem');
      }

      if (value) {
        document.documentElement.style.setProperty('--software-buttons-height', '4rem');
      } else {
        if (location.origin.includes(`homescreen.localhost:${location.port}`)) {
          document.documentElement.style.setProperty('--software-buttons-height', '1rem');
        } else {
          document.documentElement.style.setProperty('--software-buttons-height', '2.5rem');
        }
      }
    },

    handleRedLightPoint: function (value) {
      document.documentElement.classList.toggle('red-light', value);
    },

    /**
     * Handle page load event.
     *
     * @description
     * Adds the `deviceType` and `dpi` class to the root HTML element.
     */
    handleLoad: function () {
      if ('OrchidJS' in window && 'L10n' in OrchidJS) {
        OrchidJS.L10n.init();
      }

      const deviceTypes = this.deviceType.split(' ');
      for (let index = 0, length = deviceTypes.length; index < length; index++) {
        const deviceType = deviceTypes[index];
        document.documentElement.classList.add(deviceType);
      }

      /**
       * The `dpi` class is appended to the root element with the
       * calculated devicePixelRatio multiplied by 100.
       *
       * @example
       * <html class="dpi-150"> <!-- if devicePixelRatio is 1.5 -->
       */
      document.documentElement.classList.add(`dpi-${parseInt(window.devicePixelRatio * 100) / 100}`);

      if ('Environment' in window && Environment.type) {
        document.documentElement.classList.add(Environment.type);
      }

      const platform = navigator.platform.toLowerCase();
      if (platform.indexOf('win') !== -1) {
        document.documentElement.classList.add('windows-app');
      } else if (platform.indexOf('mac') !== -1) {
        document.documentElement.classList.add('osx-app');
      } else if (platform.indexOf('linux') !== -1) {
        document.documentElement.classList.add('linux-app');
      } else {
        document.documentElement.classList.add('webapp');
      }
    },

    /**
     * Handle focus event.
     *
     * @description
     * Adds the `active` class to the root HTML element when
     * the application window receives focus.
     */
    handleFocus: function () {
      document.documentElement.classList.add('active');
    },

    /**
     * Handle blur event.
     *
     * @description
     * Removes the `active` class from the root HTML element when
     * the application window loses focus.
     */
    handleBlur: function () {
      document.documentElement.classList.remove('active');
    },

    /**
     * Handles the DOMContentLoaded event.
     *
     * @listens DOMContentLoaded
     */
    handleDOMContentLoaded: function () {
      // Initialize the theme.
      // this.traverseHTML(document.documentElement);
      this.initializeTheme();

      // Prepare WebAssembly
      // var module = new WebAssembly.Module(buffer);
      // var instance = new WebAssembly.Instance(module, { js: { js: () => {} } }, {});

      // Mark the documentElement as active.
      document.documentElement.classList.add('active');

      // Enable features.
      this.enableFeature('uuid', null);
      this.enableFeature('effects/active_tilt', null);
      this.enableFeature('spatial_navigation', this.handleSpatialNavigation.bind(this));
      this.enableFeature('intl/l10n', null);
      this.enableFeature('common/force_touch', null);
      this.enableFeature('common/gesture', null);
      this.enableFeature('page_controller', this.handlePageController.bind(this));
      this.enableFeature('utils/transitions', null);
      // Enable Vividus 2D Engine for games and complex UI visuals.
      this.enableFeature('external/gl-matrix-min', () => {
        this.enableFeature('external/litegl', () => {
          this.enableFeature('external/Canvas2DtoWebGL', null);
          this.enableFeature('vividus2d/vividus2d', null);
          this.enableFeature('vividus2d/sprite', null);
          this.enableFeature('vividus2d/keyframes', null);
        });
      });
      // TODO: If Orchid Studio IDE is made. Enable its development libraries if bundled.
      // this.enableFeature('developer/create', null);
      // this.enableFeature('developer/consolejs', null);

      // Register custom elements.
      this.registerElement('app-panel');
      this.registerElement('app-header');
      this.registerElement('app-header-toolbar');
      this.registerElement('app-content');
      this.registerElement('orchid-ad');
      this.registerElement('orchid-buttons');
      this.registerElement('orchid-account-button');
      this.registerElement('orchid-account-dropdown');
      this.registerElement('orchid-account-banner');
      this.registerElement('orchid-cast-button');
      this.registerElement('orchid-snack-bar');
      this.registerElement('orchid-tab');
      this.registerElement('orchid-tabs');
      this.registerElement('orchid-video');

      // Enable APIs
      this.enableAPI('orchid/settings', this.handleSettings.bind(this));
      this.enableAPI('orchid/webapps', null);
      this.enableAPI('orchid/storage', null);
    },

    traverseHTML: function (node) {
      this.replaceTextInAttributes(node);
      for (let i = 0; i < node.children.length; i++) {
        this.traverseHTML(node.children[i]);
      }
    },

    replaceTextInAttributes: function (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < node.attributes.length; i++) {
          let attr = node.attributes[i];
          if (attr.value.includes('/shared/')) {
            attr.value = attr.value.replace(/\/\$shared\//g, this.sharedUrl);
          }
        }
      }
    },

    /**
     * Load the theme.
     *
     * This method loads the theme CSS file based on the current
     * settings. If the `theme.manifest_url` preference is set, it will
     * load the stylesheet from that URL. Otherwise, it will load the
     * default theme.
     */
    initializeTheme: async function () {
      if ((!'OrchidJS') in window || (!'Settings') in OrchidJS) {
        console.error('Settings permission is not enabled.');
        return;
      }
      const isLocal = location.origin.includes('localhost:9920');

      if ('OrchidJS' in window && 'L10n' in OrchidJS) {
        // Try to load the theme from the settings.
        const manifestUrl = await OrchidJS.Settings.getValue('theme.manifest_url');
        if (manifestUrl) {
          // Load the theme from the manifest URL.
          this.loadStylesheet(manifestUrl);
        } else {
          // Load the default theme.
          if (isLocal) {
            this.loadStylesheet(`${this.defaultThemeUrl}/style/index.css`);
          } else {
            this.loadStylesheet('/orchidjs/default_theme/style/index.css');
          }
        }
      } else {
        // Load the default theme if settings are not available.
        if (isLocal) {
          this.loadStylesheet(`${this.defaultThemeUrl}/style/index.css`);
        } else {
          this.loadStylesheet('/orchidjs/default_theme/style/index.css');
        }
      }
    },

    /**
     * Load a style file.
     *
     * This function loads a CSS stylesheet from the shared/style directory.
     *
     * @param {String} style
     *        The name of the style file to load without the .css extension.
     */
    loadStyle: function (style) {
      LazyLoader.load(`${this.sharedUrl}/style/${style}.css`);
    },

    /**
     * Load a stylesheet.
     *
     * This function loads a CSS stylesheet from a given URL.
     *
     * @param {String} stylesheet
     *        The URL of the stylesheet to load.
     */
    loadStylesheet: function (stylesheet) {
      LazyLoader.load(stylesheet);
    },

    /**
     * Enable a specific feature.
     *
     * This function loads the necessary script to enable a specific feature.
     *
     * @param {String} feature
     *        The name of the feature to enable.
     * @param {Function} callback
     *        The callback function to be executed once the feature is loaded.
     */
    enableFeature: function (feature, callback) {
      const isLocal = location.origin.includes('localhost:9920');

      if (isLocal) {
        LazyLoader.load(`${this.sharedUrl}/js/${feature}.js`, callback);
      } else {
        LazyLoader.load(`/orchidjs/shared/js/${feature}.js`, callback);
      }
    },

    /**
     * Register a custom element.
     *
     * This function loads the necessary script and stylesheet to enable a
     * custom element.
     *
     * @param {String} tag
     *        The name of the element to register.
     * @param {Function} callback
     *        The callback function to be executed once the element is loaded.
     */
    registerElement: function (tag, callback) {
      const isLocal = location.origin.includes('localhost:9920');

      if (isLocal) {
        LazyLoader.load(`${this.sharedUrl}/elements/${tag}/${tag}.js`, callback);
        // Load the stylesheet for the custom element
        LazyLoader.load(`${this.sharedUrl}/elements/${tag}/${tag}.css`);
      } else {
        // Load the script for the custom element
        LazyLoader.load(`/orchidjs/shared/elements/${tag}/${tag}.js`, callback);
        // Load the stylesheet for the custom element
        LazyLoader.load(`/orchidjs/shared/elements/${tag}/${tag}.css`);
      }
    },

    registerComponent: function (tag, callback) {
      LazyLoader.load(`/components/${tag}/${tag}.js`, callback);
    },

    /**
     * Enable a specific API.
     *
     * This function loads the necessary script to enable a specific API.
     *
     * @param {String} name
     *        The name of the API to enable.
     */
    enableAPI: function (name, callback) {
      const isLocal = location.origin.includes('localhost:9920');
      if (isLocal) {
        LazyLoader.load(`${this.sharedUrl}/js/api/${name}.js`, callback);
      } else {
        LazyLoader.load(`/orchidjs/shared/js/api/${name}.js`, callback);
      }
    },

    handleClick: function (event) {
      const targetElement = event.target;

      if (!targetElement) {
        return;
      }
      const targetTag = targetElement.nodeName;

      switch (targetTag) {
        case 'INPUT':
          if (!this.SOUND_CLICK) {
            return;
          }
          if (targetElement.type !== 'checkbox') {
            return;
          }
          this.SOUND_CLICK.currentTime = 0;
          this.SOUND_CLICK.volume = 0.1;
          this.SOUND_CLICK.play();

          navigator.vibrate(50);
          break;
      }
    },

    /**
     * Enable spatial navigation.
     *
     * This function initializes the SpatialNavigation module and adds the
     * necessary selectors to the list of focusable elements.
     */
    handleSpatialNavigation: function () {
      SpatialNavigation.init();
      /**
       * Add selectors for elements that should be focusable with spatial
       * navigation.
       *
       * The selectors are a union of the tablist and the contents of the
       * currently visible panel.
       */
      SpatialNavigation.add({
        selector:
          '.tablist a, ' +
          '.tablist button, ' +
          '.tablist .lists ul li, ' +
          '.visible a, ' +
          '.visible button, ' +
          '.visible .lists ul li, ' +
          '.visible .lists ul li input'
      });
      /**
       * Make all focusable elements in the document focusable with spatial
       * navigation.
       */
      SpatialNavigation.makeFocusable();
      // Focus the first focusable element in the document.
      SpatialNavigation.focus();
    },

    /**
     * Handle page controller.
     *
     * This function initializes the PageController module.
     */
    handlePageController: function () {
      /**
       * Initialize the PageController module.
       *
       * This function sets up the necessary event listeners to handle
       * page navigation and updates the URL hash when a new page is
       * displayed.
       */
      OrchidJS.PageController.init();
    },

    handleMaximized: function () {
      document.documentElement.classList.add('maximized');
    },

    handleUnmaximized: function () {
      document.documentElement.classList.remove('maximized');
    },

    /**
     * Get the origin URL of an app.
     *
     * This function returns the origin URL of an app based on its ID.
     *
     * @param {String} appId
     *        The ID of the app.
     *
     * @returns {String}
     *          The origin URL of the app.
     */
    getOriginUrl: function (appId) {
      return `http://${appId.replaceAll('.', '__')}.localhost:9920`;
    },

    getManifestUrl: function (appId) {
      return `http://${appId.replaceAll('.', '__')}.localhost:9920/manifest.webapp`;
    },

    /**
     * Show a notification.
     *
     * This function sends a message to the Orchid notification
     * service to show a notification. The notification is sent with the
     * given title and options. The notification is also associated with
     * the current page.
     *
     * @param {String} title
     *        The title of the notification.
     *
     * @param {Object} [options]
     *        The options object passed to the notification.
     */
    notify: function (title, options = {}) {
      if (!('IPC' in window)) {
        throw new Error('IPC permission is not enabled.');
      }

      IPC.send('message', {
        type: 'notification', // The message type.
        action: 'show', // The action to perform.
        name: title, // The title of the notification.
        options: options, // The options passed to the notification.
        href: location.href, // The URL of the page associated with the notification.
        origin: location.origin, // The origin of the page associated with the notification.
        title: document.title // The title of the page associated with the notification.
      });
    },

    /**
     * Request a file from the user.
     *
     * This function sends a message to the Orchid file picker service to
     * request a file. The file picker is launched with the given MIME type
     * filter. The selected file is returned in a message from the file
     * picker service.
     *
     * @param {String} mimeType
     *        The MIME type filter for the file picker.
     */
    requestFile: function (mimeType) {
      if (!('IPC' in window)) {
        throw new Error('IPC permission is not enabled.');
      }

      IPC.send('launch', {
        /**
         * The URL of the manifest file for the file picker activity.
         * @type {String}
         */
        manifestUrl: `${this.getOriginUrl('files')}/manifest.json`,
        /**
         * The activity to launch.
         * @type {String}
         */
        activity: 'request-file',
        /**
         * The MIME type filter for the file picker.
         * @type {Object}
         */
        filters: {
          /**
           * The MIME type filter.
           * @type {String}
           */
          mime: mimeType
        }
      });
    },

    convertBytes: function (byteSize, targetUnit = 'auto') {
      const units = [
        { name: 'byte', value: 1 },
        { name: 'kb', value: 1024 },
        { name: 'mb', value: 1024 ** 2 },
        { name: 'gb', value: 1024 ** 3 },
        { name: 'tb', value: 1024 ** 4 },
        { name: 'pb', value: 1024 ** 5 },
        { name: 'eb', value: 1024 ** 6 },
        { name: 'zb', value: 1024 ** 7 }
      ];

      const findUnit = (unit) => units.find((u) => u.name.toUpperCase() === unit.toUpperCase());

      const autoConvert = () => {
        for (const unit of units) {
          if (byteSize < unit.value) {
            return [Math.round((byteSize / unit.value) * 100) / 100, unit.name];
          }
        }
      };

      if (targetUnit.toLowerCase() === 'auto') return autoConvert();

      const unit = findUnit(targetUnit);
      if (unit) {
        const { name, value } = unit;
        return [Math.round((byteSize / value) * 100) / 100, name];
      }

      return [Math.round(byteSize * 100) / 100, 'b']; // default to bytes if unit not recognized
    },

    /**
     * Create and display a snackbar alert bubble with the given message.
     *
     * The alert bubble will be displayed at the bottom of the screen for
     * 3 seconds (3000 milliseconds) and will be hidden with a CSS
     * transition.
     *
     * @param {String} message - The message to display in the alert bubble.
     */
    snackbarAlert: function (message) {
      // Create the alert bubble element
      var snackbar = new HTMLOrchidSnackbarElement();
      snackbar.innerText = message;

      // Append the alert bubble to the document body
      document.body.appendChild(snackbar);

      // Trigger reflow to enable CSS transition
      snackbar.offsetHeight;

      // Display the alert bubble with animation
      snackbar.classList.add('visible');

      // Set a timeout to hide the alert bubble after 3 seconds (3000 milliseconds)
      setTimeout(function () {
        // Hide the alert bubble with animation
        snackbar.classList.remove('visible');
        // Remove the alert bubble element from the DOM after hiding
        setTimeout(function () {
          document.body.removeChild(snackbar);
        }, 500); // Delay removal to match the transition duration
      }, 3500);
    }
  };

  // Orchid Policy: Never support a platform that promotes harrassment, even if you could.
  if (/KAIOS/i.test(navigator.userAgent)) {
    console.log('%cUnsupported platform', 'font-size:20px');
    console.log('%cVisit https://orchid.thats-the.name/support/platforms to learn more', 'font-size:14px');
  } else {
    OrchidJS.init();
  }

  exports.OrchidJS = OrchidJS;
})(window);
