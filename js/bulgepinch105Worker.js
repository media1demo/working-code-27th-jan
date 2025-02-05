function bulgePinchEffect(imageData, selectedRegions, strength, radius) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Find center of the region
        let centerX = 0, centerY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            centerX += x;
            centerY += y;
        });
        centerX = Math.floor(centerX / region.length);
        centerY = Math.floor(centerY / region.length);
        
        // Create temporary buffer
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // Copy original pixels to temp buffer
        region.forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                tempBuffer[idx + c] = imageData.data[idx + c];
            }
        });
        
        // Calculate maximum radius for effect
        const maxRadius = Math.max(
            Math.sqrt(region.length / Math.PI) * radius,
            1
        );
        
        // Process each pixel in and around the region
        for (let y = Math.max(0, centerY - maxRadius); y < Math.min(height, centerY + maxRadius); y++) {
            for (let x = Math.max(0, centerX - maxRadius); x < Math.min(width, centerX + maxRadius); x++) {
                // Calculate distance from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= maxRadius) {
                    // Calculate displacement based on distance
                    const normalizedDist = distance / maxRadius;
                    const displacement = strength * (1 - Math.pow(normalizedDist, 2));
                    
                    // Calculate source position
                    let srcX, srcY;
                    if (strength >= 0) { // Bulge
                        srcX = centerX + dx * (1 - displacement);
                        srcY = centerY + dy * (1 - displacement);
                    } else { // Pinch
                        srcX = centerX + dx * (1 + Math.abs(displacement));
                        srcY = centerY + dy * (1 + Math.abs(displacement));
                    }
                    
                    // Ensure source coordinates are within bounds
                    srcX = Math.max(0, Math.min(width - 1, srcX));
                    srcY = Math.max(0, Math.min(height - 1, srcY));
                    
                    // Bilinear interpolation
                    const x1 = Math.floor(srcX);
                    const y1 = Math.floor(srcY);
                    const x2 = Math.min(x1 + 1, width - 1);
                    const y2 = Math.min(y1 + 1, height - 1);
                    
                    const fx = srcX - x1;
                    const fy = srcY - y1;
                    
                    const idx11 = (y1 * width + x1) * 4;
                    const idx12 = (y1 * width + x2) * 4;
                    const idx21 = (y2 * width + x1) * 4;
                    const idx22 = (y2 * width + x2) * 4;
                    
                    const targetIdx = (y * width + x) * 4;
                    
                    // Interpolate each color channel
                    for (let c = 0; c < 4; c++) {
                        const val11 = tempBuffer[idx11 + c];
                        const val12 = tempBuffer[idx12 + c];
                        const val21 = tempBuffer[idx21 + c];
                        const val22 = tempBuffer[idx22 + c];
                        
                        if (c === 3 && (val11 === 0 || val12 === 0 || val21 === 0 || val22 === 0)) {
                            newImageData.data[targetIdx + c] = 0;
                        } else {
                            const top = val11 * (1 - fx) + val12 * fx;
                            const bottom = val21 * (1 - fx) + val22 * fx;
                            newImageData.data[targetIdx + c] = Math.round(top * (1 - fy) + bottom * fy);
                        }
                    }
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value } = e.data;
    
    try {
        // value ranges from -1 (max pinch) to 1 (max bulge)
        const strength = value * 2; // Scale to get stronger effect
        const radius = 1.5; // Adjust this to control effect area size
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = bulgePinchEffect(imageData, selectedRegions, strength, radius);
        } else {
            // If no regions selected, return original image
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