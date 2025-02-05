const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function twistRegion(imageData, value, selectedRegions) {
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
        const twistAngle = value * Math.PI * 2;
        
        // Calculate center of the region for twist
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const maxDistance = Math.sqrt(
            Math.pow(Math.max(maxX - centerX, centerX - minX), 2) +
            Math.pow(Math.max(maxY - centerY, centerY - minY), 2)
        );

        // Process only pixels within the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate twist angle based on distance from center
                const angle = Math.atan2(dy, dx) + twistAngle * (1 - distance / maxDistance);
                
                const sourceX = centerX + distance * Math.cos(angle);
                const sourceY = centerY + distance * Math.sin(angle);

                if (sourceX >= minX && sourceX < maxX - 1 && 
                    sourceY >= minY && sourceY < maxY - 1) {
                    
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;

                    // Only interpolate if all source points are within the region
                    const sourcePoints = [
                        y1 * width + x1,
                        y1 * width + x2,
                        y2 * width + x1,
                        y2 * width + x2
                    ];

                    if (sourcePoints.every(point => regionSet.has(point))) {
                        const wx = sourceX - x1;
                        const wy = sourceY - y1;
                        const targetIndex = pixelIndex * 4;

                        for (let i = 0; i < 4; i++) {
                            const topLeft = pixels[(y1 * width + x1) * 4 + i];
                            const topRight = pixels[(y1 * width + x2) * 4 + i];
                            const bottomLeft = pixels[(y2 * width + x1) * 4 + i];
                            const bottomRight = pixels[(y2 * width + x2) * 4 + i];

                            const interpolatedValue = 
                                topLeft * (1 - wx) * (1 - wy) +
                                topRight * wx * (1 - wy) +
                                bottomLeft * (1 - wx) * wy +
                                bottomRight * wx * wy;

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
        
        const resultImageData = twistRegion(imageData, value, selectedRegions);
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