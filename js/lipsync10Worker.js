// // self.onmessage = function(e) {
// //     const { imageData, maskData, opacity } = e.data;
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const newImageData = new ImageData(width, height);

// //     for (let i = 0; i < imageData.data.length; i += 4) {
// //         const maskAlpha = maskData.data[i + 3] / 255 * opacity;
// //         newImageData.data[i] = imageData.data[i] * (1 - maskAlpha) + maskData.data[i] * maskAlpha;
// //         newImageData.data[i + 1] = imageData.data[i + 1] * (1 - maskAlpha) + maskData.data[i + 1] * maskAlpha;
// //         newImageData.data[i + 2] = imageData.data[i + 2] * (1 - maskAlpha) + maskData.data[i + 2] * maskAlpha;
// //         newImageData.data[i + 3] = imageData.data[i + 3];
// //     }

// //     self.postMessage({ imageData: newImageData });
// // };

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         maskData, 
//         opacity, 
//         lipRegion, 
//         phoneme 
//     } = e.data;

//     try {
//         const width = imageData.width;
//         const height = imageData.height;

//         // Create a new ImageData object for the result
//         const newImageData = new ImageData(width, height);

//         // Perform lip-sync transformation on the image data
//         const transformedImageData = performLipSync(imageData, lipRegion, phoneme);

//         // Blend the transformed image data with the mask data
//         for (let i = 0; i < transformedImageData.data.length; i += 4) {
//             const maskAlpha = maskData.data[i + 3] / 255 * opacity;
//             newImageData.data[i] = transformedImageData.data[i] * (1 - maskAlpha) + maskData.data[i] * maskAlpha;
//             newImageData.data[i + 1] = transformedImageData.data[i + 1] * (1 - maskAlpha) + maskData.data[i + 1] * maskAlpha;
//             newImageData.data[i + 2] = transformedImageData.data[i + 2] * (1 - maskAlpha) + maskData.data[i + 2] * maskAlpha;
//             newImageData.data[i + 3] = transformedImageData.data[i + 3];
//         }

//         // Send the result back to the main thread
//         self.postMessage({ imageData: newImageData });

//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// // function performLipSync(imageData, lipRegion, phoneme) {
// //     const shape = mouthShapes[phoneme] || mouthShapes['Neutral'];
// //     const frameData = new Uint8ClampedArray(imageData.data);
// //     const width = imageData.width;
// //     const height = imageData.height;

// //     let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];
// //     for (let pixelIndex of lipRegion) {
// //         const x = pixelIndex % width;
// //         const y = Math.floor(pixelIndex / width);
// //         minY = Math.min(minY, y);
// //         maxY = Math.max(maxY, y);
// //         minX = Math.min(minX, x);
// //         maxX = Math.max(maxX, x);
// //     }

// //     const lipCenterY = (minY + maxY) / 2;
// //     const lipCenterX = (minX + maxX) / 2;
// //     const lipHeight = maxY - minY;
// //     const lipWidth = maxX - minX;
// //     const lipWidthHalf = lipWidth / 2;

// //     for (let y = minY; y <= maxY; y++) {
// //         for (let x = minX; x <= maxX; x++) {
// //             const pixelIndex = y * width + x;
// //             if (!lipRegion.has(pixelIndex)) continue;

// //             const idx = pixelIndex * 4;
// //             const r = imageData.data[idx];
// //             const g = imageData.data[idx + 1];
// //             const b = imageData.data[idx + 2];
// //             if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
// //                 continue; // Skip white and black pixels
// //             }

// //             let [newY, newX] = [y, x];

// //             const isUpperLip = y < lipCenterY;
// //             const lipFactor = isUpperLip ? 0.7 : 1.0; // Upper lip moves less

// //             // Vertical transformation
// //             const verticalOffset = (y - lipCenterY) / lipHeight;
// //             newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, verticalOffset * shape.openness * lipHeight * lipFactor));

// //             // Horizontal transformation
// //             const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
// //             newX = lipCenterX + horizontalOffset * shape.width * lipWidthHalf;

