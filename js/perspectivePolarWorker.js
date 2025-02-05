// const DEFAULT_ITERATIONS = 120;
// let currentIteration = 0;

// function applyPolarTransform(imageData, value, selectedRegions = null) {
//     const centerOffset = value * imageData.width / 4; // 0 to 1/4 of image width
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const centerY = height / 2;
//     const newImageData = new ImageData(width, height);

//     // First fill with original image data
//     for (let i = 0; i < imageData.data.length; i++) {
//         newImageData.data[i] = imageData.data[i];
//     }

//     // Convert selectedRegions to a Set for faster lookup
//     const pixelSet = selectedRegions ? new Set(selectedRegions.flat()) : null;

//     // Apply polar transformation
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const currentPixel = y * width + x;
            
//             // Only process if pixel is in selected region (if there is one)
//             if (!pixelSet || pixelSet.has(currentPixel)) {
//                 const dx = x - centerX;
//                 const dy = y - centerY;
//                 const distance = Math.sqrt(dx * dx + dy * dy);
//                 const angle = Math.atan2(dy, dx);

//                 // Calculate source coordinates using polar transformation
//                 const sourceX = Math.floor((angle + Math.PI) / (2 * Math.PI) * width);
//                 const sourceY = Math.floor((distance + centerOffset) / 
//                               (Math.max(width, height) / 2 + centerOffset) * height);

//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const sourceIndex = (sourceY * width + sourceX) * 4;
//                     const targetIndex = (y * width + x) * 4;

//                     // Copy pixel data from source to target
//                     for (let i = 0; i < 4; i++) {
//                         newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//                     }
//                 }
//             }
//         }
//     }

//     // Fill any gaps in the transformed region
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const currentPixel = y * width + x;
//             if (pixelSet && pixelSet.has(currentPixel)) {
//                 const targetIndex = (y * width + x) * 4;
                
//                 // Check if the pixel is black (potential gap)
//                 if (newImageData.data[targetIndex] === 0 && 
//                     newImageData.data[targetIndex + 1] === 0 && 
//                     newImageData.data[targetIndex + 2] === 0) {
                    
//                     let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
//                     let count = 0;

//                     // Sample neighboring pixels
//                     for (let dy = -1; dy <= 1; dy++) {
//                         for (let dx = -1; dx <= 1; dx++) {
//                             const ny = y + dy;
//                             const nx = x + dx;
//                             if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
//                                 const neighborIndex = (ny * width + nx) * 4;
//                                 if (newImageData.data[neighborIndex + 3] > 0) { // if not transparent
//                                     sumR += newImageData.data[neighborIndex];
//                                     sumG += newImageData.data[neighborIndex + 1];
//                                     sumB += newImageData.data[neighborIndex + 2];
//                                     sumA += newImageData.data[neighborIndex + 3];
//                                     count++;
//                                 }
//                             }
//                         }
//                     }

//                     // If we found neighboring pixels, use their average
//                     if (count > 0) {
//                         newImageData.data[targetIndex] = sumR / count;
//                         newImageData.data[targetIndex + 1] = sumG / count;
//                         newImageData.data[targetIndex + 2] = sumB / count;
//                         newImageData.data[targetIndex + 3] = sumA / count;
//                     }
//                 }
//             }
//         }
//     }

//     return newImageData;
// }

// self.onmessage = function (e) {
//     const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
//     try {
//         if (reset) currentIteration = 0;
//         const resultImageData = applyPolarTransform(imageData, value, selectedRegions);
//         currentIteration = (currentIteration + 1) % iterations;
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress: currentIteration / iterations,
//         });
//     } catch (error) {
//         self.postMessage({ error: error.message, isComplete: true });
//     }
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyPolarTransform(imageData, value, selectedRegions = null) {
    const centerOffset = value * imageData.width / 4; // 0 to 1/4 of image width
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const newImageData = new ImageData(width, height);

    // First fill with original image data
    for (let i = 0; i < imageData.data.length; i++) {
        newImageData.data[i] = imageData.data[i];
    }

    // Convert selectedRegions to a Set for faster lookup
    const pixelSet = selectedRegions ? new Set(selectedRegions.flat()) : null;

    // Apply polar transformation
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentPixel = y * width + x;
            
            // Only process if pixel is in selected region (if there is one)
            if (!pixelSet || pixelSet.has(currentPixel)) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                // Calculate source coordinates using polar transformation
                const sourceX = Math.floor((angle + Math.PI) / (2 * Math.PI) * width);
                const sourceY = Math.floor((distance + centerOffset) / 
                              (Math.max(width, height) / 2 + centerOffset) * height);

                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const sourceIndex = (sourceY * width + sourceX) * 4;
                    const targetIndex = (y * width + x) * 4;

                    // Copy pixel data from source to target
                    for (let i = 0; i < 4; i++) {
                        newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                    }
                }
            }
        }
    }

    // Fill any gaps in the transformed region
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentPixel = y * width + x;
            if (pixelSet && pixelSet.has(currentPixel)) {
                const targetIndex = (y * width + x) * 4;
                
                // Check if the pixel is black (potential gap)
                if (newImageData.data[targetIndex] === 0 && 
                    newImageData.data[targetIndex + 1] === 0 && 
                    newImageData.data[targetIndex + 2] === 0) {
                    
                    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                    let count = 0;

                    // Sample neighboring pixels
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const neighborIndex = (ny * width + nx) * 4;
                                if (newImageData.data[neighborIndex + 3] > 0) { // if not transparent
                                    sumR += newImageData.data[neighborIndex];
                                    sumG += newImageData.data[neighborIndex + 1];
                                    sumB += newImageData.data[neighborIndex + 2];
                                    sumA += newImageData.data[neighborIndex + 3];
                                    count++;
                                }
                            }
                        }
                    }
                    
                    if (count > 0) {
                        newImageData.data[targetIndex] = sumR / count;
                        newImageData.data[targetIndex + 1] = sumG / count;
                        newImageData.data[targetIndex + 2] = sumB / count;
                        newImageData.data[targetIndex + 3] = sumA / count;
                    }
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function (e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyPolarTransform(imageData, value, selectedRegions);
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