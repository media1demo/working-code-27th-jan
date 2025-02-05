// // // self.onmessage = function(e) {
// // //     const {
// // //         imageData,
// // //         selectedRegions,
// // //         imageCount,
// // //         maxBrightness,
// // //         value1,
// // //         value2,
// // //         value3,
// // //         value4,
// // //         value5,
// // //         clickedPoints,
// // //         lines
// // //     } = e.data;

// // //     const segmentedImages = [];
// // //     const width = imageData.width;
// // //     const height = imageData.height;

// // //     function cloneAndMoveRegion(imageData, selectedRegion, shiftAmount, scaleFactor) {
// // //         const newWidth = Math.floor(width * scaleFactor);
// // //         const newHeight = Math.floor(height * scaleFactor);
// // //         const newImageData = new ImageData(newWidth, newHeight);

// // //         const centerX = width / 2;
// // //         const centerY = height / 2;
// // //         const newCenterX = newWidth / 2;
// // //         const newCenterY = newHeight / 2;

// // //         selectedRegion.forEach(pixelIndex => {
// // //             const x = pixelIndex % width;
// // //             const y = Math.floor(pixelIndex / width);
// // //             const index = (y * width + x) * 4;

// // //             const newX = Math.floor((x - centerX) * scaleFactor + newCenterX - shiftAmount);
// // //             const newY = Math.floor((y - centerY) * scaleFactor + newCenterY);

// // //             if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
// // //                 const newIndex = (newY * newWidth + newX) * 4;

// // //                 newImageData.data[newIndex] = imageData.data[index];
// // //                 newImageData.data[newIndex + 1] = imageData.data[index + 1];
// // //                 newImageData.data[newIndex + 2] = imageData.data[index + 2];
// // //                 newImageData.data[newIndex + 3] = imageData.data[index + 3];
// // //             }
// // //         });

// // //         return newImageData;
// // //     }

// // //     // Generate the parallax effect for each selected region
// // //     selectedRegions.forEach(region => {
// // //         for (let i = 0; i < imageCount; i++) {
// // //             const shiftAmount = i; // Move by 1 pixel for each clone
// // //             const scaleFactor = 1 + (i * 0.005); // Increase size by 0.005% for each clone
// // //             const newImageData = cloneAndMoveRegion(imageData, region, shiftAmount, scaleFactor);
// // //             segmentedImages.push(newImageData);
// // //         }
// // //     });

// // //     // Post the result back to the main thread
// // //     self.postMessage({
// // //         segmentedImages: segmentedImages,
// // //         isComplete: true
// // //     });
// // // };

// // // Constants for parallax movement
// // const DEFAULT_MAX_HORIZONTAL_OFFSET = 150;
// // const DEFAULT_ITERATIONS = 180;
// // const DEFAULT_MOVE_STEP = 30;
// // const SMOOTHING_FACTOR = 0.85;
// // const LAYER_DEPTH_FACTOR = 0.5;
// // const MIN_ALPHA_THRESHOLD = 20;

// // let currentIteration = 0;
// // let lastFrameTime = 0;

// // // Helper function to create new ImageData with transparent background
// // function createTransparentImageData(width, height) {
// //     return new ImageData(
// //         new Uint8ClampedArray(width * height * 4),
// //         width,
// //         height
// //     );
// // }

// // // Helper function for smooth interpolation
// // function smoothstep(min, max, value) {
// //     const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
// //     return x * x * (3 - 2 * x);
// // }

// // // Helper function to apply depth-based movement
// // function calculateDepthOffset(baseOffset, depth) {
// //     return baseOffset * (1 + depth * LAYER_DEPTH_FACTOR);
// // }

// // // Enhanced image data copy with alpha blending
// // function blendImageData(source, destination, alpha = 1) {
// //     const length = source.data.length;
// //     for (let i = 0; i < length; i += 4) {
// //         const sourceAlpha = source.data[i + 3] * alpha;
// //         if (sourceAlpha > MIN_ALPHA_THRESHOLD) {
// //             const blendFactor = sourceAlpha / 255;
// //             destination.data[i] = (source.data[i] * blendFactor) + (destination.data[i] * (1 - blendFactor));
// //             destination.data[i + 1] = (source.data[i + 1] * blendFactor) + (destination.data[i + 1] * (1 - blendFactor));
// //             destination.data[i + 2] = (source.data[i + 2] * blendFactor) + (destination.data[i + 2] * (1 - blendFactor));
// //             destination.data[i + 3] = Math.max(destination.data[i + 3], sourceAlpha);
// //         }
// //     }
// // }

// // // Function to handle large region movement
// // function moveRegionLeft(imageData, totalMove, smoothing = true) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const tempBuffer = new Uint8ClampedArray(imageData.data);
// //     const resultBuffer = createTransparentImageData(width, height);
    
