// function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const newImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         width,
//         height
//     );
    
//     // Animation parameters
//     const squeezeAmount = 0.7; // How much to squeeze (0 = complete squeeze, 1 = no squeeze)
//     const squeezeSpeed = 2; // Speed of the squeeze animation
//     const currentTime = (performance.now() % 2000) / 2000; // Normalize time to 0-1
    
//     selectedRegions.forEach(region => {
//         // Find boundaries of the region
//         let minX = width, minY = height, maxX = 0, maxY = 0;
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             minX = Math.min(minX, x);
//             minY = Math.min(minY, y);
//             maxX = Math.max(maxX, x);
//             maxY = Math.max(maxY, y);
//         });
        
//         const centerX = Math.floor((minX + maxX) / 2);
//         const regionWidth = maxX - minX + 1;
        
//         // Calculate squeeze factor based on time
//         const squeezeFactor = calculateSqueezeFactor(currentTime);
        
//         // Create buffer for transformed pixels
//         const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
//         // Transform and copy pixels with squeeze
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
            
//             // Calculate position relative to center
//             const relativeX = x - centerX;
            
//             // Apply squeeze transformation
//             const newX = centerX + (relativeX * squeezeFactor);
            
//             if (newX >= 0 && newX < width) {
//                 const sourceIdx = (y * width + x) * 4;
//                 const targetIdx = (y * width + Math.floor(newX)) * 4;
                
//                 // Apply smooth interpolation
//                 const fx = newX - Math.floor(newX);
//                 const w1 = 1 - fx;
//                 const w2 = fx;
                
//                 for (let c = 0; c < 4; c++) {
//                     tempBuffer[targetIdx + c] = imageData.data[sourceIdx + c] * w1;
//                     if (fx > 0 && Math.floor(newX) < width - 1) {
//                         tempBuffer[targetIdx + 4 + c] += imageData.data[sourceIdx + c] * w2;
//                     }
//                 }
//             }
//         });
        
