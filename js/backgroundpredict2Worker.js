self.onmessage = function(e) {
    const { imageData, value, selectedRegions } = e.data;
    
    if (!imageData) {
        self.postMessage({
            error: "Missing required data. Please provide imageData.",
            isComplete: true
        });
        return;
    }

    try {
        const width = imageData.width;
        const height = imageData.height;

        if (!width || !height) {
            self.postMessage({
                error: "Invalid image data. Width or height is missing.",
                isComplete: true
            });
            return;
        }

        // Create a map of selected pixels for faster lookups
        const selectedPixels = selectedRegions ? new Set(selectedRegions.flat()) : new Set();
        
        // First generate the background map before applying wave effect
        const backgroundMap = selectedRegions ? 
            createBackgroundMap(imageData, selectedPixels, width, height) : null;

        // Create wave processed image data
        const processedImageData = new ImageData(width, height);
        
        // Safely handle value parameter with defaults
        let time = 0, speed = 1, intensity = 1;
        
        if (Array.isArray(value)) {
            [time = 0, speed = 1, intensity = 1] = value;
        } else if (typeof value === 'object' && value !== null) {
            time = value.time || 0;
            speed = value.speed || 1;
            intensity = value.intensity || 1;
        } else if (typeof value === 'number') {
            time = value;
        }

        // Apply effects pixel by pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                const targetIndex = pixelIndex * 4;

                if (selectedPixels.has(pixelIndex)) {
                    // For selected regions, use predicted background
                    const backgroundColor = predictBackgroundColor(x, y, backgroundMap, width, height);
                    processedImageData.data[targetIndex] = backgroundColor[0];
                    processedImageData.data[targetIndex + 1] = backgroundColor[1];
                    processedImageData.data[targetIndex + 2] = backgroundColor[2];
                    processedImageData.data[targetIndex + 3] = backgroundColor[3];
                } else {
                    // For non-selected regions, apply wave effect
                    let sourceX = x;
                    let sourceY = y;

                    // Create a wave effect that moves across the image
                    const waveX = Math.sin((y / height * 4 + time * speed) * Math.PI * 2) * intensity * 10;
                    const waveY = Math.cos((x / width * 4 + time * speed) * Math.PI * 2) * intensity * 5;

                    sourceX += waveX;
                    sourceY += waveY;

                    // Add a pulsing effect
                    const pulse = Math.sin(time * speed * 2) * intensity * 10;
                    sourceX += (x - width / 2) * pulse / width;
                    sourceY += (y - height / 2) * pulse / height;

                    // Ensure sourceX and sourceY are within bounds
                    sourceX = Math.max(0, Math.min(width - 1, sourceX));
                    sourceY = Math.max(0, Math.min(height - 1, sourceY));

                    const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;

                    // Copy pixel data
                    for (let i = 0; i < 4; i++) {
                        processedImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
                    }
                }
            }
        }

        self.postMessage({
            segmentedImages: [processedImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "An error occurred during processing: " + error.message,
            isComplete: true
        });
    }
};

function createBackgroundMap(imageData, selectedPixels, width, height) {
    const backgroundMap = new Array(height);
    for (let y = 0; y < height; y++) {
        backgroundMap[y] = new Array(width);
        for (let x = 0; x < width; x++) {
            const pixelIndex = y * width + x;
            if (!selectedPixels.has(pixelIndex)) {
                const i = pixelIndex * 4;
                backgroundMap[y][x] = [
                    imageData.data[i],
                    imageData.data[i + 1],
                    imageData.data[i + 2],
                    imageData.data[i + 3]
                ];
            }
        }
    }
    return backgroundMap;
}

function predictBackgroundColor(x, y, backgroundMap, width, height) {
    const searchRadius = 5;
    let totalColor = [0, 0, 0, 0];
    let count = 0;
    
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && backgroundMap[ny][nx]) {
                const weight = 1 / (1 + Math.sqrt(dx * dx + dy * dy)); // Weight by distance
                totalColor[0] += backgroundMap[ny][nx][0] * weight;
                totalColor[1] += backgroundMap[ny][nx][1] * weight;
                totalColor[2] += backgroundMap[ny][nx][2] * weight;
                totalColor[3] += backgroundMap[ny][nx][3] * weight;
                count += weight;
            }
        }
    }
    
    if (count === 0) return [128, 128, 128, 255]; // Default to gray if no background pixels found
    
    return totalColor.map(channel => Math.round(channel / count));
}