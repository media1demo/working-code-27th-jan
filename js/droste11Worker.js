// Constants
const DEFAULT_MAX_VERTICAL_OFFSET = 50;
const DEFAULT_MAX_HORIZONTAL_OFFSET = 50;
const DEFAULT_ITERATIONS = 120;
const DEFAULT_MOVE_STEP = 20;
const DEFAULT_SCALE_FACTOR = 0.95;  // Scale factor for each iteration
const DEFAULT_ROTATION_ANGLE = 5;    // Rotation angle in degrees

let currentIteration = 0;

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

// Helper function to rotate and scale a point around a center
function transformPoint(x, y, centerX, centerY, scale, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    
    // Translate point to origin
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    
    // Scale
    const scaledX = translatedX * scale;
    const scaledY = translatedY * scale;
    
    // Rotate
    const rotatedX = scaledX * Math.cos(angleInRadians) - scaledY * Math.sin(angleInRadians);
    const rotatedY = scaledX * Math.sin(angleInRadians) + scaledY * Math.cos(angleInRadians);
    
    // Translate back
    return {
        x: rotatedX + centerX,
        y: rotatedY + centerY
    };
}

function applyDrosteEffect(imageData, currentIteration) {
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const tempBuffer = new Uint8ClampedArray(imageData.data);
    const resultBuffer = new Uint8ClampedArray(imageData.data.length);
    
    // Clear destination area
    for (let i = 0; i < resultBuffer.length; i += 4) {
        resultBuffer[i] = 0;     // R
        resultBuffer[i + 1] = 0; // G
        resultBuffer[i + 2] = 0; // B
        resultBuffer[i + 3] = 0; // A
    }
    
    const scaleFactor = Math.pow(DEFAULT_SCALE_FACTOR, currentIteration);
    const rotationAngle = DEFAULT_ROTATION_ANGLE * currentIteration;
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const transformedPoint = transformPoint(
                x, y,
                centerX, centerY,
                scaleFactor,
                rotationAngle
            );
            
            const sourceX = Math.floor(transformedPoint.x);
            const sourceY = Math.floor(transformedPoint.y);
            
            // Check if the transformed point is within bounds
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIdx = (sourceY * width + sourceX) * 4;
                const destIdx = (y * width + x) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    resultBuffer[destIdx + c] = tempBuffer[sourceIdx + c];
                }
            }
        }
    }
    
    // Copy result back to imageData
    imageData.data.set(resultBuffer);
}

function applyDrosteToRegions(imageData, selectedRegions, iteration) {
    const width = imageData.width;
    const height = imageData.height;
    const newImageData = createTransparentImageData(width, height);
    copyImageData(imageData, newImageData);
    
    selectedRegions.forEach(region => {
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        const regionCenter = getRegionCenter(region, width);
        
        // Clear original positions
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Transform pixels
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            const transformedPoint = transformPoint(
                x, y,
                regionCenter.x, regionCenter.y,
                Math.pow(DEFAULT_SCALE_FACTOR, iteration),
                DEFAULT_ROTATION_ANGLE * iteration
            );
            
            const newX = Math.floor(transformedPoint.x);
            const newY = Math.floor(transformedPoint.y);
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (newY * width + newX) * 4;
                
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

function getRegionCenter(region, width) {
    let sumX = 0;
    let sumY = 0;
    
    region.forEach(pixelIndex => {
        sumX += pixelIndex % width;
        sumY += Math.floor(pixelIndex / width);
    });
    
    return {
        x: sumX / region.length,
        y: sumY / region.length
    };
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value, 
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
            resultImageData = applyDrosteToRegions(imageData, selectedRegions, currentIteration);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            applyDrosteEffect(resultImageData, currentIteration);
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