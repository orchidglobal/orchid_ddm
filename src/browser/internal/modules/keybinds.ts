import { ipcRenderer } from 'electron';

const Keybinds = {
  init: function () {
    document.addEventListener('keyup', this.handleKeybind.bind(this));
  },

  handleKeybind: function (event: KeyboardEvent) {
    ipcRenderer.sendToHost('keybind', {
      keyCode: event?.key
    });
  }
};

export default Keybinds;
