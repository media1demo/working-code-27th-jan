// // // self.onmessage = function(e) {
// // //     const { maskData, thresholds } = e.data;
// // //     const width = maskData.width;
// // //     const height = maskData.height;
    
// // //     const masks = {};
    
// // //     // Create masks based on intensity thresholds
// // //     for (let t = 0; t < thresholds.length; t++) {
// // //         masks[t] = new ImageData(width, height);
// // //         for (let i = 0; i < maskData.data.length; i += 4) {
// // //             const intensity = (maskData.data[i] + maskData.data[i+1] + maskData.data[i+2]) / 3;
// // //             if (intensity > thresholds[t]) {
// // //                 masks[t].data[i] = masks[t].data[i+1] = masks[t].data[i+2] = 255;
// // //                 masks[t].data[i+3] = 255;
// // //             }
// // //         }
// // //     }
    
// // //     self.postMessage({ masks });
// // // };

// // // function connectedComponentLabeling(binaryMask, width, height) {
// // //     const labeledMask = new Uint32Array(binaryMask.length);
// // //     let currentLabel = 1;
// // //     const equivalences = {};

// // //     // First pass
// // //     for (let y = 0; y < height; y++) {
// // //         for (let x = 0; x < width; x++) {
// // //             const index = y * width + x;
// // //             if (binaryMask[index] === 0) continue;

// // //             const left = x > 0 ? labeledMask[index - 1] : 0;
// // //             const up = y > 0 ? labeledMask[index - width] : 0;

// // //             if (left === 0 && up === 0) {
// // //                 labeledMask[index] = currentLabel++;
// // //             } else if (left !== 0 && up === 0) {
// // //                 labeledMask[index] = left;
// // //             } else if (left === 0 && up !== 0) {
// // //                 labeledMask[index] = up;
// // //             } else {
// // //                 labeledMask[index] = Math.min(left, up);
// // //                 updateEquivalences(equivalences, left, up);
// // //             }
// // //         }
// // //     }

// // //     // Resolve equivalences
// // //     const finalLabels = resolveEquivalences(equivalences);

// // //     // Second pass
// // //     for (let i = 0; i < labeledMask.length; i++) {
// // //         if (labeledMask[i] !== 0) {
// // //             labeledMask[i] = finalLabels[labeledMask[i]];
// // //         }
// // //     }

// // //     return labeledMask;
// // // }

// // // function updateEquivalences(equivalences, label1, label2) {
// // //     const root1 = findRoot(equivalences, label1);
// // //     const root2 = findRoot(equivalences, label2);
// // //     if (root1 !== root2) {
// // //         equivalences[Math.max(root1, root2)] = Math.min(root1, root2);
// // //     }
// // // }

// // // function findRoot(equivalences, label) {
// // //     while (equivalences[label] !== undefined) {
// // //         label = equivalences[label];
// // //     }
// // //     return label;
// // // }

// // // function resolveEquivalences(equivalences) {
// // //     const finalLabels = {};
// // //     for (const label in equivalences) {
// // //         finalLabels[label] = findRoot(equivalences, parseInt(label));
// // //     }
// // //     return finalLabels;
// // // }

// // self.onmessage = function(e) {
// //     const { maskData, thresholds } = e.data;
// //     const width = maskData.width;
// //     const height = maskData.height;
    
// //     const masks = {};
    
// //     // Create masks based on intensity thresholds
// //     for (let t = 0; t < thresholds.length; t++) {
// //         const binaryMask = new Uint8Array(width * height);
// //         for (let i = 0; i < maskData.data.length; i += 4) {
// //             const intensity = (maskData.data[i] + maskData.data[i+1] + maskData.data[i+2]) / 3;
// //             if (intensity > thresholds[t]) {
// //                 binaryMask[Math.floor(i / 4)] = 1; // Mark as foreground
// //             }
// //         }
        
// //         // Perform connected component labeling
// //         const labeledMask = connectedComponentLabeling(binaryMask, width, height);
        
// //         // Convert labeled mask to ImageData for visualization
// //         const maskImageData = new ImageData(width, height);
// //         for (let i = 0; i < labeledMask.length; i++) {
// //             const label = labeledMask[i];
// //             if (label !== 0) {
// //                 const color = getColorForLabel(label);
// //                 maskImageData.data[i * 4] = color[0];
// //                 maskImageData.data[i * 4 + 1] = color[1];
// //                 maskImageData.data[i * 4 + 2] = color[2];
// //                 maskImageData.data[i * 4 + 3] = 255; // Fully opaque
// //             }
// //         }
        
