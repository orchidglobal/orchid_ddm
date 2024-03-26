!(function (exports) {
  'use strict';

  const DynamicArea = {
    element: document.getElementById('dynamic-area'),

    smallContent: document.getElementById('dynamic-area-small'),
    smallIcon: document.getElementById('dynamic-area-small-icon'),
    smallAnimation: document.getElementById('dynamic-area-small-animation'),
    smallLabel: document.getElementById('dynamic-area-small-label'),

    bigIcon: document.getElementById('dynamic-area-big-icon'),
    bigAnimation: document.getElementById('dynamic-area-big-animation'),
    bigTitle: document.getElementById('dynamic-area-big-title'),
    bigDetail: document.getElementById('dynamic-area-big-detail'),
    bigButtons: document.getElementById('dynamic-area-big-buttons'),

    timeoutID: null,
    isVisible: false,

    init: function () {
      this.element.addEventListener('click', this.handleClick.bind(this));
    },

    handleClick: function () {
      if (!this.isVisible) {
        return;
      }
      this.element.classList.add('expanded');

      clearTimeout(this.timeoutID);
      this.timeoutID = setTimeout(this.hide.bind(this), 3000);

      this.element.classList.add('enlargen');
      this.element.addEventListener('animationend', () => this.element.classList.remove('enlargen'));
    },

    show: function (label, options = {}) {
      this.isVisible = true;

      clearTimeout(this.timeoutID);
      this.element.classList.add('visible');

      this.timeoutID = setTimeout(this.hide.bind(this), 3000);

      this.element.classList.add('opening');
      this.element.addEventListener('animationend', () => this.element.classList.remove('opening'));

      this.smallIcon.src = options.icon || '';
      this.smallIcon.onerror = () => {
        this.smallIcon.src = '/images/default.svg';
      };

      this.smallLabel.textContent = label;

      this.bigIcon.src = options.icon;
      this.bigIcon.onerror = () => {
        this.bigIcon.src = '/images/default.svg';
      };

      this.bigTitle.textContent = label;
      this.bigDetail.textContent = options.detail || '';

      this.element.style.setProperty('--content-width', `${this.smallContent.offsetWidth}px`);
    },

    hide: function () {
      this.isVisible = false;
      this.element.classList.remove('visible', 'expanded');
    }
  };

  DynamicArea.init();

  exports.DynamicArea = DynamicArea;
})(window);
