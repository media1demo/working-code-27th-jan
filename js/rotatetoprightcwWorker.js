// // // // self.onmessage = function(e) {
// // // //     const { imageData, value } = e.data;
// // // //     const rotatedImageData = rotateImage(imageData, value, 'topRight');
// // // //     self.postMessage({ imageData: rotatedImageData });
// // // // };

// // // // function rotateImage(imageData, angle, corner) {
// // // //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // //     const ctx = canvas.getContext('2d');
// // // //     ctx.putImageData(imageData, 0, 0);

// // // //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // //     const tempCtx = tempCanvas.getContext('2d');

// // // //     tempCtx.translate(imageData.width, 0);
// // // //     tempCtx.rotate(angle * Math.PI / 180);
// // // //     tempCtx.translate(-imageData.width, 0);

// // // //     tempCtx.drawImage(canvas, 0, 0);

// // // //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // // }


// // // // // Constants
// // // // const DEFAULT_ANGLE = 30;
// // // // const DEFAULT_ITERATIONS = 12;

// // // // let currentIteration = 0;

// // // // function rotateSelectedRegions(imageData, selectedRegions, angle) {
// // // //     const width = imageData.width;
// // // //     const height = imageData.height;
    
// // // //     // Create new image data with original content
// // // //     const newImageData = new ImageData(
// // // //         new Uint8ClampedArray(imageData.data),
// // // //         width,
// // // //         height
// // // //     );
    
// // // //     // Process each selected region
// // // //     selectedRegions.forEach(region => {
// // // //         if (!region || region.length === 0) return;
        
// // // //         // Find center of the region for rotation
// // // //         let centerX = 0;
// // // //         let centerY = 0;
// // // //         region.forEach(pixelIndex => {
// // // //             centerX += pixelIndex % width;
// // // //             centerY += Math.floor(pixelIndex / width);
// // // //         });
// // // //         centerX /= region.length;
// // // //         centerY /= region.length;
        
// // // //         // Create temporary buffer for rotated pixels
// // // //         const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
// // // //         // First clear the selected region in the new image
// // // //         region.forEach(pixelIndex => {
// // // //             const baseIndex = pixelIndex * 4;
// // // //             newImageData.data[baseIndex] = 0;     // R
// // // //             newImageData.data[baseIndex + 1] = 0; // G
// // // //             newImageData.data[baseIndex + 2] = 0; // B
// // // //             newImageData.data[baseIndex + 3] = 0; // A
// // // //         });
        
// // // //         // Rotate only the selected pixels
// // // //         region.forEach(pixelIndex => {
// // // //             const x = pixelIndex % width;
// // // //             const y = Math.floor(pixelIndex / width);
            
// // // //             // Calculate rotation
// // // //             const angleRad = angle * Math.PI / 180;
// // // //             const cos = Math.cos(angleRad);
// // // //             const sin = Math.sin(angleRad);
            
// // // //             // Calculate position relative to center
// // // //             const dx = x - centerX;
// // // //             const dy = y - centerY;
            
// // // //             // Calculate new position
// // // //             const newX = Math.round(centerX + (dx * cos - dy * sin));
// // // //             const newY = Math.round(centerY + (dx * sin + dy * cos));
            
// // // //             if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
// // // //                 const sourceIdx = pixelIndex * 4;
// // // //                 const targetIdx = (newY * width + newX) * 4;
                
// // // //                 // Copy original pixel data to temp buffer at new position
// // // //                 for (let i = 0; i < 4; i++) {
// // // //                     tempBuffer[targetIdx + i] = imageData.data[sourceIdx + i];
// // // //                 }
// // // //             }
// // // //         });
        
// // // //         // Copy only rotated pixels back to result
// // // //         region.forEach(pixelIndex => {
// // // //             const x = pixelIndex % width;
// // // //             const y = Math.floor(pixelIndex / width);
            
// // // //             // Calculate inverse rotation to find source pixel
// // // //             const angleRad = -angle * Math.PI / 180;
// // // //             const cos = Math.cos(angleRad);
// // // //             const sin = Math.sin(angleRad);
            
// // // //             const dx = x - centerX;
// // // //             const dy = y - centerY;
            
