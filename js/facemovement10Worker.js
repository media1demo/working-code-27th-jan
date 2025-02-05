// Constants
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ROTATION_ANGLE = 10;
const DEFAULT_SCALE_FACTOR = 0.1;
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

// Helper function to copy image data
function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to apply transformation to selected regions
function applyTransformation(imageData, selectedRegions, maxHorizontalOffset, maxVerticalOffset, rotationAngle, scaleFactor) {
    const width = imageData.width;
    const height = imageData.height;
    const tempData = new Uint8ClampedArray(imageData.data.length);
    
    // Copy original data to temp buffer
    tempData.set(imageData.data);

    const cosAngle = Math.cos(rotationAngle * Math.PI / 180);
    const sinAngle = Math.sin(rotationAngle * Math.PI / 180);

    selectedRegions.forEach((region, index) => {
        const centerX = average(region.map(p => p % width));
        const centerY = average(region.map(p => Math.floor(p / width)));

        const horizontalOffset = Math.sin(currentIteration / (DEFAULT_ITERATIONS - 1) * Math.PI * 2) * maxHorizontalOffset * (index % 2 ? 1 : -1);
        const verticalOffset = Math.cos(currentIteration / (DEFAULT_ITERATIONS - 1) * Math.PI * 2) * maxVerticalOffset;
        const rotation = Math.sin(currentIteration / (DEFAULT_ITERATIONS - 1) * Math.PI) * rotationAngle;
        const scale = 1 + Math.sin(currentIteration / (DEFAULT_ITERATIONS - 1) * Math.PI * 2) * scaleFactor;

        region.forEach(pixelIndex => {
            const x = pixelIndex % width - centerX;
            const y = Math.floor(pixelIndex / width) - centerY;

            let newX = x * scale;
            let newY = y * scale;

            const rotatedX = newX * cosAngle - newY * sinAngle;
            const rotatedY = newX * sinAngle + newY * cosAngle;

            newX = Math.round(rotatedX + centerX + horizontalOffset);
            newY = Math.round(rotatedY + centerY + verticalOffset);

            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const oldIndex = pixelIndex * 4;
                const newIndex = (newY * width + newX) * 4;

                for (let c = 0; c < 4; c++) {
                    tempData[newIndex + c] = imageData.data[oldIndex + c];
                }
            }
        });
    });

    // Update the image data with transformed pixels
    imageData.data.set(tempData);
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value1: maxHorizontalOffset = DEFAULT_MAX_HORIZONTAL_OFFSET,
        value2: maxVerticalOffset = DEFAULT_MAX_VERTICAL_OFFSET,
        value3: rotationAngle = DEFAULT_ROTATION_ANGLE,
        value4: scaleFactor = DEFAULT_SCALE_FACTOR,
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
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data.length),
                imageData.width,
                imageData.height
            );
            copyImageData(imageData, resultImageData);
            applyTransformation(resultImageData, selectedRegions, maxHorizontalOffset, maxVerticalOffset, rotationAngle, scaleFactor);
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
            moveRegionDown(resultImageData, totalMove);
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

// Function to move entire region down
function moveRegionDown(imageData, totalMove) {
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
        const newY = Math.min(y + totalMove, height - 1);
        if (newY !== y) {
            for (let x = 0; x < width; x++) {
                const sourceIdx = (y * width + x) * 4;
                const destIdx = (newY * width + x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    imageData.data[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
}