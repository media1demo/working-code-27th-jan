const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function transformImage(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;

    // Extract transformation matrix values from the `value` array
    const [topLeft, topRight, bottomLeft, bottomRight] = value;

    // Create a temporary canvas to hold the original image data
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Create a new canvas to apply the transformation
    const ctx = new OffscreenCanvas(width, height).getContext('2d');

    // Apply the transformation
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.clip();

    // Apply the transformation matrix
    ctx.transform(
        topLeft, 0, // Horizontal scaling and skewing
        0, topRight, // Vertical scaling and skewing
        bottomLeft, bottomRight // Translation
    );

    // Draw the transformed image
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();

    // Get the transformed image data
    const newImageData = ctx.getImageData(0, 0, width, height);

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = [1, 1, 0, 0], value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;

        const resultImageData = transformImage(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({ 
            error: error.message, 
            isComplete: true 
        });
    }
};