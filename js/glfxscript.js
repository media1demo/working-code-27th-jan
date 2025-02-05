const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('image-input');
const resetButton = document.getElementById('reset-button');
const grayscaleButton = document.getElementById('grayscale-button');
const sepiaButton = document.getElementById('sepia-button');
const invertButton = document.getElementById('invert-button');
const hueSaturationButton = document.getElementById('hue-saturation-button');
const vibranceButton = document.getElementById('vibrance-button');
const denoiseButton = document.getElementById('denoise-button');
const unsharpMaskButton = document.getElementById('unsharp-mask-button');
const vignetteButton = document.getElementById('vignette-button');
const zoomBlurButton = document.getElementById('zoom-blur-button');
const triangularBlurButton = document.getElementById('triangular-blur-button');
const tiltShiftButton = document.getElementById('tilt-shift-button');
const lensBlurButton = document.getElementById('lens-blur-button');
const swirlButton = document.getElementById('swirl-button');
const bulgeButton = document.getElementById('bulge-pinch-button');
const perspectiveButton = document.getElementById('perspective-button');
const inkButton = document.getElementById('ink-button');
const edgeWorkButton = document.getElementById('edge-work-button');
const hexagonalPixelateButton = document.getElementById('hexagonal-pixelate-button');
const dotScreenButton = document.getElementById('dot-screen-button');
const colorHalftoneButton = document.getElementById('color-halftone-button');

let originalImage;


imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = reader.result;
  };

  reader.readAsDataURL(file);
});

resetButton.addEventListener('click', () => {
  if (originalImage) {
    ctx.putImageData(originalImage, 0, 0);
  }
});

grayscaleButton.addEventListener('click', () => {
  if (originalImage) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
  }
});

sepiaButton.addEventListener('click', () => {
  if (originalImage) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
    ctx.putImageData(imageData, 0, 0);
  }
});

invertButton.addEventListener('click', () => {
  if (originalImage) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
    }
    ctx.putImageData(imageData, 0, 0);
  }
});

hueSaturationButton.addEventListener('click', () => {
  if (originalImage) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const fx = new GLFX.Shader(null, GLFX.HUESATURATION);
    fx.hue = 0.3;
    fx.saturation = 2;
    const newImageData = fx.updateCanvas(imageData, canvas.width, canvas.height);
    ctx.putImageData(newImageData, 0, 0);
  }
});