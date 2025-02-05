// function fastBlur(data, width, height, radius) {



//     const tempData = new Uint8ClampedArray(data.length);
//     const size = width * height;

//     // Horizontal pass
//     for (let i = 0; i < size; i++) {
//         let r = 0, g = 0, b = 0, a = 0;
//         let hits = 0;
//         for (let j = Math.max(0, i - radius); j < Math.min(size, i + radius + 1); j++) {
//             r += data[j * 4];
//             g += data[j * 4 + 1];
//             b += data[j * 4 + 2];
//             a += data[j * 4 + 3];
//             hits++;
//         }
//         tempData[i * 4] = r / hits;
//         tempData[i * 4 + 1] = g / hits;
//         tempData[i * 4 + 2] = b / hits;
//         tempData[i * 4 + 3] = a / hits;
//     }

//     // Vertical pass
//     for (let i = 0; i < width; i++) {
//         for (let j = 0; j < height; j++) {
//             let r = 0, g = 0, b = 0, a = 0;
//             let hits = 0;
//             for (let k = Math.max(0, j - radius); k < Math.min(height, j + radius + 1); k++) {
//                 r += tempData[(k * width + i) * 4];
//                 g += tempData[(k * width + i) * 4 + 1];
//                 b += tempData[(k * width + i) * 4 + 2];
//                 a += tempData[(k * width + i) * 4 + 3];
//                 hits++;
//             }
//             data[(j * width + i) * 4] = r / hits;
//             data[(j * width + i) * 4 + 1] = g / hits;
//             data[(j * width + i) * 4 + 2] = b / hits;
//             data[(j * width + i) * 4 + 3] = a / hits;
//         }
//     }
// }
// self.onmessage = function(e) {
//     const { imageData, value, index } = e.data;
//     const data = imageData.data;
//     const width = imageData.width;
//     const height = imageData.height;
//     const radius = Math.min(20, Math.floor(value)); // Limit radius to improve performance

//     fastBlur(data, width, height, radius);

//     self.postMessage({ imageData, index, value });
// };

const DEFAULT_RADIUS = 10;
const DEFAULT_ITERATIONS = 2;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Fast blur implementation
function fastBlur(data, width, height, radius) {
    const tempData = new Uint8ClampedArray(data.length);
    const size = width * height;
    
    // Horizontal pass
    for (let i = 0; i < size; i++) {
        let r = 0, g = 0, b = 0, a = 0;
        let hits = 0;
        for (let j = Math.max(0, i - radius); j < Math.min(size, i + radius + 1); j++) {
            r += data[j * 4];
            g += data[j * 4 + 1];
            b += data[j * 4 + 2];
            a += data[j * 4 + 3];
            hits++;
        }
        tempData[i * 4] = r / hits;
        tempData[i * 4 + 1] = g / hits;
        tempData[i * 4 + 2] = b / hits;
        tempData[i * 4 + 3] = a / hits;
    }
    
    // Vertical pass
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let r = 0, g = 0, b = 0, a = 0;
            let hits = 0;
            for (let k = Math.max(0, j - radius); k < Math.min(height, j + radius + 1); k++) {
                r += tempData[(k * width + i) * 4];
                g += tempData[(k * width + i) * 4 + 1];
                b += tempData[(k * width + i) * 4 + 2];
                a += tempData[(k * width + i) * 4 + 3];
                hits++;
            }
            data[(j * width + i) * 4] = r / hits;
            data[(j * width + i) * 4 + 1] = g / hits;
            data[(j * width + i) * 4 + 2] = b / hits;
            data[(j * width + i) * 4 + 3] = a / hits;
        }
    }
}

// Function to apply blur effect
function applyBlurEffect(imageData, radius, iterations) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    // Apply multiple iterations of blur for stronger effect
    for (let i = 0; i < iterations; i++) {
        fastBlur(result.data, width, height, radius);
    }
    
    return result;
}

// Function to blur selected regions
function blurSelectedRegions(imageData, selectedRegions, radius, iterations) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    // Create a mask for selected regions
    const mask = new Uint8ClampedArray(width * height);
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            mask[pixelIndex] = 1;
        });
    });
    
    // Apply blur to entire image
    const blurred = applyBlurEffect(imageData, radius, iterations);
    
    // Blend original and blurred based on mask
    for (let i = 0; i < mask.length; i++) {
        if (mask[i]) {
            const idx = i * 4;
            result.data[idx] = blurred.data[idx];
            result.data[idx + 1] = blurred.data[idx + 1];
            result.data[idx + 2] = blurred.data[idx + 2];
            result.data[idx + 3] = blurred.data[idx + 3];
        }
    }
    
    return result;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: radius = DEFAULT_RADIUS,
        value2: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = blurSelectedRegions(imageData, selectedRegions, radius, iterations);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = applyBlurEffect(imageData, radius, iterations);
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