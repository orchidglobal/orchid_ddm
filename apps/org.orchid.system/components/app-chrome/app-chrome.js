class HTMLAppChromeElement extends HTMLElement {
  softwareButtons = document.getElementById('software-buttons');
  bottomPanel = document.getElementById('bottom-panel');

  constructor() {
    super();

    this.init();
  }

  init() {
    this._internals = this.attachInternals();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <section class="browser bottom">
        <div class="statusbar-background"></div>

        <div class="toolbar">
          <header class="controls header-bar">
            <orchid-account-button></orchid-account-button>

            <button class="groups-button" data-icon="groups" data-l10n-id="tablist-groupsButton"></button>
            <button class="side-tabs-button" data-icon="side-tabs" data-l10n-id="tablist-sideTabsButton"></button>

            <div class="tablist"></div>

            <button class="add-button" data-icon="add" data-l10n-id="tablist-addButton"></button>
            <button class="search-button" data-icon="chevron-down" data-l10n-id="tablist-searchButton"></button>
          </header>

          <nav class="controls navbar">
            <button class="navbar-back-button" data-icon="arrow-back" data-l10n-id="navbar-backButton"></button>
            <button class="navbar-forward-button" data-icon="arrow-forward" data-l10n-id="navbar-forwardButton"></button>
            <button class="navbar-home-button" data-icon="home" data-l10n-id="navbar-homeButton"></button>

            <div class="urlbar-space"></div>

            <div class="addons">
              <button class="navbar-addons-button" data-icon="addons" data-l10n-id="navbar-addonsButton"></button>
              <div class="addons-buttons"></div>
            </div>

            <button class="navbar-split-button" data-icon="split" data-l10n-id="navbar-splitButton"></button>
            <button class="navbar-tabs-button" data-icon="tabs" data-l10n-id="navbar-tabsButton"></button>
            <button class="navbar-downloads-button" data-icon="download"
              data-l10n-id="navbar-downloadsButton"></button>
            <button class="navbar-library-button" data-icon="library" data-l10n-id="navbar-libraryButton"></button>
            <button class="navbar-bookmark-button" data-icon="bookmark" data-l10n-id="navbar-bookmarkButton"></button>
            <button class="navbar-options-button" data-icon="options" data-l10n-id="navbar-optionsButton"></button>
          </nav>

          <div class="controls urlbar-holder">
            <form action="" class="urlbar">
              <button class="urlbar-ssl-button" data-icon="lock" data-l10n-id="urlbar-sslButton"></button>
              <button class="urlbar-settings-button" data-icon="settings" data-l10n-id="urlbar-settingsButton"></button>

              <input type="url" class="urlbar-input" />
              <div class="urlbar-display-url"></div>

              <button class="urlbar-go-button" hidden data-icon="arrow-forward" data-l10n-id="urlbar-goButton"></button>
              <!-- <button class="navbar-stop-button" data-icon="close" data-l10n-id="navbar-stopButton"></button> -->
              <button class="navbar-reload-button" data-icon="reload" data-l10n-id="navbar-reloadButton"></button>
            </form>
          </div>
        </div>

        <section class="browser-container"></section>

        <section class="web-panel homepage">
          <div class="header">
            <h1></h1>
            <menu role="toolbar">
              <a href="#" class="apps-button" data-icon="apps"></a>
            </me>
          </div>

          <div class="content">
            <header class="logo-header">
              <div class="logo">
                <div class="wordmark">Orchid</div>
              </div>
            </header>

            <div class="bookmarks">
              <ul class="bookmarks-list"></ul>
            </div>

            <div class="section history lists">
              <header class="title">History</header>
              <ul class="history-list"></ul>
            </div>

            <div class="section search">
              <header class="title"></header>
              <ul class="search-results"></ul>
            </div>
          </div>
        </section>

        <section class="web-panel net-error"></section>

        <section class="tabs">
          <div class="tabs-search"></div>
          <div class="tabs-grid"></div>
        </section>
      </section>
      <link rel="stylesheet" href="/shared/style/common/icons/icons.css">
      <link rel="stylesheet" href="/shared/style/common/lists.css">
      <link rel="stylesheet" href="/components/app-chrome/app-chrome.css">
      <link rel="stylesheet" href="/components/app-chrome/homepage.css">
      <link rel="stylesheet" href="/components/app-chrome/net_error.css">
    `;

    this.tablist = shadow.querySelector('.tablist');

    this.backButton = shadow.querySelector('.navbar-back-button');
    this.forwardButton = shadow.querySelector('.navbar-forward-button');
    this.reloadButton = shadow.querySelector('.navbar-reload-button');
    this.homeButton = shadow.querySelector('.navbar-home-button');

    this.urlbar = shadow.querySelector('.urlbar');
    this.urlbarInput = shadow.querySelector('.urlbar-input');
    this.urlbarDisplayUrl = shadow.querySelector('.urlbar-display-url');

    this.browserContainer = shadow.querySelector('.browser-container');

    this.homepage = shadow.querySelector('.homepage');
    this.homepageWallpaper = this.homepage.querySelector('.background');
    this.homepageHistoryList = this.homepage.querySelector('.history-list');

    this.netError = shadow.querySelector('.net-error');

    window.addEventListener('pwa-detected', (event) => {
      console.log('PWA Detected:', event.detail);
    });

    this.backButton.addEventListener('click', this.handleBackButton.bind(this));
    this.forwardButton.addEventListener('click', this.handleForwardButton.bind(this));
    this.reloadButton.addEventListener('click', this.handleReloadButton.bind(this));
    this.homeButton.addEventListener('click', this.handleHomeButton.bind(this));
    this.urlbar.addEventListener('submit', this.handleUrlbar.bind(this));
    this.urlbarInput.addEventListener('input', this.handleUrlbarInput.bind(this));

    new OrchidJS.ForceTouch(this.urlbar, () => {}, 'hold');

    this.update();
  }

  handleBackButton(event) {
    const webview = this.browserContainer.querySelector('web-view.active').primaryWebview;
    if (webview) {
      webview.goBack();
    }
  }

  handleForwardButton(event) {
    const webview = this.browserContainer.querySelector('web-view.active').primaryWebview;
    if (webview) {
      webview.goForward();
    }
  }

  handleReloadButton(event) {
    const webview = this.browserContainer.querySelector('web-view.active').primaryWebview;
    if (webview) {
      webview.reload();
    }
  }

  handleHomeButton(event) {
    const webview = this.browserContainer.querySelector('web-view.active').primaryWebview;
    if (webview) {
      webview.src = 'about:blank';
    }
  }

  handleUrlbar(event) {
    event.preventDefault();

    const webview = this.browserContainer.querySelector('web-view.active').primaryWebview;
    if (webview) {
      webview.src = this.urlbarInput.value;
    }
  }

  handleUrlbarInput(event) {
    
  }

  openNewTab(url, isIncognito) {
    const instanceID = OrchidJS.UUID.v4();
    const tab = new HTMLAppChromeTabElement();
    const webview = new HTMLChromeWebviewElement();

    tab.webviewInstance = webview;
    tab.dataset.id = instanceID;

    webview.src = url;
    webview.incognito = isIncognito;
    webview.dataset.id = instanceID;

    webview.primaryWebview.addEventListener('did-finish-load', this.handleFinishLoad.bind(this));
    webview.primaryWebview.addEventListener('did-fail-load', this.handleFailLoad.bind(this));
    webview.primaryWebview.addEventListener('did-start-loading', this.handleStartLoading.bind(this, webview));
    webview.primaryWebview.addEventListener('did-stop-loading', this.handleEndLoading.bind(this, webview));
    webview.primaryWebview.addEventListener('dom-ready', this.handleDOMReady.bind(this, webview));
    webview.primaryWebview.addEventListener('page-title-updated', this.handleTitle.bind(this));
    webview.primaryWebview.addEventListener('did-navigate', this.handleNavigation.bind(this));
    webview.primaryWebview.addEventListener('did-navigate-in-page', this.handleNavigation.bind(this));
    webview.primaryWebview.addEventListener('did-change-theme-color', this.handleThemeColor.bind(this, webview));
    webview.primaryWebview.addEventListener('context-menu', this.handleContextMenu.bind(this));

    this.tablist.appendChild(tab);
    this.browserContainer.appendChild(webview);

    this.focus(instanceID);
  }

  handleFinishLoad(event) {
    this.netError.classList.remove('visible');
  }

  handleFailLoad(event) {
    this.netError.classList.add('visible');
  }

  handleStartLoading(webview) {
    this.reloadButton.classList.add('stop-loading');
    webview.classList.add('loading');
  }

  handleEndLoading(webview) {
    this.reloadButton.classList.remove('stop-loading');
    webview.classList.remove('loading');
  }

  handleDOMReady(webview) {
    this.backButton.disabled = !webview.primaryWebview.canGoBack();
    this.forwardButton.disabled = !webview.primaryWebview.canGoForward();

    const isHomePage = (webview.primaryWebview.getURL() === 'about:blank');
    this.homepage.classList.toggle('visible', isHomePage);
    if (isHomePage) {
      this.prepareHomePage();
    }
  }

  async prepareHomePage() {
    this.homepageWallpaper.classList.remove('loaded');

    OrchidJS.Settings.getValue('video.wallpaper.url').then(this.handleHomeWallpaper.bind(this));

    this.homepageHistoryList.innerHTML = '';
    const visitedWebsites = await OrchidJS.Settings.getValue('visited_websites', 'history.json');
    visitedWebsites.reverse().forEach((website, index) => {
      if (index > 3) {
        return;
      }

      const element = document.createElement('li');

      const title = document.createElement('p');
      title.textContent = website.title;
      element.appendChild(title);

      const url = document.createElement('p');
      url.textContent = website.url;
      element.appendChild(url);

      this.homepageHistoryList.appendChild(element);
    });
  }

  handleHomeWallpaper(value) {
    this.homepageWallpaper.style.backgroundImage = `url(${value})`;
    setTimeout(() => {
      this.homepageWallpaper.classList.add('loaded');
    }, 200)
  }

  handleTitle(event) {
    this.urlbarDisplayUrl.textContent = event.title;
  }

  handleNavigation(event) {
    if (this.urlbarInput !== document.activeElement) {
      this.urlbarInput.value = event.url;
    }
  }

  handleThemeColor(webview, event) {
    const color = event.themeColor;
    if (color) {
      webview.dataset.themeColor = (color + 'C0').toLowerCase();
      this.dataset.themeColor = color.substring(0, 7);
      this.style.setProperty('--theme-color', color);

      // Calculate the luminance of the color
      const luminance = this.calculateLuminance(color);

      // If the color is light (luminance > 0.5), add 'light' class to the status bar
      if (luminance > 0.5) {
        this.classList.remove('dark');
        if (this.statusbar && this.statusbar.element) {
          this.app.statusbar.element.classList.remove('dark');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.remove('dark');
        }
        if (this.bottomPanel) {
          this.bottomPanel.classList.remove('dark');
        }

        this.classList.add('light');
        if (this.statusbar && this.statusbar.element) {
          this.app.statusbar.element.classList.add('light');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.add('light');
        }
        if (this.bottomPanel) {
          this.bottomPanel.classList.add('light');
        }
      } else {
        // Otherwise, remove 'light' class
        this.classList.remove('light');
        if (this.statusbar) {
          this.statusbar.classList.remove('light');
        }
        if (this.statusbar && this.statusbar.element) {
          this.app.statusbar.element.classList.remove('light');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.remove('light');
        }
        if (this.bottomPanel) {
          this.bottomPanel.classList.remove('light');
        }

        this.classList.add('dark');
        if (this.statusbar) {
          this.statusbar.classList.add('dark');
        }
        if (this.statusbar && this.statusbar.element) {
          this.app.statusbar.element.classList.add('dark');
        }
        if (this.softwareButtons) {
          this.softwareButtons.classList.add('dark');
        }
        if (this.bottomPanel) {
          this.bottomPanel.classList.add('dark');
        }
      }
    } else {
      webview.dataset.themeColor = null;
      this.dataset.themeColor = null;
      this.style.setProperty('--theme-color', null);

      this.classList.remove('light', 'dark');
      if (this.statusbar && this.statusbar.element) {
        this.app.statusbar.element.classList.remove('dark');
        this.app.statusbar.element.classList.remove('light');
      }
      if (this.softwareButtons) {
        this.softwareButtons.classList.remove('dark');
        this.softwareButtons.classList.remove('light');
      }
      if (this.bottomPanel) {
        this.bottomPanel.classList.remove('dark');
        this.bottomPanel.classList.remove('light');
      }
    }
  }

  calculateLuminance(color) {
    // Convert the color to RGB values
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);

    // Calculate relative luminance
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance;
  }

  handleContextMenu(event) {

  }

  focus(id) {
    const tabs = this.tablist.querySelectorAll('chrome-tab');
    tabs.forEach(element => {
      element.classList.remove('active');
    });

    const webviews = this.browserContainer.querySelectorAll('web-view');
    webviews.forEach(element => {
      element.classList.remove('active');
    });

    const targetTab = this.tablist.querySelector(`chrome-tab[data-id="${id}"]`);
    if (targetTab) {
      targetTab.classList.add('active');
    }

    const targetWebview = this.browserContainer.querySelector(`web-view[data-id="${id}"]`);
    if (targetWebview) {
      targetWebview.classList.add('active');
    }
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    const flag = this.offsetWidth >= 768;
    this.classList.toggle('desktop', flag);
  }
}

customElements.define('app-chrome', HTMLAppChromeElement);
