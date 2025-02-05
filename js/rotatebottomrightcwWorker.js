// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const rotatedImageData = rotateImage(imageData, value, 'bottomRight');
//     self.postMessage({ imageData: rotatedImageData });
// };

// function rotateImage(imageData, angle, corner) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.translate(imageData.width, imageData.height);
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(-imageData.width, -imageData.height);

//     tempCtx.drawImage(canvas, 0, 0);

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

const DEFAULT_ROTATION_ANGLE = 45;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_ROTATION_STEP = 2;
console.log("bottomrightWorker initialized");
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

function rotateRegionBottomRight(imageData, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    
    // Clear destination area
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 0;     // R
        imageData.data[i + 1] = 0; // G
        imageData.data[i + 2] = 0; // B
        imageData.data[i + 3] = 0; // A
    }
    
    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;
    const centerX = width - 1;  // Rotate around bottom-right corner
    const centerY = height - 1; // Bottom
    
    // Rotate pixels around bottom-right corner
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate relative position to rotation center
            const relativeX = x - centerX;
            const relativeY = y - centerY;
            
            // Apply rotation
            const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
            const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
            
            // Convert back to absolute coordinates
            const newX = Math.round(rotatedX + centerX);
            const newY = Math.round(rotatedY + centerY);
            
            // Check if new position is within bounds
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + newX) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to rotate selected regions around bottom-right corner
function rotateSelectedRegionsBottomRight(imageData, selectedRegions, maxRotationAngle) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const rotationAngle = Math.random() * maxRotationAngle;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Rotate pixels
        const centerX = width - 1;  // Bottom-right corner
        const centerY = height - 1; // Bottom
        const radians = (rotationAngle * Math.PI) / 180;
        
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation
            const relativeX = x - centerX;
            const relativeY = y - centerY;
            const rotatedX = relativeX * Math.cos(radians) - relativeY * Math.sin(radians);
            const rotatedY = relativeX * Math.sin(radians) + relativeY * Math.cos(radians);
            const newX = Math.round(rotatedX + centerX);
            const newY = Math.round(rotatedY + centerY);
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend rotated pixels
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
        value2: maxRotationAngle = DEFAULT_ROTATION_ANGLE,
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
        
        // Handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegionsBottomRight(imageData, selectedRegions, maxRotationAngle);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
            rotateRegionBottomRight(resultImageData, totalRotation);
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