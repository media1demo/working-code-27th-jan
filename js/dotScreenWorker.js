function applyDotScreenEffect(imageData, selectedRegions, dotSize = 8, angle = 45) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Convert angle to radians
    const angleRad = (angle % 360) * (Math.PI / 180);
    
    // Precompute trig values
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Get original pixel values
            const idx = pixelIndex * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const a = imageData.data[idx + 3];
            
            // Calculate grayscale using luminance weights
            const intensity = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            
            // Transform coordinates for rotation
            const rotatedX = x * cosAngle - y * sinAngle;
            const rotatedY = x * sinAngle + y * cosAngle;
            
            // Calculate dot position
            const dotX = rotatedX - Math.floor(rotatedX / dotSize) * dotSize;
            const dotY = rotatedY - Math.floor(rotatedY / dotSize) * dotSize;
            
            // Calculate distance from dot center
            const dx = dotX - dotSize / 2;
            const dy = dotY - dotSize / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate dot threshold based on intensity
            const maxDistance = Math.sqrt(2) * (dotSize / 2);
            const threshold = (intensity / 255) * maxDistance;
            
            // Set pixel value based on distance comparison
            const dotValue = distance < threshold ? 0 : 255;
            
            // Apply to all channels
            newImageData.data[idx] = dotValue;
            newImageData.data[idx + 1] = dotValue;
            newImageData.data[idx + 2] = dotValue;
            newImageData.data[idx + 3] = a; // Preserve alpha
        });
    });
    
    return newImageData;
}

// Web worker message handler
self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const dotSize = value || 8; // Default dot size
        const angle = value2 || 45; // Default angle
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyDotScreenEffect(
                imageData,
                selectedRegions,
                dotSize,
                angle
            );
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyDotScreenEffect(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]],
                dotSize,
                angle
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