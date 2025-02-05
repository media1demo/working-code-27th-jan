// Horizontal Squeeze Effect
function applyHorizontalSqueezeEffect(imageData, selectedRegions, squeezeValue) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    // Squeeze factor for x-direction
    const squeezeFactor = 1 / (1 + (squeezeValue - 0.5));
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        selectedRegions.forEach(region => {
            // Find region bounds
            let minX = imageData.width, maxX = 0;
            let minY = imageData.height, maxY = 0;
            
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
            
            const width = maxX - minX + 1;
            const newWidth = width * squeezeFactor;
            const offsetX = (width - newWidth) / 2;
            
            resultCtx.clearRect(0, 0, imageData.width, imageData.height);
            resultCtx.drawImage(canvas, 
                minX, minY, width, maxY - minY + 1,
                minX + offsetX, minY, newWidth, maxY - minY + 1
            );
            
            const newRegionData = resultCtx.getImageData(0, 0, imageData.width, imageData.height);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const i = (y * imageData.width + x) * 4;
                    if (newRegionData.data[i + 3] > 0) {
                        for (let c = 0; c < 4; c++) {
                            resultImageData.data[i + c] = newRegionData.data[i + c];
                        }
                    }
                }
            }
        });
    }
    
    return resultImageData;
}

// Radial Squeeze Effect
function applyRadialSqueezeEffect(imageData, selectedRegions, squeezeValue) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    const squeezeFactor = 1 - squeezeValue;
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        selectedRegions.forEach(region => {
            // Find region center
            let centerX = 0, centerY = 0;
            let minX = imageData.width, maxX = 0;
            let minY = imageData.height, maxY = 0;
            
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                centerX += x;
                centerY += y;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
            
            centerX /= region.length;
            centerY /= region.length;
            
            resultCtx.clearRect(0, 0, imageData.width, imageData.height);
            
            // Draw image with radial squeeze
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                
                // Calculate distance from center
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Scale based on distance from center
                const scale = 1 - (distance * squeezeFactor / Math.max(imageData.width, imageData.height));
                
                const newX = centerX + dx * scale;
                const newY = centerY + dy * scale;
                
                // Copy pixel with scaling
                if (newX >= 0 && newX < imageData.width && newY >= 0 && newY < imageData.height) {
                    const sourceIdx = (y * imageData.width + x) * 4;
                    const destIdx = (Math.floor(newY) * imageData.width + Math.floor(newX)) * 4;
                    
                    for (let c = 0; c < 4; c++) {
                        resultImageData.data[destIdx + c] = imageData.data[sourceIdx + c];
                    }
                }
            });
        });
    }
    
    return resultImageData;
}

// Update worker to support multiple squeeze types
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_SQUEEZE_VALUE,
        squeezeType = 'vertical', // Add type selection
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        switch(squeezeType) {
            case 'horizontal':
                resultImageData = applyHorizontalSqueezeEffect(imageData, selectedRegions, value);
                break;
            case 'radial':
                resultImageData = applyRadialSqueezeEffect(imageData, selectedRegions, value);
                break;
            default:
                resultImageData = applySqueezeEffect(imageData, selectedRegions, value);
        }
        
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};