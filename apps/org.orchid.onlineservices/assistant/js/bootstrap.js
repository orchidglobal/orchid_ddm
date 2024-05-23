class Bootstrap extends OrchidJS.Framework {
  constructor() {
    super();

    this.intents = [];
    this.responses = [];
  }

  whenReady() {
    this.userReply = document.getElementById('user-reply');
    this.responseText = document.getElementById('response-text');
    this.form = document.getElementById('messagebox');
    this.formInput = document.getElementById('messagebox-input');
  }

  initialize() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.formInput.value.trim().length === 0) {
      return;
    }

    this.userReply.innerText = this.formInput.value;

    this.responseText.innerText = 'Hello, I am waiting for your response...';
    this.responseText.classList.add('pack-skeleton');

    chatbot.matchIntent(this.formInput.value, chatbot.corpus).then(response => {
      console.log(response.reply);
      this.responseText.innerText = response.reply;
      this.responseText.classList.remove('pack-skeleton');
    });
    this.formInput.value = '';
  }

  sendMessage(text) {
    const element = document.createElement('div');
    element.classList.add('message');
  }
}

OrchidJS.setInstance(new Bootstrap());
