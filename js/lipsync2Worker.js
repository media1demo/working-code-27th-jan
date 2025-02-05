// // self.onmessage = function(e) {
// //     const { imageData, selectedRegions, imageCount: initialImageCount } = e.data;
    
// //     console.log('initialImageCount :>> ', initialImageCount);
// //     const totalImageCount = initialImageCount * 64;

// //     const mouthShapes = {
// //         'Neutral': { openness: 0.2, width: 1.0, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.5 },
// //         'Smile': { openness: 0.3, width: 1.2, squeeze: 0.1, cupidsBow: 0.4, lowerLipFullness: 0.6 },
// //         'Pucker': { openness: 0.1, width: 0.8, squeeze: 0.3, cupidsBow: 0.1, lowerLipFullness: 0.7 },
// //         'WideOpen': { openness: 1.0, width: 1.1, squeeze: -0.1, cupidsBow: 0.3, lowerLipFullness: 0.4 },
// //         'Frown': { openness: 0.2, width: 0.9, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.5 },
// //         'AE': { openness: 0.7, width: 1.01, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'Ah': { openness: 1, width: 1, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.6 },
// //         'BMP': { openness: 0, width: 0.9, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.7 },
// //         'ChJ': { openness: 0.3, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'EE': { openness: 0.3, width: 1.03, squeeze: 0, cupidsBow: 0.4, lowerLipFullness: 0.4 },
// //         'Er': { openness: 0.4, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
// //         'FV': { openness: 0.2, width: 1.01, squeeze: 0.2, cupidsBow: 0.3, lowerLipFullness: 0.6 },
// //         'Ih': { openness: 0.4, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'KGHNG': { openness: 0.5, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
// //         'Oh': { openness: 0.8, width: 0.9, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.7 },
// //         'R': { openness: 0.4, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'SZ': { openness: 0.2, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'TLDN': { openness: 0.3, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
// //         'Th': { openness: 0.2, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.6 },
// //         'WOO': { openness: 0.3, width: 0.8, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.7 }
 
// //     };

// //     // Pre-calculate lip region bounding box
// //     const lipRegion = new Set(selectedRegions.flat());
// //     let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
// //     for (let pixelIndex of lipRegion) {
// //         const x = pixelIndex % imageData.width;
// //         const y = Math.floor(pixelIndex / imageData.width);
// //         minY = Math.min(minY, y);
// //         maxY = Math.max(maxY, y);
// //         minX = Math.min(minX, x);
// //         maxX = Math.max(maxX, x);
// //     }

// //     const lipCenterY = (minY + maxY) / 2;
// //     const lipCenterX = (minX + maxX) / 2;
// //     const lipHeight = maxY - minY;
// //     const lipWidth = maxX - minX;

// //     // Pre-calculate some constants
// //     const lipWidthHalf = lipWidth / 2;
// //     const lipHeightFifth = lipHeight / 5;

// //     function performLipSync(shape) {
// //         const frameData = new Uint8ClampedArray(imageData.data);
        
// //         for (let y = minY; y <= maxY; y++) {
// //             for (let x = minX; x <= maxX; x++) {
// //                 const pixelIndex = y * imageData.width + x;
// //                 if (!lipRegion.has(pixelIndex)) continue;

// //                 let newY = y;
// //                 let newX = x;    

// //                 // Simplified transformations
// //                 const verticalOffset = y - lipCenterY;
// //                 newY += verticalOffset * (shape.openness - 1) * (1 + Math.abs(verticalOffset) / lipHeight);

// //                 const horizontalOffset = x - lipCenterX;
// //                 const horizontalFactor = Math.pow(horizontalOffset / lipWidthHalf, 3);
// //                 newX = lipCenterX + horizontalOffset * shape.width + horizontalFactor * lipWidth * shape.squeeze * (y >= lipCenterY ? -0.8 : 0.5);

// //                 if (y < lipCenterY) {
// //                     const bowFactor = Math.sin((x - minX) / lipWidth * Math.PI);
// //                     newY -= bowFactor * shape.cupidsBow * lipHeightFifth;
// //                 } else {
// //                     const fullnessFactor = Math.sin((x - minX) / lipWidth * Math.PI);
// //                     newY += fullnessFactor * shape.lowerLipFullness * lipHeightFifth;
// //                 }

// //                 // Fast bilinear interpolation
// //                 const x1 = Math.floor(newX);
// //                 const y1 = Math.floor(newY);
// //                 const wx = newX - x1;
// //                 const wy = newY - y1;

