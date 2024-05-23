'use strict';

class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();
  }

  whenReady() {
    OrchidJS.registerComponent('notifications-container', null);
    OrchidJS.registerComponent('notifications-group', null);
    OrchidJS.registerComponent('notification-toaster', null);
    OrchidJS.registerComponent('wallpaper-background', null);
  }
}

OrchidJS.setInstance(new Bootstrap());
