// self.onmessage = function(e) {
//     const { imageData, value = 20 } = e.data;

//     console.log("Processing started");

//     function createImageBuffer(width, height) {
//         return new ImageData(
//             new Uint8ClampedArray(width * height * 4),
//             width,
//             height
//         );
//     }

//     function applySobelOperator(imageData) {
//         const width = imageData.width;
//         const height = imageData.height;
//         const output = createImageBuffer(width, height);
//         const EDGE_THRESHOLD = value * 100;

//         // Sobel kernels for edge detection
//         const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
//         const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

//         for (let y = 1; y < height - 1; y++) {
//             for (let x = 1; x < width - 1; x++) {
//                 let pixelX = 0;
//                 let pixelY = 0;

//                 // Apply kernels
//                 for (let ky = -1; ky <= 1; ky++) {
//                     for (let kx = -1; kx <= 1; kx++) {
//                         const idx = ((y + ky) * width + (x + kx)) * 4;
//                         const kernelIdx = (ky + 1) * 3 + (kx + 1);

//                         // Convert to grayscale and apply kernel
//                         const gray = (imageData.data[idx] + imageData.data[idx + 1] + imageData.data[idx + 2]) / 3;
//                         pixelX += gray * kernelX[kernelIdx];
//                         pixelY += gray * kernelY[kernelIdx];
//                     }
//                 }

//                 // Calculate edge magnitude
//                 const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
//                 const idx = (y * width + x) * 4;

//                 // Apply threshold for edge detection
//                 const isEdge = magnitude > EDGE_THRESHOLD;
//                 output.data[idx] = isEdge ? 0 : 255;     // R
//                 output.data[idx + 1] = isEdge ? 0 : 255; // G
//                 output.data[idx + 2] = isEdge ? 0 : 255; // B
//                 output.data[idx + 3] = 255;              // A
//             }
//         }

//         return output;
//     }

//     function quantizeColors(imageData) {
//         const width = imageData.width;
//         const height = imageData.height;
//         const output = createImageBuffer(width, height);
//         const COLOR_LEVELS = 1;

//         for (let i = 0; i < imageData.data.length; i += 4) {
//             // Quantize each color channel
//             for (let c = 0; c < 3; c++) {
//                 const value = imageData.data[i + c];
//                 const quantized = Math.round(value / (255 / COLOR_LEVELS)) * (255 / COLOR_LEVELS);
//                 output.data[i + c] = quantized;
//             }
//             output.data[i + 3] = imageData.data[i + 3]; // Keep original alpha
//         }

//         return output;
//     }

//     try {
//         // Step 1: Quantize colors for cartoon-like effect
//         const quantized = quantizeColors(imageData);
//         console.log("Quantization completed");

//         // Step 2: Detect edges
//         const edges = applySobelOperator(imageData);
//         console.log("Edge detection completed");

//         // Step 3: Combine edges with quantized image
//         const result = createImageBuffer(imageData.width, imageData.height);
//         for (let i = 0; i < result.data.length; i += 4) {
//             // If it's an edge pixel, make it black, otherwise use the quantized color
//             if (edges.data[i] === 0) {
//                 result.data[i] = 0;
//                 result.data[i + 1] = 0;
//                 result.data[i + 2] = 0;
//             } else {
//                 result.data[i] = quantized.data[i];
//                 result.data[i + 1] = quantized.data[i + 1];
//                 result.data[i + 2] = quantized.data[i + 2];
//             }
//             result.data[i + 3] = 255;
//         }
//         console.log("Combining completed");

//         // Return only the final combined image
//         self.postMessage({
//             segmentedImages: [result],
//             isComplete: true
//         });
//         console.log("Result sent via postMessage");

//     } catch (error) {
//         console.error("Error occurred:", error);
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

self.onmessage = function(e) {
    const { imageData, value = 20 } = e.data;

    console.log("Applying edge detection");

    function createImageBuffer(width, height) {
        return new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
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

    try {
        // Apply edge detection
        const edges = applySobelOperator(imageData);
        console.log("Edge detection completed");

        // Return the result
        self.postMessage({
            segmentedImages: [edges],
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