// //         masks[t] = maskImageData;
// //     }
    
// //     self.postMessage({ masks });
// // };

// // function connectedComponentLabeling(binaryMask, width, height) {
// //     const labeledMask = new Uint32Array(binaryMask.length);
// //     let currentLabel = 1;
// //     const equivalences = {};

// //     // First pass
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             const index = y * width + x;
// //             if (binaryMask[index] === 0) continue;

// //             const left = x > 0 ? labeledMask[index - 1] : 0;
// //             const up = y > 0 ? labeledMask[index - width] : 0;

// //             if (left === 0 && up === 0) {
// //                 labeledMask[index] = currentLabel++;
// //             } else if (left !== 0 && up === 0) {
// //                 labeledMask[index] = left;
// //             } else if (left === 0 && up !== 0) {
// //                 labeledMask[index] = up;
// //             } else {
// //                 labeledMask[index] = Math.min(left, up);
// //                 updateEquivalences(equivalences, left, up);
// //             }
// //         }
// //     }

// //     // Resolve equivalences
// //     const finalLabels = resolveEquivalences(equivalences);

// //     // Second pass
// //     for (let i = 0; i < labeledMask.length; i++) {
// //         if (labeledMask[i] !== 0) {
// //             labeledMask[i] = finalLabels[labeledMask[i]];
// //         }
// //     }

// //     return labeledMask;
// // }

// // function updateEquivalences(equivalences, label1, label2) {
// //     const root1 = findRoot(equivalences, label1);
// //     const root2 = findRoot(equivalences, label2);
// //     if (root1 !== root2) {
// //         equivalences[Math.max(root1, root2)] = Math.min(root1, root2);
// //     }
// // }

// // function findRoot(equivalences, label) {
// //     while (equivalences[label] !== undefined) {
// //         label = equivalences[label];
// //     }
// //     return label;
// // }

// // function resolveEquivalences(equivalences) {
// //     const finalLabels = {};
// //     for (const label in equivalences) {
// //         finalLabels[label] = findRoot(equivalences, parseInt(label));
// //     }
// //     return finalLabels;
// // }

// // function getColorForLabel(label) {
// //     // Generate a unique color for each label
// //     const hue = (label * 137.508) % 360; // Golden angle approximation
// //     return hslToRgb(hue / 360, 1, 0.5);
// // }

// // function hslToRgb(h, s, l) {
// //     let r, g, b;
// //     if (s === 0) {
// //         r = g = b = l; // Achromatic
// //     } else {
// //         const hue2rgb = (p, q, t) => {
// //             if (t < 0) t += 1;
// //             if (t > 1) t -= 1;
// //             if (t < 1 / 6) return p + (q - p) * 6 * t;
// //             if (t < 1 / 2) return q;
// //             if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
// //             return p;
// //         };
// //         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
// //         const p = 2 * l - q;
// //         r = hue2rgb(p, q, h + 1 / 3);
// //         g = hue2rgb(p, q, h);
// //         b = hue2rgb(p, q, h - 1 / 3);
// //     }
// //     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// // }

// const DEFAULT_THRESHOLDS = [128, 192]; // Default intensity thresholds

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

// function connectedComponentLabeling(binaryMask, width, height) {
//     const labeledMask = new Uint32Array(binaryMask.length);
//     let currentLabel = 1;
//     const equivalences = {};

//     // First pass
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const index = y * width + x;
//             if (binaryMask[index] === 0) continue;

//             const left = x > 0 ? labeledMask[index - 1] : 0;
//             const up = y > 0 ? labeledMask[index - width] : 0;

//             if (left === 0 && up === 0) {
//                 labeledMask[index] = currentLabel++;
//             } else if (left !== 0 && up === 0) {
//                 labeledMask[index] = left;
//             } else if (left === 0 && up !== 0) {
//                 labeledMask[index] = up;
//             } else {
//                 labeledMask[index] = Math.min(left, up);
//                 updateEquivalences(equivalences, left, up);
//             }
//         }
//     }

//     // Resolve equivalences
//     const finalLabels = resolveEquivalences(equivalences);

//     // Second pass
//     for (let i = 0; i < labeledMask.length; i++) {
//         if (labeledMask[i] !== 0) {
//             labeledMask[i] = finalLabels[labeledMask[i]];
//         }
//     }

