// // // self.onmessage = function(e) {
// // //     const { imageData, value } = e.data;
// // //     const rotatedImageData = rotateImage(imageData, value, 'bottomLeft');
// // //     self.postMessage({ imageData: rotatedImageData });
// // // };

// // // function rotateImage(imageData, angle, corner) {
// // //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const ctx = canvas.getContext('2d');
// // //     ctx.putImageData(imageData, 0, 0);

// // //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const tempCtx = tempCanvas.getContext('2d');

// // //     tempCtx.translate(getRotationCenterX(corner, imageData.width), 
// // //                       getRotationCenterY(corner, imageData.height));
// // //     tempCtx.rotate(angle * Math.PI / 180);
// // //     tempCtx.translate(-getRotationCenterX(corner, imageData.width), 
// // //                       -getRotationCenterY(corner, imageData.height));

// // //     tempCtx.drawImage(canvas, 0, 0);

// // //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // }

// // // function getRotationCenterX(corner, width) {
// // //     switch(corner) {
// // //         case 'topLeft':
// // //         case 'bottomLeft':
// // //             return 0;
// // //         case 'topRight':
// // //         case 'bottomRight':
// // //             return width;
// // //     }
// // // }

// // // function getRotationCenterY(corner, height) {
// // //     switch(corner) {
// // //         case 'topLeft':
// // //         case 'topRight':
// // //             return 0;
// // //         case 'bottomLeft':
// // //         case 'bottomRight':
// // //             return height;
// // //     }
// // // }

// // // Constants
// // const DEFAULT_ITERATIONS = 120;
// // const DEFAULT_ROTATION_STEP = 3;

// // let currentIteration = 0;

// // // Helper function to get X coordinate of rotation center
// // function getRotationCenterX(corner, width) {
// //     switch(corner) {
// //         case 'topLeft':
// //         case 'bottomLeft':
// //             return 0;
// //         case 'topRight':
// //         case 'bottomRight':
// //             return width;
// //         default:
// //             return width / 2; // Default to center
// //     }
// // }

// // // Helper function to get Y coordinate of rotation center
// // function getRotationCenterY(corner, height) {
// //     switch(corner) {
// //         case 'topLeft':
// //         case 'topRight':
// //             return 0;
// //         case 'bottomLeft':
// //         case 'bottomRight':
// //             return height;
// //         default:
// //             return height / 2; // Default to center
// //     }
// // }

// // // The main rotation function
// // function rotateImage(imageData, angle, corner) {
// //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const ctx = canvas.getContext('2d');
// //     ctx.putImageData(imageData, 0, 0);
    
// //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// //     const tempCtx = tempCanvas.getContext('2d');
    
// //     tempCtx.translate(
// //         getRotationCenterX(corner, imageData.width),
// //         getRotationCenterY(corner, imageData.height)
// //     );
// //     tempCtx.rotate(angle * Math.PI / 180);
// //     tempCtx.translate(
// //         -getRotationCenterX(corner, imageData.width),
// //         -getRotationCenterY(corner, imageData.height)
// //     );
    
// //     tempCtx.drawImage(canvas, 0, 0);
    
// //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         value5: iterations = DEFAULT_ITERATIONS,
// //         corner = 'bottomRight', // Default corner
// //         reset 
// //     } = e.data;
    
// //     try {
// //         // Reset counter if requested
// //         if (reset) {
// //             currentIteration = 0;
// //         }
        
// //         // Calculate rotation angle for this frame
// //         const currentAngle = DEFAULT_ROTATION_STEP * currentIteration;
        
// //         // Rotate image using the provided function
// //         const resultImageData = rotateImage(imageData, currentAngle, corner);
        
// //         // Update iteration counter
// //         currentIteration = (currentIteration + 1) % iterations;
        
// //         // Calculate progress
// //         const progress = currentIteration / iterations;
        
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
// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_ROTATION_STEP = 3;

// let currentIteration = 0;

// // Helper function to get X coordinate of rotation center
// function getRotationCenterX(corner, width) {
//     switch(corner) {
//         case 'topLeft':
//         case 'bottomLeft':
//             return 0;
//         case 'topRight':
//         case 'bottomRight':
//             return width;
//         default:
//             return width / 2;
//     }
// }

