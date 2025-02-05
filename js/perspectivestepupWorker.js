// // // self.onmessage = function(e) {
// // //     const { imageData, value } = e.data;
// // //     const foldAngle = value * 90; // 0 to 90 degrees
    
// // //     const width = imageData.width;
// // //     const height = imageData.height;
// // //     const centerX = width / 2;
    
// // //     const newImageData = new ImageData(width, height);
    
// // //     const foldRadians = foldAngle * Math.PI / 180;
// // //     const foldPosition = Math.round(width / 2);
    
// // //     for (let y = 0; y < height; y++) {
// // //         for (let x = 0; x < width; x++) {
// // //             let sourceX;
            
// // //             if (x < foldPosition) {
// // //                 sourceX = x;
// // //             } else {
// // //                 const dx = x - foldPosition;
// // //                 const foldedX = dx * Math.cos(foldRadians);
// // //                 const foldedY = dx * Math.sin(foldRadians);
                
// // //                 sourceX = Math.round(foldPosition + foldedX);
                
// // //                 if (foldedY > y) {
// // //                     continue; // Skip this pixel as it's "behind" the fold
// // //                 }
// // //             }
            
// // //             if (sourceX >= 0 && sourceX < width) {
// // //                 const oldIndex = (y * width + sourceX) * 4;
// // //                 const newIndex = (y * width + x) * 4;
                
// // //                 newImageData.data[newIndex] = imageData.data[oldIndex];
// // //                 newImageData.data[newIndex + 1] = imageData.data[oldIndex + 1];
// // //                 newImageData.data[newIndex + 2] = imageData.data[oldIndex + 2];
// // //                 newImageData.data[newIndex + 3] = imageData.data[oldIndex + 3];
// // //             }
// // //         }
// // //     }
    
// // //     self.postMessage({ imageData: newImageData });
// // // };

// // const DEFAULT_ITERATIONS = 120;
// // let currentIteration = 0;

// // function applyFoldEffect(imageData, value, selectedRegions = null) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const foldAngle = value * 90;
// //     const foldRadians = foldAngle * Math.PI / 180;
// //     const foldPosition = Math.round(width / 2);
    
// //     const newImageData = new ImageData(
// //         new Uint8ClampedArray(imageData.data),
// //         width,
// //         height
// //     );
    
// //     const processPixel = (x, y) => {
// //         let sourceX;
        
// //         if (x < foldPosition) {
// //             sourceX = x;
// //         } else {
// //             const dx = x - foldPosition;
// //             const foldedX = dx * Math.cos(foldRadians);
// //             const foldedY = dx * Math.sin(foldRadians);
            
// //             sourceX = Math.round(foldPosition + foldedX);
            
// //             if (foldedY > y) {
// //                 return;
// //             }
// //         }
        
// //         if (sourceX >= 0 && sourceX < width) {
// //             const oldIndex = (y * width + sourceX) * 4;
// //             const newIndex = (y * width + x) * 4;
            
// //             for (let i = 0; i < 4; i++) {
// //                 newImageData.data[newIndex + i] = imageData.data[oldIndex + i];
// //             }
// //         }
// //     };
    
// //     if (selectedRegions?.length) {
// //         const pixelSet = new Set(selectedRegions.flat());
// //         for (let y = 0; y < height; y++) {
// //             for (let x = 0; x < width; x++) {
// //                 if (pixelSet.has(y * width + x)) {
// //                     processPixel(x, y);
// //                 }
// //             }
// //         }
// //     } else {
// //         for (let y = 0; y < height; y++) {
// //             for (let x = 0; x < width; x++) {
// //                 processPixel(x, y);
// //             }
// //         }
// //     }
    
// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
// //     try {
// //         if (reset) currentIteration = 0;
// //         const resultImageData = applyFoldEffect(imageData, value, selectedRegions);
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

// function applyExtendEffect(imageData, value, selectedRegions = null) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