// // // //             const sourceX = Math.round(centerX + (dx * cos - dy * sin));
// // // //             const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
// // // //             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// // // //                 const sourceIdx = (sourceY * width + sourceX) * 4;
// // // //                 const targetIdx = pixelIndex * 4;
                
// // // //                 // Only copy if there was a rotated pixel here
// // // //                 if (tempBuffer[sourceIdx + 3] > 0) {
// // // //                     for (let i = 0; i < 4; i++) {
// // // //                         newImageData.data[targetIdx + i] = tempBuffer[sourceIdx + i];
// // // //                     }
// // // //                 }
// // // //             }
// // // //         });
// // // //     });
    
// // // //     return newImageData;
// // // // }

// // // // self.onmessage = function(e) {
// // // //     const { 
// // // //         imageData, 
// // // //         selectedRegions,
// // // //         value: angle = DEFAULT_ANGLE,
// // // //         iterations = DEFAULT_ITERATIONS,
// // // //         reset 
// // // //     } = e.data;
    
// // // //     try {
// // // //         if (reset) {
// // // //             currentIteration = 0;
// // // //         }
        
// // // //         // If no regions selected, return original image
// // // //         if (!selectedRegions?.length) {
// // // //             self.postMessage({
// // // //                 segmentedImages: [imageData],
// // // //                 isComplete: true,
// // // //                 iteration: currentIteration,
// // // //                 progress: 1
// // // //             });
// // // //             return;
// // // //         }
        
// // // //         // Calculate current angle based on iteration
// // // //         const currentAngle = (angle * currentIteration) % 360;
// // // //         const resultImageData = rotateSelectedRegions(imageData, selectedRegions, currentAngle);
        
// // // //         currentIteration = (currentIteration + 1) % iterations;
// // // //         const progress = currentIteration / iterations;
        
// // // //         self.postMessage({
// // // //             segmentedImages: [resultImageData],
// // // //             isComplete: true,
// // // //             iteration: currentIteration,
// // // //             progress
// // // //         });
// // // //     } catch (error) {
// // // //         self.postMessage({
// // // //             error: error.message,
// // // //             isComplete: true
// // // //         });
// // // //     }
// // // // };

// // // // Constants
// // // const DEFAULT_ANGLE = 30;
// // // const DEFAULT_ITERATIONS = 12;

// // // let currentIteration = 0;

// // // const CORNERS = {
// // //     TOP_LEFT: 'topLeft',
// // //     TOP_RIGHT: 'topRight',
// // //     BOTTOM_LEFT: 'bottomLeft',
// // //     BOTTOM_RIGHT: 'bottomRight'
// // // };

// // // function rotateImage(imageData, angle, corner) {
// // //     const width = imageData.width;
// // //     const height = imageData.height;
// // //     const canvas = new OffscreenCanvas(width, height);
// // //     const ctx = canvas.getContext('2d');
// // //     ctx.putImageData(imageData, 0, 0);
    
// // //     const newCanvas = new OffscreenCanvas(width, height);
// // //     const newCtx = newCanvas.getContext('2d');
    
// // //     // Set pivot point based on corner
// // //     let pivotX = 0;
// // //     let pivotY = 0;
    
// // //     switch(corner) {
// // //         case CORNERS.TOP_LEFT:
// // //             pivotX = 0;
// // //             pivotY = 0;
// // //             break;
// // //         case CORNERS.TOP_RIGHT:
// // //             pivotX = width;
// // //             pivotY = 0;
// // //             break;
// // //         case CORNERS.BOTTOM_LEFT:
// // //             pivotX = 0;
// // //             pivotY = height;
// // //             break;
// // //         case CORNERS.BOTTOM_RIGHT:
// // //             pivotX = width;
// // //             pivotY = height;
// // //             break;
// // //     }
    
// // //     // Transform and rotate around the selected corner
// // //     newCtx.translate(pivotX, pivotY);
// // //     newCtx.rotate(angle * Math.PI / 180);
// // //     newCtx.translate(-pivotX, -pivotY);
    
// // //     // Draw the rotated image
// // //     newCtx.drawImage(canvas, 0, 0);
    
// // //     return newCtx.getImageData(0, 0, width, height);
// // // }

