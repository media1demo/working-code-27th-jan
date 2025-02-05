
const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function applyExtendEffect(imageData, value, selectedRegions = null) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);

    const processPixel = (x, y) => {
        const dx = x - centerX;
        const extendedX = centerX + dx * (1 + value);

        if (extendedX >= 0 && extendedX < width) {
            const sourceIndex = (y * width + Math.round(extendedX)) * 4;
            const targetIndex = (y * width + x) * 4;
            
            for (let i = 0; i < 4; i++) {
                newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
            }
        }
    };

    if (selectedRegions?.length) {
        const pixelSet = new Set(selectedRegions.flat());
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixelSet.has(y * width + x)) {
                    processPixel(x, y);
                }
            }
        }
    } else {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                processPixel(x, y);
            }
        }
    }

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;
    
    try {
        if (reset) currentIteration = 0;
        const resultImageData = applyExtendEffect(imageData, value, selectedRegions);
        currentIteration = (currentIteration + 1) % iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress: currentIteration / iterations
        });
    } catch (error) {
        self.postMessage({ error: error.message, isComplete: true });
    }
};