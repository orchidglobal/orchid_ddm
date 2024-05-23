!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const TelephonyAPI = {
    getSimCards: async function () {
      // Placeholder dummy cards
      return [
        {
          enabled: true,
          number: '+1 012-345-6789',
          carrierName: 'T-Mobile',
          signal: 0.5 + (0.5 * Math.round()),
          esim: false,
          pinLocked: false
        },
        {
          enabled: true,
          number: '+1 012-345-6789',
          carrierName: 'Orchid US',
          signal: 0.5 + (0.5 * Math.round()),
          esim: true,
          pinLocked: false
        }
      ];
    },

    call: async function (sim, number) {
      return {
        state: 'success'
      }
    },

    uninstall: async function name(appId) {
      if ('Telephony' in window) {
        // Backward compatibility
        return await Telephony.uninstall();
      } else {
        return await fetch('http://localhost:9920/api/data/webapps/uninstall?id=' + appId).then((response) =>
          response.json()
        );
      }
    }
  };

  OrchidJS.Telephony = TelephonyAPI;
})(window);
