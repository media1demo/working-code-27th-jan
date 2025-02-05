
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

// Function to apply vertical squeeze effect
function applySqueezeEffect(imageData, selectedRegions, squeezeValue) {
    // Create main canvas
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    // Create result canvas
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    
    // First, copy the original image data
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    // Calculate squeeze factor for y-direction
    const squeezeFactor = 1 / (1 + (squeezeValue - 0.5));
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        selectedRegions.forEach(region => {
            // Find bounds of the region
            let minX = imageData.width, maxX = 0;
            let minY = imageData.height, maxY = 0;
            
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
            
            // Create a region mask
            const regionPixels = new Set(region);
            
            // Create temporary canvas for the squeezed content
            const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
            const tempCtx = tempCanvas.getContext('2d', { alpha: true });
            tempCtx.clearRect(0, 0, imageData.width, imageData.height);
            
            // Draw only the selected region to temp canvas
            const tempImageData = tempCtx.createImageData(imageData.width, imageData.height);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const pixelIndex = y * imageData.width + x;
                    if (regionPixels.has(pixelIndex)) {
                        const i = pixelIndex * 4;
                        for (let c = 0; c < 4; c++) {
                            tempImageData.data[i + c] = imageData.data[i + c];
                        }
                    }
                }
            }
            tempCtx.putImageData(tempImageData, 0, 0);
            
            // Clear the region in the result
            for (const pixelIndex of region) {
                const i = pixelIndex * 4;
                for (let c = 0; c < 4; c++) {
                    resultImageData.data[i + c] = 0;
                }
            }
            
            // Apply vertical squeeze effect
            resultCtx.clearRect(0, 0, imageData.width, imageData.height);
            resultCtx.putImageData(resultImageData, 0, 0);
            
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            const newHeight = height * squeezeFactor;
            const offsetY = (height - newHeight) / 2;
            
            resultCtx.drawImage(tempCanvas, 
                minX, minY, width, height,
                minX, minY + offsetY, width, newHeight
            );
            
            // Update result image data
            const newRegionData = resultCtx.getImageData(0, 0, imageData.width, imageData.height);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const i = (y * imageData.width + x) * 4;
                    if (newRegionData.data[i + 3] > 0) {
                        for (let c = 0; c < 4; c++) {
                            resultImageData.data[i + c] = newRegionData.data[i + c];
                        }
                    }
                }
            }
        });
    } else {
        // If no regions selected, apply to entire image
        const newHeight = imageData.height * squeezeFactor;
        resultCtx.clearRect(0, 0, imageData.width, imageData.height);
        resultCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height,
            0, (imageData.height - newHeight) / 2, imageData.width, newHeight);
        resultImageData.data.set(resultCtx.getImageData(0, 0, imageData.width, imageData.height).data);
    }
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_SQUEEZE_VALUE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        const resultImageData = applySqueezeEffect(imageData, selectedRegions, value);
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