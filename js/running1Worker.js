// // // // runningAnimationWorker.js

// // // self.onmessage = function(e) {
// // //     const { imageData, value } = e.data;
// // //     const width = imageData.width;
// // //     const height = imageData.height;

// // //     const newImageData = new ImageData(width, height);

// // //     // Animation parameters
// // //     const cycleLength = 100; // Adjust for faster/slower animation
// // //     const verticalShift = Math.sin(value * Math.PI * 2 / cycleLength) * 10;
// // //     const horizontalShift = Math.cos(value * Math.PI * 2 / cycleLength) * 5;

// // //     for (let y = 0; y < height; y++) {
// // //         for (let x = 0; x < width; x++) {
// // //             // Apply vertical and horizontal shift
// // //             let sourceX = x - horizontalShift;
// // //             let sourceY = y - verticalShift;

// // //             // Wrap around if out of bounds
// // //             sourceX = (sourceX + width) % width;
// // //             sourceY = (sourceY + height) % height;

// // //             const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
// // //             const targetIndex = (y * width + x) * 4;

// // //             // Copy pixel data
// // //             for (let i = 0; i < 4; i++) {
// // //                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
// // //             }
// // //         }
// // //     }

// // //     // Simulate limb movement by slightly deforming the lower part of the image
// // //     const limbMovement = Math.sin(value * Math.PI * 2 / cycleLength) * 5;
// // //     for (let y = Math.floor(height * 0.6); y < height; y++) {
// // //         for (let x = 0; x < width; x++) {
// // //             const deform = Math.sin((y / height) * Math.PI) * limbMovement;
// // //             let sourceX = x + deform;
// // //             sourceX = (sourceX + width) % width;

// // //             const sourceIndex = (y * width + Math.floor(sourceX)) * 4;
// // //             const targetIndex = (y * width + x) * 4;

// // //             for (let i = 0; i < 4; i++) {
// // //                 newImageData.data[targetIndex + i] = newImageData.data[sourceIndex + i];
// // //             }
// // //         }
// // //     }

// // //     self.postMessage({ imageData: newImageData });
// // // };

// // const DEFAULT_CYCLE_LENGTH = 100; // Adjust for faster/slower animation
// // const DEFAULT_SHIFT_AMPLITUDE = 10; // Amplitude of the vertical shift
// // const DEFAULT_LIMB_MOVEMENT_AMPLITUDE = 5; // Amplitude of the limb movement

// // let currentIteration = 0;

// // function createTransparentImageData(width, height) {
// //     const buffer = new Uint8ClampedArray(width * height * 4);
// //     buffer.fill(0);
// //     return new ImageData(buffer, width, height);
// // }

// // function getBounds(region, width) {
// //     let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

// //     for (let i = 0; i < region.length; i++) {
// //         const x = region[i] % width;
// //         const y = Math.floor(region[i] / width);
// //         minX = Math.min(minX, x);
// //         maxX = Math.max(maxX, x);
// //         minY = Math.min(minY, y);
// //         maxY = Math.max(maxY, y);
// //     }

// //     return { minX, maxX, minY, maxY };
// // }

// // function applyShiftAndDeformEffect(imageData, selectedRegions, t) {
// //     const { width, height } = imageData;
// //     const newImageData = createTransparentImageData(width, height);

// //     // Animation parameters
// //     const cycleLength = DEFAULT_CYCLE_LENGTH;
// //     const verticalShift = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_SHIFT_AMPLITUDE;
// //     const horizontalShift = Math.cos(t * Math.PI * 2 / cycleLength) * (DEFAULT_SHIFT_AMPLITUDE / 2);

// //     // Copy original image data
// //     newImageData.data.set(imageData.data);

// //     // Process each region iteratively
// //     for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
// //         const region = selectedRegions[regionIndex];
// //         const regionSet = new Set(region);

// //         // Get bounds for current region
// //         const { minX, maxX, minY, maxY } = getBounds(region, width);

// //         // Calculate expanded bounds to allow for shifting and deformation
// //         const padding = Math.ceil(Math.max(Math.abs(verticalShift), Math.abs(horizontalShift)));

// //         const expandedMinX = Math.max(0, minX - padding);
// //         const expandedMaxX = Math.min(width - 1, maxX + padding);
// //         const expandedMinY = Math.max(0, minY - padding);
// //         const expandedMaxY = Math.min(height - 1, maxY + padding);

// //         // Clear the original region in the destination
// //         for (let i = 0; i < region.length; i++) {
// //             const baseIndex = region[i] * 4;
// //             newImageData.data[baseIndex] = 0;
// //             newImageData.data[baseIndex + 1] = 0;
// //             newImageData.data[baseIndex + 2] = 0;
// //             newImageData.data[baseIndex + 3] = 0;
// //         }

