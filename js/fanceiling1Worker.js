// Constants
const DEFAULT_MAX_ROTATION = 360;
const DEFAULT_ITERATIONS = 6;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    // Initialize with transparent pixels
    for (let i = 0; i < buffer.length; i += 4) {
        buffer[i + 3] = 0;
    }
    return new ImageData(buffer, width, height);
}

function getPixel(imageData, x, y) {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
        return [0, 0, 0, 0];
    }
    const i = (y * imageData.width + x) * 4;
    return [
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
        imageData.data[i + 3]
    ];
}

function setPixel(imageData, x, y, [r, g, b, a]) {
    if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
        return;
    }
    const i = (y * imageData.width + x) * 4;
    imageData.data[i] = r;
    imageData.data[i + 1] = g;
    imageData.data[i + 2] = b;
    imageData.data[i + 3] = a;
}


function rotateImage(imageData, selectedRegions, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const output = createTransparentImageData(width, height);
    
    // Calculate center
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // First copy the entire image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = getPixel(imageData, x, y);
            setPixel(output, x, y, color);
        }
    }
    
    // Now handle selected regions
    selectedRegions.forEach(region => {
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Clear original pixel
            setPixel(output, x, y, [0, 0, 0, 0]);
            
            // Calculate rotation
            const dx = x - centerX;
            const dy = y - centerY;
            const newX = Math.round(centerX + (dx * cos - dy * sin));
            const newY = Math.round(centerY + (dx * sin + dy * cos));
            
            // Get original color and set at new position
            const color = getPixel(imageData, x, y);
            if (color[3] > 0) { // Only if pixel is not transparent
                setPixel(output, newX, newY, color);
            }
        });
    });
    
    // Debug output
    console.log(`Applied rotation: ${Math.round(angle)}° with ${selectedRegions[0]?.length || 0} pixels`);
    
    return output;
}

function calculateRotationAngles(imageCount) {
    const angles = [];
    for (let i = 0; i < imageCount; i++) {
        // Calculate angle for each image
        const angle = (i * 360) / imageCount;
        angles.push(angle);
    }
    console.log('Generated angles:', angles);
    return angles;
}


let isAnimating = true;  // Add this flag to control animation


self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value2: maxRotation = DEFAULT_MAX_ROTATION,
        value5: iterations = 12,  // Changed to 12 for 30-degree steps (360/12 = 30)
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Calculate current angle for 30-degree steps
            const currentAngle = currentIteration * 30;  // Direct multiplication for 30-degree steps
            
            // Perform rotation
            resultImageData = rotateImage(imageData, selectedRegions, currentAngle);
            
            // Update iteration counter
            if (currentIteration < iterations) {
                currentIteration++;
            }
            
            progress = currentIteration / iterations;
            
            // Debug the current state
            console.log(`Iteration: ${currentIteration}, Angle: ${currentAngle}°, Progress: ${progress.toFixed(2)}`);
        } else {
            resultImageData = createTransparentImageData(imageData.width, imageData.height);
            for (let i = 0; i < imageData.data.length; i++) {
                resultImageData.data[i] = imageData.data[i];
            }
            progress = currentIteration / iterations;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: currentIteration >= iterations,
            iteration: currentIteration,
            progress
        });
    } catch (error) {
        console.error('Rotation error:', error);
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};