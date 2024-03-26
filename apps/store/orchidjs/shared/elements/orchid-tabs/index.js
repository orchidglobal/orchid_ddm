class HTMLOrchidTabsElement extends HTMLElement {
  constructor() {
    super();

    this.init();
  }

  init() {
    this.selectOverlay = document.createElement('div');
    this.selectOverlay.classList.add('select-overlay');
    this.appendChild(this.selectOverlay);

    this.tabs = document.createElement('div');
    this.tabs.classList.add('tabs');
    this.appendChild(this.tabs);

    this.handleInnerTabs();
  }

  handleInnerTabs() {
    const tabs = this.querySelectorAll('orchid-tab');
    tabs.forEach((tab, index) => {
      tab.classList.remove('selected');
      tab.addEventListener('click', this.handleTabClick.bind(this));
      tab.dataset.index = index;
      this.tabs.appendChild(tab);

      if (index === 0) {
        tab.classList.add('selected');

        const index = tab.dataset.index || 0;
        this.selectOverlay.style.setProperty('--tab-offset', index);
      }
    });

    this.selectOverlay.style.setProperty('--tabs-amount', this.tabs.childNodes.length);
  }

  handleTabClick(event) {
    const tabs = this.querySelectorAll('orchid-tab');
    tabs.forEach(tab => {
      tab.classList.remove('selected');
    });

    const targetTab = event.target;
    // if (targetTab.nodeName !== 'orchid-tab') {
    //   return;
    // }

    targetTab.classList.add('selected');

    const index = targetTab.dataset.index || 0;
    this.selectOverlay.style.setProperty('--tab-offset', index);

    const customEvent = new CustomEvent('tab-changed', { value: targetTab.getAttribute('value') });
    this.dispatchEvent(customEvent);
  }
}

customElements.define('orchid-tabs', HTMLOrchidTabsElement);
