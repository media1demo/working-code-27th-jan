const imageUpload = document.getElementById('imageUpload');
const resultsContainer = document.getElementById('resultsContainer');
const effectControls = document.getElementById('effectControls');
const imageCountInput = document.getElementById('imageCount');
const processButton = document.getElementById('processButton');
const masterCheckbox = document.getElementById('masterCheckbox');
const fastProcessButton = document.getElementById('fastProcessButton');
const resizeButton = document.getElementById('resizeButton');
const toggleDrawButton = document.getElementById('toggleDraw');
const removeObjectButton = document.getElementById('removeObject');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const progressDiv = document.getElementById('progress'); // Initialize progressDiv
const lipSyncButton = document.getElementById('lipSyncButton'); // New button
const generateImagesButton = document.getElementById('generateImages'); // Brightness button
const removeWatermarkButton = document.getElementById('removeWatermarkButton');
removeWatermarkButton.addEventListener('click', removeWatermark);

const workers = {};
effects.forEach(effect => { workers[effect] = new Worker(`js/${effect}Worker.js`); });
console.log(effects);
let processedImages = {};
let originalImage;
let selectedRegions = [];
let tolerance = 32;
let magicWandMode = 'add';
let clickedPoints = [];
let drawMode = false;
let isDrawing = false;
let worker = null;

processButton.addEventListener('click', () => processImageWithMethod(processImage));
fastProcessButton.addEventListener('click', () => processImageWithMethod(fastProcessImage));
masterCheckbox.addEventListener('change', toggleAllEffects);
resizeButton.addEventListener('click', startResizing);
toggleDrawButton.addEventListener('click', toggleDrawMode);
removeObjectButton.addEventListener('click', performObjectRemoval);
imageCanvas.addEventListener('click', handleCanvasClick);
imageCanvas.addEventListener('mousedown', startDrawing);
imageCanvas.addEventListener('mousemove', draw);
imageCanvas.addEventListener('mouseup', stopDrawing);
lipSyncButton.addEventListener('click', startLipSyncAnimation); // New button event listener
generateImagesButton.addEventListener('click', generateBrightnessVariations); // Brightness button event listener

const animationControlDiv = document.createElement('div');
animationControlDiv.className = 'effect-control';
const animationCheckbox = document.createElement('input');
animationCheckbox.type = 'checkbox';
animationCheckbox.id = 'animationCheckbox';
animationCheckbox.addEventListener('change', toggleAnimationEffects);
const animationLabel = document.createElement('label');
animationLabel.htmlFor = 'animationCheckbox';
animationLabel.textContent = 'Animation';
animationControlDiv.appendChild(animationCheckbox);
animationControlDiv.appendChild(animationLabel);
effectControls.appendChild(animationControlDiv);




function handleCanvasClick(event) {
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (rect.width / imageCanvas.width));
    const y = Math.floor((event.clientY - rect.top) / (rect.height / imageCanvas.height));
    performMagicWandSelection(x, y);
}

function performMagicWandSelection(startX, startY) {
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const worker = new Worker('magicWand1Worker.js');
    worker.postMessage({
        imageData: imageData,
        startX: startX,
        startY: startY,
        tolerance: tolerance,
        mode: magicWandMode
    });
    worker.onmessage = function(e) {
        let newRegion = e.data.selectedRegion;
        console.log(newRegion);
        updateSelectedRegions(newRegion);
        updateObjectMask(newRegion); // Update object mask with new region
        displaySelectedRegionsBorders();
    };
}

function updateSelectedRegions(newRegion) {
    if (magicWandMode === 'add') {
        selectedRegions.push(newRegion);
    } else if (magicWandMode === 'subtract') {
        selectedRegions = selectedRegions.map(region => 
            region.filter(pixel => !newRegion.includes(pixel))
        );
    } else if (magicWandMode === 'invert') {
        selectedRegions = selectedRegions.map(region => {
            let invertedRegion = region.filter(pixel => !newRegion.includes(pixel))
                .concat(newRegion.filter(pixel => !region.includes(pixel)));
            return invertedRegion;
        });
    }
}

function updateObjectMask(newRegion) {
    if (!objectMask) {
        objectMask = matrix(imageCanvas.width, imageCanvas.height, false);
    }
    newRegion.forEach(pixelIndex => {
        const x = pixelIndex % imageCanvas.width;
        const y = Math.floor(pixelIndex / imageCanvas.width);
        objectMask[y][x] = true;
    });
}

function displaySelectedRegionsBorders() {
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(originalImage, 0, 0);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    selectedRegions.forEach(region => {
        ctx.beginPath();
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageCanvas.width;
            const y = Math.floor(pixelIndex / imageCanvas.width);
            ctx.rect(x, y, 1, 1);
        });
        ctx.stroke();
    });
}

