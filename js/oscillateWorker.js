const DEFAULT_CYCLE_LENGTH = 0.5;

const POSES = [
    { bodyRotation: -5, leftLeg: 45, rightLeg: -30, leftArm: -45, rightArm: 30 },
    { bodyRotation: -2, leftLeg: 30, rightLeg: -45, leftArm: -30, rightArm: 45 },
    { bodyRotation: 0, leftLeg: 0, rightLeg: -60, leftArm: 0, rightArm: 60 },
    { bodyRotation: 2, leftLeg: -30, rightLeg: -45, leftArm: 30, rightArm: 45 },
    { bodyRotation: 5, leftLeg: -45, rightLeg: 30, leftArm: 45, rightArm: -30 }
];

let currentIteration = 0;

function applyRunningEffect(imageData, selectedRegions, t) {
    // Create result canvas with original image
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.putImageData(imageData, 0, 0);

    // Create temporary canvas for selected region
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Calculate current pose
    const poseIndex = Math.floor(t * POSES.length) % POSES.length;
    const currentPose = POSES[poseIndex];

    // Extract only selected regions to a separate canvas
    const regionCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const regionCtx = regionCanvas.getContext('2d');
    regionCtx.putImageData(imageData, 0, 0);

    // Create a mask for non-selected regions
    const selectedPixels = new Uint8ClampedArray(imageData.width * imageData.height * 4);
    selectedPixels.fill(0);
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const i = pixelIndex * 4;
            selectedPixels[i] = imageData.data[i];
            selectedPixels[i + 1] = imageData.data[i + 1];
            selectedPixels[i + 2] = imageData.data[i + 2];
            selectedPixels[i + 3] = imageData.data[i + 3];
        });
    });

    // Put selected pixels into region canvas
    regionCtx.putImageData(new ImageData(selectedPixels, imageData.width, imageData.height), 0, 0);

    // Clear temporary canvas and set up transformation
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.save();
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate(currentPose.bodyRotation * Math.PI / 180);

    // Draw the selected region with transformations
    tempCtx.drawImage(regionCanvas, 
        -imageData.width / 2, -imageData.height / 2, 
        imageData.width, imageData.height
    );

    tempCtx.restore();

    // Clear the selected regions from the result canvas
    resultCtx.globalCompositeOperation = 'destination-out';
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            resultCtx.fillRect(x, y, 1, 1);
        });
    });

    // Add transformed selected regions back
    resultCtx.globalCompositeOperation = 'source-over';
    resultCtx.drawImage(tempCanvas, 0, 0);

    return resultCtx.getImageData(0, 0, imageData.width, imageData.height);
}

self.onmessage = function(e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyRunningEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }

        self.postMessage(
            {
                segmentedImages: [resultImageData],
                isComplete: true,
                iteration: currentIteration,
                progress,
            },
            [resultImageData.data.buffer]
        );
    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack,
        });
    }
};