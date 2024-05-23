!(function (exports) {
  'use strict';

  const AppLauncherPaginationDots = {
    gridElement: document.getElementById('launcher-grid'),
    paginationBar: document.getElementById('launcher-paginationBar'),

    DEFAULT_PAGE_INDEX: 0,

    init: function () {
      this.gridElement.addEventListener('scroll', this.handleScroll.bind(this));
    },

    handleScroll: function (event) {
      const scrollLeft = Math.abs(this.gridElement.scrollLeft);
      const pageWidth = this.gridElement.offsetWidth;
      const currentPageIndex = Math.floor(scrollLeft / pageWidth);

      const dots = this.paginationBar.querySelectorAll('.dot');
      for (let i = 0; i < dots.length; i++) {
        dots[i].classList.toggle('active', i === currentPageIndex);
      }
    },

    createDots: function (amount) {
      for (let index = 0; index < amount; index++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        this.paginationBar.appendChild(dot);
      }
    }
  };

  AppLauncherPaginationDots.init();

  exports.AppLauncherPaginationDots = AppLauncherPaginationDots;
})(window);
