const DEFAULT_MAX_SMOOTHING = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_BLEND_STEP = 0.2;

let currentIteration = 0;

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to apply Gaussian blur
function applyGaussianBlur(imageData, radius) {
    const width = imageData.width;
    const height = imageData.height;
    const blurredData = createTransparentImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            let weightSum = 0;
            
            // Apply blur kernel
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = Math.min(Math.max(x + kx, 0), width - 1);
                    const py = Math.min(Math.max(y + ky, 0), height - 1);
                    
                    // Gaussian weight
                    const distance = Math.sqrt(kx * kx + ky * ky);
                    const weight = Math.exp(-(distance * distance) / (2 * radius * radius));
                    
                    const idx = (py * width + px) * 4;
                    r += imageData.data[idx] * weight;
                    g += imageData.data[idx + 1] * weight;
                    b += imageData.data[idx + 2] * weight;
                    a += imageData.data[idx + 3] * weight;
                    weightSum += weight;
                }
            }
            
            const destIdx = (y * width + x) * 4;
            blurredData.data[destIdx] = r / weightSum;
            blurredData.data[destIdx + 1] = g / weightSum;
            blurredData.data[destIdx + 2] = b / weightSum;
            blurredData.data[destIdx + 3] = a / weightSum;
        }
    }
    
    return blurredData;
}

function applySmoothSkinEffect(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const resultData = createTransparentImageData(width, height);
    copyImageData(imageData, resultData);
    
    // Apply blur with radius based on intensity
    const blurRadius = Math.max(1, Math.floor(intensity * 3));
    const blurredData = applyGaussianBlur(imageData, blurRadius);
    
    // Blend original and blurred images based on intensity
    const blendFactor = Math.min(0.8, intensity);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Preserve more detail in edges and high-contrast areas
        const luminance = (imageData.data[i] * 0.299 + 
                          imageData.data[i + 1] * 0.587 + 
                          imageData.data[i + 2] * 0.114) / 255;
        
        // Adjust blend factor based on luminance
        const dynamicBlend = blendFactor * (1 - Math.abs(luminance - 0.5));
        
        resultData.data[i] = imageData.data[i] * (1 - dynamicBlend) + blurredData.data[i] * dynamicBlend;
        resultData.data[i + 1] = imageData.data[i + 1] * (1 - dynamicBlend) + blurredData.data[i + 1] * dynamicBlend;
        resultData.data[i + 2] = imageData.data[i + 2] * (1 - dynamicBlend) + blurredData.data[i + 2] * dynamicBlend;
        resultData.data[i + 3] = imageData.data[i + 3];
    }
    
    return resultData;
}

// Function to process selected regions
function processSmoothSkinRegions(imageData, selectedRegions, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const resultData = createTransparentImageData(width, height);
    copyImageData(imageData, resultData);
    
    const smoothedData = applySmoothSkinEffect(imageData, intensity);
    
    // Only apply smoothing to selected regions
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                resultData.data[baseIndex + c] = smoothedData.data[baseIndex + c];
            }
        });
    });
    
    return resultData;
}

// Web Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxSmoothing = DEFAULT_MAX_SMOOTHING,
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

        // Calculate smoothing intensity
        const smoothingIntensity = Math.min(1, value);

        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Process only selected regions
            resultImageData = processSmoothSkinRegions(imageData, selectedRegions, smoothingIntensity);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Process entire image
            resultImageData = applySmoothSkinEffect(imageData, smoothingIntensity);
            currentIteration++;
            progress = undefined;
        }

        // Send the processed image data back to the main thread
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};