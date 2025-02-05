self.onmessage = function (e) {
    const { imageData, selectedRegions, imageCount, params, value } = e.data;

    // Process all images in a single loop
    const segmentedImages = processFaces(imageData, selectedRegions, imageCount, params, value);

    // Post the results back to the main thread
    self.postMessage({ segmentedImages: segmentedImages, isComplete: true });
};

function processFaces(imageData, faceRegions, imageCount, params, value) {
    const transformedFaces = [];
    const iterationsPerFrame = 10; // Reduced for performance

    for (let i = 0; i < imageCount; i++) {
        const baseProgress = i / (imageCount - 1);
        const newImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        for (let j = 0; j < iterationsPerFrame; j++) {
            const subProgress = j / iterationsPerFrame;
            const progress = easeInOutSine(baseProgress + subProgress / imageCount + value);

            faceRegions.forEach(face => {
                const faceParams = calculateFaceTransformParams(progress, params);
                applyFaceTransformation(newImageData, face, faceParams);
            });
        }

        transformedFaces.push(newImageData);
    }

    return transformedFaces;
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function calculateFaceTransformParams(progress, params = {}) {
    const { mouthOpenness = 5, eyeMovement = 2, eyebrowRaise = 3 } = params;

    return {
        mouthMovement: Math.sin(progress * Math.PI * 2) * mouthOpenness,
        eyeMovementX: Math.sin(progress * Math.PI * 2) * eyeMovement,
        eyeMovementY: Math.cos(progress * Math.PI * 2) * eyeMovement,
        eyebrowMovement: Math.sin(progress * Math.PI * 2) * eyebrowRaise
    };
}

function applyFaceTransformation(imageData, face, params) {
    moveMouth(imageData, face.mouth, params.mouthMovement);
    moveEyes(imageData, face.leftEye, face.rightEye, params.eyeMovementX, params.eyeMovementY);
    moveEyebrows(imageData, face.leftEyebrow, face.rightEyebrow, params.eyebrowMovement);
}

function moveMouth(imageData, mouthPoints, movement) {
    const half = mouthPoints.length / 2;
    const upperLip = mouthPoints.slice(0, half);
    const lowerLip = mouthPoints.slice(half);

    upperLip.forEach(point => movePoint(imageData, point, 0, -movement));
    lowerLip.forEach(point => movePoint(imageData, point, 0, movement));
}

function moveEyes(imageData, leftEye, rightEye, movementX, movementY) {
    leftEye.forEach(point => movePoint(imageData, point, movementX, movementY));
    rightEye.forEach(point => movePoint(imageData, point, movementX, movementY));
}

function moveEyebrows(imageData, leftEyebrow, rightEyebrow, movement) {
    leftEyebrow.forEach(point => movePoint(imageData, point, 0, -movement));
    rightEyebrow.forEach(point => movePoint(imageData, point, 0, -movement));
}

function movePoint(imageData, point, dx, dy) {
    const width = imageData.width;
    const oldX = point % width;
    const oldY = Math.floor(point / width);
    const newX = Math.round(oldX + dx);
    const newY = Math.round(oldY + dy);

    if (newX >= 0 && newX < width && newY >= 0 && newY < imageData.height) {
        const oldIndex = (oldY * width + oldX) * 4;
        const newIndex = (newY * width + newX) * 4;

        imageData.data.set(imageData.data.subarray(oldIndex, oldIndex + 4), newIndex);
    }
}