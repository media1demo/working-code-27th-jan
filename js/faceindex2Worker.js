self.onmessage = function(e) {
    const {
        imageData,
        faceRegions,
        imageCount,
        mouthOpenness,
        eyeMovement,
        eyebrowRaise
    } = e.data;

    if (!imageData || !faceRegions || !Array.isArray(faceRegions)) {
        self.postMessage({
            error: "Invalid or missing imageData or faceRegions",
            receivedData: JSON.stringify(e.data),
            isComplete: true
        });
        return;
    }

    try {
        const transformedFaces = processFaces(imageData, faceRegions, imageCount, {
            mouthOpenness: mouthOpenness || 0.5,
            eyeMovement: eyeMovement || 0.3,
            eyebrowRaise: eyebrowRaise || 0.2
        });

        self.postMessage({
            transformedFaces: transformedFaces,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: "Error processing faces: " + error.message,
            stack: error.stack,
            isComplete: true
        });
    }
};

function processFaces(imageData, faceRegions, imageCount, params) {
    const transformedFaces = [];
    const iterationsPerFrame = 30;

    for (let i = 0; i < imageCount; i++) {
        const baseProgress = i / (imageCount - 1);
        for (let j = 0; j < iterationsPerFrame; j++) {
            const subProgress = j / iterationsPerFrame;
            const progress = easeInOutSine(baseProgress + subProgress / imageCount);
            const newImageData = createTransformedFace(imageData, faceRegions, progress, params);
            transformedFaces.push(newImageData);
        }
    }
    return transformedFaces;
}



function createTransformedFace(imageData, faceRegions, progress, params) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    if (!Array.isArray(faceRegions)) {
        console.error("faceRegions is not an array:", faceRegions);
        return newImageData;
    }

    faceRegions.forEach((face, index) => {
        if (!face) {
            console.error(`Face at index ${index} is undefined`);
            return;
        }
        const faceParams = calculateFaceTransformParams(face, progress, params);
        applyFaceTransformation(newImageData, face, faceParams);
    });

    return newImageData;
}


function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}


function calculateFaceTransformParams(face, progress, params) {
    return {
        mouthMovement: Math.sin(progress * Math.PI * 2) * params.mouthOpenness,
        eyeMovementX: Math.sin(progress * Math.PI * 2) * params.eyeMovement,
        eyeMovementY: Math.cos(progress * Math.PI * 2) * params.eyeMovement,
        eyebrowMovement: Math.sin(progress * Math.PI * 2) * params.eyebrowRaise
    };
}

function applyFaceTransformation(imageData, face, params) {
    moveMouth(imageData, face.mouth, params.mouthMovement);
    moveEyes(imageData, face.leftEye, face.rightEye, params.eyeMovementX, params.eyeMovementY);
    moveEyebrows(imageData, face.leftEyebrow, face.rightEyebrow, params.eyebrowMovement);
}

function moveMouth(imageData, mouthPoints, movement) {
    const upperLip = mouthPoints.slice(0, mouthPoints.length / 2);
    const lowerLip = mouthPoints.slice(mouthPoints.length / 2);

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

        for (let i = 0; i < 4; i++) {
            imageData.data[newIndex + i] = imageData.data[oldIndex + i];
        }
    }
}