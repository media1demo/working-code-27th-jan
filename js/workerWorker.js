// Constants
const DEFAULT_INTENSITY = 1; // Controls the strength of the bulge
const DEFAULT_ITERATIONS = 5; // Number of iterations (if needed)

// Global variable to track iterations
let currentIteration = 0;

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_INTENSITY,
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
            console.log('Processing selected regions:', selectedRegions);
            resultImageData = applyBulgingToRegions(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            console.log('Processing full image');
            resultImageData = applyBulging(imageData, value);
            currentIteration++;
            progress = undefined;
        }
        
        // Send the result back to the main thread
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        // Handle errors and send them back to the main thread
        console.error('Worker error:', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function applyBulging(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data); // Copy the original image data

    // Center of the image
    const centerX = width / 2;
    const centerY = height / 2;

    // Maximum radius for the bulge effect
    const maxRadius = Math.min(width, height) / 2;

    // Apply bulging effect
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate distance from the center
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Normalize distance and apply bulge effect
            if (distance < maxRadius) {
                const angle = Math.atan2(dy, dx);
                const scale = 1 - (distance / maxRadius);
                const newDistance = distance * (1 - intensity * scale * scale);

                // Calculate new pixel position
                const newX = Math.round(centerX + newDistance * Math.cos(angle));
                const newY = Math.round(centerY + newDistance * Math.sin(angle));

                // Ensure the new position is within bounds
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const newIndex = (newY * width + newX) * 4;
                    const oldIndex = (y * width + x) * 4;

                    // Copy pixel data
                    data[oldIndex] = imageData.data[newIndex]; // Red
                    data[oldIndex + 1] = imageData.data[newIndex + 1]; // Green
                    data[oldIndex + 2] = imageData.data[newIndex + 2]; // Blue
                    data[oldIndex + 3] = imageData.data[newIndex + 3]; // Alpha
                }
            }
        }
    }

    // Return the modified image data
    return new ImageData(data, width, height);
}

function applyBulgingToRegions(imageData, selectedRegions, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = new Uint8ClampedArray(imageData.data); // Copy the original image data

    // Process each selected region
    selectedRegions.forEach(region => {
        const [x1, y1, x2, y2] = region; // Example: region is [x1, y1, x2, y2]

        // Center of the region
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        // Maximum radius for the bulge effect
        const maxRadius = Math.min(x2 - x1, y2 - y1) / 2;

        // Apply bulging effect within the region
        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                // Calculate distance from the center of the region
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Normalize distance and apply bulge effect
                if (distance < maxRadius) {
                    const angle = Math.atan2(dy, dx);
                    const scale = 1 - (distance / maxRadius);
                    const newDistance = distance * (1 - intensity * scale * scale);

                    // Calculate new pixel position
                    const newX = Math.round(centerX + newDistance * Math.cos(angle));
                    const newY = Math.round(centerY + newDistance * Math.sin(angle));

                    // Ensure the new position is within bounds
                    if (newX >= x1 && newX < x2 && newY >= y1 && newY < y2) {
                        const newIndex = (newY * width + newX) * 4;
                        const oldIndex = (y * width + x) * 4;

                        // Copy pixel data
                        data[oldIndex] = imageData.data[newIndex]; // Red
                        data[oldIndex + 1] = imageData.data[newIndex + 1]; // Green
                        data[oldIndex + 2] = imageData.data[newIndex + 2]; // Blue
                        data[oldIndex + 3] = imageData.data[newIndex + 3]; // Alpha
                    }
                }
            }
        }
    });

    // Return the modified image data
    return new ImageData(data, width, height);
}