window.ArticlesApp = {};

class Bootstrap extends OrchidJS.OrchidFramework {
  constructor() {
    super();

    window.addEventListener('orchid-services-ready', this.whenServicesReady.bind(this));
  }

  whenServicesReady() {

  }

  whenReady() {
    this.unsupportedAlertbar = document.getElementById('alertbar-unsupported');

    if (OrchidJS.isSupported) {
      this.unsupportedAlertbar.remove();
    }

    LazyLoader.load('js/posts.js');
    LazyLoader.load('js/login_banner.js');
    LazyLoader.load('js/create_post.js');
    LazyLoader.load('js/pages/root/main.js');
    LazyLoader.load('js/pages/account/main.js');
  }
}

OrchidJS.setInstance(new Bootstrap());