// //         // Process expanded area for shifting effect
// //         for (let y = expandedMinY; y <= expandedMaxY; y++) {
// //             for (let x = expandedMinX; x <= expandedMaxX; x++) {
// //                 // Apply vertical and horizontal shift
// //                 let sourceX = x - horizontalShift;
// //                 let sourceY = y - verticalShift;

// //                 // Wrap around if out of bounds
// //                 sourceX = (sourceX + width) % width;
// //                 sourceY = (sourceY + height) % height;

// //                 // Check if the source pixel is in bounds
// //                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// //                     const sourcePixelX = Math.floor(sourceX);
// //                     const sourcePixelY = Math.floor(sourceY);
// //                     const sourceIndex = sourcePixelY * width + sourcePixelX;

// //                     // Only copy if source pixel was in the original region
// //                     if (regionSet.has(sourceIndex)) {
// //                         const targetIndex = (y * width + x) * 4;
// //                         const sourceDataIndex = sourceIndex * 4;

// //                         // Copy pixel data
// //                         newImageData.data[targetIndex] = imageData.data[sourceDataIndex];
// //                         newImageData.data[targetIndex + 1] = imageData.data[sourceDataIndex + 1];
// //                         newImageData.data[targetIndex + 2] = imageData.data[sourceDataIndex + 2];
// //                         newImageData.data[targetIndex + 3] = imageData.data[sourceDataIndex + 3];
// //                     }
// //                 }
// //             }
// //         }

// //         // Simulate limb movement by slightly deforming the lower part of the region
// //         const limbMovement = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_LIMB_MOVEMENT_AMPLITUDE;
// //         for (let y = Math.floor(height * 0.6); y <= expandedMaxY; y++) {
// //             for (let x = expandedMinX; x <= expandedMaxX; x++) {
// //                 const deform = Math.sin((y / height) * Math.PI) * limbMovement;
// //                 let sourceX = x + deform;
// //                 sourceX = (sourceX + width) % width;

// //                 // Check if the source pixel is in bounds
// //                 if (sourceX >= 0 && sourceX < width) {
// //                     const sourcePixelX = Math.floor(sourceX);
// //                     const sourceIndex = y * width + sourcePixelX;

// //                     // Only copy if source pixel was in the original region
// //                     if (regionSet.has(sourceIndex)) {
// //                         const targetIndex = (y * width + x) * 4;
// //                         const sourceDataIndex = sourceIndex * 4;

// //                         // Copy pixel data
// //                         newImageData.data[targetIndex] = newImageData.data[sourceDataIndex];
// //                         newImageData.data[targetIndex + 1] = newImageData.data[sourceDataIndex + 1];
// //                         newImageData.data[targetIndex + 2] = newImageData.data[sourceDataIndex + 2];
// //                         newImageData.data[targetIndex + 3] = newImageData.data[sourceDataIndex + 3];
// //                     }
// //                 }
// //             }
// //         }
// //     }

// //     return newImageData;
// // }

// // self.onmessage = function(e) {
// //     try {
// //         const {
// //             imageData,
// //             selectedRegions,
// //             value,
// //             reset,
// //             cycleLength = DEFAULT_CYCLE_LENGTH,
// //             shiftAmplitude = DEFAULT_SHIFT_AMPLITUDE,
// //             limbMovementAmplitude = DEFAULT_LIMB_MOVEMENT_AMPLITUDE
// //         } = e.data;

// //         if (reset) {
// //             currentIteration = 0;
// //         }

// //         let resultImageData;
// //         let progress;

// //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// //             resultImageData = applyShiftAndDeformEffect(imageData, selectedRegions, value);
// //             currentIteration = (currentIteration + 1) % cycleLength;
// //             progress = currentIteration / cycleLength;
// //         } else {
// //             resultImageData = new ImageData(
// //                 new Uint8ClampedArray(imageData.data),
// //                 imageData.width,
// //                 imageData.height
// //             );
// //             progress = 1;
// //         }

// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             iteration: currentIteration,
// //             progress
// //         }, [resultImageData.data.buffer]);

// //     } catch (error) {
// //         self.postMessage({
// //             error: `Animation error: ${error.message}`,
// //             isComplete: true,
// //             stack: error.stack
// //         });
// //     }
// // };

// function applyShiftAndDeformEffect(imageData, selectedRegions, t) {
//     const { width, height } = imageData;
//     const newImageData = createTransparentImageData(width, height);

