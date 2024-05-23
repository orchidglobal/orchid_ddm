!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),

    accountTabs: document.getElementById('account-tabs'),

    accountPosts: document.getElementById('account-posts'),
    accountArticles: document.getElementById('account-articles'),
    accountMedia: document.getElementById('account-media'),
    accountLikes: document.getElementById('account-likes'),

    tipHint: document.querySelector('tip-hint'),

    KB_SIZE_LIMIT: 300,

    init: function () {
      const url = window.location.search;
      // Parse the URL to extract query parameters
      const urlParams = new URLSearchParams(url);
      // Get the value of the "post" parameter
      const userValue = urlParams.get('user_id');

      if (userValue) {
        this.updateProfile(userValue);
        window.addEventListener('orchid-services-ready', this.updateProfile.bind(this, userValue));
      } else {
        this.updateProfile();
        window.addEventListener('orchid-services-ready', this.updateProfile.bind(this, null));
      }
    },

    show: function () {
      this.updateProfile();
      this.tipHint.showMessage('This function may not work as intended... Yeah :/');
    },

    updateProfile: async function (handleName) {
      this.accountBanner.setUser(handleName);
      this.updatePosts(handleName);
    },

    updatePosts: function (userHandle) {
      this.accountPosts.innerHTML = '';
      _os.articles.getRelavantPosts().then((posts) => {
        posts = posts.filter((post) => post.publisher_id === userHandle);

        for (let index = 0; index < posts.length; index++) {
          const post = posts[index];
          Posts.populate(post, this.accountPosts);
        }
      });
    }
  };

  ArticlesApp.Account = Account;
})(window);
