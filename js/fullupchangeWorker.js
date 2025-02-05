// Placeholder for fullupchangeWorker.js
// // // self.onmessage = function(e) {
// // //     const { imageData, value } = e.data;
// // //     const width = imageData.width;
// // //     const height = imageData.height;
// // //     const centerX = width / 2;
// // //     const centerY = height / 2;
// // //     const segments = Math.floor(value);

// // //     const newImageData = new ImageData(width, height);

// // //     for (let y = 0; y < height; y++) {
// // //         for (let x = 0; x < width; x++) {
// // //             const dx = x - centerX;
// // //             const dy = y - centerY;
// // //             let angle = Math.atan2(dy, dx);
// // //             const distance = Math.sqrt(dx * dx + dy * dy);

// // //             angle = ((angle % (Math.PI * 2 / segments)) + Math.PI * 2) % (Math.PI * 2);
            
// // //             const sourceX = Math.round(centerX + distance * Math.cos(angle));
// // //             const sourceY = Math.round(centerY + distance * Math.sin(angle));

// // //             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// // //                 const sourceIndex = (sourceY * width + sourceX) * 4;
// // //                 const targetIndex = (y * width + x) * 4;
// // //                 for (let i = 0; i < 4; i++) {
// // //                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
// // //                 }
// // //             }
// // //         }
// // //     }

// // //     self.postMessage({ imageData: newImageData });
// // // };

// // // Constants
// // const DEFAULT_ITERATIONS = 120;
// // const DEFAULT_SECTIONS = 6; // Number of symmetrical sections

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

// // // Function to apply kaleidoscope effect
// // function applyKaleidoscope(imageData, sections) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const centerX = width / 2;
// //     const centerY = height / 2;
// //     const angleStep = (2 * Math.PI) / sections; // Angle for each section
// //     const newImageData = createTransparentImageData(width, height);

// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             // Calculate the angle and distance from the center
// //             const dx = x - centerX;
// //             const dy = y - centerY;
// //             const distance = Math.sqrt(dx * dx + dy * dy);
// //             let angle = Math.atan2(dy, dx);

// //             // Normalize angle to [0, 2π)
// //             if (angle < 0) angle += 2 * Math.PI;

// //             // Find the corresponding section
// //             const section = Math.floor(angle / angleStep);
// //             const mirroredAngle = section * angleStep; // Mirror angle within the section

// //             // Calculate mirrored coordinates
// //             const mirroredX = Math.round(centerX + distance * Math.cos(mirroredAngle));
// //             const mirroredY = Math.round(centerY + distance * Math.sin(mirroredAngle));

// //             // Copy pixel data from the mirrored position
// //             if (mirroredX >= 0 && mirroredX < width && mirroredY >= 0 && mirroredY < height) {
// //                 const sourceIdx = (mirroredY * width + mirroredX) * 4;
// //                 const destIdx = (y * width + x) * 4;

// //                 for (let c = 0; c < 4; c++) {
// //                     newImageData.data[destIdx + c] = imageData.data[sourceIdx + c];
// //                 }
// //             }
// //         }
// //     }

// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         value5: iterations = DEFAULT_ITERATIONS,
// //         value6: sections = DEFAULT_SECTIONS,
// //         reset 
// //     } = e.data;
    
// //     try {
// //         // Reset counter if requested
// //         if (reset) {
// //             currentIteration = 0;
// //         }
        
// //         let resultImageData;
// //         let progress;
        
// //         // Apply kaleidoscope effect
// //         resultImageData = applyKaleidoscope(imageData, sections);
// //         currentIteration = (currentIteration + 1) % iterations;
// //         progress = currentIteration / iterations;
        
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


// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value, 
//         value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
//         value5: iterations = DEFAULT_ITERATIONS,
//         reset,
//         applyKaleidoscope: shouldApplyKaleidoscope = false // New parameter to toggle kaleidoscope effect
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
//             if (shouldApplyKaleidoscope) {
//                 // Apply kaleidoscope effect
//                 resultImageData = applyKaleidoscope(imageData, selectedRegions);
//             } else {
//                 // Apply the original effect
//                 resultImageData = moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset);
//             }
//             currentIteration = (currentIteration + 1) % iterations;
//             progress = currentIteration / iterations;
//         } else {
//             // Full image mode
//             resultImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );
//             const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
//             moveRegionDown(resultImageData, totalMove);
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
const DEFAULT_SEGMENTS = 8;
const DEFAULT_ROTATION = 0;
const DEFAULT_SCALE = 1.0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to apply kaleidoscope effect
function applyKaleidoscopeEffect(imageData, numSegments = DEFAULT_SEGMENTS, rotation = DEFAULT_ROTATION, scale = DEFAULT_SCALE) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const resultImageData = createTransparentImageData(width, height);
    
    // Calculate segment angle
    const segmentAngle = (2 * Math.PI) / numSegments;
    
    // Process each pixel in the output image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Convert to polar coordinates relative to center
            let dx = (x - centerX) / scale;
            let dy = (y - centerY) / scale;
            let radius = Math.sqrt(dx * dx + dy * dy);
            let angle = Math.atan2(dy, dx) - rotation;
            
            // Wrap angle to first segment
            angle = angle % segmentAngle;
            if (angle < 0) angle += segmentAngle;
            
            // Mirror alternate segments
            if (Math.floor((angle + rotation) / segmentAngle) % 2) {
                angle = segmentAngle - angle;
            }
            
            // Convert back to cartesian coordinates
            let sourceX = Math.round(centerX + radius * Math.cos(angle));
            let sourceY = Math.round(centerY + radius * Math.sin(angle));
            
            // Copy pixel if within bounds
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIdx = (sourceY * width + sourceX) * 4;
                const targetIdx = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    resultImageData.data[targetIdx + i] = imageData.data[sourceIdx + i];
                }
            }
        }
    }
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        value: numSegments = DEFAULT_SEGMENTS,
        value2: rotation = DEFAULT_ROTATION,
        value3: scale = DEFAULT_SCALE
    } = e.data;
    
    try {
        const resultImageData = applyKaleidoscopeEffect(
            imageData,
            numSegments,
            rotation * (Math.PI / 180), // Convert rotation to radians
            scale
        );
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};