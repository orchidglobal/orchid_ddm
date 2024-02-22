!(function (exports) {
  'use strict';

  class StatusbarBatteryIcon extends StatusbarIcon {
    constructor (parent) {
      super('battery', parent);
    }

    initialize () {
      this.percentageElement = document.createElement('div');
      this.percentageElement.classList.add(`statusbar-${this.id}-percentage`);
      this.parent.appendChild(this.percentageElement);

      navigator.getBattery().then((battery) => {
        this.battery = battery;
        this.update();

        ['chargingchange', 'levelchange'].forEach((event) => {
          this.battery = battery;
          this.update();
        });
      });
    }

    update () {
      if (!this.battery) {
        return;
      }

      let level = this.battery.level;
      let charging = this.battery.charging;
      if (charging) {
        this.element.dataset.icon = `battery-charging-${Math.round(level * 10) * 10}`;
      } else {
        this.element.dataset.icon = `battery-${Math.round(level * 10) * 10}`;
      }
      this.percentageElement.dataset.l10nId = 'batteryStatusPercentage';
      this.percentageElement.dataset.l10nArgs = `{"value":"${Math.round(level * 100)}"}`;

      this.percentageElement.style.setProperty('--hide-margin', `-${this.percentageElement.scrollWidth / 2}px`);
      document.addEventListener('localized', () => {
        this.percentageElement.style.setProperty('--hide-margin', `-${this.percentageElement.scrollWidth / 2}px`);
      });
    }
  }

  exports.StatusbarBatteryIcon = StatusbarBatteryIcon;
})(window);
