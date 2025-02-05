self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    
    if (!imageData || !selectedRegions) {
        self.postMessage({
            error: "Missing required data. Please provide both imageData and selectedRegions.",
            isComplete: true
        });
        return;
    }
    
    const width = imageData.width;
    const height = imageData.height;
    
    try {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        const selectedPixels = new Set(selectedRegions.flat());
        
        // Calculate background color for each selected pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (selectedPixels.has(pixelIndex)) {
                    const backgroundColor = calculateAverageBackground(x, y, imageData, selectedPixels, width, height);
                    const i = pixelIndex * 4;
                    newImageData.data[i] = backgroundColor[0];     // R
                    newImageData.data[i + 1] = backgroundColor[1]; // G
                    newImageData.data[i + 2] = backgroundColor[2]; // B
                    newImageData.data[i + 3] = backgroundColor[3]; // A
                }
            }
        }
        
        self.postMessage({
            segmentedImages: [newImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "An error occurred during processing: " + error.message,
            isComplete: true
        });
    }
};

function calculateAverageBackground(x, y, imageData, selectedPixels, width, height) {
    const radius = 5;
    let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
    let count = 0;
    
    // Look at surrounding pixels within radius
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const newX = x + dx;
            const newY = y + dy;
            
            // Skip if outside image boundaries
            if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
                continue;
            }
            
            const pixelIndex = newY * width + newX;
            
            // Only consider non-selected pixels (background pixels)
            if (!selectedPixels.has(pixelIndex)) {
                const i = pixelIndex * 4;
                totalR += imageData.data[i];
                totalG += imageData.data[i + 1];
                totalB += imageData.data[i + 2];
                totalA += imageData.data[i + 3];
                count++;
            }
        }
    }
    
    // If no background pixels found, return a default color
    if (count === 0) {
        return [128, 128, 128, 255]; // Default to gray
    }
    
    // Calculate average for each channel
    return [
        Math.round(totalR / count),
        Math.round(totalG / count),
        Math.round(totalB / count),
        Math.round(totalA / count)
    ];
}