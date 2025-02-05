// // squeezeXWorker.js

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const squeezedImageData = applySqueeze(imageData, value, 'x');
//     self.postMessage({ imageData: squeezedImageData });
// };

// function applySqueeze(imageData, value, axis) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     // Calculate squeeze factor (1 = no squeeze, 0.5 = half width/height, 2 = double width/height)
//     const squeezeFactor = 1 + (value - 0.5);

//     if (axis === 'x') {
//         const newWidth = imageData.width * squeezeFactor;
//         tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height, 
//                           (imageData.width - newWidth) / 2, 0, newWidth, imageData.height);
//     }

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// Constants
const DEFAULT_SQUEEZE_VALUE = 0.5;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to apply squeeze effect
function applySqueezeEffect(imageData, selectedRegions, squeezeValue, axis = 'x') {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Calculate anti-squeeze factor (1 = no anti-squeeze, 2 = double width, 0.5 = half width)
    const antiSqueezeFactor = 1 / (1 + (squeezeValue - 0.5));
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        // Apply squeeze effect only to selected regions
        const newImageData = createTransparentImageData(imageData.width, imageData.height);
        
        selectedRegions.forEach(region => {
            // Create a mask for the current region
            const maskCanvas = new OffscreenCanvas(imageData.width, imageData.height);
            const maskCtx = maskCanvas.getContext('2d');
            const maskImageData = maskCtx.createImageData(imageData.width, imageData.height);
            
            // Fill mask with the selected region
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const idx = (y * imageData.width + x) * 4;
                maskImageData.data[idx + 3] = 255; // Set alpha to fully opaque
            });
            
            maskCtx.putImageData(maskImageData, 0, 0);
            
            // Apply squeeze effect
            if (axis === 'x') {
                const newWidth = imageData.width * antiSqueezeFactor;
                tempCtx.clearRect(0, 0, imageData.width, imageData.height);
                tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height, 
                    (imageData.width - newWidth) / 2, 0, newWidth, imageData.height);
            } else {
                const newHeight = imageData.height * antiSqueezeFactor;
                tempCtx.clearRect(0, 0, imageData.width, imageData.height);
                tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height,
                    0, (imageData.height - newHeight) / 2, imageData.width, newHeight);
            }
            
            // Blend the squeezed region with the mask
            const squeezedData = tempCtx.getImageData(0, 0, imageData.width, imageData.height);
            const maskData = maskCtx.getImageData(0, 0, imageData.width, imageData.height);
            
            for (let i = 0; i < squeezedData.data.length; i += 4) {
                if (maskData.data[i + 3] > 0) {
                    for (let c = 0; c < 4; c++) {
                        newImageData.data[i + c] = squeezedData.data[i + c];
                    }
                }
            }
        });
        
        return newImageData;
    } else {
        // Apply squeeze effect to entire image
        if (axis === 'x') {
            const newWidth = imageData.width * antiSqueezeFactor;
            tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height,
                (imageData.width - newWidth) / 2, 0, newWidth, imageData.height);
        } else {
            const newHeight = imageData.height * antiSqueezeFactor;
            tempCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height,
                0, (imageData.height - newHeight) / 2, imageData.width, newHeight);
        }
        
        return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
    }
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_SQUEEZE_VALUE,
        value5: iterations = DEFAULT_ITERATIONS,
        axis = 'x',
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        const resultImageData = applySqueezeEffect(imageData, selectedRegions, value, axis);
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