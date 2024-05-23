!(function (exports) {
  'use strict';

  const people = {
    peopleList: document.getElementById('people-list'),

    init: async function () {
      this.populateSkeletonPolymer();

      if ('_os' in window) {
        if (await _os.isLoggedIn()) {
          this.peopleList.innerHTML = '';
          _os.auth.getAllUsers().then((data) => {
            data.forEach(item => {
              if (data) {
                this.populatePeople(item);
              }
            });
          });
        }
      }
    },

    populatePeople: function (people) {
      this.peopleList.innerHTML = '';
      for (let index = 0; index < people.length; index++) {
        const person = people[index];

        const element = document.createElement('li');
        element.classList.add('hbox');
        this.peopleList.appendChild(element);

        const avatarHolder = document.createElement('div');
        avatarHolder.classList.add('avatar');
        element.appendChild(avatarHolder);

        const avatar = document.createElement('img');
        avatarHolder.appendChild(avatar);

        const avatarActivity = document.createElement('div');
        avatarActivity.classList.add('activity');
        avatarHolder.appendChild(avatarActivity);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        textHolder.appendChild(username);

        const status = document.createElement('p');
        textHolder.appendChild(status);

        avatar.src = person.avatar;
        username.textContent = person.username;
        if (!person.status.status && !person.status.text) {
          status.style.display = 'none';
          return;
        }
        status.textContent = person.status.text;
        status.style.display = 'block';

        avatarActivity.classList.add(person.status.status);
      }
    },

    populateSkeletonPolymer: function () {
      this.peopleList.innerHTML = '';
      for (let index = 0; index < 16; index++) {
        const element = document.createElement('li');
        element.classList.add('noclick');
        this.peopleList.appendChild(element);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        username.textContent = `Username ${Math.random() * 32767}`;
        username.classList.add('pack-skeleton');
        textHolder.appendChild(username);
      }
    }
  };

  people.init();
})(window);
