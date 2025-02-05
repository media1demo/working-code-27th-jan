function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
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
        
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        
        // Calculate region dimensions
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        
        // Create buffer for initial region-sized image
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // First pass: Copy region pixels to temp buffer
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 4; c++) {
                tempBuffer[idx + c] = imageData.data[idx + c];
            }
        });
        
        // Create final buffer
        const finalBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // Function to interpolate between four pixels
        function interpolatePixel(x, y, x1, y1, x2, y2) {
            const fx = x - x1;
            const fy = y - y1;
            
            const idx11 = (Math.floor(y1) * width + Math.floor(x1)) * 4;
            const idx12 = (Math.floor(y1) * width + Math.min(Math.floor(x2), width - 1)) * 4;
            const idx21 = (Math.min(Math.floor(y2), height - 1) * width + Math.floor(x1)) * 4;
            const idx22 = (Math.min(Math.floor(y2), height - 1) * width + Math.min(Math.floor(x2), width - 1)) * 4;
            
            const result = new Uint8ClampedArray(4);
            
            // Bilinear interpolation for each channel
            for (let c = 0; c < 4; c++) {
                const val11 = tempBuffer[idx11 + c];
                const val12 = tempBuffer[idx12 + c];
                const val21 = tempBuffer[idx21 + c];
                const val22 = tempBuffer[idx22 + c];
                
                // Only interpolate if all source pixels have data
                if (c === 3 && (val11 === 0 || val12 === 0 || val21 === 0 || val22 === 0)) {
                    result[c] = 0;
                } else {
                    const top = val11 * (1 - fx) + val12 * fx;
                    const bottom = val21 * (1 - fx) + val22 * fx;
                    result[c] = Math.round(top * (1 - fy) + bottom * fy);
                }
            }
            
            return result;
        }
        
        // Second pass: Apply gravity bounce effect
        const expandedMinX = Math.max(0, minX - Math.floor(regionWidth * 0.5));
        const expandedMaxX = Math.min(width - 1, maxX + Math.floor(regionWidth * 0.5));
        const expandedMinY = Math.max(0, minY - Math.floor(regionHeight * 0.5));
        const expandedMaxY = Math.min(height - 1, maxY + Math.floor(regionHeight * 0.5));
        
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Calculate position relative to center
                const relX = x - centerX;
                const relY = y - centerY;
                
                // Calculate distance from center
                const distance = Math.sqrt(relX * relX + relY * relY);
                
                // Calculate bounce effect (parabolic transformation)
                const bounceFactor = Math.sin(distance / (regionWidth / 2) * Math.PI);
                
                // Calculate source position (inverse transformation)
                const srcX = centerX + relX * (1 + bounceFactor * scaleX);
                const srcY = centerY + relY * (1 + bounceFactor * scaleY);
                
                // Skip if outside the image bounds
                if (srcX < minX || srcX > maxX || srcY < minY || srcY > maxY) continue;
                
                // Get interpolated pixel value
                const x1 = Math.floor(srcX);
                const y1 = Math.floor(srcY);
                const x2 = Math.ceil(srcX);
                const y2 = Math.ceil(srcY);
                
                const interpolated = interpolatePixel(srcX, srcY, x1, y1, x2, y2);
                
                // Write interpolated pixel to final buffer
                const targetIdx = (y * width + x) * 4;
                for (let c = 0; c < 4; c++) {
                    finalBuffer[targetIdx + c] = interpolated[c];
                }
            }
        }
        
        // Clear original region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Blend final result
        for (let i = 0; i < finalBuffer.length; i += 4) {
            if (finalBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = finalBuffer[i + c];
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
            
            const destIdx = (y * destWidth + x) * 4;
            const srcIdx = (srcY * width + srcX) * 4;
            
            scaledImageData.data[destIdx] = imageData.data[srcIdx];
            scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
        }
    }

    return scaledImageData;
}