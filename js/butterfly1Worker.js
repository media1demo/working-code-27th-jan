function butterflyEffect(imageData, selectedRegions, intensity, waveScale) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Create new image data and copy all original pixels first
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    // Create a Set of selected pixels for faster lookup
    const selectedPixels = new Set();
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            selectedPixels.add(pixelIndex);
        });
    });
    
    selectedRegions.forEach(region => {
        // Find boundaries of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Calculate center points
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        
        // Create temporary buffer with original image data
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        // Calculate region dimensions
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        
        // Process each pixel in and around the region with larger expansion
        const expandedMinX = Math.max(0, minX - Math.floor(regionWidth * 0.5));
        const expandedMaxX = Math.min(width - 1, maxX + Math.floor(regionWidth * 0.5));
        const expandedMinY = Math.max(0, minY - Math.floor(regionHeight * 0.5));
        const expandedMaxY = Math.min(height - 1, maxY + Math.floor(regionHeight * 0.5));
        
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                const currentPixelIndex = y * width + x;
                const dx = (x - centerX) / regionWidth;
                const dy = (y - centerY) / regionHeight;
                
                const distance = Math.sqrt(dx * dx + dy * dy);
                let angle = Math.atan2(dy, dx);
                
                if (distance > 0.7) continue;
                
                const wingShape = Math.sin(angle * 2) * Math.cos(angle * 3);
                const wavePattern = Math.sin(distance * waveScale * Math.PI * 2);
                
                const displacement = intensity * wingShape * wavePattern * (1 - distance/0.7);
                const liftFactor = Math.sin(angle) * 0.3 * intensity;
                
                const srcX = x + dx * displacement * regionWidth;
                const srcY = y + dy * displacement * regionHeight - liftFactor * regionHeight;
                
                // Check if source position is within the selected region
                const srcPixelIndex = Math.floor(srcY) * width + Math.floor(srcX);
                
                if (selectedPixels.has(srcPixelIndex)) {
                    const targetIdx = (y * width + x) * 4;
                    const srcIdx = srcPixelIndex * 4;
                    
                    // Copy the original color values directly
                    newImageData.data[targetIdx] = tempBuffer[srcIdx];         // Red
                    newImageData.data[targetIdx + 1] = tempBuffer[srcIdx + 1]; // Green
                    newImageData.data[targetIdx + 2] = tempBuffer[srcIdx + 2]; // Blue
                    newImageData.data[targetIdx + 3] = tempBuffer[srcIdx + 3]; // Alpha
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const intensity = value * 0.5;
        const waveScale = (value2 || 0.5) * 10;
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = butterflyEffect(imageData, selectedRegions, intensity, waveScale);
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
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