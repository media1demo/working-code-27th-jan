// // self.onmessage = function(e) {
// //     const { imageData, value } = e.data;
    
    
// //     const pinchStrength = value * 2 - 1; // -1 to 1
    
// //     const width = imageData.width;
// //     const height = imageData.height;
// //     const centerX = width / 2;
// //     const centerY = height / 2;
// //     const radius = Math.min(width, height) / 2;
// //     const newImageData = new ImageData(width, height);
    
// //     for (let y = 0; y < height; y++) {
// //         for (let x = 0; x < width; x++) {
// //             const dx = x - centerX;
// //             const dy = y - centerY;
// //             const distance = Math.sqrt(dx * dx + dy * dy);
// //             const normalized = Math.min(distance / radius, 1);
// //             const strength = Math.pow(normalized, 1 + pinchStrength);
            
// //             const sourceX = Math.floor(centerX + dx * strength);
// //             const sourceY = Math.floor(centerY + dy * strength);
            
// //             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
// //                 const sourceIndex = (sourceY * width + sourceX) * 4;
// //                 const targetIndex = (y * width + x) * 4;
                
// //                 for (let i = 0; i < 4; i++) {
// //                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
// //                 }
// //             }
// //         }
// //     }
    
// //     self.postMessage({ imageData: newImageData });
// // };

// const DEFAULT_ITERATIONS = 120;
// let currentIteration = 0;

// function applyPinchEffect(imageData, value) {
//     const pinchStrength = value * 2 - 1; // -1 to 1
    
//     const width = imageData.width;
//     const height = imageData.height;
//     const centerX = width / 2;
//     const centerY = height / 2;
//     const radius = Math.min(width, height) / 2;
//     const newImageData = new ImageData(width, height);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const dx = x - centerX;
//             const dy = y - centerY;
//             const distance = Math.sqrt(dx * dx + dy * dy);
//             const normalized = Math.min(distance / radius, 1);
//             const strength = Math.pow(normalized, 1 + pinchStrength);
            
//             const sourceX = Math.floor(centerX + dx * strength);
//             const sourceY = Math.floor(centerY + dy * strength);
            
//             if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
//                 const sourceIndex = (sourceY * width + sourceX) * 4;
//                 const targetIndex = (y * width + x) * 4;
                
//                 for (let i = 0; i < 4; i++) {
//                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//                 }
//             }
//         }
//     }
    
//     return newImageData;
// }

// self.onmessage = function (e) {
//     const { imageData, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
//     try {
//         if (reset) currentIteration = 0;
//         const resultImageData = applyPinchEffect(imageData, value);
//         currentIteration = (currentIteration + 1) % iterations;
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress: currentIteration / iterations,
//         });
//     } catch (error) {
//         self.postMessage({ error: error.message, isComplete: true });
//     }
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyPinchEffect(imageData, value, selectedRegions = null) {
    const pinchStrength = value * 2 - 1; // -1 to 1
    
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    // Convert selectedRegions to a Set for faster lookup
    const pixelSet = selectedRegions ? new Set(selectedRegions.flat()) : null;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Check if the pixel is in the selected regions
            if (pixelSet && !pixelSet.has(y * width + x)) {
                // If not in selected regions, skip processing
                continue;
            }

            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalized = Math.min(distance / radius, 1);
            const strength = Math.pow(normalized, 1 + pinchStrength);
            
            const sourceX = Math.floor(centerX + dx * strength);
            const sourceY = Math.floor(centerY + dy * strength);
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = (y * width + x) * 4;
                
                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function (e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyPinchEffect(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations,
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};