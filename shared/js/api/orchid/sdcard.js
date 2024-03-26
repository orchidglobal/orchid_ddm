!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const SDCardManagerAPI = {
    getValue: async function (key, file) {
      if ('SDCardManager' in window) {
        // Backward compatibility
        return await SDCardManager.getValue(key, file);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/get?name=' + key)
          .then((response) => response.json());
      }
    },

    setValue: async function name(key, value, file) {
      if ('SDCardManager' in window) {
        // Backward compatibility
        return await SDCardManager.setValue(key, value, file);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/set?name=' + key + '&value=' + value)
          .then((response) => response.json());
      }
    },

    addObserver: async function name(key, callback) {
      if ('SDCardManager' in window) {
        // Backward compatibility
        return await SDCardManager.addObserver(key, callback);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/observe?name=' + key)
          .then((response) => response.json());
      }
    }
  };

  OrchidJS.SDCardManager = SDCardManagerAPI;
})(window);
