class HTMLChromeWebviewElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <section class="webview">
        <webview src="" class="browser web-contents"></webview>
        <div class="target-url">
          <p class="text"></p>
        </div>
      </section>
      <link rel="stylesheet" href="/components/web-view/web-view.css">
    `;

    this.primaryWebview = shadow.querySelector('.web-contents');
    this.primaryWebview.useragent = navigator.userAgent;
    this.primaryWebview.preload = this.getPreloadPath();
    this.primaryWebview.nodeintegration = true;
    this.primaryWebview.nodeintegrationinframes = true;

    this.targetUrl = shadow.querySelector('.target-url');

    this.targetUrlText = this.targetUrl.querySelector('.text');

    this.primaryWebview.addEventListener('update-target-url', this.handleHoveredTargetUrl.bind(this));
    this.primaryWebview.addEventListener('dom-ready', this.handleDomReady.bind(this));
  }

  handleHoveredTargetUrl(event) {
    if (event.url) {
      this.targetUrl.classList.add('visible');
      this.targetUrlText.innerText = event.url;
    } else {
      this.targetUrl.classList.remove('visible');
    }
  }

  handleDomReady(event) {
    this.insertCSS('orchid://preloads/html.css');
    this.insertCSS('orchid://preloads/fontfamilies.css');
    this.insertJS('orchid://preloads/override.js');

    this.addToHistory();
  }

  getPreloadPath() {
    const dirname = Environment.dirName().replaceAll('\\', '/');
    const preload = `../../../src/browser/internal/preload.js`;
    return `file://${dirname}/${preload}`;
  }

  insertCSS(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.primaryWebview.insertCSS(xhr.responseText);
      } else if (xhr.readyState === 4) {
        console.error('Failed to fetch CSS:', xhr.status, xhr.statusText);
      }
    };
    xhr.send();
  }

  insertJS(url) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this.primaryWebview.executeJavaScript(xhr.responseText);
      } else if (xhr.readyState === 4) {
        console.error('Failed to fetch JS:', xhr.status, xhr.statusText);
      }
    };
    xhr.send();
  }

  async addToHistory() {
    const newWebsite = {
      title: this.primaryWebview.getTitle(),
      url: this.primaryWebview.getURL()
    };

    let visitedWebsites = await DataStorage.getValue('visited_websites', 'history.json') || [];
    visitedWebsites = visitedWebsites.filter(website => website.url !== newWebsite.url);
    visitedWebsites.push(newWebsite);

    await DataStorage.setValue('visited_websites', visitedWebsites, 'history.json');
  }

  get src() {
    return this.primaryWebview.src;
  }

  set src(url) {
    this.primaryWebview.src = url;
  }

  get incognito() {
    return this.primaryWebview.partition;
  }

  set incognito(flag) {
    if (flag) {
      this.primaryWebview.partition = 'private';
    } else {
      this.primaryWebview.partition = 'persist:orchid';
    }
  }
}

customElements.define('web-view', HTMLChromeWebviewElement);
