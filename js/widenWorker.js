const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

function squeezeSelectedRegions(imageData, selectedRegions, t) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    selectedRegions.forEach(region => {
        // Find region boundaries
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const squashFactor = 0.2 * Math.sin(t * Math.PI * 2);

        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                newImageData.data[baseIndex + i] = 0;
            }
        });

        // Apply squeeze only to selected region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const nx = ((x - minX) / (maxX - minX)) - 0.5;
            const sourceX = minX + ((nx * (1 + squashFactor) + 0.5) * (maxX - minX));
            
            if (sourceX >= minX && sourceX < maxX) {
                const sourceIndex = (y * width + Math.floor(sourceX)) * 4;
                const targetIndex = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        });
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;

    try {
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        const t = currentIteration / iterations;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = squeezeSelectedRegions(imageData, selectedRegions, t);
            currentIteration = (currentIteration + 1) % iterations;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
        }

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};