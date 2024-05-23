'use strict';

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();
  }

  whenReady() {
    OrchidJS.registerComponent('compatibility-note', null);
  }
}

OrchidJS.setInstance(new Bootstrap());
