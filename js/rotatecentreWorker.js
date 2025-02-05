const DEFAULT_CYCLE_LENGTH = 8;
const DEFAULT_ROTATION_AMPLITUDE = Math.PI / 4; // 45 degrees
console.log("object");
let currentIteration = 0;
console.log("object");
function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function rotatePoint(x, y, centerX, centerY, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = cos * (x - centerX) - sin * (y - centerY) + centerX;
    const ny = sin * (x - centerX) + cos * (y - centerY) + centerY;
    return { x: nx, y: ny };
}

function applyRotateCentreEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1; 
    const rotationAmplitude = DEFAULT_ROTATION_AMPLITUDE;

    // Calculate rotation angle
    const rotationAngle = rotationAmplitude * Math.sin(phase * Math.PI * 2);

    // Copy original image data
    newImageData.data.set(imageData.data);

    // Process each region
    selectedRegions.forEach(region => {
        const regionSet = new Set(region);

        // Find region center
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Process pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;

                if (regionSet.has(pixelIndex)) {
                    // Rotate the point around the center
                    const rotatedPoint = rotatePoint(x, y, centerX, centerY, rotationAngle);
                    
                    const sourceX = Math.floor(rotatedPoint.x);
                    const sourceY = Math.floor(rotatedPoint.y);

                    // Ensure source coordinates are within bounds
                    if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                        const sourceIndex = sourceY * width + sourceX;

                        if (regionSet.has(sourceIndex)) {
                            const targetIndex = pixelIndex * 4;
                            const sourceDataIndex = sourceIndex * 4;

                            // Copy pixel data
                            for (let i = 0; i < 4; i++) {
                                newImageData.data[targetIndex + i] = imageData.data[sourceDataIndex + i];
                            }
                        }
                    }
                }
            }
        }
    });

    return newImageData;
}

self.onmessage = function(e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            rotationAmplitude = DEFAULT_ROTATION_AMPLITUDE
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyRotateCentreEffect(imageData, selectedRegions, value);
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

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);

    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack
        });
    }
};