function startResizing() {
    if (!originalImage || !originalImage.complete || !originalImage.naturalWidth) {
        alert('Image not loaded.');
        return;
    }

    if (!originalImageData) {
        alert('No image data available.');
        return;
    }

    const toWidth = parseInt(widthInput.value);
    const toHeight = parseInt(heightInput.value);

    if (isNaN(toWidth) || isNaN(toHeight)) {
        alert('Please enter valid width and height values.');
        return;
    }

    if (toWidth >= originalImage.width && toHeight >= originalImage.height) {
        alert('Please enter at least one dimension smaller than the original image.');
        return;
    }

    const resizedImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );

    resizeImage(
        resizedImageData,
        toWidth,
        toHeight,
        ({ step, steps }) => {
            progressDiv.textContent = `Resizing... ${Math.round((step / steps) * 100)}%`;
        }
    ).then(() => {
        imageCanvas.width = toWidth;
        imageCanvas.height = toHeight;
        ctx.putImageData(resizedImageData, 0, 0);
        progressDiv.textContent = 'Resizing complete!';
    });
}

function toggleDrawMode() {
    drawMode = !drawMode;
    toggleDrawButton.textContent = drawMode ? 'Disable Draw' : 'Enable Draw';
}

function startDrawing(e) {
    if (!drawMode) return;
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing || !drawMode) return;
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (objectMask) {
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                if (x + i >= 0 && x + i < imageCanvas.width && y + j >= 0 && y + j < imageCanvas.height) {
                    objectMask[y + j][x + i] = true;
                }
            }
        }
    }
}

function stopDrawing() {
    isDrawing = false;
}

function performMagicWandSelection(startX, startY) {
    const imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
    const worker = new Worker('magicWand1Worker.js');
    worker.postMessage({
        imageData: imageData,
        startX: startX,
        startY: startY,
        tolerance: tolerance,
        mode: magicWandMode
    });
    worker.onmessage = function(e) {
        let newRegion = e.data.selectedRegion;
        console.log(newRegion);
        updateSelectedRegions(newRegion);
        updateObjectMask(newRegion); // Update object mask with new region
        displaySelectedRegionsBorders();
    };
}

function updateSelectedRegions(newRegion) {
    if (magicWandMode === 'add') {
        selectedRegions.push(newRegion);
    } else if (magicWandMode === 'subtract') {
        selectedRegions = selectedRegions.map(region => 
            region.filter(pixel => !newRegion.includes(pixel))
        );
    } else if (magicWandMode === 'invert') {
        selectedRegions = selectedRegions.map(region => {
            let invertedRegion = region.filter(pixel => !newRegion.includes(pixel))
                .concat(newRegion.filter(pixel => !region.includes(pixel)));
            return invertedRegion;
        });
    }
}

function updateObjectMask(newRegion) {
    if (!objectMask) {
        objectMask = matrix(imageCanvas.width, imageCanvas.height, false);
    }
    newRegion.forEach(pixelIndex => {
        const x = pixelIndex % imageCanvas.width;
        const y = Math.floor(pixelIndex / imageCanvas.width);
        objectMask[y][x] = true;
    });
}

function displaySelectedRegionsBorders() {
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(originalImage, 0, 0);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 1;
    selectedRegions.forEach(region => {
        ctx.beginPath();
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageCanvas.width;
            const y = Math.floor(pixelIndex / imageCanvas.width);
            ctx.rect(x, y, 1, 1);
        });
        ctx.stroke();
    });
}

function startResizing() {
    if (!originalImage || !originalImage.complete || !originalImage.naturalWidth) {
        alert('Image not loaded.');
        return;
    }

    if (!originalImageData) {
        alert('No image data available.');
        return;
    }

    const toWidth = parseInt(widthInput.value);
    const toHeight = parseInt(heightInput.value);

    if (isNaN(toWidth) || isNaN(toHeight)) {
        alert('Please enter valid width and height values.');
        return;
    }

    if (toWidth >= originalImage.width && toHeight >= originalImage.height) {
        alert('Please enter at least one dimension smaller than the original image.');
        return;
    }

    const resizedImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        originalImageData.width,
        originalImageData.height
    );

    resizeImage(
        resizedImageData,
        toWidth,
        toHeight,
        ({ step, steps }) => {
            progressDiv.textContent = `Resizing... ${Math.round((step / steps) * 100)}%`;
        }
    ).then(() => {
        imageCanvas.width = toWidth;
        imageCanvas.height = toHeight;
        ctx.putImageData(resizedImageData, 0, 0);
        progressDiv.textContent = 'Resizing complete!';
    });
}

function toggleDrawMode() {
    drawMode = !drawMode;
    toggleDrawButton.textContent = drawMode ? 'Disable Draw' : 'Enable Draw';
}

function startDrawing(e) {
    if (!drawMode) return;
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing || !drawMode) return;
    const rect = imageCanvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    if (objectMask) {
        for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
                if (x + i >= 0 && x + i < imageCanvas.width && y + j >= 0 && y + j < imageCanvas.height) {
                    objectMask[y + j][x + i] = true;
                }
            }
        }
    }
}

function stopDrawing() {
    isDrawing = false;
}
