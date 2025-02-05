// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const levels = Math.floor(value * 7) + 2; // 2 to 9 levels
    
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = new ImageData(width, height);
    
//     for (let i = 0; i < imageData.data.length; i += 4) {
//         for (let j = 0; j < 3; j++) {
//             newImageData.data[i + j] = Math.floor(imageData.data[i + j] / 255 * (levels - 1)) / (levels - 1) * 255;
//         }
//         newImageData.data[i + 3] = imageData.data[i + 3];
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyColorQuantization(imageData, value = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(width, height);
    
    // Calculate levels based on value (2 to 8 levels)
    const levels = Math.max(2, Math.min(8, Math.floor(2 + value * 6)));
    
    // Process each pixel
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Apply quantization to RGB channels
        for (let j = 0; j < 3; j++) {
            newImageData.data[i + j] = Math.floor(imageData.data[i + j] / 255 * (levels - 1)) / (levels - 1) * 255;
        }
        // Preserve alpha channel
        newImageData.data[i + 3] = imageData.data[i + 3];
    }
    
    return newImageData;
}

function applyColorQuantizationToRegions(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    if (!selectedRegions?.length) {
        return applyColorQuantization(imageData, value);
    }
    
    // Calculate levels based on value (2 to 8 levels)
    const levels = Math.max(2, Math.min(8, Math.floor(2 + value * 6)));
    
    // Create a Set for quick lookup of selected pixels
    const selectedPixels = new Set(selectedRegions.flat());
    
    // Process only selected regions
    selectedPixels.forEach(pixelIndex => {
        const i = pixelIndex * 4;
        // Apply quantization to RGB channels
        for (let j = 0; j < 3; j++) {
            newImageData.data[i + j] = Math.floor(imageData.data[i + j] / 255 * (levels - 1)) / (levels - 1) * 255;
        }
        // Preserve alpha channel
        newImageData.data[i + 3] = imageData.data[i + 3];
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyColorQuantizationToRegions(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};