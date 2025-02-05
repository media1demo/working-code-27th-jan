// self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js');

// self.onmessage = async function(e) {
//     const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     try {
//         // Fetch a unique image for each selected region
//         const regionImages = await Promise.all(selectedRegions.map(async () => {
//             const response = await fetch(`https://picsum.photos/${width}/${height}`);
//             const blob = await response.blob();
//             const arrayBuffer = await blob.arrayBuffer();
//             return createImageData(new Uint8Array(arrayBuffer), width, height);
//         }));

//         // Create variations
//         const segmentedImages = [];

//         for (let i = 0; i < imageCount; i++) {
//             const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

//             // Replace selected regions with fetched image data
//             selectedRegions.forEach((region, regionIndex) => {
//                 const regionImageData = regionImages[regionIndex];
                
//                 region.forEach(pixelIndex => {
//                     const x = pixelIndex % width;
//                     const y = Math.floor(pixelIndex / width);
//                     const index = (y * width + x) * 4;

//                     // Blend original image with fetched image for this region
//                     const alpha = 0.5 + (Math.random() * 0.5); // Random blend factor between 0.5 and 1
//                     for (let c = 0; c < 3; c++) { // For each color channel
//                         newImageData.data[index + c] = (1 - alpha) * imageData.data[index + c] + alpha * regionImageData.data[index + c];
//                     }
//                 });
//             });

//             segmentedImages.push(newImageData);
//         }

//         self.postMessage({ segmentedImages, isComplete: true });
//     } catch (error) {
//         self.postMessage({ error: error.message, isComplete: true });
//     }
// };

// // Helper function to create ImageData from array buffer
// async function createImageData(arrayBuffer, width, height) {
//     const bitmap = await createImageBitmap(new Blob([arrayBuffer]));
//     const canvas = new OffscreenCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(bitmap, 0, 0, width, height);
//     return ctx.getImageData(0, 0, width, height);
// }

self.onmessage = async function(e) {
    const data = e.data;
    
    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const width = imageData.width;
    const height = imageData.height;
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount;
    const baseValue1 = data.value1 || 50;
    const baseValue2 = data.value2 || 0;
    const baseValue3 = data.value3 || 0;
    const baseValue4 = data.value4 || 0;
    const baseValue5 = data.value5 || 0;

    try {
        const regionImages = await Promise.all(selectedRegions.map(async () => {
            const response = await fetch(`https://picsum.photos/${width}/${height}`);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            return createImageData(new Uint8Array(arrayBuffer), width, height);
        }));

        const segmentedImages = [];

        for (let i = 0; i < totalImageCount; i++) {
            const newImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                width,
                height
            );

            const value1 = getRandomValue(baseValue1, i, 0);
            const value2 = getRandomValue(baseValue2, i, 1);
            const value3 = getRandomValue(baseValue3, i, 2);
            const value4 = getRandomValue(baseValue4, i, 3);
            const value5 = getRandomValue(baseValue5, i, 4);

            const perspectiveStrength = value1 / 100;
            const horizontalTilt = value2 / 100;
            const verticalTilt = value3 / 100;

            // Create a mapping of transformed coordinates
            const transformedCoords = new Map();

            // First pass: Calculate all transformed coordinates
            selectedRegions.forEach((region, regionIndex) => {
                region.forEach(pixelIndex => {
                    const x = pixelIndex % width;
                    const y = Math.floor(pixelIndex / width);

                    const [newX, newY] = applyPerspective(
                        x, y,
                        width, height,
                        perspectiveStrength,
                        horizontalTilt,
                        verticalTilt
                    );

                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        // Store both floor and ceiling coordinates to fill gaps
                        const floorX = Math.floor(newX);
                        const floorY = Math.floor(newY);
                        const ceilX = Math.ceil(newX);
                        const ceilY = Math.ceil(newY);

                        // Store all four corner combinations
                        [[floorX, floorY], [floorX, ceilY], 
                         [ceilX, floorY], [ceilX, ceilY]].forEach(([x, y]) => {
                            const key = `${x},${y}`;
                            if (!transformedCoords.has(key)) {
                                transformedCoords.set(key, {
                                    originalX: x,
                                    originalY: y,
                                    regionIndex,
                                    distance: Math.sqrt(
                                        Math.pow(x - newX, 2) + 
                                        Math.pow(y - newY, 2)
                                    )
                                });
                            }
                        });
                    }
                });
            });

            // Second pass: Apply the transformations with interpolation
            transformedCoords.forEach((info, key) => {
                const [x, y] = key.split(',').map(Number);
                const index = (y * width + x) * 4;
                const regionImageData = regionImages[info.regionIndex];
                const originalIndex = (info.originalY * width + info.originalX) * 4;

                // Calculate blend factor based on distance
                const alpha = 0.5 + (seededRandom(i * width + x + y)() * 0.5);
                const distanceFactor = Math.max(0, 1 - info.distance);

                // Blend pixels with distance-based interpolation
                for (let c = 0; c < 3; c++) {
                    newImageData.data[index + c] = 
                        (1 - alpha) * imageData.data[originalIndex + c] + 
                        alpha * regionImageData.data[originalIndex + c];
                }
                
                // Preserve original alpha but adjust for distance
                newImageData.data[index + 3] = 
                    imageData.data[originalIndex + 3] * distanceFactor;
            });

            segmentedImages.push(newImageData);
        }

        self.postMessage({ segmentedImages: segmentedImages });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

// Helper functions remain the same
async function createImageData(arrayBuffer, width, height) {
    const bitmap = await createImageBitmap(new Blob([arrayBuffer]));
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
}

function getRandomValue(baseValue, index, seed) {
    const random = seededRandom(index * 5 + seed);
    const randomOffset = (random() - 0.5) * 100;
    let value = baseValue + (index % 8) * 10 + randomOffset;
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
    
    let nx = (x - centerX) / centerX;
    let ny = (y - centerY) / centerY;
    
    let px = nx / (1 - ny * strength);
    let py = ny / (1 - nx * strength);
    
    px += horizontalTilt * ny;
    py += verticalTilt * nx;
    
    const newX = (px * centerX) + centerX;
    const newY = (py * centerY) + centerY;
    
    return [newX, newY];
}