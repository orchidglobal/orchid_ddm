!(function (exports) {
  'use strict';

  if ('Scrollbar' in window) {
    Scrollbar.use(OverscrollPlugin);
  }

  const Panel = {
    panels: null,

    init: function () {
      this.panels = document.querySelectorAll('[role="panel"]');
      this.bindScrollEvents();
    },

    bindScrollEvents: function () {
      this.panels.forEach((panel) => {
        const header = panel.querySelector(':scope > header:first-child');
        const backButton = panel.querySelector(':scope > header:first-child .back-button');
        const content = panel.querySelector(':scope > section');
        if (!content) {
          return;
        }

        document.addEventListener('localized', () => {
          setTimeout(() => {
            if (backButton) {
              header.style.setProperty('--back-button-width', (backButton.scrollWidth + 15) + 'px');
            }
          }, 1000);
        });

        const children = content.querySelectorAll(':scope > *');
        children.forEach((child, index) => {
          child.style.transitionDelay = 300 + index * 30 + 'ms';
        });

        if ('Scrollbar' in window) {
          const scrollbar = Scrollbar.init(content, {
            plugins: {
              overscroll: {
                effect: 'bounce',
                onScroll: (params) => {
                  if (params.y >= 0) {
                    return;
                  }

                  const scrollPosition = params.y * -1;
                  let progress = scrollPosition / 300;
                  if (progress >= 1) {
                    progress = 1;
                  }

                  if (backButton) {
                    header.style.setProperty('--back-button-width', (backButton.scrollWidth + 15) + 'px');
                  }

                  this.setOverscrollProgress(panel, progress);
                }
              }
            }
          });

          scrollbar.addListener(() => {
            const scrollPosition = scrollbar.offset.y;
            let progress = scrollPosition / 40;
            if (progress >= 1) {
              progress = 1;
            }

            if (backButton) {
              header.style.setProperty('--back-button-width', (backButton.scrollWidth + 15) + 'px');
            }

            this.setProgress(panel, progress);
            this.setOverscrollProgress(panel, 0);
          });
        }

        content.addEventListener('scroll', () => {
          const scrollPosition = content.scrollTop;
          let progress = scrollPosition / 80;
          if (progress >= 1) {
            progress = 1;
          }

          if (backButton) {
            header.style.setProperty('--back-button-width', (backButton.scrollWidth + 15) + 'px');
          }
          this.setProgress(panel, progress);
        });

        ['wheel', 'pointerdown', 'pointermove', 'pointerup'].forEach(eventType => {
          content.addEventListener(eventType, () => {
            if (backButton) {
              header.style.setProperty('--back-button-width', (backButton.scrollWidth + 15) + 'px');
            }
          });
        });
      });
    },

    // Set progress value on the header bar
    setProgress: function (panel, progress) {
      panel.style.setProperty('--progress', progress);
    },

    setOverscrollProgress: function (panel, progress) {
      panel.style.setProperty('--overscroll-progress', progress);
    }
  };

  // Initialize the Panel object
  Panel.init();
})(window);
