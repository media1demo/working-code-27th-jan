// // depthAnd3DEffectWorker.js

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const result = applyDepthAnd3DEffect(imageData, value);
//     self.postMessage({ imageData: result });
// };

// function applyDepthAnd3DEffect(imageData, intensity) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const depthMap = createDepthMap(imageData);
//     const result = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);

//     // Define the maximum pixel shift
//     const maxShift = Math.floor(width * 0.05 * intensity); // 5% of width, adjusted by intensity

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const i = (y * width + x) * 4;
            
//             // Get depth value
//             const depth = depthMap[y * width + x] / 255; // Normalize to 0-1
            
//             // Calculate shift based on depth
//             const shift = Math.floor(depth * maxShift);
            
//             // Calculate new position
//             const newX = Math.min(width - 1, x + shift);
            
//             // Copy pixel data to new position
//             const newI = (y * width + newX) * 4;
//             result.data[newI] = imageData.data[i];
//             result.data[newI + 1] = imageData.data[i + 1];
//             result.data[newI + 2] = imageData.data[i + 2];
//             result.data[newI + 3] = imageData.data[i + 3];
//         }
//     }

//     // Fill in any gaps
//     for (let y = 0; y < height; y++) {
//         for (let x = width - 1; x >= 0; x--) {
//             const i = (y * width + x) * 4;
//             if (result.data[i + 3] === 0) { // If pixel is empty
//                 // Find the nearest non-empty pixel to the left
//                 let leftX = x - 1;
//                 while (leftX >= 0 && result.data[(y * width + leftX) * 4 + 3] === 0) {
//                     leftX--;
//                 }
//                 if (leftX >= 0) {
//                     const sourceI = (y * width + leftX) * 4;
//                     result.data[i] = result.data[sourceI];
//                     result.data[i + 1] = result.data[sourceI + 1];
//                     result.data[i + 2] = result.data[sourceI + 2];
//                     result.data[i + 3] = result.data[sourceI + 3];
//                 }
//             }
//         }
//     }

//     return result;
// }

// function createDepthMap(imageData) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const depthMap = new Uint8ClampedArray(width * height);
//     const edgeMap = detectEdges(imageData);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const i = (y * width + x) * 4;
            
//             // Calculate brightness of original image
//             const r = imageData.data[i];
//             const g = imageData.data[i + 1];
//             const b = imageData.data[i + 2];
//             const brightness = (r + g + b) / 3;

//             // Use edge detection to enhance depth perception
//             const edge = edgeMap[y * width + x];
            
//             // Combine brightness and edge information
//             depthMap[y * width + x] = Math.floor((brightness * (1 - edge) + edge * 255));
//         }
//     }

//     return depthMap;
// }

// function detectEdges(imageData) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const edges = new Uint8ClampedArray(width * height);

//     for (let y = 1; y < height - 1; y++) {
//         for (let x = 1; x < width - 1; x++) {
//             const i = (y * width + x) * 4;
            
//             // Simple Sobel edge detection
//             const gx = 
//                 -imageData.data[i - 4 - width * 4] +
//                 imageData.data[i + 4 - width * 4] +
//                 -2 * imageData.data[i - 4] +
//                 2 * imageData.data[i + 4] +
//                 -imageData.data[i - 4 + width * 4] +
//                 imageData.data[i + 4 + width * 4];

//             const gy = 
//                 -imageData.data[i - width * 4 - 4] +
//                 -2 * imageData.data[i - width * 4] +
//                 -imageData.data[i - width * 4 + 4] +
//                 imageData.data[i + width * 4 - 4] +
//                 2 * imageData.data[i + width * 4] +
//                 imageData.data[i + width * 4 + 4];

//             const edgeStrength = Math.sqrt(gx * gx + gy * gy);
//             edges[y * width + x] = Math.min(255, edgeStrength) / 255;
//         }
//     }

//     return edges;
// }

let currentIteration = 0;
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;

function applyDepthAnd3DEffect(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const depthMap = createDepthMap(imageData);
    const result = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);

    // Define the maximum pixel shift
    const maxShift = Math.floor(width * 0.05 * intensity); // 5% of width, adjusted by intensity

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Get depth value
            const depth = depthMap[y * width + x] / 255; // Normalize to 0-1
            
            // Calculate shift based on depth
            const shift = Math.floor(depth * maxShift);
            
            // Calculate new position
            const newX = Math.min(width - 1, x + shift);
            
            // Copy pixel data to new position
            const newI = (y * width + newX) * 4;
            result.data[newI] = imageData.data[i];
            result.data[newI + 1] = imageData.data[i + 1];
            result.data[newI + 2] = imageData.data[i + 2];
            result.data[newI + 3] = imageData.data[i + 3];
        }
    }

    // Fill in any gaps
    for (let y = 0; y < height; y++) {
        for (let x = width - 1; x >= 0; x--) {
            const i = (y * width + x) * 4;
            if (result.data[i + 3] === 0) { // If pixel is empty
                // Find the nearest non-empty pixel to the left
                let leftX = x - 1;
                while (leftX >= 0 && result.data[(y * width + leftX) * 4 + 3] === 0) {
                    leftX--;
                }
                if (leftX >= 0) {
                    const sourceI = (y * width + leftX) * 4;
                    result.data[i] = result.data[sourceI];
                    result.data[i + 1] = result.data[sourceI + 1];
                    result.data[i + 2] = result.data[sourceI + 2];
                    result.data[i + 3] = result.data[sourceI + 3];
                }
            }
        }
    }

    return result;
}

function createDepthMap(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const depthMap = new Uint8ClampedArray(width * height);
    const edgeMap = detectEdges(imageData);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Calculate brightness of original image
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            const brightness = (r + g + b) / 3;

            // Use edge detection to enhance depth perception
            const edge = edgeMap[y * width + x];
            
            // Combine brightness and edge information
            depthMap[y * width + x] = Math.floor((brightness * (1 - edge) + edge * 255));
        }
    }

    return depthMap;
}

function detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const edges = new Uint8ClampedArray(width * height);

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = (y * width + x) * 4;
            
            // Simple Sobel edge detection
            const gx = 
                -imageData.data[i - 4 - width * 4] +
                imageData.data[i + 4 - width * 4] +
                -2 * imageData.data[i - 4] +
                2 * imageData.data[i + 4] +
                -imageData.data[i - 4 + width * 4] +
                imageData.data[i + 4 + width * 4];

            const gy = 
                -imageData.data[i - width * 4 - 4] +
                -2 * imageData.data[i - width * 4] +
                -imageData.data[i - width * 4 + 4] +
                imageData.data[i + width * 4 - 4] +
                2 * imageData.data[i + width * 4] +
                imageData.data[i + width * 4 + 4];

            const edgeStrength = Math.sqrt(gx * gx + gy * gy);
            edges[y * width + x] = Math.min(255, edgeStrength) / 255;
        }
    }

    return edges;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, // This will be used as intensity
        value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }

        // Apply the 3D depth effect
        const intensity = value || 1.0; // Default to 1.0 if not provided
        const resultImageData = applyDepthAnd3DEffect(imageData, intensity);

        // Update iteration counter
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;

        // Send back the result
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