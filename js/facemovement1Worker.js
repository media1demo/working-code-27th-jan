self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2
    } = e.data;

    const segmentedImages = [];
    const amplitude = value1 || 5; 
    const frequency = value2 || 0.1; 
    
    for (let i = 0; i < imageCount; i++) {
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        applyFaceMovement(newImageData, selectedRegions, i, amplitude, frequency);

        segmentedImages.push(newImageData);

        if (i % 10 === 0 || i === imageCount - 1) {
            self.postMessage({
                segmentedImages: [newImageData],
                isComplete: i === imageCount - 1
            });
        }
    }
};

function applyFaceMovement(imageData, selectedRegions, frameIndex, amplitude, frequency) {
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(imageData.data);

    for (const region of selectedRegions) {
        for (const pixelIndex of region) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            const dx = Math.sin(frameIndex * frequency) * amplitude;
            const dy = Math.cos(frameIndex * frequency) * amplitude;

            movePixelSmooth(tempData, imageData.data, width, height, x, y, x + dx, y + dy);
        }
    }

    imageData.data.set(tempData);
}

function movePixelSmooth(tempData, originalData, width, height, fromX, fromY, toX, toY) {
    const intToX = Math.floor(toX);
    const intToY = Math.floor(toY);
    const fracX = toX - intToX;
    const fracY = toY - intToY;

    for (let cy = intToY; cy <= intToY + 1; cy++) {
        for (let cx = intToX; cx <= intToX + 1; cx++) {
            if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                const weight = (1 - Math.abs(cx - toX)) * (1 - Math.abs(cy - toY));
                const toIndex = (cy * width + cx) * 4;
                const fromIndex = (Math.floor(fromY) * width + Math.floor(fromX)) * 4;

                for (let i = 0; i < 4; i++) {
                    tempData[toIndex + i] += originalData[fromIndex + i] * weight;
                }
            }
        }
    }
}