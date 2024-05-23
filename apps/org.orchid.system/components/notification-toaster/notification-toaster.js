class HTMLNotificationToasterElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="toaster">
        <!-- <wallpaper-background></wallpaper-background> -->
        <div class="container">
          <div class="titlebar">
            <img src="" class="badge" />
            <div class="source-name"></div>
          </div>
          <div class="content">
            <img src="" class="icon" />
            <div class="text-holder">
              <div class="title"></div>
              <div class="detail"></div>
              <div class="progress"></div>
            </div>
          </div>
          <div class="media"></div>
          <div class="actions"></div>
        </div>
      </div>
      <link rel="stylesheet" href="/components/notification-toaster/notification-toaster.css">
    `;

    this.toaster = shadow.querySelector('.toaster');
  }

  setContent(title, options) {
    const { body, progress, badge, source, icon, media, actions } = options;

    const titleElement = this.toaster.querySelector('.title');
    titleElement.innerText = title;

    const detailElement = this.toaster.querySelector('.detail');
    detailElement.innerText = body;

    const progressElement = this.toaster.querySelector('.progress');
    if (progress || progress === 0) {
      progressElement.style.setProperty('--progress', Math.min(100, progress) / 100);
    } else {
      progressElement.style.display = 'none';
    }

    const badgeElement = this.toaster.querySelector('.badge');
    if (badge) {
      badgeElement.src = badge;
    } else {
      badgeElement.style.display = 'none';
    }

    const sourceNameElement = this.toaster.querySelector('.source-name');
    sourceNameElement.innerText = source;

    const iconElement = this.toaster.querySelector('.icon');
    if (icon) {
      iconElement.src = icon;
    } else {
      iconElement.style.display = 'none';
    }
    iconElement.onerror = () => {
      iconElement.style.display = 'none';
    };

    const mediaElement = this.toaster.querySelector('.media');
    if (media && media.length > 0) {
      mediaElement.innerHTML = '';
      for (let index = 0, length = media.length; index < length; index++) {
        const src = media[index];

        const imgElement = document.createElement('img');
        imgElement.src = src;
        mediaElement.appendChild(imgElement);
      }
    } else {
      mediaElement.style.display = 'none';
    }

    const actionsElement = this.toaster.querySelector('.actions');
    if (actions && actions.length > 0) {
      actionsElement.innerHTML = '';
      for (let index = 0, length = actions.length; index < length; index++) {
        const button = actions[index];

        const buttonElement = document.createElement('button');
        buttonElement.textContent = button.label;
        buttonElement.addEventListener('click', button.onclick);
        if (button.recommend) {
          buttonElement.classList.add('recommend');
        }
        actionsElement.appendChild(buttonElement);
      }
    } else {
      actionsElement.style.display = 'none';
    }
  }
}

customElements.define('notification-toaster', HTMLNotificationToasterElement);
