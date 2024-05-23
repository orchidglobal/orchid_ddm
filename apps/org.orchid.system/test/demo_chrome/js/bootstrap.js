'use strict';

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();
  }

  whenReady() {
    OrchidJS.registerComponent('app-chrome', null);
    OrchidJS.registerComponent('chrome-webview', null);
    OrchidJS.registerComponent('chrome-tab', null);
  }
}

OrchidJS.setInstance(new Bootstrap());