//     // Animation parameters
//     const cycleLength = DEFAULT_CYCLE_LENGTH;
//     const verticalShift = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_SHIFT_AMPLITUDE;
//     const horizontalShift = Math.cos(t * Math.PI * 2 / cycleLength) * (DEFAULT_SHIFT_AMPLITUDE / 2);

//     console.log("Vertical Shift:", verticalShift, "Horizontal Shift:", horizontalShift);

//     // Copy original image data
//     newImageData.data.set(imageData.data);

//     // Process each region iteratively
//     for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
//         const region = selectedRegions[regionIndex];
//         const regionSet = new Set(region);

//         console.log("Processing region:", regionIndex, "with", region.length, "pixels");

//         // Get bounds for current region
//         const { minX, maxX, minY, maxY } = getBounds(region, width);

//         console.log("Bounds for region:", { minX, maxX, minY, maxY });

//         // Calculate expanded bounds to allow for shifting and deformation
//         const padding = Math.ceil(Math.max(Math.abs(verticalShift), Math.abs(horizontalShift)));

//         const expandedMinX = Math.max(0, minX - padding);
//         const expandedMaxX = Math.min(width - 1, maxX + padding);
//         const expandedMinY = Math.max(0, minY - padding);
//         const expandedMaxY = Math.min(height - 1, maxY + padding);

//         console.log("Expanded bounds:", { expandedMinX, expandedMaxX, expandedMinY, expandedMaxY });

//         // Clear the original region in the destination
//         for (let i = 0; i < region.length; i++) {
//             const baseIndex = region[i] * 4;
//             newImageData.data[baseIndex] = 0;
//             newImageData.data[baseIndex + 1] = 0;
//             newImageData.data[baseIndex + 2] = 0;
//             newImageData.data[baseIndex + 3] = 0;
//         }

//         // Process expanded area for shifting effect
//         for (let y = expandedMinY; y <= expandedMaxY; y++) {
//             for (let x = expandedMinX; x <= expandedMaxX; x++) {
//                 // Apply vertical and horizontal shift
//                 let sourceX = x - horizontalShift;
//                 let sourceY = y - verticalShift;

//                 // Wrap around if out of bounds
//                 sourceX = (sourceX + width) % width;
//                 sourceY = (sourceY + height) % height;

//                 console.log("Source coordinates:", { sourceX, sourceY });

//                 // Check if the source pixel is in bounds
//                 if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                     const sourcePixelX = Math.floor(sourceX);
//                     const sourcePixelY = Math.floor(sourceY);
//                     const sourceIndex = sourcePixelY * width + sourcePixelX;

//                     // Only copy if source pixel was in the original region
//                     if (regionSet.has(sourceIndex)) {
//                         const targetIndex = (y * width + x) * 4;
//                         const sourceDataIndex = sourceIndex * 4;

//                         console.log("Copying pixel data from sourceIndex:", sourceIndex, "to targetIndex:", targetIndex);

//                         // Copy pixel data
//                         newImageData.data[targetIndex] = imageData.data[sourceDataIndex];
//                         newImageData.data[targetIndex + 1] = imageData.data[sourceDataIndex + 1];
//                         newImageData.data[targetIndex + 2] = imageData.data[sourceDataIndex + 2];
//                         newImageData.data[targetIndex + 3] = imageData.data[sourceDataIndex + 3];
//                     }
//                 }
//             }
//         }

//         // Simulate limb movement by slightly deforming the lower part of the region
//         const limbMovement = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_LIMB_MOVEMENT_AMPLITUDE;
//         for (let y = Math.floor(height * 0.6); y <= expandedMaxY; y++) {
//             for (let x = expandedMinX; x <= expandedMaxX; x++) {
//                 const deform = Math.sin((y / height) * Math.PI) * limbMovement;
//                 let sourceX = x + deform;
//                 sourceX = (sourceX + width) % width;

//                 console.log("Deformed sourceX:", sourceX);

//                 // Check if the source pixel is in bounds
//                 if (sourceX >= 0 && sourceX < width) {
//                     const sourcePixelX = Math.floor(sourceX);
//                     const sourceIndex = y * width + sourcePixelX;

//                     // Only copy if source pixel was in the original region
//                     if (regionSet.has(sourceIndex)) {
//                         const targetIndex = (y * width + x) * 4;
//                         const sourceDataIndex = sourceIndex * 4;

//                         console.log("Copying pixel data from sourceIndex:", sourceIndex, "to targetIndex:", targetIndex);

