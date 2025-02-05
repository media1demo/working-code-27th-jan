const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function skewRegion(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
    if (!selectedRegions?.length) {
        return newImageData;
    }
    
    selectedRegions.forEach(region => {
        if (!region.length) return;
        
        // Find bounds of region
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
        
        // Calculate skew angle (map value from 0-1 to a reasonable skew angle)
        const skewAngle = (value - 0.5) * Math.PI / 2; // Convert to range -PI/4 to PI/4
        const skewFactor = Math.tan(skewAngle);
        const regionSet = new Set(region);

        // Process each pixel in the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                // Apply horizontal skew
                // In a skew, x' = x + y * tan(angle)
                const skewedX = Math.round(x + (y - minY) * skewFactor);
                
                // Check if skewed position is within bounds
                if (skewedX >= 0 && skewedX < width) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (y * width + skewedX) * 4;
                    
                    // Only copy if we're still within the region bounds
                    if (skewedX >= minX && skewedX <= maxX) {
                        newImageData.data[targetIndex] = pixels[sourceIndex];
                        newImageData.data[targetIndex + 1] = pixels[sourceIndex + 1];
                        newImageData.data[targetIndex + 2] = pixels[sourceIndex + 2];
                        newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
                    }
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
        const resultImageData = skewRegion(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};