// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const rotatedImageData = rotateImage(imageData, value, 'topRight');
//     self.postMessage({ imageData: rotatedImageData });
// };

// function rotateImage(imageData, angle, corner) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.translate(imageData.width, 0);
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(-imageData.width, 0);

//     tempCtx.drawImage(canvas, 0, 0);

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// Constants
const DEFAULT_ANGLE = 30;
const DEFAULT_ITERATIONS = 12;

let currentIteration = 0;

function rotateImageRegion(imageData, region, angle) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calculate region center
    let minX = imageData.width, minY = imageData.height;
    let maxX = 0, maxY = 0;
    
    region.forEach(pixelIndex => {
        const x = pixelIndex % imageData.width;
        const y = Math.floor(pixelIndex / imageData.width);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    tempCtx.translate(centerX, centerY);
    tempCtx.rotate(angle * Math.PI / 180);
    tempCtx.translate(-centerX, -centerY);
    
    tempCtx.drawImage(canvas, 0, 0);
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions,
        value: angle = DEFAULT_ANGLE,
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        if (selectedRegions?.length > 0) {
            selectedRegions.forEach(region => {
                const currentAngle = (angle * currentIteration) % 360;
                resultImageData = rotateImageRegion(resultImageData, region, currentAngle);
            });
        }
        
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};