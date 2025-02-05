function applyDepthMapEffect(imageData, selectedRegions, intensity = 1.0, threshold = 128) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            
            // Calculate grayscale value using luminance formula
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const a = imageData.data[idx + 3];
            
            // Using standard luminance weights
            const grayscale = Math.round(
                0.299 * r + 0.587 * g + 0.114 * b
            );
            
            // Apply intensity adjustment and threshold
            let depthValue = grayscale;
            if (intensity !== 1.0) {
                depthValue = Math.round(
                    threshold + (grayscale - threshold) * intensity
                );
            }
            
            // Ensure values stay within valid range
            depthValue = Math.max(0, Math.min(255, depthValue));
            
            // Set all RGB channels to the depth value to create grayscale
            newImageData.data[idx] = depthValue;
            newImageData.data[idx + 1] = depthValue;
            newImageData.data[idx + 2] = depthValue;
            newImageData.data[idx + 3] = a; // Preserve alpha channel
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const intensity = value || 1.0; // Default intensity
        const threshold = value2 || 128; // Default threshold
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyDepthMapEffect(
                imageData, 
                selectedRegions, 
                intensity, 
                threshold
            );
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyDepthMapEffect(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]],
                intensity,
                threshold
            );
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};