// //                 const x2 = Math.min(x1 + 1, imageData.width - 1);
// //                 const y2 = Math.min(y1 + 1, imageData.height - 1);

// //                 const w1 = (1 - wx) * (1 - wy);
// //                 const w2 = wx * (1 - wy);
// //                 const w3 = (1 - wx) * wy;
// //                 const w4 = wx * wy;

// //                 const idx = (y * imageData.width + x) * 4;
// //                 for (let c = 0; c < 4; c++) {
// //                     const c1 = imageData.data[(y1 * imageData.width + x1) * 4 + c];
// //                     const c2 = imageData.data[(y1 * imageData.width + x2) * 4 + c];
// //                     const c3 = imageData.data[(y2 * imageData.width + x1) * 4 + c];
// //                     const c4 = imageData.data[(y2 * imageData.width + x2) * 4 + c];

// //                     frameData[idx + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
// //                 }
// //             }
// //         }

// //         return new ImageData(frameData, imageData.width, imageData.height);
// //     }
    
// //     try {
// //         const phonemes = Object.keys(mouthShapes);
// //         const segmentedImages = [];

// //         for (let i = 0; i < totalImageCount; i++) {
// //             const phoneme = phonemes[i % phonemes.length];
// //             const lipSyncFrame = performLipSync(mouthShapes[phoneme]);
// //             segmentedImages.push(lipSyncFrame);

// //             if ((i + 1) % 20 === 0 || i === totalImageCount - 1) {
// //                 self.postMessage({
// //                     segmentedImages: segmentedImages,
// //                     isComplete: i === totalImageCount - 1
// //                 });
// //                 segmentedImages.length = 0; // Clear the array after sending           
// //             }
// //         }

// //     } catch (error) {
// //         console.error('Error in lip sync processing:', error);
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// const DEFAULT_ITERATIONS = 120;
// const TRANSITION_FRAMES = 15;

// let currentIteration = 0;
// let currentShape = 'Neutral';
// let targetShape = 'Neutral';
// let transitionProgress = 0;

// const mouthShapes = {
//     'Neutral': { openness: 0.2, width: 1.0, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.5 },
//     'Smile': { openness: 0.3, width: 1.2, squeeze: 0.1, cupidsBow: 0.4, lowerLipFullness: 0.6 },
//     'Pucker': { openness: 0.1, width: 0.8, squeeze: 0.3, cupidsBow: 0.1, lowerLipFullness: 0.7 },
//     'WideOpen': { openness: 1.0, width: 1.1, squeeze: -0.1, cupidsBow: 0.3, lowerLipFullness: 0.4 },
//     'Frown': { openness: 0.2, width: 0.9, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.5 },
//     'AE': { openness: 0.7, width: 1.01, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'Ah': { openness: 1, width: 1, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.6 },
//     'BMP': { openness: 0, width: 0.9, squeeze: 0.1, cupidsBow: 0.1, lowerLipFullness: 0.7 },
//     'ChJ': { openness: 0.3, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'EE': { openness: 0.3, width: 1.03, squeeze: 0, cupidsBow: 0.4, lowerLipFullness: 0.4 },
//     'Er': { openness: 0.4, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
//     'FV': { openness: 0.2, width: 1.01, squeeze: 0.2, cupidsBow: 0.3, lowerLipFullness: 0.6 },
//     'Ih': { openness: 0.4, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'KGHNG': { openness: 0.5, width: 1, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
//     'Oh': { openness: 0.8, width: 0.9, squeeze: 0, cupidsBow: 0.2, lowerLipFullness: 0.7 },
//     'R': { openness: 0.4, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'SZ': { openness: 0.2, width: 1.02, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'TLDN': { openness: 0.3, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.5 },
//     'Th': { openness: 0.2, width: 1.01, squeeze: 0.1, cupidsBow: 0.3, lowerLipFullness: 0.6 },
//     'WOO': { openness: 0.3, width: 0.8, squeeze: 0.2, cupidsBow: 0.1, lowerLipFullness: 0.7 }
// };

// function interpolateShapes(shape1, shape2, progress) {
//     return {
//         openness: shape1.openness + (shape2.openness - shape1.openness) * progress,
//         width: shape1.width + (shape2.width - shape1.width) * progress,
//         squeeze: shape1.squeeze + (shape2.squeeze - shape1.squeeze) * progress,
//         cupidsBow: shape1.cupidsBow + (shape2.cupidsBow - shape1.cupidsBow) * progress,
//         lowerLipFullness: shape1.lowerLipFullness + (shape2.lowerLipFullness - shape1.lowerLipFullness) * progress
//     };
// }

