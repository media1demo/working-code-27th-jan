self.onmessage = function(e) {
    const { imageData } = e.data;

    console.log("Applying quantization");

    function createImageBuffer(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
    }

    function quantizeColors(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);
        const COLOR_LEVELS = 1;

        for (let i = 0; i < imageData.data.length; i += 4) {
            // Quantize each color channel
            for (let c = 0; c < 3; c++) {
                const value = imageData.data[i + c];
                const quantized = Math.round(value / (255 / COLOR_LEVELS)) * (255 / COLOR_LEVELS);
                output.data[i + c] = quantized;
            }
            output.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
        }

        return output;
    }

    try {
        // Apply quantization
        const quantized = quantizeColors(imageData);
        console.log("Quantization completed");

        // Return the result
        self.postMessage({
            segmentedImages: [quantized],
            isComplete: true
        });

    } catch (error) {
        console.error("Error occurred:", error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};