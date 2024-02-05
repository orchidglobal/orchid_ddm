!(function (exports) {
  'use strict';

  /**
   * Number to Hex converter
   * @param {var} c
   * @returns
   */
  function numberToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  }

  exports.numberToHex = numberToHex;
})(window);
