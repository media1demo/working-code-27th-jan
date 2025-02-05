self.onmessage = function(e) {
    const { imageData, faceRegions, params } = e.data;

    if (!imageData?.width || !imageData?.height || !faceRegions) {
        self.postMessage({
            error: "Missing or invalid data. Please provide valid imageData and faceRegions.",
            isComplete: true
        });
        return;
    }

    try {
        const animatedFaces = animateFaces(imageData, faceRegions, params);
        
        self.postMessage({
            animatedImage: animatedFaces,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "An error occurred during face animation: " + error.message,
            isComplete: true
        });
    }
};

function animateFaces(imageData, faceRegions, params) {
    const { width, height, data } = imageData;
    const newImageData = new ImageData(new Uint8ClampedArray(data), width, height);

    faceRegions.forEach(region => {
        // Simple example: move each face region slightly to the right
        const offset = params.offset || 5;
        
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newX = Math.min(x + offset, width - 1);
            const newIndex = y * width + newX;

            for (let i = 0; i < 4; i++) {
                newImageData.data[newIndex * 4 + i] = imageData.data[pixelIndex * 4 + i];
            }
        });
    });

    return newImageData;
}