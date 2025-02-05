// Constants
const DEFAULT_RIPPLE_RADIUS = 50;
const DEFAULT_RIPPLE_ITERATIONS = 120;
const DEFAULT_RIPPLE_DELAY = 20;

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

// Function to apply ripple effect to the image
function applyRippleEffect(imageData, selectedRegions, rippleRadius) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);

    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Calculate the distance from the center of the ripple
            const distFromCenter = Math.sqrt((x - width / 2) ** 2 + (y - height / 2) ** 2);

            // Calculate the alpha value based on the distance from the center
            const alpha = 1 - Math.min(distFromCenter / rippleRadius, 1);

            // Update the pixel color with the ripple effect
            const baseIndex = pixelIndex * 4;
            newImageData.data[baseIndex + 0] = imageData.data[baseIndex + 0] * alpha;
            newImageData.data[baseIndex + 1] = imageData.data[baseIndex + 1] * alpha;
            newImageData.data[baseIndex + 2] = imageData.data[baseIndex + 2] * alpha;
            newImageData.data[baseIndex + 3] = imageData.data[baseIndex + 3] * alpha;
        });
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: rippleRadius = DEFAULT_RIPPLE_RADIUS,
        value5: iterations = DEFAULT_RIPPLE_ITERATIONS,
        value2: rippleDelay = DEFAULT_RIPPLE_DELAY,
        reset 
    } = e.data;

    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        // Apply ripple effect to the selected regions
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyRippleEffect(imageData, selectedRegions, rippleRadius);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Fall back to the original image
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
            progress
        });

    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};