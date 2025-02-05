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

// function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
//     const width = imageData.width;
//     const height = imageData.height;
    
//     const newImageData = new ImageData(
//         new Uint8ClampedArray(imageData.data),
//         width,
//         height
//     );
    
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
//         const centerY = Math.floor((minY + maxY) / 2);
        
//         // Calculate region dimensions
//         const regionWidth = maxX - minX;
//         const regionHeight = maxY - minY;
        
//         // Create temporary buffer for scaled region
//         const tempBuffer = new Uint8ClampedArray(width * height * 4);
        
//         // Clear selected region in the destination
//         region.forEach(pixelIndex => {
//             const baseIndex = pixelIndex * 4;
//             for (let c = 0; c < 4; c++) {
//                 newImageData.data[baseIndex + c] = 0;
//             }
//         });
        
//         // Calculate actual scale factors
//         // Start from 1.0 (original size) and scale up to 3.0
//         const effectiveScaleX = 1.0 + (scaleX * 2.0); // Maps 0-1 input to 1-3 range
//         const effectiveScaleY = 1.0 + (scaleY * 2.0);
        
//         // Scale selected pixels relative to center
//         region.forEach(pixelIndex => {
//             const x = pixelIndex % width;
//             const y = Math.floor(pixelIndex / width);
            
//             // Calculate position relative to center
//             const relX = x - centerX;
//             const relY = y - centerY;
            
//             // Apply scaling relative to center using effective scale
//             const newX = Math.min(Math.max(Math.round(centerX + (relX * effectiveScaleX)), 0), width - 1);
//             const newY = Math.min(Math.max(Math.round(centerY + (relY * effectiveScaleY)), 0), height - 1);
            
//             if (newY >= 0 && newY < height && newX >= 0 && newX < width) {
//                 const sourceIndex = (y * width + x) * 4;
//                 const targetIndex = (newY * width + newX) * 4;
                
//                 for (let c = 0; c < 4; c++) {
//                     tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
//                 }
//             }
//         });
        
//         // Blend scaled pixels back
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


function scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    
    const newImageData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        width,
        height
    );
    
    selectedRegions.forEach(region => {
        // Find boundaries of the region
        let minX = width, minY = height, maxX = 0, maxY = 0;
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
        
        const centerX = Math.floor((minX + maxX) / 2);
        const centerY = Math.floor((minY + maxY) / 2);
        
        // Calculate region dimensions
        const regionWidth = maxX - minX + 1;
        const regionHeight = maxY - minY + 1;
        
        // Create temporary buffer
        const tempBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // First, scale down to region size
        region.forEach(pixelIndex => {
            const x = pixelIndex % width;
            const y = Math.floor(pixelIndex / width);
            
            // Calculate normalized position within region
            const normalizedX = (x - minX) / regionWidth;
            const normalizedY = (y - minY) / regionHeight;
            
            // Map to region boundaries
            const initialX = Math.round(minX + (normalizedX * regionWidth));
            const initialY = Math.round(minY + (normalizedY * regionHeight));
            
            if (initialY >= 0 && initialY < height && initialX >= 0 && initialX < width) {
                const sourceIndex = (y * width + x) * 4;
                const targetIndex = (initialY * width + initialX) * 4;
                
                for (let c = 0; c < 4; c++) {
                    tempBuffer[targetIndex + c] = imageData.data[sourceIndex + c];
                }
            }
        });
        
        // Calculate scale factors (1.0 to 3.0 range)
        const effectiveScaleX = 1.0 + (scaleX * 2.0);
        const effectiveScaleY = 1.0 + (scaleY * 2.0);
        
        // Create final buffer for scaled result
        const finalBuffer = new Uint8ClampedArray(width * height * 4).fill(0);
        
        // Now scale up from region size
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const sourceIndex = (y * width + x) * 4;
                
                // Skip if source pixel is empty
                if (tempBuffer[sourceIndex + 3] === 0) continue;
                
                // Calculate position relative to center for scaling
                const relX = x - centerX;
                const relY = y - centerY;
                
                // Apply scaling relative to center
                const newX = Math.min(Math.max(Math.round(centerX + (relX * effectiveScaleX)), 0), width - 1);
                const newY = Math.min(Math.max(Math.round(centerY + (relY * effectiveScaleY)), 0), height - 1);
                
                const targetIndex = (newY * width + newX) * 4;
                
                // Copy pixel data
                for (let c = 0; c < 4; c++) {
                    finalBuffer[targetIndex + c] = tempBuffer[sourceIndex + c];
                }
            }
        }
        
        // Clear original region in destination
        region.forEach(pixelIndex => {
            const baseIndex = pixelIndex * 4;
            for (let c = 0; c < 4; c++) {
                newImageData.data[baseIndex + c] = 0;
            }
        });
        
        // Blend final scaled pixels back
        for (let i = 0; i < finalBuffer.length; i += 4) {
            if (finalBuffer[i + 3] > 0) {
                for (let c = 0; c < 4; c++) {
                    newImageData.data[i + c] = finalBuffer[i + c];
                }
            }
        }
    });
    
    return newImageData;
}

self.onmessage = function(e) {
    const { imageData, selectedRegions, value, value2 } = e.data;
    
    try {
        const scaleX = value || 1;
        const scaleY = value2 || value || 1;
        
        let resultImageData;
        
        if (selectedRegions?.length > 0 && selectedRegions[0]?.length > 0) {
            resultImageData = scaleSelectedRegions(imageData, selectedRegions, scaleX, scaleY);
        } else {
            resultImageData = scaleImageData(imageData, scaleX, scaleY);
        }
        
        self.postMessage({
            segmentedImages: [resultImageData],
            isComplete: true
        });
    } catch (error) {
        self.postMessage({
            error: error.message,
            isComplete: true
        });
    }
};

function scaleImageData(imageData, scaleX, scaleY) {
    const width = imageData.width;
    const height = imageData.height;
    const destWidth = Math.floor(width * scaleX);
    const destHeight = Math.floor(height * scaleY);
    
    const scaledImageData = new ImageData(
        new Uint8ClampedArray(destWidth * destHeight * 4),
        destWidth,
        destHeight
    );
    
    for (let y = 0; y < destHeight; y++) {
        for (let x = 0; x < destWidth; x++) {
            const srcX = Math.min(Math.floor(x / scaleX), width - 1);
            const srcY = Math.min(Math.floor(y / scaleY), height - 1);
            
            const destIdx = (y * destWidth + x) * 4;
            const srcIdx = (srcY * width + srcX) * 4;
            
            scaledImageData.data[destIdx] = imageData.data[srcIdx];
            scaledImageData.data[destIdx + 1] = imageData.data[srcIdx + 1];
            scaledImageData.data[destIdx + 2] = imageData.data[srcIdx + 2];
            scaledImageData.data[destIdx + 3] = imageData.data[srcIdx + 3];
        }
    }

    return scaledImageData;
}