// // self.onmessage = function(e) {

// //     const {
// //         imageData,
// //         selectedRegions,
// //         imageCount,
// //         maxBrightness,
// //         value1,
// //         value2,
// //         value3,
// //         value4,
// //         value5,
// //         clickedPoints,
// //         lines
// //     } = e.data;

// //     const segmentedImages = [];
// //     const width = imageData.width;
// //     const height = imageData.height;

// //     function cloneAndMoveRegion(imageData, selectedRegion, shiftAmount, scaleFactor) {
// //         const newWidth = Math.floor(width * scaleFactor);
// //         const newHeight = Math.floor(height * scaleFactor);
// //         const newImageData = new ImageData(newWidth, newHeight);

// //         const centerX = width / 2;
// //         const centerY = height / 2;
// //         const newCenterX = newWidth / 2;
// //         const newCenterY = newHeight / 2;

// //         selectedRegion.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
// //             const index = (y * width + x) * 4;

// //             // Translate to center, scale, and translate back
// //             const newX = Math.floor((x - centerX) * scaleFactor + newCenterX + shiftAmount);
// //             const newY = Math.floor((y - centerY) * scaleFactor + newCenterY);

// //             if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
// //                 const newIndex = (newY * newWidth + newX) * 4;

// //                 newImageData.data[newIndex] = imageData.data[index];
// //                 newImageData.data[newIndex + 1] = imageData.data[index + 1];
// //                 newImageData.data[newIndex + 2] = imageData.data[index + 2];
// //                 newImageData.data[newIndex + 3] = imageData.data[index + 3];
// //             }
// //         });

// //         return newImageData;
// //     }

// //     selectedRegions.forEach(region => {
// //         for (let i = 0; i < imageCount; i++) {
// //             const shiftAmount = i; // Move by 1 pixel for each clone
// //             const scaleFactor = 1 - (i * 0.005); // Decrease size by 1% for each clone
// //             // const scaleFactor = 1; // Decrease size by 1% for each clone
// //             const newImageData = cloneAndMoveRegion(imageData, region, shiftAmount, scaleFactor);
// //             segmentedImages.push(newImageData);
// //         }
// //     });

// //     // Post the result back to the main thread
// //     self.postMessage({
// //         segmentedImages: segmentedImages,
// //         isComplete: true
// //     });


// // };

// // Constants for VR effect
// const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_MOVE_STEP = 20;

// // VR specific constants
// const BARREL_DISTORTION = 0.15;  // Reduced distortion strength
// const CHROMATIC_ABERRATION = 1.5; // Reduced color separation
// const VIGNETTE_STRENGTH = 0.5;   // Reduced vignette effect

// let currentIteration = 0;

// function createTransparentImageData(width, height) {
//     return new ImageData(
//         new Uint8ClampedArray(width * height * 4),
//         width,
//         height
//     );
// }

// // Apply barrel distortion
// function applyBarrelDistortion(x, y, width, height) {
//     const nx = (2.0 * x - width) / width;
//     const ny = (2.0 * y - height) / height;
//     const r = Math.sqrt(nx * nx + ny * ny);
//     const distortion = 1.0 + BARREL_DISTORTION * r * r;
    
//     return {
//         x: Math.floor((nx * distortion * width / 2.0) + width / 2.0),
//         y: Math.floor((ny * distortion * height / 2.0) + height / 2.0)
//     };
// }

// // Apply VR effects while preserving colors
// function applyVREffects(imageData) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const result = createTransparentImageData(width, height);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const distorted = applyBarrelDistortion(x, y, width, height);
            
//             if (distorted.x >= 0 && distorted.x < width && 
//                 distorted.y >= 0 && distorted.y < height) {
                
//                 const targetIdx = (y * width + x) * 4;
                
//                 // Get source indices for each color channel with chromatic aberration
//                 const rX = Math.min(width - 1, distorted.x + CHROMATIC_ABERRATION);
//                 const bX = Math.max(0, distorted.x - CHROMATIC_ABERRATION);
//                 const rSource = (distorted.y * width + rX) * 4;
//                 const gSource = (distorted.y * width + distorted.x) * 4;
//                 const bSource = (distorted.y * width + bX) * 4;
                
