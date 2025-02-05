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
    
    // Calculate expansion amounts
    const expandX = Math.round((maxX - minX) * (expansionFactor - 1) / 2);
    const expandY = Math.round((maxY - minY) * (expansionFactor - 1) / 2);
    
    // Add expanded pixels
    for (let y = Math.max(0, minY - expandY); y <= Math.min(height - 1, maxY + expandY); y++) {
        for (let x = Math.max(0, minX - expandX); x <= Math.min(width - 1, maxX + expandX); x++) {
            expandedSet.add(y * width + x);
        }
    }
    
    return {
        originalSet,
        expandedSet,
        bounds: { minX, maxX, minY, maxY }
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
    const { originalSet, expandedSet, bounds } = expandRegion(selectedRegions, width, height, zoomFactor);

    // Process expanded region
    expandedSet.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        // Calculate source coordinates relative to region center
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;

        const dx = (x - centerX) / zoomFactor;
        const dy = (y - centerY) / zoomFactor;

        const sourceX = Math.round(centerX + dx);
        const sourceY = Math.round(centerY + dy);

        // Only apply zoom effect if the source pixel was in the original selection
        const sourceIndex = sourceY * width + sourceX;
        if (sourceX >= 0 && sourceX < width && 
            sourceY >= 0 && sourceY < height && 
            originalSet.has(sourceIndex)) {
            
            const sourcePixelIndex = sourceIndex * 4;
            const targetIndex = pixelIndex * 4;

            // Copy pixel data only if we're within the original shape
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = pixels[sourcePixelIndex + i];
            }
        } else {
            // If outside the original shape, keep the original pixel
            const originalIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                newImageData.data[originalIndex + i] = pixels[originalIndex + i];
            }
        }
    });

    return newImageData;
}

// The rest of your code remains the same
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