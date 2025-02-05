const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function squeezeSelectedRegions(imageData, selectedRegions, t, imageIndex) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    selectedRegions.forEach(region => {
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        // Different squeeze pattern based on imageIndex
        let squashFactor;
        switch(imageIndex) {
            case 0: // Horizontal squeeze
                squashFactor = 0.3 * Math.sin(t * Math.PI * 2);
                break;
            case 1: // Diagonal squeeze
                squashFactor = 0.3 * Math.cos(t * Math.PI * 2);
                break;
            case 2: // Circular squeeze
                squashFactor = 0.3 * Math.sin(t * Math.PI * 4);
                break;
            default:
                squashFactor = 0.3 * Math.sin(t * Math.PI * (2 + imageIndex));
        }

        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const nx = ((x - minX) / (maxX - minX)) - 0.5;
            const ny = ((y - minY) / (maxY - minY)) - 0.5;
            
            let sourceX, sourceY;
            switch(imageIndex) {
                case 0: // Horizontal
                    sourceX = minX + ((nx * (1 + squashFactor) + 0.5) * (maxX - minX));
                    sourceY = y;
                    break;
                case 1: // Diagonal
                    sourceX = minX + ((nx * (1 + squashFactor) + 0.5) * (maxX - minX));
                    sourceY = minY + ((ny * (1 + squashFactor) + 0.5) * (maxY - minY));
                    break;
                case 2: // Circular
                    const angle = Math.atan2(ny, nx);
                    const radius = Math.sqrt(nx * nx + ny * ny) * (1 + squashFactor);
                    sourceX = minX + ((radius * Math.cos(angle) + 0.5) * (maxX - minX));
                    sourceY = minY + ((radius * Math.sin(angle) + 0.5) * (maxY - minY));
                    break;
                default:
                    sourceX = minX + ((nx * (1 + squashFactor) + 0.5) * (maxX - minX));
                    sourceY = minY + ((ny * (1 - squashFactor) + 0.5) * (maxY - minY));
            }

            sourceX = Math.max(minX, Math.min(maxX - 1, sourceX));
            sourceY = Math.max(minY, Math.min(maxY - 1, sourceY));

            const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
            const targetIndex = (y * width + x) * 4;

            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        });
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;

        const t = currentIteration / iterations;
        let resultImageDatas = [];

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Create multiple versions with different squeeze patterns
            for (let i = 0; i < 3; i++) {
                resultImageDatas.push(squeezeSelectedRegions(imageData, selectedRegions, t, i));
            }
            currentIteration = (currentIteration + 1) % iterations;
        } else {
            resultImageDatas.push(new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            ));
        }

        self.postMessage({
            segmentedImages: resultImageDatas,
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};