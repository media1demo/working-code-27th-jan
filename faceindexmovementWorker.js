self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        value1,
        value2,
        value3,
        value4,
        value5
    } = e.data;

    const segmentedImages = [];
    const maxHorizontalOffset = value1 || 10;
    const maxVerticalOffset = value2 || 5;
    const rotationAngle = value3 || 5;
    const scaleFactor = value4 || 0.1;
    const iterations = value5 || 100; 

    for (let i = 0; i < iterations; i++) {
        const progress = i / (iterations - 1);
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.width * imageData.height * 4),
            imageData.width,
            imageData.height
        );

        selectedRegions.forEach((region, index) => {
            const centerX = average(region.map(p => p % imageData.width));
            const centerY = average(region.map(p => Math.floor(p / imageData.width)));

            const horizontalOffset = Math.sin(progress * Math.PI * 2) * maxHorizontalOffset * (index % 2 ? 1 : -1);
            const verticalOffset = Math.cos(progress * Math.PI * 2) * maxVerticalOffset;
            const rotation = Math.sin(progress * Math.PI) * rotationAngle;
            const scale = 1 + Math.sin(progress * Math.PI * 2) * scaleFactor;

            applyTransformation(imageData, newImageData, region, centerX, centerY, horizontalOffset, verticalOffset, rotation, scale);
        });

        segmentedImages.push(newImageData);

        if (i % 10 === 0) {
            self.postMessage({
                progress: (i + 1) / iterations,
                isComplete: false
            });
        }
    }

    console.log('segmentedImages.length :>> ', segmentedImages.length);
    
    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};

function applyTransformation(sourceImageData, targetImageData, region, centerX, centerY, dx, dy, angle, scale) {
    const width = sourceImageData.width;
    const height = sourceImageData.height;
    const cosAngle = Math.cos(angle * Math.PI / 180);
    const sinAngle = Math.sin(angle * Math.PI / 180);

    region.forEach(pixelIndex => {
        const x = pixelIndex % width - centerX;
        const y = Math.floor(pixelIndex / width) - centerY;

        let newX = x * scale;
        let newY = y * scale;

        // Apply rotation
        const rotatedX = newX * cosAngle - newY * sinAngle;
        const rotatedY = newX * sinAngle + newY * cosAngle;

        // Apply translation
        newX = rotatedX + centerX + dx;
        newY = rotatedY + centerY + dy;

        if (newX >= 0 && newX < width - 1 && newY >= 0 && newY < height - 1) {
            const x1 = Math.floor(newX);
            const y1 = Math.floor(newY);
            const x2 = x1 + 1;
            const y2 = y1 + 1;

            const fx = newX - x1;
            const fy = newY - y1;

            const oldIndex = pixelIndex * 4;
            const newIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;

            for (let c = 0; c < 4; c++) {
                const p11 = sourceImageData.data[(y1 * width + x1) * 4 + c];
                const p21 = sourceImageData.data[(y1 * width + x2) * 4 + c];
                const p12 = sourceImageData.data[(y2 * width + x1) * 4 + c];
                const p22 = sourceImageData.data[(y2 * width + x2) * 4 + c];

                const interpolatedValue = 
                    p11 * (1 - fx) * (1 - fy) +
                    p21 * fx * (1 - fy) +
                    p12 * (1 - fx) * fy +
                    p22 * fx * fy;

                targetImageData.data[newIndex + c] = Math.round(interpolatedValue);
            }
        }
    });
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}