'use strict';

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();
  }

  whenReady() {
    OrchidJS.registerComponent('carousel-cards', null);
    OrchidJS.registerComponent('carousel-card', null);
  }
}

OrchidJS.setInstance(new Bootstrap());
