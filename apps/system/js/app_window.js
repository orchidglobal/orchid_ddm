!(function (exports) {
  'use strict';

  let _id = 0;
  let focusedWindow;

  function AppWindow (manifestUrl, configuration) {
    if (manifestUrl) {
      this.manifestUrl = manifestUrl;
      this.create(manifestUrl, configuration);
    }
  }

  AppWindow.prototype = {
    _id: 0,

    screen: document.getElementById('screen'),
    wallpapersContainer: document.getElementById('wallpapers'),
    containerElement: document.getElementById('windows'),
    snapOverlay: document.getElementById('window-snap'),
    statusbar: document.getElementById('statusbar'),
    softwareButtons: document.getElementById('software-buttons'),
    keyboard: document.getElementById('keyboard'),
    softwareBackButton: document.getElementById('software-back-button'),
    softwareHomeButton: document.getElementById('software-home-button'),
    bottomPanel: document.getElementById('bottom-panel'),
    dock: document.getElementById('dock'),

    HIDDEN_ROLES: ['homescreen', 'keyboard', 'system', 'theme', 'addon'],
    OPEN_ANIMATION: 'expand',
    CLOSE_ANIMATION: 'shrink',
    CLOSE_TO_HOMESCREEN_ANIMATION: 'shrink-to-homescreen',
    MINIMIZE_ANIMATION: 'shrink-to-dock',
    DOCK_ICON_SIZE: 40,
    SPLASH_ICON_SIZE: 60,
    UNDRAGGABLE_ELEMENTS: ['A', 'BUTTON', 'INPUT', 'LI', 'WEBVIEW'],

    element: null,
    dockIcon: null,
    chrome: null,
    manifest: null,
    instanceID: null,
    timeoutID: null,
    isDragging: false,
    isResizing: false,
    resizingWindow: null,
    resizingGripper: null,
    startX: null,
    startY: null,
    startWidth: null,
    startHeight: null,
    offsetX: null,
    offsetY: null,
    startOffsetX: null,
    startOffsetY: null,

    getFocusedWindow: function () {
      return focusedWindow;
    },

    /**
     * Creates the app window with specified manifest URL and configuration
     *
     * Example:
     * ```js
     * const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
     * ```
     * @param {String} manifestUrl
     * @param {Object} options
     * @returns null
     */
    create: async function (manifestUrl, options = {}) {
      // Check if a window with the same manifest URL already exists
      const existingUrl = new URL(manifestUrl);
      const existingWindow = this.containerElement.querySelector(`[data-manifest-url^="${existingUrl.origin}"]`);
      if (existingWindow) {
        if (options.animationVariables) {
          // Update transform origin if animation variables are provided
          this.updateTransformOrigin(existingWindow, options.animationVariables);
        }
        // Unminimize the existing window and return
        Webapps.getWindowById(existingWindow.id).unminimize();
        return;
      }

      this.manifest = await this.fetchManifest(manifestUrl);
      if (options.entryId) {
        this.manifest = this.manifest.entry_points[options.entryId];
      }

      if (this.manifest && this.manifest.role === 'vividus_game') {
        LazyLoader.load('js/notification_toaster.js', () => {
          NotificationToaster.showNotification(L10n.get('vividusEngine'), {
            body: L10n.get('vividusGameDetected'),
            source: L10n.get('title'),
            badge: '/style/icons/system_64.png'
          })
        });
      }

      if (this.manifest && this.manifest.role === 'vividus_game_2d') {
        LazyLoader.load('js/notification_toaster.js', () => {
          NotificationToaster.showNotification(L10n.get('vividusEngine'), {
            body: L10n.get('vividus2DGameDetected'),
            source: L10n.get('title'),
            badge: '/style/icons/system_64.png'
          })
        });
      }

      this.instanceID = this.manifest.role === 'homescreen' ? 'homescreen' :`appframe${_id}`;
      _id++;

      const fragment = document.createDocumentFragment();

      // Create and initialize the window container
      const windowDiv = this.createWindowContainer(fragment, this.manifest, this.instanceID, options.animationVariables);
      windowDiv.dataset.manifestUrl = manifestUrl;
      windowDiv.addEventListener('mousedown', () => this.focus());
      windowDiv.addEventListener('touchstart', () => this.focus());
      windowDiv.addEventListener('contextmenu', (event) => this.handleWindowContextMenu(event, windowDiv));
      this.element = windowDiv;

      // Create dock icon
      if (!this.HIDDEN_ROLES.includes(this.manifest.role)) {
        if (options.dockIcon) {
          this.dockIcon = options.dockIcon;
        } else {
          this.dockIcon = new DockIcon(this.dock, manifestUrl, options.entryId);
        }
      }
      if (this.dockIcon) {
        this.dockIcon.element.classList.add('running');
      }

      // Create a splash screen with an icon
      this.createSplashScreen(windowDiv, this.manifest.icons, manifestUrl);

      if (window.deviceType === 'desktop') {
        this.createWindowedWindow(windowDiv, this.manifest, this.instanceID, options);
      }

      const url = new URL(manifestUrl);
      let targetUrl = this.manifest.launch_path ? url.origin + this.manifest.launch_path : this.manifest.start_url;
      if (this.manifest.chrome && this.manifest.chrome.navigation) {
        if (options.url) {
          targetUrl = options.url;
        }
      }

      // Create chrome container and initialize the browser
      const chromeContainer = this.createChromeContainer(windowDiv);
      this.initializeBrowser(chromeContainer, targetUrl, this.manifest.chrome?.navigation || false);

      this.containerElement.appendChild(fragment);

      // Focus the app window
      this.focus();
      document.addEventListener('mousemove', this.onPointerMove.bind(this));
      document.addEventListener('touchmove', this.onPointerMove.bind(this));
      document.addEventListener('mouseup', this.onPointerUp.bind(this));
      document.addEventListener('touchend', this.onPointerUp.bind(this));
      document.addEventListener('mousemove', this.resize.bind(this));
      document.addEventListener('touchmove', this.resize.bind(this));
      document.addEventListener('mouseup', this.stopResize.bind(this));
      document.addEventListener('touchend', this.stopResize.bind(this));
    },

    handleWindowContextMenu: function (event) {
      event.preventDefault();
      event.stopPropagation();

      const x = event.clientX;
      const y = event.clientY;

      const menu = [
        {
          name: 'Close',
          l10nId: 'windowMenu-close',
          icon: 'windowmanager-close',
          onclick: () => this.close()
        },
        {
          name: 'Maximize',
          l10nId: 'windowMenu-maximize',
          icon: 'windowmanager-maximize',
          onclick: () => this.maximize()
        },
        {
          name: 'Minimize',
          l10nId: 'windowMenu-minimize',
          icon: 'windowmanager-minimize',
          onclick: () => this.minimize()
        },
        { type: 'separator' },
        {
          name: 'Shade',
          l10nId: 'windowMenu-shade',
          icon: 'shade',
          onclick: () => this.shade(true)
        },
        { type: 'separator' },
        {
          name: 'Close Forcefully',
          l10nId: 'windowMenu-closeForcefully',
          icon: 'forbidden',
          onclick: () => this.close(true)
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      requestAnimationFrame(() => {
        ContextMenu.show(x, y, menu);
      });
    },

    fetchManifest: async function (manifestUrl) {
      try {
        const response = await fetch(manifestUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching manifest:', error);
      }
    },

    updateTransformOrigin: function (element, animationVariables) {
      element.style.transformOrigin = `${animationVariables.xPos}px ${animationVariables.yPos}px`;
      element.style.setProperty('--icon-pos-x', animationVariables.iconXPos + 'px');
      element.style.setProperty('--icon-pos-y', animationVariables.iconYPos + 'px');
      element.style.setProperty('--icon-scale-x', animationVariables.iconXScale);
      element.style.setProperty('--icon-scale-y', animationVariables.iconYScale);
    },

    createWindowContainer: function (fragment, manifest, instanceID, animationVariables) {
      const windowDiv = document.createElement('div');
      windowDiv.id = instanceID;
      windowDiv.classList.add('appframe');

      if (manifest.role === 'homescreen') {
        this.homescreenElement = windowDiv;
      }

      if (manifest.statusbar && manifest.statusbar !== 'normal') {
        windowDiv.classList.add('sb-' + manifest.statusbar);
      }

      if (typeof manifest.display === 'object') {
        if (manifest.display[window.deviceType] && manifest.display[window.deviceType] !== 'standalone') {
          windowDiv.classList.add(manifest.display[window.deviceType]);
        } else if (manifest.display.default && manifest.display.default !== 'standalone') {
          windowDiv.classList.add(manifest.display.default);
        }
      } else {
        if (manifest.display && manifest.display !== 'standalone') {
          windowDiv.classList.add(manifest.display);
        }
      }

      if (manifest.orientation && manifest.orientation !== 'auto') {
        windowDiv.classList.add(manifest.orientation);
        windowDiv.classList.add(manifest.orientation + '-default');
      }

      if (manifest.transparent) {
        windowDiv.classList.add('transparent');
      }

      if (animationVariables) {
        this.updateTransformOrigin(windowDiv, animationVariables);
      }

      fragment.appendChild(windowDiv);

      if (window.deviceType !== 'desktop') {
        const statusbar = document.createElement('div');
        this.statusbar = new Statusbar(statusbar);
        windowDiv.appendChild(statusbar);
      }

      // Add animation class
      this.addAnimationClass(windowDiv, this.OPEN_ANIMATION);
      return windowDiv;
    },

    createSplashScreen: function (windowDiv, icons, manifestUrl) {
      const splashScreen = document.createElement('div');
      splashScreen.classList.add('splashscreen');
      windowDiv.appendChild(splashScreen);
      const splashScreenIcon = document.createElement('img');
      splashScreenIcon.classList.add('icon');
      splashScreen.appendChild(splashScreenIcon);
      this.addIconImage(splashScreenIcon, icons, this.SPLASH_ICON_SIZE, manifestUrl);
    },

    createWindowedWindow: function (windowDiv, manifest, instanceID, options) {
      windowDiv.classList.add('window');
      this.offsetX = manifest.window_bounds?.left || 36;
      this.offsetY = manifest.window_bounds?.top || 24
      windowDiv.style.setProperty('--window-translate', `${manifest.window_bounds?.left || 36}px ${manifest.window_bounds?.top || 24}px`);
      windowDiv.style.setProperty('--window-width', (manifest.window_bounds?.width || 768) + 'px');
      windowDiv.style.setProperty('--window-height', (manifest.window_bounds?.height || 600) + 'px');

      // Create titlebar and its buttons
      this.createTitlebar(windowDiv, instanceID);

      // Create resize handlers
      this.createResizeHandlers(windowDiv);
    },

    createTitlebar: function (windowDiv, instanceID) {
      const titlebar = document.createElement('div');
      titlebar.classList.add('titlebar');
      windowDiv.appendChild(titlebar);

      const titlebarGrippy = document.createElement('div');
      titlebarGrippy.classList.add('titlebar-grippy');
      titlebarGrippy.addEventListener('mousedown', this.onPointerDown.bind(this));
      titlebarGrippy.addEventListener('touchstart', this.onPointerDown.bind(this));
      titlebar.appendChild(titlebarGrippy);

      const titlebarButtons = document.createElement('div');
      titlebarButtons.classList.add('titlebar-buttons');
      titlebar.appendChild(titlebarButtons);

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      });
      titlebarButtons.appendChild(closeButton);

      const resizeButton = document.createElement('button');
      resizeButton.classList.add('resize-button');
      resizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.maximize();
      });
      titlebarButtons.appendChild(resizeButton);

      const minimizeButton = document.createElement('button');
      minimizeButton.classList.add('minimize-button');
      minimizeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.minimize();
      });
      titlebarButtons.appendChild(minimizeButton);
    },

    createResizeHandlers: function (windowDiv) {
      const resizeHandlers = [];

      // Create and append the resize handlers in all directions
      for (let i = 0; i < 9; i++) {
        const resizeHandler = document.createElement('div');
        resizeHandler.classList.add('resize-handler');
        windowDiv.appendChild(resizeHandler);
        resizeHandlers.push(resizeHandler);
      }

      // Set the cursor style for each resize handler
      resizeHandlers[0].classList.add('nw-resize');
      resizeHandlers[1].classList.add('n-resize');
      resizeHandlers[2].classList.add('ne-resize');
      resizeHandlers[3].classList.add('w-resize');
      resizeHandlers[4].classList.add('e-resize');
      resizeHandlers[5].classList.add('sw-resize');
      resizeHandlers[6].classList.add('s-resize');
      resizeHandlers[7].classList.add('se-resize');

      // Attach event listeners to each resize handler
      for (let index = 0, length = resizeHandlers.length; index < length; index++) {
        const resizeHandler = resizeHandlers[index];

        resizeHandler.addEventListener('mousedown', this.startResize.bind(this));
        resizeHandler.addEventListener('touchstart', this.startResize.bind(this));
      }
    },

    createChromeContainer: function (windowDiv) {
      const chromeContainer = document.createElement('div');
      chromeContainer.classList.add('chrome');
      windowDiv.appendChild(chromeContainer);
      return chromeContainer;
    },

    initializeBrowser: async function (chromeContainer, startUrl, isChromeEnabled) {
      const browser = new Chrome(chromeContainer, startUrl, this, isChromeEnabled);
      this.chrome = browser;

      Webapps.append({
        appWindow: this,
        chrome: this.chrome,
        instanceID: this.instanceID,
        isChromeEnabled,
        manifestUrl: this.manifestUrl,
        startUrl
      });

      if (this.manifest && this.manifest.chrome && this.manifest.chrome.style_path) {
        const url = new URL(this.manifestUrl);
        const styleUrl = url.origin + this.manifest.chrome.style_path;

        try {
          const response = await fetch(styleUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.status}`);
          }
          const data = await response.text();

          const styleElement = document.createElement('style');
          styleElement.innerText = data.replaceAll('app-window', `#${this.instanceID}`);
          this.element.appendChild(styleElement);
        } catch (error) {
          console.error('Error fetching manifest:', error);
        }
      }

      if (this.manifest && this.manifest.chrome && this.manifest.chrome.titlebar) {
        this.element
      }

      chromeContainer.addEventListener('mousedown', this.onPointerDown.bind(this));
      chromeContainer.addEventListener('touchstart', this.onPointerDown.bind(this));
    },

    // Utility methods for adding an icon image and an animation class
    addIconImage: function (element, icons, iconSize, manifestUrl) {
      element.crossOrigin = 'anonymous';
      element.onerror = () => {
        element.src = '/style/images/default.svg';
      };

      const entries = Object.entries(icons);
      for (let index = 0, length = entries.length; index < length; index++) {
        const entry = entries[index];

        if (entry[0] >= (iconSize * window.devicePixelRatio)) {
          continue;
        }
        const url = new URL(manifestUrl);
        element.src = url.origin + entry[1];
      }
    },

    addAnimationClass: function (element, animationClass) {
      element.classList.add(animationClass);
      element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
      });
    },

    /**
     * Moves a app window with select app window ID to the foreground and marks it as active
     *
     * Example:
     * ```js
     * AppWindow.focus();
     * ```
     * @returns null
     */
    focus: function () {
      if (this.isDragging) {
        return;
      }

      if (this.element) {
        this.element.style.transform = '';

        if (this.statusbar && this.statusbar.element && this.softwareButtons) {
          if (this.element.classList.contains('fullscreen')) {
            this.statusbar.element.classList.add('hidden');
            this.softwareButtons.classList.add('hidden');
          } else {
            this.statusbar.element.classList.remove('hidden');
            this.softwareButtons.classList.remove('hidden');
          }
        }
      } else {
        return;
      }

      if (this.instanceID !== 'homescreen') {
        this.wallpapersContainer.classList.add('app-open');
        this.bottomPanel.classList.remove('homescreen');
      } else {
        this.wallpapersContainer.classList.remove('app-open');
        this.bottomPanel.classList.add('homescreen');
      }

      const appWindows = this.containerElement.querySelectorAll('.appframe');
      for (let index = 0, length = appWindows.length; index < length; index++) {
        const element = appWindows[index];
        if (element.classList.contains('overlay')) {
          element.classList.remove('active-as-overlay');
        } else {
          element.classList.remove('active');
        }
      }

      const dockIcons = this.dock.querySelectorAll('.icon');
      for (let index = 0, length = dockIcons.length; index < length; index++) {
        const element = dockIcons[index];
        element.classList.remove('active');
      }

      if (this.element.classList.contains('overlay')) {
        this.element.classList.add('active-as-overlay');
      } else {
        this.element.classList.add('active');
      }
      if (this.dockIcon && this.dockIcon.element) {
        this.dockIcon.element.classList.add('active');
      }
      this.element.classList.remove('minimized');
      focusedWindow = this;

      this.handleThemeColorFocusUpdated();
      Settings.addObserver('video.dark_mode.enabled', () => this.handleThemeColorFocusUpdated());

      if (!this.element.classList.contains('overlay') && this.getFocusedWindow().element && this.getFocusedWindow().element !== this.homescreenElement && this.element !== this.homescreenElement) {
        if (this.element === this.getFocusedWindow().element) {
          return;
        }

        this.getFocusedWindow().element.classList.add('to-left');
        this.getFocusedWindow().element.addEventListener('animationend', () => {
          this.getFocusedWindow().element.classList.remove('from-right');
          this.getFocusedWindow().element.classList.remove('to-left');
        });

        this.element.classList.add('from-right');
        this.element.addEventListener('animationend', () => {
          this.element.classList.remove('from-right');
          this.element.classList.remove('to-left');
        });
      } else {
        if (this.homescreenElement) {
          this.homescreenElement.classList.add('transitioning');
          this.homescreenElement.addEventListener('animationend', () => {
            this.homescreenElement.classList.remove('transitioning');
          });
        }
      }
    },

    /**
     * Closes a app window with select app window ID and kills process
     *
     * Example:
     * ```js
     * AppWindow.close();
     * ```
     * @returns null
     */
    close: function (isFast) {
      if (this.isDragging) {
        return;
      }
      if (this.instanceID === 'homescreen') {
        return;
      }

      Webapps.runningWebapps = Webapps.runningWebapps.filter(item => item.manifestUrl !== this.manifestUrl);

      if (isFast) {
        this.element.remove();
        if (this.dockIcon && this.dockIcon.element) {
          if (this.dockIcon.isPinned) {
            this.dockIcon.element.classList.remove('active', 'running');
          } else {
            this.dockIcon.element.remove();
          }
        }
      } else {
        if (this.dockIcon && this.dockIcon.element && !this.dockIcon.isPinned) {
          this.dockIcon.element.classList.add(this.CLOSE_ANIMATION);
        }

        this.element.classList.add(this.CLOSE_ANIMATION);
        this.element.addEventListener('animationend', () => {
          this.element.style.transform = '';
          this.element.classList.remove(this.CLOSE_ANIMATION);
          this.element.remove();

          if (this.dockIcon && this.dockIcon.element) {
            if (this.dockIcon.isPinned) {
              this.dockIcon.element.classList.remove('active', 'running');
            } else {
              this.dockIcon.element.classList.remove(this.CLOSE_ANIMATION);
              this.dockIcon.element.remove();
            }
          }

          HomescreenLauncher.homescreenWindow.focus();
        });
      }
    },

    minimize: function () {
      if (this.isDragging) {
        return;
      }
      if (this.instanceID === 'homescreen') {
        return;
      }

      if (window.deviceType === 'desktop') {
        if (this.dockIcon && this.dockIcon.element) {
          const x = this.dockIcon.element.clientLeft - this.offsetX;
          const y = this.dockIcon.element.clientTop - this.offsetY;
          this.element.style.transformOrigin = `${x}px ${y}px`;
        }

        this.element.classList.add(this.MINIMIZE_ANIMATION);
      } else {
        HomescreenLauncher.homescreenWindow.focus();
        this.element.classList.add(this.CLOSE_TO_HOMESCREEN_ANIMATION);
        if (this.dockIcon && this.dockIcon.element) {
          this.dockIcon.element.classList.add('minimized');
        }
        this.element.addEventListener('animationend', () => {
          HomescreenLauncher.homescreenWindow.focus();
        });

        // Focus plays a 0.5s switch animation which could bug out with animationend
        this.timeoutID = setTimeout(() => {
          this.element.style.transform = '';
          this.element.classList.remove('active');
          this.element.classList.remove(this.CLOSE_TO_HOMESCREEN_ANIMATION);
        }, 1000);
      }
    },

    unminimize: function () {
      if (this.isDragging) {
        return;
      }
      if (this.instanceID === 'homescreen') {
        return;
      }

      if (window.deviceType === 'desktop') {
        this.element.classList.remove(this.MINIMIZE_ANIMATION);

        if (this.dockIcon && this.dockIcon.element) {
          const x = this.dockIcon.element.clientLeft - this.offsetX;
          const y = this.dockIcon.element.clientTop - this.offsetY;
          this.element.style.transformOrigin = `${x}px ${y}px`;

          this.element.addEventListener('animationend', () => {
            this.element.style.transformOrigin = null;
          });
        }
      } else {
        if (this.element === this.focusedWindow) {
          return;
        }

        if (this.dockIcon && this.dockIcon.element) {
          this.dockIcon.element.classList.remove('minimized');
        }
        this.focus();
        this.element.classList.add(this.OPEN_ANIMATION);
        this.element.addEventListener('animationend', () => {
          this.element.classList.remove(this.OPEN_ANIMATION);
          this.focus();
        });
      }
    },

    maximize: function () {
      if (this.instanceID === 'homescreen') {
        return;
      }
      this.element.classList.add('transitioning');
      this.element.classList.toggle('maximized');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
    },

    handleThemeColorFocusUpdated: function () {
      const webview = this.element.querySelector('.browser-container .browser.active');
      let color;
      if (webview) {
        color = webview.dataset.themeColor.substring(0, 7);
      } else {
        return;
      }

      if (!this.statusbar || !this.softwareButtons) {
        return;
      }

      if (color) {
        // Calculate the luminance of the color
        const luminance = this.calculateLuminance(color);

        // If the color is light (luminance > 0.5), add 'light' class to the status bar
        if (luminance > 0.5) {
          this.statusbar.element.classList.remove('dark');
          this.softwareButtons.classList.remove('dark');
          this.statusbar.element.classList.add('light');
          this.softwareButtons.classList.add('light');
        } else {
          // Otherwise, remove 'light' class
          this.statusbar.element.classList.remove('light');
          this.softwareButtons.classList.remove('light');
          this.statusbar.element.classList.add('dark');
          this.softwareButtons.classList.add('dark');
        }
      } else {
        this.statusbar.element.classList.remove('light');
        this.softwareButtons.classList.remove('light');
        this.statusbar.element.classList.add('dark');
        this.softwareButtons.classList.add('dark');
      }
    },

    calculateLuminance: function (color) {
      // Convert the color to RGB values
      const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);

      // Calculate relative luminance
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      return luminance;
    },

    // Attach event listeners for mouse/touch events to handle dragging
    onPointerDown: function (event) {
      if (this.UNDRAGGABLE_ELEMENTS.indexOf(event.target.nodeName) !== -1) {
        return;
      }
      if (window.deviceType !== 'desktop') {
        return;
      }

      // event.preventDefault();
      this.containerElement.classList.add('dragging');
      this.isDragging = true;

      this.element.classList.add('transitioning');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
      this.element.classList.add('dragging');

      // Store initial pointer position
      this.startX = event.clientX || event.touches[0].clientX;
      this.startY = event.clientY || event.touches[0].clientY;

      // Store initial element position
      this.startOffsetX = this.offsetX;
      this.startOffsetY = this.offsetY;

      // this.element.style.transformOrigin = `${offsetX}px ${offsetY}px`;
    },

    onPointerMove: function (event) {
      if (window.deviceType !== 'desktop') {
        return;
      }
      if (!this.isDragging) {
        return;
      }

      // event.preventDefault();
      // Calculate the movement based on the difference between initial and current positions
      const movementX = (event.clientX || event.touches[0].clientX) - this.startX;
      const movementY = (event.clientY || event.touches[0].clientY) - this.startY;

      // Calculate the new position of the window
      this.offsetX = this.startOffsetX + movementX;
      this.offsetY = Math.max(0, Math.min(window.innerHeight - 64 - 32, this.startOffsetY + movementY));

      // Set the new position of the window
      this.element.style.setProperty('--window-translate', `${this.offsetX}px ${this.offsetY}px`);

      this.element.classList.remove('snapped');
      if (event.clientX < 15) {
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('left');
      } else if (event.clientX > window.innerWidth - 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('right');
      } else if (event.clientX < window.innerWidth / 3 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('top-left');
      } else if (event.clientX > (window.innerWidth / 3) * 2 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('top-right');
      } else if (event.clientX < (window.innerWidth / 3) * 2 && event.clientX > window.innerWidth / 3 && event.clientY < 15) {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.add('visible');
        this.snapOverlay.classList.add('cover');
      } else {
        this.snapOverlay.classList.remove('left');
        this.snapOverlay.classList.remove('right');
        this.snapOverlay.classList.remove('cover');
        this.snapOverlay.classList.remove('top-left');
        this.snapOverlay.classList.remove('top-right');
        this.snapOverlay.classList.remove('visible');
      }
    },

    onPointerUp: function (event) {
      if (window.deviceType !== 'desktop') {
        return;
      }
      // event.preventDefault();
      this.containerElement.classList.remove('dragging');

      this.element.classList.add('transitioning');
      this.element.addEventListener('transitionend', () => this.element.classList.remove('transitioning'));
      this.element.classList.remove('dragging');

      this.isDragging = false;

      this.snapOverlay.classList.remove('left');
      this.snapOverlay.classList.remove('right');
      this.snapOverlay.classList.remove('cover');
      this.snapOverlay.classList.remove('top-left');
      this.snapOverlay.classList.remove('top-right');
      this.snapOverlay.classList.remove('visible');
      if (event.clientX < 15) {
        this.element.style.setProperty('--window-translate', '0 0');
        this.element.style.setProperty('--window-width', '50%');
        this.element.style.setProperty('--window-height', 'calc(100% - var(--dock-height) - 2rem)');
        this.element.classList.add('snapped');
      } else if (event.clientX > window.innerWidth - 15) {
        this.element.style.setProperty('--window-translate', '50% 0');
        this.element.style.setProperty('--window-width', '50%');
        this.element.style.setProperty('--window-height', 'calc(100% - var(--dock-height) - 2rem)');
        this.element.classList.add('snapped');
      } else if (event.clientX < window.innerWidth / 3 && event.clientY < 15) {
        this.element.style.setProperty('--window-translate', '0 0');
        this.element.style.setProperty('--window-width', '50%');
        this.element.style.setProperty('--window-height', 'calc((100% - var(--dock-height) - 2rem) / 2)');
        this.element.classList.add('snapped');
      } else if (event.clientX > (window.innerWidth / 3) * 2 && event.clientY < 15) {
        this.element.style.setProperty('--window-translate', '50% 0');
        this.element.style.setProperty('--window-width', '50%');
        this.element.style.setProperty('--window-height', 'calc((100% - var(--dock-height) - 2rem) / 2)');
        this.element.classList.add('snapped');
      } else if (event.clientX < (window.innerWidth / 3) * 2 && event.clientX > window.innerWidth / 3 && event.clientY < 15) {
        this.maximize();
      }
    },

    startResize: function (event) {
      // event.preventDefault();
      this.isResizing = true;
      this.containerElement.classList.add('dragging');
      this.resizingWindow = this.element;
      this.resizingGripper = event.target;

      this.startX = event.pageX || event.touches[0].pageX;
      this.startY = event.pageY || event.touches[0].pageY;
      this.startWidth = this.resizingWindow.offsetWidth;
      this.startHeight = this.resizingWindow.offsetHeight;
    },

    resize: function (event) {
      // event.preventDefault();
      if (!this.isResizing) {
        return;
      }

      const currentX = event.pageX || event.touches[0].pageX;
      const currentY = event.pageY || event.touches[0].pageY;

      let width = this.startWidth;
      let height = this.startHeight;
      let left = this.resizingWindow.getBoundingClientRect().left;
      let top = this.resizingWindow.getBoundingClientRect().top;

      if (this.resizingGripper.classList.contains('nw-resize')) {
        // Top Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (this.startY - currentY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (this.resizingGripper.classList.contains('n-resize')) {
        // Top
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (this.resizingGripper.classList.contains('ne-resize')) {
        // Top Right
        width = this.startWidth + (currentX - this.startX);
        height = this.startHeight + (this.startY - currentY);
        top = this.resizingWindow.offsetTop - (this.startY - currentY);
      } else if (this.resizingGripper.classList.contains('w-resize')) {
        // Left
        width = this.startWidth + (this.startX - currentX);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (this.resizingGripper.classList.contains('e-resize')) {
        // Right
        width = this.startWidth + (currentX - this.startX);
      } else if (this.resizingGripper.classList.contains('sw-resize')) {
        // Bottom Left
        width = this.startWidth + (this.startX - currentX);
        height = this.startHeight + (currentY - this.startY);
        left = this.resizingWindow.offsetLeft - (this.startX - currentX);
      } else if (this.resizingGripper.classList.contains('s-resize')) {
        // Bottom
        height = this.startHeight + (currentY - this.startY);
      } else if (this.resizingGripper.classList.contains('se-resize')) {
        // Bottom Right
        width = this.startWidth + (currentX - this.startX);
        height = this.startHeight + (currentY - this.startY);
      }

      // Update the position and dimensions of the window
      this.element.style.setProperty('--window-translate', `${left}px ${top}`);
      this.element.style.setProperty('--window-width', `${width}px`);
      this.element.style.setProperty('--window-height', `${height}px`);
    },

    stopResize: function (event) {
      // event.preventDefault();
      this.isResizing = false;
      this.containerElement.classList.remove('dragging');
    }
  };

  exports.AppWindow = AppWindow;

  const AppWindowExtended = {
    screen: document.getElementById('screen'),
    containerElement: document.getElementById('windows'),
    softwareButtons: document.getElementById('software-buttons'),
    softwareBackButton: document.getElementById('software-back-button'),
    softwareHomeButton: document.getElementById('software-home-button'),

    init: function () {
      this.containerElement.addEventListener('contextmenu', this.handleDesktopContextMenu.bind(this));
      if (window.deviceType === 'desktop') {
        this.softwareButtons.addEventListener('contextmenu', this.handleDesktopContextMenu.bind(this));
      }

      this.softwareBackButton.addEventListener('click', this.onButtonClick.bind(this));
      this.softwareHomeButton.addEventListener('click', this.onButtonClick.bind(this));
    },

    handleDesktopContextMenu: function (event) {
      event.preventDefault();

      const x = event.clientX;
      const y = event.clientY;

      const trayMenu = [
        {
          name: 'Settings',
          l10nId: 'desktopMenu-settings',
          icon: 'settings',
          onclick: () => {
            const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
          }
        }
      ];

      const desktopMenu = [
        {
          name: 'Widgets',
          l10nId: 'desktopMenu-widgets',
          icon: 'groups',
          onclick: () => {}
        },
        {
          name: 'Open Folder',
          l10nId: 'desktopMenu-openFolder',
          icon: 'folder',
          onclick: () => {}
        },
        { type: 'separator' },
        {
          name: 'Settings',
          l10nId: 'desktopMenu-settings',
          icon: 'settings',
          onclick: () => {
            const appWindow = new AppWindow('http://settings.localhost:8081/manifest.json', {});
          }
        }
      ];

      // Delaying the context menu opening so it won't fire the same time click
      // does and instantly hide as soon as it opens
      requestAnimationFrame(() => {
        if (event.target === this.softwareButtons) {
          ContextMenu.show(x, y, trayMenu);
        } else if (event.target === this.containerElement) {
          ContextMenu.show(x, y, desktopMenu);
        }
      });
    },

    onButtonClick: function (event) {
      switch (event.target) {
        case this.softwareBackButton:
          if (!this.screen.classList.contains('keyboard-visible')) {
            const webview = new AppWindow.getFocusedWindow().element.querySelector('.browser-container .browser.active');
            if (webview.canGoBack()) {
              webview.goBack();
            } else {
              this.close();
            }
          } else {
            this.screen.classList.remove('keyboard-visible');
            this.keyboard.classList.remove('visible');
          }
          break;

        case this.softwareHomeButton:
          new AppWindow.getFocusedWindow().minimize();
          break;

        default:
          break;
      }
    }
  };

  AppWindowExtended.init();
})(window);
