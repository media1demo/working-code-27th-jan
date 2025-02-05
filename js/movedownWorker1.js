self.onmessage = function(e) {
    const { imageData, selectedRegions, imageCount } = e.data;
    const width = imageData.width;
    const height = imageData.height;

    function moveMouthUpwards(inputImageData, moveAmount) {
        const outputImageData = new ImageData(width, height);
        const inputData = inputImageData.data;
        const outputData = outputImageData.data;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                
                let newY = Math.max(0, y - moveAmount);
                const newI = (newY * width + x) * 4;

                outputData[i] = inputData[newI];
                outputData[i + 1] = inputData[newI + 1];
                outputData[i + 2] = inputData[newI + 2];
                outputData[i + 3] = inputData[newI + 3];

                if (y >= height - moveAmount) {
                    const lastRowI = ((height - 1) * width + x) * 4;
                    outputData[i] = inputData[lastRowI];
                    outputData[i + 1] = inputData[lastRowI + 1];
                    outputData[i + 2] = inputData[lastRowI + 2];
                    outputData[i + 3] = inputData[lastRowI + 3];
                }
            }
        }

        return outputImageData;
    }

    const segmentedImages = [];
    const maxMoveAmount = Math.floor(height / 4); // Maximum move is 1/4 of the image height

    for (let i = 0; i < imageCount; i++) {
        const moveAmount = Math.floor((i / (imageCount - 1)) * maxMoveAmount);
        const movedMouthImage = moveMouthUpwards(imageData, moveAmount);
        segmentedImages.push(movedMouthImage);
    }

    self.postMessage({ segmentedImages, isComplete: true });
};