// // Helper function to get Y coordinate of rotation center
// function getRotationCenterY(corner, height) {
//     switch(corner) {
//         case 'topLeft':
//         case 'topRight':
//             return 0;
//         case 'bottomLeft':
//         case 'bottomRight':
//             return height;
//         default:
//             return height / 2;
//     }
// }

// // Function to rotate a specific region
// function rotateRegion(imageData, region, angle, corner) {
//     const width = imageData.width;
//     const height = imageData.height;
    
//     // Create a blank canvas for the isolated region
//     const regionCanvas = new OffscreenCanvas(width, height);
//     const regionCtx = regionCanvas.getContext('2d');
    
//     // Create a blank canvas for the result
//     const resultCanvas = new OffscreenCanvas(width, height);
//     const resultCtx = resultCanvas.getContext('2d');
    
//     // Draw only the selected region pixels
//     const originalImage = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
//     region.forEach(pixelIndex => {
//         const x = pixelIndex % width;
//         const y = Math.floor(pixelIndex / width);
//         const sourceIndex = (y * width + x) * 4;
        
//         for (let c = 0; c < 4; c++) {
//             originalImage.data[sourceIndex + c] = imageData.data[sourceIndex + c];
//         }
//     });
    
//     regionCtx.putImageData(originalImage, 0, 0);
    
//     // Apply rotation to the region
//     resultCtx.translate(
//         getRotationCenterX(corner, width),
//         getRotationCenterY(corner, height)
//     );
//     resultCtx.rotate(angle * Math.PI / 180);
//     resultCtx.translate(
//         -getRotationCenterX(corner, width),
//         -getRotationCenterY(corner, height)
//     );
    
//     resultCtx.drawImage(regionCanvas, 0, 0);
    
//     return resultCtx.getImageData(0, 0, width, height);
// }

// // Function to rotate selected regions
// function rotateSelectedRegions(imageData, selectedRegions, angle, corner) {
//     const width = imageData.width;
//     const height = imageData.height;
    
//     // Create result image with original content
//     const resultImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
//     // Process each selected region
//     selectedRegions.forEach(region => {
//         // Clear the original region pixels
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             for (let c = 0; c < 4; c++) {
//                 resultImageData.data[baseIndex + c] = 0;
//             }
//         });
        
//         // Get rotated region
//         const rotatedRegion = rotateRegion(imageData, region, angle, corner);
        
//         // Blend rotated region back into result
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             const targetIndex = (y * width + x) * 4;
            
//             if (rotatedRegion.data[targetIndex + 3] > 0) { // If pixel is not transparent
//                 for (let c = 0; c < 4; c++) {
//                     resultImageData.data[targetIndex + c] = rotatedRegion.data[targetIndex + c];
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
//         value5: iterations = DEFAULT_ITERATIONS,
//         corner = 'bottomRight',
//         reset 
//     } = e.data;
    
//     try {
//         // Reset counter if requested
//         if (reset) {
//             currentIteration = 0;
//         }
        
//         let resultImageData;
        
//         // Only process if we have selected regions
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             const currentAngle = DEFAULT_ROTATION_STEP * currentIteration;
//             resultImageData = rotateSelectedRegions(imageData, selectedRegions, currentAngle, corner);
//             currentIteration = (currentIteration + 1) % iterations;
//         } else {
//             // If no regions selected, return original image
//             resultImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
//         }
        
//         // Calculate progress
//         const progress = currentIteration / iterations;
        
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

function rotateRegionBottomLeft(imageData, angle) {
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
    const centerX = 0;  // Rotate around bottom left
    const centerY = height;
    
    // Rotate pixels around bottom left corner
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

// Function to rotate selected regions around bottom left corner
function rotateSelectedRegionsBottomLeft(imageData, selectedRegions, maxRotationAngle) {
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
        const centerY = height;  // Bottom
        const centerX = 0;       // Left
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
            resultImageData = rotateSelectedRegionsBottomLeft(imageData, selectedRegions, maxRotationAngle);
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
            rotateRegionBottomLeft(resultImageData, totalRotation);
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