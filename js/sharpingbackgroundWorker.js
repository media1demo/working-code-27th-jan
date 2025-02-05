// Function to apply a hexagonal effect to the image
function applyHexagonalEffect(imageData, region, hexSize) {
    const width = imageData.width;
    const height = imageData.height;
    const hexColors = new Map();

    for (const pixelIndex of region) {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        const hexCenterX = Math.floor(x / hexSize) * hexSize + hexSize / 2;
        const hexCenterY = Math.floor(y / hexSize) * hexSize + (Math.floor(x / hexSize) % 2 ? hexSize / 2 : 0);

        const hexKey = `${hexCenterX},${hexCenterY}`;

        if (!hexColors.has(hexKey)) {
            const colorSum = [0, 0, 0];
            let count = 0;

            // Calculate average color for the hexagon
            for (let dx = -hexSize / 2; dx < hexSize / 2; dx++) {
                for (let dy = -hexSize / 2; dy < hexSize / 2; dy++) {
                    const hx = Math.floor(hexCenterX + dx);
                    const hy = Math.floor(hexCenterY + dy);
                    if (hx >= 0 && hx < width && hy >= 0 && hy < height && isInsideHexagon(hx, hy, hexCenterX, hexCenterY, hexSize)) {
                        const index = (hy * width + hx) * 4;
                        for (let c = 0; c < 3; c++) {
                            colorSum[c] += imageData.data[index + c];
                        }
                        count++;
                    }
                }
            }

            if (count > 0) {
                const avgColor = colorSum.map(sum => Math.round(sum / count));
                hexColors.set(hexKey, avgColor);
            } else {
                // If no pixels were found in the hexagon, use the original pixel color
                const originalIndex = (y * width + x) * 4;
                hexColors.set(hexKey, [
                    imageData.data[originalIndex],
                    imageData.data[originalIndex + 1],
                    imageData.data[originalIndex + 2]
                ]);
            }
        }

        const avgColor = hexColors.get(hexKey);
        const index = pixelIndex * 4;
        for (let c = 0; c < 3; c++) {
            imageData.data[index + c] = avgColor[c];
        }
        // Preserve the original alpha value
        imageData.data[index + 3] = imageData.data[index + 3];
    }
}

// Function to check if a pixel is inside a hexagon
function isInsideHexagon(x, y, centerX, centerY, size) {
    const dx = Math.abs(x - centerX) / (size / 2);
    const dy = Math.abs(y - centerY) / (size * Math.sqrt(3) / 2);
    return dx <= 1 && dy <= 1 && dx + dy <= 1.5;
}

// Function to apply additional effects to the image
function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
    // Example: Adjust the red channel based on value1
    const redAdjustment = value1 / 100; // Assuming value1 is a percentage

    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] * (1 + redAdjustment)));
    }

    // You can add more effects using the other values (value2, value3, etc.)
}

// Web Worker message handler
self.onmessage = function (e) {
    const {
        imageData,
        selectedRegions,
        hexSize = 10, // Default hexagon size
        value1, // Additional effect parameter 1
        value2, // Additional effect parameter 2
        value3, // Additional effect parameter 3
        value4, // Additional effect parameter 4
        value5, // Additional effect parameter 5
    } = e.data;

    try {
        // Create a copy of the image data to avoid modifying the original
        const processedImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Apply the hexagonal effect to the selected regions
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            applyHexagonalEffect(processedImageData, selectedRegions[0], hexSize);
        }

        // Apply additional effects to the entire image
        applyAdditionalEffects(processedImageData, value1, value2, value3, value4, value5);

        // Send the processed image data back to the main thread
        self.postMessage(
            {
                processedImageData,
                isComplete: true,
            },
            [processedImageData.data.buffer] // Transfer the buffer to avoid copying
        );
    } catch (error) {
        // Handle errors
        self.postMessage({
            error: error.message,
            isComplete: true,
        });
    }
};