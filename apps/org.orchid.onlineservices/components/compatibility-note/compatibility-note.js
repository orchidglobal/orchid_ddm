class HTMLCompatibilityNoteElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="message">
        <div class="header">
          <div class="icon-holder">
            <div class="icon"></div>
          </div>

          <div class="text-holder">
            <p class="title">Limited Compatibility</p>
            <p class="detail">Your Firefox Javascript engine is limited, and CSS support is too far behind</p>
          </div>

          <div class="browsers">
            <div class="engine blink">
              <div class="browser chrome supported"></div>
              <div class="browser edge supported"></div>
            </div>
            <div class="engine gecko">
              <div class="browser firefox unsupported"></div>
              <div class="browser kaios blocked"></div>
            </div>
            <div class="engine webkit">
              <div class="browser safari supported"></div>
            </div>
          </div>

          <div class="expand-icon">
            <span class="expand"></span>
          </div>
        </div>

        <div class="content">
          <div class="icon-holder">
            <div class="icon"></div>
          </div>

          <div class="text-holder">
            <p class="title">Firefox Compatibility is Terrible</p>
            <p class="summary">SpiderMonkey lacks many capabilities and has extremely inconsistent unpredictable behavior and hasn't been updated since Baker's greedy arrival</p>
            <p class="summary">The Firefox CSS Engine is always behind and breaks complex UIs way too often due to awful execution of removing a feature entirely to fix it (Which only breaks the broken webpages even more) and add it back instead of just. Well. Fixing it</p>
            <p class="summary">Mozilla is focusing on tracking you and advertising to you obnoxiously more than their main product that makes them profit. So much for a free open web</p>
          </div>
        </div>
      </div>
      <link rel="stylesheet" href="/components/compatibility-note/compatibility-note.css">
    `;

    this.message = shadow.querySelector('.message');
    this.header = shadow.querySelector('.header');
    this.expandIcon = shadow.querySelector('.expand-icon .expand');
    this.content = shadow.querySelector('.content');

    this.message.style.height = this.header.getBoundingClientRect().height + 'px';

    const isWidescreen = window.matchMedia('(min-width: 768px)').matches;
    this.classList.toggle('widescreen', isWidescreen);

    window.addEventListener('resize', this.handleResize.bind(this));
    this.header.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    this.expandIcon.classList.toggle('active');
    this.content.classList.toggle('visible');

    if (this.content.classList.contains('visible')) {
      this.message.style.height = this.header.getBoundingClientRect().height + this.content.getBoundingClientRect().height + 'px';
    } else {
      this.message.style.height = this.header.getBoundingClientRect().height + 'px';
    }
  }

  handleResize() {
    const isWidescreen = window.matchMedia('(min-width: 768px)').matches;
    this.classList.toggle('widescreen', isWidescreen);

    if (this.content.classList.contains('visible')) {
      this.message.style.height = this.header.getBoundingClientRect().height + this.content.getBoundingClientRect().height + 'px';
    } else {
      this.message.style.height = this.header.getBoundingClientRect().height + 'px';
    }
  }
}

customElements.define('compatibility-note', HTMLCompatibilityNoteElement);
