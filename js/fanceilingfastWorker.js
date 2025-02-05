// Constants
const DEFAULT_MAX_ROTATION = 360;
const DEFAULT_ITERATIONS = 2;

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
    
    // First copy the entire image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = getPixel(imageData, x, y);
            setPixel(output, x, y, color);
        }
    }
    
    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    selectedRegions.forEach(region => {
        if (region.length === 0) return;
        
        // Calculate bounds
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let sumX = 0, sumY = 0;
        
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
            sumX += x;
            sumY += y;
        });
        
        // Use weighted center of mass
        const centerX = sumX / region.length;
        const centerY = sumY / region.length;
        
        // Create a temporary buffer for anti-aliased rotation
        const tempBuffer = new Map();
        
        // First pass: gather all rotated positions with sub-pixel accuracy
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Clear original pixel
            setPixel(output, x, y, [0, 0, 0, 0]);
            
            const dx = x - centerX;
            const dy = y - centerY;
            
            // Calculate rotation with sub-pixel precision
            const exactX = centerX + (dx * cos - dy * sin);
            const exactY = centerY + (dx * sin + dy * cos);
            
            // Get four neighboring pixels for interpolation
            const x0 = Math.floor(exactX);
            const x1 = Math.ceil(exactX);
            const y0 = Math.floor(exactY);
            const y1 = Math.ceil(exactY);
            
            // Calculate interpolation weights
            const wx1 = exactX - x0;
            const wx0 = 1 - wx1;
            const wy1 = exactY - y0;
            const wy0 = 1 - wy1;
            
            // Get original color
            const color = getPixel(imageData, x, y);
            
            if (color[3] > 0) { // Only process non-transparent pixels
                // Distribute color to the four neighboring pixels
                [[x0, y0, wx0 * wy0],
                 [x1, y0, wx1 * wy0],
                 [x0, y1, wx0 * wy1],
                 [x1, y1, wx1 * wy1]].forEach(([px, py, weight]) => {
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const key = `${px},${py}`;
                        if (!tempBuffer.has(key)) {
                            tempBuffer.set(key, [0, 0, 0, 0]);
                        }
                        const existing = tempBuffer.get(key);
                        existing[0] += color[0] * weight;
                        existing[1] += color[1] * weight;
                        existing[2] += color[2] * weight;
                        existing[3] += color[3] * weight;
                    }
                });
            }
        });
        
        // Second pass: write interpolated pixels to output
        tempBuffer.forEach((color, key) => {
            const [x, y] = key.split(',').map(Number);
            setPixel(output, x, y, color.map(c => Math.round(c)));
        });
    });
    
    console.log(`Applied rotation: ${Math.round(angle)}° with ${selectedRegions[0]?.length || 0} pixels`);
    
    return output;
}

function calculateRegionCenter(selectedRegion, width) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let totalX = 0, totalY = 0;
    const count = selectedRegion.length;

    // Calculate bounds and average position
    selectedRegion.forEach(pixelIndex => {
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        
        totalX += x;
        totalY += y;
    });

    // Return both center points for comparison
    return {
        boundingBoxCenter: {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2
        },
        averageCenter: {
            x: totalX / count,
            y: totalY / count
        }
    };
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
        value5: iterations = 4,  // 30-degree steps
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
            const currentAngle = currentIteration * 30;
            
            // Perform rotation
            resultImageData = rotateImage(imageData, selectedRegions, currentAngle);
            
            // Update iteration counter
            if (currentIteration < iterations) {
                currentIteration++;
            }
            
            progress = currentIteration / iterations;
            
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