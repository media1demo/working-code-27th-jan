self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        maxBrightness,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];
    const width = imageData.width;
    const height = imageData.height;

    // Function to clone and move the selected region to the left and make it 1% smaller from the center
    function cloneAndMoveRegion(imageData, selectedRegion, shiftAmount, scaleFactor) {
        const newWidth = Math.floor(width * scaleFactor);
        const newHeight = Math.floor(height * scaleFactor);
        const newImageData = new ImageData(newWidth, newHeight);

        const centerX = width / 2;
        const centerY = height / 2;
        const newCenterX = newWidth / 2;
        const newCenterY = newHeight / 2;

        selectedRegion.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const index = (y * width + x) * 4;

            // Translate to center, scale, and translate back
            const newX = Math.floor((x - centerX) * scaleFactor + newCenterX - shiftAmount);
            const newY = Math.floor((y - centerY) * scaleFactor + newCenterY);

            if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
                const newIndex = (newY * newWidth + newX) * 4;

                newImageData.data[newIndex] = imageData.data[index];
                newImageData.data[newIndex + 1] = imageData.data[index + 1];
                newImageData.data[newIndex + 2] = imageData.data[index + 2];
                newImageData.data[newIndex + 3] = imageData.data[index + 3];
            }
        });

        return newImageData;
    }

    // Generate the parallax effect for each selected region
    selectedRegions.forEach(region => {
        for (let i = 0; i < imageCount; i++) {
            const shiftAmount = i; // Move by 1 pixel for each clone
            const scaleFactor = 1 - (i * 0.005); // Decrease size by 1% for each clone
            const newImageData = cloneAndMoveRegion(imageData, region, shiftAmount, scaleFactor);
            segmentedImages.push(newImageData);
        }
    });

    // Post the result back to the main thread
    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};