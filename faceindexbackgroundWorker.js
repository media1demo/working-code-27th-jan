//

self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;

    if (!imageData?.width || !imageData?.height || !selectedRegions) {
        self.postMessage({
            error: "Missing or invalid data. Please provide valid imageData and selectedRegions.",
            isComplete: true
        });
        return;
    }

    try {
        const { width, height, data } = imageData;
        const newImageData = new ImageData(width, height);
        const selectedPixels = new Set(selectedRegions.flat());
        const backgroundMap = createBackgroundMap(data, selectedPixels, width, height);

        for (let i = 0; i < newImageData.data.length; i += 4) {
            newImageData.data[i + 3] = 0; // Set alpha to 0 (fully transparent)
        }

        for (const pixelIndex of selectedPixels) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const backgroundColor = predictBackgroundColor(x, y, backgroundMap, width, height);
            const i = pixelIndex * 4;
            newImageData.data.set(backgroundColor, i);
            newImageData.data[i + 3] = 255; // Set alpha to 255 (fully opaque)
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

function createBackgroundMap(imageData, selectedPixels, width, height) {
    const backgroundMap = Array.from({ length: height }, () => new Array(width));
    for (let i = 0; i < imageData.length; i += 4) {
        const pixelIndex = i / 4;
        if (!selectedPixels.has(pixelIndex)) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            backgroundMap[y][x] = imageData.slice(i, i + 4);
        }
    }
    return backgroundMap;
}

function predictBackgroundColor(x, y, backgroundMap, width, height) {
    const searchRadius = 5;
    const totalColor = [0, 0, 0, 0];
    let count = 0;

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && backgroundMap[ny][nx]) {
                for (let i = 0; i < 4; i++) {
                    totalColor[i] += backgroundMap[ny][nx][i];
                }
                count++;
            }
        }
    }

    return count ? totalColor.map(channel => Math.round(channel / count)) : [128, 128, 128, 255];
}