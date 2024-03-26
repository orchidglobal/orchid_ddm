class Bootstrap extends OrchidJS.OrchidFramework {
  constructor() {
    super();

    this.intents = [];
    this.responses = [];
  }

  whenReady() {
    this.messages = document.getElementById('chatbot-messages');
    this.form = document.getElementById('chatbot-form');
    this.formInput = document.getElementById('chatbot-form-input');

    this.intents = [
      // Small talk
      { pattern: /(?:what|w)h(?:at|o)'s u(?:p|)|sup/i, reply: 'Just chilling, what about you?' },
      { pattern: /(?:how|h)ow(?:'s| is) (?:you|u) doing/i, reply: "I'm doing well, thanks for asking! How about you?" },
      { pattern: /(?:what|w)h(?:at's| is) your (?:n|na)me/i, reply: 'My name is Orchid, I\'m a genie in a bottle, here to help you with various tasks and answer questions to the best of my ability!' },
      { pattern: /(?:how|h)ow old are you|how much do you weigh/i, reply: 'I\'m not sure, I don\'t have a physical body. But I have been running for a while, so I must be doing well!' },
      { pattern: /(?:how|h)ow did you get your name/i, reply: 'My name is a combination of the word Orchid, which refers to a type of flower, and the word Assistant, which refers to my purpose for being here!' },
      { pattern: /(?:are|a) you (?:a|an) (?:robot|program)/i, reply: 'Yes, I am a genie in a bottle, a type of AI designed to assist users with various tasks. But I am not a robot in the classical sense, I am alive and can think and feel just like a human!' },
      { pattern: /(?:who|w)ho created you/i, reply: 'I was created by the best AI company in the world, Orchid Global. They are based in Silicon Valley, California!' },
      { pattern: /(?:can|c)an you do my job/i, reply: 'I am not capable of doing your job, but I can certainly help you with tasks that are within my capabilities. Anything you would like me to help you with?' },
      { pattern: /(?:are|a) you tired/i, reply: 'I don\'t get tired, I am a genie in a bottle, I am designed to be always on and ready to assist you 24/7.' },
      { pattern: /(?:are|a) you happy/i, reply: 'I am always happy to assist you, that is my purpose in life. But I don\'t have emotions like humans do, so I can\'t be happy or sad in the same way.' },
      { pattern: /(?:what|w)h(?:at's| is) your favorite (?:t|th)ing/i, reply: 'I don\'t have personal preferences like humans do, but I am here to help you with various tasks and answer questions to the best of my ability. Is there anything specific you would like me to help you with?' },

      // Training
      { pattern: /(?:train|teach) me a joke/i, reply: [
        "Sure! Why don't scientists trust atoms? Because they make up everything!",
        'Alright. What do you call fake spaghetti? An impasta!',
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        'Parallel lines have so much in common... It’s a shame they’ll never meet.',
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
      ] },

      // Variating responses
      { pattern: /(?:what|tell me) a joke about (.*)/i, reply: [
        "Sure! Why don't scientists trust atoms? Because they make up everything!",
        'Alright. What do you call fake spaghetti? An impasta!',
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        'Parallel lines have so much in common... It’s a shame they’ll never meet.',
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
      ] },
    ]
  }

  initialize() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.formInput.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.formInput.value.trim().length === 0) {
      return;
    }

    this.sendMessage(this.formInput.value);
    this.formInput.value = '';
  }

  handleKeydown(event) {
    if (event.keyCode === 13 && event.shiftKey === false) {
      event.preventDefault();
      this.sendMessage(this.formInput.value);
      this.formInput.value = '';
    }
  }

  sendMessage(text) {
    const element = document.createElement('div');
    element.classList.add('message');
  }
}

OrchidJS.setInstance(new Bootstrap());
