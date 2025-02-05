self.onmessage = function (e) {
    const { imageData, selectedRegions, imageCount, params, value } = e.data;

    try {
        let segmentedImages;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Process only the selected regions
            segmentedImages = applyFaceTransformations(imageData, selectedRegions, imageCount, params, value);
        } else {
            // If no regions selected, apply transformations to the entire image
            const allPixels = [...Array(imageData.width * imageData.height).keys()];
            segmentedImages = applyFaceTransformations(imageData, [{
                mouth: allPixels,
                leftEye: allPixels,
                rightEye: allPixels,
                leftEyebrow: allPixels,
                rightEyebrow: allPixels
            }], imageCount, params, value);
        }

        // Post the results back to the main thread
        self.postMessage({
            segmentedImages: segmentedImages,
            isComplete: true
        });
    } catch (error) {
        // Post an error message back to the main thread
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function applyFaceTransformations(imageData, faceRegions, imageCount, params, value) {
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

                // Apply mouth transformation
                const halfMouth = face.mouth.length / 2;
                face.mouth.slice(0, halfMouth).forEach(point => movePoint(newImageData, point, 0, -faceParams.mouthMovement));
                face.mouth.slice(halfMouth).forEach(point => movePoint(newImageData, point, 0, faceParams.mouthMovement));

                // Apply eye transformation
                face.leftEye.forEach(point => movePoint(newImageData, point, faceParams.eyeMovementX, faceParams.eyeMovementY));
                face.rightEye.forEach(point => movePoint(newImageData, point, faceParams.eyeMovementX, faceParams.eyeMovementY));

                // Apply eyebrow transformation
                face.leftEyebrow.forEach(point => movePoint(newImageData, point, 0, -faceParams.eyebrowMovement));
                face.rightEyebrow.forEach(point => movePoint(newImageData, point, 0, -faceParams.eyebrowMovement));
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

function movePoint(imageData, point, dx, dy) {
    const width = imageData.width;
    const oldX = point % width;
    const oldY = Math.floor(point / width);
    const newY = Math.round(oldY + dy);
    const newX = Math.round(oldX + dx);

    if (newX >= 0 && newX < width && newY >= 0 && newY < imageData.height) {
        const oldIndex = (oldY * width + oldX) * 4;
        const newIndex = (newY * width + newX) * 4;

        imageData.data.set(imageData.data.subarray(oldIndex, oldIndex + 4), newIndex);
    }
}