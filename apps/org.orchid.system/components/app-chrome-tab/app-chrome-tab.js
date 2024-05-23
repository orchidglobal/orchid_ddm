class HTMLAppChromeTabElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="tab">
        <div class="header">
          <img src="" alt="" class="favicon" />
          <div class="text-holder">
            <p class="title"></p>
            <p class="status"></p>
          </div>
        </div>

        <menu class="controls">
          <button class="close-button" data-icon="close"></button>
          <button class="mute-button" hidden data-icon="audio-off"></button>
        </menu>
      </div>
      <link rel="stylesheet" href="/components/app-chrome-tab/app-chrome-tab.css">
    `;
  }
}

customElements.define('app-chrome-tab', HTMLAppChromeTabElement);
