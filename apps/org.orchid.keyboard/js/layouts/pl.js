Keyboards.pl = {
  label: 'Polish',
  shortLabel: 'Pl',
  imEngine: 'latin',
  types: ['text', 'url' , 'email', 'password'],
  autoCorrectLanguage: 'pl',
  menuLabel: 'Polski',
  lang: 'pl',
  alt: {
    a: 'ąáàâäåãāæ',
    c: 'ćčç',
    e: 'ę€éèêëē',
    i: 'ïíìîīį',
    o: 'óöòôōœø',
    u: 'üúùûū',
    s: 'śš$ß',
    S: 'ŚŠŞ',
    n: 'ńñ',
    l: 'ł£',
    y: '¥',
    z: 'żźž',
    '.': ',?!;:…',
    ',': '„”'
  },
  keys: [
    [
      { value: 'q' }, { value: 'w' }, { value: 'e' } , { value: 'r' },
      { value: 't' } , { value: 'y' }, { value: 'u' } , { value: 'i' },
      { value: 'o' }, { value: 'p' }
    ], [
      { value: 'a' }, { value: 's' }, { value: 'd' }, { value: 'f' },
      { value: 'g' } , { value: 'h' }, { value: 'j' }, { value: 'k' },
      { value: 'l' }
    ], [
      { value: '⇪', ratio: 1.5, keyCode: KeyEvent.DOM_VK_CAPS_LOCK },
      { value: 'z' }, { value: 'x' }, { value: 'c' }, { value: 'v' },
      { value: 'b' }, { value: 'n' }, { value: 'm' },
      { value: '⌫', ratio: 1.5, keyCode: KeyEvent.DOM_VK_BACK_SPACE }
    ], [
      { value: '&nbsp', ratio: 8, keyCode: KeyEvent.DOM_VK_SPACE },
      { value: '↵', ratio: 2, keyCode: KeyEvent.DOM_VK_RETURN }
    ]
  ],
  pages: [undefined, {
    alt: {
      '$': [ '€', '£', '¢', '¥'],
      '"': ['“', '”'],
      '\'':['‘', '’'],
      '?': ['¿'],
      '!': ['¡'],
      '+': ['-', '×', '÷', '±']
    },
    // These are based on the en layout.
    keys: [
      [
        { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' },
        { value: '5' }, { value: '6' }, { value: '7' }, { value: '8' },
        { value: '9' }, { value: '0' }
      ], [
        { value: '@' }, { value: '#' },
        { value: '$', className: 'alternate-indicator' }, { value: '&' },
        { value: '*' }, { value: '-' }, { value: '_' }, { value: '/' },
        { value: '(' }, { value: ')' }
      ], [
        { value: 'Alt', ratio: 1.5,
          keyCode: KeyEvent.DOM_VK_ALT,
          className: 'page-switch-key',
          targetPage: 2
        },
        { value: '+',
          supportsSwitching: {
            value: ','
          }
        }, { value: ':' }, { value: ';' }, { value: '"' },
        { value: '\'' }, { value: '!' }, { value: '?' },
        { value: '⌫', ratio: 1.5, keyCode: KeyEvent.DOM_VK_BACK_SPACE }
      ], [
        { value: '&nbsp', ratio: 8, keyCode: KeyEvent.DOM_VK_SPACE },
        { value: '↵', ratio: 2, keyCode: KeyEvent.DOM_VK_RETURN }
      ]
    ]
  } ]
};
