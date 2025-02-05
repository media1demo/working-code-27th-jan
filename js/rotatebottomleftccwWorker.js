// // // // Constants
// // // const DEFAULT_ITERATIONS = 60; // For smooth animation
// // // const DEFAULT_ANGLE_INCREMENT = 6; // Degrees per frame

// // // let currentIteration = 0;
// // // let currentAngle = 0;

// // // /**
// // //  * Rotates an image by calculating the current frame of animation
// // //  * @param {ImageData} imageData - The image data to rotate
// // //  * @param {number} totalAngle - Target rotation angle in degrees
// // //  * @param {number} progress - Animation progress (0 to 1)
// // //  * @returns {ImageData} - Rotated image data for current frame
// // //  */
// // // function rotateImage(imageData, totalAngle, progress) {
// // //     // Create source canvas and draw original image
// // //     const sourceCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const sourceCtx = sourceCanvas.getContext('2d');
// // //     sourceCtx.putImageData(imageData, 0, 0);
    
// // //     // Create destination canvas for rotated image
// // //     const destCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const destCtx = destCanvas.getContext('2d');
    
// // //     // Calculate current angle based on progress
// // //     const angleForThisFrame = totalAngle * progress;
    
// // //     // Set transform center to middle of image
// // //     const centerX = imageData.width / 2;
// // //     const centerY = imageData.height / 2;
    
// // //     // Clear the destination canvas
// // //     destCtx.clearRect(0, 0, destCanvas.width, destCanvas.height);
    
// // //     // Apply transformations
// // //     destCtx.save();
// // //     destCtx.translate(centerX, centerY);
// // //     destCtx.rotate(angleForThisFrame * Math.PI / 180);
// // //     destCtx.translate(-centerX, -centerY);
    
// // //     // Draw the rotated image
// // //     destCtx.drawImage(sourceCanvas, 0, 0);
// // //     destCtx.restore();
    
// // //     return destCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // }

// // // self.onmessage = function(e) {
// // //     const { 
// // //         imageData, 
// // //         value: totalAngle = 360, // Default to full rotation
// // //         value5: iterations = DEFAULT_ITERATIONS,
// // //         reset 
// // //     } = e.data;
// // //     console.log(e.data);
// // //     try {
// // //         // Reset animation if requested
// // //         if (reset) {
// // //             currentIteration = 0;
// // //             currentAngle = 0;
// // //         }
        
// // //         // Calculate progress for this frame
// // //         const progress = currentIteration / iterations;
        
// // //         // Get rotated image for current frame
// // //         const rotatedImage = rotateImage(imageData, totalAngle, progress);
        
// // //         // Update iteration counter
// // //         currentIteration = (currentIteration + 1) % iterations;
        
// // //         // Calculate completion
// // //         const isComplete = currentIteration === 0;
        
// // //         self.postMessage({
// // //             segmentedImages: [rotatedImage],
// // //             isComplete,
// // //             iteration: currentIteration,
// // //             progress
// // //         });
        
// // //     } catch (error) {
// // //         self.postMessage({
// // //             error: error.message,
// // //             isComplete: true
// // //         });
// // //     }
// // // };

// // // Constants
// // const DEFAULT_MAX_ROTATION = 360;
// // const DEFAULT_ITERATIONS = 120;
// // const DEFAULT_ROTATION_STEP = 3;

// // let currentIteration = 0;

// // // Helper function to create new ImageData with transparent background
// // function createTransparentImageData(width, height) {
// //     return new ImageData(
// //         new Uint8ClampedArray(width * height * 4),
// //         width,
// //         height
// //     );
// // }

// // // Helper function to copy image data
// // function copyImageData(source, destination) {
// //     destination.data.set(source.data);
// // }

// // // Function to rotate entire region
// // function rotateRegion(imageData, totalRotation) {
// //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const ctx = canvas.getContext('2d');
// //     ctx.putImageData(imageData, 0, 0);
    
// //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const tempCtx = tempCanvas.getContext('2d');
    
// //     tempCtx.translate(0, imageData.height);
// //     tempCtx.rotate(totalRotation * Math.PI / 180);
// //     tempCtx.translate(0, -imageData.height);
    
// //     tempCtx.drawImage(canvas, 0, 0);
    
