!(function (exports) {
  'use strict';

  const Calculator = {
    displayInput: document.getElementById('display-input'),
    historyList: document.getElementById('history-list'),
    buttons: null,

    inputData: '',
    inputProgrammaticData: '',
    historyData: [],

    MATH_SYMBOLS: {
      '÷': '/',
      '×': '*',
      '+': '+',
      '-': '-',
      'sin': 'Math.sin(',
      'cos': 'Math.cos(',
      'tan': 'Math.tan(',
      'abs': 'Math.abs(',
      'round': 'Math.round('
    },

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
            this.inputProgrammaticData = '';
            this.displayInput.textContent = this.inputProgrammaticData;
            break;

          case '=':
            try {
              const equation = eval(this.inputProgrammaticData);
              this.historyData.push({
                input: this.inputData,
                equation
              });
              localStorage.setItem('calculator.history', JSON.stringify(this.historyData));
              this.inputData = equation;
            } catch (error) {
              this.inputData = 'Error';
            }
            Counter.increment(this.displayInput, this.inputProgrammaticData);
            break;

          default:
            break;
        }
      } else if (button.dataset.type === 'operator') {
        switch (buttonValue) {
          case '÷':
            this.inputData += '/';
            this.inputProgrammaticData += '÷';
            break;

          case '×':
            this.inputData += '*';
            this.inputProgrammaticData += '×';
            break;

          case '+':
            this.inputData += '+';
            this.inputProgrammaticData += '+';
            break;

          case '-':
            this.inputData += '-';
            this.inputProgrammaticData += '-';
            break;

          default:
            break;
        }
        this.displayInput.textContent = this.inputProgrammaticData;
      } else {
        this.inputData += buttonValue;
        this.inputProgrammaticData += buttonValue;
        this.displayInput.textContent = this.inputProgrammaticData;
        if (!this.hasUnclosedParentheses(this.inputData)) {
          const parentheses = document.createElement('span');
          parentheses.classList.add('autofill');
          parentheses.textContent = ')';
          this.displayInput.appendChild(parentheses);
        }
      }

      this.updateHistoryList();
    },

    updateHistoryList: function () {
      this.historyList.innerHTML = '';

      for (let index = 0; index < this.historyData.reverse().length; index++) {
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
      this.historyData.reverse();
    },

    hasUnclosedParentheses: function (inputString) {
      const stack = [];

      for (let char of inputString) {
          if (char === '(') {
              stack.push(char);
          } else if (char === ')') {
              if (stack.length === 0) {
                  return false;  // Found a closing parenthesis without a matching opening parenthesis
              }
              stack.pop();
          }
      }

      return stack.length === 0;  // If the stack is empty, all parentheses are closed
  }
  };

  Calculator.init();
})(window);
