!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }
  if (!('Vividus2D' in OrchidJS)) {
    OrchidJS.Vividus2D = {};
  }

  class Panel extends OrchidJS.Vividus2D.Sprite {
    constructor(renderer, imagePath, width, height) {
      super(renderer, imagePath, width, height);
    }
  }

  OrchidJS.Vividus2D.Panel = Panel;
})(window);
