!(function (exports) {
  'use strict';

  class MonthCalendarGrid {
    constructor(element, year, month) {
      this.element = element;
      this.year = year;
      this.month = month;
      this.daysInMonth = new Date(year, month + 1, 0).getDate();
      this.firstDayOfMonth = new Date(year, month, 1).getDay();
      this.currentDay = new Date().getDate();
      this.currentMonth = new Date().getMonth();

      this.renderCalendar();
    }

    generateCalendar() {
      const calendarGrid = [];

      // Days from the previous month
      const daysFromPrevMonth = this.firstDayOfMonth === 0 ? 6 : this.firstDayOfMonth - 1;
      const prevMonthLastDay = new Date(this.year, this.month, 0).getDate();

      for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
        calendarGrid.push({ day: i, isCurrentMonth: false });
      }

      // Days from the current month
      for (let i = 1; i <= this.daysInMonth; i++) {
        calendarGrid.push({ day: i, isCurrentMonth: true });
      }

      // Days from the next month
      const daysFromNextMonth = 42 - calendarGrid.length;

      for (let i = 1; i <= daysFromNextMonth; i++) {
        calendarGrid.push({ day: i, isCurrentMonth: false });
      }

      return calendarGrid;
    }

    renderCalendar() {
      this.element.innerHTML = '';

      if (this.month === this.currentMonth) {
        this.element.parentElement.classList.add('current-month');
      }
      const calendarGrid = this.generateCalendar();

      for (let i = 0; i < calendarGrid.length; i += 7) {
        const weekRow = document.createElement('tr');

        for (let j = i; j < i + 7; j++) {
          const dayCell = document.createElement('td');
          dayCell.textContent = calendarGrid[j].day;

          if (!calendarGrid[j].isCurrentMonth) {
            dayCell.classList.add('prev-month', 'next-month');
          }

          if (calendarGrid[j].day === this.currentDay && calendarGrid[j].isCurrentMonth && this.month === this.currentMonth) {
            dayCell.classList.add('current-day');
          }

          weekRow.appendChild(dayCell);
        }

        this.element.appendChild(weekRow);
      }
    }
  }

  exports.MonthCalendarGrid = MonthCalendarGrid;
})(window);
