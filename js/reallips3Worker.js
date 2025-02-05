console.log("object");

function applyLipEffect(imageData, selectedRegions, strength, radius) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Calculate region bounds
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
        const regionHeight = maxY - minY + 1;
        const effectRadius = radius || regionHeight;
        
        // Create displacement map
        const displacementMap = new Float32Array(width * height);
        const effectStrength = (strength - 0.5) * 2; // Convert 0-1 to -1 to 1
        
        // Calculate vertical displacement for lip movement
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const index = y * width + x;
                
                if (distance < effectRadius) {
                    // Create a lip-like movement
                    const verticalPosition = (y - centerY) / (effectRadius);
                    const horizontalFactor = 1 - Math.abs(dx) / (effectRadius);
                    
                    // Different movement for upper and lower parts
                    let displacement;
                    if (y < centerY) {
                        // Upper lip moves up
                        displacement = -verticalPosition * effectStrength * 20 * horizontalFactor;
                    } else {
                        // Lower lip moves down
                        displacement = verticalPosition * effectStrength * 20 * horizontalFactor;
                    }
                    
                    // Smooth falloff at edges
                    const edgeFactor = 1 - (distance / effectRadius);
                    displacement *= edgeFactor;
                    
                    displacementMap[index] = displacement;
                }
            }
        }
        
        // Apply vertical displacement with bilinear interpolation
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const dy = displacementMap[index];
                
                if (dy !== 0) {
                    const sourceY = y + dy;
                    
                    // Skip if outside bounds
                    if (sourceY < 0 || sourceY >= height - 1) {
                        continue;
                    }
                    
                    // Bilinear interpolation (vertical only)
                    const y1 = Math.floor(sourceY);
                    const y2 = y1 + 1;
                    const fy = sourceY - y1;
                    
                    const targetIndex = (y * width + x) * 4;
                    const i1 = (y1 * width + x) * 4;
                    const i2 = (y2 * width + x) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        const value =
                            tempBuffer[i1 + c] * (1 - fy) +
                            tempBuffer[i2 + c] * fy;
                        
                        newImageData.data[targetIndex + c] = value;
                    }
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
            resultImageData = applyLipEffect(imageData, selectedRegions, strength, radius);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyLipEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength, 
                radius || Math.min(imageData.width, imageData.height) / 2
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