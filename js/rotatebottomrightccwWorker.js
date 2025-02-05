const DEFAULT_ANGLE = 30;
const DEFAULT_ITERATIONS = 12;
let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function rotateSelectedRegions(imageData, selectedRegions, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    selectedRegions.forEach(region => {
        if (!region || region.length === 0) return;

        // Create a map of selected pixels for quick lookup
        const selectedPixels = new Set(region);
        
        // Rotation center is bottom-right corner (width - 1, height - 1)
        const centerX = width - 1;
        const centerY = height - 1;

        // Create temporary buffer for rotated pixels
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear the original region in the result
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                resultImageData.data[baseIndex + i] = 0;
            }
        });

        // Rotate each pixel in the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = angle * Math.PI / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            // New coordinates after rotation
            const newX = Math.round(centerX + (dx * cos - dy * sin));
            const newY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = pixelIndex * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                // Copy pixel data to temporary buffer
                for (let i = 0; i < 4; i++) {
                    tempBuffer[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        });

        // Copy only the rotated pixels that belong to the original shape
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation to find source pixel
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = -angle * Math.PI / 180; // Inverse rotation to find source
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            const sourceX = Math.round(centerX + (dx * cos - dy * sin));
            const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = pixelIndex * 4;
                
                // Only copy if source pixel had data
                if (tempBuffer[sourceIndex + 3] > 0) {
                    for (let i = 0; i < 4; i++) {
                        resultImageData.data[targetIndex + i] = tempBuffer[sourceIndex + i];
                    }
                }
            }
        });
    });
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: angle = DEFAULT_ANGLE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegions(imageData, selectedRegions, angle);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = angle * (currentIteration + 1);
            resultImageData = rotateSelectedRegions(imageData, [[...Array(imageData.width * imageData.height).keys()]], totalRotation);
            currentIteration++;
            progress = undefined;
        }
        
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