// Constants
const DEFAULT_SEGMENTS = 8;
const DEFAULT_ROTATION = 0;
const DEFAULT_SCALE = 1.0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to apply kaleidoscope effect to specific regions
function applyKaleidoscopeToRegions(imageData, selectedRegions, numSegments = DEFAULT_SEGMENTS, rotation = DEFAULT_ROTATION, scale = DEFAULT_SCALE) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const resultImageData = createTransparentImageData(width, height);
    
    // Copy original image first
    copyImageData(imageData, resultImageData);
    
    // Calculate segment angle
    const segmentAngle = (2 * Math.PI) / numSegments;
    
    // Process each selected region
    selectedRegions.forEach(region => {
        // Find region bounds
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Calculate region center
        const regionCenterX = (minX + maxX) / 2;
        const regionCenterY = (minY + maxY) / 2;
        
        // Create a Set for quick lookup of selected pixels
        const selectedPixels = new Set(region);
        
        // Process each pixel in the region bounds
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                
                // Only process pixels that are part of the selected region
                if (selectedPixels.has(pixelIndex)) {
                    // Convert to polar coordinates relative to region center
                    let dx = (x - regionCenterX) / scale;
                    let dy = (y - regionCenterY) / scale;
                    let radius = Math.sqrt(dx * dx + dy * dy);
                    let angle = Math.atan2(dy, dx) - rotation;
                    
                    // Wrap angle to first segment
                    angle = angle % segmentAngle;
                    if (angle < 0) angle += segmentAngle;
                    
                    // Mirror alternate segments
                    if (Math.floor((angle + rotation) / segmentAngle) % 2) {
                        angle = segmentAngle - angle;
                    }
                    
                    // Convert back to cartesian coordinates
                    let sourceX = Math.round(regionCenterX + radius * Math.cos(angle));
                    let sourceY = Math.round(regionCenterY + radius * Math.sin(angle));
                    
                    // Copy pixel if within bounds and in selected region
                    if (sourceX >= minX && sourceX <= maxX && 
                        sourceY >= minY && sourceY <= maxY &&
                        selectedPixels.has(sourceY * width + sourceX)) {
                        const sourceIdx = (sourceY * width + sourceX) * 4;
                        const targetIdx = (y * width + x) * 4;
                        
                        for (let i = 0; i < 4; i++) {
                            resultImageData.data[targetIdx + i] = imageData.data[sourceIdx + i];
                        }
                    }
                }
            }
        }
    });
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData,
        selectedRegions,
        value: numSegments = DEFAULT_SEGMENTS,
        value2: rotation = DEFAULT_ROTATION,
        value3: scale = DEFAULT_SCALE
    } = e.data;
    
    try {
        if (!selectedRegions?.length) {
            // If no regions selected, return original image
            self.postMessage({
                segmentedImages: [imageData],
                isComplete: true
            });
            return;
        }
        
        const resultImageData = applyKaleidoscopeToRegions(
            imageData,
            selectedRegions,
            numSegments,
            rotation * (Math.PI / 180), // Convert rotation to radians
            scale
        );
        
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