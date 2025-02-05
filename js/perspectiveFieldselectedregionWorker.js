const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function findRegionBoundaries(region, width, height) {
    let minX = width, maxX = 0, minY = height, maxY = 0;
    
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });
    
    return { minX, maxX, minY, maxY };
}

function applyPageFoldToRegion(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const foldAngle = value * 90;
    const foldRadians = foldAngle * Math.PI / 180;
    
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    if (!selectedRegions?.length) {
        return applyPageFold(imageData, value);
    }

    selectedRegions.forEach(region => {
        const { minX, maxX } = findRegionBoundaries(region, width, height);
        const foldPosition = minX + (maxX - minX) / 2;
        const pixelSet = new Set(region);

        for (let y = 0; y < height; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!pixelSet.has(pixelIndex)) continue;

                let sourceX;
                
                if (x < foldPosition) {
                    sourceX = x;
                } else {
                    const dx = x - foldPosition;
                    const foldedX = dx * Math.cos(foldRadians);
                    const foldedY = dx * Math.sin(foldRadians);
                    
                    sourceX = Math.round(foldPosition + foldedX);
                    
                    if (foldedY > y) {
                        continue;
                    }
                }
                
                if (sourceX >= 0 && sourceX < width) {
                    const oldIndex = (y * width + sourceX) * 4;
                    const newIndex = (y * width + x) * 4;
                    
                    for (let i = 0; i < 4; i++) {
                        newImageData.data[newIndex + i] = imageData.data[oldIndex + i];
                    }
                }
            }
        }
    });
    
    return newImageData;
}

function applyPageFold(imageData, value) {
    const width = imageData.width;
    const height = imageData.height;
    const foldAngle = value * 90;
    const foldRadians = foldAngle * Math.PI / 180;
    const foldPosition = Math.round(width / 2);
    
    const newImageData = new ImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let sourceX;
            
            if (x < foldPosition) {
                sourceX = x;
            } else {
                const dx = x - foldPosition;
                const foldedX = dx * Math.cos(foldRadians);
                const foldedY = dx * Math.sin(foldRadians);
                
                sourceX = Math.round(foldPosition + foldedX);
                
                if (foldedY > y) {
                    continue;
                }
            }
            
            if (sourceX >= 0 && sourceX < width) {
                const oldIndex = (y * width + sourceX) * 4;
                const newIndex = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    newImageData.data[newIndex + i] = imageData.data[oldIndex + i];
                }
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData,
        selectedRegions,
        value = 0.5,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    console.log(selectedRegions);
    try {
        if (reset) {
            currentIteration = 0;
        }

        const resultImageData = applyPageFoldToRegion(imageData, value, selectedRegions);
        
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;
    console.log(resultImageData);
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