// //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // }

// // // Function to rotate selected regions
// // function rotateSelectedRegions(imageData, selectedRegions, maxRotation) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const newImageData = createTransparentImageData(width, height);
// //     copyImageData(imageData, newImageData);
    
// //     selectedRegions.forEach(region => {
// //         const rotationAmount = Math.random() * maxRotation;
// //         const tempCanvas = new OffscreenCanvas(width, height);
// //         const tempCtx = tempCanvas.getContext('2d');
        
// //         // Create a temporary canvas for this region
// //         const regionCanvas = new OffscreenCanvas(width, height);
// //         const regionCtx = regionCanvas.getContext('2d');
        
// //         // Draw only the selected region
// //         const regionData = createTransparentImageData(width, height);
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
// //             const sourceIndex = (y * width + x) * 4;
// //             const targetIndex = sourceIndex;
            
// //             for (let c = 0; c < 4; c++) {
// //                 regionData.data[targetIndex + c] = imageData.data[sourceIndex + c];
// //             }
            
// //             // Clear this pixel from the new image data
// //             for (let c = 0; c < 4; c++) {
// //                 newImageData.data[sourceIndex + c] = 0;
// //             }
// //         });
        
// //         regionCtx.putImageData(regionData, 0, 0);
        
// //         // Rotate the region
// //         tempCtx.translate(width/2, height/2);
// //         tempCtx.rotate(rotationAmount * Math.PI / 180);
// //         tempCtx.translate(-width/2, -height/2);
// //         tempCtx.drawImage(regionCanvas, 0, 0);
        
// //         // Blend the rotated region back
// //         const rotatedRegion = tempCtx.getImageData(0, 0, width, height);
// //         for (let i = 0; i < rotatedRegion.data.length; i += 4) {
// //             if (rotatedRegion.data[i + 3] > 0) {
// //                 for (let c = 0; c < 4; c++) {
// //                     newImageData.data[i + c] = rotatedRegion.data[i + c];
// //                 }
// //             }
// //         }
// //     });
    
// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         selectedRegions, 
// //         value, 
// //         value2: maxRotation = DEFAULT_MAX_ROTATION,
// //         value5: iterations = DEFAULT_ITERATIONS,
// //         reset 
// //     } = e.data;
// //     console.log('e11111111111111111111111 :>> ', e);
// //     try {
// //         // Reset counter if requested
// //         if (reset) {
// //             currentIteration = 0;
// //         }
        
// //         let resultImageData;
// //         let progress;
        
// //         // Handle different modes based on whether regions are selected
// //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// //             // Selected regions mode
// //             resultImageData = rotateSelectedRegions(imageData, selectedRegions, maxRotation);
// //             currentIteration = (currentIteration + 1) % iterations;
// //             progress = currentIteration / iterations;
// //         } else {
// //             // Full image mode
// //             const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
// //             resultImageData = rotateRegion(imageData, totalRotation);
// //             currentIteration++;
// //             progress = currentIteration / iterations;
// //         }
        
// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             iteration: currentIteration,
// //             progress
// //         });
// //     } catch (error) {
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// // Constants
// const DEFAULT_ANGLE = 30;
// const DEFAULT_ITERATIONS = 12;

// let currentIteration = 0;

// function createTransparentImageData(width, height) {
//     return new ImageData(
//         new Uint8ClampedArray(width * height * 4),
//         width,
//         height
//     );
// }

// function rotateSelectedRegions(imageData, selectedRegions, angle) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const resultImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         width,
//         height
//     );

//     selectedRegions.forEach(region => {
//         if (!region || region.length === 0) return;

//         // Create a map of selected pixels for quick lookup
//         const selectedPixels = new Set(region);
        
//         // Rotation center is bottom-right corner (width - 1, height - 1)
//         const centerX = width - 1;
//         const centerY = height - 1;

