const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function rotateRegion(imageData, value, selectedRegions) {
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

        // Calculate center of region
        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;
        const regionSet = new Set(region);

        // Calculate rotation angle based on value (0 to 360 degrees)
        const angle = value * Math.PI * 2;
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        // Process each pixel in the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!regionSet.has(y * width + x)) continue;

                // Translate point to origin
                const dx = x - centerX;
                const dy = y - centerY;

                // Apply rotation
                const rotatedX = Math.round(centerX + dx * cosAngle - dy * sinAngle);
                const rotatedY = Math.round(centerY + dx * sinAngle + dy * cosAngle);

                // Check if rotated position is within region bounds
                if (rotatedX >= minX && rotatedX <= maxX && 
                    rotatedY >= minY && rotatedY <= maxY &&
                    regionSet.has(rotatedY * width + rotatedX)) {
                    
                    const sourceIndex = (rotatedY * width + rotatedX) * 4;
                    const targetIndex = (y * width + x) * 4;

                    // Copy pixel data
                    newImageData.data[targetIndex] = pixels[sourceIndex];
                    newImageData.data[targetIndex + 1] = pixels[sourceIndex + 1];
                    newImageData.data[targetIndex + 2] = pixels[sourceIndex + 2];
                    newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
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
        const resultImageData = rotateRegion(imageData, value, selectedRegions);
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