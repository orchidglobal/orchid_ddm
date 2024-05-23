!(function (exports) {
  'use strict';

  const About = {
    logo: document.getElementById('about-logo'),
    hostname: document.getElementById('about-hostname'),
    systemName: document.getElementById('about-systemName'),
    systemVersion: document.getElementById('about-systemVersion'),
    hardwareId: document.getElementById('about-hardwareId'),
    arch: document.getElementById('about-arch'),
    endianness: document.getElementById('about-endianness'),
    type: document.getElementById('about-type'),

    EASTER_EGG_MANIFEST_URL: `http://easteregg.localhost:9920/manifest.json`,

    init: function () {
      this.logo.addEventListener('dblclick', this.onDoubleClick.bind(this));

      this.hostname.textContent = DeviceInformation.getHostname();
      this.systemName.textContent = L10n.get('brandShortName');
      this.systemVersion.textContent = Environment.version;
      this.hardwareId.textContent = DeviceInformation.getHardwareId();
      this.arch.textContent = DeviceInformation.getArch();
      this.endianness.textContent = DeviceInformation.getEndianness();
      this.type.textContent = DeviceInformation.getType();

      window.addEventListener('deviceorientation', this.handleOrientation.bind(this));
    },

    onDoubleClick: function (event) {
      this.logo.classList.add('activate');
      this.logo.addEventListener('animationend', () => {
        this.logo.classList.remove('activate');
        IPC.send('message', {
          type: 'launch',
          manifestUrl: this.EASTER_EGG_MANIFEST_URL
        })
      });
    },

    handleOrientation: function (event) {
      const hue = (event.gamma + 90) / 180 * 360;
      this.logo.style.filter = `hue-rotate(${hue}deg)`;
    }
  };

  SettingsApp.About = About;
})(window);
