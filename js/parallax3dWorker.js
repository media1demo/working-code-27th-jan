const DEFAULT_ITERATIONS = 120;
const DEFAULT_SCALE_FACTOR = 0.5;
const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;
let currentShapeIndex = 0;

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to apply parallax effect to a region
function applyParallaxToRegion(imageData, region, scrollOffset, depth) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Calculate parallax shift based on scroll offset and depth
    const parallaxShift = Math.round(scrollOffset * depth);
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Clear selected region
    region.forEach(pixelIndex => {
        const baseIndex = pixelIndex * 4;
        for (let c = 0; c < 4; c++) {
            newImageData.data[baseIndex + c] = 0;
        }
    });
    
    // Apply parallax shift to pixels
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const sourceIndex = (y * width + x) * 4;
        
        // Calculate new position with parallax effect
        const newY = (y + parallaxShift + height) % height;
        const targetIndex = (newY * width + x) * 4;
        
        // Handle wrapping for smooth transition
        if (newY >= 0 && newY < height) {
            for (let c = 0; c < 4; c++) {
                tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
            }
        }
    });
    
    // Blend shifted pixels with alpha fade at edges
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (tempBuffer[i + 3] > 0) {
                // Calculate fade factor based on position
                const fadeTop = Math.min(y / (height * 0.1), 1);
                const fadeBottom = Math.min((height - y) / (height * 0.1), 1);
                const alpha = Math.min(fadeTop, fadeBottom);
                
                for (let c = 0; c < 3; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
                newImageData.data[i + 3] = tempBuffer[i + 3] * alpha;
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        scrollOffset = 0,  // New parameter for scroll position
        iterations = DEFAULT_ITERATIONS,
        reset
    } = e.data;
    
    try {

        if (reset) {
            currentIteration = 0;
            currentPhase = ANIMATION_PHASES.OPENING;
            currentShapeIndex = 0;
        }
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = createTransparentImageData(imageData.width, imageData.height);
            copyImageData(imageData, resultImageData);
            
            // Apply different depths to different regions for parallax effect
            selectedRegions.forEach((region, index) => {
                const depth = 0.5 + (index * 0.25); // Different depths for different regions
                const parallaxResult = applyParallaxToRegion(
                    resultImageData,
                    region,
                    scrollOffset,
                    depth
                );
                copyImageData(parallaxResult, resultImageData);
            });
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};