// //     // Apply movement with smoothing
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             const offset = smoothing ? 
// //                 totalMove * smoothstep(0, height, y) : 
// //                 totalMove;
            
// //             const newX = Math.max(0, x - offset);
// //             if (newX >= 0 && newX < width) {
// //                 const sourceIdx = (y * width + x) * 4;
// //                 const destIdx = (y * width + Math.floor(newX)) * 4;
                
// //                 // Apply smooth transition
// //                 const fracX = newX - Math.floor(newX);
// //                 const alpha = smoothing ? SMOOTHING_FACTOR + (1 - SMOOTHING_FACTOR) * (1 - fracX) : 1;
                
// //                 for (let c = 0; c < 4; c++) {
// //                     resultBuffer.data[destIdx + c] = tempBuffer[sourceIdx + c] * alpha;
// //                 }
// //             }
// //         }
// //     }
    
// //     return resultBuffer;
// // }

// // // Enhanced function to move selected regions with depth
// // function moveSelectedRegionsWithDepth(imageData, selectedRegions, maxHorizontalOffset) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const resultBuffer = createTransparentImageData(width, height);
    
// //     // Sort regions by size (proxy for depth)
// //     const sortedRegions = selectedRegions.sort((a, b) => b.length - a.length);
    
// //     sortedRegions.forEach((region, index) => {
// //         const depth = index / sortedRegions.length;
// //         const horizontalOffset = calculateDepthOffset(
// //             maxHorizontalOffset * (0.5 + Math.random() * 0.5),
// //             depth
// //         );
        
// //         const layerBuffer = createTransparentImageData(width, height);
        
// //         // Process each pixel in the region
// //         region.forEach(pixelIndex => {
// //             const x = pixelIndex % width;
// //             const y = Math.floor(pixelIndex / width);
// //             const newX = Math.max(0, x - horizontalOffset);
            
// //             if (newX >= 0 && newX < width) {
// //                 const sourceIdx = (y * width + x) * 4;
// //                 const targetIdx = (y * width + Math.floor(newX)) * 4;
                
// //                 // Copy pixel data with depth-based alpha
// //                 const alpha = 1 - (depth * 0.2);
// //                 for (let c = 0; c < 4; c++) {
// //                     layerBuffer.data[targetIdx + c] = imageData.data[sourceIdx + c] * alpha;
// //                 }
// //             }
// //         });
        
// //         // Blend layer into result
// //         blendImageData(layerBuffer, resultBuffer);
// //     });
    
// //     return resultBuffer;
// // }

// // // Motion blur effect
// // function applyMotionBlur(imageData, strength) {
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const result = createTransparentImageData(width, height);
    
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             let r = 0, g = 0, b = 0, a = 0, count = 0;
            
// //             // Sample multiple points for blur
// //             for (let s = 0; s < strength; s++) {
// //                 const sampleX = Math.max(0, x - s);
// //                 const idx = (y * width + sampleX) * 4;
                
// //                 r += imageData.data[idx];
// //                 g += imageData.data[idx + 1];
// //                 b += imageData.data[idx + 2];
// //                 a += imageData.data[idx + 3];
// //                 count++;
// //             }
            
// //             // Write averaged values
// //             const targetIdx = (y * width + x) * 4;
// //             result.data[targetIdx] = r / count;
// //             result.data[targetIdx + 1] = g / count;
// //             result.data[targetIdx + 2] = b / count;
// //             result.data[targetIdx + 3] = a / count;
// //         }
// //     }
    
// //     return result;
// // }

// // // Main worker message handler
// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         selectedRegions, 
// //         value, 
// //         value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
// //         value5: iterations = DEFAULT_ITERATIONS,
// //         reset 
// //     } = e.data;
    
// //     try {
// //         if (reset) {
// //             currentIteration = 0;
// //             lastFrameTime = 0;
// //         }
        
// //         const currentTime = performance.now();
// //         const deltaTime = lastFrameTime ? (currentTime - lastFrameTime) / 1000 : 0;
// //         lastFrameTime = currentTime;
        
// //         let resultImageData;
// //         let progress;
        
// //         // Handle different processing modes
// //         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
// //             // Process selected regions with depth
// //             resultImageData = moveSelectedRegionsWithDepth(
// //                 imageData, 
// //                 selectedRegions, 
// //                 maxHorizontalOffset
// //             );
            
// //             // Apply motion blur based on movement speed
// //             const blurStrength = Math.min(5, Math.abs(maxHorizontalOffset / 20));
// //             resultImageData = applyMotionBlur(resultImageData, blurStrength);
            
// //             currentIteration = (currentIteration + 1) % iterations;
// //             progress = currentIteration / iterations;
            
// //         } else {
// //             // Process entire image
// //             const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
// //             resultImageData = moveRegionLeft(
// //                 imageData, 
// //                 totalMove, 
// //                 true // Enable smoothing
// //             );
// //             currentIteration++;
// //             progress = undefined;
// //         }
        
