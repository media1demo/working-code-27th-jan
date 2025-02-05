// Placeholder for fullimageextendWorker.
// // perspectiveCurveWorker.js
// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;
//     const pixels = imageData.data;
//     const curveIntensity = value * 0.5; // Increased range for more dramatic effect
//     const newImageData = new ImageData(width, height);
//     const newPixels = newImageData.data;
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const normalizedX = (x / width - 0.5) * 2;
//             const normalizedY = (y / height - 0.5) * 2;

//             // Apply curve distortion
//             const distortion = 1 + curveIntensity * (normalizedX * normalizedX);
//             const sourceY = (normalizedY / distortion + 1) * height / 2;

//             if (sourceY >= 0 && sourceY < height - 1) {
//                 const y1 = Math.floor(sourceY);
//                 const y2 = y1 + 1;
//                 const wy = sourceY - y1;

//                 const targetIndex = (y * width + x) * 4;

//                 for (let i = 0; i < 4; i++) {
//                     const top = pixels[(y1 * width + x) * 4 + i];
//                     const bottom = pixels[(y2 * width + x) * 4 + i];
                    
//                     // Linear interpolation
//                     const interpolatedValue = top * (1 - wy) + bottom * wy;
                    
//                     newPixels[targetIndex + i] = interpolatedValue;
//                 }
//             }
//         }
//     }
//     self.postMessage({ imageData: newImageData });
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

// Function to apply curve distortion
function applyCurveDistortion(imageData, curveIntensity) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    const newPixels = newImageData.data;
    const pixels = imageData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const normalizedX = (x / width - 0.5) * 2;
            const normalizedY = (y / height - 0.5) * 2;

            // Apply curve distortion
            const distortion = 1 + curveIntensity * (normalizedX * normalizedX);
            const sourceY = (normalizedY / distortion + 1) * height / 2;

            if (sourceY >= 0 && sourceY < height - 1) {
                const y1 = Math.floor(sourceY);
                const y2 = y1 + 1;
                const wy = sourceY - y1;

                const targetIndex = (y * width + x) * 4;

                for (let i = 0; i < 4; i++) {
                    const top = pixels[(y1 * width + x) * 4 + i];
                    const bottom = pixels[(y2 * width + x) * 4 + i];
                    
                    // Linear interpolation
                    const interpolatedValue = top * (1 - wy) + bottom * wy;
                    
                    newPixels[targetIndex + i] = interpolatedValue;
                }
            }
        }
    }

    return newImageData;
}

// Function to move entire region down with curve distortion
function moveRegionDown(imageData, totalMove, curveIntensity) {
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

    // Apply curve distortion
    return applyCurveDistortion(imageData, curveIntensity);
}

// Function to move selected regions with curve distortion
function moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset, curveIntensity) {
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
    
    // Apply curve distortion
    return applyCurveDistortion(newImageData, curveIntensity);
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
        const curveIntensity = value * 0.5; // Increased range for more dramatic effect
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = moveSelectedRegions(imageData, selectedRegions, maxVerticalOffset, curveIntensity);
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
            resultImageData = moveRegionDown(resultImageData, totalMove, curveIntensity);
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