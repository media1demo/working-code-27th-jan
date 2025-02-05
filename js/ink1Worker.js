// self.onmessage = function(e) {
//     const {
//         imageData,
//         selectedRegions,
//         imageCount,
//         maxBrightness, // This will be repurposed as maxThresholdChange
//         value1,
//         value2,
//         value3,
//         value4,
//         value5,
//         clickedPoints,
//         lines
//     } = e.data;

//     const segmentedImages = [];

//     for (let i = 0; i < imageCount; i++) {
//         // Create a copy of the original image data
//         const newImageData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );

//         // Calculate threshold adjustment for this image
//         const thresholdAdjustment = (i / (imageCount - 1)) * 8 - 4; // Range from -4 to 4

//         // Apply ink effect to selected regions
//         for (const region of selectedRegions) {
//             for (const pixelIndex of region) {
//                 const x = pixelIndex % imageData.width;
//                 const y = Math.floor(pixelIndex / imageData.width);
//                 const index = (y * imageData.width + x) * 4;

//                 const brightness = (newImageData.data[index] + newImageData.data[index + 1] + newImageData.data[index + 2]) / 3;
//                 const threshold = 128 + thresholdAdjustment * 32;
//                 const color = brightness > threshold ? 255 : 0;

//                 newImageData.data[index] = newImageData.data[index + 1] = newImageData.data[index + 2] = color;
//             }
//         }

//         // Apply additional effects based on value1, value2, etc.
//         applyAdditionalEffects(newImageData, value1, value2, value3, value4, value5);

//         segmentedImages.push(newImageData);
//     }

//     // Send the processed images back to the main script
//     self.postMessage({ segmentedImages: segmentedImages });
// };

// function applyAdditionalEffects(imageData, value1, value2, value3, value4, value5) {
//     // This function can be customized to apply additional effects based on the input values
//     // For example, you could use these values to adjust the ink effect further
    
//     const invertColors = value1 > 50; // Invert colors if value1 is greater than 50

//     for (let i = 0; i < imageData.data.length; i += 4) {
//         if (invertColors) {
//             imageData.data[i] = 255 - imageData.data[i];
//             imageData.data[i + 1] = 255 - imageData.data[i + 1];
//             imageData.data[i + 2] = 255 - imageData.data[i + 2];
//         }
//     }

//     // You can add more effects using the other values (value2, value3, etc.)
// }


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