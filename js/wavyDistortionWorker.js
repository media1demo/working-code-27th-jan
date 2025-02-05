// Constants
const DEFAULT_WAVE_AMPLITUDE = 20;
const DEFAULT_WAVE_FREQUENCY = 0.02;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_WAVE_SPEED = 0.1;
console.log("object");
let currentIteration = 0;

// Helper function to create new ImageData with transparent background
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

// Function to apply wave effect to selected regions
function applyWaveEffect(imageData, selectedRegions, amplitude, frequency, phase) {
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
        
        // Apply wave transformation
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate vertical offset using sine wave
            const waveOffset = amplitude * Math.sin(frequency * x + phase);
            const newY = Math.min(height - 1, Math.max(0, y + waveOffset));
            
            if (newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend wave-transformed pixels
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

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value,
        value2: amplitude = DEFAULT_WAVE_AMPLITUDE,
        value3: frequency = DEFAULT_WAVE_FREQUENCY,
        value4: speed = DEFAULT_WAVE_SPEED,
        value5: iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Calculate phase based on current iteration
            const phase = (currentIteration * speed) % (2 * Math.PI);
            
            // Apply wave effect
            resultImageData = applyWaveEffect(
                imageData, 
                selectedRegions, 
                amplitude, 
                frequency,
                phase
            );
            
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // If no regions selected, return original image
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