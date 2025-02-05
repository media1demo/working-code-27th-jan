
const DEFAULT_CYCLE_LENGTH = 0.5;

const poses = [
    { leftLeg: 30, rightLeg: -30, leftArm: -45, rightArm: 45 },
    { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 },
    { leftLeg: -30, rightLeg: 30, leftArm: 45, rightArm: -45 },
    { leftLeg: 0, rightLeg: 0, leftArm: 0, rightArm: 0 }
];

let currentIteration = 0;

function applyRunningEffect(imageData, selectedRegions, value) {
    // Create canvas for selected region only
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    
    // Create result canvas with original image
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    resultCtx.putImageData(imageData, 0, 0);

    // Create temporary canvas for transformations
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');

    // Extract only selected regions
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

    // Put selected pixels into canvas
    ctx.putImageData(new ImageData(selectedPixels, imageData.width, imageData.height), 0, 0);

    // Get current pose
    const poseIndex = Math.floor(value * poses.length) % poses.length;
    const currentPose = poses[poseIndex];

    // Apply the running pose
    tempCtx.save();
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);

    // Draw body
    tempCtx.drawImage(canvas, 
        0, 0, imageData.width, imageData.height * 0.6,
        -imageData.width / 2, -imageData.height / 2, 
        imageData.width, imageData.height * 0.6
    );

    // Draw legs
    tempCtx.save();
    tempCtx.rotate(currentPose.leftLeg * Math.PI / 180);
    tempCtx.drawImage(canvas,
        0, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4,
        -imageData.width / 4, 0, imageData.width / 2, imageData.height * 0.4
    );
    tempCtx.restore();

    tempCtx.save();
    tempCtx.rotate(currentPose.rightLeg * Math.PI / 180);
    tempCtx.drawImage(canvas,
        imageData.width / 2, imageData.height * 0.6, imageData.width / 2, imageData.height * 0.4,
        0, 0, imageData.width / 2, imageData.height * 0.4
    );
    tempCtx.restore();

    // Draw arms
    tempCtx.save();
    tempCtx.rotate(currentPose.leftArm * Math.PI / 180);
    tempCtx.drawImage(canvas,
        0, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2,
        -imageData.width / 4, -imageData.height * 0.2, 
        imageData.width / 2, imageData.height * 0.2
    );
    tempCtx.restore();

    tempCtx.save();
    tempCtx.rotate(currentPose.rightArm * Math.PI / 180);
    tempCtx.drawImage(canvas,
        imageData.width / 2, imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2,
        0, -imageData.height * 0.2, imageData.width / 2, imageData.height * 0.2
    );
    tempCtx.restore();

    tempCtx.restore();

    // Clear the selected regions from the result
    resultCtx.globalCompositeOperation = 'destination-out';
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % imageData.width;
            const y = Math.floor(pixelIndex / imageData.width);
            resultCtx.fillRect(x, y, 1, 1);
        });
    });

    // Add transformed regions back
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