// // // self.onmessage = function(e) {
// // //     const { imageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5, clickedPoints, lines } = e.data;

// // //     // Process the image to close the mouth
// // //     const closedMouthImageData = closeTheMouth(imageData, selectedRegions);

// // //     // Create variations of the closed mouth image
// // //     const variations = createVariations(closedMouthImageData, imageCount, maxBrightness, value1, value2, value3, value4, value5);

// // //     self.postMessage({
// // //         segmentedImages: variations,
// // //         isComplete: true
// // //     });
// // // };

// // // function closeTheMouth(imageData, selectedRegions) {

// // //     const processedImageData = new ImageData(
// // //         new Uint8ClampedArray(imageData.data),
// // //         imageData.width,
// // //         imageData.height
// // //     );

// // //     selectedRegions.forEach(region => {
// // //         region.forEach(pixelIndex => {
// // //             const i = pixelIndex * 4;
// // //             // Darken the selected region to simulate a closed mouth
// // //             processedImageData.data[i] = Math.max(0, processedImageData.data[i] - 50);     // Red
// // //             processedImageData.data[i + 1] = Math.max(0, processedImageData.data[i + 1] - 50); // Green
// // //             processedImageData.data[i + 2] = Math.max(0, processedImageData.data[i + 2] - 50); // Blue
// // //         });
// // //     });

// // //     return processedImageData;
// // // }

// // // function createVariations(imageData, count, maxBrightness, value1, value2, value3, value4, value5) {
// // //     const variations = [];

// // //     for (let i = 0; i < count; i++) {
// // //         // Create a copy of the image data for each variation
// // //         const variationData = new ImageData(
// // //             new Uint8ClampedArray(imageData.data),
// // //             imageData.width,
// // //             imageData.height
// // //         );

// // //         // Apply some variations (this is a simple example; you can make this more complex)
// // //         const brightnessChange = (Math.random() * 2 - 1) * maxBrightness;
        
// // //         for (let j = 0; j < variationData.data.length; j += 4) {
// // //             variationData.data[j] = Math.max(0, Math.min(255, variationData.data[j] + brightnessChange));
// // //             variationData.data[j + 1] = Math.max(0, Math.min(255, variationData.data[j + 1] + brightnessChange));
// // //             variationData.data[j + 2] = Math.max(0, Math.min(255, variationData.data[j + 2] + brightnessChange));
// // //         }

// // //         variations.push(variationData);
// // //     }

// // //     return variations;
// // // }

// // // Worker script (e.g., worker.js)

// // self.onmessage = function(e) {
// //     const { 
// //         imageData, 
// //         selectedRegions, 
// //         imageCount = 10, // Default number of variations
// //         maxBrightness = 50, // Maximum brightness change for variations
// //         value1, value2, value3, value4, value5 // Additional parameters for variations (if needed)
// //     } = e.data;

// //     try {
// //         // Process the image to close the mouth
// //         const closedMouthImageData = closeTheMouth(imageData, selectedRegions);

// //         // Create variations of the closed mouth image
// //         const variations = createVariations(closedMouthImageData, imageCount, maxBrightness, value1, value2, value3, value4, value5);

// //         // Send the variations back to the main thread
// //         self.postMessage({
// //             segmentedImages: variations,
// //             isComplete: true
// //         });
// //     } catch (error) {
// //         self.postMessage({
// //             error: error.message,
// //             isComplete: true
// //         });
// //     }
// // };

// // function closeTheMouth(imageData, selectedRegions) {
// //     // Create a copy of the image data to avoid modifying the original
// //     const processedImageData = new ImageData(
// //         new Uint8ClampedArray(imageData.data),
// //         imageData.width,
// //         imageData.height
// //     );

// //     // Iterate over the selected regions
// //     selectedRegions.forEach(region => {
// //         region.forEach(pixelIndex => {
// //             const i = pixelIndex * 4; // Each pixel has 4 values (R, G, B, A)
// //             // Darken the pixel by reducing its RGB values
// //             processedImageData.data[i] = Math.max(0, processedImageData.data[i] - 50);     // Red
// //             processedImageData.data[i + 1] = Math.max(0, processedImageData.data[i + 1] - 50); // Green
// //             processedImageData.data[i + 2] = Math.max(0, processedImageData.data[i + 2] - 50); // Blue
// //         });
// //     });

