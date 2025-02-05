// // // // // self.onmessage = function(e) {
// // // // //     const { imageData, value } = e.data;
// // // // //     const rotatedImageData = rotateImage(imageData, -value, 'topRight');
// // // // //     self.postMessage({ imageData: rotatedImageData });
// // // // // };

// // // // // function rotateImage(imageData, angle, corner) {
// // // // //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // // //     const ctx = canvas.getContext('2d');
// // // // //     ctx.putImageData(imageData, 0, 0);

// // // // //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // // //     const tempCtx = tempCanvas.getContext('2d');

// // // // //     tempCtx.translate(imageData.width, 0);
// // // // //     tempCtx.rotate(angle * Math.PI / 180);
// // // // //     tempCtx.translate(-imageData.width, 0);

// // // // //     tempCtx.drawImage(canvas, 0, 0);

// // // // //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // // // }

// // // // // Constants
// // // // const DEFAULT_ANGLE_STEP = 5;
// // // // const DEFAULT_ITERATIONS = 72; // Complete 360° rotation

// // // // let currentIteration = 0;

// // // // function rotateImage(imageData, angle) {
// // // //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // //     const ctx = canvas.getContext('2d');
// // // //     ctx.putImageData(imageData, 0, 0);
    
// // // //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // // //     const tempCtx = tempCanvas.getContext('2d');
    
// // // //     // Rotate around center
// // // //     tempCtx.translate(imageData.width/2, imageData.height/2);
// // // //     tempCtx.rotate(angle * Math.PI / 180);
// // // //     tempCtx.translate(-imageData.width/2, -imageData.height/2);
    
// // // //     tempCtx.drawImage(canvas, 0, 0);
// // // //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // // }

// // // // self.onmessage = function(e) {
// // // //     const { 
// // // //         imageData, 
// // // //         value: angleStep = DEFAULT_ANGLE_STEP,
// // // //         iterations = DEFAULT_ITERATIONS,
// // // //         reset 
// // // //     } = e.data;
    
// // // //     try {
// // // //         if (reset) {
// // // //             currentIteration = 0;
// // // //         }
        
// // // //         // Calculate current angle based on iteration
// // // //         const currentAngle = (currentIteration * angleStep) % 360;
// // // //         const resultImageData = rotateImage(imageData, currentAngle);
        
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
// // // const DEFAULT_ANGLE_STEP = 5;
// // // const DEFAULT_ITERATIONS = 72; // Complete 360° rotation

// // // let currentIteration = 0;

// // // function rotateImage(imageData, angle) {
// // //     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const ctx = canvas.getContext('2d');
// // //     ctx.putImageData(imageData, 0, 0);
    
// // //     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
// // //     const tempCtx = tempCanvas.getContext('2d');
    
// // //     // Rotate around center
// // //     tempCtx.translate(imageData.width/2, imageData.height/2);
// // //     tempCtx.rotate(angle * Math.PI / 180);
// // //     tempCtx.translate(-imageData.width/2, -imageData.height/2);
    
// // //     tempCtx.drawImage(canvas, 0, 0);
// // //     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// // // }

// // // self.onmessage = function(e) {
// // //     const { 
// // //         imageData, 
// // //         value: angleStep = DEFAULT_ANGLE_STEP,
// // //         iterations = DEFAULT_ITERATIONS,
// // //         reset 
// // //     } = e.data;
    
// // //     try {
// // //         if (reset) {
// // //             currentIteration = 0;
// // //         }
        
// // //         // Calculate current angle based on iteration
// // //         const currentAngle = (currentIteration * angleStep) % 360;
// // //         const resultImageData = rotateImage(imageData, currentAngle);
        
// // //         currentIteration = (currentIteration + 1) % iterations;
// // //         const progress = currentIteration / iterations;
        
// // //         self.postMessage({
// // //             segmentedImages: [resultImageData],
// // //             isComplete: true,
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
// // const DEFAULT_ANGLE = 30;
// // const DEFAULT_ITERATIONS = 12;

// // let currentIteration = 0;

// // function createTransparentImageData(width, height) {
// //     return new ImageData(
// //         new Uint8ClampedArray(width * height * 4),
// //         width,
// //         height
// //     );
// // }

// // function rotateSelectedRegions(imageData, selectedRegions, angle) {
// //     const width = imageData.width;
// //     const height = imageData.height;
    
// //     // Create canvas for the entire image
// //     const mainCanvas = new OffscreenCanvas(width, height);
// //     const mainCtx = mainCanvas.getContext('2d');
// //     mainCtx.putImageData(imageData, 0, 0);
    
