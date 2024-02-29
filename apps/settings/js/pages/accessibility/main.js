!(function (exports) {
  'use strict';

  const Accessibility = {
    narratorSwitch: document.getElementById('accessibility-narrator-switch'),
    colorBlindnessForm: document.getElementById('accessibility-color-blindness-form'),

    init: function () {
      this.narratorSwitch.addEventListener('change', this.handleNarratorSwitch.bind(this));
      Settings.getValue('accessibility.narrator.enabled').then((data) => {
        this.narratorSwitch.checked = data;
      });

      this.colorBlindnessForm.addEventListener("change", this.handleColorBlindnessForm.bind(this));
    },

    handleNarratorSwitch: function () {
      const value = this.narratorSwitch.checked;
      Settings.setValue('accessibility.narrator.enabled', value);
    },

    handleColorBlindnessForm: function (event) {
      if (event.target.type === "radio") {
        const selectedRadio = document.querySelector('input[type="radio"]:checked');
        if (selectedRadio) {
          Settings.setValue('accessibility.colorblindness', selectedRadio.value);
        }
      }
    }
  };

  exports.Accessibility = Accessibility;
})(window);
