// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const sphereRadius = value * imageData.width / 2; // 0 to half of image width
    
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const centerY = height / 2;
    
//     const newImageData = new ImageData(width, height);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const dx = x - centerX;
//             const dy = y - centerY;
            
//             const distance = Math.sqrt(dx * dx + dy * dy);
            
//             if (distance < sphereRadius) {
//                 const z = Math.sqrt(sphereRadius * sphereRadius - distance * distance);
//                 const normZ = z / sphereRadius;
                
//                 const sourceX = Math.round(centerX + dx / normZ);
//                 const sourceY = Math.round(centerY + dy / normZ);
                
//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const oldIndex = (sourceY * width + sourceX) * 4;
//                     const newIndex = (y * width + x) * 4;
                    
//                     newImageData.data[newIndex] = imageData.data[oldIndex];
//                     newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
//                     newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
//                     newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
//                 }
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function sphereDistortRegion(imageData, value, selectedRegions) {
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
        
        // Calculate center of the region and sphere radius
        const centerX = minX + (maxX - minX) / 2;
        const centerY = minY + (maxY - minY) / 2;
        const regionWidth = maxX - minX;
        const sphereRadius = value * regionWidth / 2; // 0 to half of region width
        const regionSet = new Set(region);

        // Process each pixel in the region bounds
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < sphereRadius) {
                    // Calculate z coordinate on sphere surface
                    const z = Math.sqrt(sphereRadius * sphereRadius - distance * distance);
                    const normZ = z / sphereRadius;

                    // Apply spherical distortion
                    const sourceX = Math.round(centerX + dx / normZ);
                    const sourceY = Math.round(centerY + dy / normZ);

                    // Check if source position is within region bounds
                    if (sourceX >= minX && sourceX <= maxX && 
                        sourceY >= minY && sourceY <= maxY && 
                        regionSet.has(sourceY * width + sourceX)) {
                        
                        const sourceIndex = (sourceY * width + sourceX) * 4;
                        const targetIndex = (y * width + x) * 4;

                        // Copy pixel data
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
        const resultImageData = sphereDistortRegion(imageData, value, selectedRegions);
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