// //         // Send processed result
// //         self.postMessage({
// //             segmentedImages: [resultImageData],
// //             isComplete: true,
// //             iteration: currentIteration,
// //             progress,
// //             deltaTime
// //         });
        
// //     } catch (error) {
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// const DEFAULT_MAX_VERTICAL_OFFSET = 50;
// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_MOVE_STEP = 20;
// const EXTRUSION_HEIGHT = 20;
// const EDGE_DARKNESS = 0.6;

// let currentIteration = 0;

// // Helper function to create new ImageData with transparent background
// function createTransparentImageData(width, height) {
//     return new ImageData(
//         new Uint8ClampedArray(width * height * 4),
//         width,
//         height
//     );
// }

// // Helper function to copy image data
// function copyImageData(source, destination) {
//     destination.data.set(source.data);
// }

// // Function to move entire region down
// function moveRegionDown(imageData, totalMove) {
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
    
//     // Move pixels to new position
//     for (let y = 0; y < height; y++) {
//         const newY = Math.min(y + totalMove, height - 1);
//         if (newY !== y) {
//             for (let x = 0; x < width; x++) {
//                 const sourceIdx = (y * width + x) * 4;
//                 const destIdx = (newY * width + x) * 4;
                
//                 // Copy pixel data
//                 for (let c = 0; c < 4; c++) {
//                     imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
//                 }
//             }
//         }
//     }
    
//     return imageData;
// }

// // Function to add 3D effect to selected regions
// function process3DRegions(imageData, selectedRegions) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = createTransparentImageData(width, height);
//     copyImageData(imageData, newImageData);
    
//     selectedRegions.forEach(region => {
//         // Create a map of pixels in the region
//         const pixelMap = new Set(region);
        
//         // Find bottom edge pixels
//         const bottomEdge = region.filter(pixelIndex => {
//             const y = Math.floor(pixelIndex / width);
//             return !pixelMap.has(pixelIndex + width) && y < height - 1;
//         });
        
//         // Add 3D effect to bottom edge
//         bottomEdge.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             const baseColor = {
//                 r: newImageData.data[pixelIndex * 4],
//                 g: newImageData.data[pixelIndex * 4 + 1],
//                 b: newImageData.data[pixelIndex * 4 + 2],
//                 a: newImageData.data[pixelIndex * 4 + 3]
//             };
            
//             // Create extrusion effect
//             for (let offset = 1; offset <= EXTRUSION_HEIGHT; offset++) {
//                 const newY = Math.min(y + offset, height - 1);
//                 const targetIdx = (newY * width + x) * 4;
                
//                 // Apply darkening based on depth
//                 const darkness = 1 - (offset / EXTRUSION_HEIGHT) * EDGE_DARKNESS;
//                 newImageData.data[targetIdx] = baseColor.r * darkness;
//                 newImageData.data[targetIdx + 1] = baseColor.g * darkness;
//                 newImageData.data[targetIdx + 2] = baseColor.b * darkness;
//                 newImageData.data[targetIdx + 3] = baseColor.a;
//             }
//         });
//     });
    
//     return newImageData;
// }

// // Main worker message handler
// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value, 
//         value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
//         value5: iterations = DEFAULT_ITERATIONS,
//         reset 
//     } = e.data;
    
//     try {
//         if (reset) {
//             currentIteration = 0;
//         }
        
//         let resultImageData;
//         let progress;
        
//         // Handle different modes based on whether regions are selected
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // Selected regions mode with 3D effect
//             resultImageData = process3DRegions(imageData, selectedRegions);
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
//             resultImageData = moveRegionDown(resultImageData, totalMove);
//             currentIteration++;
//             progress = undefined;
//         }
        
//         // Important: Send the processed image data in the same format as bottomWorker.js
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


// Constants for 3D effect
const EXTRUSION_HEIGHT = 20;  // Pixels to extrude
const LIGHT_ANGLE = Math.PI / 4;  // 45 degrees
const EDGE_DARKNESS = 0.6;  // How dark the edges should be
const EDGE_HIGHLIGHT = 1.2;  // How bright highlights should be
const MIN_REGION_SIZE = 10;  // Minimum pixels for edge detection

let currentIteration = 0;

// Helper function to create new ImageData
function createNewImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Find edges of a region
function findRegionEdges(region, width, height) {
    const edges = {
        top: [],
        bottom: [],
        left: [],
        right: []
    };
    
    // Create a pixel map for quick lookup
    const pixelMap = new Set(region);
    
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Check top edge
        if (!pixelMap.has(pixelIndex - width)) {
            edges.top.push(pixelIndex);
        }
        // Check bottom edge
        if (!pixelMap.has(pixelIndex + width)) {
            edges.bottom.push(pixelIndex);
        }
        // Check left edge
        if (x > 0 && !pixelMap.has(pixelIndex - 1)) {
            edges.left.push(pixelIndex);
        }
        // Check right edge
        if (x < width - 1 && !pixelMap.has(pixelIndex + 1)) {
            edges.right.push(pixelIndex);
        }
    });
    
    return edges;
}