// // // self.onmessage = function(e) {
// // //     const { 
// // //         imageData, 
// // //         corner = CORNERS.TOP_LEFT,
// // //         value: angle = DEFAULT_ANGLE,
// // //         iterations = DEFAULT_ITERATIONS,
// // //         reset 
// // //     } = e.data;
    
// // //     try {
// // //         if (reset) {
// // //             currentIteration = 0;
// // //         }
        
// // //         // Calculate current angle based on iteration
// // //         const currentAngle = (angle * currentIteration) % 360;
        
// // //         // Create rotated image
// // //         const resultImageData = rotateImage(imageData, currentAngle, corner);
        
// // //         currentIteration = (currentIteration + 1) % iterations;
// // //         const progress = currentIteration / iterations;
        
// // //         self.postMessage({
// // //             segmentedImages: [resultImageData],
// // //             isComplete: true,
// // //             iteration: currentIteration,
// // //             progress,
// // //             corner
// // //         });
// // //     } catch (error) {
// // //         self.postMessage({
// // //             error: error.message,
// // //             isComplete: true
// // //         });
// // //     }
// // // };


// // // top-left-rotation-worker.js
// // const DEFAULT_ANGLE = 30;
// // const DEFAULT_ITERATIONS = 12;

// // let currentIteration = 0;

// // function rotateFromTopLeft(imageData, angle) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const canvas = new OffscreenCanvas(width, height);
// //     const ctx = canvas.getContext('2d');
// //     ctx.putImageData(imageData, 0, 0);
    
// //     const newCanvas = new OffscreenCanvas(width, height);
// //     const newCtx = newCanvas.getContext('2d');
    
// //     // Rotate around top-left corner (0,0)
// //     newCtx.translate(0, 0);
// //     newCtx.rotate(angle * Math.PI / 180);
// //     newCtx.translate(0, 0);
    
// //     newCtx.drawImage(canvas, 0, 0);
// //     return newCtx.getImageData(0, 0, width, height);
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         value: angle = DEFAULT_ANGLE,
// //         iterations = DEFAULT_ITERATIONS,
// //         reset 
// //     } = e.data;
    
// //     try {
// //         if (reset) currentIteration = 0;
        
// //         const currentAngle = (angle * currentIteration) % 360;
// //         const resultImageData = rotateFromTopLeft(imageData, currentAngle);
        
// //         currentIteration = (currentIteration + 1) % iterations;
// //         const progress = currentIteration / iterations;
        
// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             corner: 'topLeft',
// //             iteration: currentIteration,
// //             progress
// //         });
// //     } catch (error) {
// //         self.postMessage({ error: error.message, isComplete: true });
// //     }
// // };
// const DEFAULT_ROTATION_ANGLE = 45;
// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_ROTATION_STEP = 2;
// console.log("toprightWorker initialized");
// let currentIteration = 0;

// // Helper function to copy image data
// function copyImageData(source, destination) {
//     destination.data.set(source.data);
// }

// // Helper function to create new ImageData with transparent background
// function createTransparentImageData(width, height) {
//     return new ImageData(
//         new Uint8ClampedArray(width * height * 4),
//         width,
//         height
//     );
// }

// function rotateRegionTopRight(imageData, angle) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const tempBuffer = new Uint8ClampedArray(imageData.data);
    
//     // Clear destination area
//     for (let i = 0; i < imageData.data.length; i += 4) {
//         imageData.data[i] = 0;     // R
//         imageData.data[i + 1] = 0; // G
//         imageData.data[i + 2] = 0; // B
//         imageData.data[i + 3] = 0; // A
//     }
    
//     // Convert angle to radians
//     const radians = (angle * Math.PI) / 180;
//     const centerX = width - 1;  // Rotate around top-right corner
//     const centerY = 0;          // Top (upper)
    
//     // Rotate pixels around top-right corner
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             // Calculate relative position to rotation center
//             const relativeX = x - centerX;
//             const relativeY = y - centerY;
            
//             // Apply rotation
//             const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
//             const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
            
//             // Convert back to absolute coordinates
//             const newX = Math.round(rotatedX + centerX);
//             const newY = Math.round(rotatedY + centerY);
            
