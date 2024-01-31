!(function (exports) {
  'use strict';

  const Chat = {
    messages: document.getElementById('chat-messages'),
    messageBox: document.getElementById('messagebox'),
    messageBoxInput: document.getElementById('messagebox-input'),
    attachmentButton: document.getElementById('messagebox-attachment-button'),
    sendButton: document.getElementById('messagebox-send-button'),
    mediaContainer: document.getElementById('attached-media'),

    channelId: '',
    attachedMedia: [],
    isLoaded: false,

    SOUND_MSG_SENT: new Audio('/resources/sounds/msg_sent.wav'),

    KB_SIZE_LIMIT: 300,

    init: async function () {
      this.messageBox.addEventListener('submit', this.handleSubmit.bind(this));
      this.attachmentButton.addEventListener('click', this.handleAttachmentButton.bind(this));
    },

    initializeChannel: async function (channelId) {
      this.isLoaded = false;
      this.messages.innerHTML = '';

      const sessionId = Math.round(Math.random() * 2147483647);

      this.channelId = channelId;
      this.sessionId = sessionId;
      _os.messages.getLiveChannelMessages(channelId, (data) => {
        if (this.channelId !== channelId) {
          return;
        }
        if (this.sessionId !== sessionId) {
          return;
        }
        if (this.isLoaded) {
          const message = data[data.length - 1];
          this.createMessage(message, this.messages, true);

          if (document.visibilityState === 'hidden' || document.orchidVisibilityState === 'hidden') {
            this.sendNotification(message);
          }
          return;
        }

        const fragment = document.createDocumentFragment();
        for (let index = 0; index < data.length; index++) {
          const message = data[index];
          this.createMessage(message, fragment, false);
        }
        this.messages.appendChild(fragment);
        this.isLoaded = true;
      });
    },

    handleSubmit: function (event) {
      event.preventDefault();
      if (this.messageBoxInput.value === '' && this.attachedMedia.length === 0) {
        return;
      }

      const uploadedMedia = [];
      for (let index = 0; index < this.attachedMedia.length; index++) {
        const media = this.attachedMedia[index];
        const path = Math.round(Math.random() * 2147483647);
        _os.storage.add(`messages/${path}.${media.mime.split('/')[1]}`, media.data);
        uploadedMedia.push({ path, mime: media.mime });
      }

      _os.messages.sendMessage(this.channelId, this.messageBoxInput.value, uploadedMedia);
      this.messageBoxInput.value = '';
      this.attachedMedia = [];
      this.mediaContainer.innerHTML = '';

      this.mediaContainer.classList.remove('visible');
    },

    hasOnlyEmojis: function (inputString) {
      // Regular expression to match emojis in the format :<emojiname>:
      const emojiRegex = /\s?:[\w]+:\s?/g;

      // Match all occurrences of emojis in the string
      const matches = inputString.match(emojiRegex);

      // If matches exist and all parts of the string are emojis, return true
      return matches !== null && matches.join('') === inputString;
    },

    getEmbedsFromLinks: async function (text) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = text.match(urlRegex) || [];

      const openGraphs = [];

      for (const url of urls) {
        try {
          const response = await fetch(`https://corsproxy.io/?${encodeURI(url)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }

          const data = await response.text();

          const parser = new DOMParser();
          const parsedDOM = parser.parseFromString(data, 'text/html');

          const getMetaContent = (property) => {
            const element = parsedDOM.querySelector(`[property="${property}"]`);
            return element ? element.content : '';
          };

          const ogData = {
            title: getMetaContent('og:title'),
            type: getMetaContent('og:type'),
            description: getMetaContent('og:description'),
            image: getMetaContent('og:image'),
            url: getMetaContent('og:url'),
            site_name: getMetaContent('og:site_name'),
            locale: getMetaContent('og:locale'),
            audio: getMetaContent('og:audio'),
            video: getMetaContent('og:video'),
            determiner: getMetaContent('og:determiner')
          };

          openGraphs.push(ogData);
        } catch (error) {
          console.error(`Error processing URL ${url}:`, error);
          // Push an empty object or default values in case of failure
          openGraphs.push({});
        }
      }

      return openGraphs;
    },

    createMessage: async function (message, parentElement = this.messages, isNew) {
      const element = document.createElement('div');
      element.classList.add('message');
      parentElement.appendChild(element);

      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      element.appendChild(imageContainer);

      const avatar = document.createElement('img');
      avatar.classList.add('avatar');
      imageContainer.appendChild(avatar);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      element.appendChild(textHolder);

      const messageInfo = document.createElement('div');
      messageInfo.classList.add('message-info');
      textHolder.appendChild(messageInfo);

      const username = document.createElement('div');
      username.classList.add('username');
      messageInfo.appendChild(username);

      const separator = document.createElement('div');
      separator.classList.add('separator');
      messageInfo.appendChild(separator);

      const lang = L10n.currentLanguage === 'ar' ? 'ar-SA' : L10n.currentLanguage;
      const timeCreated = document.createElement('div');
      timeCreated.classList.add('time-created');
      timeCreated.textContent = new Date(message.time_created).toLocaleDateString(lang, {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour12: true
      });
      messageInfo.appendChild(timeCreated);

      const content = document.createElement('div');
      content.classList.add('content');
      textHolder.appendChild(content);

      const messageText = document.createElement('div');
      if (message.content) {
        if (this.hasOnlyEmojis(message.content)) {
          content.classList.add('emojis');
        }

        messageText.classList.add('text');
        messageText.innerText = message.content;
        messageText.innerHTML = EmojiConverter.convertToEmoji(messageText.innerText);
        content.appendChild(messageText);

        this.getEmbedsFromLinks(message.content).then((data) => {
          // console.log(data);
        });
      }

      const media = document.createElement('div');
      media.classList.add('media');
      content.appendChild(media);

      for (let index = 0; index < message.media.length; index++) {
        const mediaData = message.media[index];

        const handleFile = (url) => {
          if (mediaData.mime.startsWith('video/')) {
            const mediaVideo = document.createElement('video');
            mediaVideo.classList.add('video');
            mediaVideo.src = url;
            mediaVideo.controls = true;
            mediaVideo.addEventListener('click', () => {
              MediaViewer.load(message.media, index, mediaVideo);
            });
            media.appendChild(mediaVideo);
          } else {
            const mediaImage = document.createElement('img');
            mediaImage.classList.add('image');
            mediaImage.src = url;
            mediaImage.addEventListener('click', () => {
              MediaViewer.load(message.media, index, mediaImage);
            });
            media.appendChild(mediaImage);
          }
        };

        try {
          if (isNew) {
            _os.storage.getAfterUpload(`messages/${mediaData.path}.${mediaData.mime.split('/')[1]}`).then(handleFile.bind(this));
          } else {
            _os.storage.get(`messages/${mediaData.path}.${mediaData.mime.split('/')[1]}`).then(handleFile.bind(this));
          }
        } catch (error) {
          console.error(error);
        }
      }

      if ('Translator' in window) {
        let originalText = message.content;
        let translatedText;
        let isTranslated = false;

        const translator = document.createElement('div');
        translator.classList.add('translator');
        textHolder.appendChild(translator);

        const translatorIcon = document.createElement('div');
        translatorIcon.classList.add('icon');
        translator.appendChild(translatorIcon);

        const translatorLabel = document.createElement('label');
        translatorLabel.classList.add('pack-switch');
        translator.appendChild(translatorLabel);

        const translatorName = document.createElement('span');
        translatorName.classList.add('text');
        translatorName.dataset.l10nId = 'message-translate';
        translatorLabel.appendChild(translatorName);

        const translatorSwitchHolder = document.createElement('span');
        translatorLabel.appendChild(translatorSwitchHolder);

        const translatorSwitch = document.createElement('input');
        translatorSwitch.type = 'checkbox';
        translatorSwitch.classList.add('switch');
        translatorSwitchHolder.appendChild(translatorSwitch);

        translatorSwitch.addEventListener('change', async () => {
          if (!translatedText) {
            const currentLanguage = await Settings.getValue('general.lang.code');
            translatedText = await Translator(originalText, { to: currentLanguage });
          }

          if (isTranslated) {
            messageText.textContent = originalText;
          } else {
            messageText.textContent = translatedText;
          }
          isTranslated = !isTranslated;
        });
      }

      const isMessageByMe = message.publisher_id === (await _os.userID());

      this.messages.scrollTop = this.messages.scrollHeight + 50;
      if (isMessageByMe) {
        element.classList.add('yours');
        Transitions.scale(this.sendButton, content);
      }

      const toolbar = document.createElement('div');
      toolbar.classList.add('toolbar');
      element.appendChild(toolbar);

      const reactionButton = document.createElement('button');
      reactionButton.classList.add('reaction-button');
      reactionButton.dataset.icon = 'emojis';
      toolbar.appendChild(reactionButton);

      if (isMessageByMe) {
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.dataset.icon = 'edit';
        toolbar.appendChild(editButton);
      } else {
        const replyButton = document.createElement('button');
        replyButton.classList.add('reply-button');
        replyButton.dataset.icon = 'reply';
        toolbar.appendChild(replyButton);
      }

      const optionsButton = document.createElement('button');
      optionsButton.classList.add('options-button');
      optionsButton.dataset.icon = 'options';
      toolbar.appendChild(optionsButton);

      _os.auth.getAvatar(message.publisher_id).then((data) => {
        avatar.src = data;
      });
      _os.auth.getUsername(message.publisher_id).then((data) => {
        username.textContent = data;

        this.messages.scrollTop = this.messages.scrollHeight + 50;
      });
    },

    sendNotification: function (message) {
      if (!('Notification' in window)) {
        console.error('This browser does not support desktop notifications.');
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission !== 'granted') {
            return;
          }
          OrchidServices.getWithUpdate(`profile/${message.publisher_id}`, (data) => {
            this.SOUND_MSG_SENT.currentTime = 0;
            this.SOUND_MSG_SENT.play();
            const notification = new Notification(data.username, {
              body: message.content,
              icon: data.profile_picture,
              badge: '/style/icons/sms_64.png',
              silent: true
            });

            notification.onclick = function () {
              window.focus();
              notification.close();
            };
          });
        });
      }
    },

    handleAttachmentButton: function (event) {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.webm'], (data, mime) => {
        this.attachedMedia.push({ data, mime });

        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }
        const base64String = btoa(binaryString);
        const dataUrl = `data:${mime};base64,${base64String}`;

        const fileSizeInBytes = data.length / 1000 / 1000;
        if (fileSizeInBytes > 2) {
          ModalDialog.showAlert('Attachment Error', 'File size is limited to 2MB. Please compress or attach a different file.');
          return;
        }

        if (mime.startsWith('video/')) {
          this.mediaContainer.classList.add('visible');

          const mediaVideo = document.createElement('video');
          mediaVideo.classList.add('video');
          mediaVideo.src = dataUrl;
          this.mediaContainer.appendChild(mediaVideo);
        } else {
          compressImage(dataUrl, this.KB_SIZE_LIMIT, async (finalImage) => {
            this.mediaContainer.classList.add('visible');

            const mediaImage = document.createElement('img');
            mediaImage.classList.add('image');
            mediaImage.src = finalImage;
            this.mediaContainer.appendChild(mediaImage);
          });
        }
      });
    }
  };

  Chat.init();

  exports.Chat = Chat;
})(window);
