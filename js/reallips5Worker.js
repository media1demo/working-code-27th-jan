console.log("object");
function applyHorizontalEffect(imageData, selectedRegions, strength, radius) {
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
        const effectRadius = radius || regionWidth / 3;
        
        // Create displacement map
        const displacementMap = new Float32Array(width * height * 2); // Store both x and y displacement
        const effectStrength = (strength - 0.5) * 2; // Convert 0-1 to -1 to 1
        
        // Calculate displacement for horizontal line effect
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const horizontalDistance = Math.abs(dx);
                const verticalDistance = Math.abs(dy);
                const index = (y * width + x) * 2;
                
                if (horizontalDistance < effectRadius && verticalDistance < effectRadius/4) {
                    // Calculate horizontal effect intensity
                    const horizontalFactor = Math.pow(1 - horizontalDistance / effectRadius, 2);
                    const verticalFactor = Math.pow(1 - verticalDistance / (effectRadius/4), 2);
                    
                    // Combined factor for smooth falloff
                    const factor = horizontalFactor * verticalFactor;
                    
                    // Calculate displacement
                    // For horizontal bulge/shrink along center line
                    const displacement = factor * effectStrength * 20;
                    
                    // Apply displacement vectors
                    // No horizontal displacement
                    displacementMap[index] = 0;
                    // Vertical displacement for bulge/shrink
                    displacementMap[index + 1] = displacement;
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
                    
                    // Skip if outside bounds
                    if (sourceX < 0 || sourceX >= width - 1 || 
                        sourceY < 0 || sourceY >= height - 1) {
                        continue;
                    }
                    
                    // Bilinear interpolation
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
        const strength = value || 0.5; // 0 to 1, where 0.5 is neutral
        const radius = value2 || null; // Optional radius override
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyHorizontalEffect(imageData, selectedRegions, strength, radius);
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyHorizontalEffect(imageData, 
                [[...Array(imageData.width * imageData.height).keys()]], 
                strength, 
                radius || Math.min(imageData.width, imageData.height) / 3
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