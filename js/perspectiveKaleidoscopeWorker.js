// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const segments = Math.floor(value * 10) + 2; // 2 to 12 segments
    
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
//             let angle = Math.atan2(dy, dx);
            
//             angle = (angle + Math.PI * 2) % (Math.PI * 2);
//             angle = angle % (Math.PI * 2 / segments);
//             if (angle > Math.PI / segments) {
//                 angle = Math.PI * 2 / segments - angle;
//             }
            
//             const sourceX = Math.floor(centerX + distance * Math.cos(angle));
//             const sourceY = Math.floor(centerY + distance * Math.sin(angle));
            
//             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                 const sourceIndex = (sourceY * width + sourceX) * 4;
//                 const targetIndex = (y * width + x) * 4;
                
//                 for (let i = 0; i < 4; i++) {
//                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//                 }
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyFoldToRegions(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
    if (!selectedRegions?.length) {
        return applyFold(imageData, value);
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

        // Calculate number of folds based on value
        const segments = 2 + Math.floor(value * 6); // 2 to 8 segments

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!regionSet.has(y * width + x)) continue;

                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Calculate angle and apply folding transformation
                let angle = Math.atan2(dy, dx);
                angle = (angle + Math.PI * 2) % (Math.PI * 2);
                angle = angle % (Math.PI * 2 / segments);
                
                if (angle > Math.PI / segments) {
                    angle = Math.PI * 2 / segments - angle;
                }

                // Calculate source position
                const sourceX = Math.floor(centerX + distance * Math.cos(angle));
                const sourceY = Math.floor(centerY + distance * Math.sin(angle));

                if (sourceX >= minX && sourceX <= maxX && sourceY >= minY && sourceY <= maxY && 
                    regionSet.has(sourceY * width + sourceX)) {
                    
                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    const targetIndex = (y * width + x) * 4;

                    // Calculate shading based on fold angle
                    const foldAngle = angle / (Math.PI / segments);
                    const shadingIntensity = 0.7 + (0.3 * Math.cos(foldAngle * Math.PI));

                    // Apply transformation with shading
                    for (let i = 0; i < 3; i++) {
                        newImageData.data[targetIndex + i] = 
                            pixels[sourceIndex + i] * shadingIntensity;
                    }
                    // Preserve alpha
                    newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
                }
            }
        }
    });

    return newImageData;
}

function applyFold(imageData, value) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    const newImageData = new ImageData(width, height);
    
    // Calculate number of folds based on value
    const segments = 2 + Math.floor(value * 6); // 2 to 8 segments

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate angle and apply folding transformation
            let angle = Math.atan2(dy, dx);
            angle = (angle + Math.PI * 2) % (Math.PI * 2);
            angle = angle % (Math.PI * 2 / segments);
            
            if (angle > Math.PI / segments) {
                angle = Math.PI * 2 / segments - angle;
            }

            // Calculate source position
            const sourceX = Math.floor(centerX + distance * Math.cos(angle));
            const sourceY = Math.floor(centerY + distance * Math.sin(angle));

            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;

                // Calculate shading based on fold angle
                const foldAngle = angle / (Math.PI / segments);
                const shadingIntensity = 0.7 + (0.3 * Math.cos(foldAngle * Math.PI));

                // Apply transformation with shading
                for (let i = 0; i < 3; i++) {
                    newImageData.data[targetIndex + i] = 
                        pixels[sourceIndex + i] * shadingIntensity;
                }
                // Preserve alpha
                newImageData.data[targetIndex + 3] = pixels[sourceIndex + 3];
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyFoldToRegions(imageData, value, selectedRegions);
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