//         // Create temporary buffer for rotated pixels
//         const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
//         // Clear the original region in the result
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             for (let i = 0; i < 4; i++) {
//                 resultImageData.data[baseIndex + i] = 0;
//             }
//         });

//         // Rotate each pixel in the region
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
            
//             // Calculate rotation
//             const dx = x - centerX;
//             const dy = y - centerY;
//             const angleRad = angle * Math.PI / 180;
//             const cos = Math.cos(angleRad);
//             const sin = Math.sin(angleRad);
            
//             // New coordinates after rotation
//             const newX = Math.round(centerX + (dx * cos - dy * sin));
//             const newY = Math.round(centerY + (dx * sin + dy * cos));
            
//             if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                 const sourceIndex = pixelIndex * 4;
//                 const targetIndex = (newY * width + newX) * 4;
                
//                 // Copy pixel data to temporary buffer
//                 for (let i = 0; i < 4; i++) {
//                     tempBuffer[targetIndex + i] = imageData.data[sourceIndex + i];
//                 }
//             }
//         });

//         // Copy only the rotated pixels that belong to the original shape
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
            
//             // Calculate rotation to find source pixel
//             const dx = x - centerX;
//             const dy = y - centerY;
//             const angleRad = -angle * Math.PI / 180; // Inverse rotation to find source
//             const cos = Math.cos(angleRad);
//             const sin = Math.sin(angleRad);
            
//             const sourceX = Math.round(centerX + (dx * cos - dy * sin));
//             const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
//             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                 const sourceIndex = (sourceY * width + sourceX) * 4;
//                 const targetIndex = pixelIndex * 4;
                
//                 // Only copy if source pixel had data
//                 if (tempBuffer[sourceIndex + 3] > 0) {
//                     for (let i = 0; i < 4; i++) {
//                         resultImageData.data[targetIndex + i] = tempBuffer[sourceIndex + i];
//                     }
//                 }
//             }
//         });
//     });
    
//     return resultImageData;
// }

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value: angle = DEFAULT_ANGLE,
//         value5: iterations = DEFAULT_ITERATIONS,
//         reset 
//     } = e.data;
    
//     try {
//         // Reset counter if requested
//         if (reset) {
//             currentIteration = 0;
//         }
        
//         let resultImageData;
//         let progress;
        
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // Selected regions mode
//             resultImageData = rotateSelectedRegions(imageData, selectedRegions, angle);
//             currentIteration = (currentIteration + 1) % iterations;
//             progress = currentIteration / iterations;
//         } else {
//             // Full image mode
//             resultImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );
//             const totalRotation = angle * (currentIteration + 1);
//             resultImageData = rotateSelectedRegions(imageData, [[...Array(imageData.width * imageData.height).keys()]], totalRotation);
//             currentIteration++;
//             progress = undefined;
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };


// Constants
const DEFAULT_ANGLE = 30;
const DEFAULT_ITERATIONS = 12;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function rotateSelectedRegions(imageData, selectedRegions, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    selectedRegions.forEach(region => {
        if (!region || region.length === 0) return;

        // Create a map of selected pixels for quick lookup
        const selectedPixels = new Set(region);
        
        // Rotation center is bottom-left corner (0, height - 1)
        const centerX = 0;
        const centerY = height - 1;

        // Create temporary buffer for rotated pixels
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear the original region in the result
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                resultImageData.data[baseIndex + i] = 0;
            }
        });

        // Rotate each pixel in the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = angle * Math.PI / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            // New coordinates after rotation
            const newX = Math.round(centerX + (dx * cos - dy * sin));
            const newY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = pixelIndex * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                // Copy pixel data to temporary buffer
                for (let i = 0; i < 4; i++) {
                    tempBuffer[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        });

        // Copy only the rotated pixels that belong to the original shape
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation to find source pixel
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = -angle * Math.PI / 180; // Inverse rotation to find source
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            const sourceX = Math.round(centerX + (dx * cos - dy * sin));
            const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = pixelIndex * 4;
                
                // Only copy if source pixel had data
                if (tempBuffer[sourceIndex + 3] > 0) {
                    for (let i = 0; i < 4; i++) {
                        resultImageData.data[targetIndex + i] = tempBuffer[sourceIndex + i];
                    }
                }
            }
        });
    });
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: angle = DEFAULT_ANGLE,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegions(imageData, selectedRegions, angle);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = angle * (currentIteration + 1);
            resultImageData = rotateSelectedRegions(imageData, [[...Array(imageData.width * imageData.height).keys()]], totalRotation);
            currentIteration++;
            progress = undefined;
        }
        
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