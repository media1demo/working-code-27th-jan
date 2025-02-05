// Constants
const DEFAULT_MAX_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

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


// Function to move entire region up and right
function moveRegionTopRight(imageData, totalMoveX, totalMoveY) {
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
    
    // Move pixels to new position
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const newX = Math.min(x + totalMoveX, width - 1); // Move right
            const newY = Math.max(y - totalMoveY, 0);         // Move up
            
            if (newX !== x || newY !== y) {
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



// Function to move selected regions
function moveSelectedRegions(imageData, selectedRegions, maxOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const offsetX = Math.random() * maxOffset;
        const offsetY = Math.random() * maxOffset;
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear selected region
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Move pixels
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            const newX = Math.max(0, x - offsetX);
            const newY = Math.max(0, y - offsetY);
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (Math.floor(newY) * width + Math.floor(newX)) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Blend moved pixels
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
        value2: maxOffset = DEFAULT_MAX_OFFSET,
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
            resultImageData = moveSelectedRegions(imageData, selectedRegions, maxOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            moveRegionTopRight(resultImageData, totalMove, totalMove); // Updated to moveRegionTopRight
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