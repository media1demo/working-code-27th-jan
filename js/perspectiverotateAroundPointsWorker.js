self.onmessage = function (e) {
    console.log("Worker received message:", e.data);

    const { imageData, value, selectedRegions = [], debugMode = false } = e.data;
    const processedImageData = applyRotationAroundPointsAndLines(imageData, value, selectedRegions, debugMode);
    
    
    self.postMessage({ imageData: processedImageData });
};

function applyRotationAroundPointsAndLines(imageData, value, selectedRegions = [], debugMode = false) {
    const { width, height, data } = imageData;
    const newData = new Uint8ClampedArray(data.length);
    console.log("Applying rotation with:", { value, selectedRegions, debugMode });

    // Calculate the center of rotation
    let centerX = width / 2;
    let centerY = height / 2;

    if (selectedRegions.length > 0) {
        // Calculate the center of the selected region
        let sumX = 0, sumY = 0;
        let totalPixels = 0;
console.log('totalPixels :>> ', totalPixels);
        selectedRegions.forEach(region => {
            region.forEach(pixelIndex => {
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                sumX += x;
                sumY += y;
                totalPixels++;
            });
        });

        if (totalPixels > 0) {
            centerX = sumX / totalPixels;
            centerY = sumY / totalPixels;
        }
    }

    console.log("Center of Rotation:", { centerX, centerY });

    // Apply rotation
    const angle = value * (Math.PI / 180); // Convert degrees to radians
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Copy the original image data to the new data array
    newData.set(data);

    if (selectedRegions.length > 0) {
        // Rotate only the selected region
        selectedRegions.forEach(region => {
            region.forEach(pixelIndex => {
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);

                const dx = x - centerX;
                const dy = y - centerY;
                const newX = Math.round(centerX + dx * cosA - dy * sinA);
                const newY = Math.round(centerY + dx * sinA + dy * cosA);

                const targetIndex = (y * width + x) * 4;
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const sourceIndex = (newY * width + newX) * 4;
                    console.log('sourceIndex :>> ', sourceIndex);
                    for (let i = 0; i < 4; i++) {
                        newData[targetIndex + i] = data[sourceIndex + i];
                    }
                } else {
                    // Fill out-of-bounds pixels with black for debugging
                    newData[targetIndex] = 0;     // R
                    newData[targetIndex + 1] = 0; // G
                    newData[targetIndex + 2] = 0; // B
                    newData[targetIndex + 3] = 255; // A
                }
            });
        });
    } else {
        // Rotate the entire image
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const newX = Math.round(centerX + dx * cosA - dy * sinA);
                const newY = Math.round(centerY + dx * sinA + dy * cosA);

                const targetIndex = (y * width + x) * 4;
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    const sourceIndex = (newY * width + newX) * 4;
                    for (let i = 0; i < 4; i++) {
                        newData[targetIndex + i] = data[sourceIndex + i];
                    }
                } else {
                    // Fill out-of-bounds pixels with black for debugging
                    newData[targetIndex] = 0;     // R
                    newData[targetIndex + 1] = 0; // G
                    newData[targetIndex + 2] = 0; // B
                    newData[targetIndex + 3] = 255; // A
                }
            }
        }
    }

    return new ImageData(newData, width, height);
}