import { ipcRenderer } from 'electron';
import Settings from '../../../settings';

const Narrator = {
  message: null as SpeechSynthesisUtterance | null,
  readableElements: ['A', 'BUTTON', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'INPUT', 'LI', 'P', 'TEXTAREA'],
  triggerEvents: ['mouseover', 'touchdown'],

  settings: ['accessibility.narrator.enabled'],
  SETTINGS_ACCESSIBILITY_NARRATOR: 0,

  init: function () {
    this.message = new SpeechSynthesisUtterance();
    this.triggerEvents.forEach((event) => {
      document.addEventListener(event, this.handleNarration.bind(this));
    });
  },

  handleNarration: function (event: Event) {
    Settings.getValue(this.settings[this.SETTINGS_ACCESSIBILITY_NARRATOR]).then((value: boolean) => {
      if (!value) {
        return;
      }

      const targetElement = event.target as HTMLElement;
      let ttsString = null;
      if (this.readableElements.indexOf(targetElement.nodeName) !== -1) {
        if (!ttsString && 'value' in targetElement) {
          if (targetElement.value) {
            ttsString = targetElement.value as string;
          } else {
            ttsString = targetElement.textContent as string;
          }
        }
      }

      if (this.message && ttsString) {
        speechSynthesis.cancel();
        this.message.text = ttsString;
        speechSynthesis.speak(this.message);

        ipcRenderer.send('narrate', {
          message: ttsString
        });
      }
    });
  }
};

export default Narrator;