// //     // Create a new ImageData for the result
// //     const resultImageData = new ImageData(
// //         new Uint8ClampedArray(imageData.data),
// //         width,
// //         height
// //     );
    
// //     // Process each selected region
// //     selectedRegions.forEach(region => {
// //         if (!region || region.length === 0) return;
        
// //         // Find bounds of the region
// //         let minX = width, minY = height;
// //         let maxX = 0, maxY = 0;
        
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
// //             minX = Math.min(minX, x);
// //             minY = Math.min(minY, y);
// //             maxX = Math.max(maxX, x);
// //             maxY = Math.max(maxY, y);
// //         });
        
// //         // Add padding to ensure rotation doesn't clip
// //         const padding = 20;
// //         minX = Math.max(0, minX - padding);
// //         minY = Math.max(0, minY - padding);
// //         maxX = Math.min(width - 1, maxX + padding);
// //         maxY = Math.min(height - 1, maxY + padding);
        
// //         const regionWidth = maxX - minX + 1;
// //         const regionHeight = maxY - minY + 1;
        
// //         // Create canvas for the region
// //         const regionCanvas = new OffscreenCanvas(regionWidth, regionHeight);
// //         const regionCtx = regionCanvas.getContext('2d');
        
// //         // Create mask for the region
// //         const maskCanvas = new OffscreenCanvas(regionWidth, regionHeight);
// //         const maskCtx = maskCanvas.getContext('2d');
// //         maskCtx.fillStyle = 'black';
// //         maskCtx.fillRect(0, 0, regionWidth, regionHeight);
        
// //         // Draw the mask for the selected region
// //         maskCtx.fillStyle = 'white';
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width - minX;
// //             const y = Math.floor(pixelIndex / width) - minY;
// //             maskCtx.fillRect(x, y, 1, 1);
// //         });
        
// //         // Extract the region
// //         regionCtx.drawImage(mainCanvas, minX, minY, regionWidth, regionHeight, 0, 0, regionWidth, regionHeight);
        
// //         // Create rotation canvas
// //         const rotationCanvas = new OffscreenCanvas(regionWidth, regionHeight);
// //         const rotationCtx = rotationCanvas.getContext('2d');
        
// //         // Perform rotation
// //         rotationCtx.save();
// //         rotationCtx.translate(regionWidth / 2, regionHeight / 2);
// //         rotationCtx.rotate(angle * Math.PI / 180);
// //         rotationCtx.translate(-regionWidth / 2, -regionHeight / 2);
// //         rotationCtx.drawImage(regionCanvas, 0, 0);
// //         rotationCtx.restore();
        
// //         // Clear the area in the result image
// //         region.forEach(pixelIndex => {
// //             const baseIndex = pixelIndex * 4;
// //             for (let i = 0; i < 4; i++) {
// //                 resultImageData.data[baseIndex + i] = 0;
// //             }
// //         });
        
// //         // Get the rotated data
// //         const rotatedData = rotationCtx.getImageData(0, 0, regionWidth, regionHeight);
// //         const maskData = maskCtx.getImageData(0, 0, regionWidth, regionHeight);
        
// //         // Blend the rotated region back into the result
// //         for (let y = 0; y < regionHeight; y++) {
// //             for (let x = 0; x < regionWidth; x++) {
// //                 const sourceIdx = (y * regionWidth + x) * 4;
// //                 const targetX = x + minX;
// //                 const targetY = y + minY;
                
// //                 if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
// //                     const targetIdx = (targetY * width + targetX) * 4;
// //                     const maskAlpha = maskData.data[sourceIdx + 3];
                    
// //                     if (maskAlpha > 0) {
// //                         for (let i = 0; i < 4; i++) {
// //                             resultImageData.data[targetIdx + i] = rotatedData.data[sourceIdx + i];
// //                         }
// //                     }
// //                 }
// //             }
// //         }
// //     });
    
// //     return resultImageData;
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         selectedRegions,
// //         value: angle = DEFAULT_ANGLE,
// //         iterations = DEFAULT_ITERATIONS,
// //         reset 
// //     } = e.data;
    
// //     try {
// //         if (reset) {
// //             currentIteration = 0;
// //         }
        
// //         if (!selectedRegions || selectedRegions.length === 0) {
// //             self.postMessage({
// //                 segmentedImages: [imageData],
// //                 isComplete: true,
// //                 iteration: currentIteration,
// //                 progress: 1
// //             });
// //             return;
// //         }
        
// //         // Calculate current angle based on iteration
// //         const currentAngle = (angle * currentIteration) % 360;
// //         const resultImageData = rotateSelectedRegions(imageData, selectedRegions, currentAngle);
        
