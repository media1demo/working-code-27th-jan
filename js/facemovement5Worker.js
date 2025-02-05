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
        value5
    } = e.data;

    if (!imageData?.width || !imageData?.height || !selectedRegions) {
        self.postMessage({
            error: "Missing or invalid data. Please provide valid imageData and selectedRegions.",
            isComplete: true
        });
        return;
    }

    try {
        const { width, height, data } = imageData;
        const selectedPixels = new Set(selectedRegions.flat());

        // Background prediction
        const backgroundMap = createBackgroundMap(data, selectedPixels, width, height);
        const backgroundImage = new ImageData(new Uint8ClampedArray(data), width, height);
        for (const pixelIndex of selectedPixels) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const backgroundColor = predictBackgroundColor(x, y, backgroundMap, width, height);
            const i = pixelIndex * 4;
            backgroundImage.data.set(backgroundColor, i);
        }

        // Face movement and combination
        const combinedImages = [];
        const iterationsPerFrame = 30;
        for (let i = 0; i < imageCount; i++) {
            const baseProgress = i / (imageCount - 1);
            for (let j = 0; j < iterationsPerFrame; j++) {
                const subProgress = j / iterationsPerFrame;
                const progress = easeInOutSine(baseProgress + subProgress / imageCount);
                
                const faceMovementImage = new ImageData(new Uint8ClampedArray(data), width, height);
                
                // Apply face movement
                applyFaceMovement(faceMovementImage, selectedRegions, progress, {
                    maxHorizontalOffset: value1 || 10,
                    maxVerticalOffset: value2 || 5,
                    rotationAngle: value3 || 5,
                    scaleFactor: value4 || 0.1,
                    brightness: value5 || 1
                });

                // Combine background and face movement
                const combinedImage = new ImageData(new Uint8ClampedArray(backgroundImage.data), width, height);
                for (const pixelIndex of selectedPixels) {
                    const i = pixelIndex * 4;
                    combinedImage.data.set(faceMovementImage.data.slice(i, i + 4), i);
                }

                combinedImages.push(combinedImage);
            }
        }

        self.postMessage({
            segmentedImages: combinedImages,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "An error occurred during processing: " + error.message,
            isComplete: true
        });
    }
};

function createBackgroundMap(imageData, selectedPixels, width, height) {
    const backgroundMap = Array.from({ length: height }, () => new Array(width));
    for (let i = 0; i < imageData.length; i += 4) {
        const pixelIndex = i / 4;
        if (!selectedPixels.has(pixelIndex)) {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            backgroundMap[y][x] = imageData.slice(i, i + 4);
        }
    }
    return backgroundMap;
}

function predictBackgroundColor(x, y, backgroundMap, width, height) {
    const searchRadius = 5;
    const totalColor = [0, 0, 0, 0];
    let count = 0;

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && backgroundMap[ny][nx]) {
                for (let i = 0; i < 4; i++) {
                    totalColor[i] += backgroundMap[ny][nx][i];
                }
                count++;
            }
        }
    }

    return count ? totalColor.map(channel => Math.round(channel / count)) : [128, 128, 128, 255];
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function applyFaceMovement(imageData, selectedRegions, progress, params) {
    selectedRegions.forEach((region, index) => {
        const transformParams = calculateTransformParams(region, progress, params, index, imageData);
        applyTransformation(imageData, region, transformParams);
    });
}

function calculateTransformParams(region, progress, params, index, imageData) {
    const centerX = average(region.map(p => p % imageData.width));
    const centerY = average(region.map(p => Math.floor(p / imageData.width)));

    const direction = index % 2 === 0 ? 1 : -1;

    return {
        centerX,
        centerY,
        horizontalOffset: Math.sin(progress * Math.PI * 2) * params.maxHorizontalOffset * direction,
        verticalOffset: Math.cos(progress * Math.PI * 2) * params.maxVerticalOffset * direction,
        rotation: Math.sin(progress * Math.PI) * params.rotationAngle * direction,
        scale: 1 + Math.sin(progress * Math.PI * 2) * params.scaleFactor * direction
    };
}

function applyTransformation(imageData, region, params) {
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(imageData.data);

    const cosAngle = Math.cos(params.rotation * Math.PI / 180);
    const sinAngle = Math.sin(params.rotation * Math.PI / 180);

    region.forEach(pixelIndex => {
        const x = pixelIndex % width - params.centerX;
        const y = Math.floor(pixelIndex / width) - params.centerY;

        let newX = x * params.scale;
        let newY = y * params.scale;

        const rotatedX = newX * cosAngle - newY * sinAngle;
        const rotatedY = newX * sinAngle + newY * cosAngle;

        newX = Math.round(rotatedX + params.centerX + params.horizontalOffset);
        newY = Math.round(rotatedY + params.centerY + params.verticalOffset);

        if (newX >= 0 && newX < width - 1 && newY >= 0 && newY < height - 1) {
            const oldIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                tempData[oldIndex + c] = imageData.data[(newY * width + newX) * 4 + c];
            }
        }
    });

    region.forEach(pixelIndex => {
        const i = pixelIndex * 4;
        for (let c = 0; c < 4; c++) {
            imageData.data[i + c] = tempData[i + c];
        }
    });
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}