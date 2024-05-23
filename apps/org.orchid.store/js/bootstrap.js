class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();

    window.addEventListener('orchid-services-ready', this.whenServicesReady.bind(this));
  }

  whenServicesReady() {}

  whenReady() {
    OrchidJS.enableFeature('common/tags', null);

    OrchidJS.registerComponent('slide-show', null);
    OrchidJS.registerComponent('slide-show-card', null);
    OrchidJS.registerComponent('app-category', null);
    OrchidJS.registerComponent('web-app', null);

    this.unsupportedAlertbar = document.getElementById('alertbar-unsupported');

    if (OrchidJS.isSupported) {
      this.unsupportedAlertbar.remove();
    }

    LazyLoader.load('js/webapps.js');

    LazyLoader.load('js/pages/root/main.js');
    LazyLoader.load('js/pages/publish/main.js');
  }
}

OrchidJS.setInstance(new Bootstrap());
