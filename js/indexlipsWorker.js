console.log("object");

function applyLipAnimation(imageData, selectedRegions, value) {
    const width = imageData.width;
    const height = imageData.height;
    console.log("object");
    // Create array to store different variations
    const segmentedImages = selectedRegions.map(() => 
        new ImageData(
            new Uint8ClampedArray(imageData.data),
            width,
            height
        )
    );

    // Define lip shapes with more variations
    const getLipShape = (value, regionIndex) => {
        // Add slight randomization based on regionIndex
        const variance = 0.1 * (regionIndex / selectedRegions.length);
        
        if (value < 0.2) {
            // Closed (M) with variations
            return {
                vertical: 0.6 + variance,
                horizontal: 0.9 + variance
            };
        }
        if (value < 0.4) {
            // Slight open (F) with variations
            return {
                vertical: 0.8 + variance,
                horizontal: 1.1 - variance
            };
        }
        if (value < 0.6) {
            // Wide (E) with variations
            return {
                vertical: 0.9 + variance,
                horizontal: 1.3 + variance * 0.5
            };
        }
        if (value < 0.8) {
            // Round (O) with variations
            return {
                vertical: 1.2 - variance,
                horizontal: 0.7 + variance
            };
        }
        // Open (A) with variations
        return {
            vertical: 1.5 + variance * 0.5,
            horizontal: 0.8 - variance
        };
    };

    selectedRegions.forEach((region, regionIndex) => {
        const currentImageData = segmentedImages[regionIndex];
        
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
        const regionWidth = maxX - minX;
        const regionHeight = maxY - minY;
        
        // Get unique shape for this region
        const shape = getLipShape(value, regionIndex);
        
        // Create displacement map
        const displacementMap = new Float32Array(width * height * 2);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!region.includes(pixelIndex)) continue;

                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = Math.max(regionWidth, regionHeight) / 2;
                const index = (y * width + x) * 2;

                if (distance < maxDistance) {
                    const factor = 1 - (distance / maxDistance);
                    
                    const verticalDisplacement = dy * (shape.vertical - 1) * factor;
                    const horizontalDisplacement = dx * (shape.horizontal - 1) * factor;

                    displacementMap[index] = horizontalDisplacement;
                    displacementMap[index + 1] = verticalDisplacement;
                }
            }
        }

        // Apply displacement with bilinear interpolation
        const tempBuffer = new Uint8ClampedArray(imageData.data);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                if (!region.includes(pixelIndex)) continue;

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
                    
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;
                    
                    const fx = sourceX - x1;
                    const fy = sourceY - y1;
                    
                    const targetIndex = (y * width + x) * 4;
                    const i11 = (y1 * width + x1) * 4;
                    const i12 = (y2 * width + x1) * 4;
                    const i21 = (y1 * width + x2) * 4;
                    const i22 = (y2 * width + x2) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        const value =
                            tempBuffer[i11 + c] * (1 - fx) * (1 - fy) +
                            tempBuffer[i21 + c] * fx * (1 - fy) +
                            tempBuffer[i12 + c] * (1 - fx) * fy +
                            tempBuffer[i22 + c] * fx * fy;
                        
                        currentImageData.data[targetIndex + c] = value;
                    }
                }
            }
        }
    });
    
    return segmentedImages;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value } = e.data;
    
    try {
        // If no regions selected, apply to entire image
        const regions = selectedRegions?.length > 0 ? selectedRegions : 
            [[...Array(imageData.width * imageData.height).keys()]];
            
        const segmentedImages = applyLipAnimation(imageData, regions, value || 0.5);
        console.log(segmentedImages);
        self.postMessage({
            segmentedImages: segmentedImages,
            isComplete: true
        });
    
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};