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

    LazyLoader.load('js/webapps.js');
    LazyLoader.load('js/slideshow.js');

    LazyLoader.load('js/pages/root/main.js');
    LazyLoader.load('js/pages/publish/main.js');
  }
}

OrchidJS.setInstance(new Bootstrap());
