class HTMLMotionWallpaperElement extends HTMLElement {
  isAlwaysOnDisplay = false;
  isUnlocked = false;

  constructor() {
    super();

    this.init();
  }

  init() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <div class="container">
        <canvas class="viewport"></canvas>
      </div>
      <link rel="stylesheet" href="/components/motion-wallpaper/motion-wallpaper.css">
    `;

    this.viewport = shadow.querySelector('.viewport');

    window.addEventListener('load', () => {
      LazyLoader.load('js/lib/three.js', () => {
        LazyLoader.load('js/lib/ShaderPass.js', () => {
          LazyLoader.load(
            [
              'js/lib/EffectComposer.js',
              'js/lib/RenderPass.js',
              'js/lib/LuminosityHighPassShader.js',
              'js/lib/CopyShader.js',
              'js/lib/UnrealBloomPass.js',
              'js/lib/GLTFLoader.js'
            ],
            () => {
              this.load();
            }
          );
        });
      });
    });
  }

  load() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0, 0, 0);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 1000);
    this.camera.position.set(0, 0, 33);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.viewport });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; //added contrast for filmic look
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderPass = new THREE.RenderPass(this.scene, this.camera);

    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.bloomPass.threshold = 0.2;
    this.bloomPass.strength = 3;
    this.bloomPass.radius = 0;

    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloomPass);

    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(75, 0, 30);
    this.scene.add(this.light);

    this.ambient = new THREE.AmbientLight(0x858585);
    this.scene.add(this.ambient);

    const loader = new THREE.GLTFLoader();
    loader.load('/resources/3d/motion_wallpapers/earth/earth.glb', (gltf) => {
      this.globe = gltf.scene;
      this.globe.scale.set(0.01, 0.01, 0.01);
      this.scene.add(this.globe);

      this.mixer = new THREE.AnimationMixer(this.globe);
      gltf.animations.forEach((clip) => {
        this.mixer.clipAction(clip).play();
      });

      this.render();
    });

    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  handleWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    requestAnimationFrame(this.render.bind(this));

    const cubicEase = (t) => t * t * (3 - 2 * t);

    if (this.isAlwaysOnDisplay) {
      this.camera.position.z += (35 - this.camera.position.z) * cubicEase(0.1);
    } else {
      if (this.isUnlocked) {
        this.camera.position.z += (20 - this.camera.position.z) * cubicEase(0.1);
      } else {
        this.camera.position.z += (23 - this.camera.position.z) * cubicEase(0.2);
      }
    }

    if (this.globe) {
      if (this.isUnlocked) {
        this.globe.position.y += (-5 - this.globe.position.y) * cubicEase(0.2);
      } else {
        this.globe.position.y += (0 - this.globe.position.y) * cubicEase(0.1);
      }
      this.globe.rotation.y += 0.002;
    }

    this.composer.render();
  }
}

customElements.define('motion-wallpaper', HTMLMotionWallpaperElement);