//             // Check if new position is within bounds
//             if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                 const sourceIdx = (y * width + x) * 4;
//                 const destIdx = (newY * width + newX) * 4;
                
//                 // Copy pixel data
//                 for (let c = 0; c < 4; c++) {
//                     imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
//                 }
//             }
//         }
//     }
// }

// // Function to rotate selected regions around top-right corner
// function rotateSelectedRegionsTopRight(imageData, selectedRegions, maxRotationAngle) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = createTransparentImageData(width, height);
//     copyImageData(imageData, newImageData);
    
//     selectedRegions.forEach(region => {
//         const rotationAngle = Math.random() * maxRotationAngle;
//         const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
//         // Clear selected region
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             for (let c = 0; c < 4; c++) {
//                 newImageData.data[baseIndex + c] = 0;
//             }
//         });
        
//         // Rotate pixels
//         const centerX = width - 1;  // Top-right corner
//         const centerY = 0;          // Top (upper)
//         const radians = (rotationAngle * Math.PI) / 180;
        
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
            
//             // Calculate rotation
//             const relativeX = x - centerX;
//             const relativeY = y - centerY;
//             const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
//             const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
//             const newX = Math.round(rotatedX + centerX);
//             const newY = Math.round(rotatedY + centerY);
            
//             if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                 const sourceIndex = (y * width + x) * 4;
//                 const targetIndex = (newY * width + newX) * 4;
                
//                 for (let c = 0; c < 4; c++) {
//                     tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
//                 }
//             }
//         });
        
//         // Blend rotated pixels
//         for (let i = 0; i < tempBuffer.length; i += 4) {
//             if (tempBuffer[i + 3] > 0) {
//                 for (let c = 0; c < 4; c++) {
//                     newImageData.data[i + c] = tempBuffer[i + c];
//                 }
//             }
//         }
//     });
    
//     return newImageData;
// }

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value, 
//         value2: maxRotationAngle = DEFAULT_ROTATION_ANGLE,
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
        
//         // Handle different modes based on whether regions are selected
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // Selected regions mode
//             resultImageData = rotateSelectedRegionsTopRight(imageData, selectedRegions, maxRotationAngle);
//             currentIteration = (currentIteration + 1) % iterations;
//             progress = currentIteration / iterations;
//         } else {
//             // Full image mode
//             resultImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );
//             const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
//             rotateRegionTopRight(resultImageData, totalRotation);
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
const DEFAULT_ROTATION_ANGLE = 45;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_ROTATION_STEP = 2;
console.log("toprightWorker initialized");
let currentIteration = 0;

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function rotateRegionTopRight(imageData, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    // Clear destination area
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 0;     // R
        imageData.data[i + 1] = 0; // G
        imageData.data[i + 2] = 0; // B
        imageData.data[i + 3] = 0; // A
    }
    
    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;
    const centerX = width - 1;  // Rotate around top-right corner
    const centerY = 0;          // Top (upper)
    
    // Rotate pixels around top-right corner
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate relative position to rotation center
            const relativeX = x - centerX;
            const relativeY = y - centerY;
            
            // Apply rotation
            const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
            const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
            
            // Convert back to absolute coordinates
            const newX = Math.round(rotatedX + centerX);
            const newY = Math.round(rotatedY + centerY);
            
            // Check if new position is within bounds
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + newX) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to rotate selected regions around top-right corner
function rotateSelectedRegionsTopRight(imageData, selectedRegions, maxRotationAngle) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const rotationAngle = Math.random() * maxRotationAngle;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Rotate pixels
        const centerX = width - 1;  // Top-right corner
        const centerY = 0;          // Top (upper)
        const radians = (rotationAngle * Math.PI) / 180;
        
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation
            const relativeX = x - centerX;
            const relativeY = y - centerY;
            const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
            const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
            const newX = Math.round(rotatedX + centerX);
            const newY = Math.round(rotatedY + centerY);
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend rotated pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxRotationAngle = DEFAULT_ROTATION_ANGLE,
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
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegionsTopRight(imageData, selectedRegions, maxRotationAngle);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
            rotateRegionTopRight(resultImageData, totalRotation);
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