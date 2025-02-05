// Constants for wave parameters
const DEFAULT_ITERATIONS = 120;
const WAVE_PARAMS = {
    primary: {
        amplitude: 15,
        frequency: 0.02,
        speed: 0.08
    },
    secondary: {
        amplitude: 8,
        frequency: 0.04,
        speed: 0.05
    },
    tertiary: {
        amplitude: 5,
        frequency: 0.06,
        speed: 0.03
    }
};

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Calculate complex wave offset using multiple sine waves
function calculateWaveOffset(x, y, time) {
    // Primary wave
    const wave1 = WAVE_PARAMS.primary.amplitude * 
        Math.sin(WAVE_PARAMS.primary.frequency * x + time * WAVE_PARAMS.primary.speed);
    
    // Secondary wave with position-dependent phase
    const wave2 = WAVE_PARAMS.secondary.amplitude * 
        Math.sin(WAVE_PARAMS.secondary.frequency * (x + y) + time * WAVE_PARAMS.secondary.speed);
    
    // Tertiary wave with circular pattern
    const centerX = x / 2;
    const centerY = y / 2;
    const distance = Math.sqrt(centerX * centerX + centerY * centerY);
    const wave3 = WAVE_PARAMS.tertiary.amplitude * 
        Math.sin(WAVE_PARAMS.tertiary.frequency * distance + time * WAVE_PARAMS.tertiary.speed);
    
    // Combine all waves with different weights
    return wave1 + wave2 * 0.7 + wave3 * 0.5;
}

// Function to apply complex wave effect
function applyComplexWaveEffect(imageData, selectedRegions, time) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Apply complex wave transformation
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate combined wave offset
            const waveOffset = calculateWaveOffset(x, y, time);
            
            // Apply vertical displacement
            const newY = Math.min(height - 1, Math.max(0, y + waveOffset));
            
            if (newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + x) * 4;
                
                // Add subtle horizontal displacement based on wave phase
                const horizontalShift = Math.sin(time * 0.1) * 2;
                const shiftedX = Math.min(width - 1, Math.max(0, x + horizontalShift));
                const finalIndex = (Math.floor(newY) * width + Math.floor(shiftedX)) * 4;
                
                // Copy pixel data with interpolation for smoother movement
                const alpha = newY - Math.floor(newY);
                for (let c = 0; c < 4; c++) {
                    const pixel1 = imageData.data[sourceIndex + c];
                    const pixel2 = sourceIndex + width * 4 + c < imageData.data.length ? 
                        imageData.data[sourceIndex + width * 4 + c] : pixel1;
                    
                    tempBuffer[finalIndex + c] = Math.round(pixel1 * (1 - alpha) + pixel2 * alpha);
                }
            }
        });
        
        // Blend transformed pixels with smooth interpolation
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = tempBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

// Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Calculate time parameter for wave animation
            const time = (currentIteration * Math.PI) / 30;
            
            // Apply complex wave effect
            resultImageData = applyComplexWaveEffect(
                imageData, 
                selectedRegions, 
                time
            );
            
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = undefined;
        }
        
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