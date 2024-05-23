!(function (exports) {
  'use strict';

  const ChangeRingtone = {
    ringtoneList: document.getElementById('change-ringtone-list'),

    init: function () {
      fetch(`http://shared.localhost:9920/resources/ringtones/list.json`)
        .then(response => response.json())
        .then((data) => {
          data.forEach(item => {
            const ringtone = document.createElement('li');
            ringtone.addEventListener('click', () => this.changeRingtone(item.namespace));
            this.ringtoneList.appendChild(ringtone);

            const label = document.createElement('p');
            label.dataset.l10nId = item.namespace;
            ringtone.appendChild(label);
          });
        });
    },

    changeRingtone: function (ringtone) {
      window.Settings.setValue('audio.ringtone', ringtone);
    }
  };

  SettingsApp.ChangeRingtone = ChangeRingtone;
})(window);
