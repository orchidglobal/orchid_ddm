!(function (exports) {
  'use strict';

  const Posts = {
    homePanel: document.getElementById('home'),

    posts: document.getElementById('home-posts'),
    postPanel: document.getElementById('post'),
    backButton: document.getElementById('post-back-button'),
    postView: document.getElementById('post-view'),
    postReplies: document.getElementById('post-replies'),

    replyForm: document.getElementById('post-reply-form'),
    replyFormInput: document.getElementById('post-reply-form-input'),
    sendButton: document.getElementById('post-reply-form-send-button'),
    mediaButton: document.getElementById('post-reply-form-media-button'),

    init: function () {
      window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));

      this.replyForm.addEventListener('submit', this.handleSubmit.bind(this));
      this.sendButton.addEventListener('click', this.handleSubmitButtonClick.bind(this));
    },

    handleServicesLoad: function () {
      const url = window.location.search;
      // Parse the URL to extract query parameters
      const urlParams = new URLSearchParams(url);
      // Get the value of the "post" parameter
      const postValue = urlParams.get('post');
      const userValue = urlParams.get('user_id');

      if (postValue) {
        _os.articles.getPost(postValue).then((post) => {
          this.currentPost = post.token;

          this.postView.innerHTML = '';
          this.populate(post, this.postView);

          this.postReplies.innerHTML = '';
          for (let index = 0; index < post.replies.length; index++) {
            const replyToken = post.replies[index];

            _os.articles.getPost(replyToken).then((reply) => {
              this.populate(reply, this.postReplies);
            });
          }
        });

        return;
      }

      if (userValue) {
        return;
      }

      _os.articles.getRelavantPosts().then((array) => {
        this.posts.innerHTML = '';
        array.forEach((element) => {
          this.populate(element, this.posts);
        });
      });
    },

    show: function () {
      _os.articles.getRelavantPosts().then((array) => {
        this.posts.innerHTML = '';
        array.forEach((element) => {
          this.populate(element, this.posts);
        });
      });
    },

    populate: function (data, parent) {
      const post = document.createElement('div');
      post.classList.add('post');
      parent.appendChild(post);

      if (parent === this.posts) {
        post.dataset.pageId = 'post';
        post.addEventListener('click', () => this.openPost(data.token));
      }

      const header = document.createElement('div');
      header.classList.add('header');
      post.appendChild(header);

      const iconHolder = document.createElement('div');
      iconHolder.classList.add('icon-holder');
      header.appendChild(iconHolder);

      const icon = document.createElement('img');
      icon.classList.add('icon');
      icon.dataset.pageId = 'account';
      icon.addEventListener('click', () => ArticlesApp.Account.updateProfile(data.publisher_id));
      iconHolder.appendChild(icon);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      header.appendChild(textHolder);

      const username = document.createElement('span');
      username.classList.add('username');
      username.dataset.pageId = 'account';
      username.addEventListener('click', () => ArticlesApp.Account.updateProfile(data.publisher_id));
      textHolder.appendChild(username);

      const stats = document.createElement('span');
      stats.classList.add('stats');
      textHolder.appendChild(stats);

      const handle = document.createElement('span');
      handle.classList.add('handle');
      stats.appendChild(handle);

      const statSeparator = document.createElement('div');
      statSeparator.classList.add('separator');
      stats.appendChild(statSeparator);

      const langCode = OrchidJS.L10n.currentLanguage === 'ar' ? 'ar-SA' : OrchidJS.L10n.currentLanguage;

      const date = document.createElement('span');
      date.classList.add('date');
      date.textContent = new Date(parseInt(data.time_created)).toLocaleDateString(langCode, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
        minute: 'numeric'
      });
      stats.appendChild(date);

      icon.src = 'https://orchid-f39a9.web.app/assets/defaultuser.png';
      username.textContent = OrchidJS.L10n.get('anonymousUser');
      if (data.publisher_id) {
        _os.auth.getUserByHandle(data.publisher_id).then((data) => {
          icon.src = data.profile_picture || 'https://orchid-f39a9.web.app/assets/defaultuser.png';
          username.textContent = data.username || OrchidJS.L10n.get('anonymousUser');
          handle.textContent = `@${data.handle_name}`;
        });
      }

      const content = document.createElement('div');
      content.classList.add('content');
      post.appendChild(content);

      const text = document.createElement('div');
      text.classList.add('text');
      text.innerText = this.convertFromEscapes(data.content);
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

        const communityNotesButtons = document.createElement('div');
        communityNotesButtons.classList.add('buttons');
        communityNotes.appendChild(communityNotesButtons);

        const rateUpButton = document.createElement('button');
        rateUpButton.classList.add('dislike-button');
        _os.auth.getHandleName().then((handleName) => {
          const active = data.community_notes_rate_ups.indexOf(handleName) !== -1;
          rateUpButton.classList.toggle('active', active);
        });
        rateUpButton.dataset.l10nId = 'communityNotes-rateUp';
        rateUpButton.dataset.l10nArgs = JSON.stringify({
          count: data.community_notes_rate_ups?.length || 0
        });
        communityNotesButtons.appendChild(rateUpButton);

        rateUpButton.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const handleName = await _os.auth.getHandleName();
          const active = data.community_notes_rate_ups?.indexOf(handleName) !== -1;

          rateDownButton.classList.remove('active');
          rateDownButton.dataset.l10nArgs = JSON.stringify({
            count: data.community_notes_rate_downs?.length + (active ? 1 : -1) || 0
          });
          _os.articles.setLike(data.token, false);

          rateUpButton.classList.toggle('active', !active);
          rateUpButton.dataset.l10nArgs = JSON.stringify({
            count: data.community_notes_rate_ups?.length + (!active ? 1 : -1) || 0
          });
          _os.articles.setCommunityNotesRateUp(data.token, !active);
          _os.articles.setCommunityNotesRateDown(data.token, false);
        });

        const rateDownButton = document.createElement('button');
        rateDownButton.classList.add('dislike-button');
        _os.auth.getHandleName().then((handleName) => {
          const active = data.community_notes_rate_downs.indexOf(handleName) !== -1;
          rateDownButton.classList.toggle('active', active);
        });
        rateDownButton.dataset.l10nId = 'communityNotes-rateDown';
        rateDownButton.dataset.l10nArgs = JSON.stringify({
          count: data.community_notes_rate_downs?.length || 0
        });
        communityNotesButtons.appendChild(rateDownButton);

        rateDownButton.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();

          const handleName = await _os.auth.getHandleName();
          const active = data.community_notes_rate_downs?.indexOf(handleName) !== -1;

          rateDownButton.classList.remove('active');
          rateDownButton.dataset.l10nArgs = JSON.stringify({
            count: data.community_notes_rate_ups?.length + (active ? 1 : -1) || 0
          });
          _os.articles.setLike(data.token, false);

          rateDownButton.classList.toggle('active', !active);
          rateDownButton.dataset.l10nArgs = JSON.stringify({
            count: data.community_notes_rate_downs?.length + (!active ? 1 : -1) || 0
          });
          _os.articles.setCommunityNotesRateUp(data.token, false);
          _os.articles.setCommunityNotesRateDown(data.token, !active);
        });
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
      _os.auth.getHandleName().then((handleName) => {
        const active = data.likes.indexOf(handleName) !== -1;
        likeButtonIcon.dataset.icon = active ? 'liked' : 'like';
      });
      likeButton.appendChild(likeButtonIcon);

      const likeButtonCount = document.createElement('span');
      likeButtonCount.classList.add('count');
      likeButtonCount.setAttribute('role', 'counter');
      likeButtonCount.textContent = data.likes?.length || 0;
      likeButton.appendChild(likeButtonCount);

      likeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        _os.articles.getLikes(data.token).then(async (list) => {
          const handleName = await _os.auth.getHandleName();
          const dislikes = await _os.articles.getDislikes(data.token);
          const active = list.indexOf(handleName) !== -1;

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
        });
      });

      const dislikeButton = document.createElement('button');
      dislikeButton.classList.add('dislike-button');
      options.appendChild(dislikeButton);

      const dislikeButtonIcon = document.createElement('span');
      dislikeButtonIcon.classList.add('icon');
      dislikeButtonIcon.dataset.icon = 'dislike';
      _os.auth.getHandleName().then((handleName) => {
        const active = data.dislikes.indexOf(handleName) !== -1;
        dislikeButtonIcon.dataset.icon = active ? 'disliked' : 'dislike';
      });
      dislikeButton.appendChild(dislikeButtonIcon);

      const dislikeButtonCount = document.createElement('span');
      dislikeButtonCount.classList.add('count');
      dislikeButtonCount.setAttribute('role', 'counter');
      dislikeButtonCount.textContent = data.dislikes?.length || 0;
      dislikeButton.appendChild(dislikeButtonCount);

      dislikeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        _os.articles.getDislikes(data.token).then(async (list) => {
          const handleName = await _os.auth.getHandleName();
          const likes = await _os.articles.getLikes(data.token);
          const active = list.indexOf(handleName) !== -1;

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
          _os.articles.setDislike(data.token, !active);
        });
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

      OrchidJS.PageController.refresh();
    },

    convertFromEscapes: function (inputStr) {
      return inputStr.replace(/\\u([\dA-Fa-f]{4})/g, (_, hex) => {
        const codePoint = parseInt(hex, 16);
        return codePoint <= 0xffff ? String.fromCharCode(codePoint) : String.fromCodePoint(codePoint);
      });
    },

    openPost: function (token) {
      _os.articles.getPost(token).then((post) => {
        const url = new URL(location);
        url.searchParams.set('post', token);
        url.searchParams.set('publisher_id', post.publisher_id);
        history.pushState({}, '', url);

        this.currentPost = post.token;

        this.postView.innerHTML = '';
        this.populate(post, this.postView);

        this.postReplies.innerHTML = '';
        for (let index = 0; index < post.replies.length; index++) {
          const replyToken = post.replies[index];

          _os.articles.getPost(replyToken).then((reply) => {
            this.populate(reply, this.postReplies);
          });
        }
      });
    },

    handleBackButton: function (event) {
      const url = new URL(location);
      url.searchParams.delete('post');
      url.searchParams.delete('publisher_id');
      url.searchParams.delete('user_id');
      history.pushState({}, '', url);

      this.homePanel.classList.add('visible');
      this.postPanel.classList.remove('visible');
      this.posts.classList.remove('hidden');

      this.selectedElement.classList.remove('target');
    },

    handleSubmit: function (event) {
      event.preventDefault();
    },

    handleSubmitButtonClick: function (event) {
      _os.articles.post('public', this.replyFormInput.value, [], this.currentPost);
      this.replyFormInput.value = '';
    }
  };

  Posts.init();

  exports.Posts = Posts;
})(window);
