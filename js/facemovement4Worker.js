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

    const segmentedImages = processImages(imageData, selectedRegions, imageCount, {
        maxHorizontalOffset: value1 || 10,
        maxVerticalOffset: value2 || 5,
        rotationAngle: value3 || 5,
        scaleFactor: value4 || 0.1,
        brightness: value5 || 1
    });

    self.postMessage({
        segmentedImages: segmentedImages,
        isComplete: true
    });

};


function processImages(imageData, selectedRegions, faceRegions, imageCount, params) {
    const segmentedImages = [];
    const iterationsPerFrame = 30;
    for (let i = 0; i < imageCount; i++) {
        const baseProgress = i / (imageCount - 1);
        for (let j = 0; j < iterationsPerFrame; j++) {
            const subProgress = j / iterationsPerFrame;
            const progress = easeInOutSine(baseProgress + subProgress / imageCount);
            const newImageData = createTransformedImage(imageData, selectedRegions, faceRegions, progress, params);
            segmentedImages.push(newImageData);
        }
    }
    return segmentedImages;
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}


function createTransformedImage(imageData, selectedRegions, progress, params) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    const prevImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    selectedRegions.forEach((region, index) => {
        const transformParams = calculateTransformParams(region, progress, params, index, imageData);
        // applyTransformation(newImageData, region, transformParams);
        applyTransformation(prevImageData, region, calculateTransformParams(region, progress - 0.1, params, index, imageData));
    });
    faceRegions.forEach(faceRegion => {
        const faceParams = calculateFaceTransformParams(faceRegion, progress, params);
        applyFaceTransformation(newImageData, faceRegion, faceParams);
    });
    for (let i = 0; i < newImageData.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            newImageData.data[i + c] = (newImageData.data[i + c] * 0.7 + prevImageData.data[i + c] * 0.3);
        }
    }

    applyBrightnessAdjustment(newImageData, params.brightness, progress);
    return newImageData;
}


function calculateFaceTransformParams(faceRegion, progress, params) {
    // Calculate face-specific transformations based on landmarks
    // This could include mouth opening/closing, eye movements, etc.
}

function applyFaceTransformation(imageData, faceRegion, faceParams) {
    // Apply the face-specific transformations
    // This would involve moving individual facial features and interpolating surrounding pixels
}


function calculateTransformParams(region, progress, params, index, imageData) {
    const centerX = average(region.map(p => p % imageData.width));
    const centerY = average(region.map(p => Math.floor(p / imageData.width)));

    // Alternate between incrementing and decrementing
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
            const x1 = Math.floor(newX);
            const y1 = Math.floor(newY);
            const x2 = x1 + 1;
            const y2 = y1 + 1;

            const fx = newX - x1;
            const fy = newY - y1;

            const oldIndex = pixelIndex * 4;

            for (let c = 0; c < 4; c++) {
                const tl = imageData.data[(y1 * width + x1) * 4 + c];
                const tr = imageData.data[(y1 * width + x2) * 4 + c];
                const bl = imageData.data[(y2 * width + x1) * 4 + c];
                const br = imageData.data[(y2 * width + x2) * 4 + c];

                const interpolatedValue =
                    tl * (1 - fx) * (1 - fy) +
                    tr * fx * (1 - fy) +
                    bl * (1 - fx) * fy +
                    br * fx * fy;

                tempData[oldIndex + c] = interpolatedValue;
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
    // Alternate between incrementing and decrementing brightness
    const factor = 1 + (brightness - 1) * Math.sin(progress * Math.PI * 2);
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            imageData.data[i + c] = Math.min(255, Math.max(0, imageData.data[i + c] * factor));
        }
    }
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}