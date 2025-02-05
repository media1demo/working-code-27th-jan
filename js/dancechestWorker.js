// Placeholder for dancechestWorker.js

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const newImageData = new ImageData(width, height);

//     // Unpack the input value (assuming it's a single number between 0 and 1)
//     const t = value;

//     // Animation parameters
//     const cycleLength = 10; // Number of frames in the run cycle
//     const phase = (t * cycleLength) % 1; // Current phase of the run cycle
//     const forwardLean = 0.1 + 0.05 * Math.sin(phase * Math.PI * 2); // Leaning forward effect
//     const verticalStretch = 1 + 0.2 * Math.sin(phase * Math.PI * 4); // Stretching up and down
//     const horizontalStretch = 1 + 0.1 * Math.sin(phase * Math.PI * 2); // Stretching left and right

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             // Normalize coordinates
//             let nx = (x / width) - 0.5;
//             let ny = (y / height) - 0.5;

//             // Apply deformations
//             nx *= horizontalStretch;
//             ny *= verticalStretch;

//             // Apply forward lean
//             nx += ny * forwardLean;

//             // Apply running motion
//             nx += 0.1 * Math.sin(ny * Math.PI * 2 + phase * Math.PI * 2);
//             ny += 0.05 * Math.sin(nx * Math.PI * 4 + phase * Math.PI * 4);

//             // Convert back to pixel coordinates
//             let sourceX = (nx + 0.5) * width;
//             let sourceY = (ny + 0.5) * height;

//             // Ensure sourceX and sourceY are within bounds
//             sourceX = Math.max(0, Math.min(width - 1, sourceX));
//             sourceY = Math.max(0, Math.min(height - 1, sourceY));

//             const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
//             const targetIndex = (y * width + x) * 4;

//             // Copy pixel data
//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }
//     }

//     self.postMessage({ imageData: newImageData });
// };


const DEFAULT_CYCLE_LENGTH = 1; // Number of frames in the walking cycle
const DEFAULT_STEP_HEIGHT = 10; // Amplitude of the step height effect
const DEFAULT_ARM_SWING = 5; // Amplitude of the arm swing effect

let currentIteration = 0;

// Create a transparent ImageData object
function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

// Calculate the bounds of a region
function getBounds(region, width) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    for (let i = 0; i < region.length; i++) {
        const x = region[i] % width;
        const y = Math.floor(region[i] / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }

    return { minX, maxX, minY, maxY };
}

// Apply walking motion effects to the image
function applyWalkingEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // Animation parameters
    const cycleLength = 10; // Number of frames in the run cycle
    const phase = (t * cycleLength) % 1; // Current phase of the run cycle
    const forwardLean = 0.1 + 0.05 * Math.sin(phase * Math.PI * 2); // Leaning forward effect
    const verticalStretch = 1 + 0.2 * Math.sin(phase * Math.PI * 4); // Stretching up and down
    const horizontalStretch = 1 + 0.1 * Math.sin(phase * Math.PI * 2); // Stretching left and right

    // Copy original image data
    newImageData.data.set(imageData.data);

    // Process each region iteratively
    for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
        const region = selectedRegions[regionIndex];
        const regionSet = new Set(region);

        // Get bounds for current region
        const { minX, maxX, minY, maxY } = getBounds(region, width);

        // Calculate expanded bounds to allow for walking effects
        const padding = Math.ceil(Math.max(width, height) * (DEFAULT_STEP_HEIGHT + DEFAULT_ARM_SWING) / height);

        const expandedMinX = Math.max(0, minX - padding);
        const expandedMaxX = Math.min(width - 1, maxX + padding);
        const expandedMinY = Math.max(0, minY - padding);
        const expandedMaxY = Math.min(height - 1, maxY + padding);

        // Clear the original region in the destination
        for (let i = 0; i < region.length; i++) {
            const baseIndex = region[i] * 4;
            newImageData.data[baseIndex] = 0;
            newImageData.data[baseIndex + 1] = 0;
            newImageData.data[baseIndex + 2] = 0;
            newImageData.data[baseIndex + 3] = 0;
        }

        // Process expanded area for walking effects
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Normalize coordinates
                let nx = (x / width) - 0.5;
                let ny = (y / height) - 0.5;

                // Apply deformations (running motion logic)
                nx *= horizontalStretch;
                ny *= verticalStretch;

                // Apply forward lean
                nx += ny * forwardLean;

                // Apply running motion
                nx += 0.1 * Math.sin(ny * Math.PI * 2 + phase * Math.PI * 2);
                ny += 0.05 * Math.sin(nx * Math.PI * 4 + phase * Math.PI * 4);

                // Convert back to pixel coordinates
                let sourceX = (nx + 0.5) * width;
                let sourceY = (ny + 0.5) * height;

                // Ensure sourceX and sourceY are within bounds
                sourceX = Math.max(0, Math.min(width - 1, sourceX));
                sourceY = Math.max(0, Math.min(height - 1, sourceY));

                // Check if the source pixel is in bounds
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const sourcePixelX = Math.floor(sourceX);
                    const sourcePixelY = Math.floor(sourceY);
                    const sourceIndex = sourcePixelY * width + sourcePixelX;

                    // Only copy if source pixel was in the original region
                    if (regionSet.has(sourceIndex)) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceDataIndex = sourceIndex * 4;

                        // Copy pixel data
                        newImageData.data[targetIndex] = imageData.data[sourceDataIndex];
                        newImageData.data[targetIndex + 1] = imageData.data[sourceDataIndex + 1];
                        newImageData.data[targetIndex + 2] = imageData.data[sourceDataIndex + 2];
                        newImageData.data[targetIndex + 3] = imageData.data[sourceDataIndex + 3];
                    }
                }
            }
        }
    }

    return newImageData;
}

// Handle messages from the main thread
self.onmessage = function (e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            stepHeight = DEFAULT_STEP_HEIGHT,
            armSwing = DEFAULT_ARM_SWING,
        } = e.data;

        // Reset the iteration counter if requested
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        // Apply effects if regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyWalkingEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            // Return the original image data if no regions are selected
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }

        // Send the result back to the main thread
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
        // Handle errors and send them back to the main thread
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack,
        });
    }
};