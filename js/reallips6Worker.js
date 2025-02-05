function applyLipEnhancement(imageData, selectedRegions, strength = 0.5, smoothness = 0.3) {
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
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        
        // Create displacement map
        const displacementMap = new Float32Array(width * height * 2);
        const effectStrength = (strength - 0.5) * 2;
        
        // Calculate displacement for lip enhancement effect
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                const index = (y * width + x) * 2;
                
                // Check if pixel is within the selected region
                if (distanceFromCenter < regionWidth / 2) {
                    // Create a smooth falloff for natural-looking enhancement
                    const falloff = Math.pow(1 - distanceFromCenter / (regionWidth / 2), smoothness);
                    
                    // Calculate vertical displacement for fuller appearance
                    const verticalDisplacement = falloff * effectStrength * 15;
                    
                    // Calculate horizontal displacement for width adjustment
                    const horizontalDisplacement = falloff * effectStrength * 5;
                    
                    // Apply directional vectors based on position relative to center
                    const angle = Math.atan2(dy, dx);
                    displacementMap[index] = Math.cos(angle) * horizontalDisplacement;
                    displacementMap[index + 1] = Math.sin(angle) * verticalDisplacement;
                }
            }
        }
        
        // Apply displacements with bilinear interpolation
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 2;
                const dx = displacementMap[index];
                const dy = displacementMap[index + 1];
                
                if (dx !== 0 || dy !== 0) {
                    const sourceX = x + dx;
                    const sourceY = y + dy;
                    
                    if (sourceX < 0 || sourceX >= width - 1 || 
                        sourceY < 0 || sourceY >= height - 1) {
                        continue;
                    }
                    
                    // Bilinear interpolation for smooth transitions
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;
                    
                    const fx = sourceX - x1;
                    const fy = sourceY - y1;
                    
                    const targetIndex = (y * width + x) * 4;
                    const i11 = (y1 * width + x1) * 4;
                    const i12 = (y1 * width + x2) * 4;
                    const i21 = (y2 * width + x1) * 4;
                    const i22 = (y2 * width + x2) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        const value =
                            tempBuffer[i11 + c] * (1 - fx) * (1 - fy) +
                            tempBuffer[i12 + c] * fx * (1 - fy) +
                            tempBuffer[i21 + c] * (1 - fx) * fy +
                            tempBuffer[i22 + c] * fx * fy;
                        
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
        const strength = value || 0.5; // Controls enhancement intensity
        const smoothness = value2 || 0.3; // Controls transition smoothness
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyLipEnhancement(imageData, selectedRegions, strength, smoothness);
        } else {
            resultImageData = applyLipEnhancement(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength, 
                smoothness
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