//                 // Preserve original color values
//                 result.data[targetIdx] = imageData.data[rSource];     // Red
//                 result.data[targetIdx + 1] = imageData.data[gSource + 1]; // Green
//                 result.data[targetIdx + 2] = imageData.data[bSource + 2]; // Blue
//                 result.data[targetIdx + 3] = imageData.data[gSource + 3]; // Alpha
                
//                 // Apply subtle vignette
//                 const dx = (x / width) - 0.5;
//                 const dy = (y / height) - 0.5;
//                 const distance = Math.sqrt(dx * dx + dy * dy) * 2.0;
//                 const vignette = Math.max(0.5, 1 - distance * VIGNETTE_STRENGTH);
                
//                 // Apply vignette while preserving color ratios
//                 result.data[targetIdx] *= vignette;
//                 result.data[targetIdx + 1] *= vignette;
//                 result.data[targetIdx + 2] *= vignette;
//             }
//         }
//     }
    
//     return result;
// }

// function moveRegionWithEffects(imageData, regions, maxHorizontalOffset) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const result = createTransparentImageData(width, height);
    
//     // First, copy original image data
//     result.data.set(imageData.data);
    
//     regions.forEach(region => {
//         const horizontalOffset = Math.random() * maxHorizontalOffset;
        
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             const newX = Math.max(0, x - horizontalOffset);
            
//             if (newX >= 0 && newX < width) {
//                 const sourceIdx = (y * width + x) * 4;
//                 const targetIdx = (y * width + Math.floor(newX)) * 4;
                
//                 // Copy pixel data with full color preservation
//                 for (let c = 0; c < 4; c++) {
//                     result.data[targetIdx + c] = imageData.data[sourceIdx + c];
//                 }
                
//                 // Add subtle motion blur
//                 for (let i = 1; i < Math.min(5, horizontalOffset); i++) {
//                     const blurX = Math.floor(newX + i);
//                     if (blurX < width) {
//                         const blurIdx = (y * width + blurX) * 4;
//                         const alpha = 0.3 * (1 - i / 5);
//                         for (let c = 0; c < 3; c++) {
//                             result.data[blurIdx + c] = Math.max(
//                                 result.data[blurIdx + c],
//                                 imageData.data[sourceIdx + c] * alpha
//                             );
//                         }
//                         result.data[blurIdx + 3] = Math.max(
//                             result.data[blurIdx + 3],
//                             imageData.data[sourceIdx + 3] * alpha
//                         );
//                     }
//                 }
//             }
//         });
//     });
    
//     // Apply VR effects to the final image
//     return applyVREffects(result);
// }

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
//         value5: iterations = DEFAULT_ITERATIONS,
//         reset 
//     } = e.data;
    
//     try {
//         if (reset) {
//             currentIteration = 0;
//         }
        
//         let resultImageData;
        
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // Process selected regions with effects
//             resultImageData = moveRegionWithEffects(imageData, selectedRegions, maxHorizontalOffset);
//             currentIteration = (currentIteration + 1) % iterations;
//         } else {
//             // Process full image
//             const tempImage = createTransparentImageData(imageData.width, imageData.height);
//             tempImage.data.set(imageData.data);
//             const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            
//             // Move the entire image
//             for (let y = 0; y < imageData.height; y++) {
//                 for (let x = 0; x < imageData.width; x++) {
//                     const newX = Math.max(0, x - totalMove);
//                     if (newX !== x) {
//                         const sourceIdx = (y * imageData.width + x) * 4;
//                         const targetIdx = (y * imageData.width + newX) * 4;
//                         for (let c = 0; c < 4; c++) {
//                             tempImage.data[targetIdx + c] = imageData.data[sourceIdx + c];
//                         }
//                     }
//                 }
//             }
            
//             resultImageData = applyVREffects(tempImage);
//             currentIteration++;
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress: currentIteration / iterations
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

// Enhanced VR constants
const BARREL_DISTORTION = 0.2;
const CHROMATIC_ABERRATION = 2.0;
const VIGNETTE_STRENGTH = 0.6;
const BLUR_STRENGTH = 0.8;
const WAVE_AMPLITUDE = 3;
const PULSE_SPEED = 0.05;

