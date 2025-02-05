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
    const maxHorizontalOffset = value1 || 10;
    const maxVerticalOffset = value2 || 5;
    const rotationAngle = value3 || 5; // in degrees
    const scaleFactor = value4 || 0.1; // 0.1 means 10% scaling

    for (let i = 0; i < imageCount; i++) {
        const progress = i / (imageCount - 1);
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Apply different movements to different regions
        selectedRegions.forEach((region, index) => {
            const centerX = average(region.map(p => p % imageData.width));
            const centerY = average(region.map(p => Math.floor(p / imageData.width)));

            const horizontalOffset = Math.sin(progress * Math.PI * 2) * maxHorizontalOffset * (index % 2 ? 1 : -1);
            const verticalOffset = Math.cos(progress * Math.PI * 2) * maxVerticalOffset;
            const rotation = Math.sin(progress * Math.PI) * rotationAngle;
            const scale = 1 + Math.sin(progress * Math.PI * 2) * scaleFactor;

            applyTransformation(newImageData, region, centerX, centerY, horizontalOffset, verticalOffset, rotation, scale);
        });

        segmentedImages.push(newImageData);
    }

    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};

function applyTransformation(imageData, region, centerX, centerY, dx, dy, angle, scale) {
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(imageData.data);

    const cosAngle = Math.cos(angle * Math.PI / 180);
    const sinAngle = Math.sin(angle * Math.PI / 180);

    region.forEach(pixelIndex => {
        const x = pixelIndex % width - centerX;
        const y = Math.floor(pixelIndex / width) - centerY;

        // Apply scaling
        let newX = x * scale;
        let newY = y * scale;

        // Apply rotation
        const rotatedX = newX * cosAngle - newY * sinAngle;
        const rotatedY = newX * sinAngle + newY * cosAngle;

        // Apply translation
        newX = Math.round(rotatedX + centerX + dx);
        newY = Math.round(rotatedY + centerY + dy);

        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            const oldIndex = pixelIndex * 4;
            const newIndex = (newY * width + newX) * 4;

            for (let c = 0; c < 4; c++) {
                tempData[newIndex + c] = imageData.data[oldIndex + c];
            }
        }
    });

    // Copy transformed pixels back to image data
    for (let i = 0; i < imageData.data.length; i++) {
        if (tempData[i] !== undefined) {
            imageData.data[i] = tempData[i];
        }
    }
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function interpolate(start, end, progress) {
    return start + (end - start) * progress;
}