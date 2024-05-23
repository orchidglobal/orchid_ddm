class HTMLNotificationsGroupElement extends HTMLElement {
  isGrouped = true;

  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="group">
        <div class="header">
          <h3 class="title"></h3>
        </div>
        <div class="content">
          <slot></slot>
        </div>
      </div>
      <link rel="stylesheet" href="/components/notifications-group/notifications-group.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.group = shadow.querySelector('.group');
    this.headerTitle = shadow.querySelector('.title');
    this.content = shadow.querySelector('.content');

    this.addEventListener('click', this.handleClick.bind(this));

    this.group.classList.toggle('collapsed', this.isGrouped);
    this.render();
  }

  handleClick() {
    this.isGrouped = !this.isGrouped;
    this.group.classList.toggle('collapsed', this.isGrouped);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    let computedOffsetY = 0;

    const elements = this.querySelectorAll('notification-toaster');
    elements.forEach((element, index) => {
      element.style.zIndex = elements.length - index;

      if (this.isGrouped) {
        if (index <= 2) {
          element.style.transform = `translate3d(0, ${10 * index}px, 0) scale(${1 - (0.05 * index)})`;
          element.style.setProperty('--background-opacity', 0.6 - (0.2 * index));
          element.style.display = 'block';
        } else {
          element.style.transform = `translate3d(0, ${10 * 2}px, 0) scale(${1 - (0.05 * 2)})`;
          element.style.setProperty('--background-opacity', 0.6 - (0.2 * 2));
          element.style.display = 'none';
        }

        if (index === 1) {
          computedOffsetY += (element.getBoundingClientRect().height + 10);
        }

        if (index === elements.length - 1) {
          if (index === 0) {
            this.content.style.height = (computedOffsetY - 10) + 'px';
          } else if (index === 1) {
            this.content.style.height = (computedOffsetY - 10 + 10) + 'px';
          } else if (index === 2) {
            this.content.style.height = (computedOffsetY - 10 + 18) + 'px';
          } else {
            this.content.style.height = (computedOffsetY - 10 + 18) + 'px';
          }
        }
      } else {
        element.style.transform = `translate3d(0, ${computedOffsetY}px, 0)`;
        element.style.setProperty('--background-opacity', 0.6);
        element.style.display = 'block';
        computedOffsetY += (element.getBoundingClientRect().height + 10);

        if (index === elements.length - 1) {
          this.content.style.height = (computedOffsetY - 10) + 'px';
        }
      }
    });
  }
}

customElements.define('notifications-group', HTMLNotificationsGroupElement);
