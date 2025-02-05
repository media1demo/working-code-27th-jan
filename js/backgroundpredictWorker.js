self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions
    } = e.data;

    if (!imageData || !selectedRegions) {
        self.postMessage({
            error: "Missing required data. Please provide both imageData and selectedRegions.",
            isComplete: true
        });
        return;
    }

    const width = imageData.width;
    const height = imageData.height;

    if (!width || !height) {
        self.postMessage({
            error: "Invalid image data. Width or height is missing.",
            isComplete: true
        });
        return;
    }
    
    try {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

        const selectedPixels = new Set(selectedRegions.flat());

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (selectedPixels.has(pixelIndex)) {
                    const neighborColor = findNearestUnselectedColor(x, y, width, height, imageData, selectedPixels);
                    const i = pixelIndex * 4;
                    newImageData.data[i] = neighborColor[0];
                    newImageData.data[i + 1] = neighborColor[1];
                    newImageData.data[i + 2] = neighborColor[2];
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

function findNearestUnselectedColor(x, y, width, height, imageData, selectedPixels) {
    const maxDistance = Math.max(width, height);
    
    for (let distance = 1; distance < maxDistance; distance++) {
        for (let dx = -distance; dx <= distance; dx++) {
            for (let dy = -distance; dy <= distance; dy++) {
                if (Math.abs(dx) === distance || Math.abs(dy) === distance) {
                    const nx = x + dx;
                    const ny = y + dy;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const neighborIndex = ny * width + nx;
                        if (!selectedPixels.has(neighborIndex)) {
                            const i = neighborIndex * 4;
                            return [
                                imageData.data[i],
                                imageData.data[i + 1],
                                imageData.data[i + 2]
                            ];
                        }
                    }
                }
            }
        }
    }
    
    return [128, 128, 128];
}