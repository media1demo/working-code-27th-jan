// Placeholder for whitelineWorker.js
// Constants
const DEFAULT_PERSPECTIVE_FACTOR = 0.2;
const DEFAULT_ITERATIONS = 120;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Enhanced perspective transform function
function applyPerspective(x, y, width, height, params) {
    const {
        perspectiveStrength = DEFAULT_PERSPECTIVE_FACTOR,
        horizontalTilt = 0,
        verticalTilt = 0,
        zoomFactor = 1,
        rotation = 0
    } = params;

    // Center the coordinates for rotation and zoom
    let xc = x - width / 2;
    let yc = y - height / 2;
    
    // Apply rotation
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const xr = xc * cosR - yc * sinR;
    const yr = xc * sinR + yc * cosR;
    
    // Apply zoom
    const xz = xr * zoomFactor;
    const yz = yr * zoomFactor;
    
    // Apply perspective and tilt
    const z = 1 + (yz / height) * perspectiveStrength;
    const xp = xz / z + (horizontalTilt * width / 2);
    const yp = yz / z + (verticalTilt * height / 2);
    
    // Return to original coordinate space
    return {
        x: Math.round(xp + width / 2),
        y: Math.round(yp + height / 2)
    };
}

// Function to apply perspective effect to the entire image
function applyPerspectiveEffect(imageData, transformParams) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Get transformed position
            const transformed = applyPerspective(x, y, width, height, transformParams);
            
            // Only copy pixel if it's within bounds
            if (transformed.x >= 0 && transformed.x < width && 
                transformed.y >= 0 && transformed.y < height) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (transformed.y * width + transformed.x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    newImageData.data[destIdx + c] = imageData.data[sourceIdx + c];
                }
            }
        }
    }
    
    return newImageData;
}

// Function to transform selected regions
function transformSelectedRegions(imageData, selectedRegions, transformParams) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    
    // Copy original image
    newImageData.data.set(imageData.data);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region in the new image
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Transform pixels in the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const transformed = applyPerspective(x, y, width, height, transformParams);
            
            if (transformed.x >= 0 && transformed.x < width && 
                transformed.y >= 0 && transformed.y < height) {
                const sourceIndex = pixelIndex * 4;
                const targetIndex = (transformed.y * width + transformed.x) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend transformed pixels
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
        value1 = 50,
        value2 = 50,
        value3 = 50,
        value4 = 50,
        value5 = 50,
        iterations = DEFAULT_ITERATIONS,
        reset 
    } = e.data;
    
    try {
        // Reset counter if requested
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        // Calculate transformation parameters
        const transformParams = {
            perspectiveStrength: value1 / 100,
            horizontalTilt: (value2 - 50) / 50,
            verticalTilt: (value3 - 50) / 50,
            zoomFactor: 1 + (value4 - 50) / 100,
            rotation: (value5 - 50) / 50 * Math.PI
        };
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            const iterationFactor = currentIteration / iterations;
            const currentParams = {
                perspectiveStrength: transformParams.perspectiveStrength * iterationFactor,
                horizontalTilt: transformParams.horizontalTilt * iterationFactor,
                verticalTilt: transformParams.verticalTilt * iterationFactor,
                zoomFactor: 1 + (transformParams.zoomFactor - 1) * iterationFactor,
                rotation: transformParams.rotation * iterationFactor
            };
            
            resultImageData = transformSelectedRegions(imageData, selectedRegions, currentParams);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            const iterationFactor = currentIteration / iterations;
            const currentParams = {
                perspectiveStrength: transformParams.perspectiveStrength * iterationFactor,
                horizontalTilt: transformParams.horizontalTilt * iterationFactor,
                verticalTilt: transformParams.verticalTilt * iterationFactor,
                zoomFactor: 1 + (transformParams.zoomFactor - 1) * iterationFactor,
                rotation: transformParams.rotation * iterationFactor
            };
            
            resultImageData = applyPerspectiveEffect(imageData, currentParams);
            currentIteration++;
            progress = currentIteration / iterations;
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