// //         currentIteration = (currentIteration + 1) % iterations;
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

// // const DEFAULT_ANGLE = 30;
// // const DEFAULT_ITERATIONS = 12;

// // let currentIteration = 0;

// // function createTransparentImageData(width, height) {
// //     return new ImageData(
// //         new Uint8ClampedArray(width * height * 4),
// //         width,
// //         height
// //     );
// // }

// // function rotateSelectedRegions(imageData, selectedRegions, angle) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const resultImageData = new ImageData(
// //         new Uint8ClampedArray(imageData.data),
// //         width,
// //         height
// //     );

// //     selectedRegions.forEach(region => {
// //         if (!region || region.length === 0) return;

// //         // Create a map of selected pixels for quick lookup
// //         const selectedPixels = new Set(region);
        
// //         // Find the centroid of the region
// //         let centerX = 0;
// //         let centerY = 0;
// //         region.forEach(pixelIndex => {
// //             centerX += pixelIndex % width;
// //             centerY += Math.floor(pixelIndex / width);
// //         });
// //         centerX /= region.length;
// //         centerY /= region.length;

// //         // Create temporary buffer for rotated pixels
// //         const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
// //         // Clear the original region in the result
// //         region.forEach(pixelIndex => {
// //             const baseIndex = pixelIndex * 4;
// //             for (let i = 0; i < 4; i++) {
// //                 resultImageData.data[baseIndex + i] = 0;
// //             }
// //         });

// //         // Rotate each pixel in the region
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
            
// //             // Calculate rotation
// //             const dx = x - centerX;
// //             const dy = y - centerY;
// //             const angleRad = angle * Math.PI / 180;
// //             const cos = Math.cos(angleRad);
// //             const sin = Math.sin(angleRad);
            
// //             // New coordinates after rotation
// //             const newX = Math.round(centerX + (dx * cos - dy * sin));
// //             const newY = Math.round(centerY + (dx * sin + dy * cos));
            
// //             if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
// //                 const sourceIndex = pixelIndex * 4;
// //                 const targetIndex = (newY * width + newX) * 4;
                
// //                 // Copy pixel data to temporary buffer
// //                 for (let i = 0; i < 4; i++) {
// //                     tempBuffer[targetIndex + i] = imageData.data[sourceIndex + i];
// //                 }
// //             }
// //         });

// //         // Copy only the rotated pixels that belong to the original shape
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
            
// //             // Calculate rotation to find source pixel
// //             const dx = x - centerX;
// //             const dy = y - centerY;
// //             const angleRad = -angle * Math.PI / 180; // Inverse rotation to find source
// //             const cos = Math.cos(angleRad);
// //             const sin = Math.sin(angleRad);
            
// //             const sourceX = Math.round(centerX + (dx * cos - dy * sin));
// //             const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
// //             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// //                 const sourceIndex = (sourceY * width + sourceX) * 4;
// //                 const targetIndex = pixelIndex * 4;
                
// //                 // Only copy if source pixel had data
// //                 if (tempBuffer[sourceIndex + 3] > 0) {
// //                     for (let i = 0; i < 4; i++) {
// //                         resultImageData.data[targetIndex + i] = tempBuffer[sourceIndex + i];
// //                     }
// //                 }
// //             }
// //         });
// //     });
    
// //     return resultImageData;
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         selectedRegions,
// //         value: angle = DEFAULT_ANGLE,
// //         iterations = DEFAULT_ITERATIONS,
// //         reset 
// //     } = e.data;
    
// //     try {
// //         if (reset) {
// //             currentIteration = 0;
// //         }
        
// //         if (!selectedRegions || selectedRegions.length === 0) {
// //             self.postMessage({
// //                 segmentedImages: [imageData],
// //                 isComplete: true,
// //                 iteration: currentIteration,
// //                 progress: 1
// //             });
// //             return;
// //         }
        
// //         // Calculate current angle based on iteration
// //         const currentAngle = (angle * currentIteration) % 360;
// //         const resultImageData = rotateSelectedRegions(imageData, selectedRegions, currentAngle);
        
// //         currentIteration = (currentIteration + 1) % iterations;
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
// const DEFAULT_ANGLE = 30;
// const DEFAULT_ITERATIONS = 12;

// let currentIteration = 0;
// console.log("1111111111111111111111111");
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
        
//         // Rotation center is top-right corner (width - 1, 0)
//         const centerX = width - 1;
//         const centerY = 0;

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
//     console.log(e);
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
//   console.log(resultImageData);      
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
        
        // Rotation center is top-right corner (width - 1, 0)
        const centerX = width - 1;
        const centerY = 0;

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