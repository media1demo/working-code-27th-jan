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
        // Find bounds and center of the region
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
        
        // Create set for quick lookup of selected pixels
        const selectedPixels = new Set(region);
        
        // Calculate region dimensions
        const regionWidth = maxX - minX;
        const regionHeight = maxY - minY;
        
        // Create temporary buffer for scaled region
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        const maskBuffer = new Uint8ClampedArray(width * height); // For tracking scaled pixels
        
        // Clear selected region in the destination
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Scale selected pixels relative to center
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Calculate position relative to center
                const relX = x - centerX;
                const relY = y - centerY;
                
                // Calculate source position by inverse scaling
                const srcX = Math.round(centerX + (relX / scaleX));
                const srcY = Math.round(centerY + (relY / scaleY));
                
                if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
                    const srcPixelIndex = srcY * width + srcX;
                    
                    // Check if source pixel is in the selected region
                    if (selectedPixels.has(srcPixelIndex)) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceIndex = srcPixelIndex * 4;
                        
                        // Copy pixel data
                        for (let c = 0; c < 4; c++) {
                            tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                        }
                        maskBuffer[y * width + x] = 1; // Mark as scaled pixel
                    }
                }
            }
        }
        
        // Fill any gaps in the scaled region using nearest neighbor
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        let changed;
        do {
            changed = false;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (maskBuffer[y * width + x] === 0) {
                        // Check if this pixel should be part of the scaled region
                        const relX = (x - centerX) / scaleX;
                        const relY = (y - centerY) / scaleY;
                        const originalX = Math.round(centerX + relX);
                        const originalY = Math.round(centerY + relY);
                        const originalIndex = originalY * width + originalX;
                        
                        if (selectedPixels.has(originalIndex)) {
                            // Find nearest filled neighbor
                            for (const [dx, dy] of directions) {
                                const nx = x + dx;
                                const ny = y + dy;
                                if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                                    maskBuffer[ny * width + nx] === 1) {
                                    const targetIndex = (y * width + x) * 4;
                                    const sourceIndex = (ny * width + nx) * 4;
                                    for (let c = 0; c < 4; c++) {
                                        tempBuffer[targetIndex + c] = tempBuffer[sourceIndex + c];
                                    }
                                    maskBuffer[y * width + x] = 1;
                                    changed = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        } while (changed);
        
        // Blend scaled pixels back
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (maskBuffer[i/4] === 1) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

// Worker message handler remains the same
self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const scaleX = value || 1;
        const scaleY = value2 || value || 1;
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
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