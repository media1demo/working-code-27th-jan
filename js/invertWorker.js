// self.onmessage = function(e) {
//     const { imageData, value, index } = e.data;
//     const data = imageData.data;

//     for (let i = 0; i < data.length; i += 4) {
//         data[i] = 255 - data[i];
//         data[i + 1] = 255 - data[i + 1];
//         data[i + 2] = 255 - data[i + 2];
//     }

//     self.postMessage({ imageData, index, value });
// };

self.onmessage = function(e) {
    const { imageData } = e.data;

    console.log("Applying invert effect");

    function createImageBuffer(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
    }

    function invertColors(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            // Invert RGB values
            output.data[i] = 255 - imageData.data[i];     // R
            output.data[i + 1] = 255 - imageData.data[i + 1]; // G
            output.data[i + 2] = 255 - imageData.data[i + 2]; // B
            output.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
        }

        return output;
    }

    try {
        // Apply invert effect
        const inverted = invertColors(imageData);
        console.log("Invert effect completed");

        // Return the result
        self.postMessage({
            segmentedImages: [inverted],
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