
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        imageCount = 10, // Default number of variations
        maxMovement = 10 // Maximum movement distance for variations
    } = e.data;

    try {
        const segmentedImages = [];

        // Create variations by moving the selected regions
        for (let i = 0; i < imageCount; i++) {
            const progress = i / (imageCount - 1); // Progress from 0 to 1
            const movedImage = moveSelectedRegions(imageData, selectedRegions, progress, maxMovement);
            segmentedImages.push(movedImage);
        }

        // Send the segmented images back to the main thread
        self.postMessage({ 
            segmentedImages, 
            isComplete: true 
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function moveSelectedRegions(imageData, selectedRegions, progress, maxMovement) {
    // Create a copy of the image data
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );

    // Flatten the selected regions into a single Set for faster lookup
    const selectedPixels = new Set(selectedRegions.flat());

    // Calculate movement based on progress
    const moveX = maxMovement * Math.sin(progress * Math.PI * 2); // Horizontal movement (sine wave)
    const moveY = maxMovement * Math.cos(progress * Math.PI * 2); // Vertical movement (cosine wave)

    // Iterate over the selected pixels and move them
    for (let pixelIndex of selectedPixels) {
        const x = pixelIndex % imageData.width; // Original X position
        const y = Math.floor(pixelIndex / imageData.width); // Original Y position

        // Calculate new position
        const newX = Math.max(0, Math.min(imageData.width - 1, x + moveX)); // Clamp to image bounds
        const newY = Math.max(0, Math.min(imageData.height - 1, y + moveY)); // Clamp to image bounds

        // Get the color of the original pixel
        const originalColor = [
            imageData.data[pixelIndex * 4],     // Red
            imageData.data[pixelIndex * 4 + 1], // Green
            imageData.data[pixelIndex * 4 + 2], // Blue
            imageData.data[pixelIndex * 4 + 3]  // Alpha
        ];

        // Set the color at the new position
        const newPixelIndex = Math.round(newY) * imageData.width + Math.round(newX);
        for (let c = 0; c < 4; c++) {
            newImageData.data[newPixelIndex * 4 + c] = originalColor[c];
        }
    }

    return newImageData;
}