function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Array to store all scaled versions
    const scaledResults = [];
    
    // Base scale factors for generating multiple versions
    const scaleFactors = [1.2, 1.5, 2.0];  // You can adjust these values
    
    scaleFactors.forEach(factor => {
        // Create a new image data for each scale factor
        const newImageData = new ImageData(
            new Uint8ClampedArray(width * height * 4),
            width,
            height
        );
        
        selectedRegions.forEach(region => {
            // Find bounds of the region
            let minX = width, minY = height, maxX = 0, maxY = 0;
            region.forEach(pixelIndex => {
                const x = pixelIndex % width;
                const y = Math.floor(pixelIndex / width);
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x);
                maxY = Math.max(maxY, y);
            });
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            
            // Apply the current scale factor
            const currentScaleX = scaleX * factor;
            const currentScaleY = scaleY * factor;
            
            // Create a Set for faster lookup of selected pixels
            const selectedPixels = new Set(region);
            
            // Scale the selected region
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const pixelIndex = y * width + x;
                    
                    if (!selectedPixels.has(pixelIndex)) continue;
                    
                    // Calculate relative position from center
                    const relX = x - centerX;
                    const relY = y - centerY;
                    
                    // Apply scaling with current factor
                    const newX = Math.round(centerX + (relX * currentScaleX));
                    const newY = Math.round(centerY + (relY * currentScaleY));
                    
                    // Check bounds
                    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                        const sourceIdx = pixelIndex * 4;
                        const targetIdx = (newY * width + newX) * 4;
                        
                        // Copy pixel data
                        for (let i = 0; i < 4; i++) {
                            newImageData.data[targetIdx + i] = imageData.data[sourceIdx + i];
                        }
                    }
                }
            }
        });
        
        // Add non-selected regions from original image
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (newImageData.data[i + 3] === 0) {  // If pixel is transparent
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = imageData.data[i + c];
                }
            }
        }
        
        scaledResults.push(newImageData);
    });
    
    return scaledResults;
}

// Web Worker message handler
self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        // Calculate base scale values
        const scaleX = Math.max(0.1, Math.min(5, value || 1));
        const scaleY = Math.max(0.1, Math.min(5, value2 || value || 1));
        
        let resultImages;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Get array of scaled versions
            resultImages = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            // If no regions selected, return original image
            resultImages = [new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            )];
        }
        
        self.postMessage({
            segmentedImages: resultImages,
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};