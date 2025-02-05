

function applyBulgeEffect(imageData, selectedRegions, strength, radius) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Find center of the region
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
        const bulgeRadius = radius || Math.max(regionWidth, regionHeight) / 2;
        
        // Create temporary buffer
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // Copy region pixels to temp buffer
        region.forEach(pixelIndex => {
            const idx = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                tempBuffer[idx + c] = imageData.data[idx + c];
            }
        });
        
        // Calculate effective strength (-1 to 1 range)
        const effectiveStrength = strength * 2 - 1;
        
        function interpolatePixel(x, y, x1, y1, x2, y2) {
            const fx = x - x1;
            const fy = y - y1;
            
            const idx11 = (Math.floor(y1) * width + Math.floor(x1)) * 4;
            const idx12 = (Math.floor(y1) * width + Math.min(Math.floor(x2), width - 1)) * 4;
            const idx21 = (Math.min(Math.floor(y2), height - 1) * width + Math.floor(x1)) * 4;
            const idx22 = (Math.min(Math.floor(y2), height - 1) * width + Math.min(Math.floor(x2), width - 1)) * 4;
            
            const result = new Uint8ClampedArray(4);
            
            for (let c = 0; c < 4; c++) {
                const val11 = tempBuffer[idx11 + c];
                const val12 = tempBuffer[idx12 + c];
                const val21 = tempBuffer[idx21 + c];
                const val22 = tempBuffer[idx22 + c];
                
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
        
        // Apply bulge effect
        const expandedMinX = Math.max(0, minX - Math.floor(regionWidth * 0.5));
        const expandedMaxX = Math.min(width - 1, maxX + Math.floor(regionWidth * 0.5));
        const expandedMinY = Math.max(0, minY - Math.floor(regionHeight * 0.5));
        const expandedMaxY = Math.min(height - 1, maxY + Math.floor(regionHeight * 0.5));
        
        const finalBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Calculate distance from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= bulgeRadius) {
                    // Calculate bulge factor
                    const factor = Math.pow(distance / bulgeRadius, 1 - effectiveStrength);
                    
                    // Calculate source position
                    const angle = Math.atan2(dy, dx);
                    const srcDistance = distance * factor;
                    const srcX = centerX + Math.cos(angle) * srcDistance;
                    const srcY = centerY + Math.sin(angle) * srcDistance;
                    
                    // Skip if outside the image bounds
                    if (srcX < 0 || srcX >= width - 1 || srcY < 0 || srcY >= height - 1) continue;
                    
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
        const strength = value || 0.5; // 0 to 1, where 0.5 is neutral
        const radius = value2 || null; // Optional radius override
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyBulgeEffect(imageData, selectedRegions, strength, radius);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyBulgeEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength, 
                radius || Math.min(imageData.width, imageData.height) / 4
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