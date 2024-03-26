!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const SettingsAPI = {
    getValue: async function (key, file) {
      if ('Settings' in window) {
        // Backward compatibility
        return await Settings.getValue(key, file);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/get?name=' + key)
          .then((response) => response.text())
          .then((data) => data.trim())
          .then((data) => {
            if (/null|undefined|true|false/i.test(data)) {
              return JSON.parse(data === 'undefined' ? 'null' : data);
            } else if (data.startsWith('{') && data.endsWith('}')) {
              return JSON.parse(data);
            } else {
              return data;
            }
          })
          .catch((error) => localStorage.getItem(key));
      }
    },

    setValue: async function name(key, value, file) {
      if ('Settings' in window) {
        // Backward compatibility
        return await Settings.setValue(key, value, file);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/set?name=' + key + '&value=' + value)
          .then((response) => response.text())
          .catch((error) => localStorage.setItem(key, value));
      }
    },

    addObserver: async function name(key, callback) {
      if ('Settings' in window) {
        // Backward compatibility
        return await Settings.addObserver(key, callback);
      } else {
        return await fetch('http://localhost:8081/api/data/settings/observe?name=' + key)
          .then((response) => response.text());
      }
    }
  };

  OrchidJS.Settings = SettingsAPI;
})(window);
