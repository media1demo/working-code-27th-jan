const DEFAULT_CYCLE_LENGTH = 8;
const DEFAULT_SMALL_PARALLAX_AMPLITUDE = 0.1;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function applySmallLeftParallaxEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1; 
    const parallaxAmplitude = DEFAULT_SMALL_PARALLAX_AMPLITUDE;

    // Small left parallax movement
    const horizontalParallax = -parallaxAmplitude * Math.sin(phase * Math.PI * 2);
    const verticalParallax = 0.05 * Math.cos(phase * Math.PI * 2);

    // Copy original image data
    newImageData.data.set(imageData.data);

    // Process each region
    selectedRegions.forEach(region => {
        const regionSet = new Set(region);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;

                if (regionSet.has(pixelIndex)) {
                    // Convert to normalized space
                    let nx = (x / width) - 0.5;
                    let ny = (y / height) - 0.5;

                    // Apply small left parallax with subtle vertical variation
                    nx += horizontalParallax * (ny + 0.5);
                    ny += verticalParallax * (nx + 0.5);

                    // Convert back to pixel coordinates
                    let sourceX = (nx + 0.5) * width;
                    let sourceY = (ny + 0.5) * height;

                    // Ensure source coordinates are within bounds
                    sourceX = Math.max(0, Math.min(width - 1, sourceX));
                    sourceY = Math.max(0, Math.min(height - 1, sourceY));

                    const sourcePixelX = Math.floor(sourceX);
                    const sourcePixelY = Math.floor(sourceY);
                    const sourceIndex = sourcePixelY * width + sourcePixelX;

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
            parallaxAmplitude = DEFAULT_SMALL_PARALLAX_AMPLITUDE
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applySmallLeftParallaxEffect(imageData, selectedRegions, value);
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