//         // Clear original region
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             for (let c = 0; c < 4; c++) {
//                 newImageData.data[baseIndex + c] = 0;
//             }
//         });
        
//         // Copy transformed pixels to output
//         for (let i = 0; i < tempBuffer.length; i += 4) {
//             if (tempBuffer[i + 3] > 0) {
//                 for (let c = 0; c < 4; c++) {
//                     newImageData.data[i + c] = tempBuffer[i + c];
//                 }
//             }
//         }
//     });
    
//     return newImageData;
// }

// // Function to calculate squeeze factor based on time
// function calculateSqueezeFactor(time) {
//     // Create a smooth oscillation between 1 and squeezeAmount
//     const squeezeAmount = 0.7; // Minimum scale (maximum squeeze)
//     const t = (Math.sin(time * Math.PI * 2) + 1) / 2; // Oscillate between 0 and 1
//     return squeezeAmount + (1 - squeezeAmount) * t;
// }

// self.onmessage = function(e) {
//     const { imageData, selectedRegions, value, value2 } = e.data;
    
//     try {
//         const scaleX = value || 1;
//         const scaleY = value2 || value || 1;
        
//         let resultImageData;
        
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
//         } else {
//             resultImageData = scaleImageData(imageData, scaleX, scaleY);
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// function scaleImageData(imageData, scaleX, scaleY) {
//     const width = imageData.width;
//     const height = imageData.height;
//     const destWidth = Math.floor(width * scaleX);
//     const destHeight = Math.floor(height * scaleY);
    
//     const scaledImageData = new ImageData(
//         new Uint8ClampedArray(destWidth * destHeight * 4),
//         destWidth,
//         destHeight
//     );
    
//     for (let y = 0; y < destHeight; y++) {
//         for (let x = 0; x < destWidth; x++) {
//             const srcX = Math.min(Math.floor(x / scaleX), width - 1);
//             const srcY = Math.min(Math.floor(y / scaleY), height - 1);
            
//             const destIdx = (y * destWidth + x) * 4;
//             const srcIdx = (srcY * width + srcX) * 4;
            
//             scaledImageData.data[destIdx] = imageData.data[srcIdx];
//             scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
//             scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
//             scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
//         }
//     }

//     return scaledImageData;
// }

// Constants
const DEFAULT_SQUEEZE_VALUE = 0.5;
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

// Function to apply directional squeeze effect
function applySqueezeEffect(imageData, selectedRegions, squeezeValue, axis = 'x') {
    // Create main canvas
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    
    // Create result canvas
    const resultCanvas = new OffscreenCanvas(imageData.width, imageData.height);
    const resultCtx = resultCanvas.getContext('2d');
    
    // First, copy the original image data
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
    
    // Calculate squeeze factor
    const squeezeFactor = 1 / (1 + (squeezeValue - 0.5));
    
    if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
        selectedRegions.forEach(region => {
            // Find bounds of the region
            let minX = imageData.width, maxX = 0;
            let minY = imageData.height, maxY = 0;
            
            region.forEach(pixelIndex => {
                const x = pixelIndex % imageData.width;
                const y = Math.floor(pixelIndex / imageData.width);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            });
            
            // Create a region mask
            const regionPixels = new Set(region);
            
            // Create temporary canvas for the squeezed content
            const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
            const tempCtx = tempCanvas.getContext('2d', { alpha: true });
            tempCtx.clearRect(0, 0, imageData.width, imageData.height);
            
            // Draw only the selected region to temp canvas
            const tempImageData = tempCtx.createImageData(imageData.width, imageData.height);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const pixelIndex = y * imageData.width + x;
                    if (regionPixels.has(pixelIndex)) {
                        const i = pixelIndex * 4;
                        for (let c = 0; c < 4; c++) {
                            tempImageData.data[i + c] = imageData.data[i + c];
                        }
                    }
                }
            }
            tempCtx.putImageData(tempImageData, 0, 0);
            
            // Clear the region in the result
            for (const pixelIndex of region) {
                const i = pixelIndex * 4;
                for (let c = 0; c < 4; c++) {
                    resultImageData.data[i + c] = 0;
                }
            }
            
            // Apply squeeze effect based on direction
            resultCtx.clearRect(0, 0, imageData.width, imageData.height);
            resultCtx.putImageData(resultImageData, 0, 0);
            
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const width = maxX - minX + 1;
            const height = maxY - minY + 1;
            
            switch(axis) {
                case 'x':
                    // Horizontal squeeze
                    const newWidth = width * squeezeFactor;
                    resultCtx.drawImage(tempCanvas, minX, minY, width, height,
                        minX + (width - newWidth) / 2, minY, newWidth, height);
                    break;
                    
                case 'y':
                    // Vertical squeeze
                    const newHeight = height * squeezeFactor;
                    resultCtx.drawImage(tempCanvas, minX, minY, width, height,
                        minX, minY + (height - newHeight) / 2, width, newHeight);
                    break;
                    
                case 'diagonal1':
                    // Diagonal squeeze (top-left to bottom-right)
                    resultCtx.save();
                    resultCtx.translate(centerX, centerY);
                    resultCtx.rotate(Math.PI / 4);
                    resultCtx.scale(squeezeFactor, 1);
                    resultCtx.rotate(-Math.PI / 4);
                    resultCtx.translate(-centerX, -centerY);
                    resultCtx.drawImage(tempCanvas, 0, 0);
                    resultCtx.restore();
                    break;
                    
                case 'diagonal2':
                    // Diagonal squeeze (top-right to bottom-left)
                    resultCtx.save();
                    resultCtx.translate(centerX, centerY);
                    resultCtx.rotate(-Math.PI / 4);
                    resultCtx.scale(squeezeFactor, 1);
                    resultCtx.rotate(Math.PI / 4);
                    resultCtx.translate(-centerX, -centerY);
                    resultCtx.drawImage(tempCanvas, 0, 0);
                    resultCtx.restore();
                    break;
                    
                case 'inward':
                    // Inward squeeze (from edges to center)
                    resultCtx.save();
                    resultCtx.translate(centerX, centerY);
                    resultCtx.scale(squeezeFactor, squeezeFactor);
                    resultCtx.translate(-centerX, -centerY);
                    resultCtx.drawImage(tempCanvas, 0, 0);
                    resultCtx.restore();
                    break;
                    
                case 'circular':
                    // Circular squeeze
                    const radius = Math.min(width, height) / 2;
                    resultCtx.save();
                    resultCtx.translate(centerX, centerY);
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                        resultCtx.rotate(angle);
                        resultCtx.scale(1, squeezeFactor);
                        resultCtx.rotate(-angle);
                    }
                    resultCtx.translate(-centerX, -centerY);
                    resultCtx.drawImage(tempCanvas, 0, 0);
                    resultCtx.restore();
                    break;
            }
            
            // Update result image data
            const newRegionData = resultCtx.getImageData(0, 0, imageData.width, imageData.height);
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const i = (y * imageData.width + x) * 4;
                    if (newRegionData.data[i + 3] > 0) {
                        for (let c = 0; c < 4; c++) {
                            resultImageData.data[i + c] = newRegionData.data[i + c];
                        }
                    }
                }
            }
        });
    }
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value = DEFAULT_SQUEEZE_VALUE,
        value5: iterations = DEFAULT_ITERATIONS,
        axis = 'x',
        reset 
    } = e.data;
    
    try {
        if (reset) {
            currentIteration = 0;
        }
        
        const resultImageData = applySqueezeEffect(imageData, selectedRegions, value, axis);
        currentIteration = (currentIteration + 1) % iterations;
        const progress = currentIteration / iterations;
        
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