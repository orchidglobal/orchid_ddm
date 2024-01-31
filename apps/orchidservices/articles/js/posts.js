!(function (exports) {
  'use strict';

  const Posts = {
    homePanel: document.getElementById('home'),

    posts: document.getElementById('home-posts'),
    postPanel: document.getElementById('post'),
    backButton: document.getElementById('post-back-button'),

    postAvatar: document.getElementById('post-avatar'),
    postUsername: document.getElementById('post-username'),
    postDate: document.getElementById('post-date'),
    postViews: document.getElementById('post-views'),
    postText: document.getElementById('post-text'),

    init: function () {
      window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));
    },

    handleServicesLoad: function () {
      _os.articles.getRelavantPosts().then((array) => {
        this.posts.innerHTML = '';
        array.forEach((element) => {
          this.populate(element);
        });
      });
      window.removeEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
    },

    populate: function (data) {
      const post = document.createElement('div');
      post.classList.add('post');
      post.addEventListener('click', () => this.openPost(post, data));
      this.posts.appendChild(post);

      const header = document.createElement('div');
      header.classList.add('header');
      post.appendChild(header);

      const iconHolder = document.createElement('div');
      iconHolder.classList.add('icon-holder');
      header.appendChild(iconHolder);

      const icon = document.createElement('img');
      icon.classList.add('icon');
      iconHolder.appendChild(icon);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      header.appendChild(textHolder);

      const username = document.createElement('span');
      username.classList.add('username');
      textHolder.appendChild(username);

      const stats = document.createElement('span');
      stats.classList.add('stats');
      textHolder.appendChild(stats);

      const date = document.createElement('span');
      date.classList.add('date');
      date.textContent = new Date(parseInt(data.time_created)).toLocaleDateString(navigator.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
        minute: 'numeric'
      });
      stats.appendChild(date);

      const statSeparator = document.createElement('div');
      statSeparator.classList.add('separator');
      stats.appendChild(statSeparator);

      const views = document.createElement('span');
      views.classList.add('views');
      if (data.views) {
        views.textContent = data.views.length;
      } else {
        views.textContent = 0;
      }
      stats.appendChild(views);

      icon.src = 'https://orchid-f39a9.web.app/assets/defaultuser.png';
      username.textContent = L10n.get('anonymousUser');
      _os.auth.getAvatar(data.publisher_id).then((data) => {
        icon.src = data;
      });
      _os.auth.getUsername(data.publisher_id).then((data) => {
        username.textContent = data || L10n.get('anonymousUser');
      });

      const content = document.createElement('div');
      content.classList.add('content');
      post.appendChild(content);

      const text = document.createElement('div');
      text.classList.add('text');
      text.innerText = data.content;
      content.appendChild(text);

      if (data.community_notes_content) {
        const communityNotes = document.createElement('div');
        communityNotes.classList.add('community-notes');
        content.appendChild(communityNotes);

        const communityNotesHeader = document.createElement('h3');
        communityNotesHeader.classList.add('header');
        communityNotes.appendChild(communityNotesHeader);

        const communityNotesIcon = document.createElement('span');
        communityNotesIcon.classList.add('icon');
        communityNotesIcon.dataset.icon = 'community-notes';
        communityNotesHeader.appendChild(communityNotesIcon);

        const communityNotesTitle = document.createElement('h1');
        communityNotesTitle.classList.add('title');
        communityNotesTitle.dataset.l10nId = 'communityNotes';
        communityNotesHeader.appendChild(communityNotesTitle);

        const communityNotesContent = document.createElement('div');
        communityNotesContent.classList.add('content');
        communityNotes.appendChild(communityNotesContent);

        const communityNotesText = document.createElement('p');
        communityNotesText.classList.add('text');
        communityNotesText.textContent = data.community_notes_content;
        communityNotesContent.appendChild(communityNotesText);
      }

      const options = document.createElement('div');
      options.classList.add('options');
      post.appendChild(options);

      const likeButton = document.createElement('button');
      likeButton.classList.add('like-button');
      options.appendChild(likeButton);

      const likeButtonIcon = document.createElement('span');
      likeButtonIcon.classList.add('icon');
      likeButtonIcon.dataset.icon = 'like';
      _os.userID().then(userID => {
        const active = data.likes.indexOf(userID) !== -1;
        likeButtonIcon.dataset.icon = active ? 'liked' : 'like';
      })
      likeButton.appendChild(likeButtonIcon);

      const likeButtonCount = document.createElement('span');
      likeButtonCount.classList.add('count');
      likeButtonCount.setAttribute('role', 'counter');
      likeButtonCount.textContent = data.likes?.length || 0;
      likeButton.appendChild(likeButtonCount);

      likeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        _os.articles.getLikes(data.token).then(async list => {
          const userID = await _os.userID();
          const dislikes = await _os.articles.getDislikes(data.token);
          const active = list.indexOf(userID) !== -1;

          dislikeButton.classList.remove('active');
          dislikeButtonIcon.dataset.icon = 'dislike';
          Counter.increment(dislikeButtonCount, dislikes.length);
          _os.articles.setDislike(data.token, false);

          likeButton.classList.toggle('active', !active);
          likeButtonIcon.dataset.icon = !active ? 'liked' : 'like';
          if (active) {
            Counter.increment(likeButtonCount, list.length - (!active ? -1 : 1));
          } else {
            Counter.decrement(likeButtonCount, list.length - (!active ? -1 : 1));
          }
          _os.articles.setLike(data.token, !active);
        })
      });

      const dislikeButton = document.createElement('button');
      dislikeButton.classList.add('dislike-button');
      options.appendChild(dislikeButton);

      const dislikeButtonIcon = document.createElement('span');
      dislikeButtonIcon.classList.add('icon');
      dislikeButtonIcon.dataset.icon = 'dislike';
      _os.userID().then(userID => {
        const active = data.dislikes.indexOf(userID) !== -1;
        dislikeButtonIcon.dataset.icon = active ? 'disliked' : 'dislike';
      })
      dislikeButton.appendChild(dislikeButtonIcon);

      const dislikeButtonCount = document.createElement('span');
      dislikeButtonCount.classList.add('count');
      dislikeButtonCount.setAttribute('role', 'counter');
      dislikeButtonCount.textContent = data.dislikes?.length || 0;
      dislikeButton.appendChild(dislikeButtonCount);

      dislikeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        _os.articles.getDislikes(data.token).then(async list => {
          const userID = await _os.userID();
          const likes = await _os.articles.getLikes(data.token);
          const active = list.indexOf(userID) !== -1;

          likeButton.classList.remove('active');
          likeButtonIcon.dataset.icon = 'like';
          Counter.increment(likeButtonCount, likes.length);
          _os.articles.setLike(data.token, false);

          dislikeButton.classList.toggle('active', !active);
          dislikeButtonIcon.dataset.icon = !active ? 'disliked' : 'dislike';
          if (active) {
            Counter.increment(dislikeButtonCount, list.length + (!active ? 1 : -1));
          } else {
            Counter.decrement(dislikeButtonCount, list.length + (!active ? 1 : -1));
          }
          _os.articles.setLike(data.token, !active);
        })
      });

      const repostButton = document.createElement('button');
      repostButton.classList.add('repost-button');
      repostButton.dataset.icon = 'repost';
      options.appendChild(repostButton);

      const shareButton = document.createElement('button');
      shareButton.classList.add('share-button');
      shareButton.dataset.icon = 'share';
      options.appendChild(shareButton);

      const optionsButton = document.createElement('button');
      optionsButton.classList.add('options-button');
      optionsButton.dataset.icon = 'options';
      options.appendChild(optionsButton);
    },

    openPost: function (element, data) {
      requestAnimationFrame(() => Transitions.scale(element, this.postPanel.querySelector('.post')));

      this.homePanel.classList.remove('visible');
      this.postPanel.classList.add('visible');
      this.posts.classList.add('hidden');
      this.selectedElement = element;
      this.selectedElement.classList.add('target');

      this.postDate.textContent = new Date(parseInt(data.time_created)).toLocaleDateString(navigator.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
        minute: 'numeric'
      });
      this.postViews.innerText = data.views.length;

      _os.auth.getAvatar(data.publisher_id).then((data) => {
        this.postAvatar.src = data;
      });
      _os.auth.getUsername(data.publisher_id).then((data) => {
        this.postUsername.textContent = data;
      });

      this.postText.innerText = data.content;
    },

    handleBackButton: function (event) {
      Transitions.scale(this.postPanel.querySelector('.post'), this.selectedElement);
      this.homePanel.classList.add('visible');
      this.postPanel.classList.remove('visible');
      this.posts.classList.remove('hidden');

      this.selectedElement.classList.remove('target');
    }
  };

  Posts.init();
})(window);
