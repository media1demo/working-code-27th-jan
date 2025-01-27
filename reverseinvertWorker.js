self.onmessage = function(e) {
    const { imageData, value = 20 } = e.data;

    console.log("Applying ink effect");

    function createImageBuffer(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
    }

    function applyGrayscale(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            // Extract RGB values
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            // Calculate grayscale value (average of RGB)
            const gray = Math.round((r + g + b) / 3);

            // Set grayscale value to all RGB channels
            output.data[i] = gray;     // R
            output.data[i + 1] = gray; // G
            output.data[i + 2] = gray; // B
            output.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
        }

        return output;
    }

    function applySobelOperator(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const output = createImageBuffer(width, height);
        const EDGE_THRESHOLD = value * 100;

        // Sobel kernels for edge detection
        const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let pixelX = 0;
                let pixelY = 0;

                // Apply kernels
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4;
                        const kernelIdx = (ky + 1) * 3 + (kx + 1);

                        // Convert to grayscale and apply kernel
                        const gray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
                        pixelX += gray * kernelX[kernelIdx];
                        pixelY += gray * kernelY[kernelIdx];
                    }
                }

                // Calculate edge magnitude
                const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
                const idx = (y * width + x) * 4;

                // Apply threshold for edge detection
                const isEdge = magnitude > EDGE_THRESHOLD;
                output.data[idx] = isEdge ? 0 : 255;     // R
                output.data[idx + 1] = isEdge ? 0 : 255; // G
                output.data[idx + 2] = isEdge ? 0 : 255; // B
                output.data[idx + 3] = 255;              // A
            }
        }

        return output;
    }

    function invertImage(imageData) {
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
        // Step 1: Convert image to grayscale
        const grayscale = applyGrayscale(imageData);
        console.log("Grayscale conversion completed");

        // Step 2: Detect edges
        const edges = applySobelOperator(grayscale);
        console.log("Edge detection completed");

        // Step 3: Invert edges to create ink effect
        const inkEffect = invertImage(edges);
        console.log("Ink effect completed");

        // Return the result
        self.postMessage({
            segmentedImages: [inkEffect],
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