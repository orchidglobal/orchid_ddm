class HTMLWebappElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="webapp">
        <div class="number-holder">
          <div class="number"></div>
        </div>

        <div class="icon-holder">
          <img src="" alt="" class="icon">
        </div>

        <div class="text-holder">
          <h3 class="name"></h3>
          <a href="#" class="author">Example User</a>
          <div class="stats">
            <span class="rating">4.6/5.0</span>
            <div class="separator"></div>
            <span class="age-rating">13+</span>
          </div>
        </div>

        <div class="price-holder">
          <div class="buttons">
            <button class="get-button recommend">Get</button>
            <button class="update-button hidden">Update</button>
          </div>
          <span class="price">Free</span>
        </div>
      </div>
      <link rel="stylesheet" href="/shared/style/icons/icons.css">
      <link rel="stylesheet" href="/components/web-app/web-app.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.numberHolder = shadow.querySelector('.number-holder');
    this.number = shadow.querySelector('.number');
    this.icon = shadow.querySelector('.icon');
    this.name = shadow.querySelector('.name');
    this.author = shadow.querySelector('.author');
  }

  setNumber(num) {
    this.numberHolder.classList.add('visible');
    this.number.textContent = num;
  }

  bindStoreApp(data) {
    this.icon.src = data.icon;
    this.icon.onerror = () => {
      this.icon.src = '/images/default_256.png';
    };

    this.name.textContent = data.name || 'Unnamed';
  }
}

customElements.define('web-app', HTMLWebappElement);
