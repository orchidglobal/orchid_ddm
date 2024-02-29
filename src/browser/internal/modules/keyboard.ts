import { ipcRenderer } from 'electron';

const Keyboard = {
  inputAreas: null as NodeList | null,

  init: function () {
    this.inputAreas = document.querySelectorAll(
      '[contenteditable=true], input[type=text], input[type=name], input[type=email], input[type=password], input[type=number], textarea, dataset'
    );
    this.inputAreas.forEach((inputElement) => {
      inputElement.addEventListener('focus', this.onFocus.bind(this));
    });

    document.addEventListener('click', this.onClick.bind(this));
  },

  onFocus: function (event: Event) {
    ipcRenderer.send('message', {
      type: 'keyboard',
      action: 'show',
      origin: location.href
    });
  },

  onClick: function (event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    if (targetElement.isContentEditable || ['INPUT', 'TEXTAREA'].indexOf(targetElement.nodeName) === -1) {
      ipcRenderer.send('message', {
        type: 'keyboard',
        action: 'hide',
        origin: location.href
      });
    }
  }
};

export default Keyboard;
