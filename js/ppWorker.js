// self.onmessage = function(e) {
//     const data = e.data;
    
//     const imageData = data.imageData;
//     const selectedRegions = data.selectedRegions;
//     const baseImageCount = data.imageCount || 5;
//     const totalImageCount = baseImageCount * 64; // 5 * 64 = 320
//     const baseValue1 = data.value1 || 50;
//     const baseValue2 = data.value2 || 0;
//     const baseValue3 = data.value3 || 0;
//     const baseValue4 = data.value4 || 0;
//     const baseValue5 = data.value5 || 0;

//     const segmentedImages = [];

//     for (let i = 0; i < totalImageCount; i++) {
//         const newImageData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );

//         // Calculate varying values for each image with more randomness
//         const value1 = getRandomValue(baseValue1, i, 0);
//         const value2 = getRandomValue(baseValue2, i, 1);
//         const value3 = getRandomValue(baseValue3, i, 2);
//         const value4 = getRandomValue(baseValue4, i, 3);
//         const value5 = getRandomValue(baseValue5, i, 4);

//         // Calculate perspective parameters
//         const perspectiveStrength = value1 / 100;
//         const horizontalTilt = value2 / 100;
//         const verticalTilt = value3 / 100;

//         // Additional transformations using value4 and value5 could be added here

//         for (const region of selectedRegions) {
//             for (const pixelIndex of region) {
//                 const x = pixelIndex % imageData.width;
//                 const y = Math.floor(pixelIndex / imageData.width);
                
//                 // Apply perspective transformation
//                 const [newX, newY] = applyPerspective(
//                     x, y, 
//                     imageData.width, imageData.height,
//                     perspectiveStrength,
//                     horizontalTilt,
//                     verticalTilt
//                 );

//                 if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
//                     const oldIndex = (y * imageData.width + x) * 4;
//                     const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;

//                     for (let c = 0; c < 4; c++) {
//                         newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
//                     }
//                 }
//             }
//         }

//         segmentedImages.push(newImageData);
//     }

//     console.log('segmentedImages :>> ', segmentedImages);
//     self.postMessage({ segmentedImages: segmentedImages });
// };

// function getRandomValue(baseValue, index, seed) {
//     // Use a seeded random number generator for reproducibility
//     const random = seededRandom(index * 5 + seed);
    
//     // Generate a random value between -50 and 50
//     const randomOffset = (random() - 0.5) * 100;
    
//     // Combine base value, index-based change, and random offset
//     let value = baseValue + (index % 8) * 10 + randomOffset;
    
//     // Ensure the value stays within a reasonable range (0 to 100)
//     return Math.max(0, Math.min(100, value));
// }

// function seededRandom(seed) {
//     const m = 2 ** 35 - 31;
//     const a = 185852;
//     let s = seed % m;
//     return function() {
//         return (s = s * a % m) / m;
//     };
// }

// function applyPerspective(x, y, width, height, strength, horizontalTilt, verticalTilt) {
//     const centerX = width / 2;
//     const centerY = height / 2;

//     // Normalize coordinates
//     let nx = (x - centerX) / centerX;
//     let ny = (y - centerY) / centerY;

//     // Apply perspective transformation
//     let px = nx / (1 - ny * strength);
//     let py = ny / (1 - nx * strength);

//     // Apply tilt
//     px += horizontalTilt * ny;
//     py += verticalTilt * nx;

//     // Convert back to image coordinates
//     const newX = (px * centerX) + centerX;
//     const newY = (py * centerY) + centerY;

//     return [newX, newY];
// }

self.onmessage = function(e) {
    const data = e.data;
    
    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount; // 5 * 64 = 320
    const baseValue1 = data.value1 || 50;
    const baseValue2 = data.value2 || 0;
    const baseValue3 = data.value3 || 0;
    const baseValue4 = data.value4 || 0;
    const baseValue5 = data.value5 || 0;
    
    const segmentedImages = [];
    
    for (let i = 0; i < totalImageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        // Calculate varying values for each image with more randomness
        const value1 = getRandomValue(baseValue1, i, 0);
        const value2 = getRandomValue(baseValue2, i, 1);
        const value3 = getRandomValue(baseValue3, i, 2);
        const value4 = getRandomValue(baseValue4, i, 3);
        const value5 = getRandomValue(baseValue5, i, 4);
        
        // Calculate perspective parameters
        const perspectiveStrength = value1 / 100;
        const horizontalTilt = value2 / 100;
        const verticalTilt = value3 / 100;
        
        // Additional transformations using value4 and value5 could be added here
        
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                // Apply perspective transformation
                const [newX, newY] = applyPerspective(
                    x, y, 
                    imageData.width, imageData.height,
                    perspectiveStrength,
                    horizontalTilt,
                    verticalTilt
                );
                
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const oldIndex = (y * imageData.width + x) * 4;
                    const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
                    }
                }
            }
        }
        
        segmentedImages.push(newImageData);
    }
    
    self.postMessage({ segmentedImages: segmentedImages });
};

function getRandomValue(baseValue, index, seed) {
    // Use a seeded random number generator for reproducibility
    const random = seededRandom(index * 5 + seed);
    
    // Generate a random value between -50 and 50
    const randomOffset = (random() - 0.5) * 100;
    
    // Combine base value, index-based change, and random offset
    let value = baseValue + (index % 8) * 10 + randomOffset;
    
    // Ensure the value stays within a reasonable range (0 to 100)
    return Math.max(0, Math.min(100, value));
}

function seededRandom(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;
    return function() {
        return (s = s * a % m) / m;
    };
}

function applyPerspective(x, y, width, height, strength, horizontalTilt, verticalTilt) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Normalize coordinates
    let nx = (x - centerX) / centerX;
    let ny = (y - centerY) / centerY;
    
    // Apply perspective transformation
    let px = nx / (1 - ny * strength);
    let py = ny / (1 - nx * strength);
    
    // Apply tilt
    px += horizontalTilt * ny;
    py += verticalTilt * nx;
    
    // Convert back to image coordinates
    const newX = (px * centerX) + centerX;
    const newY = (py * centerY) + centerY;
    
    return [newX, newY];
}