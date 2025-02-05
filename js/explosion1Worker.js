const DEFAULT_EXPLOSION_INTENSITY = 15;
const DEFAULT_ITERATIONS = 80;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4).fill(0),
        width,
        height
    );
}

function calculateSelectedRegionCenter(selectedRegions, width) {
    if (!selectedRegions?.length || !selectedRegions[0]?.length) {
        return null;
    }

    let totalX = 0;
    let totalY = 0;
    const pixelSet = new Set(selectedRegions[0]);

    pixelSet.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        totalX += x;
        totalY += y;
    });

    const centerX = totalX / pixelSet.size;
    const centerY = totalY / pixelSet.size;

    return { centerX, centerY };
}

function applyExplosionEffect(imageData, selectedRegions, explosionValue) {
    const { width, height } = imageData;
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Calculate the center of the selected region
    const center = calculateSelectedRegionCenter(selectedRegions, width);
    if (!center) {
        return newImageData; // No selected region, return original image
    }

    const { centerX, centerY } = center;

    // Explosion parameters
    const maxDisplacement = width * explosionValue;
    const maxDistance = Math.max(width, height) / 2;

    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        const pixelSet = new Set(selectedRegions[0]);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;

                // Process only pixels in the selected region
                if (pixelSet.has(pixelIndex)) {
                    // Calculate distance and angle from the center of the selected region
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx);

                    // Normalized distance (0 to 1)
                    const normalizedDistance = Math.min(distance / maxDistance, 1);

                    // Displacement decreases with distance
                    const displacement = maxDisplacement * (1 - normalizedDistance);

                    // New pixel coordinates
                    const newX = Math.floor(x + displacement * Math.cos(angle));
                    const newY = Math.floor(y + displacement * Math.sin(angle));

                    // Boundary check
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        const sourceIndex = (y * width + x) * 4;
                        const targetIndex = (newY * width + newX) * 4;

                        // Fade-out effect based on distance
                        const fadeFactor = 1 - normalizedDistance;

                        // Copy pixel data with fading
                        newImageData.data[targetIndex] =
                            Math.floor(imageData.data[sourceIndex] * fadeFactor);
                        newImageData.data[targetIndex + 1] =
                            Math.floor(imageData.data[sourceIndex + 1] * fadeFactor);
                        newImageData.data[targetIndex + 2] =
                            Math.floor(imageData.data[sourceIndex + 2] * fadeFactor);
                        newImageData.data[targetIndex + 3] =
                            Math.floor(imageData.data[sourceIndex + 3] * fadeFactor);
                    }
                }
            }
        }
    }

    return newImageData;
}

self.onmessage = function (e) {
    const {
        imageData,
        selectedRegions,
        value,
        value5: iterations = DEFAULT_ITERATIONS,
        reset
    } = e.data;

    try {
        if (reset) {
            currentIteration = 0;
        }

        let resultImageData = applyExplosionEffect(imageData, selectedRegions, value);
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;

        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};