// //             // Squeeze effect
// //             newX += (lipCenterX - newX) * shape.squeeze;

// //             // Ensure we stay within bounds
// //             newY = Math.max(minY, Math.min(maxY, newY));
// //             newX = Math.max(minX, Math.min(maxX, newX));

// //             // Bilinear interpolation
// //             const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
// //             const [wx, wy] = [newX - x1, newY - y1];

// //             const x2 = Math.min(x1 + 1, width - 1);
// //             const y2 = Math.min(y1 + 1, height - 1);

// //             const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];

// //             const idx1 = (y * width + x) * 4;
// //             for (let c = 0; c < 4; c++) {
// //                 const [c1, c2, c3, c4] = [
// //                     imageData.data[(y1 * width + x1) * 4 + c],
// //                     imageData.data[(y1 * width + x2) * 4 + c],
// //                     imageData.data[(y2 * width + x1) * 4 + c],
// //                     imageData.data[(y2 * width + x2) * 4 + c]
// //                 ];
// //                 frameData[idx1 + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
// //             }
// //         }
// //     }

// //     return new ImageData(frameData, width, height);
// // }


// function performLipSync(imageData, lipRegion, phoneme) {
//     const shape = mouthShapes[phoneme] || mouthShapes['Neutral'];
//     const frameData = new Uint8ClampedArray(imageData.data);
//     const width = imageData.width;
//     const height = imageData.height;

//     let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];
//     for (let pixelIndex of lipRegion) { // lipRegion must be iterable
//         const x = pixelIndex % width;
//         const y = Math.floor(pixelIndex / width);
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

//     for (let y = minY; y <= maxY; y++) {
//         for (let x = minX; x <= maxX; x++) {
//             const pixelIndex = y * width + x;
//             if (!lipRegion.has(pixelIndex)) continue; // Use .has() for Set

//             const idx = pixelIndex * 4;
//             const r = imageData.data[idx];
//             const g = imageData.data[idx + 1];
//             const b = imageData.data[idx + 2];
//             if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
//                 continue; // Skip white and black pixels
//             }

//             let [newY, newX] = [y, x];

//             const isUpperLip = y < lipCenterY;
//             const lipFactor = isUpperLip ? 0.7 : 1.0; // Upper lip moves less

//             // Vertical transformation
//             const verticalOffset = (y - lipCenterY) / lipHeight;
//             newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, verticalOffset * shape.openness * lipHeight * lipFactor));

//             // Horizontal transformation
//             const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
//             newX = lipCenterX + horizontalOffset * shape.width * lipWidthHalf;

//             // Squeeze effect
//             newX += (lipCenterX - newX) * shape.squeeze;

//             // Ensure we stay within bounds
//             newY = Math.max(minY, Math.min(maxY, newY));
//             newX = Math.max(minX, Math.min(maxX, newX));

//             // Bilinear interpolation
//             const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
//             const [wx, wy] = [newX - x1, newY - y1];

//             const x2 = Math.min(x1 + 1, width - 1);
//             const y2 = Math.min(y1 + 1, height - 1);

//             const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];

//             const idx1 = (y * width + x) * 4;
//             for (let c = 0; c < 4; c++) {
//                 const [c1, c2, c3, c4] = [
//                     imageData.data[(y1 * width + x1) * 4 + c],
//                     imageData.data[(y1 * width + x2) * 4 + c],
//                     imageData.data[(y2 * width + x1) * 4 + c],
//                     imageData.data[(y2 * width + x2) * 4 + c]
//                 ];
//                 frameData[idx1 + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
//             }
//         }
//     }

//     return new ImageData(frameData, width, height);
// }


// const mouthShapes = {
//     'FullyClosed': { openness: -1.0, width: 0.8, squeeze: 0.3, cupidsBow: 0.05, lowerLipFullness: 0.4 },
//     'SlightlyOpen': { openness: 0.2, width: 1.0, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
//     'MediumOpen': { openness: 0.5, width: 1.1, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.6 },
//     'WideOpen': { openness: 1.0, width: 1.2, squeeze: -0.1, cupidsBow: 0.4, lowerLipFullness: 0.7 },
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