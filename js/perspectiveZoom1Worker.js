const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function zoomSelectedRegions(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    // Create a new ImageData object to store the result
    const newImageData = new ImageData(width, height);

    // Copy the original image data to the new ImageData
    newImageData.data.set(pixels);

    if (!selectedRegions?.length) {
        return newImageData;
    }

    const zoomFactor = 1 + value * 2; // 1 to 3
    const centerX = width / 2;
    const centerY = height / 2;

    selectedRegions.forEach(region => {
        if (!region.length) return;

        // Create a Set for faster lookup of selected pixels
        const regionSet = new Set(region);

        // Process only pixels within the selected region
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;

                // Skip pixels outside the selected region
                if (!regionSet.has(pixelIndex)) continue;

                // Calculate relative coordinates from the center
                const dx = x - centerX;
                const dy = y - centerY;

                // Calculate source coordinates with zoom effect
                const sourceX = Math.round(centerX + dx / zoomFactor);
                const sourceY = Math.round(centerY + dy / zoomFactor);

                // Ensure source coordinates are within bounds
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const oldIndex = (sourceY * width + sourceX) * 4;
                    const newIndex = (y * width + x) * 4;

                    // Copy pixel data from the source position to the new position
                    newImageData.data[newIndex] = pixels[oldIndex];
                    newImageData.data[newIndex + 1] = pixels[oldIndex + 1];
                    newImageData.data[newIndex + 2] = pixels[oldIndex + 2];
                    newImageData.data[newIndex + 3] = pixels[oldIndex + 3];
                }
            }
        }
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;

        const resultImageData = zoomSelectedRegions(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({ 
            error: error.message, 
            isComplete: true 
        });
    }
};