// Calculate shading based on position and edge
function calculateEdgeShading(position, edgeType, lightAngle) {
    switch(edgeType) {
        case 'left':
            return lightAngle < Math.PI ? EDGE_HIGHLIGHT : EDGE_DARKNESS;
        case 'right':
            return lightAngle < Math.PI ? EDGE_DARKNESS : EDGE_HIGHLIGHT;
        case 'top':
            return lightAngle < Math.PI/2 || lightAngle > 3*Math.PI/2 ? 
                   EDGE_HIGHLIGHT : EDGE_DARKNESS;
        case 'bottom':
            return lightAngle < Math.PI/2 || lightAngle > 3*Math.PI/2 ? 
                   EDGE_DARKNESS : EDGE_HIGHLIGHT;
        default:
            return 1;
    }
}

// Apply 3D extrusion effect to a region
function applyExtrusion(imageData, region, edges) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createNewImageData(width, height);
    const depthBuffer = new Float32Array(width * height).fill(-Infinity);
    
    // Copy original image data
    result.data.set(imageData.data);
    
    // Process each edge type
    Object.entries(edges).forEach(([edgeType, edgePixels]) => {
        edgePixels.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate extrusion direction based on edge type
            let xOffset = 0, yOffset = 0;
            switch(edgeType) {
                case 'left': xOffset = -1; break;
                case 'right': xOffset = 1; break;
                case 'top': yOffset = -1; break;
                case 'bottom': yOffset = 1; break;
            }
            
            // Draw extruded edge
            for(let step = 0; step < EXTRUSION_HEIGHT; step++) {
                const newX = x + xOffset * step;
                const newY = y + yOffset * step;
                
                if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;
                
                const newIndex = (newY * width + newX) * 4;
                const depth = step;
                
                // Check depth buffer for proper occlusion
                if (depth > depthBuffer[newY * width + newX]) {
                    depthBuffer[newY * width + newX] = depth;
                    
                    // Get original color
                    const baseR = imageData.data[pixelIndex * 4];
                    const baseG = imageData.data[pixelIndex * 4 + 1];
                    const baseB = imageData.data[pixelIndex * 4 + 2];
                    
                    // Calculate shading
                    const shade = calculateEdgeShading(step/EXTRUSION_HEIGHT, edgeType, LIGHT_ANGLE);
                    
                    // Apply shaded color
                    result.data[newIndex] = baseR * shade;
                    result.data[newIndex + 1] = baseG * shade;
                    result.data[newIndex + 2] = baseB * shade;
                    result.data[newIndex + 3] = 255;
                }
            }
        });
    });
    
    return result;
}

// Add ambient occlusion to edges
function addAmbientOcclusion(imageData, edges, radius = 5, intensity = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createNewImageData(width, height);
    result.data.set(imageData.data);
    
    // Create AO map
    const aoMap = new Float32Array(width * height).fill(1);
    
    // Apply AO near edges
    Object.values(edges).flat().forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Apply darkening in a radius around edge pixels
        for(let dy = -radius; dy <= radius; dy++) {
            for(let dx = -radius; dx <= radius; dx++) {
                const newX = x + dx;
                const newY = y + dy;
                
                if (newX < 0 || newX >= width || newY < 0 || newY >= height) continue;
                
                const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance <= radius) {
                    const aoFactor = 1 - (distance/radius) * intensity;
                    aoMap[newY * width + newX] = Math.min(
                        aoMap[newY * width + newX],
                        aoFactor
                    );
                }
            }
        }
    });
    
    // Apply AO to result
    for(let i = 0; i < result.data.length; i += 4) {
        const aoFactor = aoMap[i/4];
        result.data[i] *= aoFactor;
        result.data[i + 1] *= aoFactor;
        result.data[i + 2] *= aoFactor;
    }
    
    return result;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData = createNewImageData(imageData.width, imageData.height);
        resultImageData.data.set(imageData.data);
        
        if (selectedRegions?.length > 0) {
            selectedRegions.forEach(region => {
                if (region.length >= MIN_REGION_SIZE) {
                    // Find edges of the region
                    const edges = findRegionEdges(
                        region, 
                        imageData.width, 
                        imageData.height
                    );
                    
                    // Apply 3D extrusion
                    resultImageData = applyExtrusion(resultImageData, region, edges);
                    
                    // Add ambient occlusion
                    resultImageData = addAmbientOcclusion(resultImageData, edges);
                }
            });
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration++
        });
        
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};