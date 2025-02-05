// self.onmessage = function(e) {
//     const { imageData, gridSize } = e.data;
//     const segments = segmentImage(imageData, gridSize);
//     self.postMessage({ segments: segments });
// };

// function segmentImage(imageData, gridSize) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const segmentWidth = Math.floor(width / gridSize);
//     const segmentHeight = Math.floor(height / gridSize);
//     const segments = [];

//     for (let y = 0; y < gridSize; y++) {
//         for (let x = 0; x < gridSize; x++) {
//             const startX = x * segmentWidth;
//             const startY = y * segmentHeight;
//             const endX = (x === gridSize - 1) ? width : (x + 1) * segmentWidth;
//             const endY = (y === gridSize - 1) ? height : (y + 1) * segmentHeight;
            
//             const segmentData = new ImageData(endX - startX, endY - startY);
            
//             for (let j = startY; j < endY; j++) {
//                 for (let i = startX; i < endX; i++) {
//                     const sourceIndex = (j * width + i) * 4;
//                     const targetIndex = ((j - startY) * segmentData.width + (i - startX)) * 4;
                    
//                     segmentData.data[targetIndex] = imageData.data[sourceIndex];
//                     segmentData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
//                     segmentData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
//                     segmentData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
//                 }
//             }
            
//             segments.push(segmentData);
//         }
//     }

//     return segments;
// }



const DEFAULT_CYCLE_LENGTH = 0.5; // Cycle length for saturation animation
const DEFAULT_SATURATION_INTENSITY = 1.5; // Intensity of saturation change

let currentIteration = 0;

// Convert RGB to grayscale
function rgbToGrayscale(r, g, b) {
    return 0.2989 * r + 0.5870 * g + 0.1140 * b;
}

// Apply saturation effect to an ImageData object
function applySaturationToImageData(imageData, saturationFactor) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert the pixel to grayscale
        const grayscale = rgbToGrayscale(r, g, b);

        // Apply the saturation effect
        data[i] = Math.min(255, Math.max(0, grayscale + saturationFactor * (r - grayscale)));
        data[i + 1] = Math.min(255, Math.max(0, grayscale + saturationFactor * (g - grayscale)));
        data[i + 2] = Math.min(255, Math.max(0, grayscale + saturationFactor * (b - grayscale)));
    }

    return imageData;
}

// Divide the image into segments and apply saturation effect
function applySaturationToSegments(imageData, gridSize, t) {
    const width = imageData.width;
    const height = imageData.height;
    const segmentWidth = Math.floor(width / gridSize);
    const segmentHeight = Math.floor(height / gridSize);
    const segments = [];

    // Calculate the phase of the saturation cycle
    const phase = Math.sin(2 * Math.PI * t);
    const saturationFactor = 1 + (phase * DEFAULT_SATURATION_INTENSITY);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const startX = x * segmentWidth;
            const startY = y * segmentHeight;
            const endX = (x === gridSize - 1) ? width : (x + 1) * segmentWidth;
            const endY = (y === gridSize - 1) ? height : (y + 1) * segmentHeight;

            // Create a new ImageData object for the segment
            const segmentData = new ImageData(endX - startX, endY - startY);

            // Copy pixel data from the original image to the segment
            for (let j = startY; j < endY; j++) {
                for (let i = startX; i < endX; i++) {
                    const sourceIndex = (j * width + i) * 4;
                    const targetIndex = ((j - startY) * segmentData.width + (i - startX)) * 4;

                    segmentData.data[targetIndex] = imageData.data[sourceIndex];
                    segmentData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
                    segmentData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
                    segmentData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
                }
            }

            // Apply saturation effect to the segment
            applySaturationToImageData(segmentData, saturationFactor);

            // Add the segment to the segments array
            segments.push(segmentData);
        }
    }

    return segments;
}


self.onmessage = function (e) {
    try {
        const {
            imageData,
            gridSize,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            saturationIntensity = DEFAULT_SATURATION_INTENSITY,
        } = e.data;

        // Reset the iteration counter if requested
        if (reset) {
            currentIteration = 0;
        }

        let segments;
        let progress;

        // Apply saturation effect to segments
        segments = applySaturationToSegments(imageData, gridSize, value);
        currentIteration = (currentIteration + 1) % cycleLength;
        progress = currentIteration / cycleLength;

        // Send the result back to the main thread
        self.postMessage(
            {
                segments,
                isComplete: true,
                iteration: currentIteration,
                progress,
            },
            segments.map(segment => segment.data.buffer) // Transfer image buffers
        );
    } catch (error) {
        // Handle errors and send them back to the main thread
        self.postMessage({
            error: `Saturation effect error: ${error.message}`,
            isComplete: true,
            stack: error.stack,
        });
    }
};