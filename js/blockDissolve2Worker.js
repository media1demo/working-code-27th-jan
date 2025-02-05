self.onmessage = function (e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2,
        value3,
        value4,
        value5,
        clickedPoints,
        lines
    } = e.data;

    const segmentedImages = [];
    const blockSize = Math.max(1, Math.floor(value1)); // Use value1 as block size
    const width = imageData.width;
    const height = imageData.height;
    const intensityFactor = 4; // Increase this to make the movement more intense

    const angleFrequency = value3 || 6;
    const dissolveExponent = value4 || 0.5;
    const selectedPixels = new Set(selectedRegions.flat());

    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        );

        const dissolveThreshold = Math.pow(i / (imageCount - 1), dissolveExponent); // Non-linear progression

        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                let blockSelected = false;
                for (let by = 0; by < blockSize && y + by < height; by++) {
                    for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                        if (selectedPixels.has((y + by) * width + (x + bx))) {
                            blockSelected = true;
                            break;
                        }
                    }
                    if (blockSelected) break;
                }

                if (blockSelected && Math.random() < dissolveThreshold) {
                    const angleOffset = (x / width + y / height + i / imageCount) * Math.PI * angleFrequency; // Adjust frequency with value3
                    const xOffset = Math.cos(angleOffset) * blockSize * intensityFactor * (value5 / 100);
                    const yOffset = Math.sin(angleOffset) * blockSize * intensityFactor * (value5 / 100);

                    for (let by = 0; by < blockSize && y + by < height; by++) {
                        for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
                            const sourceX = Math.floor((x + bx + xOffset + width) % width);
                            const sourceY = Math.floor((y + by + yOffset + height) % height);
                            const sourceIndex = (sourceY * width + sourceX) * 4;
                            const targetIndex = ((y + by) * width + (x + bx)) * 4;


                            for (let j = 0; j < 4; j++) {
                                newImageData.data[targetIndex + j] = imageData.data[sourceIndex + j];
                            }
                        }
                    }
                }
            }
        }

        // Handle clicked pointsunchanged ()
        for (const point of clickedPoints) {
            const x = point[0];
            const y = point[1];
            const pixelIndex = (y * width + x) * 4;
            newImageData.data[pixelIndex] = 255;
            newImageData.data[pixelIndex + 1] = 0;
            newImageData.data[pixelIndex + 2] = 0;
            newImageData.data[pixelIndex + 3] = 255;
        }

        // Apply additional effects like hue adjustment or others
        applyAdditionalEffects(newImageData, value2, value3, value4, value5);

        segmentedImages.push(newImageData);
    }

    self.postMessage({ segmentedImages: segmentedImages });
};

function applyAdditionalEffects(imageData, value2, value3, value4, value5) {
    // Adjust red color based on value2
    const redAdjustment = value2 / 100;
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
    }

}   