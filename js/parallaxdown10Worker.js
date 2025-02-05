// // // // const DEFAULT_ITERATIONS = 120;
// // // // const DEFAULT_SCALE_FACTOR = 0.5;
// // // // const ANIMATION_PHASES = {
// // // //     OPENING: 'opening',
// // // //     CLOSING: 'closing'
// // // // };

// // // // let currentIteration = 0;
// // // // let currentPhase = ANIMATION_PHASES.OPENING;
// // // // let currentShapeIndex = 0;

// // // // // Helper function to copy image data
// // // // function copyImageData(source, destination) {
// // // //     destination.data.set(source.data);
// // // // }

// // // // // Helper function to create new ImageData with transparent background
// // // // function createTransparentImageData(width, height) {
// // // //     return new ImageData(
// // // //         new Uint8ClampedArray(width * height * 4),
// // // //         width,
// // // //         height
// // // //     );
// // // // }

// // // // // Function to apply trsnfrm effect to a region
// // // // function applytrsnfrmToRegion(imageData, region, value) {
// // // //     const width = imageData.width;
// // // //     const height = imageData.height;
// // // //     const newImageData = createTransparentImageData(width, height);
// // // //     copyImageData(imageData, newImageData);
    
// // // //     const tempBuffer = new Uint8ClampedArray(width * height * 4);
// // // //     const shiftAmount = Math.round(value * 10); // Scale the shift based on value
    
// // // //     // Clear selected region
// // // //     region.forEach(pixelIndex => {
// // // //         const baseIndex = pixelIndex * 4;
// // // //         for (let c = 0; c < 4; c++) {
// // // //             newImageData.data[baseIndex + c] = 0;
// // // //         }
// // // //     });
    
// // // //     // Apply shift to pixels
// // // //     region.forEach(pixelIndex => {
// // // //         const x = pixelIndex % width;
// // // //         const y = Math.floor(pixelIndex / width);
// // // //         const sourceIndex = (y * width + x) * 4;
        
// // // //         // Calculate new position with wrapping
// // // //         const newY = (y + shiftAmount + height) % height;
// // // //         const targetIndex = (newY * width + x) * 4;
        
// // // //         for (let c = 0; c < 4; c++) {
// // // //             tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
// // // //         }
// // // //     });
    
// // // //     // Blend shifted pixels
// // // //     for (let i = 0; i < tempBuffer.length; i += 4) {
// // // //         if (tempBuffer[i + 3] > 0) {
// // // //             for (let c = 0; c < 4; c++) {
// // // //                 newImageData.data[i + c] = tempBuffer[i + c];
// // // //             }
// // // //         }
// // // //     }
    
// // // //     return newImageData;
// // // // }

// // // // self.onmessage = function(e) {
// // // //     const { 
// // // //         imageData, 
// // // //         selectedRegions,
// // // //         value = 1,  // Added for trsnfrm effect
// // // //         iterations = DEFAULT_ITERATIONS,
// // // //         reset 
// // // //     } = e.data;
    
// // // //     try {
// // // //         if (reset) {
// // // //             currentIteration = 0;
// // // //             currentPhase = ANIMATION_PHASES.OPENING;
// // // //             currentShapeIndex = 0;
// // // //         }
        
// // // //         let resultImageData;
        
// // // //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// // // //             resultImageData = createTransparentImageData(imageData.width, imageData.height);
// // // //             copyImageData(imageData, resultImageData);
            
// // // //             selectedRegions.forEach(region => {
// // // //                 const trsnfrmResult = applytrsnfrmToRegion(resultImageData, region, value);
// // // //                 copyImageData(trsnfrmResult, resultImageData);
// // // //             });
// // // //         } else {
// // // //             resultImageData = new ImageData(
// // // //                 new Uint8ClampedArray(imageData.data),
// // // //                 imageData.width,
// // // //                 imageData.height
// // // //             );
// // // //         }
        
// // // //         self.postMessage({
// // // //             segmentedImages: [resultImageData],
// // // //             isComplete: true,
// // // //             iteration: currentIteration
// // // //         });
// // // //     } catch (error) {
// // // //         self.postMessage({
// // // //             error: error.message,
// // // //             isComplete: true
// // // //         });
// // // //     }
// // // // };

