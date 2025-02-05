console.log("object");

function applyLipMovementEffect(imageData, selectedRegions, strength, time) {
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
        const displacementMap = new Float32Array(width * height);
        const effectStrength = strength * 15; // Amplify the effect
        
        // Calculate lip movement displacement
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = Math.min(regionWidth, regionHeight) / 2;
                
                if (distance < maxDistance) {
                    // Create wave-like movement based on horizontal position and time
                    const xFactor = (x - minX) / regionWidth;
                    const wave = Math.sin(xFactor * Math.PI * 2 + time * 10) * 
                                Math.sin(time * 15); // Add temporal variation
                    
                    // Add vertical position influence
                    const yFactor = Math.abs(y - centerY) / (regionHeight / 2);
                    const verticalInfluence = Math.max(0, 1 - yFactor * 2);
                    
                    // Calculate final displacement
                    const displacement = wave * verticalInfluence * effectStrength;
                    displacementMap[y * width + x] = displacement;
                }
            }
        }
        
        // Apply displacement with bilinear interpolation
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const displacement = displacementMap[y * width + x];
                
                if (displacement !== 0) {
                    const sourceY = y + displacement;
                    
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
    const { imageData, selectedRegions, value, time } = e.data;
    
    try {
        const strength = value || 0.5; // 0 to 1
        // Use time parameter for animation
        const currentTime = (time || 0) / 1000; // Convert to seconds
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyLipMovementEffect(imageData, selectedRegions, strength, currentTime);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyLipMovementEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength,
                currentTime
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