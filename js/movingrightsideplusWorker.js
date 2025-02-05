// Placeholder for movingrightsideplusWorker.js

const DEFAULT_CYCLE_LENGTH = 3;
const DEFAULT_BOUNCE_AMPLITUDE = 0.2;
const DEFAULT_BOUNCE_FREQUENCY = 2;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function calculateBounceOffset(t, amplitude, frequency) {
    const easeInOutQuad = t => {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };
    
    const phase = (t * frequency) % 1;
    return amplitude * easeInOutQuad(Math.abs(Math.sin(phase * Math.PI)));
}

function applyBounceToRegions(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);
    const tempBuffer = new Uint8ClampedArray(width * height * 4);
    
    // Pre-calculate bounce parameters
    const bounceOffset = calculateBounceOffset(t, DEFAULT_BOUNCE_AMPLITUDE, DEFAULT_BOUNCE_FREQUENCY);
    
    // First, copy non-selected regions to the new image data
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
    
    // Move selected regions
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate new position with horizontal bounce instead of vertical
            const newX = Math.round(x + (bounceOffset * width));
            
            // Allow movement outside original region
            if (newX >= 0 && newX < width) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = (y * width + newX) * 4;
                
                // Copy pixel data to temp buffer
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
            bounceAmplitude = DEFAULT_BOUNCE_AMPLITUDE,
            bounceFrequency = DEFAULT_BOUNCE_FREQUENCY
        } = e.data;
        
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyBounceToRegions(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % DEFAULT_CYCLE_LENGTH;
            progress = currentIteration / DEFAULT_CYCLE_LENGTH;
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