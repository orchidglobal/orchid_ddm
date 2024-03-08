!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  const Scrolling = {
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    isScrolling: false,
    contentElement: null,
    scrollElement: null,
    heldElement: null,

    init: function (content, scroller) {
      this.contentElement = content;
      this.scrollElement = scroller;

      this.contentElement.addEventListener('pointerdown', this.handlePointerDown.bind(this));
      document.addEventListener('pointermove', this.handlePointerMove.bind(this));
      document.addEventListener('pointerup', this.handlePointerUp.bind(this));
      // Add touch event listeners
      this.contentElement.addEventListener('touchstart', this.handlePointerDown.bind(this));
      document.addEventListener('touchmove', this.handlePointerMove.bind(this));
      document.addEventListener('touchend', this.handlePointerUp.bind(this));

      // Add wheel event listener
      document.addEventListener('wheel', this.handleWheel.bind(this));
    },

    handlePointerDown: function (event) {
      event.preventDefault();

      this.heldElement = event.target;
      this.isScrolling = true;

      this.startX = event.clientX || event.touches[0].clientX;
      this.startY = event.clientY || event.touches[0].clientY;
    },

    handlePointerMove: function (event) {
      if (!this.isScrolling) {
        return;
      }
      event.preventDefault();

      this.offsetX = event.clientX || event.touches[0].clientX;
      this.offsetY = event.clientY || event.touches[0].clientY;

      let newOffsetX = this.scrollElement.offsetLeft + (this.offsetX - this.startX);
      let newOffsetY = this.scrollElement.offsetTop + (this.offsetY - this.startY);

      // newOffsetX = Math.max(0, newOffsetX);
      // newOffsetY = Math.max(0, newOffsetY);
      // newOffsetX = Math.min(this.scrollElement.getBoundingClientRect().width, newOffsetX);
      // newOffsetY = Math.min(this.scrollElement.getBoundingClientRect().height, newOffsetY);

      this.scrollElement.style.transform = `translate(${newOffsetX}px, ${newOffsetY}px)`;
    },

    handlePointerUp: function (event) {
      if (!this.isScrolling) {
        return;
      }
      event.preventDefault();

      this.heldElement = null;
      this.isScrolling = false;
    },

    handleWheel: function (event) {
      // Adjust scroll position based on wheel event
      this.scrollElement.scrollLeft += event.deltaX;
      this.scrollElement.scrollTop += event.deltaY;

      event.preventDefault();
    }
  };

  Scrolling.init(document.querySelector('#content'), document.querySelector('#scroller'));

  OrchidJS.Scrolling = Scrolling;
})(window);
