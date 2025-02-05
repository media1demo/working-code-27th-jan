// Constants
const DEFAULT_VIBRANCE = 50;
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

// Helper function to calculate luminance
function getLuminance(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Helper function to calculate saturation
function getSaturation(r, g, b) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max === 0 ? 0 : (max - min) / max;
}

// Function to apply vibrance to a pixel
function applyVibranceToPixel(r, g, b, vibranceAmount) {
    // Convert vibrance from -100 to 100 range to -1 to 1
    const amount = vibranceAmount / 100;
    
    // Calculate average and saturation
    const avg = (r + g + b) / 3;
    const max = Math.max(r, g, b);
    const amt = (Math.abs(max - avg) * 2 / 255) * amount;
    
    // Adjust each channel
    const rr = r + (r - avg) * amt;
    const gg = g + (g - avg) * amt;
    const bb = b + (b - avg) * amt;
    
    // Clamp values between 0 and 255
    return [
        Math.min(255, Math.max(0, rr)),
        Math.min(255, Math.max(0, gg)),
        Math.min(255, Math.max(0, bb))
    ];
}

// Function to apply vibrance to entire image
function applyVibrance(imageData, vibranceAmount) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const a = imageData.data[i + 3];
        
        if (a > 0) {
            const [rr, gg, bb] = applyVibranceToPixel(r, g, b, vibranceAmount);
            
            result.data[i] = rr;
            result.data[i + 1] = gg;
            result.data[i + 2] = bb;
            result.data[i + 3] = a;
        }
    }
    
    return result;
}

// Function to apply vibrance to selected regions
function applyVibranceToRegions(imageData, selectedRegions, vibranceAmount) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    copyImageData(imageData, result);
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const i = pixelIndex * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const a = imageData.data[i + 3];
            
            if (a > 0) {
                const [rr, gg, bb] = applyVibranceToPixel(r, g, b, vibranceAmount);
                
                result.data[i] = rr;
                result.data[i + 1] = gg;
                result.data[i + 2] = bb;
                result.data[i + 3] = a;
            }
        });
    });
    
    return result;
}

// Main worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: vibranceAmount = DEFAULT_VIBRANCE,
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
            resultImageData = applyVibranceToRegions(imageData, selectedRegions, vibranceAmount);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = applyVibrance(imageData, vibranceAmount);
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