// Constants
const DEFAULT_PERSPECTIVE_FACTOR = 0.2;
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
function applyPerspective(x, y, width, height, perspectiveFactor, vanishX, vanishY) {
    // Calculate distance from point to vanishing point
    const dx = x - vanishX;
    const dy = y - vanishY;
    
    // Apply perspective transformation
    const distance = Math.sqrt(dx * dx + dy * dy);
    const factor = 1 + (distance * perspectiveFactor / height);
    
    // Transform coordinates
    const newX = vanishX + (dx / factor);
    const newY = vanishY + (dy / factor);
    
    return {
        x: Math.round(newX),
        y: Math.round(newY)
    };
}

// Function to apply perspective effect to the entire image
function applyPerspectiveEffect(imageData, perspectiveFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Get transformed position
            const transformed = applyPerspective(x, y, width, height, perspectiveFactor);
            
            // Only copy pixel if it's within bounds
            if (transformed.x >= 0 && transformed.x < width && 
                transformed.y >= 0 && transformed.y < height) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (transformed.y * width + transformed.x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    newImageData.data[destIdx + c] = imageData.data[sourceIdx + c];
                }
            }
        }
    }
    
    return newImageData;
}

// Function to apply perspective to selected regions
function transformSelectedRegions(imageData, selectedRegions, perspectiveFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    
    // Copy original image
    newImageData.data.set(imageData.data);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region in the new image
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Transform pixels in the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const transformed = applyPerspective(x, y, width, height, perspectiveFactor);
            
            if (transformed.x >= 0 && transformed.x < width && 
                transformed.y >= 0 && transformed.y < height) {
                const sourceIndex = pixelIndex * 4;
                const targetIndex = (transformed.y * width + transformed.x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend transformed pixels
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
        value2: perspectiveFactor = DEFAULT_PERSPECTIVE_FACTOR,
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
            const factor = perspectiveFactor * (currentIteration / iterations);
            resultImageData = transformSelectedRegions(imageData, selectedRegions, factor);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            const factor = perspectiveFactor * (currentIteration / iterations);
            resultImageData = applyPerspectiveEffect(imageData, factor);
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