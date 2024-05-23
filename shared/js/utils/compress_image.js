!(function (exports) {
  'use strict';

  function compressImage(source, targetSizeKB, callback) {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scaleFactor = (targetSizeKB * 1024) / (source.length / 1.37); // Estimate the file size
      canvas.width = image.width * scaleFactor;
      canvas.height = image.height * scaleFactor;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7); // 0.7 is the compression quality

      callback(compressed);
    };
    image.src = source;
  }

  exports.compressImage = compressImage;
})(window);
