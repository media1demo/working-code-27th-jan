self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount, maxBrightness } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    function closeMouth(inputImageData, closureAmount) {
        const outputImageData = new ImageData(width, height);
        const inputData = inputImageData.data;
        const outputData = outputImageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                let newY = y;
                if (y > height / 2) {
                    newY = Math.max(height / 2, y - closureAmount);
                } else {
                    newY = Math.min(height / 2, y + closureAmount);
                }

                const newI = (newY * width + x) * 4;

                outputData[i] = inputData[newI];
                outputData[i + 1] = inputData[newI + 1];
                outputData[i + 2] = inputData[newI + 2];
                outputData[i + 3] = inputData[newI + 3];
            }
        }

        return outputImageData;
    }

    const segmentedImages = [];
    for (let i = 0; i < imageCount; i++) {
        const closureAmount = Math.floor((i / (imageCount - 1)) * (height / 4));
        const closedMouthImage = closeMouth(imageData, closureAmount);
        segmentedImages.push(closedMouthImage);
    }

    self.postMessage({ segmentedImages, isComplete: true });
};