//     return labeledMask;
// }

// function updateEquivalences(equivalences, label1, label2) {
//     const root1 = findRoot(equivalences, label1);
//     const root2 = findRoot(equivalences, label2);
//     if (root1 !== root2) {
//         equivalences[Math.max(root1, root2)] = Math.min(root1, root2);
//     }
// }

// function findRoot(equivalences, label) {
//     while (equivalences[label] !== undefined) {
//         label = equivalences[label];
//     }
//     return label;
// }

// function resolveEquivalences(equivalences) {
//     const finalLabels = {};
//     for (const label in equivalences) {
//         finalLabels[label] = findRoot(equivalences, parseInt(label));
//     }
//     return finalLabels;
// }

// function getColorForLabel(label) {
//     // Generate a unique color for each label
//     const hue = (label * 137.508) % 360; // Golden angle approximation
//     return hslToRgb(hue / 360, 1, 0.5);
// }

// function hslToRgb(h, s, l) {
//     let r, g, b;
//     if (s === 0) {
//         r = g = b = l; // Achromatic
//     } else {
//         const hue2rgb = (p, q, t) => {
//             if (t < 0) t += 1;
//             if (t > 1) t -= 1;
//             if (t < 1 / 6) return p + (q - p) * 6 * t;
//             if (t < 1 / 2) return q;
//             if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
//             return p;
//         };
//         const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
//         const p = 2 * l - q;
//         r = hue2rgb(p, q, h + 1 / 3);
//         g = hue2rgb(p, q, h);
//         b = hue2rgb(p, q, h - 1 / 3);
//     }
//     return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
// }

// function createMasksFromThresholds(maskData, thresholds) {
//     const width = maskData.width;
//     const height = maskData.height;
//     const masks = {};

//     for (let t = 0; t < thresholds.length; t++) {
//         const binaryMask = new Uint8Array(width * height);
//         for (let i = 0; i < maskData.data.length; i += 4) {
//             const intensity = (maskData.data[i] + maskData.data[i + 1] + maskData.data[i + 2]) / 3;
//             if (intensity > thresholds[t]) {
//                 binaryMask[Math.floor(i / 4)] = 1; // Mark as foreground
//             }
//         }

//         // Perform connected component labeling
//         const labeledMask = connectedComponentLabeling(binaryMask, width, height);

//         // Convert labeled mask to ImageData for visualization
//         const maskImageData = new ImageData(width, height);
//         for (let i = 0; i < labeledMask.length; i++) {
//             const label = labeledMask[i];
//             if (label !== 0) {
//                 const color = getColorForLabel(label);
//                 maskImageData.data[i * 4] = color[0];
//                 maskImageData.data[i * 4 + 1] = color[1];
//                 maskImageData.data[i * 4 + 2] = color[2];
//                 maskImageData.data[i * 4 + 3] = 255; // Fully opaque
//             }
//         }

//         masks[t] = maskImageData;
//     }

//     return masks;
// }

// self.onmessage = function(e) {
//     const { maskData, thresholds = DEFAULT_THRESHOLDS } = e.data;

//     try {
//         const masks = createMasksFromThresholds(maskData, thresholds);

//         self.postMessage({ masks });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };


// Worker script: worker.js




const DEFAULT_ITERATIONS = 120;
const DEFAULT_SCALE_FACTOR = 0.5;
const ANIMATION_PHASES = {
    OPENING: 'opening',
    CLOSING: 'closing'
};

let currentIteration = 0;
let currentPhase = ANIMATION_PHASES.OPENING;
let currentShapeIndex = 0;

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

const mouthShapes = {
    'Neutral': { openness: 0.2, width: 1.0, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.5 },
    'Smile': { openness: 0.3, width: 1.2, squeeze: 0.1, cupidsBow: 0.4, lowerLipFullness: 0.6 },
    'Pucker': { openness: 0.1, width: 0.8, squeeze: 0.3, cupidsBow: 0.1, lowerLipFullness: 0.7 },
    'WideOpen': { openness: 1.0, width: 1.1, squeeze: -0.1, cupidsBow: 0.3, lowerLipFullness: 0.4 },
    'Frown': { openness: 0.2, width: 0.9, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.5 },
    'Ah': { openness: 1, width: 1, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.6 },
    'Oh': { openness: 0.8, width: 0.9, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.7 },
    'EE': { openness: 0.3, width: 1.03, squeeze: 0, cupidsBow: 0.4, lowerLipFullness: 0.4 },
    'BMP': { openness: 0, width: 0.9, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.7 }
};