// //     return processedImageData;
// // }
 
// // /**
// //  * Creates multiple variations of the image by applying random brightness changes.
// //  * @param {ImageData} imageData - The processed image data (closed mouth image).
// //  * @param {number} count - The number of variations to create.
// //  * @param {number} maxBrightness - The maximum brightness change to apply.
// //  * @param {*} value1 - Placeholder for additional customization (not used in this example).
// //  * @param {*} value2 - Placeholder for additional customization (not used in this example).
// //  * @param {*} value3 - Placeholder for additional customization (not used in this example).
// //  * @param {*} value4 - Placeholder for additional customization (not used in this example).
// //  * @param {*} value5 - Placeholder for additional customization (not used in this example).
// //  * @returns {Array<ImageData>} - An array of variations of the image.
// //  */
// // function createVariations(imageData, count, maxBrightness, value1, value2, value3, value4, value5) {
// //     const variations = [];

// //     for (let i = 0; i < count; i++) {
// //         // Create a copy of the image data for each variation
// //         const variationData = new ImageData(
// //             new Uint8ClampedArray(imageData.data),
// //             imageData.width,
// //             imageData.height
// //         );

// //         // Apply random brightness changes to create variations
// //         const brightnessChange = (Math.random() * 2 - 1) * maxBrightness;
        
// //         for (let j = 0; j < variationData.data.length; j += 4) {
// //             // Adjust the RGB values of each pixel
// //             variationData.data[j] = Math.max(0, Math.min(255, variationData.data[j] + brightnessChange));     // Red
// //             variationData.data[j + 1] = Math.max(0, Math.min(255, variationData.data[j + 1] + brightnessChange)); // Green
// //             variationData.data[j + 2] = Math.max(0, Math.min(255, variationData.data[j + 2] + brightnessChange)); // Blue
// //         }

// //         variations.push(variationData);
// //     }

// //     return variations;
// // }

// // Worker script (e.g., worker.js)

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         imageCount = 10, // Default number of variations
//         maxBrightness = 50, // Maximum brightness change for variations
//         value1, value2, value3, value4, value5 // Additional parameters for variations (if needed)
//     } = e.data;

//     try {
//         // Process the image to close the mouth
//         const closedMouthImageData = closeTheMouth(imageData, selectedRegions);

//         // Create variations of the closed mouth image
//         const variations = createVariations(closedMouthImageData, selectedRegions, imageCount, maxBrightness, value1, value2, value3, value4, value5);

//         // Send the variations back to the main thread
//         self.postMessage({
//             segmentedImages: variations,
//             isComplete: true
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// /**
//  * Darkens the selected regions of the image to simulate a closed mouth.
//  * @param {ImageData} imageData - The original image data.
//  * @param {Array<Array<number>>} selectedRegions - An array of regions (arrays of pixel indices) to darken.
//  * @returns {ImageData} - The processed image data with the selected regions darkened.
//  */
// function closeTheMouth(imageData, selectedRegions) {
//     // Create a copy of the image data to avoid modifying the original
//     const processedImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         imageData.width,
//         imageData.height
//     );

//     // Iterate over the selected regions
//     selectedRegions.forEach(region => {
//         region.forEach(pixelIndex => {
//             const i = pixelIndex * 4; // Each pixel has 4 values (R, G, B, A)
//             // Darken the pixel by reducing its RGB values
//             processedImageData.data[i] = Math.max(0, processedImageData.data[i] - 50);     // Red
//             processedImageData.data[i + 1] = Math.max(0, processedImageData.data[i + 1] - 50); // Green
//             processedImageData.data[i + 2] = Math.max(0, processedImageData.data[i + 2] - 50); // Blue
//         });
//     });

//     return processedImageData;
// }

