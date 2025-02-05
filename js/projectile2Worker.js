
// Constants
const DEFAULT_MAX_ROTATION = 360;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_ROTATION_STEP = 3;

let currentIteration = 0;

// Helper function to create new ImageData with transparent background
function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to rotate entire region
function rotateRegion(imageData, totalRotation) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.translate(0, imageData.height);
    tempCtx.rotate(totalRotation * Math.PI / 180);
    tempCtx.translate(0, -imageData.height);
    
    tempCtx.drawImage(canvas, 0, 0);
    
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Function to rotate selected regions
function rotateSelectedRegions(imageData, selectedRegions, maxRotation) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const rotationAmount = Math.random() * maxRotation;
        const tempCanvas = new OffscreenCanvas(width, height);
        const tempCtx = tempCanvas.getContext('2d');
        
        // Create a temporary canvas for this region
        const regionCanvas = new OffscreenCanvas(width, height);
        const regionCtx = regionCanvas.getContext('2d');
        
        // Draw only the selected region
        const regionData = createTransparentImageData(width, height);
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const sourceIndex = (y * width + x) * 4;
            const targetIndex = sourceIndex;
            
            for (let c = 0; c < 4; c++) {
                regionData.data[targetIndex + c] = imageData.data[sourceIndex + c];
            }
            
            // Clear this pixel from the new image data
            for (let c = 0; c < 4; c++) {
                newImageData.data[sourceIndex + c] = 0;
            }
        });
        
        regionCtx.putImageData(regionData, 0, 0);
        
        // Rotate the region
        tempCtx.translate(width/2, height/2);
        tempCtx.rotate(rotationAmount * Math.PI / 180);
        tempCtx.translate(-width/2, -height/2);
        tempCtx.drawImage(regionCanvas, 0, 0);
        
        // Blend the rotated region back
        const rotatedRegion = tempCtx.getImageData(0, 0, width, height);
        for (let i = 0; i < rotatedRegion.data.length; i += 4) {
            if (rotatedRegion.data[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = rotatedRegion.data[i + c];
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
        value2: maxRotation = DEFAULT_MAX_ROTATION,
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
            resultImageData = rotateSelectedRegions(imageData, selectedRegions, maxRotation);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
            resultImageData = rotateRegion(imageData, totalRotation);
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