!(function (exports) {
  'use strict';

  const DynamicToaster = {
    element: document.getElementById('dynamic-toaster'),

    smallContent: document.getElementById('dynamic-toaster-small'),
    smallIcon: document.getElementById('dynamic-toaster-small-icon'),
    smallAnimation: document.getElementById('dynamic-toaster-small-animation'),
    smallLabel: document.getElementById('dynamic-toaster-small-label'),

    bigIcon: document.getElementById('dynamic-toaster-big-icon'),
    bigAnimation: document.getElementById('dynamic-toaster-big-animation'),
    bigTitle: document.getElementById('dynamic-toaster-big-title'),
    bigDetail: document.getElementById('dynamic-toaster-big-detail'),
    bigButtons: document.getElementById('dynamic-toaster-big-buttons'),

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
      this.screen.classList.add('dynamic-toaster-visible');

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
    },

    hide: function () {
      this.isVisible = false;
      this.element.classList.remove('visible', 'expanded');
    }
  };

  DynamicToaster.init();

  exports.DynamicToaster = DynamicToaster;
})(window);
