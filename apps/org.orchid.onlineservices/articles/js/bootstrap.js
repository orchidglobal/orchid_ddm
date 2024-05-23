window.ArticlesApp = {};

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();

    window.addEventListener('orchid-services-ready', this.whenServicesReady.bind(this));
  }

  whenServicesReady() {

  }

  initialize() {
    this.initializeHints();
  }

  whenReady() {
    this.tipHint = document.querySelector('tip-hint');

    OrchidJS.registerComponent('trending-ad', null);
    OrchidJS.registerComponent('tip-hint', null);

    this.unsupportedAlertbar = document.getElementById('alertbar-unsupported');

    if (OrchidJS.isSupported) {
      this.unsupportedAlertbar.remove();
    }

    LazyLoader.load('js/posts.js');
    LazyLoader.load('js/trending.js');
    LazyLoader.load('js/login_banner.js');
    LazyLoader.load('js/create_post.js');
    LazyLoader.load('js/pages/root/main.js');
    LazyLoader.load('js/pages/account/main.js');
  }
}

OrchidJS.setInstance(new Bootstrap());
