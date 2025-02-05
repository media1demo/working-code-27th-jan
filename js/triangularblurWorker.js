// Constants
const DEFAULT_BLUR_RADIUS = 5;
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

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to calculate triangle height based on x position
function getTriangleHeight(x, width) {
    // Create an isosceles triangle effect
    return Math.abs(width / 2 - x) * 2;
}

// Function to apply triangular blur
function applyTriangularBlur(imageData, blurRadius) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const triangleHeight = getTriangleHeight(x, width);
            // Adjust blur radius based on position in triangle
            const localBlurRadius = Math.max(1, Math.floor(blurRadius * (1 - y / triangleHeight)));
            
            if (y < triangleHeight) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                // Calculate average of surrounding pixels
                for (let by = -localBlurRadius; by <= localBlurRadius; by++) {
                    for (let bx = -localBlurRadius; bx <= localBlurRadius; bx++) {
                        const cx = x + bx;
                        const cy = y + by;
                        
                        if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                            const idx = (cy * width + cx) * 4;
                            r += imageData.data[idx];
                            g += imageData.data[idx + 1];
                            b += imageData.data[idx + 2];
                            a += imageData.data[idx + 3];
                            count++;
                        }
                    }
                }
                
                // Set averaged pixel values
                const idx = (y * width + x) * 4;
                result.data[idx] = r / count;
                result.data[idx + 1] = g / count;
                result.data[idx + 2] = b / count;
                result.data[idx + 3] = a / count;
            }
        }
    }
    
    return result;
}

// Function to apply blur to selected regions
function blurSelectedRegions(imageData, selectedRegions, blurRadius) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    copyImageData(imageData, result);
    
    selectedRegions.forEach(region => {
        // Find bounds of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Create a map of pixels in the region
        const regionMap = new Set(region);
        
        // Apply blur only to pixels in the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (regionMap.has(pixelIndex)) {
                    const triangleHeight = getTriangleHeight(x - minX, maxX - minX);
                    const localBlurRadius = Math.max(1, Math.floor(blurRadius * (1 - (y - minY) / triangleHeight)));
                    
                    let r = 0, g = 0, b = 0, a = 0;
                    let count = 0;
                    
                    // Calculate average of surrounding pixels
                    for (let by = -localBlurRadius; by <= localBlurRadius; by++) {
                        for (let bx = -localBlurRadius; bx <= localBlurRadius; bx++) {
                            const cx = x + bx;
                            const cy = y + by;
                            
                            if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                                const idx = (cy * width + cx) * 4;
                                r += imageData.data[idx];
                                g += imageData.data[idx + 1];
                                b += imageData.data[idx + 2];
                                a += imageData.data[idx + 3];
                                count++;
                            }
                        }
                    }
                    
                    // Set averaged pixel values
                    const idx = (y * width + x) * 4;
                    result.data[idx] = r / count;
                    result.data[idx + 1] = g / count;
                    result.data[idx + 2] = b / count;
                    result.data[idx + 3] = a / count;
                }
            }
        }
    });
    
    return result;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: blurRadius = DEFAULT_BLUR_RADIUS,
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
            resultImageData = blurSelectedRegions(imageData, selectedRegions, blurRadius);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = applyTriangularBlur(imageData, blurRadius);
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