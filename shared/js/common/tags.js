!(function (exports) {
  'use strict';

  if (!('OrchidJS' in window)) {
    exports.OrchidJS = {};
  }

  class Tags {
    constructor(element) {
      this.element = element;
      this.tags = [];

      this.createInput();
    }

    createInput() {
      this.input = document.createElement('span');
      this.input.contentEditable = true;
      this.input.addEventListener('keydown', this.handleKeyDown.bind(this));
      this.element.appendChild(this.input);
    }

    handleKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        const tagText = this.input.textContent.trim();

        if (tagText !== '') {
          this.addTag(tagText);
          this.input.textContent = '';
        }
      }
    }

    addTag(tagText) {
      const tag = document.createElement('span');
      tag.classList.add('tag');

      const tagTextElement = document.createElement('span');
      tagTextElement.classList.add('text');
      tagTextElement.textContent = tagText;
      tag.appendChild(tagTextElement);

      const tagRemoveButton = document.createElement('div');
      tagRemoveButton.classList.add('remove-button');
      tagRemoveButton.dataset.icon = 'close';
      tagRemoveButton.addEventListener('click', () => this.removeTag(tag));
      tag.appendChild(tagRemoveButton);

      this.element.insertBefore(tag, this.input);
      this.tags.push(tag);
    }

    removeTag(tag) {
      const index = this.tags.indexOf(tag);
      if (index !== -1) {
        this.tags.splice(index, 1);
      }

      this.element.removeChild(tag);
    }
  }

  OrchidJS.Tags = Tags;
})(window);
