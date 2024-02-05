!(function (exports) {
  'use strict';

  const Month = {
    yearGrid: document.getElementById('year-grid'),
    tabButton: document.getElementById('month-tab-button'),
    label: document.getElementById('month-label'),
    grid: document.getElementById('month-grid'),
    gridBody: document.getElementById('month-grid-body'),

    init: function () {
      const dateLabel = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });

      this.label.textContent = dateLabel;
      this.monthCalendarGrid = new MonthCalendarGrid(this.gridBody, new Date().getFullYear(), new Date().getMonth());

      this.tabButton.addEventListener('click', this.handleTabButton.bind(this));
    },

    handleTabButton: function () {
      if (Calendar.currentPage === 'year') {
        const currentYearMonth = this.yearGrid.querySelector('.current-month');
        Transitions.scale(currentYearMonth, this.grid);
      }

      Calendar.currentPage = 'month';
    }
  };

  Month.init();

  exports.Month = Month;
})(window);
