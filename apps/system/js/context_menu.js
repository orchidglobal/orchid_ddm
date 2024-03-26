!(function (exports) {
  'use strict';

  const ContextMenu = {
    screen: document.getElementById('screen'),
    overlay: document.getElementById('context-menu'),
    containerElement: document.getElementById('context-menu-content-items'),

    activeButton: null,

    LOCALIZED_KEYBINDS: ['meta', 'ctrl', 'alt', 'shift', 'enter', 'space', 'menu'],
    SOUND_CLICK: new Audio('/resources/sounds/menu_click.wav'),

    /**
     * Shows the context menu at the specified position with the given items.
     *
     * @param {number} x
     * @param {number} y
     * @param {Array} array
     * @param {HTMLElement} [button]
     */
    show: function (x, y, array, button = null) {
      if (this.screen) {
        // Add class to fullscreen element
        this.screen.classList.add('context-menu-visible');
      } else {
        // Add class to document.body element
        document.body.classList.add('context-menu-visible');
      }

      // Add class to the overlay element
      this.overlay.classList.add('visible');

      // Empty the container element
      this.containerElement.innerHTML = '';

      // Add click event listener
      document.addEventListener('click', this.onClick.bind(this));

      // Add click event listener to the overlay element
      this.overlay.addEventListener('click', this.onMenuClick.bind(this));

      // Create the context menu items
      this.createList(array, this.containerElement, x, y);

      if (button) {
        // Add class to the button
        button.classList.add('active');

        // Store the active button
        this.activeButton = button;
      } else {
        // No active button
        this.activeButton = null;
      }
    },

    /**
     * Creates a list of items to be displayed in a context menu.
     *
     * @param {Array} items
     *        The list of items to be displayed in the context menu.
     * @param {Element} parentElement
     *        The element to which the list of items will be appended.
     * @param {Number} x
     *        The x-coordinate of the context menu.
     * @param {Number} y
     *        The y-coordinate of the context menu.
     */
    createList: function (items, parentElement, x, y) {
      const fragment = document.createDocumentFragment(); // A fragment is a lightweight, detached node.

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        if (item.hidden) { // If the item should not be displayed,
          continue;        // continue to the next iteration of the loop.
        }

        const listItem = document.createElement('li'); // Create a new list item.
        listItem.addEventListener('pointerdown', this.onPointerDown.bind(this)); // Add event listeners to the list item.
        listItem.addEventListener('pointerup', this.onPointerUp.bind(this));
        listItem.addEventListener('pointerenter', (event) => this.onPointerEnter(event, listItem));
        listItem.addEventListener('pointerleave', (event) => this.onPointerLeave(event, listItem));
        fragment.appendChild(listItem); // Add the list item to the fragment.

        listItem.addEventListener('pointerup', item.onclick); // Add a click listener to the list item.

        switch (item.type) { // Switch between different types of menu items.
          case 'separator':
            listItem.classList.add('separator'); // If the item is a separator, add the appropriate CSS class.
            break;

          case 'nav':
            listItem.classList.add('nav'); // If the item is a navigation item,

            const sublist = document.createElement('ul'); // Create a sublist element
            listItem.appendChild(sublist); // and add it as a child of the list item.

            this.createList(item.buttons, sublist, x, y); // Recursively call createList with the sublist element, x, and y coordinates.
            break;

          default:
            const itemName = document.createElement('span'); // Create a new span element to contain the name of the item.
            if (item.l10nId) { // If the item has a l10nId,
              itemName.dataset.l10nId = item.l10nId; // set the l10nId as a data attribute.
              listItem.appendChild(itemName); // Add the itemName element to the list item.

              if (item.l10nArgs) { // If the item has l10nArgs,
                itemName.dataset.l10nArgs = JSON.stringify(item.l10nArgs); // set the l10nArgs as a data attribute.
              }
            } else if (item.name) { // If the item has a name but no l10nId,
              itemName.textContent = item.name; // set the name as the textContent of the itemName element.
              listItem.appendChild(itemName); // Add the itemName element to the list item.
            }

            if (item.disabled) { // If the item is disabled,
              listItem.setAttribute('disabled', ''); // add the disabled attribute to the list item.
            }
            if (item.icon) { // If the item has an icon,
              listItem.dataset.icon = item.icon; // set the icon as a data attribute.
            }
            if (item.isNewlyAdded) { // If the item is newly added,
              const newMark = document.createElement('span'); // create a new span element,
              newMark.classList.add('new'); // add the appropriate CSS class,
              newMark.dataset.l10nId = 'new'; // and set the l10nId as a data attribute.
              listItem.appendChild(newMark); // Add
            }
            if (item.keybind) {
              const keybind = document.createElement('span');
              keybind.classList.add('keybind');
              keybind.textContent = item.keybind.map((a) => (this.LOCALIZED_KEYBINDS.indexOf(a) !== -1 ? OrchidJS.L10n.get(`keybinds-${a}`) : a)).join('+');
              listItem.appendChild(keybind);
            }
            break;
        }
      }

      parentElement.appendChild(fragment);

      requestAnimationFrame(() => {
        if (x >= window.innerWidth / 2) {
          if (this.activeButton) {
            this.overlay.style.left = x - this.overlay.offsetWidth + this.activeButton.getBoundingClientRect().width + 'px';
          } else {
            this.overlay.style.left = x - this.overlay.offsetWidth + 'px';
          }
        } else {
          if (document.dir === 'rtl' && this.activeButton) {
            this.overlay.style.left = x - this.activeButton.getBoundingClientRect().width + 'px';
          } else {
            this.overlay.style.left = x + 'px';
          }
        }

        if (y >= window.innerHeight - this.overlay.getBoundingClientRect().height) {
          this.overlay.style.top = y - this.overlay.getBoundingClientRect().height + 'px';
          if (this.overlay.offsetTop <= 0) {
            this.overlay.style.top = 0;
          }
        } else {
          this.overlay.style.top = y + 'px';
        }
      });
    },

    /**
     * Hide the context menu when it is clicked
     *
     * @param {MouseEvent} event - The click event
     */
    onClick: function (event) { // eslint-disable-line no-unused-vars
      // Hide the context menu when it is clicked
      this.hide(); // Hide the context menu
    },

    /**
     * Handle a pointer down event on the context menu
     *
     * @param {PointerEvent} event - The pointer down event
     */
    onPointerDown: function (event) {
      /**
       * Flag indicating whether the context menu is being dragged
       * @type {boolean}
       */
      this.isDragging = true;
      /**
       * The context menu element
       * @type {HTMLElement}
       */
      this.overlay.classList.add('dragging'); // Add a dragging class to the context menu to allow for custom dragging styles
    },

    /**
     * Handle a pointer up event on the context menu
     *
     * @param {PointerEvent} event - The pointer up event
     */
    onPointerUp: function (event) { // eslint-disable-line no-unused-vars
      /**
       * Flag indicating whether the context menu is being dragged
       * @type {boolean}
       */
      this.isDragging = false;

      /**
       * The context menu element
       * @type {HTMLElement}
       */
      this.overlay.classList.remove('dragging'); // Remove the dragging class from the context menu
    },

    /**
     * Handle a pointer enter event on a context menu item
     *
     * @param {PointerEvent} event - The pointer enter event
     * @param {HTMLElement} element - The element that was entered
     */
    onPointerEnter: function (event, element) {
      // If we are not currently dragging the context menu, do not
      // activate the item
      if (!this.isDragging) {
        return;
      }

      // Add the active class to the element to indicate it is being hovered
      element.classList.add('active');

      // Play a click sound to indicate the item was selected
      this.SOUND_CLICK = new Audio('/resources/sounds/menu_click.wav');
      this.SOUND_CLICK.currentTime = 0;
      this.SOUND_CLICK.play();
    },

    /**
     * Handle a pointer leave event on a context menu item
     *
     * @param {PointerEvent} event - The pointer leave event
     * @param {HTMLElement} element - The element that was left
     */
    onPointerLeave: function (event, element) {
      // If we are not currently dragging the context menu, do not
      // deactivate the item
      if (!this.isDragging) {
        return;
      }

      // Remove the active class from the element to indicate it is no
      // longer being hovered
      element.classList.remove('active');
    },

    /**
     * Handle a click event on a context menu item
     *
     * @param {MouseEvent} event - The click event
     */
    onMenuClick: function (event) {
      event.stopPropagation();
    },

    /**
     * Hide the context menu
     */
    hide: function () {
      // Remove the visibility class from the screen or body element,
      // depending on whether or not the context menu is a child of a screen
      if (this.screen) {
        this.screen.classList.remove('context-menu-visible');
      } else {
        document.body.classList.remove('context-menu-visible');
      }

      // Remove the visible class from the overlay
      this.overlay.classList.remove('visible');

      // Remove the active class from the currently active button (if there is
      // one)
      if (this.activeButton) {
        this.activeButton.classList.remove('active');
      }
    }
  };

  exports.ContextMenu = ContextMenu;
})(window);
