
// Constants
const DEFAULT_SQUEEZE_VALUE = 0.5;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;


function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    console.log("111111111");
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Animation parameters
    const squeezeAmount = 0.7; // How much to squeeze (0 = complete squeeze, 1 = no squeeze)
    const squeezeSpeed = 2; // Speed of the squeeze animation
    const currentTime = (performance.now() % 2000) / 2000; // Normalize time to 0-1

    selectedRegions.forEach(region => {
        // Find boundaries of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        const centerY = Math.floor((minY + maxY) / 2);
        const regionHeight = maxY - minY + 1;

        // Calculate squeeze factor based on time
        const squeezeFactor = calculateSqueezeFactor(currentTime);

        // Create buffer for transformed pixels
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);

        // Transform and copy pixels with squeeze
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Calculate position relative to center
            const relativeY = y - centerY;

            // Apply squeeze transformation
            const newY = centerY + (relativeY * squeezeFactor);

            if (newY >= 0 && newY < height) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (Math.floor(newY) * width + x) * 4;

                // Apply smooth interpolation
                const fy = newY - Math.floor(newY);
                const w1 = 1 - fy;
                const w2 = fy;

                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c] * w1;
                    if (fy > 0 && Math.floor(newY) < height - 1) {
                        tempBuffer[targetIdx + width * 4 + c] += imageData.data[sourceIdx + c] * w2;
                    }
                }
            }
        });

        // Clear original region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });

        // Copy transformed pixels to output
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });

    return newImageData;
}

// Function to calculate squeeze factor based on time
function calculateSqueezeFactor(time) {
    // Create a smooth oscillation between 1 and squeezeAmount
    const squeezeAmount = 0.7; // Minimum scale (maximum squeeze)
    const t = (Math.sin(time * Math.PI * 2) + 1) / 2; // Oscillate between 0 and 1
    return squeezeAmount + (1 - squeezeAmount) * t;
}


function scaleImageData(imageData, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    const destWidth = Math.floor(width * scaleX);
    const destHeight = Math.floor(height * scaleY);

    const scaledImageData = new ImageData(
        new Uint8ClampedArray(destWidth * destHeight * 4),
        destWidth,
        destHeight
    );

    for (let y = 0; y < destHeight; y++) {
        for (let x = 0; x < destWidth; x++) {
            const srcX = Math.min(Math.floor(x / scaleX), width - 1);
            const srcY = Math.min(Math.floor(y / scaleY), height - 1);

            const destIdx = (y * destWidth + x) * 4;
            const srcIdx = (srcY * width + srcX) * 4;

            scaledImageData.data[destIdx] = imageData.data[srcIdx];
            scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
        }
    }

    return scaledImageData;
}


self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;

    try {
        const scaleX = value || 1;
        const scaleY = value2 || value || 1;

        let resultImageData;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            resultImageData = scaleImageData(imageData, scaleX, scaleY);
        }

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};