const DEFAULT_ZOOM_STRENGTH = 0.3;
const DEFAULT_ZOOM_CENTER_X = 0.5;
const DEFAULT_ZOOM_CENTER_Y = 0.5;
const DEFAULT_SAMPLES = 20;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function applyZoomBlur(imageData, selectedRegions, zoomStrength = DEFAULT_ZOOM_STRENGTH, centerX = DEFAULT_ZOOM_CENTER_X, centerY = DEFAULT_ZOOM_CENTER_Y) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);
    
    // Copy original image first
    newImageData.data.set(imageData.data);
    
    // Create a map of selected pixels for faster lookup
    const selectedPixels = new Set(selectedRegions.flat());
    
    // Calculate center point in pixels
    const centerPxX = Math.floor(width * centerX);
    const centerPxY = Math.floor(height * centerY);
    
    // For each selected region
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            let r = 0, g = 0, b = 0, a = 0;
            let sampleCount = 0;
            
            // Sample multiple points along the zoom direction
            for (let i = 0; i < DEFAULT_SAMPLES; i++) {
                const t = i / (DEFAULT_SAMPLES - 1);
                
                // Calculate sample position
                const scale = 1.0 + (zoomStrength * t);
                const sampleX = Math.round(centerPxX + (x - centerPxX) * scale);
                const sampleY = Math.round(centerPxY + (y - centerPxY) * scale);
                
                // Check if sample point is within bounds
                if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
                    const sampleIndex = (sampleY * width + sampleX) * 4;
                    
                    // Weight samples based on distance from center
                    const weight = Math.pow(1 - t, 2);
                    
                    r += imageData.data[sampleIndex] * weight;
                    g += imageData.data[sampleIndex + 1] * weight;
                    b += imageData.data[sampleIndex + 2] * weight;
                    a += imageData.data[sampleIndex + 3] * weight;
                    
                    sampleCount += weight;
                }
            }
            
            // Average the samples
            if (sampleCount > 0) {
                const destIndex = pixelIndex * 4;
                newImageData.data[destIndex] = r / sampleCount;
                newImageData.data[destIndex + 1] = g / sampleCount;
                newImageData.data[destIndex + 2] = b / sampleCount;
                newImageData.data[destIndex + 3] = a / sampleCount;
            }
        });
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    try {
        const { 
            imageData,
            selectedRegions,
            value, // Can be used for zoom strength
            zoomCenterX = DEFAULT_ZOOM_CENTER_X,
            zoomCenterY = DEFAULT_ZOOM_CENTER_Y,
            zoomStrength = DEFAULT_ZOOM_STRENGTH
        } = e.data;
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Apply zoom blur only to selected regions
            resultImageData = applyZoomBlur(
                imageData, 
                selectedRegions,
                zoomStrength,
                zoomCenterX,
                zoomCenterY
            );
        } else {
            // If no regions selected, return original image
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            progress: 1
        }, [resultImageData.data.buffer]);
        
    } catch (error) {
        self.postMessage({
            error: `Zoom blur error: ${error.message}`,
            isComplete: true,
            stack: error.stack
        });
    }
};