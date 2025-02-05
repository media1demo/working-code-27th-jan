
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;

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


function applySittingEffect(imageData, compressionValue, direction = 'right') {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Compression factor calculation
    const compressionFactor = 1 - compressionValue * 0.3;
    
    // Determine compression axis and midpoint based on direction
    const isHorizontal = ['left', 'right'].includes(direction);
    const midPoint = isHorizontal ? imageData.width / 2 : imageData.height / 2;
    
    // Draw first half of the image
    if (direction === 'right') {
        tempCtx.drawImage(canvas, 0, 0, midPoint, imageData.height, 0, 0, midPoint, imageData.height);
        tempCtx.drawImage(
            canvas, 
            midPoint, 0, midPoint, imageData.height,  // Source region
            midPoint, 0, midPoint * compressionFactor, imageData.height  // Destination region
        );
    } else if (direction === 'left') {
        tempCtx.drawImage(canvas, midPoint, 0, midPoint, imageData.height, midPoint * compressionFactor, 0, midPoint, imageData.height);
        tempCtx.drawImage(canvas, 0, 0, midPoint, imageData.height, 0, 0, midPoint, imageData.height);
    } else if (direction === 'bottom') {
        tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
        tempCtx.drawImage(
            canvas, 
            0, midPoint, imageData.width, midPoint,  // Source region
            0, midPoint, imageData.width, midPoint * compressionFactor  // Destination region
        );
    } else if (direction === 'top') {
        tempCtx.drawImage(canvas, 0, midPoint, imageData.width, midPoint, 0, midPoint * compressionFactor, imageData.width, midPoint);
        tempCtx.drawImage(canvas, 0, 0, imageData.width, midPoint, 0, 0, imageData.width, midPoint);
    }
    
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Updated Web Worker message handler to support multiple compression directions
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        compressionDirection = 'right',
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
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

        // Apply sitting/compression effect with new direction support
        let processedImageData = applySittingEffect(imageData, value, compressionDirection);

        // Rest of the existing logic remains the same...
        // (previous moveSelectedRegionsRight and other processing code)

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
// Function to move the entire image region to the right
function moveRegionRight(imageData, totalMove) {
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
        for (let x = width - 1; x >= 0; x--) {
            const newX = Math.min(x + totalMove, width - 1);
            if (newX !== x) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (y * width + newX) * 4;

                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}

// Function to move selected regions to the right
function moveSelectedRegionsRight(imageData, selectedRegions, maxHorizontalOffset) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);

    selectedRegions.forEach(region => {
        const horizontalOffset = Math.random() * maxHorizontalOffset;
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
            const newX = Math.min(width - 1, x + horizontalOffset);

            if (newX >= 0 && newX < width) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (y * width + Math.floor(newX)) * 4;

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

// Web Worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
        value2: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
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

        // First apply the sitting/compression effect
        let processedImageData = applySittingEffect(imageData, value);

        // Then handle different modes based on whether regions are selected
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = moveSelectedRegionsRight(processedImageData, selectedRegions, maxHorizontalOffset);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(processedImageData.data),
                processedImageData.width,
                processedImageData.height
            );
            const totalMove = DEFAULT_MOVE_STEP * (currentIteration + 1);
            moveRegionRight(resultImageData, totalMove);
            currentIteration++;
            progress = undefined;
        }

        // Send the processed image data back to the main thread
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]); // Transfer the buffer to avoid copying
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};