// /**
//  * Creates multiple variations of the image by applying random brightness changes to the selected regions.
//  * @param {ImageData} imageData - The processed image data (closed mouth image).
//  * @param {Array<Array<number>>} selectedRegions - An array of regions (arrays of pixel indices) to apply variations.
//  * @param {number} count - The number of variations to create.
//  * @param {number} maxBrightness - The maximum brightness change to apply.
//  * @param {*} value1 - Placeholder for additional customization (not used in this example).
//  * @param {*} value2 - Placeholder for additional customization (not used in this example).
//  * @param {*} value3 - Placeholder for additional customization (not used in this example).
//  * @param {*} value4 - Placeholder for additional customization (not used in this example).
//  * @param {*} value5 - Placeholder for additional customization (not used in this example).
//  * @returns {Array<ImageData>} - An array of variations of the image.
//  */
// function createVariations(imageData, selectedRegions, count, maxBrightness, value1, value2, value3, value4, value5) {
//     const variations = [];

//     for (let i = 0; i < count; i++) {
//         // Create a copy of the image data for each variation
//         const variationData = new ImageData(
//             new Uint8ClampedArray(imageData.data),
//             imageData.width,
//             imageData.height
//         );

//         // Apply random brightness changes to the selected regions
//         const brightnessChange = (Math.random() * 2 - 1) * maxBrightness;

//         // Flatten the selected regions into a single Set for faster lookup
//         const selectedPixels = new Set(selectedRegions.flat());

//         for (let pixelIndex of selectedPixels) {
//             const i = pixelIndex * 4; // Each pixel has 4 values (R, G, B, A)
//             // Adjust the RGB values of the pixel
//             variationData.data[i] = Math.max(0, Math.min(255, variationData.data[i] + brightnessChange));     // Red
//             variationData.data[i + 1] = Math.max(0, Math.min(255, variationData.data[i + 1] + brightnessChange)); // Green
//             variationData.data[i + 2] = Math.max(0, Math.min(255, variationData.data[i + 2] + brightnessChange)); // Blue
//         }

//         variations.push(variationData);
//     }

//     return variations;
// }

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        imageCount = 10, // Default number of variations
        maxMovement = 10 // Maximum movement distance for variations
    } = e.data;

    try {
        // Create variations of the image by moving the selected regions
        const variations = createVariations(imageData, selectedRegions, imageCount, maxMovement);

        // Send the variations back to the main thread
        self.postMessage({
            segmentedImages: variations,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

/**
 * Creates multiple variations of the image by moving the selected regions.
 * @param {ImageData} imageData - The original image data.
 * @param {Array<Array<number>>} selectedRegions - An array of regions (arrays of pixel indices) to move.
 * @param {number} count - The number of variations to create.
 * @param {number} maxMovement - The maximum movement distance for variations.
 * @returns {Array<ImageData>} - An array of variations of the image.
 */
function createVariations(imageData, selectedRegions, count, maxMovement) {
    const variations = [];
    const width = imageData.width;
    const height = imageData.height;

    for (let i = 0; i < count; i++) {
        // Create a copy of the image data for each variation
        const variationData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        );

        // Flatten the selected regions into a single Set for faster lookup
        const selectedPixels = new Set(selectedRegions.flat());

        // Calculate random movement for this variation
        const moveX = (Math.random() * 2 - 1) * maxMovement; // Random horizontal movement
        const moveY = (Math.random() * 2 - 1) * maxMovement; // Random vertical movement

        // Iterate over the selected pixels and move them
        for (let pixelIndex of selectedPixels) {
            const x = pixelIndex % width; // Original X position
            const y = Math.floor(pixelIndex / width); // Original Y position

            // Calculate new position
            const newX = Math.max(0, Math.min(width - 1, x + moveX)); // Clamp to image bounds
            const newY = Math.max(0, Math.min(height - 1, y + moveY)); // Clamp to image bounds

            // Get the color of the original pixel
            const originalColor = [
                imageData.data[pixelIndex * 4],     // Red
                imageData.data[pixelIndex * 4 + 1], // Green
                imageData.data[pixelIndex * 4 + 2], // Blue
                imageData.data[pixelIndex * 4 + 3]  // Alpha
            ];

            // Set the color at the new position
            const newPixelIndex = Math.round(newY) * width + Math.round(newX);
            for (let c = 0; c < 4; c++) {
                variationData.data[newPixelIndex * 4 + c] = originalColor[c];
            }
        }

        variations.push(variationData);
    }

    return variations;
}