!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const UUID = {
    generateID: function () {
      let now = new Date().getTime();
      const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    },

    generateToken: function () {
      let now = new Date().getTime();
      const uuid = 'xxxxxxxxyyyyyyyy-xxxxyyyy-4xxxyyyy-yxxxyyyy-xxxxxxxxxxxxyyyyyyyyyyyyxxxx'.replace(/[xy]/g, function(c) {
        const r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    },

    v4: function () {
      let now = new Date().getTime();
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (now + Math.random() * 16) % 16 | 0;
        now = Math.floor(now / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    }
  };

  OrchidJS.UUID = UUID;
})(window);
