const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function transformSelectedRegions(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;

    // Create a new ImageData object to store the result
    const newImageData = new ImageData(width, height);

    // Copy the original image data to the new ImageData
    newImageData.data.set(pixels);

    if (!selectedRegions?.length) {
        return newImageData;
    }

    // Ensure `value` is an array
    const transformValues = Array.isArray(value) ? value : [value, value, 0, 0];

    // Extract transformation matrix values from the `transformValues` array
    const [topLeft, topRight, bottomLeft, bottomRight] = transformValues;

    // Create a temporary canvas to hold the original image data
    const tempCanvas = new OffscreenCanvas(width, height);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);

    // Create a new canvas to apply the transformation
    const ctx = new OffscreenCanvas(width, height).getContext('2d');

    selectedRegions.forEach(region => {
        if (!region.length) return;

        // Find bounds of the region
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        // Create a canvas for the selected region
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        const regionCanvas = new OffscreenCanvas(regionWidth, regionHeight);
        const regionCtx = regionCanvas.getContext('2d');

        // Draw the selected region onto the region canvas
        regionCtx.drawImage(
            tempCanvas,
            minX, minY, regionWidth, regionHeight, // Source region
            0, 0, regionWidth, regionHeight // Destination region
        );

        // Apply the transformation to the region canvas
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(minX, minY);
        ctx.lineTo(maxX, minY);
        ctx.lineTo(maxX, maxY);
        ctx.lineTo(minX, maxY);
        ctx.closePath();
        ctx.clip();

        ctx.transform(
            topLeft, 0, // Horizontal scaling and skewing
            0, topRight, // Vertical scaling and skewing
            bottomLeft, bottomRight // Translation
        );

        // Draw the transformed region back onto the main canvas
        ctx.drawImage(regionCanvas, minX, minY);
        ctx.restore();
    });

    // Get the transformed image data
    const transformedImageData = ctx.getImageData(0, 0, width, height);

    // Merge the transformed regions into the newImageData
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;

            // Check if the pixel is in any selected region
            const isInSelectedRegion = selectedRegions.some(region =>
                region.includes(y * width + x)
            );

            if (isInSelectedRegion) {
                // Use the transformed pixel data
                for (let i = 0; i < 4; i++) {
                    newImageData.data[pixelIndex + i] = transformedImageData.data[pixelIndex + i];
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 1, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;

        const resultImageData = transformSelectedRegions(imageData, value, selectedRegions);
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