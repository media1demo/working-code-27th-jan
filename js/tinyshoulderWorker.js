// Placeholder for tinyshoulderWorker.js

// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const width = imageData.width;
//     const height = imageData.height;

//     const newImageData = new ImageData(width, height);

//     // Unpack the input value (assuming it's a single number between 0 and 1)
//     const t = value;

//     // Animation parameters
//     const cycleLength = 6; // Number of frames in the twist cycle
//     const phase = (t * cycleLength) % 1; // Current phase of the twist cycle
//     const twistAmplitude = 0.15; // Amplitude of the twist effect
//     const twistAngle = twistAmplitude * Math.sin(phase * Math.PI * 2); // Twist angle based on the phase

//     for (let y = 0; y < height; y++) {
//         for (let x = 0; x < width; x++) {
//             // Normalize coordinates
//             let nx = (x / width) - 0.5;
//             let ny = (y / height) - 0.5;

//             // Apply twist effect
//             let radius = Math.sqrt(nx * nx + ny * ny);
//             let angle = Math.atan2(ny, nx) + twistAngle * radius;
//             nx = radius * Math.cos(angle);
//             ny = radius * Math.sin(angle);

//             // Convert back to pixel coordinates
//             let sourceX = (nx + 0.5) * width;
//             let sourceY = (ny + 0.5) * height;

//             // Ensure sourceX and sourceY are within bounds
//             sourceX = Math.max(0, Math.min(width - 1, sourceX));
//             sourceY = Math.max(0, Math.min(height - 1, sourceY));

//             const sourceIndex = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
//             const targetIndex = (y * width + x) * 4;

//             // Copy pixel data
//             for (let i = 0; i < 4; i++) {
//                 newImageData.data[targetIndex + i] = imageData.data[sourceIndex + i];
//             }
//         }
//     }

//     self.postMessage({ imageData: newImageData });
// };


const DEFAULT_CYCLE_LENGTH = 6;
const DEFAULT_TWIST_AMPLITUDE = 0.15;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    const buffer = new Uint8ClampedArray(width * height * 4);
    buffer.fill(0);
    return new ImageData(buffer, width, height);
}

function getBounds(region, width) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    for (let i = 0; i < region.length; i++) {
        const x = region[i] % width;
        const y = Math.floor(region[i] / width);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    
    return { minX, maxX, minY, maxY };
}

function applyTwistEffect(imageData, selectedRegions, t) {
    const { width, height } = imageData;
    const newImageData = createTransparentImageData(width, height);
    
    // Animation parameters
    const cycleLength = DEFAULT_CYCLE_LENGTH;
    const phase = (t * cycleLength) % 1;
    const twistAmplitude = DEFAULT_TWIST_AMPLITUDE;
    const twistAngle = twistAmplitude * Math.sin(phase * Math.PI * 2);
    
    // Copy original image data
    newImageData.data.set(imageData.data);
    
    // Process each region iteratively
    for (let regionIndex = 0; regionIndex < selectedRegions.length; regionIndex++) {
        const region = selectedRegions[regionIndex];
        const regionSet = new Set(region);
        
        // Get bounds for current region
        const { minX, maxX, minY, maxY } = getBounds(region, width);
        
        // Calculate expanded bounds to allow for twist
        const maxRadius = Math.sqrt(
            Math.pow(Math.max(Math.abs(minX - width/2), Math.abs(maxX - width/2)), 2) +
            Math.pow(Math.max(Math.abs(minY - height/2), Math.abs(maxY - height/2)), 2)
        );
        const padding = Math.ceil(maxRadius * twistAmplitude);
        
        const expandedMinX = Math.max(0, minX - padding);
        const expandedMaxX = Math.min(width - 1, maxX + padding);
        const expandedMinY = Math.max(0, minY - padding);
        const expandedMaxY = Math.min(height - 1, maxY + padding);
        
        // Clear the original region in the destination
        for (let i = 0; i < region.length; i++) {
            const baseIndex = region[i] * 4;
            newImageData.data[baseIndex] = 0;
            newImageData.data[baseIndex + 1] = 0;
            newImageData.data[baseIndex + 2] = 0;
            newImageData.data[baseIndex + 3] = 0;
        }
        
        // Process expanded area for twist effect
        for (let y = expandedMinY; y <= expandedMaxY; y++) {
            for (let x = expandedMinX; x <= expandedMaxX; x++) {
                // Convert to normalized space (-0.5 to 0.5)
                let nx = (x / width) - 0.5;
                let ny = (y / height) - 0.5;
                
                // Calculate polar coordinates
                let radius = Math.sqrt(nx * nx + ny * ny);
                let angle = Math.atan2(ny, nx);
                
                // Apply inverse twist transformation
                angle -= twistAngle * radius;
                
                // Convert back to Cartesian coordinates
                nx = radius * Math.cos(angle);
                ny = radius * Math.sin(angle);
                
                // Convert back to pixel coordinates
                let sourceX = (nx + 0.5) * width;
                let sourceY = (ny + 0.5) * height;
                
                // Check if the source pixel is in bounds
                if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                    const sourcePixelX = Math.floor(sourceX);
                    const sourcePixelY = Math.floor(sourceY);
                    const sourceIndex = sourcePixelY * width + sourcePixelX;
                    
                    // Only copy if source pixel was in the original region
                    if (regionSet.has(sourceIndex)) {
                        const targetIndex = (y * width + x) * 4;
                        const sourceDataIndex = sourceIndex * 4;
                        
                        // Copy pixel data
                        newImageData.data[targetIndex] = imageData.data[sourceDataIndex];
                        newImageData.data[targetIndex + 1] = imageData.data[sourceDataIndex + 1];
                        newImageData.data[targetIndex + 2] = imageData.data[sourceDataIndex + 2];
                        newImageData.data[targetIndex + 3] = imageData.data[sourceDataIndex + 3];
                    }
                }
            }
        }
    }
    
    return newImageData;
}

self.onmessage = function(e) {
    try {
        const { 
            imageData,
            selectedRegions,
            value,
            reset,
            twistAmplitude = DEFAULT_TWIST_AMPLITUDE,
            cycleLength = DEFAULT_CYCLE_LENGTH
        } = e.data;
        
        if (reset) {
            currentIteration = 0;
        }
        
        let resultImageData;
        let progress;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = applyTwistEffect(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % cycleLength;
            progress = currentIteration / cycleLength;
        } else {
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            progress = 1;
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true,
            iteration: currentIteration,
            progress
        }, [resultImageData.data.buffer]);
        
    } catch (error) {
        self.postMessage({
            error: `Animation error: ${error.message}`,
            isComplete: true,
            stack: error.stack
        });
    }
};