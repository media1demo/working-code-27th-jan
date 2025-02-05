self.onmessage = function(e) {
    const { imageData, selectedRegions, value1 } = e.data;
    const chunkSize = 5000;
    let processedPixels = 0;
    const data = new Uint8ClampedArray(imageData.data);  // Create a copy
    const width = imageData.width;
    const height = imageData.height;

    console.log('Worker received image data. Size:', data.length);
    console.log('Image dimensions:', width, 'x', height);

    function processChunk() {
        const endPixel = Math.min(processedPixels + chunkSize, selectedRegions[0].length);
        for (let i = processedPixels; i < endPixel; i++) {
            const pixelIndex = selectedRegions[0][i];
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            sharpenPixel(data, width, height, x, y, value1);
        }
        processedPixels = endPixel;

        if (processedPixels < selectedRegions[0].length) {
            self.postMessage({ progress: processedPixels / selectedRegions[0].length });
            setTimeout(processChunk, 0);
        } else {
            const resultImageData = new ImageData(data, width, height);
            console.log('Worker processed image data. Size:', resultImageData.data.length);
            console.log('First 10 pixels after processing:', Array.from(resultImageData.data.slice(0, 40)));

            self.postMessage({ segmentedImages: [resultImageData], effect: 'Sharpen' });
        }
    }

    processChunk();
};

function sharpenPixel(data, width, height, x, y, intensity) {
    const idx = (y * width + x) * 4;
    for (let i = 0; i < 3; i++) {
        const current = data[idx + i];
        const neighbors = (
            data[((y) * width + Math.max(0, x - 1)) * 4 + i] +
            data[((y) * width + Math.min(width - 1, x + 1)) * 4 + i] +
            data[((Math.max(0, y - 1)) * width + x) * 4 + i] +
            data[((Math.min(height - 1, y + 1)) * width + x) * 4 + i]
        ) * 0.25;
        data[idx + i] = Math.max(0, Math.min(255, current + (current - neighbors) * (intensity * 0.02)));
    }
}