function applyColorHalftoneEffect(imageData, selectedRegions, dotSize, angle) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Convert angle to radians
    const angleRad = (angle % 360) * (Math.PI / 180);
    
    // Precompute rotation matrix
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Rotate the pixel coordinates
            const rotatedX = x * cosAngle - y * sinAngle;
            const rotatedY = x * sinAngle + y * cosAngle;
            
            // Calculate the halftone dot position
            const dotX = Math.floor(rotatedX / dotSize) * dotSize;
            const dotY = Math.floor(rotatedY / dotSize) * dotSize;
            
            // Calculate the distance from the center of the dot
            const dx = rotatedX - (dotX + dotSize / 2);
            const dy = rotatedY - (dotY + dotSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize distance to dot size
            const normalizedDistance = distance / (dotSize / 2);
            
            // Get the original pixel color
            const idx = pixelIndex * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const a = imageData.data[idx + 3];
            
            // Calculate the halftone effect for each channel
            const halftoneR = (normalizedDistance < (r / 255)) ? 255 : 0;
            const halftoneG = (normalizedDistance < (g / 255)) ? 255 : 0;
            const halftoneB = (normalizedDistance < (b / 255)) ? 255 : 0;
            
            // Apply the halftone effect to the new image data
            newImageData.data[idx] = halftoneR;
            newImageData.data[idx + 1] = halftoneG;
            newImageData.data[idx + 2] = halftoneB;
            newImageData.data[idx + 3] = a; // Preserve alpha channel
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const dotSize = value || 8; // Default dot size
        const angle = value2 || 45; // Default angle
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyColorHalftoneEffect(imageData, selectedRegions, dotSize, angle);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyColorHalftoneEffect(imageData, 
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