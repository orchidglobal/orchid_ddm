'use strict';

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();
  }

  whenReady() {
    OrchidJS.registerComponent('tray-devices', null);
  }
}

OrchidJS.setInstance(new Bootstrap());
