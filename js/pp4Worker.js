self.onmessage = function(e) {
    const data = e.data;
    console.log('e.data :>> ', e.data);

    const imageData = data.imageData;
    const selectedRegions = data.selectedRegions;
    const baseImageCount = data.imageCount || 5;
    const totalImageCount = baseImageCount * 64 * 16;
    const baseValue1 = data.value1 || 50;
    const baseValue2 = data.value2 || 50;
    const baseValue3 = data.value3 || 50;

    let processedCount = 0;
    let segmentedImages = [];

    function processNextImage() {
        if (processedCount >= totalImageCount) {
            // All images processed, send final message
            console.log(segmentedImages);
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: true
            });
            return;
        }

        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Calculate perspective parameters with random variation
        const perspectiveStrength = ((baseValue1 / 100) * 2) * (0.5 + Math.random());
        const horizontalTilt = ((baseValue2 - 50) / 50) * (0.5 + Math.random());
        const verticalTilt = ((baseValue3 - 50) / 50) * (0.5 + Math.random());

        // Clear the image with transparent pixels
        for (let j = 0; j < newImageData.data.length; j += 4) {
            newImageData.data[j + 3] = 0;
        }

        // Apply perspective transformation to selected regions
        for (const region of selectedRegions) {
            for (const pixelIndex of region) {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);

                const [newX, newY] = applyPerspective(
                    x, y,
                    imageData.width, imageData.height,
                    perspectiveStrength,
                    horizontalTilt,
                    verticalTilt
                );

                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const oldIndex = (y * imageData.width + x) * 4;
                    const newIndex = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;

                    // Copy pixel data
                    for (let c = 0; c < 4; c++) {
                        newImageData.data[newIndex + c] = imageData.data[oldIndex + c];
                    }
                }
            }
        }

        segmentedImages.push(newImageData);
        processedCount++;

        // Send batch of images when we have 10 or reached the end
        if (segmentedImages.length >= 10 || processedCount >= totalImageCount) {
            self.postMessage({
                segmentedImages: segmentedImages,
                isComplete: processedCount >= totalImageCount
            });
            segmentedImages = [];
        }

        // Schedule next processing
        setTimeout(processNextImage, 0);
    }

    function applyPerspective(x, y, width, height, strength, horizontalTilt, verticalTilt) {
        const centerX = width / 2;
        const centerY = height / 2;

        // Convert to relative coordinates
        let dx = x - centerX;
        let dy = y - centerY;

        // Apply perspective distortion
        let z = 1 + (dy / height) * strength * 2;
        dx = dx / z;
        dy = dy / z;

        // Apply tilt
        dx += horizontalTilt * dy * 100;  // Amplified for more visible effect
        dy += verticalTilt * dx * 100;

        // Convert back to image coordinates
        return [
            Math.round(centerX + dx),
            Math.round(centerY + dy)
        ];
    }

    // Start processing
    processNextImage();
};