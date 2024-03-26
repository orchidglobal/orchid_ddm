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
    scrollX: 0,
    scrollY: 0,
    isScrolling: false,
    isMomentumScrolling: false,
    contentElement: null,
    scrollElement: null,
    heldElement: null,
    velocityX: 0,
    velocityY: 0,
    isWobbly: false,

    init: function (content, scroller, isWobbly) {
      this.contentElement = content;
      this.scrollElement = scroller;
      this.isWobbly = isWobbly;

      this.contentElement.addEventListener('pointerdown', this.handlePointerDown.bind(this));
      document.addEventListener('pointermove', this.handlePointerMove.bind(this));
      document.addEventListener('pointerup', this.handlePointerUp.bind(this));

      // Add wheel event listener
      this.contentElement.addEventListener('wheel', this.handleWheel.bind(this));
    },

    handlePointerDown: function (event) {
      event.preventDefault();

      this.heldElement = event.target;
      this.isScrolling = true;
      this.isMomentumScrolling = false;

      this.startX = event.clientX || event.touches[0].clientX;
      this.startY = event.clientY || event.touches[0].clientY;

      this.velocityX = 0;
      this.velocityY = 0;
    },

    handlePointerMove: function (event) {
      if (!this.isScrolling) {
        return;
      }
      event.preventDefault();

      this.offsetX = event.clientX || event.touches[0].clientX;
      this.offsetY = event.clientY || event.touches[0].clientY;

      const deltaX = event.movementX;
      const deltaY = event.movementY;

      if (this.isWobbly) {
        this.scrollX -= deltaX;
        this.scrollY -= deltaY;

        const children = this.scrollElement.children;

        for (let index = 0; index < children.length; index++) {
          const child = children[index];
          const distance = this.calculateDistance(this.heldElement, child);

          child.style.translate = `${Math.round(-this.scrollX)}px ${Math.round(-this.scrollY)}px`;
          if (this.heldElement === child) {
            child.style.transition = '';
          } else {
            child.style.transition = `translate ${0.5 * distance}s ease`;
          }
        }
      } else {
        this.scroll(deltaX, deltaY, false);
      }

      this.velocityX = deltaX;
      this.velocityY = deltaY;
    },

    handlePointerUp: function (event) {
      if (!this.isScrolling) {
        return;
      }
      event.preventDefault();

      this.heldElement = null;
      this.isScrolling = false;
      this.isMomentumScrolling = true;

      this.animateMomentumScroll();
    },

    calculateDistance: function (element1, element2) {
      // Function to calculate the distance between two points
      function calculateDistance(point1, point2) {
        const deltaX = point2.x - point1.x;
        const deltaY = point2.y - point1.y;

        return Math.sqrt(deltaX ** 2 + deltaY ** 2);
      }

      // Function to get the position of an element relative to the window
      function getPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY
        };
      }

      const position1 = getPosition(element1);
      const position2 = getPosition(element2);

      const distance = calculateDistance(position1, position2);
      const windowSize = Math.max(window.innerWidth, window.innerHeight);

      // Normalize the distance between 0 and 1
      const normalizedDistance = distance / windowSize;

      return normalizedDistance;
    },

    animateMomentumScroll: function () {
      const decay = 0.95; // Adjust the decay factor as needed
      const threshold = 0.5; // Adjust the threshold as needed

      const animate = () => {
        if (!this.isMomentumScrolling) {
          return;
        }

        this.velocityX *= decay;
        this.velocityY *= decay;

        if (Math.abs(this.velocityX) > threshold || Math.abs(this.velocityY) > threshold) {
          this.scroll(this.velocityX, this.velocityY, false);
          requestAnimationFrame(animate);
        } else {
          this.isMomentumScrolling = false;
        }
      };

      animate();
    },

    handleWheel: function (event) {
      event.preventDefault();

      const deltaX = -event.deltaX * 0.1;
      const deltaY = -event.deltaY * 0.1;

      if (event.shiftKey) {
        this.velocityX += deltaY;
        this.velocityY += deltaX;
      } else {
        this.velocityX += deltaX;
        this.velocityY += deltaY;
      }

      if (!this.isMomentumScrolling) {
        this.isScrolling = false;
        this.isMomentumScrolling = true;

        this.animateMomentumScroll();
      }
    },

    scroll: function name(x, y) {
      const scrollWidth = this.scrollElement.offsetWidth - this.contentElement.offsetWidth;
      const scrollHeight = this.scrollElement.offsetHeight - this.contentElement.offsetHeight;

      this.scrollX -= x;
      this.scrollY -= y;

      console.log(this.scrollX, this.scrollY);
      if (this.scrollX <= 0) {
        this.handleOverscroll();
      }
      if (this.scrollY <= 0) {
        this.handleOverscroll();
      }
      if (this.scrollX >= scrollWidth) {
        this.handleOverscroll();
      }
      if (this.scrollY >= scrollHeight) {
        this.handleOverscroll();
      }

      this.scrollElement.style.translate = `${Math.round(-this.scrollX)}px ${Math.round(-this.scrollY)}px`;
      this.scrollElement.style.transition = null;
    },

    handleOverscroll: function () {
      const bounceDuration = 0.5; // Adjust the bounce duration as needed

      this.animateOverscrollBounce(bounceDuration);
    },

    animateOverscrollBounce: function (duration) {
      const startScrollX = this.scrollX;
      const startScrollY = this.scrollY;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);

        this.scrollX = startScrollX + this.velocityX * progress;
        this.scrollY = startScrollY + this.velocityY * progress;

        this.scrollElement.style.translate = `${Math.round(-this.scrollX)}px ${Math.round(-this.scrollY)}px`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  };

  Scrolling.init(document.querySelector('#content'), document.querySelector('#scroller'), false);

  OrchidJS.Scrolling = Scrolling;
})(window);
