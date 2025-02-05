self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    console.log("111111111");
    try {
        const intensity = value || 0.5;
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Create a new ImageData with same dimensions as input
            const tempImageData = new ImageData(
                new Uint8ClampedArray(imageData.width * imageData.height * 4),
                imageData.width,
                imageData.height
            );
            
            // Copy only selected regions to temp ImageData
            for (const region of selectedRegions) {
                for (const pixel of region) {
                    const x = pixel % imageData.width;
                    const y = Math.floor(pixel / imageData.width);
                    const i = (y * imageData.width + x) * 4;
                    
                    tempImageData.data[i] = imageData.data[i];
                    tempImageData.data[i + 1] = imageData.data[i + 1];
                    tempImageData.data[i + 2] = imageData.data[i + 2];
                    tempImageData.data[i + 3] = imageData.data[i + 3];
                }
            }
            
            resultImageData = applyEnhanced3DEffect(tempImageData, intensity);
            
            // Copy back only the modified regions to original image
            const finalImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            
            for (const region of selectedRegions) {
                for (const pixel of region) {
                    const x = pixel % imageData.width;
                    const y = Math.floor(pixel / imageData.width);
                    const i = (y * imageData.width + x) * 4;
                    
                    finalImageData.data[i] = resultImageData.data[i];
                    finalImageData.data[i + 1] = resultImageData.data[i + 1];
                    finalImageData.data[i + 2] = resultImageData.data[i + 2];
                    finalImageData.data[i + 3] = resultImageData.data[i + 3];
                }
            }
            
            resultImageData = finalImageData;
        } else {
            // If no regions selected, apply to entire image
            resultImageData = applyEnhanced3DEffect(imageData, intensity);
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

function applyEnhanced3DEffect(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const result = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
    
    // Create a simple depth map based on y-position
    const depthMap = createSimpleDepthMap(height);
    
    // Define the maximum pixel shift
    const maxShift = Math.floor(width * 0.1 * intensity); // 10% of width, adjusted by intensity
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            
            // Get depth value
            const depth = depthMap[y];
            
            // Calculate shift based on depth
            const shift = Math.floor(depth * maxShift);
            
            // Apply horizontal and vertical shift
            const newX = Math.min(width - 1, x + shift);
            const newY = Math.min(height - 1, y + Math.floor(shift / 2));
            
            // Copy pixel data to new position
            const newI = (newY * width + newX) * 4;
            result.data[newI] = imageData.data[i];
            result.data[newI + 1] = imageData.data[i + 1];
            result.data[newI + 2] = imageData.data[i + 2];
            result.data[newI + 3] = imageData.data[i + 3];
        }
    }
    
    // Fill in gaps
    fillGaps(result);
    
    return result;
}

function createSimpleDepthMap(height) {
    const depthMap = new Float32Array(height);
    for (let y = 0; y < height; y++) {
        // Create a gradient where lower pixels are "closer"
        depthMap[y] = 1 - (y / height);
    }
    return depthMap;
}

function fillGaps(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            if (imageData.data[i + 3] === 0) { // If pixel is transparent
                let filledPixel = false;
                // Check surrounding pixels
                for (let dy = -1; dy <= 1 && !filledPixel; dy++) {
                    for (let dx = -1; dx <= 1 && !filledPixel; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const ni = (ny * width + nx) * 4;
                            if (imageData.data[ni + 3] !== 0) {
                                // Copy non-transparent pixel
                                imageData.data[i] = imageData.data[ni];
                                imageData.data[i + 1] = imageData.data[ni + 1];
                                imageData.data[i + 2] = imageData.data[ni + 2];
                                imageData.data[i + 3] = imageData.data[ni + 3];
                                filledPixel = true;
                            }
                        }
                    }
                }
            }
        }
    }
}