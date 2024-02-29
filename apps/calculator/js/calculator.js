!(function (exports) {
  'use strict';

  const Calculator = {
    displayInput: document.getElementById('display-input'),
    historyList: document.getElementById('history-list'),
    buttons: null,

    inputData: '',
    historyData: [],

    init: function () {
      this.historyData = JSON.parse(localStorage.getItem('calculator.history')) || [];

      this.buttons = document.querySelectorAll('input[data-type]');
      this.buttons.forEach(this.handleEachButton.bind(this));

      this.updateHistoryList();
    },

    handleEachButton: function (button) {
      button.addEventListener('click', this.handleButtonClick.bind(this, button));
    },

    handleButtonClick: function (button, event) {
      var buttonValue = button.value;

      if (button.dataset.type === 'command') {
        switch (buttonValue) {
          case 'C':
            this.inputData = '';
            this.displayInput.textContent = this.inputData;
            break;

          case '=':
            try {
              const equation = eval(this.inputData);
              this.historyData.push({
                input: this.inputData,
                equation
              });
              localStorage.setItem('calculator.history', JSON.stringify(this.historyData));
              this.inputData = equation;
            } catch (error) {
              this.inputData = 'Error';
            }
            Counter.increment(this.displayInput, this.inputData);
            break;

          default:
            break;
        }
      } else if (button.dataset.type === 'operator') {
        switch (buttonValue) {
          case '÷':
            this.inputData += '/';
            break;

          case '×':
            this.inputData += '*';
            break;

          case '+':
            this.inputData += '+';
            break;

          case '-':
            this.inputData += '-';
            break;

          default:
            break;
        }
        this.displayInput.textContent = this.inputData;
      } else {
        this.inputData += buttonValue;
        this.displayInput.textContent = this.inputData;
      }

      this.updateHistoryList();
    },

    updateHistoryList: function () {
      this.historyList.innerHTML = '';

      for (let index = 0; index < this.historyData.length; index++) {
        const item = this.historyData[index];

        const list = document.createElement('ul');
        this.historyList.appendChild(list);

        const element = document.createElement('li');
        element.classList.add('noclick');
        list.appendChild(element);

        const equation = document.createElement('p');
        equation.textContent = item.equation;
        element.appendChild(equation);

        const input = document.createElement('p');
        input.textContent = item.input;
        element.appendChild(input);
      }
    }
  };

  Calculator.init();
})(window);
