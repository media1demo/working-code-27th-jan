// // const DEFAULT_ITERATIONS = 120;
// // let currentIteration = 0;

// // function applyFoldToRegions(imageData, value, selectedRegions) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const pixels = imageData.data;
// //     const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
    
// //     if (!selectedRegions?.length) {
// //         return newImageData;
// //     }

// //     selectedRegions.forEach(region => {
// //         if (!region.length) return;
        
// //         // Find bounds of the region
// //         let minX = width, maxX = 0, minY = height, maxY = 0;
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
// //             minX = Math.min(minX, x);
// //             maxX = Math.max(maxX, x);
// //             minY = Math.min(minY, y);
// //             maxY = Math.max(maxY, y);
// //         });

// //         const regionWidth = maxX - minX;
// //         const regionHeight = maxY - minY;
// //         const foldAmount = Math.max(0, Math.min(1, value));
        
// //         // Create a Set for quick lookup of region pixels
// //         const regionSet = new Set(region);
        
// //         // Create temporary buffer for the region
// //         const regionBuffer = new ImageData(regionWidth, regionHeight);
        
// //         // Copy region pixels to buffer
// //         for (let y = minY; y < maxY; y++) {
// //             for (let x = minX; x < maxX; x++) {
// //                 if (!regionSet.has(y * width + x)) continue;
                
// //                 const sourceIdx = (y * width + x) * 4;
// //                 const targetIdx = ((y - minY) * regionWidth + (x - minX)) * 4;
                
// //                 for (let i = 0; i < 4; i++) {
// //                     regionBuffer.data[targetIdx + i] = pixels[sourceIdx + i];
// //                 }
// //             }
// //         }
        
// //         // Apply fold transformation
// //         for (let y = 0; y < regionHeight; y++) {
// //             for (let x = 0; x < regionWidth; x++) {
// //                 const originalX = x + minX;
// //                 const originalY = y + minY;
                
// //                 if (!regionSet.has(originalY * width + originalX)) continue;

// //                 // Normalize x coordinate relative to fold
// //                 const normalizedX = x / regionWidth;
                
// //                 // Calculate fold parameters
// //                 const foldX = regionWidth / 2;
// //                 const distanceFromFold = x - foldX;
                
// //                 if (distanceFromFold > 0) {  // Only fold the right half
// //                     // Calculate new position based on fold
// //                     const foldAngle = foldAmount * Math.PI;
// //                     const scale = Math.cos(foldAngle);
                    
// //                     // Apply perspective transformation
// //                     const newX = foldX + (distanceFromFold * scale);
// //                     const heightOffset = (1 - scale) * (regionHeight / 2);
// //                     const newY = y + (distanceFromFold * Math.sin(foldAngle)) - heightOffset;
                    
// //                     // Calculate shading based on fold angle
// //                     const shadingFactor = 0.7 + (0.3 * Math.cos(foldAngle));
                    
// //                     if (newY >= 0 && newY < regionHeight) {
// //                         const targetIdx = (originalY * width + originalX) * 4;
// //                         const sourceIdx = (y * regionWidth + x) * 4;
                        
// //                         // Apply transformation with shading
// //                         for (let i = 0; i < 3; i++) {
// //                             newImageData.data[targetIdx + i] = 
// //                                 regionBuffer.data[sourceIdx + i] * shadingFactor;
// //                         }
// //                         // Preserve alpha channel
// //                         newImageData.data[targetIdx + 3] = regionBuffer.data[sourceIdx + 3];
// //                     }
// //                 } else {
// //                     // Keep left half unchanged
// //                     const targetIdx = (originalY * width + originalX) * 4;
// //                     const sourceIdx = (y * regionWidth + x) * 4;
// //                     for (let i = 0; i < 4; i++) {
// //                         newImageData.data[targetIdx + i] = regionBuffer.data[sourceIdx + i];
// //                     }
// //                 }
// //             }
// //         }
// //     });
    
// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
// //     try {
// //         if (reset) currentIteration = 0;
// //         const resultImageData = applyFoldToRegions(imageData, value, selectedRegions);
// //         currentIteration = (currentIteration + 1) % iterations;
        
// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             iteration: currentIteration,
// //             progress: currentIteration / iterations
// //         });
// //     } catch (error) {
// //         self.postMessage({ error: error.message, isComplete: true });
// //     }
// // };

// const DEFAULT_ITERATIONS = 120;
// let currentIteration = 0;

// function applyFoldEffect(imageData, value, selectedRegions = null) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

//     const processPixel = (x, y) => {
//         const dx = x - centerX;
//         const foldedX = centerX + Math.sign(dx) * (Math.abs(dx) * (1 - value));

//         if (foldedX >= 0 && foldedX < width) {
//             const sourceIndex = (y * width + Math.round(foldedX)) * 4;
//             const targetIndex = (y * width + x) * 4;
            
//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }
//     };

//     if (selectedRegions?.length) {
//         const pixelSet = new Set(selectedRegions.flat());
//         for (let y = 0; y < height; y++) {
//             for (let x = 0; x < width; x++) {
//                 if (pixelSet.has(y * width + x)) {
//                     processPixel(x, y);
//                 }
//             }
//         }
//     } else {
//         for (let y = 0; y < height; y++) {
//             for (let x = 0; x < width; x++) {
//                 processPixel(x, y);
//             }
//         }
//     }

//     return newImageData;
// }

// self.onmessage = function(e) {
//     const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
//     try {
//         if (reset) currentIteration = 0;
//         const resultImageData = applyFoldEffect(imageData, value, selectedRegions);
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

function applyFoldEffect(imageData, value, selectedRegions = null) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    const processPixel = (x, y) => {
        // Calculate the distance from the center
        const dx = x - centerX;

        // Apply folding: mirror the pixel position based on the value
        const foldedX = centerX + Math.sign(dx) * (Math.abs(dx) % (centerX * value));

        // Ensure the folded position is within bounds
        if (foldedX >= 0 && foldedX < width) {
            const sourceIndex = (y * width + Math.round(foldedX)) * 4;
            const targetIndex = (y * width + x) * 4;

            // Copy the pixel data from the folded position to the target position
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    };

    if (selectedRegions?.length) {
        // If selected regions are provided, only process those pixels
        const pixelSet = new Set(selectedRegions.flat());
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixelSet.has(y * width + x)) {
                    processPixel(x, y);
                }
            }
        }
    } else {
        // Process all pixels in the image
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                processPixel(x, y);
            }
        }
    }

    return newImageData;
}

self.onmessage = function (e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyFoldEffect(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations,
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};