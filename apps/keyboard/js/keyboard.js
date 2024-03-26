!(function (exports) {
  'use strict';

  const Keyboards = {
    suggestions: document.getElementById('suggestions'),
    keys: document.getElementById('keys'),
    toolbar: document.getElementById('toolbar'),
    layoutButton: document.getElementById('layout-button'),
    languages: document.getElementById('languages'),
    languagesList: document.getElementById('languages-list'),

    typingData: '',
    currentLanguage: 'en',
    supportedLanguages: [
      'af',
      'ar',
      'bg-BDS',
      'bg-Pho-Ban',
      'bg-Pho-Trad',
      'bn-Avro',
      'bn-Probhat',
      'bs',
      'ca',
      'cs-qwerty',
      'cs',
      'cy',
      'da',
      'de-Neo',
      'de',
      'dz-BT',
      'el',
      'emoji',
      'en-Africa',
      'en-Colemak',
      'en-Dvorak',
      'en-GB',
      'en-Neo',
      'en',
      'eo',
      'es-Americas',
      'es',
      'eu',
      'fa',
      'ff',
      'fr-CA',
      'fr-CH',
      'fr-Dvorak-bepo',
      'fr',
      'fy',
      'ga',
      'gd',
      'gl',
      'gv',
      'he',
      'hi',
      'hr',
      'hu',
      'ig',
      'it',
      'jp-kanji',
      'ko',
      'lt',
      'lv',
      'mk',
      'my',
      'nb',
      'nl',
      'pl',
      'pt-BR',
      'pt-PT',
      'ro',
      'ru',
      'sk',
      'sq',
      'sr-Cyrl',
      'sr-Latn',
      'sv',
      'ta',
      'te',
      'th',
      'tr-F',
      'tr-Q',
      'vi-Qwerty',
      'vi-Telex',
      'vi-Typewriter',
      'wo',
      'zh-Hans-Handwriting',
      'zh-Hans-Pinyin',
      'zh-Hant-Zhuyin'
    ],

    SOUND_KEY: new Audio('/resources/sounds/key.wav'),
    SOUND_KEY_SPECIAL: new Audio('/resources/sounds/special.wav'),

    init: function () {
      this.supportedLanguages.forEach((language) => {
        LazyLoader.load(`js/layouts/${language}.js`, () => {
          if (language === this.currentLanguage) {
            this.updateKeyboard();
          }
        });
      });

      this.layoutButton.addEventListener('click', this.handleLayoutButton.bind(this));
    },

    updateKeyboard: function () {
      this.languagesList.innerHTML = '';
      this.supportedLanguages.forEach((language) => {
        if (language && language === this.currentLanguage) {
          this.createLayoutKeyset({
            isCapsLock: false
          });
        }

        const element = document.createElement('li');
        element.addEventListener('click', this.handleLanguageItemClick.bind(this, language));
        element.dataset.icon = 'languages';

        const name = document.createElement('p');
        name.textContent = Keyboards[language].menuLabel || Keyboards[language].label;
        element.appendChild(name);

        if (language === this.currentLanguage) {
          const selectedText = document.createElement('p');
          selectedText.textContent = OrchidJS.L10n.get('selected');
          element.appendChild(selectedText);
        }

        this.languagesList.appendChild(element);
      });
    },

    handleLanguageItemClick: function (language) {
      this.currentLanguage = language;
      this.updateKeyboard();
    },

    handleLayoutButton: function () {
      this.languages.classList.toggle('visible');
    },

    createLayoutKeyset: function ({ isCapsLock = false, targetPage = 0 }) {
      const data = Keyboards[this.currentLanguage];
      let keys = data.keys;
      if (data.pages && data.pages[targetPage]) {
        keys = data.pages[targetPage].keys;
      }

      this.typingData = '';
      this.updateSuggestions();

      const symbolsButton = {
        value: targetPage === 0 ? '?123' : data.shortLabel,
        keyCode: KeyEvent.DOM_VK_ALT,
        targetPage: targetPage === 0 ? 1 : 0,
        ratio: 2,
        className: 'special'
      };

      const quickSymbolButton = {
        value: '.',
        className: 'alternate-indicator'
      };

      this.keys.innerHTML = '';

      keys.forEach((row, index) => {
        const keyRow = document.createElement('div');
        keyRow.classList.add('keyboard-row');
        this.keys.appendChild(keyRow);

        if (index === keys.length - 1) {
          row = [symbolsButton, quickSymbolButton, ...row];
        }

        row.forEach((key) => {
          const keyButton = document.createElement('button');
          keyButton.classList.add('key');
          if (key.className) {
            keyButton.classList.add(key.className);
          }
          keyRow.appendChild(keyButton);

          const displayValue = key.value;
          switch (displayValue) {
            case '⇪':
              keyButton.classList.add('special');
              keyButton.classList.add('shift');
              if (isCapsLock) {
                keyButton.classList.add('active');
              }
              break;

            case '⌫':
              keyButton.classList.add('special');
              keyButton.classList.add('backspace');
              break;

            case '↵':
              keyButton.classList.add('return');
              break;

            default:
              break;
          }

          if (isCapsLock) {
            keyButton.innerHTML = displayValue.startsWith('&') ? displayValue : displayValue.toUpperCase();
          } else {
            keyButton.innerHTML = displayValue;
          }
          if (key.ratio) {
            keyButton.style.flex = key.ratio;
          }

          keyButton.addEventListener('pointerdown', () => {
            if (
              key.keyCode === KeyEvent.DOM_VK_CAPS_LOCK ||
              key.keyCode === KeyEvent.DOM_VK_ALT ||
              key.keyCode === KeyEvent.DOM_VK_BACK_SPACE ||
              key.keyCode === KeyEvent.DOM_VK_RETURN
            ) {
              this.SOUND_KEY_SPECIAL.currentTime = 0;
              this.SOUND_KEY_SPECIAL.play();
            } else {
              this.SOUND_KEY.currentTime = 0;
              this.SOUND_KEY.play();
            }

            if (key.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
              IPC.sendToHost('input', {
                type: 'keyboard',
                inputType: 'keyUp',
                keyCode: 'backspace'
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_RETURN) {
              IPC.sendToHost('input', {
                type: 'keyboard',
                inputType: 'keyup',
                keyCode: 'enter'
              });
            }
          });

          keyButton.addEventListener('pointerup', () => {
            if (key.keyCode === KeyEvent.DOM_VK_CAPS_LOCK) {
              this.updateSuggestions();
              this.createLayoutKeyset({
                isCapsLock: !isCapsLock
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_ALT) {
              this.updateSuggestions();
              this.createLayoutKeyset({
                targetPage: key.targetPage
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
              this.typingData.slice(0, -1);
              this.updateSuggestions();
              IPC.sendToHost('input', {
                type: 'keyboard',
                inputType: 'keyUp',
                keyCode: 'backspace'
              });
            } else if (key.keyCode === KeyEvent.DOM_VK_RETURN) {
              this.typingData = '';
              this.updateSuggestions();
              IPC.sendToHost('input', {
                type: 'keyboard',
                inputType: 'keyup',
                keyCode: 'enter'
              });
            } else {
              if (key.value.startsWith('&')) {
                this.typingData = '';
              } else {
                this.typingData += isCapsLock ? key.value.toUpperCase() : key.value;
              }
              this.updateSuggestions();
              IPC.sendToHost('input', {
                type: 'keyboard',
                inputType: 'char',
                keyCode: isCapsLock ? key.value.toUpperCase() : key.value
              });
            }
          });
        });
      });
    },

    updateSuggestions: function () {
      this.suggestions.innerHTML = '';

      const words = this.typingData.trim().split(/\s+/);
      const lastWord = words[words.length - 1].toLowerCase();
      const similarWords = this.findSimilarWords(lastWord);

      for (let index = 0; index < 3; index++) {
        const suggestion = document.createElement('div');
        suggestion.classList.add('suggestion');
        suggestion.classList.toggle('recommend', index === 1);

        const word = index < similarWords.length ? similarWords[index] : '';
        suggestion.textContent = word;

        this.suggestions.appendChild(suggestion);
      }
    },

    findSimilarWords: function (targetWord) {
      const commonWords = [
        'Hi',
        'Hello',
        'How',
        'Are',
        'You',
        'When',
        'Why',
        'Thanks',
        'I',
        'Me',
        'They',
        "They're",
        'He',
        'Him',
        'She',
        'Her',
        'It',
        'That',
        'Whore',
        'Fuck',
        'Bitch',
        'Idiot',
        'Nice',
        'Orchid',
        'Apple',
        'Scamsung',
        'Java',
        'Google',
        'Pretty',
        'Cute',
        'Fancy',
        'Thot',
        'Furry',
        'Fluffy',
        'Dad',
        'Daddy',
        'Mom',
        'Mommy',
        'Wolf',
        'Fox',
        'Cat',
        'Dog',
        'Dragon',
        'Lizard',
        'Hamster',
        'Raccoon',
        'Cow',
        'Orange',
        'Lemon',
        'Red',
        'Blue',
        'Green',
        'Lime',
        'Magenta',
        'Pink',
        'Purple',
        'Brown',
        'White',
        'Black',
        'Gray',
        'Light',
        'Dark',
        'Medium',
        'Small',
        'Nano',
        'Large',
        'Big',
        'Huge',
        'Boom!',
        'Explode',
        'Explosion'
      ];

      // Calculate similarity based on common characters
      const similarities = commonWords.map((word) => ({
        word,
        similarity: this.calculateSimilarity(targetWord, word)
      }));

      // Sort by similarity in descending order
      similarities.sort((a, b) => b.similarity - a.similarity);

      // Return the most similar words
      return similarities.slice(0, 3).map((entry) => entry.word);
    },

    calculateSimilarity: function (a, b) {
      const setA = new Set(a);
      const setB = new Set(b);
      const intersection = new Set([...setA].filter((char) => setB.has(char)));
      const union = new Set([...setA, ...setB]);

      return intersection.size / union.size;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    Keyboards.init();
  });

  exports.Keyboards = Keyboards;
})(window);
