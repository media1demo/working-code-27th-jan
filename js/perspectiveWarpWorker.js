// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const warpStrength = value * 2; // 0 to 2
    
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const newImageData = new ImageData(width, height);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const normalizedX = x / width - 0.5;
//             const normalizedY = y / height - 0.5;
            
//             const warpX = Math.round(x + warpStrength * normalizedX * Math.sin(normalizedY * Math.PI) * width);
//             const warpY = Math.round(y + warpStrength * normalizedY * Math.sin(normalizedX * Math.PI) * height);
            
//             if (warpX >= 0 && warpX < width && warpY >= 0 && warpY < height) {
//                 const oldIndex = (y * width + x) * 4;
//                 const newIndex = (warpY * width + warpX) * 4;
                
//                 newImageData.data[newIndex] = imageData.data[oldIndex];
//                 newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
//                 newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
//                 newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function warpRegion(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);

    if (!selectedRegions?.length) {
        return newImageData;
    }

    const warpStrength = value * 2; // 0 to 2

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

        // Process only pixels within the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                const normalizedX = x / width - 0.5;
                const normalizedY = y / height - 0.5;

                const warpX = Math.round(x + warpStrength * normalizedX * Math.sin(normalizedY * Math.PI) * width);
                const warpY = Math.round(y + warpStrength * normalizedY * Math.sin(normalizedX * Math.PI) * height);

                if (warpX >= 0 && warpX < width && warpY >= 0 && warpY < height) {
                    const oldIndex = (y * width + x) * 4;
                    const newIndex = (warpY * width + warpX) * 4;

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

        const resultImageData = warpRegion(imageData, value, selectedRegions);
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