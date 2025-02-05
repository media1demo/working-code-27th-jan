
// self.onmessage = function(e) {
//     const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5 } = e.data;
    
//     const totalIterations = 10;
//     let allProcessedImages = [];
    
//     // Generate 10 variations
//     for (let i = 0; i < totalIterations; i++) {
//         // Calculate a dynamic radius based on the iteration
//         const radius = Math.max(1, Math.min(10, Math.floor(value1 * (i + 1) / totalIterations)));
        
//         let processedImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
//         applyEdgeWork(imageData, processedImageData, radius, selectedRegions);
//         allProcessedImages.push(processedImageData);
        
//         // Send a progress update
//         self.postMessage({ 
//             progress: (i + 1) / totalIterations, 
//             segmentedImages: [processedImageData]
//         });
//     }
    
//     // Select imageCount number of images from the processed images
//     let segmentedImages = [];
//     for (let i = 0; i < imageCount; i++) {
//         const index = Math.floor(i * (totalIterations / imageCount));
//         if (allProcessedImages[index]) {
//             segmentedImages.push(allProcessedImages[index]);
//         }
//     }
//     console.log('segmentedImages :>> ', segmentedImages);
//     self.postMessage({ segmentedImages: segmentedImages, isComplete: true });
// };

// function applyEdgeWork(sourceImageData, targetImageData, radius, selectedRegions) {
//     const width = sourceImageData.width;
//     const height = sourceImageData.height;
    
//     const selectedPixels = new Set(selectedRegions.flat());
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const targetIndex = (y * width + x) * 4;
            
//             // Only process pixels in the selected region
//             if (selectedPixels.has(y * width + x)) {
//                 let minIntensity = 255;
//                 let maxIntensity = 0;
                
//                 for (let ky = -radius; ky <= radius; ky++) {
//                     for (let kx = -radius; kx <= radius; kx++) {
//                         const newX = Math.min(Math.max(x + kx, 0), width - 1);
//                         const newY = Math.min(Math.max(y + ky, 0), height - 1);
//                         const sourceIndex = (newY * width + newX) * 4;
//                         const intensity = (sourceImageData.data[sourceIndex] + sourceImageData.data[sourceIndex + 1] + sourceImageData.data[sourceIndex + 2]) / 3;
                        
//                         minIntensity = Math.min(minIntensity, intensity);
//                         maxIntensity = Math.max(maxIntensity, intensity);
//                     }
//                 }
                
//                 const edgeIntensity = maxIntensity - minIntensity;
//                 targetImageData.data[targetIndex] = targetImageData.data[targetIndex + 1] = targetImageData.data[targetIndex + 2] = edgeIntensity;
//                 targetImageData.data[targetIndex + 3] = sourceImageData.data[targetIndex + 3]; // Preserve alpha
//             } else {
//                 // For unselected regions, copy the original pixel
//                 targetImageData.data[targetIndex] = sourceImageData.data[targetIndex];
//                 targetImageData.data[targetIndex + 1] = sourceImageData.data[targetIndex + 1];
//                 targetImageData.data[targetIndex + 2] = sourceImageData.data[targetIndex + 2];
//                 targetImageData.data[targetIndex + 3] = sourceImageData.data[targetIndex + 3];
//             }
//         }
//     }
// }

function applyEdgeDetection(imageData, selectedRegions, threshold = 30) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Sobel operators for edge detection
    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];
    
    // Helper function to get pixel value safely
    const getPixel = (x, y) => {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x >= width) x = width - 1;
        if (y >= height) y = height - 1;
        
        const idx = (y * width + x) * 4;
        return [
            imageData.data[idx],
            imageData.data[idx + 1],
            imageData.data[idx + 2]
        ];
    };
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            let gx = 0;
            let gy = 0;
            
            // Apply Sobel operators
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixel = getPixel(x + j, y + i);
                    // Convert to grayscale and apply operators
                    const gray = (pixel[0] + pixel[1] + pixel[2]) / 3;
                    gx += gray * sobelX[i + 1][j + 1];
                    gy += gray * sobelY[i + 1][j + 1];
                }
            }
            
            // Calculate edge magnitude
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            
            // Apply threshold
            const edgeValue = magnitude > threshold ? 255 : 0;
            
            // Set pixel in output image
            const targetIdx = pixelIndex * 4;
            newImageData.data[targetIdx] = edgeValue;
            newImageData.data[targetIdx + 1] = edgeValue;
            newImageData.data[targetIdx + 2] = edgeValue;
            newImageData.data[targetIdx + 3] = 255;
        });
    });
    
    return newImageData;
}

// Worker message handler that can handle both effects
self.onmessage = function(e) {
    const { imageData, selectedRegions, effect = 'edge', value, value2 } = e.data;
    
    try {
        let resultImageData;
        
        // If no regions selected, create array with all pixels
        const regions = selectedRegions?.length > 0 && selectedRegions[0]?.length > 0
            ? selectedRegions
            : [[...Array(imageData.width * imageData.height).keys()]];
            
        switch (effect) {
            case 'droste':
                const iterations = value || 3;
                const scale = value2 || 0.5;
                resultImageData = applyDrosteEffect(
                    imageData,
                    regions,
                    iterations,
                    scale
                );
                break;
                
            case 'edge':
                const threshold = value || 30;
                resultImageData = applyEdgeDetection(
                    imageData,
                    regions,
                    threshold
                );
                break;
                
            default:
                throw new Error('Unknown effect type');
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