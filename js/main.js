// const imageUpload = document.getElementById('imageUpload');
// const effectsContainer = document.getElementById('effectsContainer');

// const effects = [
//     'brightness', 'hue', 'saturation', 'vintage', 'ink', 'vibrance', 'denoise',
//     'hexagonalPixelate', 'invert', 'perspective', 'bulgePinch', 'swirl',
//     'lensBlur', 'tiltShiftBlur', 'triangularBlur', 'zoomBlur', 'edgeWork',
//     'dotScreen', 'colorHalftone'
// ];

// let worker = null;
// let processedCount = 0;
// const RECYCLE_THRESHOLD = 100;

// function createWorker() {
//     if (worker) {
//         worker.terminate();
//     }
//     worker = new Worker('imageWorker.js');
//     processedCount = 0;
// }

// createWorker();

// imageUpload.addEventListener('change', handleImage);

// function handleImage(e) {
//     const reader = new FileReader();
//     reader.onload = function(event) {
//         const img = new Image();
//         img.onload = function() {
//             processImage(img);
//         }
//         img.src = event.target.result;
//     }
//     reader.readAsDataURL(e.target.files[0]);
// }

// function processImage(img) {
//     effectsContainer.innerHTML = '';
//     effects.forEach(effect => {
//         const section = document.createElement('div');
//         section.className = 'section';
//         section.innerHTML = `<h2>${effect.charAt(0).toUpperCase() + effect.slice(1)}</h2>`;
//         effectsContainer.appendChild(section);

//         for (let i = 0; i < 100; i++) {
//             const wrapper = document.createElement('div');
//             wrapper.className = 'canvas-wrapper';
//             const canvas = document.createElement('canvas');
//             canvas.width = img.width;
//             canvas.height = img.height;
//             wrapper.appendChild(canvas);
//             section.appendChild(wrapper);
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(img, 0, 0);

//             const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//             let value = getEffectValue(effect, i);

//             worker.postMessage({
//                 effect,
//                 imageData: imageData,
//                 value: value,
//                 index: i
//             });

//             worker.onmessage = function(e) {
//                 const { imageData, index, value } = e.data;
//                 const targetCanvas = section.children[index + 1].firstChild;
//                 const targetCtx = targetCanvas.getContext('2d');
//                 targetCtx.putImageData(imageData, 0, 0);
//                 // addText(section.children[index + 1], `${effect}: ${value.toFixed(2)}`);
                
//                 processedCount++;
//                 if (processedCount >= RECYCLE_THRESHOLD) {
//                     createWorker();
//                 }
//             };
//         }
//     });
// }

// function getEffectValue(effect, index) {
//     switch(effect) {
//         case 'brightness': return Math.floor(index / 10 * 510) - 255;
//         case 'hue': return Math.floor(index / 10 * 360);
//         case 'saturation': return index / 5;
//         case 'vintage': return index / 10;
//         case 'ink': return index / 2.5;
//         case 'vibrance': return index / 5 - 1;
//         case 'denoise': return index * 5;
//         case 'hexagonalPixelate': return index * 5 + 1;
//         case 'invert': return index / 10;
//         case 'perspective': return [index / 10, (10 - index) / 10, index / 10, (10 - index) / 10];
//         case 'bulgePinch': return [index / 10, (index - 5) / 5];
//         case 'swirl': return (index - 5) * 1;
//         case 'lensBlur': return index * 5;
//         case 'tiltShiftBlur': return [index / 10, (10 - index) / 10];
//         case 'triangularBlur': return index * 5;
//         case 'zoomBlur': return [index / 10, 0.5, 0.5];
//         case 'edgeWork': return index + 1;
//         case 'dotScreen': return index;
//         case 'colorHalftone': return index;
//         default: return index / 10;
//     }
// }

// function addText(wrapper, text) {
//     const label = document.createElement('div');
//     label.style.fontSize = '10px';
//     label.style.marginTop = '2px';
//     label.innerText = text;
//     wrapper.appendChild(label);
// }

// Mask Application
const maskWorker = new Worker('maskApplicationWorker.js');
maskWorker.onmessage = function(e) {
    const maskedImageData = e.data.imageData;
    // Display maskedImageData
};
maskWorker.postMessage({ imageData, maskData, opacity });

// Magic Wand Selection
const magicWandWorker = new Worker('magicWandSelectionWorker.js');
magicWandWorker.onmessage = function(e) {
    const selectionMask = e.data.maskImageData;
    // Display selectionMask
};
magicWandWorker.postMessage({ imageData, startX, startY, tolerance });

// Mask Separation
const maskSeparationWorker = new Worker('maskSeparationWorker.js');
maskSeparationWorker.onmessage = function(e) {
    const separatedMasks = e.data.masks;
    // Display each mask in separatedMasks
    for (const label in separatedMasks) {
        displayMask(separatedMasks[label]);
    }
};
maskSeparationWorker.postMessage({ maskData, threshold: 128 });

function displayMask(maskImageData) {
    const canvas = document.createElement('canvas');
    canvas.width = maskImageData.width;
    canvas.height = maskImageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(maskImageData, 0, 0);
    document.body.appendChild(canvas);
}