let currentIteration = 0;
let pulsePhase = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function applyEnhancedDistortion(x, y, width, height, time) {
    const nx = (2.0 * x - width) / width;
    const ny = (2.0 * y - height) / height;
    const r = Math.sqrt(nx * nx + ny * ny);
    
    const wave = Math.sin(r * 10 + time * 0.1) * WAVE_AMPLITUDE * (1 - r);
    const distortion = 1.0 + (BARREL_DISTORTION + Math.sin(pulsePhase) * 0.05) * r * r;
    
    return {
        x: Math.floor((nx * distortion * width / 2.0) + width / 2.0 + wave),
        y: Math.floor((ny * distortion * height / 2.0) + height / 2.0 + wave)
    };
}

function applyColorSeparation(imageData, x, y, width) {
    const idx = (y * width + x) * 4;
    const separation = CHROMATIC_ABERRATION * (1 + Math.sin(pulsePhase) * 0.2);
    
    const rX = Math.min(width - 1, x + separation);
    const bX = Math.max(0, x - separation);
    const rIdx = (y * width + Math.floor(rX)) * 4;
    const bIdx = (y * width + Math.floor(bX)) * 4;
    
    return {
        r: imageData.data[rIdx],
        g: imageData.data[idx + 1],
        b: imageData.data[bIdx + 2],
        a: imageData.data[idx + 3]
    };
}

function applyVREffects(imageData, time = 0) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    
    pulsePhase += PULSE_SPEED;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distorted = applyEnhancedDistortion(x, y, width, height, time);
            
            if (distorted.x >= 0 && distorted.x < width && 
                distorted.y >= 0 && distorted.y < height) {
                
                const targetIdx = (y * width + x) * 4;
                const colors = applyColorSeparation(imageData, distorted.x, distorted.y, width);
                
                result.data[targetIdx] = colors.r;
                result.data[targetIdx + 1] = colors.g;
                result.data[targetIdx + 2] = colors.b;
                result.data[targetIdx + 3] = colors.a;
                
                const dx = (x / width) - 0.5;
                const dy = (y / height) - 0.5;
                const distance = Math.sqrt(dx * dx + dy * dy) * 2.0;
                const vignette = Math.max(0.4, 1 - distance * (VIGNETTE_STRENGTH + Math.sin(pulsePhase) * 0.1));
                
                result.data[targetIdx] *= vignette;
                result.data[targetIdx + 1] *= vignette;
                result.data[targetIdx + 2] *= vignette;
            }
        }
    }
    
    return result;
}

function applyMotionBlur(imageData, offset) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    result.data.set(imageData.data);
    
    const blurSteps = Math.min(10, Math.abs(offset));
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            for (let step = 1; step < blurSteps; step++) {
                const blurX = Math.floor(x + (offset * step / blurSteps));
                if (blurX >= 0 && blurX < width) {
                    const sourceIdx = (y * width + x) * 4;
                    const targetIdx = (y * width + blurX) * 4;
                    const alpha = BLUR_STRENGTH * (1 - step / blurSteps);
                    
                    for (let c = 0; c < 3; c++) {
                        result.data[targetIdx + c] = Math.max(
                            result.data[targetIdx + c],
                            imageData.data[sourceIdx + c] * alpha
                        );
                    }
                }
            }
        }
    }
    
    return result;
}

function moveRegionWithEffects(imageData, regions, maxHorizontalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    let processedImage = createTransparentImageData(width, height);
    processedImage.data.set(imageData.data);
    
    regions.forEach(region => {
        const horizontalOffset = Math.random() * maxHorizontalOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newX = Math.max(0, x - horizontalOffset);
            
            if (newX >= 0 && newX < width) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (y * width + Math.floor(newX)) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c];
                }
            }
        });
        
        // Blend moved pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    processedImage.data[i + c] = tempBuffer[i + c];
                }
            }
        }
        
        // Apply motion blur
        processedImage = applyMotionBlur(processedImage, horizontalOffset);
    });
    
    // Apply VR effects
    return applyVREffects(processedImage, currentIteration);
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
            pulsePhase = 0;
        }
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = moveRegionWithEffects(imageData, selectedRegions, maxHorizontalOffset);
            currentIteration = (currentIteration + 1) % iterations;
        } else {
            let processedImage = createTransparentImageData(imageData.width, imageData.height);
            processedImage.data.set(imageData.data);
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            
            // Apply motion blur to full image
            processedImage = applyMotionBlur(processedImage, -totalMove);
            
            // Apply VR effects
            resultImageData = applyVREffects(processedImage, currentIteration);
            currentIteration++;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};