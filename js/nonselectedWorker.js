
self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    // console.log("object");
    // Create a new ImageData object to store the result
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    // Create a set of selected pixel indices for faster lookup
    const selectedPixels = new Set(selectedRegions.flat());

    // Iterate through all pixels
    for (let i = 0; i < imageData.data.length; i += 4) {
        const pixelIndex = i / 4;
        
        if (selectedPixels.has(pixelIndex)) {
            // If the pixel is in the selected region, make it transparent or apply some effect
            resultImageData.data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
        // Pixels not in the selected region remain unchanged
    }

    // Send the processed image data back to the main thread
    self.postMessage({ 
        segmentedImages: [resultImageData],
        isComplete: true
    });
};
