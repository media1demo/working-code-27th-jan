// Constants
const DEFAULT_SQUEEZE_FACTOR = 0.3; // How much to squeeze horizontally
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

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to squeeze entire region
function squeezeRegion(imageData, squeezeFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    // Clear destination area
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 0;     // R
        imageData.data[i + 1] = 0; // G
        imageData.data[i + 2] = 0; // B
        imageData.data[i + 3] = 0; // A
    }
    
    // Calculate center of the image
    const centerX = width / 2;
    
    // Squeeze pixels towards center
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate new x position - squeeze towards center
            const distFromCenter = x - centerX;
            const newX = Math.round(centerX + distFromCenter * (1 - squeezeFactor));
            
            // Only process if new position is within bounds
            if (newX >= 0 && newX < width) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (y * width + newX) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to squeeze selected regions
function squeezeSelectedRegions(imageData, selectedRegions, squeezeFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Find the center of the region
        let minX = width, maxX = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
        });
        const regionCenterX = (minX + maxX) / 2;
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Move pixels
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate new x position - squeeze towards region center
            const distFromCenter = x - regionCenterX;
            const newX = Math.round(regionCenterX + distFromCenter * (1 - squeezeFactor));
            
            if (newX >= 0 && newX < width) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (y * width + newX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend moved pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: squeezeFactor = DEFAULT_SQUEEZE_FACTOR,
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
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = squeezeSelectedRegions(
                imageData, 
                selectedRegions, 
                squeezeFactor * (currentIteration / iterations)
            );
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const currentSqueeze = squeezeFactor * (currentIteration / iterations);
            squeezeRegion(resultImageData, currentSqueeze);
            currentIteration++;
            progress = currentIteration / iterations;
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