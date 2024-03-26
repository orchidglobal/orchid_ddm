!(function (exports) {
  'use strict';

  const Accessibility = {
    narratorSwitch: document.getElementById('accessibility-narrator-switch'),
    textBoldSwitch: document.getElementById('accessibility-text-bold-switch'),
    textContrastSwitch: document.getElementById('accessibility-text-contrast-switch'),
    colorBlindnessForm: document.getElementById('accessibility-color-blindness-form'),

    init: function () {
      this.narratorSwitch.addEventListener('change', this.handleNarratorSwitch.bind(this));
      Settings.getValue('accessibility.narrator.enabled').then((data) => {
        this.narratorSwitch.checked = data;
      });

      this.textBoldSwitch.addEventListener('change', this.handleTextBoldSwitch.bind(this));
      Settings.getValue('accessibility.text.bold').then((data) => {
        this.textBoldSwitch.checked = data;
      });

      this.textContrastSwitch.addEventListener('change', this.handleTextContrastSwitch.bind(this));
      Settings.getValue('accessibility.text.contrast').then((data) => {
        this.textContrastSwitch.checked = data;
      });

      this.colorBlindnessForm.addEventListener("change", this.handleColorBlindnessForm.bind(this));
    },

    handleNarratorSwitch: function () {
      const value = this.narratorSwitch.checked;
      Settings.setValue('accessibility.narrator.enabled', value);
    },

    handleTextBoldSwitch: function () {
      const value = this.textBoldSwitch.checked;
      Settings.setValue('accessibility.text.bold', value);
    },

    handleTextContrastSwitch: function () {
      const value = this.textContrastSwitch.checked;
      Settings.setValue('accessibility.text.contrast', value);
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

  SettingsApp.Accessibility = Accessibility;
})(window);