//                         // Copy pixel data
//                         newImageData.data[targetIndex] = newImageData.data[sourceDataIndex];
//                         newImageData.data[targetIndex + 1] = newImageData.data[sourceDataIndex + 1];
//                         newImageData.data[targetIndex + 2] = newImageData.data[sourceDataIndex + 2];
//                         newImageData.data[targetIndex + 3] = newImageData.data[sourceDataIndex + 3];
//                     }
//                 }
//             }
//         }
//     }

//     return newImageData;
// }


const DEFAULT_CYCLE_LENGTH = 100; // Adjust for faster/slower animation
const DEFAULT_SHIFT_AMPLITUDE = 10; // Amplitude of the vertical shift
const DEFAULT_LIMB_MOVEMENT_AMPLITUDE = 5; // Amplitude of the limb movement

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function getBounds(region, width) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < region.length; i++) {
        const x = region[i] % width;
        const y = Math.floor(region[i] / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    return { minX, maxX, minY, maxY };
}

function applyShiftAndDeformEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const verticalShift = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_SHIFT_AMPLITUDE;
    const horizontalShift = Math.cos(t * Math.PI * 2 / cycleLength) * (DEFAULT_SHIFT_AMPLITUDE / 2);

    // Copy original image data
    newImageData.data.set(imageData.data);

    // Process each region iteratively
    for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
        const region = selectedRegions[regionIndex];
        const regionSet = new Set(region);

        // Get bounds for current region
        const { minX, maxX, minY, maxY } = getBounds(region, width);

        // Calculate expanded bounds to allow for shifting and deformation
        const padding = Math.ceil(Math.max(Math.abs(verticalShift), Math.abs(horizontalShift)));

        const expandedMinX = Math.max(0, minX - padding);
        const expandedMaxX = Math.min(width - 1, maxX + padding);
        const expandedMinY = Math.max(0, minY - padding);
        const expandedMaxY = Math.min(height - 1, maxY + padding);

        // Clear the original region in the destination
        for (let i = 0; i < region.length; i++) {
            const baseIndex = region[i] * 4;
            newImageData.data[baseIndex] = 0;
            newImageData.data[baseIndex + 1] = 0;
            newImageData.data[baseIndex + 2] = 0;
            newImageData.data[baseIndex + 3] = 0;
        }

        // Process expanded area for shifting effect
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Apply vertical and horizontal shift
                let sourceX = x - horizontalShift;
                let sourceY = y - verticalShift;

                // Wrap around if out of bounds
                sourceX = (sourceX + width) % width;
                sourceY = (sourceY + height) % height;

                // Check if the source pixel is in bounds
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const sourcePixelX = Math.floor(sourceX);
                    const sourcePixelY = Math.floor(sourceY);
                    const sourceIndex = sourcePixelY * width + sourcePixelX;

                    // Only copy if source pixel was in the original region
                    if (regionSet.has(sourceIndex)) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceDataIndex = sourceIndex * 4;

                        // Copy pixel data
                        newImageData.data[targetIndex] = imageData.data[sourceDataIndex];
                        newImageData.data[targetIndex + 1] = imageData.data[sourceDataIndex + 1];
                        newImageData.data[targetIndex + 2] = imageData.data[sourceDataIndex + 2];
                        newImageData.data[targetIndex + 3] = imageData.data[sourceDataIndex + 3];
                    }
                }
            }
        }

        // Simulate limb movement by slightly deforming the lower part of the region
        const limbMovement = Math.sin(t * Math.PI * 2 / cycleLength) * DEFAULT_LIMB_MOVEMENT_AMPLITUDE;
        for (let y = Math.floor(height * 0.6); y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                const deform = Math.sin((y / height) * Math.PI) * limbMovement;
                let sourceX = x + deform;
                sourceX = (sourceX + width) % width;

                // Check if the source pixel is in bounds
                if (sourceX >= 0 && sourceX < width) {
                    const sourcePixelX = Math.floor(sourceX);
                    const sourceIndex = y * width + sourcePixelX;

                    // Only copy if source pixel was in the original region
                    if (regionSet.has(sourceIndex)) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceDataIndex = sourceIndex * 4;

                        // Copy pixel data
                        newImageData.data[targetIndex] = newImageData.data[sourceDataIndex];
                        newImageData.data[targetIndex + 1] = newImageData.data[sourceDataIndex + 1];
                        newImageData.data[targetIndex + 2] = newImageData.data[sourceDataIndex + 2];
                        newImageData.data[targetIndex + 3] = newImageData.data[sourceDataIndex + 3];
                    }
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function(e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            shiftAmplitude = DEFAULT_SHIFT_AMPLITUDE,
            limbMovementAmplitude = DEFAULT_LIMB_MOVEMENT_AMPLITUDE
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyShiftAndDeformEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);

    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack
        });
    }
};