const DEFAULT_CYCLE_LENGTH = 5;
const DEFAULT_ZOOM_INTENSITY = 0.05;
const DEFAULT_SAMPLES = 20;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function applyZoomBlur(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);
    
    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1;
    const zoomIntensity = DEFAULT_ZOOM_INTENSITY;
    
    // First copy the original image
    newImageData.data.set(imageData.data);
    
    // Process each selected region
    selectedRegions.forEach(region => {
        // Clear the selected region in the destination
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                newImageData.data[baseIndex + i] = 0;
            }
        });
        
        // Get bounds of the selected region
        const minX = Math.min(...region.map(idx => idx % width));
        const maxX = Math.max(...region.map(idx => idx % width));
        const minY = Math.min(...region.map(idx => Math.floor(idx / width)));
        const maxY = Math.max(...region.map(idx => Math.floor(idx / width)));
        
        // Calculate region center
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Create a lookup set for fast checking if a pixel is in the region
        const regionSet = new Set(region);
        
        // Process each pixel in the bounded region
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const pixelIndex = y * width + x;
                
                // Skip if this pixel isn't in the selected region
                if (!regionSet.has(pixelIndex)) continue;
                
                let totalR = 0, totalG = 0, totalB = 0, totalA = 0;
                let weightSum = 0;
                
                // Sample multiple points for the blur effect
                for (let i = 0; i < DEFAULT_SAMPLES; i++) {
                    const t = i / (DEFAULT_SAMPLES - 1);
                    const weight = 1 - t;
                    
                    // Calculate vector from center to current pixel
                    const dx = x - centerX;
                    const dy = y - centerY;
                    
                    // Apply zoom based on phase and sample position
                    const zoomFactor = 1 + (zoomIntensity * Math.sin(phase * Math.PI * 2) * t);
                    
                    // Calculate sample position
                    let sourceX = centerX + (dx * zoomFactor);
                    let sourceY = centerY + (dy * zoomFactor);
                    
                    // Ensure source coordinates are within bounds
                    sourceX = Math.max(0, Math.min(width - 1, sourceX));
                    sourceY = Math.max(0, Math.min(height - 1, sourceY));
                    
                    // Get the four surrounding pixels for bilinear interpolation
                    const x1 = Math.floor(sourceX);
                    const x2 = Math.min(x1 + 1, width - 1);
                    const y1 = Math.floor(sourceY);
                    const y2 = Math.min(y1 + 1, height - 1);
                    
                    // Calculate interpolation weights
                    const wx = sourceX - x1;
                    const wy = sourceY - y1;
                    
                    // Get indices for the four surrounding pixels
                    const i11 = (y1 * width + x1) * 4;
                    const i12 = (y1 * width + x2) * 4;
                    const i21 = (y2 * width + x1) * 4;
                    const i22 = (y2 * width + x2) * 4;
                    
                    // Perform bilinear interpolation for each color channel
                    for (let c = 0; c < 4; c++) {
                        const p11 = imageData.data[i11 + c];
                        const p12 = imageData.data[i12 + c];
                        const p21 = imageData.data[i21 + c];
                        const p22 = imageData.data[i22 + c];
                        
                        const interpolated = 
                            p11 * (1 - wx) * (1 - wy) +
                            p12 * wx * (1 - wy) +
                            p21 * (1 - wx) * wy +
                            p22 * wx * wy;
                        
                        if (c === 3) { // Alpha channel
                            totalA += interpolated * weight;
                        } else {
                            switch(c) {
                                case 0: totalR += interpolated * weight; break;
                                case 1: totalG += interpolated * weight; break;
                                case 2: totalB += interpolated * weight; break;
                            }
                        }
                    }
                    
                    weightSum += weight;
                }
                
                // Write final pixel values
                const targetIndex = pixelIndex * 4;
                newImageData.data[targetIndex] = Math.round(totalR / weightSum);
                newImageData.data[targetIndex + 1] = Math.round(totalG / weightSum);
                newImageData.data[targetIndex + 2] = Math.round(totalB / weightSum);
                newImageData.data[targetIndex + 3] = Math.round(totalA / weightSum);
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    try {
        const { 
            imageData,
            selectedRegions,
            value,
            reset,
            zoomIntensity = DEFAULT_ZOOM_INTENSITY,
            cycleLength = DEFAULT_CYCLE_LENGTH
        } = e.data;
        
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyZoomBlur(imageData, selectedRegions, value);
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