self.onmessage = function(e) {
    const { imageData, value, selectedRegions, phoneme } = e.data;

    try {
        const width = imageData.width;
        const height = imageData.height;

        // Create a new ImageData object for the result
        const newImageData = new ImageData(width, height);

        // Perform lip-sync transformation on the image data
        const transformedImageData = performLipSync(imageData, selectedRegions, phoneme);

        // Apply vertical shift to the transformed image data
        const shift = Math.floor(value * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const newY = (height + y - shift) % height;
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (newY * width + x) * 4;

                for (let i = 0; i < 4; i++) {
                    newImageData.data[targetIndex + i] = transformedImageData.data[sourceIndex + i];
                }
            }
        }

        // Send the result back to the main thread
        self.postMessage({ imageData: newImageData });

    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function performLipSync(imageData, region, phoneme) {
    const shape = mouthShapes[phoneme] || mouthShapes['Neutral'];
    const frameData = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    let [minY, maxY, minX, maxX] = [Infinity, -Infinity, Infinity, -Infinity];
    for (let pixelIndex of region) { // region must be iterable
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
    }

    const lipCenterY = (minY + maxY) / 2;
    const lipCenterX = (minX + maxX) / 2;
    const lipHeight = maxY - minY;
    const lipWidth = maxX - minX;
    const lipWidthHalf = lipWidth / 2;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            const pixelIndex = y * width + x;
            if (!region.has(pixelIndex)) continue; // Use .has() for Set

            const idx = pixelIndex * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {

                continue; 

            }

            let [newY, newX] = [y, x];

            const isUpperLip = y < lipCenterY;
            const lipFactor = isUpperLip ? 0.7 : 1.0; // Upper lip moves less

            // Vertical transformation
            const verticalOffset = (y - lipCenterY) / lipHeight;
            newY += Math.max(-lipHeight * 0.5, Math.min(lipHeight * 0.5, verticalOffset * shape.openness * lipHeight * lipFactor));

            // Horizontal transformation
            const horizontalOffset = (x - lipCenterX) / lipWidthHalf;
            newX = lipCenterX + horizontalOffset * shape.width * lipWidthHalf;

            // Squeeze effect
            newX += (lipCenterX - newX) * shape.squeeze;

            // Ensure we stay within bounds
            newY = Math.max(minY, Math.min(maxY, newY));
            newX = Math.max(minX, Math.min(maxX, newX));

            // Bilinear interpolation
            const [x1, y1] = [Math.floor(newX), Math.floor(newY)];
            const [wx, wy] = [newX - x1, newY - y1];

            const x2 = Math.min(x1 + 1, width - 1);
            const y2 = Math.min(y1 + 1, height - 1);

            const [w1, w2, w3, w4] = [(1 - wx) * (1 - wy), wx * (1 - wy), (1 - wx) * wy, wx * wy];

            const idx1 = (y * width + x) * 4;
            for (let c = 0; c < 4; c++) {
                const [c1, c2, c3, c4] = [
                    imageData.data[(y1 * width + x1) * 4 + c],
                    imageData.data[(y1 * width + x2) * 4 + c],
                    imageData.data[(y2 * width + x1) * 4 + c],
                    imageData.data[(y2 * width + x2) * 4 + c]
                ];
                frameData[idx1 + c] = w1 * c1 + w2 * c2 + w3 * c3 + w4 * c4;
            }
        }
    }

    return new ImageData(frameData, width, height);
}

const mouthShapes = {
    'FullyClosed': { openness: -1.0, width: 0.8, squeeze: 0.3, cupidsBow: 0.05, lowerLipFullness: 0.4 },
    'SlightlyOpen': { openness: 0.2, width: 1.0, squeeze: 0.1, cupidsBow: 0.2, lowerLipFullness: 0.5 },
    'MediumOpen': { openness: 0.5, width: 1.1, squeeze: 0, cupidsBow: 0.3, lowerLipFullness: 0.6 },
    'WideOpen': { openness: 1.0, width: 1.2, squeeze: -0.1, cupidsBow: 0.4, lowerLipFullness: 0.7 },
};