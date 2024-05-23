class HTMLNotificationsContainerElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="container">
        <slot></slot>
      </div>
      <link rel="stylesheet" href="/components/notifications-container/notifications-container.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));
  }

  appendToGroup(element, name) {
    const existingGroup = this.querySelector(`[data-name="${encodeURI(name)}"]`);
    if (existingGroup) {
      existingGroup.appendChild(element);
      return;
    }

    const group = new HTMLNotificationsGroupElement();
    group.dataset.name = encodeURI(name);
    group.headerTitle.textContent = name;
    group.appendChild(element);
    this.appendChild(group);
  }
}

customElements.define('notifications-container', HTMLNotificationsContainerElement);
