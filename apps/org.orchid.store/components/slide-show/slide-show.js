class HTMLSlideshowElement extends HTMLElement {
  slideIndex = 0;
  targetSlideIndex = 0;

  lastProgress = 0;

  isDragging = false;

  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });

    // Define a template for the content
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="slideshow">
        <div class="slideshow-container">
          <slot></slot>
        </div>
      </div>
      <link rel="stylesheet" href="/components/slide-show/slide-show.css">
    `;

    // Clone the template content and append it to the shadow root
    shadow.appendChild(template.content.cloneNode(true));

    this.swipeGesture = new OrchidJS.Gesture(shadow, [1, 0], 150);
    this.swipeGesture.onStart = this.handleGestureStart.bind(this);
    this.swipeGesture.onProgress = this.handleGestureProgress.bind(this);
    this.swipeGesture.onEnd = this.handleGestureEnd.bind(this);

    this.render();
  }

  handleGestureStart(event) {
    this.isDragging = true;
  }

  handleGestureProgress(event, progress, overscroll) {
    this.currentProgress = this.lastProgress + progress + overscroll;

    const elements = this.querySelectorAll('slide-show-card');
    this.slideIndex = (this.currentProgress % elements.length) - 1;
  }

  handleGestureEnd(event, progress, overscroll) {
    this.isDragging = false;
    this.lastProgress = progress + overscroll;
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    function smoothMapping(value) {
      if (value < 0) {
        return 0;
      } else if (value >= 0 && value <= 1) {
        return lerp(0.5, 0.33, value);
      } else if (value >= 1 && value <= 2) {
        return lerp(0.33, 0.16, value - 1);
      } else if (value >= 2 && value < 3) {
        return lerp(0.16, 0, value - 2);
      } else {
        return 0;
      }
    }

    function lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    const elements = this.querySelectorAll('slide-show-card');
    if (this.isDragging) {
      this.targetSlideIndex += ((this.slideIndex % elements.length) - this.targetSlideIndex) * 0.3;
    } else {
      this.targetSlideIndex += ((Math.round(this.slideIndex) % elements.length) - this.targetSlideIndex) * 0.3;
    }

    let totalWidth = 0;
    elements.forEach((element, index) => {
      const width = smoothMapping(index - this.targetSlideIndex) * 100;
      totalWidth += width;
    });

    let leftOffset = 0;
    elements.forEach((element, index) => {
      const progress = smoothMapping(index - this.targetSlideIndex);
      const width = progress * 100;
      const gap = (100 - totalWidth) / (elements.length - 1); // Calculate gap between slides
      element.style.setProperty('--parallax-scale', 1.5 - progress);
      element.style.left = `${leftOffset}%`;
      element.style.width = `calc(${width}% - ${gap * (elements.length - 1)}px)`;
      leftOffset += width + gap; // Update leftOffset with width and gap
    });
  }
}

customElements.define('slide-show', HTMLSlideshowElement);