const shapeSequence = [
    'Neutral', 'Ah', 'Neutral', 'Oh', 'Neutral', 'EE', 'Neutral', 'WideOpen', 'Neutral', 'BMP'
];

function interpolateMouthShape(progress) {
    const currentShape = mouthShapes[shapeSequence[currentShapeIndex]];
    const nextShapeIndex = (currentShapeIndex + 1) % shapeSequence.length;
    const nextShape = mouthShapes[shapeSequence[nextShapeIndex]];
    
    return {
        openness: currentShape.openness + (nextShape.openness - currentShape.openness) * progress,
        width: currentShape.width + (nextShape.width - currentShape.width) * progress,
        squeeze: currentShape.squeeze + (nextShape.squeeze - currentShape.squeeze) * progress,
        cupidsBow: currentShape.cupidsBow + (nextShape.cupidsBow - currentShape.cupidsBow) * progress,
        lowerLipFullness: currentShape.lowerLipFullness + (nextShape.lowerLipFullness - currentShape.lowerLipFullness) * progress
    };
}

function performLipSync(imageData, region, shape) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Get region bounds
    let minY = height;
    let maxY = 0;
    let minX = width;
    let maxX = 0;
    
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
    });
    
    const centerY = (minY + maxY) / 2;
    const centerX = (minX + maxX) / 2;
    const regionHeight = maxY - minY;
    const regionWidth = maxX - minX;
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Clear selected region
    region.forEach(pixelIndex => {
        const baseIndex = pixelIndex * 4;
        for (let c = 0; c < 4; c++) {
            newImageData.data[baseIndex + c] = 0;
        }
    });
    
    // Transform pixels
    region.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        // Calculate position relative to center
        const verticalOffset = y - centerY;
        const horizontalOffset = x - centerX;
        
        // Apply transformations
        let newY = centerY + verticalOffset * shape.openness;
        let newX = centerX + horizontalOffset * shape.width;
        
        // Apply squeeze effect
        newX += shape.squeeze * Math.pow(horizontalOffset / regionWidth, 3) * regionWidth;
        
        // Apply Cupid's bow effect to upper lip
        if (y < centerY) {
            const bowEffect = Math.sin(Math.PI * (x - minX) / regionWidth);
            newY -= shape.cupidsBow * bowEffect * regionHeight * 0.2;
        }
        
        // Apply lower lip fullness
        if (y > centerY) {
            const fullnessEffect = Math.sin(Math.PI * (x - minX) / regionWidth);
            newY += shape.lowerLipFullness * fullnessEffect * regionHeight * 0.2;
        }
        
        // Ensure coordinates are within bounds
        newX = Math.max(0, Math.min(width - 1, newX));
        newY = Math.max(0, Math.min(height - 1, newY));
        
        const sourceIndex = (y * width + x) * 4;
        const targetIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
        
        for (let c = 0; c < 4; c++) {
            tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
        }
    });
    
    // Blend transformed pixels
    for (let i = 0; i < tempBuffer.length; i += 4) {
        if (tempBuffer[i + 3] > 0) {
            for (let c = 0; c < 4; c++) {
                newImageData.data[i + c] = tempBuffer[i + c];
            }
        }
    }
    
    return newImageData;
}

function animateSelectedRegions(imageData, selectedRegions, progress) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Get mouth shape for current animation progress
    const shape = interpolateMouthShape(progress);
    
    selectedRegions.forEach(region => {
        const resultImageData = performLipSync(newImageData, region, shape);
        copyImageData(resultImageData, newImageData);
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
            currentPhase = ANIMATION_PHASES.OPENING;
            currentShapeIndex = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            progress = currentIteration / (iterations / 2);
            
            if (progress >= 1) {
                currentShapeIndex = (currentShapeIndex + 1) % shapeSequence.length;
                currentIteration = 0;
                progress = 0;
            }
            
            resultImageData = animateSelectedRegions(imageData, selectedRegions, progress);
            currentIteration++;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = undefined;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress,
            currentShape: shapeSequence[currentShapeIndex],
            nextShape: shapeSequence[(currentShapeIndex + 1) % shapeSequence.length]
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};