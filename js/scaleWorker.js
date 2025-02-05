function scaleImageData(imageData, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    const destWidth = Math.floor(width * scaleX);
    const destHeight = Math.floor(height * scaleY);
    
    const scaledImageData = new ImageData(
        new Uint8ClampedArray(destWidth * destHeight * 4),
        destWidth,
        destHeight
    );
    
    for (let y = 0; y < destHeight; y++) {
        for (let x = 0; x < destWidth; x++) {
            const srcX = Math.min(Math.floor(x / scaleX), width - 1);
            const srcY = Math.min(Math.floor(y / scaleY), height - 1);
            
            // Calculate indices
            const destIdx = (y * destWidth + x) * 4;
            const srcIdx = (srcY * width + srcX) * 4;
            
            // Copy color data
            scaledImageData.data[destIdx] = imageData.data[srcIdx];
            scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
        }
    }

    return scaledImageData;
}

function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    
    // Create new image data with original dimensions
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Find center point of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        
        // Create temporary buffer for scaled region
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region in the destination
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Scale selected pixels relative to center
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate position relative to center
            const relX = x - centerX;
            const relY = y - centerY;
            
            // Apply scaling relative to center
            const newX = Math.min(Math.max(Math.round(centerX + (relX * scaleX)), 0), width - 1);
            const newY = Math.min(Math.max(Math.round(centerY + (relY * scaleY)), 0), height - 1);
            
            if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend scaled pixels back
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {  // If pixel is not fully transparent
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const scaleX = value || 1;
        const scaleY = value2 || value || 1;
        
        let resultImageData;
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            // Full image mode
            resultImageData = scaleImageData(imageData, scaleX, scaleY);
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