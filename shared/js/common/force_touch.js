!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  class ForceTouch {
    constructor(element, menu, type = 'menu') {
      this.element = element;
      this.menu = menu;
      this.type = type;
      this.isHolding = false;
      this.isDragging = false;
      this.isReady = false;
      this.startX = 0;
      this.startY = 0;
      this.startOffsetX = 0;

      this.init();
    }

    init() {
      if (!this.element) {
        return;
      }
      this.element.addEventListener('pointerdown', this.handlePointerDown.bind(this));
      document.addEventListener('pointermove', this.handlePointerMove.bind(this));
      document.addEventListener('pointerup', this.handlePointerUp.bind(this));

      this.update();
    }

    handlePointerDown(event) {
      if (!this.menu || !this.element) {
        return;
      }

      if (this.type === 'menu') {
        this.menu.classList.add('force-touch');
      }
      this.element.classList.add('hold');
      this.isHolding = true;
      this.isDragging = true;
      this.isReady = false;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.startOffsetX = event.clientOffsetX;

      if (this.type === 'menu') {
        this.element.classList.add('press');
        this.element.addEventListener('animationend', () => {
          this.element.classList.remove('press');
        });
      }

      setTimeout(() => {
        if (!this.isHolding || !this.isDragging) {
          return;
        }
        if (this.type === 'menu') {
          if (!this.menu || !this.element) {
            return;
          }
          this.menu.classList.add('visible');

          this.element.classList.add('click');
          this.element.addEventListener('animationend', () => {
            this.element.classList.remove('click');
          });

          navigator.vibrate([50, 100, 50]);
        } else {
          this.menu();

          navigator.vibrate([50, 100, 25]);
        }

        this.isReady = true;
      }, 1000);

      if (this.type !== 'menu') {
        return;
      }

      const x = this.element.getBoundingClientRect().left;
      const y = this.element.getBoundingClientRect().top;
      const width = this.element.getBoundingClientRect().width;
      const height = this.element.getBoundingClientRect().height;
      const menuX = this.menu.getBoundingClientRect().left;
      const menuY = this.menu.getBoundingClientRect().top;
      const menuWidth = this.menu.getBoundingClientRect().height;

      if (this.startOffsetX > window.innerWidth / 2) {
        this.menu.style.translate = `${x + width - menuWidth}px ${y + height + 10}px`;
      } else {
        this.menu.style.translate = `${x}px ${y + height + 10}px`;
      }
      this.menu.style.transformOrigin = `${x - menuX}px ${y - menuY + height}px`;

      this.parentElement.appendChild(this.element);
    }

    handlePointerMove(event) {
      if (!this.menu || !this.element) {
        return;
      }
      if (!this.isHolding || !this.isDragging) {
        return;
      }

      const progress = Math.min(
        1,
        Math.max(
          0.75,
          0.75 + (this.calculateDistance(this.startX, this.startY, event.clientX, event.clientY) / 75) * 0.25
        )
      );
      this.menu.style.setProperty('--force-touch-progress', progress);
    }

    calculateDistance(x1, y1, x2, y2) {
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      return distance;
    }

    handlePointerUp() {
      if (!this.element || !this.isHolding || !this.isDragging) {
        return;
      }
      if (this.type === 'menu') {
        this.menu.classList.remove('visible');
      }
      this.element.classList.remove('hold');
      this.isHolding = false;
      this.isDragging = false;

      if (!this.isReady) {
        return;
      }
      this.element.classList.add('lift');
      this.element.addEventListener('animationend', () => {
        this.element.classList.remove('lift');
      });
    }

    update() {
      requestAnimationFrame(this.update.bind(this));

      if (!this.element || !this.isHolding || !this.isDragging || this.type !== 'menu') {
        return;
      }

      const x = this.element.getBoundingClientRect().left;
      const y = this.element.getBoundingClientRect().top;
      const width = this.element.getBoundingClientRect().width;
      const height = this.element.getBoundingClientRect().height;
      const menuX = this.menu.getBoundingClientRect().left;
      const menuY = this.menu.getBoundingClientRect().top;
      const menuWidth = this.menu.getBoundingClientRect().height;

      if (this.startOffsetX > window.innerWidth / 2) {
        this.menu.style.translate = `${x + width - menuWidth}px ${y + height + 10}px`;
      } else {
        this.menu.style.translate = `${x}px ${y + height + 10}px`;
      }
      this.menu.style.transformOrigin = `${x - menuX}px ${y - menuY + height}px`;
    }
  }

  OrchidJS.ForceTouch = ForceTouch;
})(window);
