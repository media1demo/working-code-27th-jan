function applyDrosteEffect(imageData, selectedRegions, iterations = 3, scale = 0.5) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Center coordinates
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Calculate maximum dimensions
    const maxWidth = width / 2;
    const maxHeight = height / 2;
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Convert to relative coordinates from center
            let dx = x - centerX;
            let dy = y - centerY;
            
            // Calculate relative position in terms of maximum dimensions
            let relX = dx / maxWidth;
            let relY = dy / maxHeight;
            
            // Apply logarithmic transformation
            let logScale = Math.log(Math.max(Math.abs(relX), Math.abs(relY))) / Math.log(scale);
            
            // Get the fractional part for recursion
            let fractionalPart = logScale - Math.floor(logScale);
            
            // Scale coordinates
            let scaledX = dx * Math.pow(scale, fractionalPart);
            let scaledY = dy * Math.pow(scale, fractionalPart);
            
            // Add offset based on iteration count
            scaledX += maxWidth * Math.floor(logScale) * (relX > 0 ? 1 : -1);
            scaledY += maxHeight * Math.floor(logScale) * (relY > 0 ? 1 : -1);
            
            // Convert back to image coordinates
            let newX = Math.round(centerX + scaledX);
            let newY = Math.round(centerY + scaledY);
            
            // Ensure coordinates are within bounds
            newX = Math.max(0, Math.min(width - 1, newX));
            newY = Math.max(0, Math.min(height - 1, newY));
            
            // Get source pixel index
            const sourceIdx = (newY * width + newX) * 4;
            const targetIdx = pixelIndex * 4;
            
            // Copy pixel data
            newImageData.data[targetIdx] = imageData.data[sourceIdx];
            newImageData.data[targetIdx + 1] = imageData.data[sourceIdx + 1];
            newImageData.data[targetIdx + 2] = imageData.data[sourceIdx + 2];
            newImageData.data[targetIdx + 3] = imageData.data[sourceIdx + 3];
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const iterations = value || 3; // Default iterations
        const scale = value2 || 0.5;  // Default scale factor
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyDrosteEffect(
                imageData,
                selectedRegions,
                iterations,
                scale
            );
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyDrosteEffect(
                imageData,
                [[...Array(imageData.width * imageData.height).keys()]],
                iterations,
                scale
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