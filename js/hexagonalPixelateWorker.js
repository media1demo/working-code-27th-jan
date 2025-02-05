// self.onmessage = function(e) {
//     const {
//         imageData,
//         selectedRegions,
//         imageCount,
//         maxBrightness,
//         value1,
//         value2,
//         value3,
//         value4,
//         value5,
//         clickedPoints,
//         lines
//     } = e.data;

//     const segmentedImages = [];

//     const minCellSize = Math.max(1, parseInt(value1) || 5);
//     const maxCellSize = Math.min(50, minCellSize + imageCount - 1);

//     for (let i = 0; i < imageCount; i++) {
//         const newImageData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );

//         const cellSize = minCellSize + i * 2;

//         // Apply hexagonal pixelate effect with varying cell size
//         applyHexagonalPixelateToRegions(newImageData, selectedRegions, cellSize);

//         // Apply additional effects (color adjustments only)
//         applyAdditionalEffects(newImageData, selectedRegions, value2, value3, value4, value5);

//         segmentedImages.push(newImageData);
//     }

//     console.log(`Generated ${segmentedImages.length} images with varying pixel sizes`);
    
//     self.postMessage({ segmentedImages: segmentedImages });
// };

// function applyHexagonalPixelateToRegions(imageData, selectedRegions, cellSize) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const halfHeight = cellSize * Math.sqrt(3) / 2;
//     const selectedPixels = new Set(selectedRegions.flat());

//     for (let y = 0; y < height; y += halfHeight) {
//         const offset = (Math.floor(y / halfHeight) % 2) * 0.5;
//         for (let x = 0; x < width; x += cellSize) {
//             const centerX = Math.floor(x + cellSize * offset);
//             const centerY = Math.floor(y);
//             if (centerX < 0 || centerX >= width || centerY < 0 || centerY >= height) continue;

//             const centerIndex = centerY * width + centerX;
//             if (!selectedPixels.has(centerIndex)) continue;

//             const centerColorIndex = centerIndex * 4;
//             const r = imageData.data[centerColorIndex];
//             const g = imageData.data[centerColorIndex + 1];
//             const b = imageData.data[centerColorIndex + 2];

//             for (let dy = -halfHeight; dy < halfHeight; dy++) {
//                 for (let dx = -cellSize / 2; dx < cellSize / 2; dx++) {
//                     const px = Math.floor(centerX + dx);
//                     const py = Math.floor(centerY + dy);
//                     if (px < 0 || px >= width || py < 0 || py >= height) continue;

//                     const distance = Math.sqrt(dx * dx + dy * dy);
//                     if (distance > cellSize / 2) continue;

//                     const pixelIndex = py * width + px;
//                     if (!selectedPixels.has(pixelIndex)) continue;

//                     const colorIndex = pixelIndex * 4;
//                     imageData.data[colorIndex] = r;
//                     imageData.data[colorIndex + 1] = g;
//                     imageData.data[colorIndex + 2] = b;
//                 }
//             }
//         }
//     }
// }

// function applyAdditionalEffects(imageData, selectedRegions, value2, value3, value4, value5) {
//     const selectedPixels = new Set(selectedRegions.flat());
//     const redAdjustment = value3 / 100;
//     const greenAdjustment = value4 / 100;
//     const blueAdjustment = value5 / 100;

//     for (let i = 0; i < imageData.data.length; i += 4) {
//         const pixelIndex = i / 4;
//         if (selectedPixels.has(pixelIndex)) {
//             // Apply color adjustments
//             imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
//             imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] * (1 + greenAdjustment)));
//             imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] * (1 + blueAdjustment)));
//         }
//     }
// }

// Constants
const DEFAULT_HEX_SIZE = 20;
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

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Helper function to calculate hexagon points
function getHexagonPoints(centerX, centerY, size) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = centerX + size * Math.cos(angle);
        const y = centerY + size * Math.sin(angle);
        points.push({ x: Math.round(x), y: Math.round(y) });
    }
    return points;
}

// Helper function to check if a point is inside a hexagon
function isPointInHexagon(x, y, hexCenter, hexSize) {
    const dx = Math.abs(x - hexCenter.x);
    const dy = Math.abs(y - hexCenter.y);
    const r = hexSize;
    
    return (dx <= r * Math.sqrt(3) / 2) && 
           (dy <= r) && 
           (dy <= (r - dx * Math.tan(Math.PI / 6)));
}

// Function to apply hexagonal pixelation to regions
function applyHexagonalPixelateToRegions(imageData, selectedRegions, hexSize) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    // Calculate hexagon grid parameters
    const horizontalSpacing = hexSize * Math.sqrt(3);
    const verticalSpacing = hexSize * 1.5;
    
    selectedRegions.forEach(region => {
        // Create a map of pixels in this region
        const regionPixels = new Set(region);
        
        // Find bounds of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Create hexagon grid
        for (let centerY = minY; centerY <= maxY; centerY += verticalSpacing) {
            const rowOffset = Math.floor((centerY / verticalSpacing) % 2) * (horizontalSpacing / 2);
            for (let centerX = minX; centerX <= maxX; centerX += horizontalSpacing) {
                const hexCenter = {
                    x: centerX + rowOffset,
                    y: centerY
                };
                
                // Skip if hexagon doesn't intersect with region
                let hasRegionPixels = false;
                let pixelCount = 0;
                let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
                
                // Sample pixels within hexagon
                for (let y = Math.max(0, Math.floor(centerY - hexSize)); 
                     y < Math.min(height, Math.ceil(centerY + hexSize)); y++) {
                    for (let x = Math.max(0, Math.floor(centerX - hexSize)); 
                         x < Math.min(width, Math.ceil(centerX + hexSize)); x++) {
                        
                        const pixelIndex = y * width + x;
                        if (!regionPixels.has(pixelIndex)) continue;
                        
                        if (isPointInHexagon(x, y, hexCenter, hexSize)) {
                            hasRegionPixels = true;
                            const idx = pixelIndex * 4;
                            totalR += imageData.data[idx];
                            totalG += imageData.data[idx + 1];
                            totalB += imageData.data[idx + 2];
                            totalA += imageData.data[idx + 3];
                            pixelCount++;
                        }
                    }
                }
                
                // If hexagon contains region pixels, apply average color
                if (hasRegionPixels && pixelCount > 0) {
                    const avgR = Math.round(totalR / pixelCount);
                    const avgG = Math.round(totalG / pixelCount);
                    const avgB = Math.round(totalB / pixelCount);
                    const avgA = Math.round(totalA / pixelCount);
                    
                    // Fill hexagon with average color
                    for (let y = Math.max(0, Math.floor(centerY - hexSize)); 
                         y < Math.min(height, Math.ceil(centerY + hexSize)); y++) {
                        for (let x = Math.max(0, Math.floor(centerX - hexSize)); 
                             x < Math.min(width, Math.ceil(centerX + hexSize)); x++) {
                            
                            const pixelIndex = y * width + x;
                            if (!regionPixels.has(pixelIndex)) continue;
                            
                            if (isPointInHexagon(x, y, hexCenter, hexSize)) {
                                const idx = pixelIndex * 4;
                                newImageData.data[idx] = avgR;
                                newImageData.data[idx + 1] = avgG;
                                newImageData.data[idx + 2] = avgB;
                                newImageData.data[idx + 3] = avgA;
                            }
                        }
                    }
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: hexSize = DEFAULT_HEX_SIZE,
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
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Apply hexagonal pixelation to selected regions
            resultImageData = applyHexagonalPixelateToRegions(imageData, selectedRegions, hexSize);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // If no regions selected, return original image
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
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};