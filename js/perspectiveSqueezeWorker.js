// const DEFAULT_ITERATIONS = 120;
// let currentIteration = 0;

// function squeezeRegion(imageData, value, selectedRegions) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const pixels = imageData.data;
//     const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
//     if (!selectedRegions?.length) {
//         return newImageData;
//     }
    
//     selectedRegions.forEach(region => {
//         if (!region.length) return;
        
//         // Find bounds of region
//         let minX = width, maxX = 0, minY = height, maxY = 0;
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             minX = Math.min(minX, x);
//             maxX = Math.max(maxX, x);
//             minY = Math.min(minY, y);
//             maxY = Math.max(maxY, y);
//         });
        
//         const regionSet = new Set(region);
//         const regionWidth = maxX - minX;
//         const regionHeight = maxY - minY;
//         const squeeze = 1 - value * 0.9; // Increased range for more dramatic effect

//         // Process each pixel in the region bounds
//         for (let y = minY; y <= maxY; y++) {
//             for (let x = minX; x <= maxX; x++) {
//                 const pixelIndex = y * width + x;
//                 if (!regionSet.has(pixelIndex)) continue;

//                 // Calculate normalized coordinates relative to region
//                 const normalizedX = ((x - minX) / regionWidth - 0.5) * 2;
//                 const normalizedY = ((y - minY) / regionHeight - 0.5) * 2;
                
//                 // Apply squeeze effect with vertical variation
//                 const squeezeFactor = squeeze + (1 - squeeze) * Math.abs(normalizedY);
//                 const sourceX = minX + (normalizedX * squeezeFactor + 1) * regionWidth / 2;
                
//                 if (sourceX >= minX && sourceX < maxX - 1) {
//                     const x1 = Math.floor(sourceX);
//                     const x2 = x1 + 1;
//                     const wx = sourceX - x1;
                    
//                     // Only proceed if both interpolation points are within the region
//                     if (regionSet.has(y * width + x1) && regionSet.has(y * width + x2)) {
//                         const targetIndex = (y * width + x) * 4;
                        
//                         // Perform linear interpolation for each color channel
//                         for (let i = 0; i < 4; i++) {
//                             const left = pixels[(y * width + x1) * 4 + i];
//                             const right = pixels[(y * width + x2) * 4 + i];
                            
//                             // Linear interpolation
//                             const interpolatedValue = Math.round(left * (1 - wx) + right * wx);
//                             newImageData.data[targetIndex + i] = interpolatedValue;
//                         }
//                     }
//                 }
//             }
//         }
//     });
    
//     return newImageData;
// }

// self.onmessage = function(e) {
//     const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
//     try {
//         if (reset) currentIteration = 0;
//         const resultImageData = squeezeRegion(imageData, value, selectedRegions);
//         currentIteration = (currentIteration + 1) % iterations;
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress: currentIteration / iterations
//         });
//     } catch (error) {
//         self.postMessage({ error: error.message, isComplete: true });
//     }
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function squeezeRegion(imageData, value, selectedRegions) {
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
        const squeeze = 1 - value * 0.9; // Increased range for more dramatic effect

        // Process each pixel in the region bounds
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                // Calculate normalized coordinates relative to region
                const normalizedX = ((x - minX) / regionWidth - 0.5) * 2;
                const normalizedY = ((y - minY) / regionHeight - 0.5) * 2;
                
                // Apply squeeze effect with vertical variation
                const squeezeFactor = squeeze + (1 - squeeze) * Math.abs(normalizedY);
                const sourceX = minX + (normalizedX * squeezeFactor + 1) * regionWidth / 2;
                
                if (sourceX >= minX && sourceX < maxX - 1) {
                    const x1 = Math.floor(sourceX);
                    const x2 = x1 + 1;
                    const wx = sourceX - x1;
                    
                    // Only proceed if both interpolation points are within the region
                    if (regionSet.has(y * width + x1) && regionSet.has(y * width + x2)) {
                        const targetIndex = (y * width + x) * 4;
                        
                        // Perform linear interpolation for each color channel
                        for (let i = 0; i < 4; i++) {
                            const left = pixels[(y * width + x1) * 4 + i];
                            const right = pixels[(y * width + x2) * 4 + i];
                            
                            // Linear interpolation
                            const interpolatedValue = Math.round(left * (1 - wx) + right * wx);
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
        const resultImageData = squeezeRegion(imageData, value, selectedRegions);
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