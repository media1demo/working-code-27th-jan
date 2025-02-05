
// Constants for VR effect
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

// VR specific constants
const BARREL_DISTORTION = 0.25;  // Controls the strength of the lens distortion
const CHROMATIC_ABERRATION = 2.0;  // Pixel offset for color channels
const VIGNETTE_STRENGTH = 0.75;  // Darkness around the edges

let currentIteration = 0;

// Helper function to create new ImageData
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Apply barrel distortion to simulate lens effect
function applyBarrelDistortion(x, y, width, height) {
    // Convert coordinates to be in range -1 to 1
    const nx = (2.0 * x - width) / width;
    const ny = (2.0 * y - height) / height;
    
    // Calculate distance from center
    const r = Math.sqrt(nx * nx + ny * ny);
    
    // Apply barrel distortion
    const distortion = 1.0 + BARREL_DISTORTION * r * r;
    
    // Convert back to pixel coordinates
    return {
        x: Math.floor((nx * distortion * width / 2.0) + width / 2.0),
        y: Math.floor((ny * distortion * height / 2.0) + height / 2.0)
    };
}

// Apply VR effects to image
function applyVREffects(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Apply barrel distortion
            const distorted = applyBarrelDistortion(x, y, width, height);
            
            if (distorted.x >= 0 && distorted.x < width && 
                distorted.y >= 0 && distorted.y < height) {
                
                const targetIdx = (y * width + x) * 4;
                
                // Apply chromatic aberration (offset color channels)
                const rSource = ((distorted.y * width) + 
                    Math.min(width - 1, distorted.x + CHROMATIC_ABERRATION)) * 4;
                const gSource = (distorted.y * width + distorted.x) * 4;
                const bSource = ((distorted.y * width) + 
                    Math.max(0, distorted.x - CHROMATIC_ABERRATION)) * 4;
                
                // Get color values with chromatic aberration
                result.data[targetIdx] = imageData.data[rSource];     // Red
                result.data[targetIdx + 1] = imageData.data[gSource + 1]; // Green
                result.data[targetIdx + 2] = imageData.data[bSource + 2]; // Blue
                
                // Apply vignette effect (darken edges)
                const dx = (x / width) - 0.5;
                const dy = (y / height) - 0.5;
                const distance = Math.sqrt(dx * dx + dy * dy) * 2.0;
                const vignette = Math.max(0, 1 - distance * VIGNETTE_STRENGTH);
                
                result.data[targetIdx] *= vignette;
                result.data[targetIdx + 1] *= vignette;
                result.data[targetIdx + 2] *= vignette;
                result.data[targetIdx + 3] = imageData.data[gSource + 3]; // Alpha
            }
        }
    }
    
    return result;
}

// Function to move selected regions with VR effect
function moveSelectedRegionsVR(imageData, selectedRegions, maxHorizontalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    
    selectedRegions.forEach(region => {
        const horizontalOffset = Math.random() * maxHorizontalOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Move pixels with motion blur effect
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Create motion trail
            for (let i = 0; i < horizontalOffset; i++) {
                const newX = Math.max(0, x - i);
                if (newX >= 0 && newX < width) {
                    const sourceIndex = (y * width + x) * 4;
                    const targetIndex = (y * width + Math.floor(newX)) * 4;
                    
                    // Fade trail based on distance
                    const alpha = 1 - (i / horizontalOffset);
                    
                    for (let c = 0; c < 3; c++) {
                        tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c] * alpha;
                    }
                    tempBuffer[targetIndex + 3] = imageData.data[sourceIndex + 3] * alpha;
                }
            }
        });
        
        // Blend moved pixels
        for (let i = 0; i < tempBuffer.length; i += 4) {
            if (tempBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = Math.max(newImageData.data[i + c], tempBuffer[i + c]);
                }
            }
        }
    });
    
    // Apply VR effects to the final image
    return applyVREffects(newImageData);
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
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
            // Selected regions mode with VR effects
            resultImageData = moveSelectedRegionsVR(imageData, selectedRegions, maxHorizontalOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode with VR effects
            const tempImage = createTransparentImageData(imageData.width, imageData.height);
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            
            // Apply movement with motion blur
            for (let y = 0; y < imageData.height; y++) {
                for (let x = 0; x < imageData.width; x++) {
                    for (let i = 0; i < totalMove; i++) {
                        const newX = Math.max(0, x - i);
                        if (newX !== x) {
                            const sourceIdx = (y * imageData.width + x) * 4;
                            const destIdx = (y * imageData.width + newX) * 4;
                            const alpha = 1 - (i / totalMove);
                            
                            for (let c = 0; c < 3; c++) {
                                tempImage.data[destIdx + c] = 
                                    Math.max(tempImage.data[destIdx + c], 
                                           imageData.data[sourceIdx + c] * alpha);
                            }
                            tempImage.data[destIdx + 3] = 
                                Math.max(tempImage.data[destIdx + 3], 
                                       imageData.data[sourceIdx + 3] * alpha);
                        }
                    }
                }
            }
            
            // Apply VR effects to the moved image
            resultImageData = applyVREffects(tempImage);
            currentIteration++;
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