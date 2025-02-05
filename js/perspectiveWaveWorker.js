// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const waveAmplitude = value * 20; // 0 to 20
//     const waveFrequency = value * 10; // 0 to 10
    
//     const width = imageData.width;
//     const height = imageData.height;
//     const newImageData = new ImageData(width, height);
    
//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             const distortionX = Math.sin(y / height * Math.PI * waveFrequency) * waveAmplitude;
//             const sourceX = Math.floor(x + distortionX);
            
//             if (sourceX >= 0 && sourceX < width) {
//                 const sourceIndex = (y * width + sourceX) * 4;
//                 const targetIndex = (y * width + x) * 4;
                
//                 for (let i = 0; i < 4; i++) {
//                     newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//                 }
//             }
//         }
//     }
    
//     self.postMessage({ imageData: newImageData });
// };

const DEFAULT_ITERATIONS = 120;
let currentIteration = 0;

function waveDistortion(imageData, value, selectedRegions) {
    const width = imageData.width;
    const height = imageData.height;
    const pixels = imageData.data;
    const newImageData = new ImageData(new Uint8ClampedArray(pixels), width, height);

    if (!selectedRegions?.length) {
        return newImageData;
    }

    const waveAmplitude = value * 20; // 0 to 20
    const waveFrequency = value * 10; // 0 to 10

    selectedRegions.forEach(region => {
        if (!region.length) return;

        // Find bounds of region
        let minX = width, maxX = 0, minY = height, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });

        const regionSet = new Set(region);

        // Process only pixels within the region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!regionSet.has(pixelIndex)) continue;

                // Apply wave distortion
                const distortionX = Math.sin(y / height * Math.PI * waveFrequency) * waveAmplitude;
                const sourceX = Math.floor(x + distortionX);

                if (sourceX >= 0 && sourceX < width) {
                    const sourceIndex = (y * width + sourceX) * 4;
                    const targetIndex = (y * width + x) * 4;

                    for (let i = 0; i < 4; i++) {
                        newImageData.data[targetIndex + i] = pixels[sourceIndex + i];
                    }
                }
            }
        }
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value = 0.5, value5: iterations = DEFAULT_ITERATIONS, reset } = e.data;

    try {
        if (reset) currentIteration = 0;

        const resultImageData = waveDistortion(imageData, value, selectedRegions);
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