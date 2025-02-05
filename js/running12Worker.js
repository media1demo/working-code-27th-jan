const DEFAULT_CYCLE_LENGTH = 6;
const DEFAULT_RADIUS = 0.1;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function applyCircularMotion(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1;
    const radius = DEFAULT_RADIUS;
    const angle = phase * Math.PI * 2;
    
    // First copy non-selected regions to the new image
    newImageData.data.set(imageData.data);
    
    // Clear selected regions in the destination
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                newImageData.data[baseIndex + i] = 0;
            }
        });
    });
    
    // Calculate circular motion for selected regions
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate the offset based on circular motion
            const offsetX = radius * width * Math.cos(angle);
            const offsetY = radius * height * Math.sin(angle);
            
            // Apply offset directly to pixel coordinates
            const newX = x + Math.round(offsetX);
            const newY = y + Math.round(offsetY);
            
            // Only copy if new position is within image bounds
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (newY * width + newX) * 4;
                
                // Copy pixel to temp buffer at new position
                for (let i = 0; i < 4; i++) {
                    tempBuffer[targetIdx + i] = imageData.data[sourceIdx + i];
                }
            }
        });
    });
    
    // Blend moved pixels with destination
    for (let i = 0; i < tempBuffer.length; i += 4) {
        if (tempBuffer[i + 3] > 0) { // If pixel is not transparent
            for (let c = 0; c < 4; c++) {
                newImageData.data[i + c] = tempBuffer[i + c];
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    try {
        const { 
            imageData,
            selectedRegions,
            value,
            reset,
            radius = DEFAULT_RADIUS,
            cycleLength = DEFAULT_CYCLE_LENGTH
        } = e.data;
        
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyCircularMotion(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
        
    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack
        });
    }
};