// self.onmessage = function(e) {
//     const { imageData, value } = e.data;
//     const rotatedImageData = rotateImage(imageData, -value, 'topLeft');
//     self.postMessage({ imageData: rotatedImageData });
// };

// function rotateImage(imageData, angle, corner) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');

//     tempCtx.translate(0, 0);
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(0, 0);

//     tempCtx.drawImage(canvas, 0, 0);

//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }



// const DEFAULT_ROTATION_ANGLE = 45;
// const DEFAULT_ITERATIONS = 120;
// const DEFAULT_ROTATION_STEP = 2;

// let currentIteration = 0;

// function createTransparentImageData(width, height) {
//     return new ImageData(
//         new Uint8ClampedArray(width * height * 4),
//         width,
//         height
//     );
// }

// function rotateImageWithCanvas(imageData, angle, centerX, centerY) {
//     const canvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);

//     const tempCanvas = new OffscreenCanvas(imageData.width, imageData.height);
//     const tempCtx = tempCanvas.getContext('2d');
    
//     // Clear the temporary canvas
//     tempCtx.clearRect(0, 0, imageData.width, imageData.height);
    
//     // Translate to rotation center, rotate, then translate back
//     tempCtx.translate(centerX, centerY);
//     tempCtx.rotate(angle * Math.PI / 180);
//     tempCtx.translate(-centerX, -centerY);
    
//     tempCtx.drawImage(canvas, 0, 0);
    
//     return tempCtx.getImageData(0, 0, imageData.width, imageData.height);
// }

// // Function to rotate selected regions using canvas
// function rotateSelectedRegions(imageData, selectedRegions, maxRotationAngle, centerX, centerY) {
//     const width = imageData.width;
//     const height = imageData.height;
    
//     // Create mask for selected regions
//     const maskCanvas = new OffscreenCanvas(width, height);
//     const maskCtx = maskCanvas.getContext('2d');
//     const maskImageData = maskCtx.createImageData(width, height);
    
//     // Fill mask with selected regions
//     selectedRegions.forEach(region => {
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             maskImageData.data[baseIndex + 3] = 255; // Set alpha to fully opaque
//         });
//     });
    
//     maskCtx.putImageData(maskImageData, 0, 0);
    
//     // Create canvas for original image
//     const canvas = new OffscreenCanvas(width, height);
//     const ctx = canvas.getContext('2d');
//     ctx.putImageData(imageData, 0, 0);
    
//     // Create canvas for result
//     const resultCanvas = new OffscreenCanvas(width, height);
//     const resultCtx = resultCanvas.getContext('2d');
    
//     selectedRegions.forEach(region => {
//         // Create temporary canvas for this region
//         const tempCanvas = new OffscreenCanvas(width, height);
//         const tempCtx = tempCanvas.getContext('2d');
        
//         // Clear temp canvas
//         tempCtx.clearRect(0, 0, width, height);
        
//         // Draw only this region using the mask as a clip
//         tempCtx.save();
//         const regionPath = new Path2D();
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
//             if (region.indexOf(pixelIndex) === 0) {
//                 regionPath.moveTo(x, y);
//             } else {
//                 regionPath.lineTo(x, y);
//             }
//         });
//         regionPath.closePath();
//         tempCtx.clip(regionPath);
//         tempCtx.drawImage(canvas, 0, 0);
//         tempCtx.restore();
        
//         // Rotate this region
//         const rotationAngle = Math.random() * maxRotationAngle;
//         const rotatedRegion = rotateImageWithCanvas(
//             tempCtx.getImageData(0, 0, width, height),
//             rotationAngle,
//             centerX,
//             centerY
//         );
        
//         // Draw rotated region onto result
//         resultCtx.putImageData(rotatedRegion, 0, 0);
//     });
    
//     return resultCtx.getImageData(0, 0, width, height);
// }

// self.onmessage = function(e) {
//     const { 
//         imageData, 
//         selectedRegions, 
//         value, 
//         value2: maxRotationAngle = DEFAULT_ROTATION_ANGLE,
//         value5: iterations = DEFAULT_ITERATIONS,
//         reset 
//     } = e.data;
    
