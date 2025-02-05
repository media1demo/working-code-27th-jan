// self.onmessage = function(e) {
//     const { imageData, value, index } = e.data;
//     const data = imageData.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const centerX = width / 2;
//     const centerY = height / 2;
//     const radius = Math.min(width, height) / 2;

//     const tempData = new Uint8ClampedArray(data);

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const dx = x - centerX;
//             const dy = y - centerY;
//             const distance = Math.sqrt(dx * dx + dy * dy);

//             if (distance < radius) {
//                 const percent = (radius - distance) / radius;
//                 const theta = percent * percent * value;
//                 const sin = Math.sin(theta);
//                 const cos = Math.cos(theta);

//                 const newX = Math.round(centerX + dx * cos - dy * sin);
//                 const newY = Math.round(centerY + dx * sin + dy * cos);

//                 if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
//                     const targetIndex = (y * width + x) * 4;
//                     const sourceIndex = (newY * width + newX) * 4;

//                     for (let i = 0; i < 4; i++) {
//                         data[targetIndex + i] = tempData[sourceIndex + i];
//                     }
//                 }
//             }
//         }
//     }

//     self.postMessage({ imageData, index, value });
// };

// Constants
const DEFAULT_SWIRL_STRENGTH = 0.5;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to calculate swirl transformation
function getSwirlPosition(x, y, centerX, centerY, radius, strength) {
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < radius) {
        const angle = Math.atan2(dy, dx);
        const percent = (radius - distance) / radius;
        const theta = angle + (strength * percent * Math.PI * 2);
        
        return {
            x: centerX + distance * Math.cos(theta),
            y: centerY + distance * Math.sin(theta)
        };
    }
    
    return { x, y };
}

// Function to apply swirl effect
function applySwirlEffect(imageData, selectedRegions, strength) {
    // Create result image data
    const resultImageData = createTransparentImageData(imageData.width, imageData.height);
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        // Copy original image first
        resultImageData.data.set(imageData.data);
        
        selectedRegions.forEach(region => {
            // Find bounds of the region
            let minX = imageData.width, maxX = 0;
            let minY = imageData.height, maxY = 0;
            
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
            
            // Calculate center and radius for the region
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const radius = Math.max(maxX - minX, maxY - minY) / 2;
            
            // Create a region mask
            const regionPixels = new Set(region);
            
            // Create temporary buffer for the swirled region
            const tempBuffer = new Uint8ClampedArray(imageData.data.length);
            
            // Apply swirl to selected region
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const pixelIndex = y * imageData.width + x;
                    
                    if (regionPixels.has(pixelIndex)) {
                        const swirlPos = getSwirlPosition(x, y, centerX, centerY, radius, strength);
                        
                        // Bilinear interpolation
                        const x1 = Math.floor(swirlPos.x);
                        const y1 = Math.floor(swirlPos.y);
                        const x2 = Math.ceil(swirlPos.x);
                        const y2 = Math.ceil(swirlPos.y);
                        
                        const fx = swirlPos.x - x1;
                        const fy = swirlPos.y - y1;
                        
                        const baseIdx = pixelIndex * 4;
                        
                        for (let c = 0; c < 4; c++) {
                            let value = 0;
                            
                            if (x1 >= 0 && x1 < imageData.width && y1 >= 0 && y1 < imageData.height) {
                                value += (1 - fx) * (1 - fy) * imageData.data[(y1 * imageData.width + x1) * 4 + c];
                            }
                            if (x2 >= 0 && x2 < imageData.width && y1 >= 0 && y1 < imageData.height) {
                                value += fx * (1 - fy) * imageData.data[(y1 * imageData.width + x2) * 4 + c];
                            }
                            if (x1 >= 0 && x1 < imageData.width && y2 >= 0 && y2 < imageData.height) {
                                value += (1 - fx) * fy * imageData.data[(y2 * imageData.width + x1) * 4 + c];
                            }
                            if (x2 >= 0 && x2 < imageData.width && y2 >= 0 && y2 < imageData.height) {
                                value += fx * fy * imageData.data[(y2 * imageData.width + x2) * 4 + c];
                            }
                            
                            tempBuffer[baseIdx + c] = value;
                        }
                    }
                }
            }
            
            // Copy swirled region back to result
            for (const pixelIndex of region) {
                const i = pixelIndex * 4;
                for (let c = 0; c < 4; c++) {
                    resultImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        });
    } else {
        // Apply swirl to entire image
        const centerX = imageData.width / 2;
        const centerY = imageData.height / 2;
        const radius = Math.min(centerX, centerY);
        
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const swirlPos = getSwirlPosition(x, y, centerX, centerY, radius, strength);
                
                // Bilinear interpolation
                const x1 = Math.floor(swirlPos.x);
                const y1 = Math.floor(swirlPos.y);
                const x2 = Math.ceil(swirlPos.x);
                const y2 = Math.ceil(swirlPos.y);
                
                const fx = swirlPos.x - x1;
                const fy = swirlPos.y - y1;
                
                const baseIdx = (y * imageData.width + x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    let value = 0;
                    
                    if (x1 >= 0 && x1 < imageData.width && y1 >= 0 && y1 < imageData.height) {
                        value += (1 - fx) * (1 - fy) * imageData.data[(y1 * imageData.width + x1) * 4 + c];
                    }
                    if (x2 >= 0 && x2 < imageData.width && y1 >= 0 && y1 < imageData.height) {
                        value += fx * (1 - fy) * imageData.data[(y1 * imageData.width + x2) * 4 + c];
                    }
                    if (x1 >= 0 && x1 < imageData.width && y2 >= 0 && y2 < imageData.height) {
                        value += (1 - fx) * fy * imageData.data[(y2 * imageData.width + x1) * 4 + c];
                    }
                    if (x2 >= 0 && x2 < imageData.width && y2 >= 0 && y2 < imageData.height) {
                        value += fx * fy * imageData.data[(y2 * imageData.width + x2) * 4 + c];
                    }
                    
                    resultImageData.data[baseIdx + c] = value;
                }
            }
        }
    }
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_SWIRL_STRENGTH,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        const resultImageData = applySwirlEffect(imageData, selectedRegions, value * 2 - 1);
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;
        
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