
const DEFAULT_ITERATIONS = 120;
const DEFAULT_SCALE_FACTOR = 0.5;
const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;

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

// Function to scale region vertically
function scaleRegionVertically(imageData, region, scaleFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Get region bounds
    let minY = height;
    let maxY = 0;
    region.forEach(pixelIndex => {
        const y = Math.floor(pixelIndex / width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });
    
    const centerY = (minY + maxY) / 2;
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Clear selected region
    region.forEach(pixelIndex => {
        const baseIndex = pixelIndex * 4;
        for (let c = 0; c < 4; c++) {
            newImageData.data[baseIndex + c] = 0;
        }
    });
    
    // Scale pixels
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Calculate new Y position based on distance from center
        const distanceFromCenter = y - centerY;
        const newY = Math.round(centerY + (distanceFromCenter * scaleFactor));
        
        if (newY >= 0 && newY < height) {
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = (newY * width + x) * 4;
            
            for (let c = 0; c < 4; c++) {
                tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
            }
        }
    });
    
    // Blend scaled pixels
    for (let i = 0; i < tempBuffer.length; i += 4) {
        if (tempBuffer[i + 3] > 0) {
            for (let c = 0; c < 4; c++) {
                newImageData.data[i + c] = tempBuffer[i + c];
            }
        }
    }
    
    return newImageData;
}

function animateSelectedRegions(imageData, selectedRegions, progress) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Calculate scale factor based on animation phase and progress
    let scaleFactor;
    if (currentPhase === ANIMATION_PHASES.OPENING) {
        scaleFactor = 1 + (DEFAULT_SCALE_FACTOR * progress); // Expand
    } else {
        scaleFactor = 1 + (DEFAULT_SCALE_FACTOR * (1 - progress)); // Contract
    }
    
    selectedRegions.forEach(region => {
        const resultImageData = scaleRegionVertically(newImageData, region, scaleFactor);
        copyImageData(resultImageData, newImageData);
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset animation if requested
        if (reset) {
            currentIteration = 0;
            currentPhase = ANIMATION_PHASES.OPENING;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Calculate progress within current phase
            progress = currentIteration / (iterations / 2);
            
            // Handle phase transition
            if (progress >= 1) {
                currentPhase = currentPhase === ANIMATION_PHASES.OPENING 
                    ? ANIMATION_PHASES.CLOSING 
                    : ANIMATION_PHASES.OPENING;
                currentIteration = 0;
                progress = 0;
            }
            
            // Animate selected regions
            resultImageData = animateSelectedRegions(imageData, selectedRegions, progress);
            currentIteration++;
        } else {
            // If no regions selected, return original image
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = undefined;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress,
            phase: currentPhase
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};