//     try {
//         // Reset counter if requested
//         if (reset) {
//             currentIteration = 0;
//         }
        
//         let resultImageData;
//         let progress;
        
//         // Handle different modes based on whether regions are selected
//         if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
//             // For upper left rotation
//             resultImageData = rotateSelectedRegions(
//                 imageData, 
//                 selectedRegions, 
//                 maxRotationAngle,
//                 0, // centerX - upper left
//                 0  // centerY - upper left
//             );
//             currentIteration = (currentIteration + 1) % iterations;
//             progress = currentIteration / iterations;
//         } else {
//             // Full image mode
//             const totalRotation = DEFAULT_ROTATION_STEP * (currentIteration + 1);
//             resultImageData = rotateImageWithCanvas(
//                 imageData,
//                 totalRotation,
//                 0, // centerX - upper left
//                 0  // centerY - upper left
//             );
//             currentIteration++;
//             progress = undefined;
//         }
        
//         self.postMessage({
//             segmentedImages: [resultImageData],
//             isComplete: true,
//             iteration: currentIteration,
//             progress
//         });
//     } catch (error) {
//         self.postMessage({
//             error: error.message,
//             isComplete: true
//         });
//     }
// };

// Constants
const DEFAULT_ANGLE = 30;
const DEFAULT_ITERATIONS = 12;

let currentIteration = 0;

function createTransparentImageData(width, height) {
    return new ImageData(
        new Uint8ClampedArray(width * height * 4),
        width,
        height
    );
}

function rotateSelectedRegions(imageData, selectedRegions, angle) {
    const width = imageData.width;
    const height = imageData.height;
    const resultImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );

    selectedRegions.forEach(region => {
        if (!region || region.length === 0) return;

        // Create a map of selected pixels for quick lookup
        const selectedPixels = new Set(region);
        
        // Rotation center is top-left corner (0, 0)
        const centerX = 0;
        const centerY = 0;

        // Create temporary buffer for rotated pixels
        const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
        // Clear the original region in the result
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let i = 0; i < 4; i++) {
                resultImageData.data[baseIndex + i] = 0;
            }
        });

        // Rotate each pixel in the region
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = angle * Math.PI / 180;
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            // New coordinates after rotation
            const newX = Math.round(centerX + (dx * cos - dy * sin));
            const newY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                const sourceIndex = pixelIndex * 4;
                const targetIndex = (newY * width + newX) * 4;
                
                // Copy pixel data to temporary buffer
                for (let i = 0; i < 4; i++) {
                    tempBuffer[targetIndex + i] = imageData.data[sourceIndex + i];
                }
            }
        });

        // Copy only the rotated pixels that belong to the original shape
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate rotation to find source pixel
            const dx = x - centerX;
            const dy = y - centerY;
            const angleRad = -angle * Math.PI / 180; // Inverse rotation to find source
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            
            const sourceX = Math.round(centerX + (dx * cos - dy * sin));
            const sourceY = Math.round(centerY + (dx * sin + dy * cos));
            
            if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
                const sourceIndex = (sourceY * width + sourceX) * 4;
                const targetIndex = pixelIndex * 4;
                
                // Only copy if source pixel had data
                if (tempBuffer[sourceIndex + 3] > 0) {
                    for (let i = 0; i < 4; i++) {
                        resultImageData.data[targetIndex + i] = tempBuffer[sourceIndex + i];
                    }
                }
            }
        });
    });
    
    return resultImageData;
}

self.onmessage = function(e) {
    const { 
        imageData, 
        selectedRegions, 
        value: angle = DEFAULT_ANGLE,
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
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            // Selected regions mode
            resultImageData = rotateSelectedRegions(imageData, selectedRegions, angle);
            currentIteration = (currentIteration + 1) % iterations;
            progress = currentIteration / iterations;
        } else {
            // Full image mode
            resultImageData = new ImageData(
                new Uint8ClampedArray(imageData.data),
                imageData.width,
                imageData.height
            );
            const totalRotation = angle * (currentIteration + 1);
            resultImageData = rotateSelectedRegions(imageData, [[...Array(imageData.width * imageData.height).keys()]], totalRotation);
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