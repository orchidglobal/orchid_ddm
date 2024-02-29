class ContextMenu {
  constructor(element, menu) {
    this.element = element;
    this.menu = menu;
    this.isHolding = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.startOffsetX = 0;

    this.init();
  }

  init () {
    if (!this.element) {
      return;
    }
    this.element.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    document.addEventListener('pointermove', this.handlePointerMove.bind(this));
    document.addEventListener('pointerup', this.handlePointerUp.bind(this));

    this.background = document.createElement('div');
    this.background.classList.add('bb-force-hold-background');

    this.update();
  }

  handlePointerDown (event) {
    if (!this.menu || !this.element) {
      return;
    }
    this.menu.classList.add('force-touch');
    this.element.classList.add('bb-force-hold');
    this.isHolding = true;
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startOffsetX = event.clientOffsetX;

    this.element.classList.add('bb-force-hold-press');
    this.element.addEventListener('animationend', () => {
      this.element.classList.remove('bb-force-hold-press');

      this.element.classList.add('bb-force-hold-click');
      this.element.addEventListener('animationend', () => {
        this.element.classList.remove('bb-force-hold-click');
      });
    });

    setTimeout(() => {
      if (!this.menu || !this.element) {
        return;
      }
      if (!this.isHolding || !this.isDragging) {
        return;
      }
      this.menu.classList.add('visible');
    }, 1000);

    const x = this.element.getBoundingClientRect().left;
    const y = this.element.getBoundingClientRect().top;
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;
    const menuX = this.menu.getBoundingClientRect().left;
    const menuY = this.menu.getBoundingClientRect().top;
    const menuWidth = this.menu.getBoundingClientRect().height;

    if (this.startOffsetX > (window.innerWidth / 2)) {
      this.menu.style.translate = `${x + width - menuWidth}px ${y + height + 10}px`;
    } else {
      this.menu.style.translate = `${x}px ${y + height + 10}px`;
    }
    this.menu.style.transformOrigin = `${x - menuX}px ${y - menuY + height}px`;

    this.parentElement = this.element.parentElement;
    this.background.appendChild(this.element);

    this.background.classList.add('bb-force-hold-background-show');
    this.background.addEventListener('animationend', () => {
      this.background.classList.remove('bb-force-hold-background-show');
    });

    this.parentElement.appendChild(this.element);
  }

  handlePointerMove (event) {
    if (!this.menu || !this.element) {
      return;
    }
    if (!this.isHolding || !this.isDragging) {
      return;
    }
    this.element.classList.add('bb-force-hold');

    const progress = Math.min(1, Math.max(0.75, 0.75 + (this.calculateDistance(this.startX, this.startY, event.clientX, event.clientY) / 75) * 0.25));
    this.menu.style.setProperty('--force-touch-progress', progress);
  }

  calculateDistance (x1, y1, x2, y2) {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance;
  }

  handlePointerUp () {
    if (!this.element) {
      return;
    }
    if (!this.isHolding || !this.isDragging) {
      return;
    }
    this.menu.classList.remove('visible');
    this.element.classList.remove('bb-force-hold');
    this.isHolding = false;
    this.isDragging = false;

    this.element.classList.add('bb-force-hold-lift');
    this.element.addEventListener('animationend', () => {
      this.element.classList.remove('bb-force-hold-lift');
    });

    this.background.classList.add('bb-force-hold-background-hide');
    this.background.addEventListener('animationend', () => {
      this.background.classList.remove('bb-force-hold-background-hide');
    });
  }

  update () {
    requestAnimationFrame(this.update.bind(this));

    if (!this.element) {
      return;
    }
    if (!this.isHolding || !this.isDragging) {
      return;
    }

    const x = this.element.getBoundingClientRect().left;
    const y = this.element.getBoundingClientRect().top;
    const width = this.element.getBoundingClientRect().width;
    const height = this.element.getBoundingClientRect().height;
    const menuX = this.menu.getBoundingClientRect().left;
    const menuY = this.menu.getBoundingClientRect().top;
    const menuWidth = this.menu.getBoundingClientRect().height;

    if (this.startOffsetX > (window.innerWidth / 2)) {
      this.menu.style.translate = `${x + width - menuWidth}px ${y + height + 10}px`;
    } else {
      this.menu.style.translate = `${x}px ${y + height + 10}px`;
    }
    this.menu.style.transformOrigin = `${x - menuX}px ${y - menuY + height}px`;
  }
}

new ContextMenu(document.querySelector('.holdable-div'), document.querySelector('.bb-menu'));
