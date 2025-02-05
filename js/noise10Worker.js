self.onmessage = function(e) {
    const { imageData, selectedRegions } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const totalIterations = 10;
    let allSegmentedImages = [];
    console.log(totalIterations);

    for (let i = 0; i < totalIterations; i++) {
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
        
        // Calculate noise intensity based on the current iteration
        const noiseIntensity = (255 / totalIterations) * i;
        
        if (i === 0) {
            console.log(`Initial noise intensity: ${noiseIntensity}`);
        }
        if (i === totalIterations - 1) {
            console.log(`Final noise intensity: ${noiseIntensity}`);
        }
        
        applyNoiseEffect(imageData, newImageData, noiseIntensity, selectedRegions, width, height);
        
        allSegmentedImages.push(newImageData);
        
        if (i % 30 === 0) {
            self.postMessage({
                progress: (i / totalIterations) * 100,
                segmentedImages: allSegmentedImages
            });
            allSegmentedImages = []; // Clear the array to save memory
        }
    }
    
    // Send the final batch of processed images back to the main thread
    self.postMessage({ segmentedImages: allSegmentedImages, isComplete: true });
};

function applyNoiseEffect(sourceImageData, targetImageData, noiseIntensity, selectedRegions, width, height) {
    // Create a Set for faster lookup of selected pixels
    const selectedPixels = new Set(selectedRegions.flat());

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            
            // Only process pixels in the selected region
            if (selectedPixels.has(y * width + x)) {
                const [r, g, b] = [
                    sourceImageData.data[index],
                    sourceImageData.data[index + 1],
                    sourceImageData.data[index + 2]
                ];
                
                // Apply noise effect
                const noise = Math.random() * noiseIntensity - noiseIntensity / 2;
                
                targetImageData.data[index] = Math.max(0, Math.min(255, r + noise));
                targetImageData.data[index + 1] = Math.max(0, Math.min(255, g + noise));
                targetImageData.data[index + 2] = Math.max(0, Math.min(255, b + noise));
                targetImageData.data[index + 3] = sourceImageData.data[index + 3]; // Keep alpha unchanged
            } else {
                // For unselected regions, copy the original pixel
                targetImageData.data[index] = sourceImageData.data[index];
                targetImageData.data[index + 1] = sourceImageData.data[index + 1];
                targetImageData.data[index + 2] = sourceImageData.data[index + 2];
                targetImageData.data[index + 3] = sourceImageData.data[index + 3];
            }
        }
    }
}