// Placeholder for bodytoashesWorker.js

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyPinchEffect(imageData, value, selectedRegions = null) {
    const pinchStrength = value * 2 - 1; // -1 to 1
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2;
    const newImageData = new ImageData(width, height);

    // First copy all original pixels
    for (let i = 0; i < imageData.data.length; i++) {
        newImageData.data[i] = imageData.data[i];
    }

    // Convert selectedRegions to a Set for faster lookup
    const pixelSet = selectedRegions ? new Set(selectedRegions.flat()) : null;
    
    // Create a map to track where pixels have been moved to
    const processedPixels = new Set();

    // Process selected pixels and allow them to move anywhere
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentPixel = y * width + x;
            
            // Only process pixels from the selected region
            if (pixelSet && pixelSet.has(currentPixel)) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const normalized = Math.min(distance / radius, 1);
                const strength = Math.pow(normalized, 1 + pinchStrength);
                
                // Calculate destination coordinates
                const destX = Math.floor(centerX + dx * strength);
                const destY = Math.floor(centerY + dy * strength);
                
                // Check if destination is within image bounds
                if (destX >= 0 && destX < width && destY >= 0 && destY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (destY * width + destX) * 4;
                    
                    // Move the pixel to its new position, even if outside selected region
                    for (let i = 0; i < 4; i++) {
                        newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                    }
                    
                    processedPixels.add(destY * width + destX);
                }
            }
        }
    }

    // Fill any gaps in the selected region
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentPixel = y * width + x;
            
            if (pixelSet && pixelSet.has(currentPixel) && !processedPixels.has(currentPixel)) {
                const targetIndex = currentPixel * 4;
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                let count = 0;

                // Sample neighboring pixels
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const neighborIndex = (ny * width + nx) * 4;
                            sumR += newImageData.data[neighborIndex];
                            sumG += newImageData.data[neighborIndex + 1];
                            sumB += newImageData.data[neighborIndex + 2];
                            sumA += newImageData.data[neighborIndex + 3];
                            count++;
                        }
                    }
                }

                // Fill gap with average of neighbors
                if (count > 0) {
                    newImageData.data[targetIndex] = sumR / count;
                    newImageData.data[targetIndex + 1] = sumG / count;
                    newImageData.data[targetIndex + 2] = sumB / count;
                    newImageData.data[targetIndex + 3] = sumA / count;
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