// // // function apply3DEffect(imageData, region, depth = 15, angle = 45) {
// // //     const width = imageData.width;
// // //     const height = imageData.height;
// // //     const newImageData = new ImageData(
// // //         new Uint8ClampedArray(imageData.data),
// // //         width,
// // //         height
// // //     );

// // //     // Create shadow and highlight regions
// // //     const shadowStrength = 0.6;
// // //     const highlightStrength = 0.4;

// // //     // Calculate offsets based on angle
// // //     const xOffset = Math.cos(angle * Math.PI / 180) * depth;
// // //     const yOffset = Math.sin(angle * Math.PI / 180) * depth;

// // //     region.forEach(pixelIndex => {
// // //         const x = pixelIndex % width;
// // //         const y = Math.floor(pixelIndex / width);
// // //         const baseIndex = pixelIndex * 4;

// // //         // Add shadow
// // //         const shadowX = Math.round(x + xOffset);
// // //         const shadowY = Math.round(y + yOffset);
// // //         if (shadowX >= 0 && shadowX < width && shadowY >= 0 && shadowY < height) {
// // //             const shadowIndex = (shadowY * width + shadowX) * 4;
// // //             // Apply dark shadow
// // //             newImageData.data[shadowIndex] = imageData.data[shadowIndex] * shadowStrength;
// // //             newImageData.data[shadowIndex + 1] = imageData.data[shadowIndex + 1] * shadowStrength;
// // //             newImageData.data[shadowIndex + 2] = imageData.data[shadowIndex + 2] * shadowStrength;
// // //         }

// // //         // Add highlight to original pixels
// // //         newImageData.data[baseIndex] = Math.min(255, imageData.data[baseIndex] * (1 + highlightStrength));
// // //         newImageData.data[baseIndex + 1] = Math.min(255, imageData.data[baseIndex + 1] * (1 + highlightStrength));
// // //         newImageData.data[baseIndex + 2] = Math.min(255, imageData.data[baseIndex + 2] * (1 + highlightStrength));
// // //     });

// // //     // Add bevel effect
// // //     const bevelSize = 2;
// // //     region.forEach(pixelIndex => {
// // //         const x = pixelIndex % width;
// // //         const y = Math.floor(pixelIndex / width);

// // //         // Check if pixel is on the edge of the region
// // //         let isEdge = false;
// // //         for (let dx = -bevelSize; dx <= bevelSize; dx++) {
// // //             for (let dy = -bevelSize; dy <= bevelSize; dy++) {
// // //                 const checkX = x + dx;
// // //                 const checkY = y + dy;
// // //                 if (checkX >= 0 && checkX < width && checkY >= 0 && checkY < height) {
// // //                     const checkIndex = checkY * width + checkX;
// // //                     if (!region.includes(checkIndex)) {
// // //                         isEdge = true;
// // //                         break;
// // //                     }
// // //                 }
// // //             }
// // //             if (isEdge) break;
// // //         }

// // //         if (isEdge) {
// // //             const baseIndex = pixelIndex * 4;
// // //             // Add highlight to top-left edges
// // //             if (x > 0 && y > 0) {
// // //                 newImageData.data[baseIndex] = Math.min(255, newImageData.data[baseIndex] * 1.3);
// // //                 newImageData.data[baseIndex + 1] = Math.min(255, newImageData.data[baseIndex + 1] * 1.3);
// // //                 newImageData.data[baseIndex + 2] = Math.min(255, newImageData.data[baseIndex + 2] * 1.3);
// // //             }
// // //         }
// // //     });

// // //     return newImageData;
// // // }

// // // // Usage in the worker:
// // // self.onmessage = function(e) {
// // //     const { imageData, selectedRegions, depth = 15, angle = 45 } = e.data;

// // //     try {
// // //         let resultImageData;

// // //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// // //             resultImageData = new ImageData(
// // //                 new Uint8ClampedArray(imageData.data),
// // //                 imageData.width,
// // //                 imageData.height
// // //             );

