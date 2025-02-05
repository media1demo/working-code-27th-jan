self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        imageCount,
        value1,
        value2,
        value3,
        value4,
        value5
    } = e.data;

    const params = {
        maxHorizontalOffset: generateValues(value1, 10),
        maxVerticalOffset: generateValues(value2, 10),
        rotationAngle: generateValues(value3, 10),
        scaleFactor: generateValues(value4, 10),
        brightness: generateValues(value5, 10)
    };

    const segmentedImages = processImages(imageData, selectedRegions, imageCount, params);

    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });
};

function generateValues(baseValue, count) {
    const baseVal = baseValue || 1;
    const incrementFactor = 0.05; // 5% increment/decrement
    return Array.from({length: count}, (_, i) => {
        const factor = (i - Math.floor(count / 2)) * incrementFactor;
        return baseVal * (1 + factor);
    });
}

function processImages(imageData, selectedRegions, imageCount, params) {
    const segmentedImages = [];
    const iterationsPerFrame = 30;
    for (let i = 0; i < imageCount; i++) {
        const baseProgress = i / (imageCount - 1);
        for (let j = 0; j < iterationsPerFrame; j++) {
            const subProgress = j / iterationsPerFrame;
            const progress = (baseProgress + subProgress / imageCount) % 1;
            const newImageData = createTransformedImage(imageData, selectedRegions, progress, params);
            segmentedImages.push(newImageData);
        }
    }
    return segmentedImages;
}

function createTransformedImage(imageData, selectedRegions, progress, params) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    selectedRegions.forEach((region, index) => {
        const transformParams = calculateTransformParams(region, progress, params, index, imageData);
        applyTransformation(newImageData, region, transformParams);
    });

    applyBrightnessAdjustment(newImageData, params.brightness, progress);
    return newImageData;
}
function calculateTransformParams(region, progress, params, index, imageData) {
    const centerX = average(region.map(p => p % imageData.width));
    const centerY = average(region.map(p => Math.floor(p / imageData.width)));

    const paramIndex = Math.floor(progress * 10) % 10;

    return {
        centerX,
        centerY,
        horizontalOffset: Math.sin(progress * Math.PI * 2) * params.maxHorizontalOffset[paramIndex] * (index % 2 ? 1 : -1),
        verticalOffset: Math.cos(progress * Math.PI * 2) * params.maxVerticalOffset[paramIndex],
        rotation: Math.sin(progress * Math.PI) * params.rotationAngle[paramIndex],
        scale: 1 + Math.sin(progress * Math.PI * 2) * params.scaleFactor[paramIndex]
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

        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            const oldIndex = pixelIndex * 4;
            const newIndex = (newY * width + newX) * 4;

            for (let c = 0; c < 4; c++) {
                tempData[newIndex + c] = imageData.data[oldIndex + c];
            }
        }
    });

    for (let i = 0; i < imageData.data.length; i++) {
        if (tempData[i] !== undefined) {
            imageData.data[i] = tempData[i];
        }
    }
}

function applyBrightnessAdjustment(imageData, brightness, progress) {
    const paramIndex = Math.floor(progress * 10) % 10;
    const factor = 1 + (brightness[paramIndex] - 1) * Math.sin(progress * Math.PI);
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            imageData.data[i + c] = Math.min(255, Math.max(0, imageData.data[i + c] * factor));
        }
    }
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}