//     const processPixel = (x, y) => {
//         const dx = x - centerX;
//         const extendedX = centerX + dx * (1 + value);

//         if (extendedX >= 0 && extendedX < width) {
//             const sourceIndex = (y * width + Math.round(extendedX)) * 4;
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
//         const resultImageData = applyExtendEffect(imageData, value, selectedRegions);
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

        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const foldLine = minX + (maxX - minX) / 2;
        const pixelSet = new Set(region);

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (!pixelSet.has(y * width + x)) continue;

                const distanceFromFold = Math.abs(x - foldLine);
                const foldWidth = (maxX - minX) / 4;
                const foldIntensity = value * 0.3;

                if (distanceFromFold <= foldWidth) {
                    // Calculate fold displacement
                    const foldProgress = distanceFromFold / foldWidth;
                    const displacement = Math.sin(foldProgress * Math.PI) * foldIntensity * foldWidth;
                    
                    // Add shading effect
                    const shadingIntensity = Math.cos(foldProgress * Math.PI) * 0.2;
                    
                    // Calculate source position with perspective distortion
                    const sourceX = x;
                    const sourceY = y + displacement;

                    if (sourceY >= 0 && sourceY < height - 1) {
                        const y1 = Math.floor(sourceY);
                        const y2 = y1 + 1;
                        const wy = sourceY - y1;
                        const targetIndex = (y * width + x) * 4;

                        for (let i = 0; i < 3; i++) {
                            const top = pixels[(y1 * width + x) * 4 + i];
                            const bottom = pixels[(y2 * width + x) * 4 + i];
                            
                            let interpolatedValue = top * (1 - wy) + bottom * wy;
                            
                            // Apply shading
                            interpolatedValue = Math.max(0, Math.min(255, 
                                interpolatedValue * (1 - shadingIntensity)));
                            
                            newImageData.data[targetIndex + i] = interpolatedValue;
                        }
                        // Preserve alpha channel
                        newImageData.data[targetIndex + 3] = pixels[(y * width + x) * 4 + 3];
                    }
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
    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;
    
    const foldLine = width / 2;
    const foldWidth = width / 4;
    const foldIntensity = value * 0.3;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distanceFromFold = Math.abs(x - foldLine);
            
            if (distanceFromFold <= foldWidth) {
                // Calculate fold displacement
                const foldProgress = distanceFromFold / foldWidth;
                const displacement = Math.sin(foldProgress * Math.PI) * foldIntensity * foldWidth;
                
                // Add shading effect
                const shadingIntensity = Math.cos(foldProgress * Math.PI) * 0.2;
                
                // Calculate source position
                const sourceY = y + displacement;

                if (sourceY >= 0 && sourceY < height - 1) {
                    const y1 = Math.floor(sourceY);
                    const y2 = y1 + 1;
                    const wy = sourceY - y1;
                    const targetIndex = (y * width + x) * 4;

                    for (let i = 0; i < 3; i++) {
                        const top = pixels[(y1 * width + x) * 4 + i];
                        const bottom = pixels[(y2 * width + x) * 4 + i];
                        
                        let interpolatedValue = top * (1 - wy) + bottom * wy;
                        
                        // Apply shading
                        interpolatedValue = Math.max(0, Math.min(255, 
                            interpolatedValue * (1 - shadingIntensity)));
                        
                        newPixels[targetIndex + i] = interpolatedValue;
                    }
                    // Preserve alpha channel
                    newPixels[targetIndex + 3] = pixels[(y * width + x) * 4 + 3];
                }
            } else {
                // Copy pixels outside the fold area
                const targetIndex = (y * width + x) * 4;
                newPixels[targetIndex] = pixels[targetIndex];
                newPixels[targetIndex + 1] = pixels[targetIndex + 1];
                newPixels[targetIndex + 2] = pixels[targetIndex + 2];
                newPixels[targetIndex + 3] = pixels[targetIndex + 3];
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