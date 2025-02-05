// self.onmessage = function(e) {
//     const { imageData, value, clickedPoints } = e.data;
//     // console.log("Received animation points:", animationPoints);
//     console.log("Worker received:", { valueX: value.tiltX, valueY: value.tiltY, points: clickedPoints.length });

//     if (clickedPoints.length === 0) {
//         self.postMessage({ error: "No animation points provided. Cannot process effect accurately." });
//         return;
//     }
//     const result = applyPerspectiveTilt(imageData, value, clickedPoints);
//     // console.log('result :>> ', result);
//     self.postMessage({ imageData: result });
// };

// function applyPerspectiveTilt(imageData, value, points) {
//     const { width, height } = imageData;
//     const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
//     const centerX = width / 2;
//     const centerY = height / 2;
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             let weightedTiltX = 0;
//             let weightedTiltY = 0;
//             let totalWeight = 0;
            
//             points.forEach(point => {
//                 const dx = x - point.x;
//                 const dy = y - point.y;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const weight = 1 / (1 + distance * 0.001); // Decreased from 0.01 to increase influence

//                 weightedTiltX += value.tiltX * weight * 10; // Multiplied by 10 to increase effect
//                 weightedTiltY += value.tiltY * weight * 10;
      
//                 totalWeight += weight;
//             });
            
//             if (totalWeight === 0) {
//                 // If no points influence this pixel, apply a minimal default effect
//                 weightedTiltX = value.tiltX * 0.1;
//                 weightedTiltY = value.tiltY * 0.1;
//             } else {
//                 weightedTiltX /= totalWeight;
//                 weightedTiltY /= totalWeight;
//             }

//             const tiltX = weightedTiltX * (x - centerX) / centerX * 50; // Multiplied by 50
//             const tiltY = weightedTiltY * (y - centerY) / centerY * 50; // Multiplied by 50
            
//             const sourceX = x + tiltX;
//             const sourceY = y + tiltY;
            
//             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                 const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
//                 const targetIndex = (y * width + x) * 4;
//                 newImageData.data[targetIndex] = Math.min(255, newImageData.data[targetIndex] + 50);

//                 for (let i = 0; i < 4; i++) {
//                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//                 }
//             }
//         }
//     }
    
//     return newImageData;
// }

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
        const tiltAngle = value * Math.PI / 4; // Convert value to angle (max 45 degrees)
        
        // Process each pixel in the region bounds
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;
                
                // Calculate normalized coordinates relative to region center
                const normalizedX = (x - minX) / regionWidth - 0.5;
                const normalizedY = (y - minY) / regionHeight - 0.5;
                
                // Apply tilt transformation
                // This creates a shearing effect based on the vertical position
                const shearX = normalizedY * Math.tan(tiltAngle);
                const sourceX = minX + (normalizedX + shearX + 0.5) * regionWidth;
                
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