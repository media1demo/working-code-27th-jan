const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function tiltRegion(imageData, value, selectedRegions) {
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
        
        const regionSet = new Set(region);
        const regionWidth = maxX - minX;
        const regionHeight = maxY - minY;
        
        // Perspective tilt parameters
        const tiltAngle = value * Math.PI / 6; // Max 30 degrees tilt
        const verticalScale = Math.cos(tiltAngle);
        const perspectiveStrength = Math.sin(tiltAngle) * 0.5;
        
        // Process each pixel in the region bounds
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;
                
                // Calculate normalized coordinates
                const normalizedY = (y - minY) / regionHeight;
                
                // Apply perspective transformation
                // This creates a forward/backward tilt effect
                const perspectiveFactor = 1 + (normalizedY - 0.5) * perspectiveStrength;
                const sourceX = minX + (x - minX) / perspectiveFactor;
                const sourceY = minY + (y - minY) * verticalScale;
                
                if (sourceX >= minX && sourceX < maxX - 1 && 
                    sourceY >= minY && sourceY < maxY - 1) {
                    
                    // Bilinear interpolation points
                    const x1 = Math.floor(sourceX);
                    const x2 = x1 + 1;
                    const y1 = Math.floor(sourceY);
                    const y2 = y1 + 1;
                    
                    const wx = sourceX - x1;
                    const wy = sourceY - y1;
                    
                    // Check if all interpolation points are within the region
                    const points = [
                        y1 * width + x1,
                        y1 * width + x2,
                        y2 * width + x1,
                        y2 * width + x2
                    ];
                    
                    if (points.every(p => regionSet.has(p))) {
                        const targetIndex = (y * width + x) * 4;
                        
                        // Perform bilinear interpolation for each color channel
                        for (let i = 0; i < 4; i++) {
                            const topLeft = pixels[(y1 * width + x1) * 4 + i];
                            const topRight = pixels[(y1 * width + x2) * 4 + i];
                            const bottomLeft = pixels[(y2 * width + x1) * 4 + i];
                            const bottomRight = pixels[(y2 * width + x2) * 4 + i];
                            
                            // Bilinear interpolation
                            const top = topLeft * (1 - wx) + topRight * wx;
                            const bottom = bottomLeft * (1 - wx) + bottomRight * wx;
                            const interpolatedValue = Math.round(top * (1 - wy) + bottom * wy);
                            
                            newImageData.data[targetIndex + i] = interpolatedValue;
                        }
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
        const resultImageData = tiltRegion(imageData, value, selectedRegions);
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