!(function (exports) {
  'use strict';

  const Friends = {
    friendsList: document.getElementById('friends-list'),
    peopleList: document.getElementById('people-list'),
    chatName: document.getElementById('chat-name'),
    chatAvatar: document.getElementById('chat-avatar'),

    noContactsScreen: document.getElementById('empty-screen-no-contacts'),
    noAccountScreen: document.getElementById('empty-screen-no-account'),

    init: async function () {
      this.populateSkeletonPolymer();

      if ('_os' in window) {
        this.noContactsScreen.classList.remove('visible');
        if (await _os.isLoggedIn()) {
          this.noAccountScreen.classList.remove('visible');
          _os.auth.getFriends(await _os.userID()).then((data) => {
            if (data) {
              this.populateFriends(data);
              RippleEffect.addRippleEffect('#friends-list li');
              this.noContactsScreen.classList.remove('visible');
            } else {
              this.friendsList.innerHTML = '';
              this.noContactsScreen.classList.add('visible');
            }
          });
        } else {
          this.friendsList.innerHTML = '';
          this.noAccountScreen.classList.add('visible');
        }
      } else {
        this.friendsList.innerHTML = '';
        this.noContactsScreen.classList.add('visible');
      }
    },

    populateFriends: function (friends) {
      this.friendsList.innerHTML = '';
      for (let index = 0; index < friends.length; index++) {
        const friend = friends[index];

        const element = document.createElement('li');
        element.classList.add('hbox');
        element.dataset.pageId = 'chat';
        element.addEventListener('click', () => this.handleFriendClick(friend));
        this.friendsList.appendChild(element);
        PageController.init();

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

        _os.auth.getAvatar(friend.friend_id).then((data) => {
          avatar.src = data;
        });
        _os.auth.getUsername(friend.friend_id).then((data) => {
          username.textContent = data;
        });
        _os.auth.getLiveStatus(friend.friend_id, (data) => {
          if (!data.status && !data.text) {
            status.style.display = 'none';
            return;
          }
          status.textContent = data.text;
          status.style.display = 'block';
        });
        _os.auth.getLiveState(friend.friend_id, (data) => {
          avatarActivity.classList.add(data);
        });
      }
    },

    populateSkeletonPolymer: function () {
      this.friendsList.innerHTML = '';
      for (let index = 0; index < 16; index++) {
        const element = document.createElement('li');
        element.classList.add('noclick');
        element.dataset.pageId = 'chat';
        element.addEventListener('click', () => this.handleFriendClick(friend));
        this.friendsList.appendChild(element);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        username.textContent = `Username ${Math.random() * 32767}`;
        username.classList.add('pack-skeleton');
        textHolder.appendChild(username);
      }
    },

    handleFriendClick: function (friend) {
      _os.auth.getUsername(friend.friend_id).then((data) => {
        this.chatName.textContent = data;
      });
      _os.auth.getAvatar(friend.friend_id).then((data) => {
        this.chatAvatar.src = data;
      });
      Chat.initializeChannel(friend.token);
    }
  };

  Friends.init();
})(window);
