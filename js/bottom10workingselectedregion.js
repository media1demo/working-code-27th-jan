let currentIteration = 0;

self.onmessage = function(e) {
    const {
        imageData,
        selectedRegions,
        value2: maxVerticalOffset = 50,
        value5: iterations = 120
    } = e.data;

    const width = imageData.width;
    const height = imageData.height;

    // Create new image data with transparent background
    const newImageData = new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );

    // First, copy the entire source image to the new image
    for (let i = 0; i < imageData.data.length; i++) {
        newImageData.data[i] = imageData.data[i];
    }

    if (selectedRegions?.[0]?.length > 0) {
        selectedRegions.forEach((region) => {
            // Calculate vertical offset
            const verticalOffset = Math.random() * maxVerticalOffset;
            
            // Create a temporary buffer for the moved pixels
            const tempBuffer = new Uint8ClampedArray(width * height * 4);
            
            // Clear the selected region in the new image
            region.forEach(pixelIndex => {
                const baseIndex = pixelIndex * 4;
                for (let c = 0; c < 4; c++) {
                    newImageData.data[baseIndex + c] = 0;
                }
            });

            // Move the pixels downward
            region.forEach(pixelIndex => {
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                const newY = Math.min(height - 1, y + verticalOffset);
                
                // Only move if within bounds
                if (newY >= 0 && newY < height) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (Math.floor(newY) * width + x) * 4;
                    
                    // Copy pixel data from source to new position
                    for (let c = 0; c < 4; c++) {
                        tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                    }
                }
            });

            // Blend the moved pixels into the final image
            for (let i = 0; i < tempBuffer.length; i += 4) {
                if (tempBuffer[i + 3] > 0) { // If pixel is not fully transparent
                    for (let c = 0; c < 4; c++) {
                        newImageData.data[i + c] = tempBuffer[i + c];
                    }
                }
            }
        });
    }

    currentIteration = (currentIteration + 1) % iterations;

    self.postMessage({
        segmentedImages: [newImageData],
        isComplete: true,
        progress: currentIteration / iterations
    });
};