// function performLipSync(imageData, selectedRegions, shape) {
//     // Pre-calculate lip region bounding box
//     const lipRegion = new Set(selectedRegions.flat());
//     let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    
//     for (let pixelIndex of lipRegion) {
//         const x = pixelIndex % imageData.width;
//         const y = Math.floor(pixelIndex / imageData.width);
//         minY = Math.min(minY, y);
//         maxY = Math.max(maxY, y);
//         minX = Math.min(minX, x);
//         maxX = Math.max(maxX, x);
//     }

//     const lipCenterY = (minY + maxY) / 2;
//     const lipCenterX = (minX + maxX) / 2;
//     const lipHeight = maxY - minY;
//     const lipWidth = maxX - minX;

//     const lipWidthHalf = lipWidth / 2;
//     const lipHeightFifth = lipHeight / 5;

//     const frameData = new Uint8ClampedArray(imageData.data);
    
//     for (let y = minY; y <= maxY; y++) {
//         for (let x = minX; x <= maxX; x++) {
//             const pixelIndex = y * imageData.width + x;
//             if (!lipRegion.has(pixelIndex)) continue;

//             let newY = y;
//             let newX = x;    

//             // Apply transformations
//             const verticalOffset = y - lipCenterY;
//             newY += verticalOffset * (shape.openness - 1) * (1 + Math.abs(verticalOffset) / lipHeight);

//             const horizontalOffset = x - lipCenterX;
//             const horizontalFactor = Math.pow(horizontalOffset / lipWidthHalf, 3);
//             newX = lipCenterX + horizontalOffset * shape.width + 
//                   horizontalFactor * lipWidth * shape.squeeze * (y >= lipCenterY ? -0.8 : 0.5);

//             if (y < lipCenterY) {
//                 const bowFactor = Math.sin((x - minX) / lipWidth * Math.PI);
//                 newY -= bowFactor * shape.cupidsBow * lipHeightFifth;
//             } else {
//                 const fullnessFactor = Math.sin((x - minX) / lipWidth * Math.PI);
//                 newY += fullnessFactor * shape.lowerLipFullness * lipHeightFifth;
//             }

//             // Bilinear interpolation
//             const x1 = Math.floor(newX);
//             const y1 = Math.floor(newY);
//             const wx = newX - x1;
//             const wy = newY - y1;

//             const x2 = Math.min(x1 + 1, imageData.width - 1);
//             const y2 = Math.min(y1 + 1, imageData.height - 1);

//             const w1 = (1 - wx) * (1 - wy);
//             const w2 = wx * (1 - wy);
//             const w3 = (1 - wx) * wy;
//             const w4 = wx * wy;

//             const idx = (y * imageData.width + x) * 4;
//             for (let c = 0; c < 4; c++) {
//                 const c1 = imageData.data[(y1 * imageData.width + x1) * 4 + c];
//                 const c2 = imageData.data[(y1 * imageData.width + x2) * 4 + c];
//                 const c3 = imageData.data[(y2 * imageData.width + x1) * 4 + c];
//                 const c4 = imageData.data[(y2 * imageData.width + x2) * 4 + c];

//                 frameData[idx + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
//             }
//         }
//     }

//     return new ImageData(frameData, imageData.width, imageData.height);
// }

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         targetMouthShape,
//         reset 
//     } = e.data;
    
//     try {
//         if (reset) {
//             currentIteration = 0;
//             currentShape = 'Neutral';
//             targetShape = 'Neutral';
//             transitionProgress = 0;
//         }

//         if (targetMouthShape && targetMouthShape !== targetShape) {
//             currentShape = targetShape;
//             targetShape = targetMouthShape;
//             transitionProgress = 0;
//         }

//         let resultImageData;
        
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // Calculate transition progress
//             transitionProgress = Math.min(1, transitionProgress + 1 / TRANSITION_FRAMES);
            
//             // Interpolate between current and target shapes
//             const currentShapeData = mouthShapes[currentShape];
//             const targetShapeData = mouthShapes[targetShape];
//             const interpolatedShape = interpolateShapes(currentShapeData, targetShapeData, transitionProgress);
            
//             // Perform lip sync with interpolated shape
//             resultImageData = performLipSync(imageData, selectedRegions, interpolatedShape);
            
//             currentIteration++;
//         } else {
//             // If no regions selected, return original image
//             resultImageData = new ImageData(
//                 new Uint8ClampedArray(imageData.data),
//                 imageData.width,
//                 imageData.height
//             );
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             currentShape: targetShape,
//             progress: transitionProgress
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };
 



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