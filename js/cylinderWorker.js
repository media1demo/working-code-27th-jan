function applyCylinderWarp(imageData, selectedRegions, value, width, height) {
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    // Calculate cylinder parameters based on value
    const cylinderRadius = width * (0.5 + value * 0.5);
    const cylinderAngle = Math.PI * (value - 0.5);

    const displacementMap = new Float32Array(width * height * 2);

    selectedRegions.forEach(segment => {
        segment.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);

            // Cylindrical projection
            const normalizedX = (x - width / 2) / width;
            const normalizedY = (y - height / 2) / height;

            const angle = normalizedX * cylinderAngle;
            const projectedX = cylinderRadius * Math.sin(angle);
            const projectedY = normalizedY * height;

            const index = pixelIndex * 2;
            displacementMap[index] = projectedX - (x - width / 2);
            displacementMap[index + 1] = projectedY - (y - height / 2);
        });
    });

    // Apply displacement with bilinear interpolation
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    selectedRegions.forEach(segment => {
        segment.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const index = pixelIndex * 2;
            
            const dx = displacementMap[index];
            const dy = displacementMap[index + 1];
            
            if (dx !== 0 || dy !== 0) {
                const sourceX = x + dx;
                const sourceY = y + dy;
                
                if (sourceX >= 0 && sourceX < width - 1 && 
                    sourceY >= 0 && sourceY < height - 1) {
                    
                    const x1 = Math.floor(sourceX);
                    const y1 = Math.floor(sourceY);
                    const x2 = x1 + 1;
                    const y2 = y1 + 1;
                    
                    const fx = sourceX - x1;
                    const fy = sourceY - y1;
                    
                    const targetIndex = pixelIndex * 4;
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
                        
                        newImageData.data[targetIndex + c] = value;
                    }
                }
            }
        });
    });

    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value } = e.data;
    const width = imageData.width;
    const height = imageData.height;
    
    try {
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyCylinderWarp(imageData, selectedRegions, value || 0.5, width, height);
        } else {
            // If no regions selected, return original image
            resultImageData = imageData;
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