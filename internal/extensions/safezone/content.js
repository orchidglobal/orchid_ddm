const safeZoneHeight = 100; // Adjust this value to your desired safe zone height

const injectSafeZone = () => {
  const body = document.body;
  body.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-bottom: ${safeZoneHeight}px;
    overflow: auto;
  `;
};

injectSafeZone();
