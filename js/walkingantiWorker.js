// // antiWalkingWorker.js
// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const antiWalkingImageData = applyAntiWalking(imageData, value);
//     self.postMessage({ imageData: antiWalkingImageData });
//   };
  
//   function applyAntiWalking(imageData, value) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
  
//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');
  
//     // Reverse the walking effect by tilting in the opposite direction and applying an inverse wave
//     const tiltAngle = -value * Math.PI / 18; // Up to -10 degrees tilt
//     const waveAmplitude = -value * 5;
//     const waveFrequency = 0.03;
  
//     tempCtx.save();
//     tempCtx.translate(imageData.width / 2, imageData.height / 2);
//     tempCtx.rotate(tiltAngle);
//     tempCtx.translate(-imageData.width / 2, -imageData.height / 2);
  
//     for (let x = 0; x < imageData.width; x++) {
//       const yOffset = Math.sin(x * waveFrequency) * waveAmplitude;
//       tempCtx.drawImage(canvas, x, 0, 1, imageData.height, x, yOffset, 1, imageData.height);
//     }
  
//     tempCtx.restore();
  
//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
//   }



// Constants
const DEFAULT_INTENSITY = 50;
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

function copyImageData(source, destination) {
    destination.data.set(source.data);
}

// Function to apply anti-walking effect to entire image
function applyAntiWalking(imageData, value) {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const tempCtx = tempCanvas.getContext('2d');
    
    // Reverse the walking effect by tilting in the opposite direction and applying an inverse wave
    const tiltAngle = -value * Math.PI / 18; // Up to -10 degrees tilt
    const waveAmplitude = -value * 5;
    const waveFrequency = 0.03;
    
    tempCtx.save();
    tempCtx.translate(imageData.width / 2, imageData.height / 2);
    tempCtx.rotate(tiltAngle);
    tempCtx.translate(-imageData.width / 2, -imageData.height / 2);
    
    for (let x = 0; x < imageData.width; x++) {
        const yOffset = Math.sin(x * waveFrequency) * waveAmplitude;
        tempCtx.drawImage(canvas, x, 0, 1, imageData.height, x, yOffset, 1, imageData.height);
    }
    
    tempCtx.restore();
    
    return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
}

// Function to apply anti-walking effect to selected regions
function applyAntiWalkingToRegions(imageData, selectedRegions, value) {
    const width = imageData.width;
    const height = imageData.height;
    const result = createTransparentImageData(width, height);
    copyImageData(imageData, result);
    
    selectedRegions.forEach(region => {
        // Find bounds of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        // Create a temporary canvas for the region
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        const regionCanvas = new OffscreenCanvas(regionWidth, regionHeight);
        const regionCtx = regionCanvas.getContext('2d');
        
        // Create a mask for the region
        const maskCanvas = new OffscreenCanvas(regionWidth, regionHeight);
        const maskCtx = maskCanvas.getContext('2d');
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, regionWidth, regionHeight);
        
        // Draw only the selected region
        const regionData = new ImageData(regionWidth, regionHeight);
        const regionSet = new Set(region);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const sourceIdx = (y * width + x) * 4;
                const targetIdx = ((y - minY) * regionWidth + (x - minX)) * 4;
                const pixelIndex = y * width + x;
                
                if (regionSet.has(pixelIndex)) {
                    for (let c = 0; c < 4; c++) {
                        regionData.data[targetIdx + c] = imageData.data[sourceIdx + c];
                    }
                    maskCtx.clearRect(x - minX, y - minY, 1, 1);
                }
            }
        }
        
        regionCtx.putImageData(regionData, 0, 0);
        
        // Apply anti-walking effect to the region
        const processedRegion = applyAntiWalking(regionData, value);
        
        // Copy the processed region back to the result
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const sourceIdx = ((y - minY) * regionWidth + (x - minX)) * 4;
                const targetIdx = (y * width + x) * 4;
                const pixelIndex = y * width + x;
                
                if (regionSet.has(pixelIndex)) {
                    for (let c = 0; c < 4; c++) {
                        result.data[targetIdx + c] = processedRegion.data[sourceIdx + c];
                    }
                }
            }
        }
    });
    
    return result;
}

// Main worker message handler
self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_INTENSITY,
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
            resultImageData = applyAntiWalkingToRegions(imageData, selectedRegions, value);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = applyAntiWalking(imageData, value);
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