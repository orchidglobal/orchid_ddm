!(function (exports) {
  'use strict';

  const Month = {
    yearGrid: document.getElementById('year-grid'),
    tabButton: document.getElementById('month-tab-button'),
    label: document.getElementById('month-label'),
    grid: document.getElementById('month-grid'),
    gridBody: document.getElementById('month-grid-body'),

    init: function () {
      this.monthCalendarGrid = new MonthCalendarGrid(this.gridBody, new Date().getFullYear(), new Date().getMonth());

      document.addEventListener('localized', this.handleLocalization.bind(this));
      this.tabButton.addEventListener('click', this.handleTabButton.bind(this));
    },

    handleLocalization: function () {
      const langCode = OrchidJS.L10n.currentLanguage === 'ar' ? 'ar-SA' : OrchidJS.L10n.currentLanguage;
      const dateLabel = new Date().toLocaleDateString(langCode, {
        year: 'numeric',
        month: 'long'
      });

      this.label.textContent = dateLabel;
    },

    handleTabButton: function () {
      if (Calendar.currentPage === 'year') {
        const currentYearMonth = this.yearGrid.querySelector('.current-month');
        OrchidJS.Transitions.scale(currentYearMonth, this.grid);
      }

      Calendar.currentPage = 'month';
    }
  };

  Month.init();

  exports.Month = Month;
})(window);
