self.onmessage = function(e) {
    const imageData = e.data.imageData;
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    // Apply essential classic effect
    applyEssentialClassic(data);

    // Apply low fidelity photo effect
    applyLowFidelityPhoto(data, width, height);

    // Send processed image data back to the main thread
    self.postMessage({
        processedImageData: imageData
    });
};

function applyEssentialClassic(data) {
    for (let i = 0; i < data.length; i += 4) {
        // Increase contrast
        data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128));
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128));
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128));
    }
}

function applyLowFidelityPhoto(data, width, height) {
    const tempData = new Uint8ClampedArray(data);
    const pixelSize = 4; // Adjust this value to change the pixelation effect

    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const i = (y * width + x) * 4;
            const r = tempData[i];
            const g = tempData[i + 1];
            const b = tempData[i + 2];
            const a = tempData[i + 3];

            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
                for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                    const j = ((y + dy) * width + (x + dx)) * 4;
                    data[j] = r;
                    data[j + 1] = g;
                    data[j + 2] = b;
                    data[j + 3] = a;
                }
            }
        }
    }
}