// // depthEstimationWorker.js

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const depthMap = estimateDepth(imageData);
//     const result = applyDepthEffect(imageData, depthMap, value);
//     self.postMessage({ imageData: result });
// };

// function estimateDepth(imageData) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const depthMap = new Uint8ClampedArray(width * height);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const i = (y * width + x) * 4;
//             const r = imageData.data[i];
//             const g = imageData.data[i + 1];
//             const b = imageData.data[i + 2];

//             // Simple depth estimation based on pixel brightness
//             // Brighter pixels are considered "closer" in this simple model
//             const brightness = (r + g + b) / 3;
//             depthMap[y * width + x] = brightness;
//         }
//     }

//     return depthMap;
// }

// function applyDepthEffect(imageData, depthMap, intensity) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const i = (y * width + x) * 4;
//             const depth = depthMap[y * width + x] / 255; // Normalize depth to 0-1

//             // Apply a simple depth-based effect
//             // Here, we're adjusting brightness based on depth
//             const factor = 1 + (depth - 0.5) * intensity;

//             result.data[i] = Math.min(255, imageData.data[i] * factor);
//             result.data[i + 1] = Math.min(255, imageData.data[i + 1] * factor);
//             result.data[i + 2] = Math.min(255, imageData.data[i + 2] * factor);
//         }
//     }

//     return result;
// }

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const intensity = value || 0.5; // Default intensity for depth effect
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Create a new ImageData for the selected region
            const tempImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            
            // First, estimate depth for the entire image
            const depthMap = estimateDepth(imageData);
            
            // Apply depth effect only to selected regions
            selectedRegions[0].forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                const i = (y * imageData.width + x) * 4;
                
                // Apply depth effect to this pixel
                const depth = depthMap[y * imageData.width + x] / 255;
                const factor = 1 + (depth - 0.5) * intensity;
                
                tempImageData.data[i] = Math.min(255, imageData.data[i] * factor);
                tempImageData.data[i + 1] = Math.min(255, imageData.data[i + 1] * factor);
                tempImageData.data[i + 2] = Math.min(255, imageData.data[i + 2] * factor);
                tempImageData.data[i + 3] = imageData.data[i + 3]; // Preserve alpha
            });
            
            resultImageData = tempImageData;
        } else {
            // If no regions selected, apply to entire image
            const depthMap = estimateDepth(imageData);
            resultImageData = applyDepthEffect(imageData, depthMap, intensity);
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function estimateDepth(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const depthMap = new Uint8ClampedArray(width * height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            
            // Simple depth estimation based on pixel brightness
            const brightness = (r + g + b) / 3;
            depthMap[y * width + x] = brightness;
        }
    }
    
    return depthMap;
}

function applyDepthEffect(imageData, depthMap, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const depth = depthMap[y * width + x] / 255; // Normalize depth to 0-1
            
            // Apply a simple depth-based effect
            const factor = 1 + (depth - 0.5) * intensity;
            
            result.data[i] = Math.min(255, imageData.data[i] * factor);
            result.data[i + 1] = Math.min(255, imageData.data[i + 1] * factor);
            result.data[i + 2] = Math.min(255, imageData.data[i + 2] * factor);
        }
    }
    
    return result;
}