// // //             selectedRegions.forEach(region => {
// // //                 const effectResult = apply3DEffect(resultImageData, region, depth, angle);
// // //                 resultImageData = effectResult;
// // //             });
// // //         } else {
// // //             resultImageData = new ImageData(
// // //                 new Uint8ClampedArray(imageData.data),
// // //                 imageData.width,
// // //                 imageData.height
// // //             );
// // //         }

// // //         self.postMessage({
// // //             segmentedImages: [resultImageData],
// // //             isComplete: true
// // //         });
// // //     } catch (error) {
// // //         self.postMessage({
// // //             error: error.message,
// // //             isComplete: true
// // //         });
// // //     }
// // // };

// // const DEFAULT_ITERATIONS = 120;
// // const DEFAULT_SCALE_FACTOR = 0.5;
// // const ANIMATION_PHASES = {
// //     OPENING: 'opening',
// //     CLOSING: 'closing'
// // };

// // let currentIteration = 0;
// // let currentPhase = ANIMATION_PHASES.OPENING;
// // let currentShapeIndex = 0;

// // // Helper function to copy image data
// // function copyImageData(source, destination) {
// //     destination.data.set(source.data);
// // }

// // // Helper function to create new ImageData with transparent background
// // function createTransparentImageData(width, height) {
// //     return new ImageData(
// //         new Uint8ClampedArray(width * height * 4),
// //         width,
// //         height
// //     );
// // }

// // // Function to apply parallax effect to a region
// // function applyParallaxToRegion(imageData, region, scrollOffset, depth) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const newImageData = createTransparentImageData(width, height);
// //     copyImageData(imageData, newImageData);
    
// //     // Calculate parallax shift based on scroll offset and depth
// //     const parallaxShift = Math.round(scrollOffset * depth);
// //     const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
// //     // Clear selected region
// //     region.forEach(pixelIndex => {
// //         const baseIndex = pixelIndex * 4;
// //         for (let c = 0; c < 4; c++) {
// //             newImageData.data[baseIndex + c] = 0;
// //         }
// //     });
    
// //     // Apply parallax shift to pixels
// //     region.forEach(pixelIndex => {
// //         const x = pixelIndex % width;
// //         const y = Math.floor(pixelIndex / width);
// //         const sourceIndex = (y * width + x) * 4;
        
// //         // Calculate new position with parallax effect
// //         const newY = (y + parallaxShift + height) % height;
// //         const targetIndex = (newY * width + x) * 4;
        
// //         // Handle wrapping for smooth transition
// //         if (newY >= 0 && newY < height) {
// //             for (let c = 0; c < 4; c++) {
// //                 tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
// //             }
// //         }
// //     });
    
// //     // Blend shifted pixels with alpha fade at edges
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             const i = (y * width + x) * 4;
// //             if (tempBuffer[i + 3] > 0) {
// //                 // Calculate fade factor based on position
// //                 const fadeTop = Math.min(y / (height * 0.1), 1);
// //                 const fadeBottom = Math.min((height - y) / (height * 0.1), 1);
// //                 const alpha = Math.min(fadeTop, fadeBottom);
                
// //                 for (let c = 0; c < 3; c++) {
// //                     newImageData.data[i + c] = tempBuffer[i + c];
// //                 }
// //                 newImageData.data[i + 3] = tempBuffer[i + 3] * alpha;
// //             }
// //         }
// //     }
    
// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     const {
// //         imageData,
// //         selectedRegions,
// //         scrollOffset = 0,  // New parameter for scroll position
// //         iterations = DEFAULT_ITERATIONS,
// //         reset
// //     } = e.data;
    
// //     try {
        
// //         if (reset) {
// //             currentIteration = 0;
// //             currentPhase = ANIMATION_PHASES.OPENING;
// //             currentShapeIndex = 0;
// //         }
        
// //         let resultImageData;
        
// //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// //             resultImageData = createTransparentImageData(imageData.width, imageData.height);
// //             copyImageData(imageData, resultImageData);
            
// //             // Apply different depths to different regions for parallax effect
// //             selectedRegions.forEach((region, index) => {
// //                 const depth = 0.5 + (index * 0.25); // Different depths for different regions
// //                 const parallaxResult = applyParallaxToRegion(
// //                     resultImageData,
// //                     region,
// //                     scrollOffset,
// //                     depth
// //                 );
// //                 copyImageData(parallaxResult, resultImageData);
// //             });
// //         } else {
// //             resultImageData = new ImageData(
// //                 new Uint8ClampedArray(imageData.data),
// //                 imageData.width,
// //                 imageData.height
// //             );
// //         }
        
// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             iteration: currentIteration
// //         });
// //     } catch (error) {
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_SCALE_FACTOR = 0.5;
// const ANIMATION_PHASES = {
//     OPENING: 'opening',
//     CLOSING: 'closing'
// };

// let currentIteration = 0;
// let currentPhase = ANIMATION_PHASES.OPENING;
// let currentShapeIndex = 0;

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

// // Function to apply parallax effect to a region
// function applyParallaxToRegion(imageData, region, scrollOffset, depth) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = createTransparentImageData(width, height);
//     copyImageData(imageData, newImageData);
    
//     // Calculate parallax shift based on scroll offset and depth
//     const parallaxShift = Math.round(scrollOffset * depth);
//     const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
//     // Clear selected region
//     region.forEach(pixelIndex => {
//         const baseIndex = pixelIndex * 4;
//         for (let c = 0; c < 4; c++) {
//             newImageData.data[baseIndex + c] = 0;
//         }
//     });
    
//     // Apply parallax shift to pixels
//     region.forEach(pixelIndex => {
//         const x = pixelIndex % width;
//         const y = Math.floor(pixelIndex / width);
//         const sourceIndex = (y * width + x) * 4;
        
//         // Calculate new position with parallax effect
//         const newY = (y + parallaxShift + height) % height;
//         const targetIndex = (newY * width + x) * 4;
        
//         // Handle wrapping for smooth transition
//         if (newY >= 0 && newY < height) {
//             for (let c = 0; c < 4; c++) {
//                 tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
//             }
//         }
//     });
    
//     // Blend shifted pixels with alpha fade at edges
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const i = (y * width + x) * 4;
//             if (tempBuffer[i + 3] > 0) {
//                 // Calculate fade factor based on position
//                 const fadeTop = Math.min(y / (height * 0.1), 1);
//                 const fadeBottom = Math.min((height - y) / (height * 0.1), 1);
//                 const alpha = Math.min(fadeTop, fadeBottom);
                
//                 for (let c = 0; c < 3; c++) {
//                     newImageData.data[i + c] = tempBuffer[i + c];
//                 }
//                 newImageData.data[i + 3] = tempBuffer[i + 3] * alpha;
//             }
//         }
//     }
    
//     return newImageData;
// }

// self.onmessage = function(e) {
//     const {
//         imageData,
//         selectedRegions,
//         scrollOffset = 0,  // New parameter for scroll position
//         iterations = DEFAULT_ITERATIONS,
//         reset
//     } = e.data;
    
//     try {

//         if (reset) {
//             currentIteration = 0;
//             currentPhase = ANIMATION_PHASES.OPENING;
//             currentShapeIndex = 0;
//         }
        
//         let resultImageData;
        
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             resultImageData = createTransparentImageData(imageData.width, imageData.height);
//             copyImageData(imageData, resultImageData);
            
//             // Apply different depths to different regions for parallax effect
//             selectedRegions.forEach((region, index) => {
//                 const depth = 0.5 + (index * 0.25); // Different depths for different regions
//                 const parallaxResult = applyParallaxToRegion(
//                     resultImageData,
//                     region,
//                     scrollOffset,
//                     depth
//                 );
//                 copyImageData(parallaxResult, resultImageData);
//             });
     
//         } else {
//             resultImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// Constants
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to move entire region down
function moveRegionDown(imageData, totalMove) {
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
    
    // Move pixels to new position
    for (let y = 0; y < height; y++) {
        const newY = Math.min(y + totalMove, height - 1);
        if (newY !== y) {
            for (let x = 0; x < width; x++) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to move selected regions
function moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const verticalOffset = Math.random() * maxVerticalOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Move pixels
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newY = Math.min(height - 1, y + verticalOffset);
            
            if (newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend moved pixels
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
        value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
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
            resultImageData = moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            moveRegionDown(resultImageData, totalMove);
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