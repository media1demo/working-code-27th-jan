const DEFAULT_CYCLE_LENGTH = 7; // Number of frames in the crawl cycle
const DEFAULT_CRAWL_AMPLITUDE = 10; // Amplitude of the crawl effect (in pixels)

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

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

function applyCrawlEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);

    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1; // Current phase of the crawl cycle
    const crawlAmplitude = DEFAULT_CRAWL_AMPLITUDE; // Amplitude of the crawl effect
    const crawlOffset = Math.round(crawlAmplitude * Math.sin(phase * Math.PI * 2)); // Horizontal shift based on the phase

    // Copy original image data
    newImageData.data.set(imageData.data);

    // Process each region iteratively
    for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
        const region = selectedRegions[regionIndex];
        const regionSet = new Set(region);

        // Get bounds for current region
        const { minX, maxX, minY, maxY } = getBounds(region, width);

        // Calculate expanded bounds to allow for crawl effects
        const padding = Math.abs(crawlAmplitude); // Padding to account for maximum crawl shift

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

        // Process expanded area for crawl effects
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Calculate source pixel coordinates with crawl offset
                let sourceX = x + crawlOffset;
                let sourceY = y;

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

self.onmessage = function(e) {
    try {
        const {
            imageData,
            selectedRegions,
            value,
            reset,
            cycleLength = DEFAULT_CYCLE_LENGTH,
            crawlAmplitude = DEFAULT_CRAWL_AMPLITUDE
        } = e.data;

        if (reset) {
            currentIteration = 0;
        }

        let resultImageData;
        let progress;

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyCrawlEffect(imageData, selectedRegions, value);
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