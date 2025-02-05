const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

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

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function expandRegion(selectedRegions, width, height, expansionFactor) {
    const originalSet = new Set(selectedRegions.flat());
    const expandedSet = new Set();
    
    // Find bounds of original region
    let minX = width, maxX = 0, minY = height, maxY = 0;
    originalSet.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });
    
    // Calculate center and radius
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = Math.max(
        maxX - minX,
        maxY - minY
    ) / 2 * expansionFactor;
    
    // Add expanded pixels in a circular pattern
    const expandedRadius = radius * expansionFactor;
    for (let y = Math.max(0, centerY - expandedRadius); y <= Math.min(height - 1, centerY + expandedRadius); y++) {
        for (let x = Math.max(0, centerX - expandedRadius); x <= Math.min(width - 1, centerX + expandedRadius); x++) {
            if (calculateDistance(x, y, centerX, centerY) <= expandedRadius) {
                expandedSet.add(y * width + x);
            }
        }
    }
    
    return {
        originalSet,
        expandedSet,
        center: { x: centerX, y: centerY },
        radius
    };
}

function zoomSelectedRegions(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    if (!selectedRegions?.length) return newImageData;
    
    const zoomFactor = 1 + value * 2;
    const { expandedSet, center, radius } = expandRegion(selectedRegions, width, height, zoomFactor);
    
    // Process expanded region with lens effect
    expandedSet.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Calculate distance from center
        const distanceFromCenter = calculateDistance(x, y, center.x, center.y);
        const normalizedDistance = distanceFromCenter / radius;
        
        // Apply lens distortion
        const distortionFactor = 1 - Math.pow(normalizedDistance, 2) * (zoomFactor - 1);
        
        // Calculate source coordinates with smooth transition
        const dx = x - center.x;
        const dy = y - center.y;
        
        const sourceX = Math.round(center.x + dx / distortionFactor);
        const sourceY = Math.round(center.y + dy / distortionFactor);
        
        if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
            const sourceIndex = (sourceY * width + sourceX) * 4;
            const targetIndex = pixelIndex * 4;
            
            // Smooth transition at the edges
            const alpha = Math.max(0, Math.min(1, 1 - (normalizedDistance - 0.8) * 5));
            
            for (let i = 0; i < 4; i++) {
                if (i === 3) { // Alpha channel
                    newImageData.data[targetIndex + i] = Math.round(
                        pixels[sourceIndex + i] * alpha + 
                        pixels[targetIndex + i] * (1 - alpha)
                    );
                } else {
                    newImageData.data[targetIndex + i] = Math.round(
                        pixels[sourceIndex + i] * alpha + 
                        pixels[targetIndex + i] * (1 - alpha)
                    );
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
        console.error("Error in worker:", error);
        self.postMessage({ error: error.message, isComplete: true });
    }
};